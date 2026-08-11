"use client"

import React, { useState } from "react"
import { CheckCircle, FileText, Upload, Shield, AlertCircle, Loader2 } from "lucide-react"

interface BookingItem {
  id: string
  bookingRef: string
  package: {
    title: string
  }
  passportNumber: string | null
  dietaryReqs: string | null
  medicalInfo: string | null
  specialRequests: string | null
}

interface UploadPortalProps {
  bookings: BookingItem[]
}

export function UploadPortal({ bookings }: UploadPortalProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings[0]?.id || ""
  )

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId)

  const [passportNumber, setPassportNumber] = useState(
    selectedBooking?.passportNumber || ""
  )
  const [dietaryReqs, setDietaryReqs] = useState(
    selectedBooking?.dietaryReqs || ""
  )
  const [medicalInfo, setMedicalInfo] = useState(
    selectedBooking?.medicalInfo || ""
  )
  const [specialRequests, setSpecialRequests] = useState(
    selectedBooking?.specialRequests || ""
  )

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleBookingChange = (id: string) => {
    setSelectedBookingId(id)
    const b = bookings.find((item) => item.id === id)
    if (b) {
      setPassportNumber(b.passportNumber || "")
      setDietaryReqs(b.dietaryReqs || "")
      setMedicalInfo(b.medicalInfo || "")
      setSpecialRequests(b.specialRequests || "")
    }
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookingId) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/user/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          passportNumber,
          dietaryReqs,
          medicalInfo,
          specialRequests,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update information")
      }

      setMessage({
        type: "success",
        text: "Travel documents & medical info submitted successfully!",
      })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Something went wrong",
      })
    } finally {
      setLoading(false)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-10 text-center">
        <Upload className="w-10 h-10 text-outline mx-auto mb-3" />
        <p className="text-sm font-bold text-primary">No bookings requiring documents</p>
        <p className="text-xs text-on-surface-variant mt-1">
          Once you reserve a retreat, you can upload passport copies and dietary details here.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Select Booking */}
      <div>
        <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
          Select Retreat Booking
        </label>
        <select
          value={selectedBookingId}
          onChange={(e) => handleBookingChange(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:border-primary transition-colors"
        >
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>
              #{b.bookingRef} — {b.package.title}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Passport / ID */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Passport / Govt ID Number
          </label>
          <input
            type="text"
            placeholder="e.g. A12345678"
            value={passportNumber}
            onChange={(e) => setPassportNumber(e.target.value)}
            className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm font-mono text-primary focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-on-surface-variant mt-1">
            Required by Indian Ashram regulations for foreign guests.
          </p>
        </div>

        {/* Dietary Reqs */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Dietary Preferences & Allergies
          </label>

          <div className="flex flex-wrap gap-2 mb-2">
            {["Sattvic (Ashram)", "Strict Vegan", "Vegetarian", "Gluten-Free", "Nut-Free"].map(
              (tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setDietaryReqs((prev) =>
                      prev.includes(tag) ? prev : prev ? `${prev}, ${tag}` : tag
                    )
                  }
                  className="text-[11px] bg-surface-container hover:bg-secondary-container/40 text-primary border border-outline-variant/30 px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  + {tag}
                </button>
              )
            )}
          </div>

          <textarea
            rows={2}
            placeholder="Specify any specific food allergies or dietary guidelines..."
            value={dietaryReqs}
            onChange={(e) => setDietaryReqs(e.target.value)}
            className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-sm text-primary focus:outline-none focus:border-primary"
          />
        </div>

        {/* Medical / Yoga Level */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Medical Notes & Yoga Experience Level
          </label>
          <textarea
            rows={2}
            placeholder="Any past injuries, medical conditions, or beginner/intermediate level notes..."
            value={medicalInfo}
            onChange={(e) => setMedicalInfo(e.target.value)}
            className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-sm text-primary focus:outline-none focus:border-primary"
          />
        </div>

        {/* Special Requests / Flight Details */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Airport Transfer & Flight Arrival Details
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Arriving Dehradun (DED) / Delhi airport at 2:00 PM on Day 1..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-sm text-primary focus:outline-none focus:border-primary"
          />
        </div>

        {/* Save button */}
        <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-outline font-semibold">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Confidential</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Save Information</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
