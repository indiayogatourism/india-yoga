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
  description?: string | null
  category?: string
  location?: string
  locationTag?: string
  durationDays: number
  durationNights: number
  startDate?: string | null
  endDate?: string | null
  upcomingDates?: string[]
  priceDormitory?: number | null
  priceShared: number
  pricePrivate: number
  enableDormitory?: boolean
  enableShared?: boolean
  enablePrivate?: boolean
  originalPrice?: number | null
  maxGroupSize?: number
  difficultyLevel?: string
  featuredImage: string | null
  gallery?: string[]
  highlights?: string[]
  inclusions: string[]
  exclusions?: string[]
  isBestseller?: boolean
  isLimitedSpots?: boolean
  isRecommended?: boolean
  isNew?: boolean
  spotsLeft?: number | null
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
  const [activeTab, setActiveTab] = useState<"details" | "content" | "seo">("details")
  const [editTitle, setEditTitle] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editCategory, setEditCategory] = useState("PROGRAMME")
  const [editStatus, setEditStatus] = useState("PUBLISHED")
  const [editLocation, setEditLocation] = useState("Rishikesh, Himalayas")
  const [editLocationTag, setEditLocationTag] = useState("Himalayan Retreat")
  const [editDurationDays, setEditDurationDays] = useState(14)
  const [editDurationNights, setEditDurationNights] = useState(14)
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")
  const [editUpcomingDates, setEditUpcomingDates] = useState("")
  const [editPriceDormitory, setEditPriceDormitory] = useState<number | "">("")
  const [editPriceShared, setEditPriceShared] = useState(1499)
  const [editPricePrivate, setEditPricePrivate] = useState(2199)
  const [editEnableDormitory, setEditEnableDormitory] = useState(false)
  const [editEnableShared, setEditEnableShared] = useState(true)
  const [editEnablePrivate, setEditEnablePrivate] = useState(true)
  const [editOriginalPrice, setEditOriginalPrice] = useState<number | "">("")
  const [editMaxGroupSize, setEditMaxGroupSize] = useState(12)
  const [editDifficultyLevel, setEditDifficultyLevel] = useState("Beginner")

  const [editShortDescription, setEditShortDescription] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editFeaturedImage, setEditFeaturedImage] = useState("")
  const [editGallery, setEditGallery] = useState("")
  const [editHighlights, setEditHighlights] = useState("")
  const [editInclusions, setEditInclusions] = useState("")
  const [editExclusions, setEditExclusions] = useState("")

  const [editIsBestseller, setEditIsBestseller] = useState(false)
  const [editIsLimitedSpots, setEditIsLimitedSpots] = useState(false)
  const [editIsRecommended, setEditIsRecommended] = useState(false)
  const [editIsNew, setEditIsNew] = useState(false)
  const [editSpotsLeft, setEditSpotsLeft] = useState<number | "">("")

  // SEO state
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
    setEditCategory(pkg.category || "PROGRAMME")
    setEditStatus(pkg.status)
    setEditLocation(pkg.location || "Rishikesh, Himalayas")
    setEditLocationTag(pkg.locationTag || "Himalayan Retreat")
    setEditDurationDays(pkg.durationDays)
    setEditDurationNights(pkg.durationNights || pkg.durationDays)
    setEditStartDate(pkg.startDate || "")
    setEditEndDate(pkg.endDate || "")
    setEditUpcomingDates(pkg.upcomingDates ? pkg.upcomingDates.join("\n") : "")
    setEditPriceDormitory(pkg.priceDormitory ?? "")
    setEditPriceShared(pkg.priceShared)
    setEditPricePrivate(pkg.pricePrivate || pkg.priceShared * 1.5)
    setEditEnableDormitory(pkg.enableDormitory ?? false)
    setEditEnableShared(pkg.enableShared ?? true)
    setEditEnablePrivate(pkg.enablePrivate ?? true)
    setEditOriginalPrice(pkg.originalPrice ?? "")
    setEditMaxGroupSize(pkg.maxGroupSize || 12)
    setEditDifficultyLevel(pkg.difficultyLevel || "Beginner")

    setEditShortDescription(pkg.shortDescription || "")
    setEditDescription(pkg.description || pkg.shortDescription || "")
    setEditFeaturedImage(pkg.featuredImage || "")
    setEditGallery(pkg.gallery ? pkg.gallery.join("\n") : "")
    setEditHighlights(pkg.highlights ? pkg.highlights.join("\n") : "")
    setEditInclusions(pkg.inclusions ? pkg.inclusions.join("\n") : "")
    setEditExclusions(pkg.exclusions ? pkg.exclusions.join("\n") : "")

    setEditIsBestseller(!!pkg.isBestseller)
    setEditIsLimitedSpots(!!pkg.isLimitedSpots)
    setEditIsRecommended(!!pkg.isRecommended)
    setEditIsNew(!!pkg.isNew)
    setEditSpotsLeft(pkg.spotsLeft ?? "")

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
          category: editCategory,
          status: editStatus,
          location: editLocation,
          locationTag: editLocationTag,
          durationDays: Number(editDurationDays),
          durationNights: Number(editDurationNights),
          startDate: editStartDate,
          endDate: editEndDate,
          upcomingDates: editUpcomingDates.split("\n").map((s) => s.trim()).filter(Boolean),
          priceDormitory: editPriceDormitory !== "" ? Number(editPriceDormitory) : null,
          priceShared: Number(editPriceShared),
          pricePrivate: Number(editPricePrivate),
          enableDormitory: editEnableDormitory,
          enableShared: editEnableShared,
          enablePrivate: editEnablePrivate,
          originalPrice: editOriginalPrice !== "" ? Number(editOriginalPrice) : null,
          maxGroupSize: Number(editMaxGroupSize),
          difficultyLevel: editDifficultyLevel,
          shortDescription: editShortDescription,
          description: editDescription,
          featuredImage: editFeaturedImage,
          gallery: editGallery.split("\n").map((s) => s.trim()).filter(Boolean),
          highlights: editHighlights.split("\n").map((s) => s.trim()).filter(Boolean),
          inclusions: editInclusions.split("\n").map((s) => s.trim()).filter(Boolean),
          exclusions: editExclusions.split("\n").map((s) => s.trim()).filter(Boolean),
          isBestseller: editIsBestseller,
          isLimitedSpots: editIsLimitedSpots,
          isRecommended: editIsRecommended,
          isNew: editIsNew,
          spotsLeft: editSpotsLeft !== "" ? Number(editSpotsLeft) : null,
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
                    {p.startDate && <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px]">Start: {p.startDate}</span>}
                    {p.upcomingDates && p.upcomingDates.length > 0 && (
                      <span className="ml-1.5 text-gray-400 font-medium">({p.upcomingDates.length} batch dates)</span>
                    )}
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
            <div className="flex border-b border-gray-200 bg-gray-50 px-2 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`py-2.5 px-4 text-xs font-bold transition-all cursor-pointer rounded-lg shrink-0 ${
                  activeTab === "details"
                    ? "bg-white text-[#1C2E26] shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                1. Basic Info &amp; Pricing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`py-2.5 px-4 text-xs font-bold transition-all cursor-pointer rounded-lg shrink-0 ${
                  activeTab === "content"
                    ? "bg-white text-[#1C2E26] shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                2. Media &amp; Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`py-2.5 px-4 text-xs font-bold transition-all cursor-pointer rounded-lg shrink-0 ${
                  activeTab === "seo"
                    ? "bg-white text-[#1C2E26] shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                3. SEO &amp; Meta Tags
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
                      <label className="font-bold text-gray-700">Programme Title *</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26] font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      >
                        <option value="PROGRAMME">PROGRAMME</option>
                        <option value="RETREAT">RETREAT</option>
                        <option value="TEACHER_TRAINING">TEACHER_TRAINING</option>
                        <option value="TREK">TREK</option>
                        <option value="ONLINE_CLASS">ONLINE_CLASS</option>
                      </select>
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

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Location</label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="e.g. Rishikesh, Himalayas"
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Location Tag / Subtitle</label>
                      <input
                        type="text"
                        value={editLocationTag}
                        onChange={(e) => setEditLocationTag(e.target.value)}
                        placeholder="e.g. Himalayan Retreat"
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
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
                      <label className="font-bold text-gray-700">Duration (Nights)</label>
                      <input
                        type="number"
                        required
                        value={editDurationNights}
                        onChange={(e) => setEditDurationNights(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Retreat Start Date</label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Retreat End Date</label>
                      <input
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-gray-700">Upcoming Retreat Batches / Available Dates (One per line)</label>
                      <textarea
                        rows={3}
                        value={editUpcomingDates}
                        onChange={(e) => setEditUpcomingDates(e.target.value)}
                        placeholder="01 Oct 2026 - 14 Oct 2026&#10;15 Oct 2026 - 28 Oct 2026&#10;01 Nov 2026 - 14 Nov 2026"
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26] font-mono text-xs"
                      />
                    </div>

                    {/* Available Accommodation Options & Pricing (Tick to Enable) */}
                    <div className="space-y-3 md:col-span-2 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                      <label className="font-bold text-gray-800 block text-xs uppercase tracking-wider">
                        Available Accommodation Options for this Property (Tick to Enable)
                      </label>
                      <p className="text-[11px] text-gray-500">
                        Tick which room options are offered for this retreat. Guests will only be able to select ticked options.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        {/* 1. Dormitory */}
                        <div className={`p-3 rounded-lg border transition-colors ${editEnableDormitory ? 'bg-white border-emerald-400 shadow-xs' : 'bg-gray-50 border-gray-200'}`}>
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 text-xs mb-2 select-none">
                            <input
                              type="checkbox"
                              checked={editEnableDormitory}
                              onChange={(e) => setEditEnableDormitory(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-800 focus:ring-0 cursor-pointer"
                            />
                            <span>[✓] Dormitory Room</span>
                          </label>
                          {editEnableDormitory && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-500 font-semibold">Dormitory Price (USD)</span>
                              <input
                                type="number"
                                value={editPriceDormitory}
                                onChange={(e) => setEditPriceDormitory(e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="e.g. 799"
                                className="w-full border border-gray-200 rounded p-1.5 outline-none focus:border-emerald-700 bg-white"
                              />
                            </div>
                          )}
                        </div>

                        {/* 2. Shared Twin Room */}
                        <div className={`p-3 rounded-lg border transition-colors ${editEnableShared ? 'bg-white border-emerald-400 shadow-xs' : 'bg-gray-50 border-gray-200'}`}>
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 text-xs mb-2 select-none">
                            <input
                              type="checkbox"
                              checked={editEnableShared}
                              onChange={(e) => setEditEnableShared(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-800 focus:ring-0 cursor-pointer"
                            />
                            <span>[✓] Shared Twin Room</span>
                          </label>
                          {editEnableShared && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-500 font-semibold">Shared Room Price (USD)</span>
                              <input
                                type="number"
                                value={editPriceShared}
                                onChange={(e) => setEditPriceShared(Number(e.target.value))}
                                placeholder="e.g. 1499"
                                className="w-full border border-gray-200 rounded p-1.5 outline-none focus:border-emerald-700 bg-white"
                              />
                            </div>
                          )}
                        </div>

                        {/* 3. Private Room */}
                        <div className={`p-3 rounded-lg border transition-colors ${editEnablePrivate ? 'bg-white border-emerald-400 shadow-xs' : 'bg-gray-50 border-gray-200'}`}>
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 text-xs mb-2 select-none">
                            <input
                              type="checkbox"
                              checked={editEnablePrivate}
                              onChange={(e) => setEditEnablePrivate(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-800 focus:ring-0 cursor-pointer"
                            />
                            <span>[✓] Private Room</span>
                          </label>
                          {editEnablePrivate && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-gray-500 font-semibold">Private Room Price (USD)</span>
                              <input
                                type="number"
                                value={editPricePrivate}
                                onChange={(e) => setEditPricePrivate(Number(e.target.value))}
                                placeholder="e.g. 2199"
                                className="w-full border border-gray-200 rounded p-1.5 outline-none focus:border-emerald-700 bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Original Price (USD - for strike-through discount)</label>
                      <input
                        type="number"
                        value={editOriginalPrice}
                        onChange={(e) => setEditOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 1999"
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Max Group Size</label>
                      <input
                        type="number"
                        value={editMaxGroupSize}
                        onChange={(e) => setEditMaxGroupSize(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Difficulty Level</label>
                      <select
                        value={editDifficultyLevel}
                        onChange={(e) => setEditDifficultyLevel(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Spots Left (Indicator)</label>
                      <input
                        type="number"
                        value={editSpotsLeft}
                        onChange={(e) => setEditSpotsLeft(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 4"
                        className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                      />
                    </div>
                  </div>

                  {/* Badges and Featured Flags */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <label className="font-bold text-gray-700 block">Badges &amp; Display Options</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={editIsBestseller}
                          onChange={(e) => setEditIsBestseller(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1C2E26] focus:ring-0"
                        />
                        <span>Bestseller</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={editIsRecommended}
                          onChange={(e) => setEditIsRecommended(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1C2E26] focus:ring-0"
                        />
                        <span>Recommended</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={editIsLimitedSpots}
                          onChange={(e) => setEditIsLimitedSpots(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1C2E26] focus:ring-0"
                        />
                        <span>Limited Spots</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={editIsNew}
                          onChange={(e) => setEditIsNew(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1C2E26] focus:ring-0"
                        />
                        <span>New Badge</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 block">
                      Featured Cover Image (Upload from Device or Paste URL)
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
                        <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDeviceImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    {editFeaturedImage && (
                      <div className="flex items-center gap-2 pt-1">
                        <img src={editFeaturedImage} alt="Preview" className="w-12 h-12 rounded object-cover border border-gray-200" />
                        <span className="text-[11px] text-emerald-800 font-bold">Featured image attached</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Gallery Image URLs (One URL per line)</label>
                    <textarea
                      rows={3}
                      value={editGallery}
                      onChange={(e) => setEditGallery(e.target.value)}
                      placeholder="https://.../photo1.jpg&#10;https://.../photo2.jpg"
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26] font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Short Summary Description</label>
                    <textarea
                      rows={2}
                      value={editShortDescription}
                      onChange={(e) => setEditShortDescription(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Full Detailed Description</label>
                    <textarea
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Comprehensive overview of the retreat, daily rhythm, ashram environment..."
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Key Highlights (One per line)</label>
                    <textarea
                      rows={3}
                      value={editHighlights}
                      onChange={(e) => setEditHighlights(e.target.value)}
                      placeholder="Daily authentic Hatha Yoga sessions&#10;Consultation with Ayurveda Doctors&#10;Ganga Aarti spiritual ceremonies"
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Inclusions (One per line)</label>
                    <textarea
                      rows={3}
                      value={editInclusions}
                      onChange={(e) => setEditInclusions(e.target.value)}
                      placeholder="Luxury accommodation&#10;3 Organic meals daily&#10;Airport transfer"
                      className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1C2E26]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Exclusions (One per line)</label>
                    <textarea
                      rows={3}
                      value={editExclusions}
                      onChange={(e) => setEditExclusions(e.target.value)}
                      placeholder="International airfare&#10;Personal expenses&#10;Travel insurance"
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
