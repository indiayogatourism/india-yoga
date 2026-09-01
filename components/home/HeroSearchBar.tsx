'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface DestinationItem {
  id: string
  name: string
  subtitle: string
  locationQuery: string
  icon: string
}

export default function HeroSearchBar() {
  const router = useRouter()

  // State
  const [selectedDestination, setSelectedDestination] = useState('Rishikesh')
  const [customSearchQuery, setCustomSearchQuery] = useState('')

  const [selectedDuration, setSelectedDuration] = useState<'any' | 'short' | 'medium' | 'long'>('any')
  const [durationLabel, setDurationLabel] = useState('Any Duration')

  // Date selection state
  const [arrivalDate, setArrivalDate] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [selectedDatePreset, setSelectedDatePreset] = useState('Select Dates')

  // Guests count state
  const [guestsCount, setGuestsCount] = useState(1)

  // Active Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<'destination' | 'duration' | 'dates' | 'guests' | null>(null)

  // Dynamic destinations from API
  const [destinations, setDestinations] = useState<DestinationItem[]>([
    { id: '1', name: 'Rishikesh', subtitle: 'Yoga Capital of the World', locationQuery: 'Rishikesh', icon: 'landscape' },
    { id: '2', name: 'Kerala', subtitle: 'Traditional Ayurvedic Sanctuary', locationQuery: 'Kerala', icon: 'spa' },
    { id: '3', name: 'Dharamshala', subtitle: 'Peace in the Himalayan foothills', locationQuery: 'Dharamshala', icon: 'filter_drama' },
  ])

  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch('/api/site-config')
        const data = await res.json()
        if (data.success && data.config?.destinationsJson) {
          const parsed = JSON.parse(data.config.destinationsJson)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDestinations(parsed)
          }
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchDestinations()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const params = new URLSearchParams()
    
    // Location or text search
    if (customSearchQuery.trim()) {
      params.set('search', customSearchQuery.trim())
    } else if (selectedDestination && selectedDestination !== 'All Destinations') {
      params.set('location', selectedDestination)
    }

    // Duration
    if (selectedDuration !== 'any') {
      params.set('duration', selectedDuration)
    }

    // Dates
    if (arrivalDate) {
      params.set('arrival', arrivalDate)
    }
    if (departureDate) {
      params.set('departure', departureDate)
    }

    // Guests
    if (guestsCount > 1) {
      params.set('guests', guestsCount.toString())
    }

    setActiveDropdown(null)
    router.push(`/packages?${params.toString()}`)
  }

  const durationOptions = [
    { label: 'Any Duration', value: 'any' as const },
    { label: '3 - 5 Days', value: 'short' as const },
    { label: '6 - 10 Days', value: 'medium' as const },
    { label: '10+ Days', value: 'long' as const },
  ]

  const datePresets = [
    'Select Dates',
    'Anytime',
    'This Month',
    'Next Month',
    'Upcoming Season (Oct - Mar)',
  ]

  // Formatted date display string
  const getDateDisplayString = () => {
    if (arrivalDate && departureDate) {
      const arr = new Date(arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dep = new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${arr} - ${dep}`
    } else if (arrivalDate) {
      return new Date(arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return selectedDatePreset
  }

  return (
    <div ref={widgetRef} className="relative w-full max-w-4xl mx-auto z-40">
      {/* Desktop Search Bento Widget */}
      <div className="hidden md:flex w-full bg-white/95 backdrop-blur-md rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.25)] p-2.5 items-center justify-between border border-white/50 relative z-30">
        {/* 1. Destination */}
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'destination' ? null : 'destination')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-full border-r border-outline-variant/30 flex-1 text-left cursor-pointer transition-all duration-200 hover:bg-black/5 ${
            activeDropdown === 'destination' ? 'bg-primary/10 ring-2 ring-primary/30' : ''
          }`}
        >
          <span className="material-symbols-outlined text-primary text-xl">location_on</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Destination</span>
            <span className="text-xs font-bold text-on-surface truncate">
              {customSearchQuery ? `"${customSearchQuery}"` : selectedDestination ? `${selectedDestination}, India` : 'All Destinations'}
            </span>
          </div>
        </div>

        {/* 2. Duration */}
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'duration' ? null : 'duration')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-full border-r border-outline-variant/30 flex-1 text-left cursor-pointer transition-all duration-200 hover:bg-black/5 ${
            activeDropdown === 'duration' ? 'bg-primary/10 ring-2 ring-primary/30' : ''
          }`}
        >
          <span className="material-symbols-outlined text-primary text-xl">schedule</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Duration</span>
            <span className="text-xs font-bold text-on-surface truncate">{durationLabel}</span>
          </div>
        </div>

        {/* 3. Dates */}
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'dates' ? null : 'dates')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-full border-r border-outline-variant/30 flex-1 text-left cursor-pointer transition-all duration-200 hover:bg-black/5 ${
            activeDropdown === 'dates' ? 'bg-primary/10 ring-2 ring-primary/30' : ''
          }`}
        >
          <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Dates</span>
            <span className="text-xs font-bold text-on-surface truncate">{getDateDisplayString()}</span>
          </div>
        </div>

        {/* 4. Guests */}
        <div
          onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-full flex-1 text-left cursor-pointer transition-all duration-200 hover:bg-black/5 ${
            activeDropdown === 'guests' ? 'bg-primary/10 ring-2 ring-primary/30' : ''
          }`}
        >
          <span className="material-symbols-outlined text-primary text-xl">group</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Guests</span>
            <span className="text-xs font-bold text-on-surface truncate">
              {guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>
        </div>

        {/* Search Action Button */}
        <button
          onClick={handleSearchSubmit}
          className="bg-primary hover:bg-[#02402a] active:scale-95 text-on-primary font-bold px-7 py-3.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider shrink-0"
        >
          <span className="material-symbols-outlined text-base">search</span>
          Explore Retreats
        </button>
      </div>

      {/* Mobile Search Bento Widget */}
      <div className="md:hidden w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/40 mt-4 flex flex-col gap-3 text-left">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Destination */}
          <div
            onClick={() => setActiveDropdown(activeDropdown === 'destination' ? null : 'destination')}
            className="flex items-center gap-2.5 p-3 bg-surface-container-low rounded-xl border border-outline-variant/15 cursor-pointer active:bg-black/5"
          >
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Destination</span>
              <span className="text-xs font-bold text-on-surface truncate">
                {customSearchQuery ? customSearchQuery : selectedDestination}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div
            onClick={() => setActiveDropdown(activeDropdown === 'duration' ? null : 'duration')}
            className="flex items-center gap-2.5 p-3 bg-surface-container-low rounded-xl border border-outline-variant/15 cursor-pointer active:bg-black/5"
          >
            <span className="material-symbols-outlined text-primary text-lg">schedule</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Duration</span>
              <span className="text-xs font-bold text-on-surface truncate">{durationLabel}</span>
            </div>
          </div>

          {/* Dates */}
          <div
            onClick={() => setActiveDropdown(activeDropdown === 'dates' ? null : 'dates')}
            className="flex items-center gap-2.5 p-3 bg-surface-container-low rounded-xl border border-outline-variant/15 cursor-pointer active:bg-black/5"
          >
            <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Dates</span>
              <span className="text-xs font-bold text-on-surface truncate">{getDateDisplayString()}</span>
            </div>
          </div>

          {/* Guests */}
          <div
            onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
            className="flex items-center gap-2.5 p-3 bg-surface-container-low rounded-xl border border-outline-variant/15 cursor-pointer active:bg-black/5"
          >
            <span className="material-symbols-outlined text-primary text-lg">group</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Guests</span>
              <span className="text-xs font-bold text-on-surface truncate">{guestsCount} Guest</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSearchSubmit}
          className="w-full bg-primary hover:bg-[#02402a] active:scale-95 text-on-primary font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-base">search</span>
          Explore Retreats
        </button>
      </div>

      {/* DROPDOWN PANELS */}

      {/* 1. Destination Dropdown Panel */}
      {activeDropdown === 'destination' && (
        <div className="absolute top-full left-0 md:left-2 mt-3 w-full md:w-96 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-4 border border-black/10 z-50 text-left animate-fade-in space-y-3 max-h-[380px] overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-[#1C2E26] uppercase tracking-wider">Select Destination</span>
            <button
              onClick={() => setActiveDropdown(null)}
              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Text Input Search Field */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-base">search</span>
            <input
              type="text"
              value={customSearchQuery}
              onChange={(e) => {
                setCustomSearchQuery(e.target.value)
                if (e.target.value) setSelectedDestination('')
              }}
              placeholder="Search city, retreat, or therapy..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1C2E26] focus:outline-none"
            />
          </div>

          {/* Quick Selectable Destination List */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedDestination('All Destinations')
                setCustomSearchQuery('')
                setActiveDropdown(null)
              }}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                selectedDestination === 'All Destinations' && !customSearchQuery
                  ? 'bg-[#1C2E26] text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-base">public</span>
              All Destinations &amp; India Retreats
            </button>

            {destinations.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDestination(d.locationQuery || d.name)
                  setCustomSearchQuery('')
                  setActiveDropdown(null)
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center gap-3 transition-colors cursor-pointer ${
                  selectedDestination === (d.locationQuery || d.name) && !customSearchQuery
                    ? 'bg-[#1C2E26] text-white font-bold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm text-[#1C2E26]">{d.icon || 'location_on'}</span>
                </div>
                <div>
                  <p className="font-bold text-xs">{d.name}, India</p>
                  <p className="text-[10px] opacity-70">{d.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Duration Dropdown Panel */}
      {activeDropdown === 'duration' && (
        <div className="absolute top-full left-0 md:left-1/4 mt-3 w-full md:w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-4 border border-black/10 z-50 text-left animate-fade-in space-y-2">
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <span className="text-xs font-bold text-[#1C2E26] uppercase tracking-wider">Select Duration</span>
            <button
              onClick={() => setActiveDropdown(null)}
              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {durationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setSelectedDuration(opt.value)
                setDurationLabel(opt.label)
                setActiveDropdown(null)
              }}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                selectedDuration === opt.value ? 'bg-[#1C2E26] text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span>{opt.label}</span>
              {selectedDuration === opt.value && (
                <span className="material-symbols-outlined text-sm">check</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 3. Dates Dropdown Panel (With Custom Date Pickers & Presets) */}
      {activeDropdown === 'dates' && (
        <div className="absolute top-full left-0 md:left-1/3 mt-3 w-full md:w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5 border border-black/10 z-50 text-left animate-fade-in space-y-4 max-h-[420px] overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-[#1C2E26] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Select Travel Dates
            </span>
            <button
              onClick={() => setActiveDropdown(null)}
              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Custom Date Pickers */}
          <div className="space-y-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Custom Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Arrival Date</label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => {
                    setArrivalDate(e.target.value)
                    if (e.target.value) setSelectedDatePreset('')
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-mono focus:ring-1 focus:ring-[#1C2E26] focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  min={arrivalDate || undefined}
                  onChange={(e) => {
                    setDepartureDate(e.target.value)
                    if (e.target.value) setSelectedDatePreset('')
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-mono focus:ring-1 focus:ring-[#1C2E26] focus:outline-none bg-white"
                />
              </div>
            </div>

            {(arrivalDate || departureDate) && (
              <button
                type="button"
                onClick={() => {
                  setArrivalDate('')
                  setDepartureDate('')
                  setSelectedDatePreset('Select Dates')
                }}
                className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer block"
              >
                Clear Custom Dates
              </button>
            )}
          </div>

          {/* Date Presets */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Or Quick Seasonal Presets</p>
            {datePresets.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDatePreset(d)
                  setArrivalDate('')
                  setDepartureDate('')
                  setActiveDropdown(null)
                }}
                className={`w-full p-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedDatePreset === d && !arrivalDate
                    ? 'bg-[#1C2E26] text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span>{d}</span>
                {selectedDatePreset === d && !arrivalDate && (
                  <span className="material-symbols-outlined text-sm">check</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveDropdown(null)}
            className="w-full py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold text-xs rounded-xl hover:bg-[#253e34] transition-colors cursor-pointer text-center shadow-xs"
          >
            Apply Travel Dates
          </button>
        </div>
      )}

      {/* 4. Guests Counter Dropdown Panel */}
      {activeDropdown === 'guests' && (
        <div className="absolute top-full right-0 md:right-4 mt-3 w-full md:w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5 border border-black/10 z-50 text-left animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-[#1C2E26] uppercase tracking-wider">Number of Guests</span>
            <button
              onClick={() => setActiveDropdown(null)}
              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1C2E26]">Travelers / Pilgrims</p>
              <p className="text-[10px] text-gray-500">Shared or private retreat rooms</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuestsCount((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                -
              </button>
              <span className="font-bold text-sm text-[#1C2E26] w-4 text-center">{guestsCount}</span>
              <button
                type="button"
                onClick={() => setGuestsCount((prev) => Math.min(10, prev + 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => setActiveDropdown(null)}
            className="w-full py-2.5 bg-[#1C2E26] text-[#E2C799] font-bold text-xs rounded-xl hover:bg-[#253e34] transition-colors cursor-pointer text-center shadow-xs"
          >
            Apply Guest Count
          </button>
        </div>
      )}
    </div>
  )
}
