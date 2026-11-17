'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { trackConversion } from '@/lib/analytics'

interface Props { options: { slug: string; title: string }[]; initialRetreat: string; initialDestination: string }
const fieldClass = 'min-h-12 w-full rounded-xl border border-[#17372b]/25 bg-white px-3 py-3 text-sm text-[#17372b] focus:border-[#17372b] focus:outline-none focus:ring-2 focus:ring-[#64774d]/30'

export default function RetreatEnquiryForm({ options, initialRetreat, initialDestination }: Props) {
  const [packageSlug, setPackageSlug] = useState(initialRetreat)
  const [startDate, setStartDate] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'success'>('idle')
  const [error, setError] = useState('')
  const feedbackRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (error || state === 'success') feedbackRef.current?.focus() }, [error, state])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return
    const form = new FormData(event.currentTarget)
    setState('sending')
    setError('')
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'), email: form.get('email'), phone: form.get('phone'),
          category: 'Retreat', packageSlug, destination: form.get('destination'),
          preferredStartDate: form.get('preferredStartDate'), preferredEndDate: form.get('preferredEndDate'),
          guests: Number(form.get('guests')), message: form.get('message'),
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Your enquiry could not be saved. Please try again.')
      trackConversion('enquiry_submit', { package_slug: packageSlug, source: 'contact' })
      setState('success')
    } catch (failure) {
      setState('idle')
      setError(failure instanceof Error ? failure.message : 'We could not send your enquiry. Please try again or contact us directly.')
    }
  }

  return <section className="rounded-3xl border border-[#17372b]/15 bg-white p-6 md:p-8" aria-labelledby="enquiry-heading">
    <h2 id="enquiry-heading" className="font-display-lg text-3xl text-[#17372b]">Your retreat enquiry</h2>
    {state === 'success' ? <div ref={feedbackRef} tabIndex={-1} role="status" className="mt-6 rounded-2xl bg-[#e9ecdf] p-6 text-[#17372b]"><h3 className="text-xl font-bold">Your enquiry has been received</h3><p className="mt-3 leading-7">The team can now review your travel preferences and respond using the contact details you provided. This is an enquiry, not a booking confirmation.</p><button type="button" onClick={() => setState('idle')} className="mt-5 min-h-11 font-bold underline underline-offset-4">Send another enquiry</button></div> : <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2" aria-busy={state === 'sending'}>
      {error && <div ref={feedbackRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:col-span-2">{error}</div>}
      <div><label htmlFor="enquiry-name" className="mb-2 block text-sm font-semibold text-[#17372b]">Your name *</label><input id="enquiry-name" name="name" autoComplete="name" required maxLength={120} className={fieldClass} /></div>
      <div><label htmlFor="enquiry-email" className="mb-2 block text-sm font-semibold text-[#17372b]">Email *</label><input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} /></div>
      <div><label htmlFor="enquiry-phone" className="mb-2 block text-sm font-semibold text-[#17372b]">Phone / WhatsApp (optional)</label><input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className={fieldClass} /></div>
      <div><label htmlFor="enquiry-guests" className="mb-2 block text-sm font-semibold text-[#17372b]">Guests *</label><input id="enquiry-guests" name="guests" type="number" min={1} max={50} step={1} defaultValue={1} required className={fieldClass} /></div>
      <div className="sm:col-span-2"><label htmlFor="enquiry-retreat" className="mb-2 block text-sm font-semibold text-[#17372b]">Retreat interest</label><select id="enquiry-retreat" name="packageSlug" value={packageSlug} onChange={(event) => setPackageSlug(event.target.value)} className={fieldClass}><option value="">Help me choose / another experience</option>{options.map((option) => <option key={option.slug} value={option.slug}>{option.title}</option>)}</select></div>
      <div className="sm:col-span-2"><label htmlFor="enquiry-destination" className="mb-2 block text-sm font-semibold text-[#17372b]">Destination or location interest</label><input id="enquiry-destination" name="destination" defaultValue={initialDestination} maxLength={160} placeholder="For example, Rishikesh" className={fieldClass} /></div>
      <div><label htmlFor="enquiry-start" className="mb-2 block text-sm font-semibold text-[#17372b]">Preferred arrival (optional)</label><input id="enquiry-start" name="preferredStartDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={fieldClass} /></div>
      <div><label htmlFor="enquiry-end" className="mb-2 block text-sm font-semibold text-[#17372b]">Preferred departure (optional)</label><input id="enquiry-end" name="preferredEndDate" type="date" min={startDate || undefined} className={fieldClass} /></div>
      <div className="sm:col-span-2"><label htmlFor="enquiry-message" className="mb-2 block text-sm font-semibold text-[#17372b]">Your questions or preferences *</label><textarea id="enquiry-message" name="message" rows={5} maxLength={5000} required placeholder="Tell us what you would like to know about the retreat." className={fieldClass} /></div>
      <p className="text-xs leading-6 text-[#536457] sm:col-span-2">We use these details to respond to your enquiry. Please avoid sending passport, payment or medical information here. Read our <Link href="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link>. Fields marked * are required.</p>
      <button type="submit" disabled={state === 'sending'} className="min-h-12 rounded-full bg-[#17372b] px-6 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{state === 'sending' ? 'Sending your enquiry…' : 'Send retreat enquiry'}</button>
    </form>}
  </section>
}
