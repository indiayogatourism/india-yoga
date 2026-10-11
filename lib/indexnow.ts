/**
 * IndexNow – notifies Bing, Yandex, and (via Bing) Google when pages
 * are created or updated so they get crawled faster.
 *
 * Set INDEXNOW_KEY in your .env to a random UUID / alphanumeric string.
 * Then expose that key at  GET /api/indexnow  (see app/api/indexnow/route.ts).
 *
 * Docs: https://www.indexnow.org/documentation
 */

import { SITE_URL } from '@/lib/siteUrl'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || ''

// Bing endpoint propagates to Yandex; Google honours the same protocol.
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
]

/**
 * Ping IndexNow with one or more URLs.
 * Safe to call fire-and-forget – errors are only logged, never thrown.
 */
export async function pingIndexNow(urls: string | string[]): Promise<void> {
  if (!INDEXNOW_KEY) {
    // Key not configured – skip silently (dev / staging)
    return
  }

  const urlList = (Array.isArray(urls) ? urls : [urls]).map((u) =>
    u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? u : `/${u}`}`
  )

  if (urlList.length === 0) return

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/api/indexnow`,
    urlList,
  }

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
        // Don't block the request handler – give it 5 s max
        signal: AbortSignal.timeout(5000),
      })
      console.log(`[IndexNow] ${endpoint} → ${res.status}`)
    } catch (err) {
      console.warn(`[IndexNow] Failed to ping ${endpoint}:`, err)
    }
  }
}

/** Convenience helpers for each content type */
export const indexNowPackage = (slug: string) =>
  pingIndexNow([`/packages/${slug}`, '/packages'])

export const indexNowBlog = (slug: string) =>
  pingIndexNow([`/blog/${slug}`, '/blog'])

export const indexNowOnlineClass = (slug: string) =>
  pingIndexNow([`/online-classes/${slug}`, '/online-classes'])

export const indexNowPage = (slug: string) =>
  pingIndexNow([`/${slug}`, '/know-more'])
