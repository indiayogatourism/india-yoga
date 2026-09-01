'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface UserItem {
  id: string
  clerkId: string
  name: string
  email: string
  phone?: string
  country?: string
  role: string
  createdAt: string
  _count: {
    bookings: number
    onlineEnrolments: number
  }
}

interface BookingItem {
  id: string
  bookingRef: string
  fullName: string
  email: string
  phone: string
  country: string
  arrivalDate: string
  departureDate: string
  guests: number
  roomType: string
  totalAmount: number
  currency: string
  status: string
  voucherUrl?: string
  receiptUrl?: string
  adminNote?: string
  createdAt: string
  package: {
    id: string
    title: string
    slug: string
    location: string
    category: string
  }
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  payment?: {
    id: string
    status: string
    method?: string
    paidAt?: string
  }
}

interface OnlineClassItem {
  id: string
  title: string
  slug: string
  timeSlot: string
  instructor: string
  meetingUrl?: string
  price?: number
}

interface EnrolmentItem {
  id: string
  userId: string
  classId: string
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  onlineClass: OnlineClassItem
}

export default function AdminUsersAndApplicationsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'onlineClasses'>('users')

  // Loading States
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [loadingEnrolments, setLoadingEnrolments] = useState(true)

  // Data States
  const [users, setUsers] = useState<UserItem[]>([])
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [enrolments, setEnrolments] = useState<EnrolmentItem[]>([])
  const [availableClasses, setAvailableClasses] = useState<OnlineClassItem[]>([])

  // Search & Filters
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')

  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')

  const [enrolmentSearch, setEnrolmentSearch] = useState('')
  const [enrolmentStatusFilter, setEnrolmentStatusFilter] = useState('all')

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [userRoleInput, setUserRoleInput] = useState('guest')
  const [userNameInput, setUserNameInput] = useState('')
  const [userPhoneInput, setUserPhoneInput] = useState('')
  const [savingUser, setSavingUser] = useState(false)

  // Booking Admin Note / Action State
  const [activeBooking, setActiveBooking] = useState<BookingItem | null>(null)
  const [adminNoteInput, setAdminNoteInput] = useState('')
  const [updatingBooking, setUpdatingBooking] = useState(false)

  // Manual Online Class Enrolment Modal State
  const [isManualEnrolModalOpen, setIsManualEnrolModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [enrolmentStatusInput, setEnrolmentStatusInput] = useState('ACTIVE')
  const [submittingEnrolment, setSubmittingEnrolment] = useState(false)

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error('Error loading admin users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await fetch('/api/admin/bookings')
      const data = await res.json()
      if (data.success) {
        setBookings(data.bookings || [])
      }
    } catch (err) {
      console.error('Error loading admin bookings:', err)
    } finally {
      setLoadingBookings(false)
    }
  }

  // Fetch Online Enrolments & Classes
  const fetchEnrolments = async () => {
    setLoadingEnrolments(true)
    try {
      const [enrolRes, classRes] = await Promise.all([
        fetch('/api/admin/online-enrolments'),
        fetch('/api/online-classes'),
      ])
      const enrolData = await enrolRes.json()
      const classData = await classRes.json()

      if (enrolData.success) {
        setEnrolments(enrolData.enrolments || [])
      }
      if (classData.success) {
        setAvailableClasses(classData.classes || [])
      }
    } catch (err) {
      console.error('Error loading enrolments:', err)
    } finally {
      setLoadingEnrolments(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchBookings()
    fetchEnrolments()
  }, [])

  // --- Handlers: Tab 1 Users ---
  const handleOpenEditUser = (user: UserItem) => {
    setEditingUser(user)
    setUserRoleInput(user.role)
    setUserNameInput(user.name)
    setUserPhoneInput(user.phone || '')
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setSavingUser(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          role: userRoleInput,
          name: userNameInput,
          phone: userPhoneInput,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingUser(null)
        fetchUsers()
      }
    } catch (err) {
      console.error('Error saving user:', err)
    } finally {
      setSavingUser(false)
    }
  }

  // --- Handlers: Tab 2 Bookings ---
  const handleUpdateBookingStatus = async (bookingId: string, status: string, paymentStatus?: string) => {
    setUpdatingBooking(true)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          status,
          ...(paymentStatus && { paymentStatus }),
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchBookings()
        if (activeBooking && activeBooking.id === bookingId) {
          setActiveBooking(data.booking)
        }
      }
    } catch (err) {
      console.error('Error updating booking:', err)
    } finally {
      setUpdatingBooking(false)
    }
  }

  const handleSaveAdminNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBooking) return
    setUpdatingBooking(true)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeBooking.id,
          adminNote: adminNoteInput,
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchBookings()
        setActiveBooking(null)
      }
    } catch (err) {
      console.error('Error saving admin note:', err)
    } finally {
      setUpdatingBooking(false)
    }
  }

  // --- Handlers: Tab 3 Online Classes ---
  const handleToggleEnrolmentStatus = async (enrolmentId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/online-enrolments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enrolmentId, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        fetchEnrolments()
      }
    } catch (err) {
      console.error('Error updating enrolment status:', err)
    }
  }

  const handleRevokeEnrolment = async (enrolmentId: string) => {
    if (!confirm('Are you sure you want to revoke this student\'s enrolment?')) return
    try {
      const res = await fetch(`/api/admin/online-enrolments?id=${enrolmentId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchEnrolments()
      }
    } catch (err) {
      console.error('Error revoking enrolment:', err)
    }
  }

  const handleManualEnrolSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !selectedClassId) return
    setSubmittingEnrolment(true)

    try {
      const res = await fetch('/api/admin/online-enrolments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUserId,
          classId: selectedClassId,
          status: enrolmentStatusInput,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsManualEnrolModalOpen(false)
        fetchEnrolments()
      }
    } catch (err) {
      console.error('Error manually enrolling student:', err)
    } finally {
      setSubmittingEnrolment(false)
    }
  }

  // Filtering Lists
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.clerkId.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch))
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
    return matchesQuery && matchesRole
  })

  const filteredBookings = bookings.filter((b) => {
    const matchesQuery =
      b.bookingRef.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.fullName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.package.title.toLowerCase().includes(bookingSearch.toLowerCase())
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter
    return matchesQuery && matchesStatus
  })

  const filteredEnrolments = enrolments.filter((e) => {
    const matchesQuery =
      e.user.name.toLowerCase().includes(enrolmentSearch.toLowerCase()) ||
      e.user.email.toLowerCase().includes(enrolmentSearch.toLowerCase()) ||
      e.onlineClass.title.toLowerCase().includes(enrolmentSearch.toLowerCase())
    const matchesStatus = enrolmentStatusFilter === 'all' || e.status === enrolmentStatusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1C2E26]">Users &amp; Applications Manager</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage user login credentials, programme &amp; retreat booking applications, and online class student enrolments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'onlineClasses' && (
            <button
              onClick={() => {
                setSelectedUserId(users[0]?.id || '')
                setSelectedClassId(availableClasses[0]?.id || '')
                setIsManualEnrolModalOpen(true)
              }}
              className="px-4 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Manually Enroll Student
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          1. All Users &amp; Credentials ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">card_travel</span>
          2. Programme &amp; Retreat Applications ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('onlineClasses')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'onlineClasses'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">videocam</span>
          3. Online Classes &amp; Enrolments ({enrolments.length})
        </button>
      </div>

      {/* TAB 1: ALL USERS & CREDENTIALS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, phone, or Clerk ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white font-medium"
              >
                <option value="all">All Roles</option>
                <option value="guest">Guest</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
              <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
                sync
              </span>
              <p className="text-sm font-bold text-[#1C2E26]">Loading User Accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">person_search</span>
              <h3 className="text-lg font-bold text-[#1C2E26]">No Users Found</h3>
              <p className="text-xs text-gray-500">Try refining your search keywords or role filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-x-auto text-left">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1C2E26] text-white uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Clerk Auth ID</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-center">Activity</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1C2E26]/10 text-[#1C2E26] flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1C2E26]">{u.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-gray-500">
                        {u.clerkId.substring(0, 16)}...
                      </td>

                      <td className="p-4 text-xs text-gray-600">
                        <p>{u.phone || 'No phone'}</p>
                        <p className="text-[10px] text-gray-400">{u.country || 'International'}</p>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold text-[10px]" title="Bookings">
                            {u._count.bookings} Bookings
                          </span>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-bold text-[10px]" title="Classes">
                            {u._count.onlineEnrolments} Classes
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.phone && (
                            <a
                              href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                              title="WhatsApp User"
                            >
                              <span className="material-symbols-outlined text-base">chat</span>
                            </a>
                          )}
                          <a
                            href={`mailto:${u.email}`}
                            className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors"
                            title="Email User"
                          >
                            <span className="material-symbols-outlined text-base">mail</span>
                          </a>
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="px-3 py-1.5 bg-[#1C2E26]/10 text-[#1C2E26] hover:bg-[#1C2E26] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">edit</span> Edit User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROGRAMME & RETREAT APPLICATIONS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search applications by guest name, email, booking ref (IYT-2026-xxxxx), or package..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Status:</span>
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {loadingBookings ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
              <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
                sync
              </span>
              <p className="text-sm font-bold text-[#1C2E26]">Loading Programme Applications...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">no_backpack</span>
              <h3 className="text-lg font-bold text-[#1C2E26]">No Programme Applications Found</h3>
              <p className="text-xs text-gray-500">No retreat or programme applications match your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4 hover:border-[#1C2E26]/20 transition-all text-left"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1C2E26] bg-[#1C2E26]/10 px-2.5 py-0.5 rounded-md">
                          {b.bookingRef}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : b.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-red-100 text-red-900 border border-red-300'
                          }`}
                        >
                          {b.status}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            b.payment?.status === 'PAID'
                              ? 'bg-green-50 text-green-800 border border-green-200'
                              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          }`}
                        >
                          Payment: {b.payment?.status || 'PENDING'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#1C2E26] mt-1">{b.package.title}</h3>
                      <p className="text-xs text-gray-500">Location: {b.package.location}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-[#1C2E26]">
                        ${b.totalAmount} <span className="text-xs font-normal text-gray-500">{b.currency}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {b.guests} {b.guests === 1 ? 'Guest' : 'Guests'} • {b.roomType} room
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                    <div>
                      <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Guest Information</p>
                      <p className="font-bold text-[#1C2E26] mt-0.5">{b.fullName}</p>
                      <p className="font-mono text-gray-500">{b.email}</p>
                      <p>{b.phone} ({b.country})</p>
                    </div>

                    <div>
                      <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Travel Dates</p>
                      <p className="mt-0.5">
                        Arrival:{' '}
                        {new Date(b.arrivalDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p>
                        Departure:{' '}
                        {new Date(b.departureDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Generated Documents</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Link
                          href={`/api/download/voucher/${b.bookingRef}`}
                          target="_blank"
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold rounded-lg text-[11px] hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">picture_as_pdf</span> PDF Voucher
                        </Link>
                        <Link
                          href={`/api/download/receipt/${b.bookingRef}`}
                          target="_blank"
                          className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 font-bold rounded-lg text-[11px] hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">receipt_long</span> PDF Receipt
                        </Link>
                      </div>
                    </div>
                  </div>

                  {b.adminNote && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold">Admin Note:</span> {b.adminNote}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED', 'PAID')}
                        disabled={updatingBooking}
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">check_circle</span> Approve &amp; Confirm
                      </button>

                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                        disabled={updatingBooking}
                        className="px-3 py-1.5 bg-red-100 text-red-800 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">cancel</span> Cancel Application
                      </button>

                      <button
                        onClick={() => {
                          setActiveBooking(b)
                          setAdminNoteInput(b.adminNote || '')
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">edit_note</span> Note
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${b.email}`}
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">mail</span> Contact Guest
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ONLINE CLASSES ENROLMENTS & REQUESTS */}
      {activeTab === 'onlineClasses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={enrolmentSearch}
                onChange={(e) => setEnrolmentSearch(e.target.value)}
                placeholder="Search online class enrolments by student name, email, or class title..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Status:</span>
              <select
                value={enrolmentStatusFilter}
                onChange={(e) => setEnrolmentStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white font-medium"
              >
                <option value="all">All Enrolments</option>
                <option value="ACTIVE">Active Pass</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {loadingEnrolments ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
              <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
                sync
              </span>
              <p className="text-sm font-bold text-[#1C2E26]">Loading Online Class Enrolments...</p>
            </div>
          ) : filteredEnrolments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-black/5 space-y-3">
              <span className="material-symbols-outlined text-5xl text-gray-300">videocam_off</span>
              <h3 className="text-lg font-bold text-[#1C2E26]">No Online Class Enrolments Found</h3>
              <p className="text-xs text-gray-500">You can manually enroll any student into an active sanctuary class.</p>
              <button
                onClick={() => setIsManualEnrolModalOpen(true)}
                className="px-4 py-2 bg-[#1C2E26] text-[#E2C799] font-bold text-xs rounded-xl hover:bg-[#253e34] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                Manually Enroll Student
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-x-auto text-left">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1C2E26] text-white uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Student Info</th>
                    <th className="p-4">Online Sanctuary Class</th>
                    <th className="p-4">Schedule / Time</th>
                    <th className="p-4">Meeting Join URL</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Enrolled Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredEnrolments.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-sm text-[#1C2E26]">{e.user.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{e.user.email}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div>
                          <p className="font-bold text-[#1C2E26]">{e.onlineClass.title}</p>
                          <p className="text-[11px] text-gray-500">Instructor: {e.onlineClass.instructor}</p>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-gray-600">
                        {e.onlineClass.timeSlot}
                      </td>

                      <td className="p-4">
                        {e.onlineClass.meetingUrl ? (
                          <a
                            href={e.onlineClass.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">video_call</span>
                            Join Link <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                            No Link Set
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            e.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : e.status === 'EXPIRED'
                              ? 'bg-gray-100 text-gray-700 border border-gray-300'
                              : 'bg-red-100 text-red-900 border border-red-300'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>

                      <td className="p-4 text-gray-500 text-[11px]">
                        {new Date(e.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {e.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleToggleEnrolmentStatus(e.id, 'EXPIRED')}
                              className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              Expire Pass
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleEnrolmentStatus(e.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Activate Pass
                            </button>
                          )}

                          <button
                            onClick={() => handleRevokeEnrolment(e.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Revoke Access"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-black/10 text-left">
            <div className="bg-[#1C2E26] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined">edit_square</span>
                  Edit User Account &amp; Role
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">User Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Access Role *</label>
                <select
                  value={userRoleInput}
                  onChange={(e) => setUserRoleInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none bg-white font-bold"
                >
                  <option value="guest">GUEST (Standard User Access)</option>
                  <option value="admin">ADMIN (Full Admin Control Panel Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userPhoneInput}
                  onChange={(e) => setUserPhoneInput(e.target.value)}
                  placeholder="+91 99998 76349"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors cursor-pointer"
                >
                  {savingUser ? 'Saving...' : 'Save User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Note Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-black/10 text-left">
            <div className="bg-[#1C2E26] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined">edit_note</span>
                  Admin Internal Note ({activeBooking.bookingRef})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBooking(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdminNote} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Internal Application Note
                </label>
                <textarea
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Add comments regarding medical requirements, special requests, room allocation, or payment verification..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveBooking(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingBooking}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Online Class Enrolment Modal */}
      {isManualEnrolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-black/10 text-left">
            <div className="bg-[#1C2E26] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined">person_add</span>
                  Manually Enroll Student to Class
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualEnrolModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleManualEnrolSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Student *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1C2E26] focus:outline-none bg-white font-medium"
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Select Online Class *</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1C2E26] focus:outline-none bg-white font-medium"
                  required
                >
                  {availableClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} — {c.timeSlot} (${c.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Pass Status</label>
                <select
                  value={enrolmentStatusInput}
                  onChange={(e) => setEnrolmentStatusInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1C2E26] focus:outline-none bg-white font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Immediate Access &amp; Live Link)</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualEnrolModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEnrolment}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors cursor-pointer"
                >
                  {submittingEnrolment ? 'Enrolling...' : 'Enroll Student Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
