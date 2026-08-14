'use client'

import { useState } from 'react'

export interface TabFeature {
  id: string
  title: string
  shortTitle: string
  icon: string
  card1: {
    badge: string
    title: string
    description: string
    timeline: Array<{ label: string; text: string }>
  }
  card2: {
    badge: string
    title: string
    pillars: Array<{ icon: string; title: string; desc: string }>
    footerLeft: string
    footerRight: string
  }
}

const featuresData: TabFeature[] = [
  {
    id: 'verified',
    title: 'Handpicked & Verified Retreats',
    shortTitle: 'Verified Retreats',
    icon: 'workspace_premium',
    card1: {
      badge: '✦ 10-POINT INSPECTION',
      title: '100% On-Site Inspected Sanctuaries',
      description: 'Every ashram and retreat on India Yoga Tourism undergoes rigorous quality checks before listing.',
      timeline: [
        { label: 'GURUS', text: 'Authentic Lineage & Accreditation Check' },
        { label: 'LOCATION', text: 'Peaceful Environment & Noise Audit' },
        { label: 'STAY', text: 'Hygiene & High-Comfort Private Rooms' },
        { label: 'FOOD', text: 'Pure Organic Sattvic Meal Preparation' }
      ]
    },
    card2: {
      badge: 'PEACE OF MIND',
      title: 'What Verification Means for You',
      pillars: [
        { icon: 'self_improvement', title: 'Certified Teachers', desc: 'Masters with 10+ years ashram experience.' },
        { icon: 'verified', title: 'Zero Fraud Guarantee', desc: 'Directly contracted with verified owners.' },
        { icon: 'clean_hands', title: 'Clean Facilities', desc: 'Hot water, Wi-Fi & fresh linens.' },
        { icon: 'star', title: 'Real Guest Reviews', desc: '100% verified traveler ratings.' }
      ],
      footerLeft: '100% Quality Inspected',
      footerRight: 'Sanctuary Guaranteed'
    }
  },
  {
    id: 'pricing',
    title: 'No Hidden Charges & Transparent Rates',
    shortTitle: 'No Hidden Charges',
    icon: 'payments',
    card1: {
      badge: '✦ DIRECT RATES',
      title: 'Transparent Pricing & No Extra Fees',
      description: 'Pay direct ashram rates with zero surprise taxes or hidden resort fees at check-in.',
      timeline: [
        { label: 'MEALS', text: 'All Daily Organic Sattvic Meals Included' },
        { label: 'CLASSES', text: 'No Extra Fee for Props & Materials' },
        { label: 'TERMS', text: 'Clear Cancellation & Refund Terms' },
        { label: 'INVOICE', text: 'Instant Official Invoice & Receipt' }
      ]
    },
    card2: {
      badge: 'ALL-INCLUSIVE',
      title: 'Everything Included in Your Stay',
      pillars: [
        { icon: 'bed', title: 'Sanctuary Stay', desc: 'Clean private/shared rooms with amenities.' },
        { icon: 'restaurant', title: '3 Daily Meals', desc: 'Nutritious vegetarian food daily.' },
        { icon: 'spa', title: 'All Sessions', desc: 'Yoga, meditation & Ganga Aarti tours.' },
        { icon: 'local_cafe', title: 'Herbal Teas', desc: 'Unlimited detox teas & pure water.' }
      ],
      footerLeft: 'Best Rate Promise',
      footerRight: 'Zero Hidden Charges'
    }
  },
  {
    id: 'support',
    title: 'Local India-Based Support Team',
    shortTitle: 'Local India Support',
    icon: 'support_agent',
    card1: {
      badge: '✦ 24/7 GROUND TEAM',
      title: 'Local Experts On the Ground in Rishikesh',
      description: 'Our dedicated India-based team is available on WhatsApp and phone at every step of your journey.',
      timeline: [
        { label: 'PICKUP', text: 'Dehradun Airport & Train Station Transfers' },
        { label: '24/7 HELP', text: 'Instant WhatsApp Concierge Support' },
        { label: 'SAFETY', text: 'Local Emergency & Doctor Assistance' },
        { label: 'ADVICE', text: 'Personalized Travel & Local Tips' }
      ]
    },
    card2: {
      badge: 'ALWAYS CONNECTED',
      title: 'Seamless Travel Assistance',
      pillars: [
        { icon: 'airport_shuttle', title: 'Airport Pickup', desc: 'Private driver waiting with name placard.' },
        { icon: 'chat', title: 'Instant Help', desc: 'Reach out on WhatsApp anytime 24/7.' },
        { icon: 'luggage', title: 'Travel Care', desc: 'Help with local cabs, trains & SIM cards.' },
        { icon: 'forum', title: 'English Team', desc: 'Fluent English-speaking local guides.' }
      ],
      footerLeft: 'India Support Team',
      footerRight: '24/7 Assistance'
    }
  },
  {
    id: 'teachers',
    title: 'English-Speaking Guides & Teachers',
    shortTitle: 'English Guides',
    icon: 'forum',
    card1: {
      badge: '✦ EASY COMMUNICATION',
      title: 'Fluent & Empathetic Himalayan Masters',
      description: 'Bridge ancient Vedic philosophy with clear, accessible English explanations for all levels.',
      timeline: [
        { label: 'Q&A', text: 'In-Depth Philosophy & Sutra Sessions' },
        { label: 'ASANA', text: 'Clear Step-by-Step Posture Instructions' },
        { label: 'ALIGN', text: 'Personalized Posture Correction' },
        { label: 'MENTOR', text: 'One-on-One Spiritual & Practice Guidance' }
      ]
    },
    card2: {
      badge: 'ACCESSIBLE WISDOM',
      title: 'Deep Learning Without Barriers',
      pillars: [
        { icon: 'self_improvement', title: 'Asana Guidance', desc: 'Clear anatomical posture alignment.' },
        { icon: 'air', title: 'Pranayama', desc: 'Guided breathing explained simply.' },
        { icon: 'menu_book', title: 'Philosophy', desc: 'Vedic wisdom for modern life.' },
        { icon: 'psychology', title: 'Open Dialogue', desc: 'Ask any practice or spiritual question.' }
      ],
      footerLeft: 'Fluent English Masters',
      footerRight: 'Traditional Lineage'
    }
  },
  {
    id: 'ashram',
    title: 'Safe & Comfortable Ashram Stays',
    shortTitle: 'Safe Ashram Stays',
    icon: 'verified_user',
    card1: {
      badge: '✦ SOLO FEMALE FRIENDLY',
      title: 'High Comfort Meets Ashram Serenity',
      description: 'Enjoy modern amenities combined with peaceful meditation gardens. Trusted by 70%+ solo travellers.',
      timeline: [
        { label: 'SECURITY', text: '24/7 Gated Premises & Caring Staff' },
        { label: 'ROOMS', text: 'Private Bathrooms with 24h Hot Water' },
        { label: 'HYGIENE', text: 'Daily Cleaning & High Sanitation' },
        { label: 'PEACE', text: 'Quiet Gardens & Riverside Spaces' }
      ]
    },
    card2: {
      badge: 'HOLISTIC RETREAT',
      title: 'Your Home in the Himalayas',
      pillars: [
        { icon: 'single_bed', title: 'Private Rooms', desc: 'Cozy bedding & attached bathrooms.' },
        { icon: 'wifi', title: 'High-Speed Wi-Fi', desc: 'Stay connected with loved ones.' },
        { icon: 'shield_person', title: 'Solo Friendly', desc: '70%+ guests are solo travellers.' },
        { icon: 'park', title: 'Serene Environment', desc: 'Lush mountain views & riversides.' }
      ],
      footerLeft: 'Solo Female Approved',
      footerRight: '24/7 Gated Safety'
    }
  },
  {
    id: 'guarantee',
    title: 'Best Price Assistance Guarantee',
    shortTitle: 'Price Guarantee',
    icon: 'local_offer',
    card1: {
      badge: '✦ VALUE GUARANTEE',
      title: 'Unmatched Direct Value & Price Match',
      description: 'Find the exact same retreat cheaper anywhere else? We match the price and add free airport pickup.',
      timeline: [
        { label: 'DIRECT', text: 'Direct Partnership Rates with Top Centers' },
        { label: 'PERKS', text: 'Free Doctor Consultation & Aarti Tour' },
        { label: 'FLEXIBLE', text: 'Free Date Rescheduling Support' },
        { label: '0% COMM', text: 'No Middleman Commission Added' }
      ]
    },
    card2: {
      badge: 'BEST VALUE',
      title: 'More Than Just a Booking',
      pillars: [
        { icon: 'sell', title: 'Price Match', desc: 'Found lower? We match it instantly.' },
        { icon: 'card_giftcard', title: 'Bonus Perks', desc: 'Free consultation & tours included.' },
        { icon: 'calendar_month', title: 'Flexible Dates', desc: 'Easy date changes up to 7 days prior.' },
        { icon: 'handshake', title: 'Direct Value', desc: 'No hidden agent fees or commissions.' }
      ],
      footerLeft: 'Best Rate Guaranteed',
      footerRight: 'Direct Ashram Price'
    }
  }
]

export default function WhyChooseUsInteractive() {
  const [activeTab, setActiveTab] = useState(0)
  const current = featuresData[activeTab]

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-stretch">
      {/* Left Column: Interactive Feature Tabs (col-span-4) */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        {featuresData.map((feat, idx) => {
          const isActive = activeTab === idx
          return (
            <button
              key={feat.id}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center justify-between gap-3 p-4 rounded-xl text-left transition-all duration-300 cursor-pointer border ${
                isActive
                  ? 'bg-primary text-on-primary border-primary shadow-md scale-[1.02]'
                  : 'bg-white hover:bg-surface text-primary border-outline-variant/20 shadow-sm hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`material-symbols-outlined text-xl shrink-0 ${
                    isActive ? 'text-tertiary-fixed-dim' : 'text-secondary'
                  }`}
                >
                  {feat.icon}
                </span>
                <span className="font-bold text-xs leading-snug truncate">
                  {feat.title}
                </span>
              </div>
              <span
                className={`material-symbols-outlined text-sm transition-transform duration-300 shrink-0 ${
                  isActive ? 'text-tertiary-fixed-dim translate-x-1' : 'text-outline-variant opacity-60'
                }`}
              >
                chevron_right
              </span>
            </button>
          )
        })}
      </div>

      {/* Right Column: Dynamic Informative Cards (col-span-8) */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
        {/* Card 1: Green Themed Specific Feature Highlight */}
        <div className="bg-[#012d1d] text-white rounded-2xl p-6 shadow-md border border-white/10 flex flex-col justify-between relative overflow-hidden min-h-[310px] transition-all duration-500">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-tertiary-fixed-dim/10 blur-xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-tertiary-fixed-dim bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                {current.card1.badge}
              </span>
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">auto_awesome</span>
            </div>
            <h3 className="font-headline-md text-lg text-white font-bold mb-2">
              {current.card1.title}
            </h3>
            <p className="text-[11px] text-white/80 leading-relaxed mb-4">
              {current.card1.description}
            </p>

            {/* Feature Points list */}
            <div className="space-y-2.5 text-[11px] text-white/90">
              {current.card1.timeline.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim shrink-0"></span>
                  <span className="font-bold text-tertiary-fixed-dim w-16 shrink-0 uppercase text-[9px] tracking-wider">
                    {item.label}
                  </span>
                  <span className="truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: White Themed Pillars / Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-between min-h-[310px] transition-all duration-500">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                {current.card2.badge}
              </span>
              <span className="material-symbols-outlined text-secondary text-lg">spa</span>
            </div>
            <h3 className="font-headline-md text-lg text-primary font-bold mb-3">
              {current.card2.title}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {current.card2.pillars.map((pil, idx) => (
                <div key={idx} className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs mb-0.5">
                    <span className="material-symbols-outlined text-secondary text-sm">{pil.icon}</span>
                    <span className="truncate">{pil.title}</span>
                  </div>
                  <p className="text-[9px] text-on-surface-variant leading-tight line-clamp-2">
                    {pil.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between text-[10px] text-on-surface-variant font-bold">
            <span className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-xs text-secondary icon-fill">verified</span>
              {current.card2.footerLeft}
            </span>
            <span className="text-secondary font-bold">{current.card2.footerRight}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
