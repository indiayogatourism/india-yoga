'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface UserInfo {
  id?: string
  name: string
  email: string
  phone?: string
  country?: string
}

interface PaymentRecord {
  id: string
  source: 'booking_payment' | 'booking_pending' | 'online_enrolment'
  bookingId?: string
  enrolmentId?: string
  transactionRef: string
  category: 'PROGRAMME' | 'RETREAT' | 'ONLINE_CLASS' | 'TEACHER_TRAINING' | 'TREK' | string
  categoryLabel: string
  itemTitle: string
  itemId?: string
  itemSlug?: string
  user: UserInfo
  amount: number
  currency: string
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | string
  paymentMethod: string
  razorpayPaymentId?: string
  paypalPaymentId?: string
  createdAt: string
  paidAt?: string
  voucherUrl?: string
  receiptUrl?: string
  adminNote?: string
}

interface PaymentStats {
  totalRevenue: number
  onlineClassesRevenue: number
  programmeRevenue: number
  paidCount: number
  pendingCount: number
  failedCount: number
  totalCount: number
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    onlineClassesRevenue: 0,
    programmeRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalCount: 0,
  })

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Selected Record for Detail Drawer / Modal
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
  
  // Status Edit Modal State
  const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(null)
  const [statusInput, setStatusInput] = useState<string>('PAID')
  const [methodInput, setMethodInput] = useState<string>('razorpay')
  const [adminNoteInput, setAdminNoteInput] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  // Fetch Payments Data
  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/payments')
      const data = await res.json()
      if (data.success) {
        setRecords(data.records || [])
        setStats(data.stats || {
          totalRevenue: 0,
          onlineClassesRevenue: 0,
          programmeRevenue: 0,
          paidCount: 0,
          pendingCount: 0,
          failedCount: 0,
          totalCount: 0,
        })
      }
    } catch (err) {
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Text search
      const q = searchQuery.toLowerCase().trim()
      if (q) {
        const matchName = rec.user.name?.toLowerCase().includes(q)
        const matchEmail = rec.user.email?.toLowerCase().includes(q)
        const matchRef = rec.transactionRef?.toLowerCase().includes(q)
        const matchTitle = rec.itemTitle?.toLowerCase().includes(q)
        const matchRazorpay = rec.razorpayPaymentId?.toLowerCase().includes(q)
        const matchPaypal = rec.paypalPaymentId?.toLowerCase().includes(q)
        const matchPhone = rec.user.phone && rec.user.phone.includes(q)

        if (!matchName && !matchEmail && !matchRef && !matchTitle && !matchRazorpay && !matchPaypal && !matchPhone) {
          return false
        }
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'ONLINE_CLASS' && rec.category !== 'ONLINE_CLASS') return false
        if (categoryFilter === 'PROGRAMME_RETREAT' && rec.category === 'ONLINE_CLASS') return false
        if (categoryFilter === 'RETREAT' && rec.category !== 'RETREAT') return false
        if (categoryFilter === 'PROGRAMME' && rec.category !== 'PROGRAMME') return false
        if (categoryFilter === 'TEACHER_TRAINING' && rec.category !== 'TEACHER_TRAINING') return false
      }

      // 3. Status Filter
      if (statusFilter !== 'all' && rec.status !== statusFilter) {
        return false
      }

      // 4. Payment Method Filter
      if (methodFilter !== 'all') {
        const m = rec.paymentMethod?.toLowerCase() || ''
        if (methodFilter === 'razorpay' && !m.includes('razorpay')) return false
        if (methodFilter === 'paypal' && !m.includes('paypal')) return false
        if (methodFilter === 'manual' && !m.includes('manual') && !m.includes('bank')) return false
      }

      // 5. Date Filter
      if (dateFilter !== 'all') {
        const recDate = new Date(rec.createdAt).getTime()
        const now = Date.now()
        const dayMs = 24 * 60 * 60 * 1000

        if (dateFilter === 'today' && now - recDate > dayMs) return false
        if (dateFilter === '7days' && now - recDate > 7 * dayMs) return false
        if (dateFilter === '30days' && now - recDate > 30 * dayMs) return false
      }

      return true
    })
  }, [records, searchQuery, categoryFilter, statusFilter, methodFilter, dateFilter])

  // Calculated Stats for Filtered Data
  const filteredRevenue = useMemo(() => {
    return filteredRecords
      .filter((r) => r.status === 'PAID')
      .reduce((sum, r) => sum + (r.amount || 0), 0)
  }, [filteredRecords])

  // Handle Status & Payment Update Submit
  const handleSavePaymentStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return
    setUpdating(true)

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRecord.id,
          source: editingRecord.source,
          bookingId: editingRecord.bookingId,
          enrolmentId: editingRecord.enrolmentId,
          status: statusInput,
          paymentMethod: methodInput,
          adminNote: adminNoteInput,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setEditingRecord(null)
        if (selectedRecord && selectedRecord.id === editingRecord.id) {
          setSelectedRecord({
            ...selectedRecord,
            status: statusInput,
            paymentMethod: methodInput,
            adminNote: adminNoteInput,
          })
        }
        fetchPayments()
      } else {
        alert(data.error || 'Failed to update payment')
      }
    } catch (err) {
      console.error('Error saving payment status:', err)
      alert('An error occurred while updating payment status.')
    } finally {
      setUpdating(false)
    }
  }

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No payment records to export.')
      return
    }

    const headers = [
      'Transaction Ref',
      'Category',
      'Item Title',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Country',
      'Amount (USD)',
      'Status',
      'Payment Method',
      'Razorpay ID',
      'PayPal ID',
      'Created Date',
      'Paid Date',
    ]

    const rows = filteredRecords.map((r) => [
      `"${r.transactionRef || ''}"`,
      `"${r.categoryLabel || ''}"`,
      `"${r.itemTitle?.replace(/"/g, '""') || ''}"`,
      `"${r.user.name?.replace(/"/g, '""') || ''}"`,
      `"${r.user.email || ''}"`,
      `"${r.user.phone || ''}"`,
      `"${r.user.country || ''}"`,
      r.amount || 0,
      `"${r.status || ''}"`,
      `"${r.paymentMethod || ''}"`,
      `"${r.razorpayPaymentId || ''}"`,
      `"${r.paypalPaymentId || ''}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      `"${r.paidAt ? new Date(r.paidAt).toLocaleString() : ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `india_yoga_payments_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#1C2E26]">account_balance_wallet</span>
            <h2 className="text-2xl font-bold text-[#1C2E26]">Payments &amp; Financial Ledger</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete, centralized record of user payments for both Online Classes and Programmes &amp; Retreats.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchPayments}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh payment records"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C2E26]">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span>
            Combined paid receipts
          </p>
        </div>

        {/* Card 2: Online Classes Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Online Classes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">videocam</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C2E26]">${stats.onlineClassesRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-purple-700 font-medium">
            Live stream &amp; student enrolment passes
          </p>
        </div>

        {/* Card 3: Programmes & Retreats Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Programmes &amp; Retreats</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">spa</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C2E26]">${stats.programmeRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-amber-800 font-medium">
            Ashram retreats &amp; teacher trainings
          </p>
        </div>

        {/* Card 4: Transaction Status Counts */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">receipt_long</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-[#1C2E26]">{records.length}</p>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">{stats.paidCount} Paid</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">{stats.pendingCount} Pending</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Showing {filteredRecords.length} filtered (${filteredRevenue.toLocaleString()} volume)
          </p>
        </div>
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, email, booking ref, transaction ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white font-medium text-gray-700"
            >
              <option value="all">All Product Categories</option>
              <option value="PROGRAMME_RETREAT">Programmes &amp; Retreats</option>
              <option value="ONLINE_CLASS">Online Classes</option>
              <option value="RETREAT">Retreats Only</option>
              <option value="PROGRAMME">Programmes Only</option>
              <option value="TEACHER_TRAINING">Teacher Training</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white font-medium text-gray-700"
            >
              <option value="all">All Payment Statuses</option>
              <option value="PAID">Paid / Completed</option>
              <option value="PENDING">Pending Payment</option>
              <option value="FAILED">Failed / Refunded</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white font-medium text-gray-700"
            >
              <option value="all">All Gateways &amp; Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="paypal">PayPal</option>
              <option value="manual">Manual / Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Quick Date Filter Chips & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date Window:</span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Last 24h' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === d.id
                    ? 'bg-[#1C2E26] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCategoryFilter('all')
                setStatusFilter('all')
                setMethodFilter('all')
                setDateFilter('all')
              }}
              className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Payments Data Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
            sync
          </span>
          <p className="text-sm font-bold text-[#1C2E26]">Loading Payment Records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">payments</span>
          <h3 className="text-lg font-bold text-[#1C2E26]">No Payments Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            No payment transactions match your search keywords or filter criteria. Try adjusting your filters above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden text-left">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2]">
            <p className="text-xs font-bold text-[#1C2E26]">
              Showing {filteredRecords.length} Payment Transactions
            </p>
            <span className="text-[11px] font-mono text-gray-500">
              Sorted by recent date
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1C2E26] text-white uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-4">Transaction / Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Item / Product</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredRecords.map((rec) => {
                  const isOnlineClass = rec.category === 'ONLINE_CLASS'
                  const isPaid = rec.status === 'PAID'
                  const isPending = rec.status === 'PENDING'

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecord(rec)}
                    >
                      {/* Ref & Date */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-mono text-xs font-bold text-[#1C2E26] group-hover:text-emerald-700">
                            {rec.transactionRef}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(rec.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            <span className="text-[10px]">
                              {new Date(rec.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-xs text-[#1C2E26]">{rec.user.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{rec.user.email}</p>
                          {rec.user.phone && <p className="text-[10px] text-gray-400">{rec.user.phone}</p>}
                        </div>
                      </td>

                      {/* Item Title & Category Badge */}
                      <td className="p-4">
                        <div className="space-y-1 max-w-xs">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                              isOnlineClass
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {rec.categoryLabel}
                          </span>
                          <p className="font-bold text-xs text-gray-800 line-clamp-1">{rec.itemTitle}</p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <p className="font-bold text-sm text-[#1C2E26]">
                          ${rec.amount}{' '}
                          <span className="text-[10px] font-normal text-gray-400">{rec.currency}</span>
                        </p>
                      </td>

                      {/* Gateway / Method */}
                      <td className="p-4 text-gray-600">
                        <span className="capitalize font-mono text-[11px] bg-gray-100 px-2 py-1 rounded-md">
                          {rec.paymentMethod || 'online'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-red-100 text-red-900 border border-red-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid ? 'bg-emerald-600' : isPending ? 'bg-amber-600 animate-pulse' : 'bg-red-600'
                            }`}
                          />
                          {rec.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.receiptUrl && (
                            <Link
                              href={rec.receiptUrl}
                              target="_blank"
                              className="p-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                              title="Download PDF Receipt"
                            >
                              <span className="material-symbols-outlined text-base">receipt_long</span>
                            </Link>
                          )}

                          {rec.voucherUrl && (
                            <Link
                              href={rec.voucherUrl}
                              target="_blank"
                              className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                              title="Download PDF Voucher"
                            >
                              <span className="material-symbols-outlined text-base">confirmation_number</span>
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              setEditingRecord(rec)
                              setStatusInput(rec.status)
                              setMethodInput(rec.paymentMethod || 'razorpay')
                              setAdminNoteInput(rec.adminNote || '')
                            }}
                            className="px-2.5 py-1.5 bg-[#1C2E26]/10 text-[#1C2E26] hover:bg-[#1C2E26] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">edit_note</span> Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-[#1C2E26] text-white flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2C799] bg-white/10 px-2 py-0.5 rounded">
                  {selectedRecord.categoryLabel} Payment Record
                </span>
                <h3 className="text-xl font-bold font-mono text-white">{selectedRecord.transactionRef}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Amount Paid</p>
                  <p className="text-lg font-bold text-[#1C2E26] mt-0.5">
                    ${selectedRecord.amount} {selectedRecord.currency}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Payment Status</p>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5 uppercase">
                    {selectedRecord.status}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Gateway Method</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5 capitalize font-mono">
                    {selectedRecord.paymentMethod || 'Online'}
                  </p>
                </div>
              </div>

              {/* Product & Service Info */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-black/5 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product / Service</p>
                <p className="text-sm font-bold text-[#1C2E26]">{selectedRecord.itemTitle}</p>
                {selectedRecord.itemId && (
                  <p className="text-[10px] text-gray-400 font-mono">Item ID: {selectedRecord.itemId}</p>
                )}
              </div>

              {/* Customer Information */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#1C2E26] text-xs uppercase tracking-wider border-b border-gray-100 pb-1">
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">Full Name</p>
                    <p className="font-bold text-sm text-[#1C2E26]">{selectedRecord.user.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">Email Address</p>
                    <p className="font-mono text-gray-700">{selectedRecord.user.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">Phone Number</p>
                    <p className="text-gray-700">{selectedRecord.user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">Country</p>
                    <p className="text-gray-700">{selectedRecord.user.country || 'International'}</p>
                  </div>
                </div>
              </div>

              {/* Transaction IDs & Dates */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#1C2E26] text-xs uppercase tracking-wider border-b border-gray-100 pb-1">
                  Technical Payment Meta
                </h4>
                <div className="space-y-1 font-mono text-[11px]">
                  {selectedRecord.razorpayPaymentId && (
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Razorpay Payment ID:</span>
                      <span className="font-bold text-gray-800">{selectedRecord.razorpayPaymentId}</span>
                    </div>
                  )}
                  {selectedRecord.paypalPaymentId && (
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">PayPal Payment ID:</span>
                      <span className="font-bold text-gray-800">{selectedRecord.paypalPaymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Created Timestamp:</span>
                    <span className="text-gray-800">{new Date(selectedRecord.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedRecord.paidAt && (
                    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Paid Timestamp:</span>
                      <span className="text-emerald-700 font-bold">{new Date(selectedRecord.paidAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Note if any */}
              {selectedRecord.adminNote && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold">Admin Note:</span> {selectedRecord.adminNote}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedRecord.user.email}`}
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded-xl font-bold text-xs hover:bg-gray-300 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">mail</span> Email Customer
                </a>
                {selectedRecord.user.phone && (
                  <a
                    href={`https://wa.me/${selectedRecord.user.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-xs hover:bg-emerald-200 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span> WhatsApp
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const rec = selectedRecord
                    setSelectedRecord(null)
                    setEditingRecord(rec)
                    setStatusInput(rec.status)
                    setMethodInput(rec.paymentMethod || 'razorpay')
                    setAdminNoteInput(rec.adminNote || '')
                  }}
                  className="px-4 py-2 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors cursor-pointer"
                >
                  Edit Status &amp; Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="p-5 bg-[#1C2E26] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#E2C799]">
                Update Payment: {editingRecord.transactionRef}
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePaymentStatus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Payment Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold bg-white text-gray-800"
                >
                  <option value="PAID">PAID (Approve &amp; Confirm)</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED / CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Method / Gateway</label>
                <select
                  value={methodInput}
                  onChange={(e) => setMethodInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium bg-white text-gray-800"
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="manual_admin">Manual Admin Entry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin Internal Note</label>
                <textarea
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="e.g. Verified via wire transfer on Sept 3, 2026"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#1C2E26] text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-[#1C2E26] text-white font-bold rounded-xl hover:bg-[#253e34] transition-colors shadow-md cursor-pointer flex items-center gap-1"
                >
                  {updating ? (
                    <>
                      <span className="material-symbols-outlined text-xs animate-spin">sync</span> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
