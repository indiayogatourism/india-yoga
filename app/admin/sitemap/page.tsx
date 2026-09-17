import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { SitemapConfig, SitemapCustomItem } from '@/lib/sitemap-helper'
import { HtmlCodeEditor } from '@/components/admin/HtmlCodeEditor'
import {
  Network,
  Check,
  Copy,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Code,
  Sliders,
  Globe,
  CheckCircle,
  FileCode,
} from 'lucide-react'

export default function AdminSitemapPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [config, setConfig] = useState<SitemapConfig>({
    baseUrl: 'https://indiayogatourism.com',
    includeStatic: true,
    includePackages: true,
    includeBlogs: true,
    includePages: true,
    includeClasses: true,
  })

  const [customUrls, setCustomUrls] = useState<SitemapCustomItem[]>([])
  const [totalUrls, setTotalUrls] = useState<number>(0)
  const [xmlPreview, setXmlPreview] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'rules' | 'custom' | 'xml'>('rules')

  // Form for adding new custom URL
  const [newUrl, setNewUrl] = useState('')
  const [newPriority, setNewPriority] = useState<number>(0.8)
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly')

  const fetchSitemapData = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/sitemap')
      const data = await res.json()

      if (res.ok && data.success) {
        setConfig(data.config)
        setCustomUrls(data.customUrls || [])
        setTotalUrls(data.totalUrls || 0)
        setXmlPreview(data.xmlPreview || '')
      } else {
        throw new Error(data.error || 'Failed to load sitemap configuration')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching sitemap data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSitemapData()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/admin/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          customUrls,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg('Sitemap configuration saved successfully! Strict XML updated.')
        setConfig(data.config)
        setCustomUrls(data.customUrls || [])
        setTotalUrls(data.totalUrls || 0)
        setXmlPreview(data.xmlPreview || '')
        setTimeout(() => setSuccessMsg(null), 4000)
      } else {
        throw new Error(data.error || 'Failed to save sitemap settings')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCustomUrl = () => {
    if (!newUrl.trim()) return
    const newItem: SitemapCustomItem = {
      id: `custom_${Date.now()}`,
      url: newUrl.trim(),
      priority: Number(newPriority) || 0.8,
      changefreq: newFreq,
      enabled: true,
      lastmod: new Date().toISOString(),
    }
    setCustomUrls([...customUrls, newItem])
    setNewUrl('')
  }

  const handleRemoveCustomUrl = (id: string) => {
    setCustomUrls(customUrls.filter((item) => item.id !== id))
  }

  const handleToggleCustomUrl = (id: string) => {
    setCustomUrls(
      customUrls.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    )
  }

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlPreview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadXml = () => {
    const blob = new Blob([xmlPreview], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sitemap.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Strict XML Sitemap 0.9
            </span>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-bold text-[11px] rounded-full uppercase tracking-wider">
              {totalUrls} Total URLs
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1C2E26]">Sitemap Manager &amp; XML Generator</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage search engine indexing, custom URLs, priorities, and generate strict standard XML format for Googlebot &amp; Bing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#1C2E26] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Open /sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-4 py-2.5 bg-[#E2C799] text-[#1C2E26] rounded-xl text-xs font-bold hover:bg-[#d8ba86] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Sitemap Settings'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-bold animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Indexed URLs</span>
          <span className="text-2xl font-bold text-[#1C2E26]">{loading ? '...' : totalUrls}</span>
          <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">Strict XML 0.9 Protocol</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Base Site Domain</span>
          <span className="text-xs font-mono font-bold text-gray-800 truncate block mt-1">{config.baseUrl}</span>
          <span className="text-[11px] text-gray-500 block">Canonical URL Origin</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Custom Rules</span>
          <span className="text-2xl font-bold text-[#1C2E26]">{customUrls.length}</span>
          <span className="text-[11px] text-gray-500 block">Admin Added URLs</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-black/5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Format Standard</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 w-fit">
            Content-Type: application/xml
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Auto-Discovery &amp; Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'custom'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Custom Added URLs ({customUrls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('xml')}
          className={`px-5 py-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'xml'
              ? 'border-[#1C2E26] text-[#1C2E26]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Live Strict XML Inspector</span>
        </button>
      </div>

      {/* TAB 1: Auto-Discovery & Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#1C2E26]">Dynamic Sitemap Auto-Discovery Rules</h2>
          <p className="text-xs text-gray-500">
            Select which resource categories from your database should be automatically included in the XML sitemap when updated.
          </p>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-xs text-gray-700 block">Site Base URL (Protocol + Domain)</label>
              <input
                type="url"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://indiayogatourism.com"
                className="w-full md:w-1/2 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#1C2E26]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {/* Option 1: Core Static Pages */}
              <label className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3 cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeStatic}
                  onChange={(e) => setConfig({ ...config, includeStatic: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#1C2E26] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Core Static Pages</span>
                  <span className="text-[11px] text-gray-500 block">
                    Include /, /packages, /programmes, /online-classes, /blog, /gallery, /about, /contact, /faqs
                  </span>
                </div>
              </label>

              {/* Option 2: Published Retreat Packages */}
              <label className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3 cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includePackages}
                  onChange={(e) => setConfig({ ...config, includePackages: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#1C2E26] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Retreat &amp; Clinical Programmes</span>
                  <span className="text-[11px] text-gray-500 block">
                    Include all active published packages (`/packages/[slug]`)
                  </span>
                </div>
              </label>

              {/* Option 3: Published Blog Posts */}
              <label className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3 cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeBlogs}
                  onChange={(e) => setConfig({ ...config, includeBlogs: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#1C2E26] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Blog Posts &amp; Articles</span>
                  <span className="text-[11px] text-gray-500 block">
                    Include all published blog posts (`/blog/[slug]`)
                  </span>
                </div>
              </label>

              {/* Option 4: Custom CMS Pages */}
              <label className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3 cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includePages}
                  onChange={(e) => setConfig({ ...config, includePages: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#1C2E26] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Custom CMS Pages</span>
                  <span className="text-[11px] text-gray-500 block">
                    Include dynamic custom pages (`/[slug]`)
                  </span>
                </div>
              </label>

              {/* Option 5: Online Stream Classes */}
              <label className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3 cursor-pointer hover:border-emerald-500 transition-colors md:col-span-2">
                <input
                  type="checkbox"
                  checked={config.includeClasses}
                  onChange={(e) => setConfig({ ...config, includeClasses: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-[#1C2E26] focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-gray-800 block">Online Stream Live Classes</span>
                  <span className="text-[11px] text-gray-500 block">
                    Include published online classes (`/online-classes/[slug]`)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Custom Added URLs */}
      {activeTab === 'custom' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1C2E26]">Custom Additional Sitemap URLs</h2>
              <p className="text-xs text-gray-500">
                Manually add landing pages, external links, or specific URLs to force index in your strict XML sitemap.
              </p>
            </div>
          </div>

          {/* Add New Custom URL Form */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
            <span className="text-xs font-bold text-emerald-900 block uppercase tracking-wider">
              Add New Custom URL Entry
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="/custom-landing-page or https://..."
                className="sm:col-span-6 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#1C2E26] bg-white"
              />

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                className="sm:col-span-2 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#1C2E26] bg-white font-bold"
              >
                <option value={1.0}>Priority 1.0 (Highest)</option>
                <option value={0.9}>Priority 0.9</option>
                <option value={0.8}>Priority 0.8</option>
                <option value={0.7}>Priority 0.7</option>
                <option value={0.5}>Priority 0.5 (Default)</option>
                <option value={0.3}>Priority 0.3</option>
              </select>

              <select
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value as any)}
                className="sm:col-span-2 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:border-[#1C2E26] bg-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              <button
                type="button"
                onClick={handleAddCustomUrl}
                className="sm:col-span-2 px-4 py-2.5 bg-[#1C2E26] text-white text-xs font-bold rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>
          </div>

          {/* Table of Custom URLs */}
          {customUrls.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Target URL</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Change Freq</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {customUrls.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleCustomUrl(item.id)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            item.enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {item.enabled ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-3 font-semibold text-gray-800">{item.url}</td>
                      <td className="p-3 text-gray-600 font-bold">{item.priority.toFixed(1)}</td>
                      <td className="p-3 text-gray-600 capitalize">{item.changefreq}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomUrl(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 font-bold"
                          title="Delete Custom URL"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold">No custom URLs added yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">Use the form above to add extra landing pages or external URLs to your strict XML sitemap.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Interactive XML & HTML Code Editor */}
      {activeTab === 'xml' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-black/5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1C2E26]">Interactive Strict XML &amp; Custom HTML Editor</h2>
              <p className="text-xs text-gray-500">
                Directly view, edit, format, or insert custom raw XML/HTML markup into your sitemap payload.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyXml}
                className="px-3.5 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied XML!' : 'Copy XML'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadXml}
                className="px-3.5 py-2 bg-[#1C2E26] text-white rounded-lg text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download sitemap.xml</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor for Custom XML Override */}
          <div className="space-y-3">
            <label className="font-bold text-xs text-gray-800 uppercase tracking-wider block">
              Custom Raw XML / HTML Snippet Override
            </label>
            <p className="text-xs text-gray-500">
              Type or paste extra raw XML <code className="bg-gray-100 px-1 py-0.5 rounded text-emerald-800">&lt;url&gt;...&lt;/url&gt;</code> nodes or custom HTML comments to inject directly into the strict XML output.
            </p>
            <HtmlCodeEditor
              value={config.customXml || ''}
              onChange={(val) => setConfig({ ...config, customXml: val })}
              label="Custom Raw Sitemap XML Editor"
              placeholder="<!-- Add custom sitemap XML nodes here -->&#10;<url>&#10;  <loc>https://indiayogatourism.com/custom-page</loc>&#10;  <lastmod>2026-09-17T00:00:00Z</lastmod>&#10;  <changefreq>daily</changefreq>&#10;  <priority>1.0</priority>&#10;</url>"
              height="250px"
              mode="xml"
            />
          </div>

          {/* Live Compiled Strict XML Output */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="font-bold text-xs text-gray-800 uppercase tracking-wider block">
              Live Compiled Strict XML Output Preview
            </label>
            <HtmlCodeEditor
              value={xmlPreview}
              onChange={() => {}}
              label="Live /sitemap.xml Output Inspector"
              height="350px"
              readOnly={true}
              mode="xml"
            />
          </div>
        </div>
      )}
    </div>
  )
}
