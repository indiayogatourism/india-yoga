'use client'

import { useEffect, useRef } from 'react'
import { trackConversion, trackConversionOnce, type ConversionEvent, type ConversionSource, type EventParams } from '@/lib/analytics'

interface Props {
  event?: 'view_item' | 'begin_checkout' | 'purchase'
  packageId?: string
  packageSlug?: string
  source?: 'package' | 'checkout' | 'confirmation'
  dedupeKey?: string
  value?: number
  currency?: string
  price?: number
  quantity?: number
  transactionId?: string
}

function currentSource(): ConversionSource {
  const path = window.location.pathname
  if (path === '/') return 'homepage'
  if (path === '/contact') return 'contact'
  if (path === '/about') return 'about'
  if (path === '/packages') return 'package_listing'
  if (path.startsWith('/packages/')) return 'package'
  if (path.startsWith('/booking/')) return 'checkout'
  if (path.startsWith('/blog/')) return 'blog'
  if (path === '/destinations/rishikesh') return 'rishikesh_guide'
  return 'retreat_hub'
}

export default function ConversionTracking({ event, packageId, packageSlug, source = 'package', dedupeKey, value, currency, price, quantity, transactionId }: Props) {
  const tracked = useRef('')
  useEffect(() => {
    if (!event) {
      const click = (clickEvent: MouseEvent) => {
        const target = clickEvent.target instanceof Element ? clickEvent.target : null
        const anchor = target?.closest<HTMLAnchorElement>('a[href]')
        const element = target?.closest<HTMLElement>('[data-track-event]')
        let whatsapp = false
        try { whatsapp = !!anchor && ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(new URL(anchor.href).hostname) } catch { /* Ignore malformed links. */ }
        const action = whatsapp ? 'retreat_whatsapp_click' : element?.dataset.trackEvent
        if (!action || !['select_item', 'retreat_listing_click', 'booking_cta_click', 'retreat_whatsapp_click', 'whatsapp_enquiry_click'].includes(action)) return
        const context = element?.hasAttribute('data-retreat-id') ? element : target?.closest<HTMLElement>('[data-retreat-id]') || document.querySelector<HTMLElement>('main[data-retreat-id]')
        const params: EventParams = { package_id: context?.dataset.retreatId, package_slug: context?.dataset.retreatSlug || element?.dataset.trackPackage, source: currentSource() }
        if (context?.dataset.retreatPrice && context.dataset.retreatCurrency === 'USD') {
          params.price = Number(context.dataset.retreatPrice); params.value = params.price; params.currency = 'USD'
        }
        trackConversion(action as ConversionEvent, params)
      }
      document.addEventListener('click', click)
      return () => document.removeEventListener('click', click)
    }
    const record = () => {
      const eventKey = `${event}:${packageId || ''}:${dedupeKey || ''}`
      if (tracked.current === eventKey) return
      const params = { package_id: packageId, package_slug: packageSlug, source, value, currency, price, quantity, transaction_id: transactionId }
      if (dedupeKey ? trackConversionOnce(event, params, dedupeKey) : trackConversion(event, params)) tracked.current = eventKey
    }
    record()
    window.addEventListener('iyt:analytics-consent', record)
    window.addEventListener('iyt:analytics-ready', record)
    let attempts = 0
    const retry = window.setInterval(() => { record(); if (++attempts >= 30) window.clearInterval(retry) }, 1000)
    return () => { window.clearInterval(retry); window.removeEventListener('iyt:analytics-consent', record); window.removeEventListener('iyt:analytics-ready', record) }
  }, [event, packageId, packageSlug, source, dedupeKey, value, currency, price, quantity, transactionId])
  return null
}
