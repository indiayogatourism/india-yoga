'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BlogPostItem {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage?: string
  authorName?: string
  category?: string
  tags?: string[]
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

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Modal State for Single Blog Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')
  const [editingBlog, setEditingBlog] = useState<BlogPostItem | null>(null)
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
    excerpt: '',
    content: '',
    coverImage: '',
    authorName: 'India Yoga Tourism Team',
    category: 'Ayurveda & Wellness',
    tags: '',
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

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/blogs')
      const data = await res.json()
      if (data.success) {
        setBlogs(data.blogs || [])
      }
    } catch (err) {
      console.error('Error loading blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
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
    setEditingBlog(null)
    setActiveTab('content')
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      authorName: 'India Yoga Tourism Team',
      category: 'Ayurveda & Wellness',
      tags: 'yoga, ayurveda, wellness',
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

  const handleOpenEditModal = (blog: BlogPostItem) => {
    setEditingBlog(blog)
    setActiveTab('content')
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      coverImage: blog.coverImage || '',
      authorName: blog.authorName || 'India Yoga Tourism Team',
      category: blog.category || 'Ayurveda & Wellness',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || '',
      canonicalUrl: blog.canonicalUrl || '',
      ogTitle: blog.ogTitle || '',
      ogDescription: blog.ogDescription || '',
      ogImage: blog.ogImage || '',
      customHtmlTags: blog.customHtmlTags || '',
      published: blog.published,
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    setSubmitting(true)
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
    }

    try {
      if (editingBlog) {
        const res = await fetch(`/api/blogs/${editingBlog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchBlogs()
        }
      } else {
        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchBlogs()
        }
      }
    } catch (err) {
      console.error('Error saving blog post:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (blog: BlogPostItem) => {
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !blog.published }),
      })
      const data = await res.json()
      if (data.success) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, published: !b.published } : b))
        )
        fetchBlogs()
      }
    } catch (err) {
      console.error('Error toggling blog status:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setDeleteConfirmId(null)
        setBlogs((prev) => prev.filter((b) => b.id !== id))
      }
    } catch (err) {
      console.error('Error deleting blog post:', err)
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
        title: 'Science of Panchakarma Cellular Detoxification',
        slug: 'science-of-panchakarma-detoxification',
        category: 'Ayurveda & Wellness',
        author: 'Yogini Arundhati',
        readTime: '6 min read',
        excerpt: 'Discover how 5 sacred Ayurvedic cleansing therapies eliminate deep tissue toxins.',
        content: '# Science of Panchakarma\n\nPanchakarma translates to five purification actions aimed at restoring elemental balance...',
        coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
        tags: ['Ayurveda', 'Panchakarma', 'Detox'],
        metaTitle: 'Science of Panchakarma Cellular Detoxification',
        metaDescription: 'Discover how 5 sacred Ayurvedic cleansing therapies eliminate deep tissue toxins.',
        published: true,
      },
      {
        title: 'Mastering Morning Pranayama in Rishikesh',
        slug: 'mastering-morning-pranayama-rishikesh',
        category: 'Yoga Practice',
        author: 'Swami Yogananda',
        readTime: '4 min read',
        excerpt: 'Harness the prana energy along the holy Ganges river with traditional breathwork techniques.',
        content: '# Morning Breathwork Guide\n\nPranayama is the control of vital breath energy through conscious rhythmic breathing...',
        published: true,
      },
    ]

    const jsonStr = JSON.stringify(sample, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-blogs-bulk-import.json'
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
        throw new Error('JSON payload must be a non-empty array of blog objects.')
      }

      const res = await fetch('/api/blogs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      })

      const data = await res.json()

      if (data.success) {
        setBulkSuccessMsg(`Successfully imported ${data.count} blog posts!`)
        fetchBlogs()
        setTimeout(() => {
          setIsBulkModalOpen(false)
        }, 2000)
      } else {
        setBulkErrorMsg(data.error || 'Failed to bulk import blogs')
      }
    } catch (err: any) {
      setBulkErrorMsg(err.message || 'Error executing bulk import')
    } finally {
      setBulkImporting(false)
    }
  }

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      filterCategory === 'all' || b.category?.toLowerCase() === filterCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1C2E26]">Blog &amp; Articles CMS</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage published stories, wellness guides, and advanced search engine SEO metadata.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={handleOpenBulkModal}
            className="px-4 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold rounded-xl text-xs hover:bg-emerald-100 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            Bulk Upload Blogs
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Create New Article
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title or snippet..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Filter:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white font-medium"
          >
            <option value="all">All Categories</option>
            <option value="Ayurveda & Wellness">Ayurveda &amp; Wellness</option>
            <option value="Yoga Practice">Yoga Practice</option>
            <option value="Himalayan Pilgrimage">Himalayan Pilgrimage</option>
          </select>
        </div>
      </div>

      {/* Articles Table/List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
          <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
            sync
          </span>
          <p className="text-sm font-bold text-[#1C2E26]">Loading Blog Posts...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5 space-y-4 max-w-md mx-auto">
          <span className="material-symbols-outlined text-5xl text-gray-300">article</span>
          <h3 className="text-lg font-bold text-[#1C2E26]">No Articles Found</h3>
          <p className="text-xs text-gray-500">
            Get started by creating your first article or bulk importing multiple articles via JSON.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleOpenBulkModal}
              className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs hover:bg-emerald-100 cursor-pointer"
            >
              Bulk Upload Blogs
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] cursor-pointer"
            >
              Create New Article
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredBlogs.map((b) => (
            <div
              key={b.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                {b.coverImage && (
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2C799] bg-[#1C2E26] px-2.5 py-0.5 rounded-full">
                      {b.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.published
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1C2E26] truncate">{b.title}</h3>
                  <p className="text-xs text-gray-500 font-mono">/blog/{b.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleTogglePublish(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    b.published
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title={b.published ? 'Unpublish article' : 'Publish article'}
                >
                  <span className="material-symbols-outlined text-xs">
                    {b.published ? 'visibility_off' : 'visibility'}
                  </span>
                  {b.published ? 'Unpublish' : 'Publish'}
                </button>

                <Link
                  href={`/blog/${b.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#1C2E26] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  View <span className="material-symbols-outlined text-xs">open_in_new</span>
                </Link>

                <button
                  onClick={() => handleOpenEditModal(b)}
                  className="px-3 py-1.5 bg-[#1C2E26]/10 text-[#1C2E26] hover:bg-[#1C2E26] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">edit</span> Edit &amp; SEO
                </button>

                {deleteConfirmId === b.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(b.id)}
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
                    onClick={() => setDeleteConfirmId(b.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Article"
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
                    {editingBlog ? 'edit_note' : 'post_add'}
                  </span>
                  {editingBlog ? 'Edit Blog Article & SEO' : 'Create New Blog Article'}
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Configure article content and search engine optimization parameters.
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
                <span className="material-symbols-outlined text-base">article</span>
                1. Article Content &amp; Media
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
                        Article Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. 10 Benefits of Daily Panchakarma Therapy"
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
                        placeholder="e.g. 10-benefits-panchakarma-therapy"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Ayurveda & Wellness"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        placeholder="e.g. Swami Yogananda Saraswati"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Short Excerpt *
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief article snippet for search results and blog listings..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Full Article Body *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write full article markdown or text content..."
                      rows={8}
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
                      Custom SEO parameters override default titles, descriptions, and social share previews on Google, WhatsApp, Facebook, and Twitter.
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
                      placeholder={formData.excerpt || 'Concise description for Google search snippets...'}
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
                        placeholder="panchakarma, ayurveda, yoga retreat, rishikesh"
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
                        placeholder="https://indiayogatourism.com/blog/..."
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
                        placeholder={formData.coverImage || 'https://...'}
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
                      placeholder={formData.metaDescription || formData.excerpt}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
                    />
                  </div>

                  <hr className="border-gray-200 my-2" />

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Custom HTML SEO Tags (Raw Meta & Script Tags)
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
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 text-[#1C2E26] rounded focus:ring-[#1C2E26]"
                    />
                    <label htmlFor="published" className="text-xs font-bold text-[#1C2E26]">
                      Publish this article immediately (visible on public website)
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
                  {editingBlog ? 'Save Article & SEO' : 'Publish Article'}
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
                  Bulk Upload Blog Articles (JSON / CSV)
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Import multiple blog posts, wellness guides, and articles at once.
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
                    Download our formatted JSON structure to see exact key requirements (title, slug, excerpt, content, category, SEO).
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
                  placeholder='[&#10;  {&#10;    "title": "Science of Panchakarma Detox",&#10;    "slug": "science-of-panchakarma-detox",&#10;    "category": "Ayurveda & Wellness",&#10;    "excerpt": "Brief snippet...",&#10;    "content": "Full article body...",&#10;    "published": true&#10;  }&#10;]'
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
                  Import Articles Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
