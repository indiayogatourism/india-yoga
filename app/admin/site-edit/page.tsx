'use client'

import React, { useState, useEffect } from 'react'

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

export default function AdminSiteEditPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'seo' | 'scripts'>('general')
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
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (data.success) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 4000)
      } else {
        setErrorMsg(data.error || 'Failed to save site settings')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating site config')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-black/5 shadow-sm space-y-3">
        <span className="material-symbols-outlined text-4xl text-[#1C2E26] animate-spin">sync</span>
        <p className="text-sm font-bold text-[#1C2E26]">Loading Site Settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2E26]">Site Edit &amp; Global Settings</h1>
          <p className="text-xs text-gray-500 mt-1">
            Customize site branding, contact information, global SEO meta tags, and head tracking scripts.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors flex items-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          {saving && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
          <span className="material-symbols-outlined text-base">save</span>
          Save Site Settings
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
          Site settings saved and updated successfully across the platform!
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-red-600">error</span>
          {errorMsg}
        </div>
      )}

      {/* Main Settings Card with Tabs */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 bg-gray-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'border-[#1C2E26] text-[#1C2E26] bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            1. Branding &amp; Hero Banner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'border-[#1C2E26] text-[#1C2E26] bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">contact_support</span>
            2. Contact &amp; Support Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'seo'
                ? 'border-[#1C2E26] text-[#1C2E26] bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">travel_explore</span>
            3. Global SEO &amp; Social Meta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scripts')}
            className={`py-3.5 px-5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'scripts'
                ? 'border-[#1C2E26] text-[#1C2E26] bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">code</span>
            4. Global Scripts &amp; HTML Tags
          </button>
        </div>

        {/* Tab Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* TAB 1: General Branding */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Platform / Site Name *
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    placeholder="India Yoga Tourism"
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
                    placeholder="Ancient Wisdom. Modern Journey."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Header Announcement Bar Text
                </label>
                <input
                  type="text"
                  value={formData.announcementText}
                  onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                  placeholder="✦ Join Rishikesh Yoga Masters Live Stream ✦"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Homepage Hero Headline
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  placeholder="Immerse in Authentic Himalayan Healing"
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
                  rows={2}
                  placeholder="Traditional Ashram practice, Panchakarma detoxification, and spiritual retreats in Rishikesh."
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
                  placeholder="© 2026 India Yoga Tourism. All rights reserved."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Contact & Location Info */}
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
                    placeholder="info@indiayogatourism.com"
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
                    placeholder="+91 99998 76349"
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
                    placeholder="+91 99998 76349"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none font-mono"
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
                    placeholder="Cloud 9 Tower, Sec-1, Ghaziabad, UP 201010"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Global SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">public</span>
                  Global Website Search Engine Optimization (SEO)
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  These metadata parameters apply globally across the platform whenever page-specific metadata is not explicitly defined.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Global Meta Title (Title Tag)
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="India Yoga Tourism | Authentic Rishikesh Retreats & Online Classes"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Global Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  placeholder="Discover authentic Panchakarma detoxification, Ayurvedic retreats, and live stream online classes with certified masters in Rishikesh."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Global Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    placeholder="yoga retreats, panchakarma rishikesh, ayurveda detox, online yoga classes"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Canonical Domain URL
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
                Default Social Sharing (OpenGraph)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    OG Social Title
                  </label>
                  <input
                    type="text"
                    value={formData.ogTitle}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                    placeholder={formData.metaTitle}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    OG Preview Image URL
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
                  OG Social Description
                </label>
                <textarea
                  value={formData.ogDescription}
                  onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                  rows={2}
                  placeholder={formData.metaDescription}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1C2E26] focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Custom HTML & Script Tags */}
          {activeTab === 'scripts' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">integration_instructions</span>
                  Global HTML Head Injection &amp; Tracking Scripts
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Paste site-wide HTML tags like Google Tag Manager (GTM), Google Analytics, Meta Pixel, site verification meta tags, or custom CSS styling rules.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Global Custom HTML &amp; Script Tags (Raw Head Injection)
                </label>
                <textarea
                  value={formData.customHtmlTags}
                  onChange={(e) => setFormData({ ...formData, customHtmlTags: e.target.value })}
                  rows={8}
                  placeholder='<!-- Google Tag Manager -->&#10;<script>(function(w,d,s,l,i){...})(window,document,"script","dataLayer","GTM-XXXX");</script>&#10;<meta name="google-site-verification" content="..." />'
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#1C2E26] text-[#E2C799] font-bold text-xs hover:bg-[#253e34] transition-colors shadow-md cursor-pointer flex items-center gap-2"
            >
              {saving && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
              <span className="material-symbols-outlined text-base">save</span>
              Save Site Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
