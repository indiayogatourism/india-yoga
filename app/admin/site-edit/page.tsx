'use client'

import React, { useState, useEffect } from 'react'

export interface DestinationItem {
  id: string
  name: string
  subtitle: string
  locationQuery: string
  icon: string
}

interface SiteConfigData {
  siteName: string
  siteTagline: string
  announcementText: string
  heroTitle: string
  heroSubtitle: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
  officeAddress: string
  footerText: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  canonicalUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  customHtmlTags: string
}

const defaultDestinations: DestinationItem[] = [
  { id: '1', name: 'Rishikesh', subtitle: 'Yoga Capital of the World', locationQuery: 'Rishikesh', icon: 'landscape' },
  { id: '2', name: 'Kerala', subtitle: 'Traditional Ayurvedic Sanctuary', locationQuery: 'Kerala', icon: 'spa' },
  { id: '3', name: 'Dharamshala', subtitle: 'Peace in the Himalayan foothills', locationQuery: 'Dharamshala', icon: 'filter_drama' },
]

export default function AdminSiteEditPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'seo' | 'scripts' | 'destinations'>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState<SiteConfigData>({
    siteName: 'India Yoga Tourism',
    siteTagline: 'Ancient Wisdom. Modern Journey.',
    announcementText: '✦ Join Rishikesh Yoga Masters Live Stream ✦',
    heroTitle: 'Immerse in Authentic Himalayan Healing',
    heroSubtitle: 'Traditional Ashram practice, Panchakarma detoxification, and spiritual retreats in Rishikesh.',
    contactEmail: 'info@indiayogatourism.com',
    contactPhone: '+91 99998 76349',
    whatsappNumber: '+91 99998 76349',
    officeAddress: 'Cloud 9 Tower, Sec-1, Ghaziabad, UP 201010',
    footerText: '© 2026 India Yoga Tourism. All rights reserved.',
    metaTitle: 'India Yoga Tourism | Authentic Rishikesh Retreats & Online Classes',
    metaDescription: 'Discover authentic Panchakarma detoxification, Ayurvedic retreats, and live stream online classes with certified masters in Rishikesh.',
    metaKeywords: 'yoga retreats, panchakarma rishikesh, ayurveda detox, online yoga classes',
    canonicalUrl: 'https://indiayogatourism.com',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    customHtmlTags: '',
  })

  // Destinations List State
  const [destinations, setDestinations] = useState<DestinationItem[]>(defaultDestinations)
  
  // Destination Modal / Add Form State
  const [editingDestId, setEditingDestId] = useState<string | null>(null)
  const [destForm, setDestForm] = useState<DestinationItem>({
    id: '',
    name: '',
    subtitle: '',
    locationQuery: '',
    icon: 'landscape',
  })
  const [isDestModalOpen, setIsDestModalOpen] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true)
      try {
        const res = await fetch('/api/site-config')
        const data = await res.json()
        if (data.success && data.config) {
          setFormData({
            siteName: data.config.siteName || 'India Yoga Tourism',
            siteTagline: data.config.siteTagline || '',
            announcementText: data.config.announcementText || '',
            heroTitle: data.config.heroTitle || '',
            heroSubtitle: data.config.heroSubtitle || '',
            contactEmail: data.config.contactEmail || '',
            contactPhone: data.config.contactPhone || '',
            whatsappNumber: data.config.whatsappNumber || '',
            officeAddress: data.config.officeAddress || '',
            footerText: data.config.footerText || '',
            metaTitle: data.config.metaTitle || '',
            metaDescription: data.config.metaDescription || '',
            metaKeywords: data.config.metaKeywords || '',
            canonicalUrl: data.config.canonicalUrl || '',
            ogTitle: data.config.ogTitle || '',
            ogDescription: data.config.ogDescription || '',
            ogImage: data.config.ogImage || '',
            customHtmlTags: data.config.customHtmlTags || '',
          })

          if (data.config.destinationsJson) {
            try {
              const parsed = JSON.parse(data.config.destinationsJson)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setDestinations(parsed)
              }
            } catch (e) {
              console.error('Error parsing destinationsJson:', e)
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching site config:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    setErrorMsg(null)

    try {
      const payload = {
        ...formData,
        destinationsJson: JSON.stringify(destinations),
      }

      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 4000)
      } else {
        setErrorMsg(data.error || 'Failed to update site configuration')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating site settings')
    } finally {
      setSaving(false)
    }
  }

  // --- Destination CRUD Handlers ---
  const handleOpenAddDest = () => {
    setEditingDestId(null)
    setDestForm({
      id: Date.now().toString(),
      name: '',
      subtitle: '',
      locationQuery: '',
      icon: 'landscape',
    })
    setIsDestModalOpen(true)
  }

  const handleOpenEditDest = (item: DestinationItem) => {
    setEditingDestId(item.id)
    setDestForm(item)
    setIsDestModalOpen(true)
  }

  const handleSaveDest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destForm.name) return

    const cleanLocation = destForm.locationQuery || destForm.name

    if (editingDestId) {
      setDestinations((prev) =>
        prev.map((d) => (d.id === editingDestId ? { ...destForm, locationQuery: cleanLocation } : d))
      )
    } else {
      setDestinations((prev) => [...prev, { ...destForm, locationQuery: cleanLocation }])
    }
    setIsDestModalOpen(false)
  }

  const handleDeleteDest = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id))
  }

  if (loading) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
        <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin mb-2">
          sync
        </span>
        <p className="text-sm font-bold text-[#1C2E26]">Loading Site Settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1C2E26]">Site Edit &amp; Global Settings</h2>
          <p className="text-xs text-gray-500 mt-1">
            Customize branding, contact information, retreat cities, global SEO meta tags, and head tracking scripts.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <span className="material-symbols-outlined text-base animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-base">save</span>
          )}
          Save Site Settings
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-emerald-700">check_circle</span>
          Site configuration and retreat cities updated successfully!
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-red-700">error</span>
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">storefront</span>
          1. Branding &amp; Hero Banner
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">help</span>
          2. Contact &amp; Support Info
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('destinations')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'destinations'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">location_city</span>
          3. Retreat Cities &amp; Destinations
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'seo'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">travel_explore</span>
          4. Global SEO &amp; Social Meta
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scripts')}
          className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'scripts'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">code</span>
          5. Global Scripts &amp; HTML Tags
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b-2xl border border-t-0 border-black/5 shadow-sm space-y-6 text-left">
        {/* Tab 1: General Branding */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={formData.siteTagline}
                  onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                  placeholder="e.g. Ancient Wisdom. Modern Journey."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Announcement Banner Text
              </label>
              <input
                type="text"
                value={formData.announcementText}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                placeholder="e.g. ✦ Join Rishikesh Yoga Masters Live Stream ✦"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Homepage Hero Heading Title
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                placeholder="e.g. Immerse in Authentic Himalayan Healing"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Homepage Hero Subtitle
              </label>
              <textarea
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                placeholder="e.g. Traditional Ashram practice, Panchakarma detoxification, and spiritual retreats in Rishikesh."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                placeholder="e.g. © 2026 India Yoga Tourism. All rights reserved."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Contact Info */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Primary Inquiry Email *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="e.g. info@indiayogatourism.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Customer inquiries will be sent directly to this admin email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="e.g. +91 99998 76349"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="e.g. +91 99998 76349"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  placeholder="e.g. Cloud 9 Tower, Sec-1, Ghaziabad, UP 201010"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Retreat Cities & Destinations Manager */}
        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div>
                <h4 className="font-bold text-xs uppercase text-emerald-900 tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">location_city</span>
                  Retreat Cities Navigation Setup
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  These cities appear in the "Retreats" dropdown menu on the website header and footer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddDest}
                className="px-4 py-2 bg-[#1C2E26] text-[#E2C799] font-bold text-xs rounded-xl hover:bg-[#253e34] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add Retreat City
              </button>
            </div>

            {/* List of Destinations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#1C2E26] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#1C2E26]/10 flex items-center justify-center text-[#1C2E26]">
                        <span className="material-symbols-outlined text-xl">{dest.icon || 'landscape'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        Query: {dest.locationQuery}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#1C2E26]">{dest.name}</h4>
                      <p className="text-xs text-gray-500">{dest.subtitle}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDest(dest)}
                      className="px-3 py-1 bg-[#1C2E26]/10 text-[#1C2E26] hover:bg-[#1C2E26] hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDest(dest.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete City"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Global SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Default Title Tag (Meta Title)
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="e.g. India Yoga Tourism | Authentic Rishikesh Retreats"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Default Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="e.g. Discover authentic Panchakarma detoxification, Ayurvedic retreats, and live stream online classes..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Default Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="yoga retreats, panchakarma rishikesh, ayurveda detox"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Default Canonical URL
                </label>
                <input
                  type="url"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://indiayogatourism.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>
            </div>

            <hr className="border-gray-200 my-2" />

            <h4 className="font-bold text-xs uppercase text-gray-500 tracking-wider">
              Social Share Meta (OpenGraph)
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
                  placeholder={formData.metaTitle || formData.siteName}
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
          </div>
        )}

        {/* Tab 5: Custom HTML Scripts */}
        {activeTab === 'scripts' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-base">code</span>
                Global Head Code Injection (Google Tag Manager, Meta Pixel)
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Paste raw HTML script and meta tags. These will be rendered inside the global HTML &lt;head&gt; element across all pages.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Custom HTML Head Code
              </label>
              <textarea
                value={formData.customHtmlTags}
                onChange={(e) => setFormData({ ...formData, customHtmlTags: e.target.value })}
                placeholder='<!-- Google Tag Manager -->&#10;<script>(function(w,d,s,l,i)...)</script>'
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-base">save</span>
            )}
            Save Site Settings
          </button>
        </div>
      </form>

      {/* Add / Edit Destination Modal */}
      {isDestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col text-left">
            <div className="bg-[#1C2E26] text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-base text-[#E2C799] flex items-center gap-2">
                  <span className="material-symbols-outlined">location_city</span>
                  {editingDestId ? 'Edit Retreat City' : 'Add New Retreat City'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveDest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  City / Destination Name *
                </label>
                <input
                  type="text"
                  value={destForm.name}
                  onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                  placeholder="e.g. Rishikesh, Kerala, Dharamshala, Goa"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Subtitle / Short Tagline *
                </label>
                <input
                  type="text"
                  value={destForm.subtitle}
                  onChange={(e) => setDestForm({ ...destForm, subtitle: e.target.value })}
                  placeholder="e.g. Yoga Capital of the World"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Package Search Location Tag
                </label>
                <input
                  type="text"
                  value={destForm.locationQuery}
                  onChange={(e) => setDestForm({ ...destForm, locationQuery: e.target.value })}
                  placeholder="e.g. Rishikesh (used in /packages?location=Rishikesh)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Material Symbol Icon Name
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={destForm.icon}
                    onChange={(e) => setDestForm({ ...destForm, icon: e.target.value })}
                    placeholder="e.g. landscape, spa, filter_drama, water, wb_sunny"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  />
                  <div className="w-10 h-10 rounded-xl bg-[#1C2E26]/10 flex items-center justify-center text-[#1C2E26] shrink-0">
                    <span className="material-symbols-outlined text-xl">{destForm.icon || 'landscape'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDestModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors shadow-md cursor-pointer"
                >
                  {editingDestId ? 'Save Changes' : 'Add City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
