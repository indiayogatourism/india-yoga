'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PageItem {
  id: string
  slug: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  customHtmlTags?: string
  published: boolean
  createdAt: string
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State for Single Page Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')
  const [editingPage, setEditingPage] = useState<PageItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Bulk Upload Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkInputText, setBulkInputText] = useState('')
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null)
  const [bulkErrorMsg, setBulkErrorMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    customHtmlTags: '',
    published: true,
  })

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pages')
      const data = await res.json()
      if (data.success) {
        setPages(data.pages || [])
      }
    } catch (err) {
      console.error('Error loading pages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const generateSlug = () => {
    if (!formData.title) return
    const clean = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setFormData((prev) => ({ ...prev, slug: clean }))
  }

  const handleOpenAddModal = () => {
    setEditingPage(null)
    setActiveTab('content')
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      customHtmlTags: '',
      published: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (page: PageItem) => {
    setEditingPage(page)
    setActiveTab('content')
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      metaKeywords: page.metaKeywords || '',
      canonicalUrl: page.canonicalUrl || '',
      ogTitle: page.ogTitle || '',
      ogDescription: page.ogDescription || '',
      ogImage: page.ogImage || '',
      customHtmlTags: page.customHtmlTags || '',
      published: page.published,
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    setSubmitting(true)
    try {
      if (editingPage) {
        const res = await fetch(`/api/pages/${editingPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchPages()
        }
      } else {
        const res = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchPages()
        }
      }
    } catch (err) {
      console.error('Error saving custom page:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (page: PageItem) => {
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !page.published }),
      })
      const data = await res.json()
      if (data.success) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, published: !p.published } : p))
        )
      }
    } catch (err) {
      console.error('Error toggling page status:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setDeleteConfirmId(null)
        setPages((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (err) {
      console.error('Error deleting page:', err)
    }
  }

  // --- Bulk Upload Handlers ---
  const handleOpenBulkModal = () => {
    setBulkInputText('')
    setBulkSuccessMsg(null)
    setBulkErrorMsg(null)
    setIsBulkModalOpen(true)
  }

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setBulkInputText(text || '')
    }
    reader.readAsText(file)
  }

  const handleDownloadSampleJson = () => {
    const sample = [
      {
        title: 'Ashram Rules & Conduct',
        slug: 'ashram-rules',
        content: '# Ashram Rules & Guidelines\n\nWelcome to India Yoga Tourism. Please maintain silence during morning meditation.',
        metaTitle: 'Ashram Rules & Conduct | India Yoga Tourism',
        metaDescription: 'Guidelines and rules for guests staying at our Rishikesh sanctuary.',
        metaKeywords: 'ashram rules, rishikesh yoga rules',
        published: true,
      },
      {
        title: 'Ayurveda Clinical Diet Policy',
        slug: 'ayurveda-diet-policy',
        content: '# Sattvic Diet Policy\n\nAll meals served are 100% vegetarian, organic, and Sattvic.',
        metaTitle: 'Ayurveda Clinical Diet Policy',
        metaDescription: 'Learn about our organic Sattvic nutrition guidelines.',
        published: true,
      },
    ]

    const jsonStr = JSON.stringify(sample, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-pages-bulk-import.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBulkImporting(true)
    setBulkSuccessMsg(null)
    setBulkErrorMsg(null)

    try {
      let parsedData: any[] = []
      try {
        parsedData = JSON.parse(bulkInputText)
      } catch (parseErr) {
        throw new Error('Invalid JSON format. Please check your syntax or download the sample JSON template.')
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('JSON payload must be a non-empty array of page objects.')
      }

      const res = await fetch('/api/pages/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      })

      const data = await res.json()

      if (data.success) {
        setBulkSuccessMsg(`Successfully imported ${data.count} pages!`)
        fetchPages()
        setTimeout(() => {
          setIsBulkModalOpen(false)
        }, 2000)
      } else {
        setBulkErrorMsg(data.error || 'Failed to bulk import pages')
      }
    } catch (err: any) {
      setBulkErrorMsg(err.message || 'Error executing bulk import')
    } finally {
      setBulkImporting(false)
    }
  }

  const filteredPages = pages.filter((p) => {
    return (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1C2E26]">Custom Pages &amp; CMS</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage static landing pages, disclosures, policies, and search engine SEO metadata.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={handleOpenBulkModal}
            className="px-4 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold rounded-xl text-xs hover:bg-emerald-100 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            Bulk Upload Pages
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_box</span>
            Create New Page
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm relative">
        <span className="material-symbols-outlined absolute left-7 top-6 text-gray-400 text-lg">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages by title or URL slug..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
        />
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
          <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
            sync
          </span>
          <p className="text-sm font-bold text-[#1C2E26]">Loading Custom Pages...</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5 space-y-4 max-w-md mx-auto">
          <span className="material-symbols-outlined text-5xl text-gray-300">description</span>
          <h3 className="text-lg font-bold text-[#1C2E26]">No Custom Pages Found</h3>
          <p className="text-xs text-gray-500">
            Create pages like Terms of Service, Sanctuary Rules, or bulk upload multiple pages via JSON.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleOpenBulkModal}
              className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs hover:bg-emerald-100 cursor-pointer"
            >
              Bulk Upload Pages
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] cursor-pointer"
            >
              Create New Page
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredPages.map((p) => (
            <div
              key={p.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#1C2E26]">{p.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.published
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.published ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">/{p.slug}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleTogglePublish(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    p.published
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title={p.published ? 'Unpublish page' : 'Publish page'}
                >
                  <span className="material-symbols-outlined text-xs">
                    {p.published ? 'visibility_off' : 'visibility'}
                  </span>
                  {p.published ? 'Unpublish' : 'Publish'}
                </button>

                <Link
                  href={`/${p.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#1C2E26] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  View Page <span className="material-symbols-outlined text-xs">open_in_new</span>
                </Link>

                <button
                  onClick={() => handleOpenEditModal(p)}
                  className="px-3 py-1.5 bg-[#1C2E26]/10 text-[#1C2E26] hover:bg-[#1C2E26] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">edit</span> Edit &amp; SEO
                </button>

                {deleteConfirmId === p.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Page"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-black/10 flex flex-col max-h-[90vh]">
            <div className="bg-[#1C2E26] text-white p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    {editingPage ? 'edit_document' : 'post_add'}
                  </span>
                  {editingPage ? 'Edit Custom Page & SEO' : 'Create New Custom Page'}
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Configure page layout, content body, and search engine metadata.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`py-3 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'content'
                    ? 'border-[#1C2E26] text-[#1C2E26] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">description</span>
                1. Page Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`py-3 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'seo'
                    ? 'border-[#1C2E26] text-[#1C2E26] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">search</span>
                2. SEO &amp; OpenGraph Meta
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Page Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Ashram Rules & Sanctuary Conduct"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold uppercase text-gray-700">URL Slug *</label>
                        <button
                          type="button"
                          onClick={generateSlug}
                          className="text-[10px] text-emerald-800 font-bold hover:underline cursor-pointer"
                        >
                          Auto-generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. ashram-rules"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Page Content Body *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write main page markdown or HTML text content..."
                      rows={12}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">manage_search</span>
                      Search Engine Optimization Setup
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Custom SEO parameters override default titles, descriptions, and social share previews on Google, WhatsApp, Facebook, and Twitter for this custom page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      SEO Meta Title (Title Tag)
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder={formData.title || 'Page title for Google search...'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      SEO Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Concise summary for Google search snippets..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        placeholder="ashram, rules, retreats, yoga"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        placeholder="https://indiayogatourism.com/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200 my-2" />

                  <h4 className="font-bold text-xs uppercase text-gray-500 tracking-wider">
                    OpenGraph &amp; Social Share Meta
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={formData.ogTitle}
                        onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                        placeholder={formData.metaTitle || formData.title}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        OG Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.ogImage}
                        onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      OG Description
                    </label>
                    <textarea
                      value={formData.ogDescription}
                      onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                      placeholder={formData.metaDescription}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
                    />
                  </div>

                  <hr className="border-gray-200 my-2" />

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Custom HTML SEO Tags (Raw Meta &amp; Script Tags)
                    </label>
                    <p className="text-[11px] text-gray-500 mb-1.5">
                      Paste raw HTML tags like &lt;meta name="..." content="..." /&gt;, JSON-LD &lt;script type="application/ld+json"&gt;, or Google verification meta tags.
                    </p>
                    <textarea
                      value={formData.customHtmlTags}
                      onChange={(e) => setFormData({ ...formData, customHtmlTags: e.target.value })}
                      placeholder='<meta name="robots" content="index, follow" />&#10;<script type="application/ld+json">...</script>'
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="page-published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 text-[#1C2E26] rounded focus:ring-[#1C2E26]"
                    />
                    <label htmlFor="page-published" className="text-xs font-bold text-[#1C2E26]">
                      Publish this page (accessible on public website)
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
                  {editingPage ? 'Save Page & SEO' : 'Publish Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal Drawer */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh] text-left">
            <div className="bg-[#1C2E26] text-white p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined">upload_file</span>
                  Bulk Upload Pages (JSON / CSV)
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Import multiple CMS pages, disclosures, and landing pages at once.
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">info</span>
                    Need sample JSON template?
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Download our formatted JSON structure to see exact key requirements (title, slug, content, SEO fields).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleJson}
                  className="px-4 py-2 bg-[#1C2E26] text-[#E2C799] font-bold text-xs rounded-xl hover:bg-[#253e34] transition-colors shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Sample JSON Template
                </button>
              </div>

              {/* Upload File Control */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-700">
                  Option 1: Choose File from Device (.json or .csv)
                </label>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleDeviceFileUpload}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1C2E26] file:text-[#E2C799] hover:file:bg-[#253e34] cursor-pointer"
                />
              </div>

              {/* Raw JSON Paste Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-gray-700">
                  Option 2: Paste Raw JSON Array Below
                </label>
                <textarea
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder='[&#10;  {&#10;    "title": "Terms of Service",&#10;    "slug": "terms-of-service",&#10;    "content": "Page content here...",&#10;    "metaTitle": "Terms of Service",&#10;    "published": true&#10;  }&#10;]'
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
              </div>

              {bulkSuccessMsg && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {bulkSuccessMsg}
                </div>
              )}

              {bulkErrorMsg && (
                <div className="p-3 bg-red-100 text-red-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {bulkErrorMsg}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkImporting || !bulkInputText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {bulkImporting && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
                  Import Pages Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
