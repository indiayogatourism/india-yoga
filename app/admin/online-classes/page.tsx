'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface OnlineClassItem {
  id: string
  slug: string
  title: string
  description: string
  timeSlot: string
  level: string
  instructor: string
  meetingUrl?: string
  price: number
  coverImage?: string
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

export default function AdminOnlineClassesPage() {
  const [classes, setClasses] = useState<OnlineClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')
  const [editingClass, setEditingClass] = useState<OnlineClassItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    timeSlot: '07:00 AM - 08:15 AM IST',
    level: 'Beginner to Intermediate',
    instructor: 'Yogini Arundhati',
    meetingUrl: '',
    price: 49,
    coverImage: '',
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

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/online-classes')
      const data = await res.json()
      if (data.success) {
        setClasses(data.classes || [])
      }
    } catch (err) {
      console.error('Error loading online classes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
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

  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const body = new FormData()
      body.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      })
      const data = await res.json()

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, coverImage: data.url }))
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingClass(null)
    setActiveTab('content')
    setFormData({
      title: '',
      slug: '',
      description: '',
      timeSlot: '07:00 AM - 08:15 AM IST',
      level: 'Beginner to Intermediate',
      instructor: 'Yogini Arundhati',
      meetingUrl: '',
      price: 49,
      coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
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

  const handleOpenEditModal = (cls: OnlineClassItem) => {
    setEditingClass(cls)
    setActiveTab('content')
    setFormData({
      title: cls.title,
      slug: cls.slug,
      description: cls.description || '',
      timeSlot: cls.timeSlot || '07:00 AM - 08:15 AM IST',
      level: cls.level || 'Beginner to Intermediate',
      instructor: cls.instructor || 'Yogini Arundhati',
      meetingUrl: cls.meetingUrl || '',
      price: cls.price || 49,
      coverImage: cls.coverImage || '',
      metaTitle: cls.metaTitle || '',
      metaDescription: cls.metaDescription || '',
      metaKeywords: cls.metaKeywords || '',
      canonicalUrl: cls.canonicalUrl || '',
      ogTitle: cls.ogTitle || '',
      ogDescription: cls.ogDescription || '',
      ogImage: cls.ogImage || '',
      customHtmlTags: cls.customHtmlTags || '',
      published: cls.published,
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) return

    setSubmitting(true)
    try {
      if (editingClass) {
        const res = await fetch(`/api/online-classes/${editingClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchClasses()
        }
      } else {
        const res = await fetch('/api/online-classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (data.success) {
          setIsModalOpen(false)
          fetchClasses()
        }
      }
    } catch (err) {
      console.error('Error saving online class:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (cls: OnlineClassItem) => {
    try {
      const res = await fetch(`/api/online-classes/${cls.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !cls.published }),
      })
      const data = await res.json()
      if (data.success) {
        setClasses((prev) =>
          prev.map((c) => (c.id === cls.id ? { ...c, published: !c.published } : c))
        )
      }
    } catch (err) {
      console.error('Error toggling online class status:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/online-classes/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setDeleteConfirmId(null)
        setClasses((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (err) {
      console.error('Error deleting online class:', err)
    }
  }

  const filteredClasses = classes.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.level.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1C2E26]">Online Sanctuary Classes CMS</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage live stream classes, daily schedules, live meeting links, and search engine SEO metadata.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Create Online Class
        </button>
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
          placeholder="Search classes by title, instructor, or difficulty..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1C2E26]"
        />
      </div>

      {/* Classes List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
          <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
            sync
          </span>
          <p className="text-sm font-bold text-[#1C2E26]">Loading Online Classes...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-black/5 space-y-4 max-w-md mx-auto">
          <span className="material-symbols-outlined text-5xl text-gray-300">videocam</span>
          <h3 className="text-lg font-bold text-[#1C2E26]">No Online Classes Found</h3>
          <p className="text-xs text-gray-500">
            Create online sanctuary sessions for global students to join via live stream.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors cursor-pointer"
          >
            Create First Class Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden divide-y divide-gray-100">
          {filteredClasses.map((c) => (
            <div
              key={c.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                {c.coverImage ? (
                  <img
                    src={c.coverImage}
                    alt={c.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">
                    No Image
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2C799] bg-[#1C2E26] px-2.5 py-0.5 rounded-full">
                      {c.level}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.published
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1C2E26] truncate">{c.title}</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {c.timeSlot} • {c.instructor} • ${c.price} USD
                  </p>
                  {c.meetingUrl && (
                    <p className="text-[11px] text-emerald-800 font-semibold truncate flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">videocam</span>
                      {c.meetingUrl}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleTogglePublish(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    c.published
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title={c.published ? 'Unpublish class' : 'Publish class'}
                >
                  <span className="material-symbols-outlined text-xs">
                    {c.published ? 'visibility_off' : 'visibility'}
                  </span>
                  {c.published ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  onClick={() => handleOpenEditModal(c)}
                  className="px-3 py-1.5 bg-[#1C2E26]/10 text-[#1C2E26] hover:bg-[#1C2E26] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">edit</span> Edit &amp; SEO
                </button>

                {deleteConfirmId === c.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(c.id)}
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
                    onClick={() => setDeleteConfirmId(c.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Class"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-black/10 flex flex-col max-h-[90vh]">
            <div className="bg-[#1C2E26] text-white p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    {editingClass ? 'edit_note' : 'video_call'}
                  </span>
                  {editingClass ? 'Edit Online Class & SEO' : 'Create New Online Class'}
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Configure live stream timing, instructor, meeting links, and SEO metadata.
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
                <span className="material-symbols-outlined text-base">videocam</span>
                1. Class Details &amp; Meeting Link
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
                        Class Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Hatha Flow & Alignment"
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
                        placeholder="e.g. hatha-flow-alignment"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Time Slot *
                      </label>
                      <input
                        type="text"
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        placeholder="07:00 AM - 08:15 AM IST"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Difficulty Level
                      </label>
                      <input
                        type="text"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        placeholder="Beginner to Intermediate"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        placeholder="Yogini Arundhati"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Live Stream Join Link (Zoom / Meet)
                      </label>
                      <input
                        type="url"
                        value={formData.meetingUrl}
                        onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                        placeholder="https://zoom.us/j/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                        Pass Price (USD)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Device Image Upload + URL Option */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <label className="block text-xs font-bold uppercase text-gray-700">
                      Cover Image (Upload from Device or Paste URL)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 w-full px-4 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                      />
                      <label className="px-4 py-2 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        {uploadingImage ? 'Uploading...' : 'Choose Device File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDeviceImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    {formData.coverImage && (
                      <div className="flex items-center gap-3 pt-1">
                        <img
                          src={formData.coverImage}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                        />
                        <span className="text-[11px] text-emerald-800 font-semibold truncate">
                          Image uploaded &amp; linked successfully
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Class Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Focuses on holding classical postures combined with deep conscious breathing..."
                      rows={4}
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
                      Online Class SEO Setup
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Custom SEO parameters override default titles, descriptions, and social share previews on search engines for this class.
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
                      placeholder={formData.title || 'Online Yoga Class Title...'}
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
                      placeholder={formData.description}
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
                        placeholder="online yoga, live stream, hatha flow, rishikesh"
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
                        placeholder="https://indiayogatourism.com/online-classes/..."
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
                      placeholder={formData.metaDescription || formData.description}
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
                      Paste raw HTML tags like &lt;meta name="..." content="..." /&gt;, JSON-LD &lt;script type="application/ld+json"&gt;, or tracking tags.
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
                      id="online-published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 text-[#1C2E26] rounded focus:ring-[#1C2E26]"
                    />
                    <label htmlFor="online-published" className="text-xs font-bold text-[#1C2E26]">
                      Publish this class immediately (visible on public website)
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
                  {editingClass ? 'Save Class & SEO' : 'Publish Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
