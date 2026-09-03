'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  orderIndex: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface SeoMeta {
  title: string
  description: string
  keywords: string
  ogImage?: string
}

const CATEGORIES = [
  'General',
  'Retreats & Ashram',
  'Online Classes',
  'Booking & Payments',
  'Visa & Travel',
]

export default function AdminFaqsPage() {
  const [loading, setLoading] = useState(true)
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [seoMeta, setSeoMeta] = useState<SeoMeta>({
    title: 'Frequently Asked Questions | India Yoga Tourism',
    description: 'Find answers to common questions about Rishikesh yoga retreats, Panchakarma detox, online classes, visas, and booking.',
    keywords: 'yoga faq, rishikesh retreat questions, panchakarma faq, online class info',
  })

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [questionInput, setQuestionInput] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('General')
  const [orderIndexInput, setOrderIndexInput] = useState(0)
  const [isPublishedInput, setIsPublishedInput] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // SEO Modal State
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false)
  const [seoTitleInput, setSeoTitleInput] = useState('')
  const [seoDescriptionInput, setSeoDescriptionInput] = useState('')
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('')
  const [seoOgImageInput, setSeoOgImageInput] = useState('')
  const [savingSeo, setSavingSeo] = useState(false)

  // Fetch FAQs from API
  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/faqs')
      const data = await res.json()
      if (data.success) {
        setFaqs(data.faqs || [])
        if (data.seoMeta) {
          setSeoMeta(data.seoMeta)
        }
      }
    } catch (err) {
      console.error('Error fetching admin FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingFaq(null)
    setQuestionInput('')
    setAnswerInput('')
    setCategoryInput(selectedCategory !== 'all' ? selectedCategory : 'General')
    setOrderIndexInput(faqs.length + 1)
    setIsPublishedInput(true)
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (faq: FaqItem) => {
    setEditingFaq(faq)
    setQuestionInput(faq.question)
    setAnswerInput(faq.answer)
    setCategoryInput(faq.category)
    setOrderIndexInput(faq.orderIndex)
    setIsPublishedInput(faq.isPublished)
    setIsModalOpen(true)
  }

  // Save FAQ Form Submit
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionInput.trim() || !answerInput.trim()) {
      alert('Please fill in both Question and Answer.')
      return
    }
    setSubmitting(true)

    try {
      const method = editingFaq ? 'PUT' : 'POST'
      const payload = {
        ...(editingFaq && { id: editingFaq.id }),
        question: questionInput.trim(),
        answer: answerInput.trim(),
        category: categoryInput,
        orderIndex: Number(orderIndexInput) || 0,
        isPublished: isPublishedInput,
      }

      const res = await fetch('/api/admin/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        fetchFaqs()
      } else {
        alert(data.error || 'Failed to save FAQ')
      }
    } catch (err) {
      console.error('Error saving FAQ:', err)
      alert('An error occurred while saving.')
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle Published Status
  const handleTogglePublished = async (faq: FaqItem) => {
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: faq.id,
          isPublished: !faq.isPublished,
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchFaqs()
      }
    } catch (err) {
      console.error('Error toggling status:', err)
    }
  }

  // Delete FAQ
  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ question?')) return
    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        fetchFaqs()
      } else {
        alert(data.error || 'Failed to delete')
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err)
    }
  }

  // Open SEO Modal
  const handleOpenSeoModal = () => {
    setSeoTitleInput(seoMeta.title || '')
    setSeoDescriptionInput(seoMeta.description || '')
    setSeoKeywordsInput(seoMeta.keywords || '')
    setSeoOgImageInput(seoMeta.ogImage || '')
    setIsSeoModalOpen(true)
  }

  // Save SEO Settings
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSeo(true)

    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSeoUpdate: true,
          title: seoTitleInput,
          description: seoDescriptionInput,
          keywords: seoKeywordsInput,
          ogImage: seoOgImageInput,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSeoMeta(data.seoMeta)
        setIsSeoModalOpen(false)
        alert('FAQ SEO metadata updated successfully!')
      } else {
        alert(data.error || 'Failed to update SEO')
      }
    } catch (err) {
      console.error('Error saving SEO:', err)
    } finally {
      setSavingSeo(false)
    }
  }

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [faqs, selectedCategory, searchQuery])

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#1C2E26]">quiz</span>
            <h2 className="text-2xl font-bold text-[#1C2E26]">FAQ System &amp; SEO Manager</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage frequently asked questions, structure content categories, and configure Google FAQ Schema (JSON-LD) SEO.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenSeoModal}
            className="px-4 py-2.5 bg-amber-50 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-base">travel_explore</span>
            Configure FAQ SEO
          </button>

          <Link href="/faqs" target="_blank">
            <button className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer">
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Live Public Page
            </button>
          </Link>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Add New Question
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQ questions or answer keywords..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#1C2E26] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({faqs.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = faqs.filter((f) => f.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#1C2E26] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* FAQs List Table */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-black/5 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
              sync
            </span>
            <p className="text-sm font-bold text-[#1C2E26]">Loading FAQ Repository...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-black/5 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">quiz</span>
            <h3 className="text-lg font-bold text-[#1C2E26]">No FAQ Questions Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Click &quot;Add New Question&quot; above to create your first FAQ entry for this category.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-[#FAF7F2] flex items-center justify-between">
              <p className="text-xs font-bold text-[#1C2E26]">
                Showing {filteredFaqs.length} Frequently Asked Questions
              </p>
              <span className="text-[11px] text-gray-500 font-mono">
                Google FAQ Schema enabled
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-md font-bold text-[10px] uppercase tracking-wider">
                        {faq.category}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                        Order #{faq.orderIndex}
                      </span>
                      <button
                        onClick={() => handleTogglePublished(faq)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                          faq.isPublished
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {faq.isPublished ? '● Published' : '○ Draft'}
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-[#1C2E26]">{faq.question}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{faq.answer}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEdit(faq)}
                      className="px-3 py-1.5 bg-[#1C2E26]/10 text-[#1C2E26] hover:bg-[#1C2E26] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT FAQ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="p-5 bg-[#1C2E26] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#E2C799] flex items-center gap-2">
                <span className="material-symbols-outlined text-base">quiz</span>
                {editingFaq ? 'Edit FAQ Entry' : 'Create New FAQ Entry'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl font-bold bg-white text-gray-800 focus:outline-none focus:border-[#1C2E26]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g. What is included in a retreat booking package?"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#1C2E26] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Answer</label>
                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Provide a comprehensive, helpful answer for visitors and search engine bots..."
                  rows={5}
                  required
                  className="w-full p-3.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#1C2E26] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Order Index</label>
                  <input
                    type="number"
                    value={orderIndexInput}
                    onChange={(e) => setOrderIndexInput(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#1C2E26]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPublishedCheck"
                    checked={isPublishedInput}
                    onChange={(e) => setIsPublishedInput(e.target.checked)}
                    className="w-4 h-4 accent-[#1C2E26] cursor-pointer"
                  />
                  <label htmlFor="isPublishedCheck" className="font-bold text-gray-800 cursor-pointer">
                    Publish immediately
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl hover:bg-[#253e34] transition-colors shadow-md cursor-pointer flex items-center gap-1"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined text-xs animate-spin">sync</span> Saving...
                    </>
                  ) : (
                    'Save Question'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEO CONFIG MODAL */}
      {isSeoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="p-5 bg-[#1C2E26] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">travel_explore</span>
                  FAQ Page SEO &amp; Rich Results Config
                </h3>
                <p className="text-[11px] text-white/70">
                  Configure meta tags and Google FAQ Schema search snippet optimization for /faqs
                </p>
              </div>
              <button
                onClick={() => setIsSeoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSeo} className="p-6 space-y-4 text-xs">
              {/* Google Search Card Preview */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Google Search Snippet Preview
                </p>
                <p className="text-xs font-mono text-emerald-800">https://indiayogatourism.com/faqs</p>
                <h4 className="text-sm font-bold text-blue-700 hover:underline">
                  {seoTitleInput || 'Frequently Asked Questions | India Yoga Tourism'}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {seoDescriptionInput ||
                    'Find answers to common questions about Rishikesh yoga retreats, Panchakarma detox, online classes, travel visas, and booking.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">SEO Title Tag</label>
                <input
                  type="text"
                  value={seoTitleInput}
                  onChange={(e) => setSeoTitleInput(e.target.value)}
                  placeholder="Frequently Asked Questions | India Yoga Tourism"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#1C2E26] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={seoDescriptionInput}
                  onChange={(e) => setSeoDescriptionInput(e.target.value)}
                  placeholder="Compelling meta description summarizing page content for Google results..."
                  rows={3}
                  required
                  className="w-full p-3.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#1C2E26]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Meta Keywords</label>
                <input
                  type="text"
                  value={seoKeywordsInput}
                  onChange={(e) => setSeoKeywordsInput(e.target.value)}
                  placeholder="yoga faq, rishikesh retreat questions, panchakarma faq, online class info"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#1C2E26]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">OpenGraph Banner Image URL</label>
                <input
                  type="text"
                  value={seoOgImageInput}
                  onChange={(e) => setSeoOgImageInput(e.target.value)}
                  placeholder="https://lh3.googleusercontent.com/..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#1C2E26]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSeoModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSeo}
                  className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl hover:bg-[#253e34] transition-colors shadow-md cursor-pointer flex items-center gap-1"
                >
                  {savingSeo ? (
                    <>
                      <span className="material-symbols-outlined text-xs animate-spin">sync</span> Saving...
                    </>
                  ) : (
                    'Save SEO Metadata'
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
