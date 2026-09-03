'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  orderIndex: number
  isPublished: boolean
}

interface FaqClientViewProps {
  faqs: FaqItem[]
}

const CATEGORIES = [
  'All',
  'Retreats & Ashram',
  'Online Classes',
  'Booking & Payments',
  'Visa & Travel',
  'General',
]

export default function FaqClientView({ faqs }: FaqClientViewProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null)

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [faqs, activeCategory, searchQuery])

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-5 top-4 text-gray-400 text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions about retreats, ayurveda, online classes, visas..."
            className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white border border-black/10 text-sm focus:outline-none focus:border-[#1C2E26] shadow-sm text-[#1C2E26] font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-sm w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        {CATEGORIES.map((cat) => {
          const count =
            cat === 'All'
              ? faqs.length
              : faqs.filter((f) => f.category === cat).length

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#1C2E26] text-[#E2C799] shadow-md scale-105'
                  : 'bg-white text-gray-600 border border-black/5 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {cat} <span className="opacity-70 text-[10px]">({count})</span>
            </button>
          )
        })}
      </div>

      {/* FAQs Accordion List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-black/5 p-8 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">help_outline</span>
            <h3 className="text-lg font-bold text-[#1C2E26]">No Questions Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              We couldn&apos;t find any FAQs matching your search query. Feel free to contact our support team directly.
            </p>
            <Link href="/contact" className="inline-block mt-4">
              <button className="px-6 py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold rounded-xl text-xs hover:bg-[#253e34] transition-colors">
                Contact Journey Planners
              </button>
            </Link>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id

            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-[#1C2E26]/30 shadow-md' : 'border-black/5 shadow-xs hover:border-black/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 inline-block mb-1">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1C2E26] pr-2">
                      {faq.question}
                    </h3>
                  </div>

                  <span
                    className={`w-8 h-8 rounded-full bg-[#FAF7F2] text-[#1C2E26] flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#1C2E26] text-[#E2C799]' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">expand_more</span>
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 mt-2 pt-4 animate-in fade-in duration-200">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Still Have Questions CTA Banner */}
      <div className="max-w-4xl mx-auto bg-[#1C2E26] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center sm:text-left z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E2C799]">Personal Assistance</span>
          <h3 className="text-xl sm:text-2xl font-bold font-display-lg text-white">
            Have a question not listed here?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-lg">
            Our Himalayan retreat planners and Ayurveda specialists are here to guide your personal journey.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <a
            href="https://wa.me/919999876349"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#E2C799] text-[#1C2E26] font-bold rounded-xl text-xs hover:bg-[#d6b783] transition-colors flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            WhatsApp Us
          </a>

          <Link
            href="/contact"
            className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-xs hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Send Inquiry
          </Link>
        </div>
      </div>
    </div>
  )
}
