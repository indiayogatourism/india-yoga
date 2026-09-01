"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, ExternalLink, Trash2, X, Check, Search, Loader2 } from "lucide-react"

export interface PackageItem {
  id: string
  title: string
  slug: string
  shortDescription: string
  durationDays: number
  durationNights: number
  priceShared: number
  pricePrivate: number
  featuredImage: string | null
  inclusions: string[]
  status: string
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string | null
  canonicalUrl?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  customHtmlTags?: string | null
}

interface LiveCatalogListProps {
  initialPackages: PackageItem[]
}

export function LiveCatalogList({ initialPackages }: LiveCatalogListProps) {
  const router = useRouter()
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages)
  const [search, setSearch] = useState("")
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Edit form state
  const [editTitle, setEditTitle] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editDurationDays, setEditDurationDays] = useState(14)
  const [editPriceShared, setEditPriceShared] = useState(1499)
  const [editPricePrivate, setEditPricePrivate] = useState(2199)
  const [editStatus, setEditStatus] = useState("PUBLISHED")
  const [editFeaturedImage, setEditFeaturedImage] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editInclusions, setEditInclusions] = useState("")

  // SEO state
  const [activeTab, setActiveTab] = useState<"details" | "seo">("details")
  const [editMetaTitle, setEditMetaTitle] = useState("")
  const [editMetaDescription, setEditMetaDescription] = useState("")
  const [editMetaKeywords, setEditMetaKeywords] = useState("")
  const [editCanonicalUrl, setEditCanonicalUrl] = useState("")
  const [editOgTitle, setEditOgTitle] = useState("")
  const [editOgDescription, setEditOgDescription] = useState("")
  const [editOgImage, setEditOgImage] = useState("")
  const [editCustomHtmlTags, setEditCustomHtmlTags] = useState("")

  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const body = new FormData()
      body.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      })
      const data = await res.json()

      if (data.success && data.url) {
        setEditFeaturedImage(data.url)
      } else {
        alert(data.error || "Failed to upload image")
      }
    } catch (err: any) {
      alert(err.message || "Image upload failed")
    } finally {
      setUploadingImage(false)
    }
  }

  const openEditModal = (pkg: PackageItem) => {
    setEditingPkg(pkg)
    setActiveTab("details")
    setEditTitle(pkg.title)
    setEditSlug(pkg.slug)
    setEditDurationDays(pkg.durationDays)
    setEditPriceShared(pkg.priceShared)
    setEditPricePrivate(pkg.pricePrivate || pkg.priceShared * 1.5)
    setEditStatus(pkg.status)
    setEditFeaturedImage(pkg.featuredImage || "")
    setEditDescription(pkg.shortDescription || "")
    setEditInclusions(pkg.inclusions ? pkg.inclusions.join("\n") : "")

    setEditMetaTitle(pkg.metaTitle || "")
    setEditMetaDescription(pkg.metaDescription || "")
    setEditMetaKeywords(pkg.metaKeywords || "")
    setEditCanonicalUrl(pkg.canonicalUrl || "")
    setEditOgTitle(pkg.ogTitle || "")
    setEditOgDescription(pkg.ogDescription || "")
    setEditOgImage(pkg.ogImage || "")
    setEditCustomHtmlTags(pkg.customHtmlTags || "")

    setErrorMsg(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPkg) return

    setSaving(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/packages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPkg.id,
          title: editTitle,
          slug: editSlug,
          durationDays: Number(editDurationDays),
          durationNights: Number(editDurationDays),
          priceShared: Number(editPriceShared),
          pricePrivate: Number(editPricePrivate),
          status: editStatus,
          featuredImage: editFeaturedImage,
          shortDescription: editDescription,
          inclusions: editInclusions.split("\n").map((s) => s.trim()).filter(Boolean),
          metaTitle: editMetaTitle,
          metaDescription: editMetaDescription,
          metaKeywords: editMetaKeywords,
          canonicalUrl: editCanonicalUrl,
          ogTitle: editOgTitle,
          ogDescription: editOgDescription,
          ogImage: editOgImage,
          customHtmlTags: editCustomHtmlTags,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update package")
      }

      setPackages((prev) =>
        prev.map((p) => (p.id === editingPkg.id ? { ...p, ...data.package } : p))
      )
      setEditingPkg(null)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (pkg: PackageItem) => {
    const newStatus = pkg.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    try {
      const res = await fetch("/api/packages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pkg.id,
          status: newStatus,
        }),
      })
      if (res.ok) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, status: newStatus } : p))
        )
        router.refresh()
      }
    } catch (err: any) {
      console.error("Failed to toggle programme status:", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this catalogue item?")) return

    setDeletingId(id)
    try {
      const res = await fetch("/api/packages/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete")
      }

      setPackages((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Could not delete package")
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1C2E26]">
            Live Catalog ({filtered.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Connected to live database. Edit packages or view them directly on the main site.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search catalogue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#1C2E26]"
          />
        </div>
      </div>

      {/* Catalog Item List */}
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No programmes found matching search.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                {p.featuredImage ? (
                  <img
                    src={p.featuredImage}
                    alt={p.title}
                    className="w-16 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">
                    No Img
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-[#1C2E26]">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.durationDays} Days • ${p.priceShared} USD
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    p.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : p.status === "DRAFT"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.status}
                </span>

                <div className="flex items-center gap-2">
                  {/* Quick Publish / Unpublish toggle */}
                  <button
                    onClick={() => handleToggleStatus(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      p.status === "PUBLISHED"
                        ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                    }`}
                    title={p.status === "PUBLISHED" ? "Unpublish programme" : "Publish programme"}
                  >
                    {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-[#1C2E26] text-gray-700 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit &amp; SEO</span>
                  </button>

                  {/* View on Main Site Link */}
                  <Link
                    href={`/packages/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-gray-200 hover:border-[#1C2E26] text-[#1C2E26] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Delete catalogue item"
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal Overlay */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-lg text-[#1C2E26]">
                  Edit Programme Catalogue &amp; SEO
                </h3>
                <p className="text-xs text-gray-500">ID: {editingPkg.id}</p>
              </div>
              <button
                onClick={() => setEditingPkg(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-2 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`py-2.5 px-4 text-xs font-bold transition-all cursor-pointer rounded-lg ${
                  activeTab === "details"
                    ? "bg-white text-[#1C2E26] shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                1. Programme Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`py-2.5 px-4 text-xs font-bold transition-all cursor-pointer rounded-lg ${
                  activeTab === "seo"
                    ? "bg-white text-[#1C2E26] shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                2. SEO &amp; HTML Meta Tags
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Programme Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">URL Slug</label>
                      <input
                        type="text"
                        required
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26] font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Duration (Days)</label>
                      <input
                        type="number"
                        required
                        value={editDurationDays}
                        onChange={(e) => setEditDurationDays(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Starting Price (USD)</label>
                      <input
                        type="number"
                        required
                        value={editPriceShared}
                        onChange={(e) => setEditPriceShared(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-gray-700 block">
                        Featured Image (Upload from Device or Paste URL)
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          value={editFeaturedImage}
                          onChange={(e) => setEditFeaturedImage(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                        />
                        <label className="px-4 py-2.5 bg-[#1C2E26] text-white font-bold rounded-lg text-xs hover:bg-black transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs">
                          <span>{uploadingImage ? "Uploading..." : "Upload from Device"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDeviceImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Short Description</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Inclusions (One per line)</label>
                    <textarea
                      rows={4}
                      value={editInclusions}
                      onChange={(e) => setEditInclusions(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <p className="font-bold">Programme SEO Setup</p>
                    <p className="text-[11px] text-emerald-800">
                      Customize search engine titles, descriptions, canonical URLs, and custom HTML meta/script tags for this programme.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Meta Title</label>
                    <input
                      type="text"
                      value={editMetaTitle}
                      onChange={(e) => setEditMetaTitle(e.target.value)}
                      placeholder={editTitle}
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Meta Description</label>
                    <textarea
                      rows={2}
                      value={editMetaDescription}
                      onChange={(e) => setEditMetaDescription(e.target.value)}
                      placeholder={editDescription}
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Meta Keywords</label>
                      <input
                        type="text"
                        value={editMetaKeywords}
                        onChange={(e) => setEditMetaKeywords(e.target.value)}
                        placeholder="panchakarma, retreat, rishikesh"
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Canonical URL</label>
                      <input
                        type="url"
                        value={editCanonicalUrl}
                        onChange={(e) => setEditCanonicalUrl(e.target.value)}
                        placeholder={`https://indiayogatourism.com/packages/${editSlug}`}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">OG Title</label>
                      <input
                        type="text"
                        value={editOgTitle}
                        onChange={(e) => setEditOgTitle(e.target.value)}
                        placeholder={editMetaTitle || editTitle}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">OG Image URL</label>
                      <input
                        type="url"
                        value={editOgImage}
                        onChange={(e) => setEditOgImage(e.target.value)}
                        placeholder={editFeaturedImage}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">OG Description</label>
                    <textarea
                      rows={2}
                      value={editOgDescription}
                      onChange={(e) => setEditOgDescription(e.target.value)}
                      placeholder={editMetaDescription || editDescription}
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Custom HTML SEO Tags (Raw Meta &amp; Script Tags)</label>
                    <p className="text-[11px] text-gray-500">
                      Paste raw HTML tags like &lt;meta name="..." content="..." /&gt; or JSON-LD &lt;script type="application/ld+json"&gt;.
                    </p>
                    <textarea
                      rows={4}
                      value={editCustomHtmlTags}
                      onChange={(e) => setEditCustomHtmlTags(e.target.value)}
                      placeholder='<meta name="robots" content="index, follow" />'
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26] font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={`/packages/${editSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Preview on Main Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPkg(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#1C2E26] hover:bg-black text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
