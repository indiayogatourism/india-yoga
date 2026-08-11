"use client"

import React, { useState } from "react"
import { CheckCircle, AlertCircle, Loader2, User, Phone, Globe } from "lucide-react"

interface ProfileFormProps {
  initialData: {
    name: string
    phone: string
    country: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [name, setName] = useState(initialData.name)
  const [phone, setPhone] = useState(initialData.phone)
  const [country, setCountry] = useState(initialData.country)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, country }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setMessage({
        type: "success",
        text: "Profile settings updated successfully!",
      })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-primary" />
          <span>Full Name</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-primary" />
          <span>Phone Number (WhatsApp preferred)</span>
        </label>
        <input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>Country of Residence</span>
        </label>
        <input
          type="text"
          placeholder="e.g. United States, Germany, Australia"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {/* Save Button */}
      <div className="pt-3 border-t border-outline-variant/30 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <span>Save Profile Settings</span>
          )}
        </button>
      </div>
    </form>
  )
}
