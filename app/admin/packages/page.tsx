'use client'

import React, { useState, useEffect } from 'react'
import { LiveCatalogList, PackageItem } from '@/components/admin/LiveCatalogList'
import { Upload, Search, PlusCircle, Check, Loader2 } from 'lucide-react'

export default function AdminPackagesPage() {
  const [programmes, setProgrammes] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showSeoSection, setShowSeoSection] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    durationDays: 14,
    priceShared: 1499,
    featuredImage: '',
    shortDescription: '',
    inclusions: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    customHtmlTags: '',
  })

  const fetchProgrammes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/packages/update')
      const data = await res.json()
      if (data.success && Array.isArray(data.packages)) {
        setProgrammes(data.packages)
      }
    } catch (err) {
      console.error('Error fetching programmes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgrammes()
  }, [])

  // Auto generate slug from title
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
        setFormData((prev) => ({ ...prev, featuredImage: data.url }))
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.shortDescription) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/packages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          durationDays: Number(formData.durationDays),
          durationNights: Number(formData.durationDays),
          priceShared: Number(formData.priceShared),
          pricePrivate: Number(formData.priceShared) * 1.5,
          featuredImage: formData.featuredImage,
          shortDescription: formData.shortDescription,
          description: formData.shortDescription,
          inclusions: formData.inclusions.split('\n').map((s) => s.trim()).filter(Boolean),
          highlights: formData.inclusions.split('\n').map((s) => s.trim()).filter(Boolean),
          category: 'PROGRAMME',
          location: 'Rishikesh, Himalayas',
          locationTag: 'Himalayan Retreat',
          status: 'PUBLISHED',
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
          canonicalUrl: formData.canonicalUrl,
          ogTitle: formData.ogTitle,
          ogDescription: formData.ogDescription,
          ogImage: formData.ogImage,
          customHtmlTags: formData.customHtmlTags,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setFormData({
          title: '',
          slug: '',
          durationDays: 14,
          priceShared: 1499,
          featuredImage: '',
          shortDescription: '',
          inclusions: '',
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          canonicalUrl: '',
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          customHtmlTags: '',
        })
        setShowSeoSection(false)
        fetchProgrammes()
      } else {
        alert(data.error || 'Failed to create programme')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating programme')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2E26]">Programmes &amp; Retreats CMS</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage Ayurvedic clinical programs, retreat offerings, and search engine SEO metadata.
          </p>
        </div>
      </div>

      {/* Add New Programme Form with Full SEO and Device Upload */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-[#1C2E26]">Add New Programme / Retreat</h2>
            <p className="text-xs text-gray-500">Configure programme details, cover image upload, and search engine SEO metadata.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSeoSection(!showSeoSection)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showSeoSection
                ? 'bg-[#1C2E26] text-[#E2C799]'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm">manage_search</span>
            {showSeoSection ? 'Hide SEO Fields' : '+ Add SEO & Custom HTML Tags'}
          </button>
        </div>

        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Programme Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Panchakarma Clinical Detoxification"
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">Slug (URL)</label>
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
                placeholder="e.g. panchakarma-clinical-detoxification"
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Duration (Days)</label>
              <input
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Starting Price (USD)</label>
              <input
                type="number"
                value={formData.priceShared}
                onChange={(e) => setFormData({ ...formData, priceShared: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
              />
            </div>

            {/* Device File Upload & Image URL */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-gray-700 block">
                Featured Cover Image (Upload from Device or Paste URL)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                />
                <label className="px-4 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-lg text-xs hover:bg-[#253e34] transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Choose Device File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDeviceImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              {formData.featuredImage && (
                <div className="flex items-center gap-2 pt-1">
                  <img src={formData.featuredImage} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-200" />
                  <span className="text-[11px] text-emerald-800 font-bold">Cover image attached</span>
                </div>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-gray-700">Description *</label>
              <textarea
                required
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="The ultimate Ayurvedic body purification and cellular recovery program..."
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-gray-700">Inclusions (One per line)</label>
              <textarea
                rows={3}
                value={formData.inclusions}
                onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                placeholder="Personal Ayurveda Physician consultation&#10;Dual therapist Abhyanga massage daily&#10;Tailored Sattvic herbal diet plan"
                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
              />
            </div>
          </div>

          {/* SEO & Meta Tags Section (Collapsible / Toggleable) */}
          {showSeoSection && (
            <div className="pt-4 border-t border-gray-200 space-y-4 animate-fade-in">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">manage_search</span>
                  Programme Search Engine Optimization (SEO) &amp; Social Meta Tags
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Custom SEO parameters override default title tags, descriptions, OpenGraph social shares, and custom HTML meta/script tags for this programme.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">SEO Meta Title (Title Tag)</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder={formData.title || 'Page title for Google search...'}
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Canonical URL</label>
                  <input
                    type="url"
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    placeholder={`https://indiayogatourism.com/packages/${formData.slug}`}
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder={formData.shortDescription || 'Concise description for Google search snippets...'}
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    placeholder="panchakarma, retreat, rishikesh, ayurveda"
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">OG Title</label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                    placeholder={formData.metaTitle || formData.title}
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">OG Image URL</label>
                  <input
                    type="url"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    placeholder={formData.featuredImage || 'https://...'}
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">OG Description</label>
                  <input
                    type="text"
                    value={formData.ogDescription}
                    onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                    placeholder={formData.metaDescription || formData.shortDescription}
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  Custom HTML SEO Tags (Raw Meta &amp; Script Tags)
                </label>
                <p className="text-[11px] text-gray-500 mb-1">
                  Paste raw HTML tags like &lt;meta name="..." content="..." /&gt;, JSON-LD &lt;script type="application/ld+json"&gt;, or Google site verification tags.
                </p>
                <textarea
                  rows={4}
                  value={formData.customHtmlTags}
                  onChange={(e) => setFormData({ ...formData, customHtmlTags: e.target.value })}
                  placeholder='<meta name="robots" content="index, follow" />&#10;<script type="application/ld+json">...</script>'
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26] font-mono text-xs"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSeoSection(!showSeoSection)}
              className="text-xs font-bold text-[#1C2E26] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">
                {showSeoSection ? 'expand_less' : 'add'}
              </span>
              {showSeoSection ? 'Hide SEO Details' : '+ Click to add SEO Meta &amp; Custom HTML Tags'}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1C2E26] text-[#E2C799] px-6 py-2.5 rounded-xl font-bold hover:bg-[#253e34] transition-colors cursor-pointer flex items-center gap-2 shadow-md shrink-0"
            >
              {submitting && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
              <span>Publish Programme &amp; SEO</span>
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Live Catalog List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-black/5">
          <span className="material-symbols-outlined text-3xl text-[#1C2E26] animate-spin mb-2">sync</span>
          <p className="text-xs font-bold text-[#1C2E26]">Loading Catalog...</p>
        </div>
      ) : (
        <LiveCatalogList initialPackages={programmes} />
      )}
    </div>
  )
}
