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
    id: 'experiences', title: 'Yoga, Meditation & Ayurveda Together', shortTitle: 'Experiences', icon: 'self_improvement',
    card1: {
      badge: 'EXPLORE YOUR OPTIONS', title: 'Find an Experience That Fits Your Interests',
      description: 'Browse yoga and wellness experiences, then review the individual program before deciding.',
      timeline: [
        { label: 'YOGA', text: 'Retreats and guided practice' },
        { label: 'MIND', text: 'Meditation and breathwork experiences' },
        { label: 'AYURVEDA', text: 'Practitioner-guided wellness programs' },
        { label: 'ONLINE', text: 'Classes to explore from home' }
      ]
    },
    card2: {
      badge: 'YOUR JOURNEY', title: 'Choose Your Starting Point',
      pillars: [
        { icon: 'self_improvement', title: 'Practice', desc: 'Check the level and daily schedule.' },
        { icon: 'air', title: 'Meditation', desc: 'Explore the activities on offer.' },
        { icon: 'spa', title: 'Wellness', desc: 'Discuss suitability with a practitioner.' },
        { icon: 'devices', title: 'Classes', desc: 'Review online class options.' }
      ],
      footerLeft: 'Different Ways to Explore', footerRight: 'Your Interests First'
    }
  },
  {
    id: 'details', title: 'Program Details in One Place', shortTitle: 'Compare Details', icon: 'checklist',
    card1: {
      badge: 'COMPARE BEFORE BOOKING', title: 'Look Beyond the Retreat Title',
      description: 'Compare the practical details that matter for your stay using the published package information.',
      timeline: [
        { label: 'WHERE', text: 'Review the listed destination' },
        { label: 'WHEN', text: 'Check duration and confirm your dates' },
        { label: 'STAY', text: 'Compare available room options' },
        { label: 'PRICE', text: 'Read inclusions and currency details' }
      ]
    },
    card2: {
      badge: 'PLAN WITH CONTEXT', title: 'Understand What You Are Booking',
      pillars: [
        { icon: 'calendar_month', title: 'Duration', desc: 'Compare days and nights.' },
        { icon: 'bed', title: 'Rooms', desc: 'Review accommodation options.' },
        { icon: 'list_alt', title: 'Inclusions', desc: 'Read included and excluded items.' },
        { icon: 'policy', title: 'Terms', desc: 'Confirm the applicable booking terms.' }
      ],
      footerLeft: 'Review Each Listing', footerRight: 'Confirm Before Paying'
    }
  },
  {
    id: 'providers', title: 'Direct & Partner-Operated Programs', shortTitle: 'Providers', icon: 'handshake',
    card1: {
      badge: 'KNOW YOUR PROVIDER', title: 'A Platform Connecting Different Experiences',
      description: 'Our team offers some programs directly, while independent providers operate other experiences. Ask who operates your chosen program.',
      timeline: [
        { label: 'OPERATOR', text: 'Confirm who provides the stay' },
        { label: 'TEACHERS', text: 'Ask about instructors and qualifications' },
        { label: 'CARE', text: 'Discuss practitioner guidance individually' },
        { label: 'TERMS', text: 'Check provider-specific policies' }
      ]
    },
    card2: {
      badge: 'INFORMED CHOICES', title: 'Ask the Questions That Matter',
      pillars: [
        { icon: 'home', title: 'Operator', desc: 'Who delivers the experience?' },
        { icon: 'school', title: 'Guidance', desc: 'Who teaches or supervises?' },
        { icon: 'person', title: 'Suitability', desc: 'Does the program fit your needs?' },
        { icon: 'description', title: 'Policies', desc: 'What terms apply to this booking?' }
      ],
      footerLeft: 'Direct and Partner Programs', footerRight: 'Check Provider Details'
    }
  },
  {
    id: 'support', title: 'Contact Our Team Before You Book', shortTitle: 'Enquiries', icon: 'support_agent',
    card1: {
      badge: 'BOOKING ENQUIRIES', title: 'Get Help With Your Questions',
      description: 'Use the contact form, WhatsApp or phone to ask about a program and clarify the information you need before booking.',
      timeline: [
        { label: 'COMPARE', text: 'Ask about differences between programs' },
        { label: 'DATES', text: 'Confirm options for your travel plans' },
        { label: 'DETAILS', text: 'Clarify accommodation and inclusions' },
        { label: 'CONTACT', text: 'Use your preferred enquiry channel' }
      ]
    },
    card2: {
      badge: 'TRAVEL PLANNING', title: 'For Visitors From India and Overseas',
      pillars: [
        { icon: 'mail', title: 'Enquiries', desc: 'Use the contact form to send questions.' },
        { icon: 'chat', title: 'WhatsApp', desc: 'Ask about your chosen program.' },
        { icon: 'call', title: 'Phone', desc: 'Use the published contact number.' },
        { icon: 'help', title: 'FAQs', desc: 'Read booking and travel information.' }
      ],
      footerLeft: 'Questions Welcome', footerRight: 'Plan Before You Book'
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
              type="button"
              aria-pressed={isActive}
              aria-controls="why-feature-details"
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
                <span className="font-bold text-sm leading-snug">
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
      <div id="why-feature-details" className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
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
                  <span>{item.text}</span>
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
                    <span>{pil.title}</span>
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
