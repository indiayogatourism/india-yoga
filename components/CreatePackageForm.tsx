'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ItineraryDay {
  day: number
  title: string
  activities: string[]
}

export default function CreatePackageForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form Fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState<'RETREAT' | 'PROGRAMME'>('RETREAT')
  const [location, setLocation] = useState('')
  const [locationTag, setLocationTag] = useState('')
  const [durationDays, setDurationDays] = useState(7)
  const [durationNights, setDurationNights] = useState(6)
  const [priceShared, setPriceShared] = useState(500)
  const [pricePrivate, setPricePrivate] = useState(750)
  const [maxGroupSize, setMaxGroupSize] = useState(15)
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')

  // Highlights List
  const [highlights, setHighlights] = useState<string[]>([])
  const [newHighlight, setNewHighlight] = useState('')

  // Inclusions List
  const [inclusions, setInclusions] = useState<string[]>([
    'Luxury accommodation',
    '3 organic meals daily',
    'Daily yoga classes'
  ])
  const [newInclusion, setNewInclusion] = useState('')

  // Exclusions List
  const [exclusions, setExclusions] = useState<string[]>([
    'Airfare',
    'Airport transfers',
    'Personal spa sessions'
  ])
  const [newExclusion, setNewExclusion] = useState('')

  // Itinerary List
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, title: 'Arrival & Welcoming Ceremony', activities: ['Welcome dinner', 'Orientation'] }
  ])
  const [itTitle, setItTitle] = useState('')
  const [itActivities, setItActivities] = useState('')

  const handleTitleChange = (val: string) => {
    setTitle(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
  }

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight('')
    }
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const addInclusion = () => {
    if (newInclusion.trim()) {
      setInclusions([...inclusions, newInclusion.trim()])
      setNewInclusion('')
    }
  }

  const removeInclusion = (index: number) => {
    setInclusions(inclusions.filter((_, i) => i !== index))
  }

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setExclusions([...exclusions, newExclusion.trim()])
      setNewExclusion('')
    }
  }

  const removeExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index))
  }

  const addItineraryDay = () => {
    if (itTitle.trim()) {
      const activitiesArray = itActivities
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => a.length > 0)

      const nextDay = itinerary.length + 1
      setItinerary([
        ...itinerary,
        {
          day: nextDay,
          title: itTitle.trim(),
          activities: activitiesArray
        }
      ])
      setItTitle('')
      setItActivities('')
    }
  }

  const removeItineraryDay = (index: number) => {
    const updated = itinerary
      .filter((_, i) => i !== index)
      .map((day, idx) => ({
        ...day,
        day: idx + 1
      }))
    setItinerary(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (!title || !slug || !location || !description || !featuredImage) {
      setErrorMsg('Please fill in all required fields marked with *')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/packages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          category,
          location,
          locationTag: locationTag || location.split(',')[0],
          durationDays,
          durationNights,
          priceShared,
          pricePrivate,
          maxGroupSize,
          difficultyLevel,
          shortDescription,
          description,
          featuredImage,
          highlights,
          inclusions,
          exclusions,
          itinerary
        })
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create package')
      }

      setSuccessMsg('Retreat package created successfully! Redirecting...')
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {errorMsg && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg font-bold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-secondary-container text-on-secondary-container rounded-lg font-bold">
          {successMsg}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 shadow-md rounded-2xl p-8 md:p-10">
        <header className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[28px]">info</span>
          <h2 className="font-headline-md text-primary text-xl">Basic Information</h2>
        </header>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Package Title *</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline-variant transition-colors text-lg font-medium"
              placeholder="e.g., 7-Day Himalayan Detox Retreat"
              type="text"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">URL Slug *</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline-variant transition-colors text-sm"
                placeholder="7-day-himalayan-detox-retreat"
                type="text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'RETREAT' | 'PROGRAMME')}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface-variant text-sm appearance-none"
              >
                <option value="RETREAT">Retreat</option>
                <option value="PROGRAMME">Programme</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Location *</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline-variant transition-colors text-sm"
                placeholder="e.g., Rishikesh, India"
                type="text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Location Tag</label>
              <input
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline-variant transition-colors text-sm"
                placeholder="e.g., Rishikesh"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Duration (Days)</label>
              <input
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface transition-colors"
                type="number"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Duration (Nights)</label>
              <input
                value={durationNights}
                onChange={(e) => setDurationNights(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface transition-colors"
                type="number"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Max Group Size</label>
              <input
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface transition-colors"
                type="number"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Difficulty Level</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface transition-colors appearance-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Capacity */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 shadow-md rounded-2xl p-8 md:p-10">
        <header className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[28px]">sell</span>
          <h2 className="font-headline-md text-primary text-xl">Pricing &amp; Accommodations</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Price Shared (Twin Room) USD *</label>
            <div className="relative">
              <span className="absolute left-0 top-2 text-outline-variant">$</span>
              <input
                value={priceShared}
                onChange={(e) => setPriceShared(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 pl-6 py-2 text-on-surface font-label-price text-lg"
                placeholder="0.00"
                type="number"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Price Private (Suite Room) USD *</label>
            <div className="relative">
              <span className="absolute left-0 top-2 text-outline-variant">$</span>
              <input
                value={pricePrivate}
                onChange={(e) => setPricePrivate(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 pl-6 py-2 text-on-surface font-label-price text-lg"
                placeholder="0.00"
                type="number"
                required
              />
            </div>
          </div>
        </div>
      </section>

      {/* Image Manager */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 shadow-md rounded-2xl p-8 md:p-10">
        <header className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[28px]">image</span>
          <h2 className="font-headline-md text-primary text-xl">Cover Image</h2>
        </header>

        <div>
          <label className="block text-sm font-bold text-primary mb-2">Featured Image URL *</label>
          <input
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline-variant transition-colors text-sm"
            placeholder="https://example.com/image.jpg"
            type="text"
            required
          />
        </div>
      </section>

      {/* Description */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 shadow-md rounded-2xl p-8 md:p-10">
        <header className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[28px]">description</span>
          <h2 className="font-headline-md text-primary text-xl">Retreat Content</h2>
        </header>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Short Intro Description</label>
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-on-surface placeholder:text-outline-variant transition-colors text-sm"
              placeholder="Brief teaser for listings..."
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Full Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border border-outline-variant rounded-lg p-4 text-on-surface focus:border-tertiary-fixed-dim focus:ring-1 focus:ring-tertiary-fixed-dim outline-none resize-y text-sm"
              placeholder="Describe the transformative experience awaiting the guests..."
              rows={6}
              required
            />
          </div>
        </div>
      </section>

      {/* Highlights, Inclusions & Exclusions */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 shadow-md rounded-2xl p-8 md:p-10 space-y-8">
        <div>
          <header className="mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[28px]">verified</span>
            <h2 className="font-headline-md text-primary text-xl">Package Highlights</h2>
          </header>
          <div className="flex gap-4 mb-4">
            <input
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-sm"
              placeholder="Add key highlight..."
            />
            <button
              type="button"
              onClick={addHighlight}
              className="px-4 py-2 bg-secondary text-on-secondary text-sm font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex justify-between items-center text-sm bg-surface-container-low p-2 rounded-lg">
                <span>{h}</span>
                <button type="button" onClick={() => removeHighlight(i)} className="text-error hover:underline cursor-pointer">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <hr className="border-outline-variant/30" />

        <div>
          <header className="mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[28px]">checklist</span>
            <h2 className="font-headline-md text-primary text-xl">What's Included</h2>
          </header>
          <div className="flex gap-4 mb-4">
            <input
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-sm"
              placeholder="Add inclusion..."
            />
            <button
              type="button"
              onClick={addInclusion}
              className="px-4 py-2 bg-secondary text-on-secondary text-sm font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {inclusions.map((inc, i) => (
              <li key={i} className="flex justify-between items-center text-sm bg-surface-container-low p-2 rounded-lg">
                <span>{inc}</span>
                <button type="button" onClick={() => removeInclusion(i)} className="text-error hover:underline cursor-pointer">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <hr className="border-outline-variant/30" />

        <div>
          <header className="mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[28px]">do_not_distribute</span>
            <h2 className="font-headline-md text-primary text-xl">What's Excluded</h2>
          </header>
          <div className="flex gap-4 mb-4">
            <input
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-sm"
              placeholder="Add exclusion..."
            />
            <button
              type="button"
              onClick={addExclusion}
              className="px-4 py-2 bg-secondary text-on-secondary text-sm font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {exclusions.map((exc, i) => (
              <li key={i} className="flex justify-between items-center text-sm bg-surface-container-low p-2 rounded-lg">
                <span>{exc}</span>
                <button type="button" onClick={() => removeExclusion(i)} className="text-error hover:underline cursor-pointer">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Itinerary Builder */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/30 shadow-md rounded-2xl p-8 md:p-10">
        <header className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[28px]">view_timeline</span>
          <h2 className="font-headline-md text-primary text-xl">Itinerary Builder</h2>
        </header>

        {/* Existing Days */}
        <div className="space-y-4 mb-8">
          {itinerary.map((day, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 relative group shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-secondary uppercase tracking-wider">
                  Day {day.day}
                </span>
                <button
                  type="button"
                  onClick={() => removeItineraryDay(idx)}
                  className="text-error hover:underline text-xs cursor-pointer"
                >
                  Delete
                </button>
              </div>
              <h4 className="font-bold text-primary">{day.title}</h4>
              <ul className="list-disc list-inside text-xs text-on-surface-variant mt-2 space-y-1">
                {day.activities.map((act, aIdx) => (
                  <li key={aIdx}>{act}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Add Day Form Box */}
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 space-y-4">
          <h4 className="font-bold text-primary">Add Day Details</h4>
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Day Title</label>
            <input
              value={itTitle}
              onChange={(e) => setItTitle(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary-fixed-dim focus:ring-0 px-0 py-2 text-sm"
              placeholder="e.g., Morning Flow &amp; Ayurvedic Consultation"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Activities (One per line)</label>
            <textarea
              value={itActivities}
              onChange={(e) => setItActivities(e.target.value)}
              className="w-full bg-transparent border border-outline-variant rounded-lg p-3 text-sm"
              placeholder="e.g. Sunrise Yoga&#10;Ayurvedic Consultation&#10;Evening Meditation"
              rows={3}
            />
          </div>
          <button
            type="button"
            onClick={addItineraryDay}
            className="w-full py-3 bg-secondary text-on-secondary font-bold text-sm rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            + Save Day to Itinerary
          </button>
        </div>
      </section>

      {/* Publish Bar */}
      <div className="flex gap-4 justify-end pt-8 border-t border-outline-variant/20">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-8 py-4 rounded-lg border border-outline text-on-surface hover:bg-surface-container-low transition-colors font-bold text-sm cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-bold text-sm shadow-md disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Creating...' : 'Publish Package'}
        </button>
      </div>
    </form>
  )
}
