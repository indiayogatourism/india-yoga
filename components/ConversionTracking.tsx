'use client'

import { useEffect, useRef } from 'react'
import { trackConversion, trackConversionOnce, type ConversionEvent } from '@/lib/analytics'

interface Props {
  event?: 'package_view' | 'checkout_start' | 'booking_confirmed'
  packageSlug?: string
  source?: 'package' | 'checkout' | 'confirmation'
  dedupeKey?: string
  value?: number
  currency?: string
}

export default function ConversionTracking({ event, packageSlug, source = 'package', dedupeKey, value, currency }: Props) {
  const tracked = useRef('')
  useEffect(() => {
    if (!event) {
      const click = (clickEvent: MouseEvent) => {
        const element = clickEvent.target instanceof Element ? clickEvent.target.closest<HTMLElement>('[data-track-event]') : null
        const action = element?.dataset.trackEvent
        if (!element || !['retreat_listing_click', 'booking_cta_click', 'whatsapp_enquiry_click'].includes(action || '')) return
        const source = window.location.pathname === '/contact' ? 'contact' : window.location.pathname.startsWith('/packages/') ? 'package' : 'retreat_hub'
        trackConversion(action as ConversionEvent, { package_slug: element.dataset.trackPackage, source })
      }
      document.addEventListener('click', click)
      return () => document.removeEventListener('click', click)
    }
    const record = () => {
      const eventKey = `${event}:${packageSlug || ''}:${dedupeKey || ''}`
      if (tracked.current === eventKey) return
      const params = { package_slug: packageSlug, source, value, currency }
      if (dedupeKey ? trackConversionOnce(event, params, dedupeKey) : trackConversion(event, params)) tracked.current = eventKey
    }
    record()
    window.addEventListener('iyt:analytics-consent', record)
    return () => window.removeEventListener('iyt:analytics-consent', record)
  }, [event, packageSlug, source, dedupeKey, value, currency])
  return null
}
