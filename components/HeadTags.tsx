import React from 'react'

/**
 * Renders admin-supplied "custom HTML tags" (meta / link / script / title)
 * as real React elements so they end up inside <head>.
 *
 * Why: injecting the raw string via dangerouslySetInnerHTML inside a hidden
 * <div> puts tags like <meta name="google-site-verification"> in <body>,
 * where Google Search Console (and most crawlers) ignore them.
 *
 * - In app/layout.tsx this is rendered directly inside <head>.
 * - In page components, React 19 automatically hoists <meta>, <link> and
 *   <title> into <head>; JSON-LD <script> tags are valid anywhere.
 * Anything that isn't a recognised head tag is kept in a hidden <div>
 * (previous behaviour) so no admin content is silently dropped.
 */

const ATTR_MAP: Record<string, string> = {
  charset: 'charSet',
  'http-equiv': 'httpEquiv',
  class: 'className',
  crossorigin: 'crossOrigin',
  referrerpolicy: 'referrerPolicy',
  hreflang: 'hrefLang',
  nomodule: 'noModule',
  fetchpriority: 'fetchPriority',
  imagesrcset: 'imageSrcSet',
  imagesizes: 'imageSizes',
  itemprop: 'itemProp',
}
const BOOLEAN_ATTRS = new Set(['async', 'defer', 'nomodule'])

function parseAttrs(raw: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {}
  const re = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase()
    const value = m[2] ?? m[3] ?? m[4]
    const key = ATTR_MAP[name] ?? name
    attrs[key] = BOOLEAN_ATTRS.has(name) ? true : value ?? ''
  }
  return attrs
}

export function parseHeadTags(html: string, skipMetaNames: string[] = []) {
  const skip = new Set(skipMetaNames.map((n) => n.toLowerCase()))
  const elements: React.ReactNode[] = []
  let leftover = html.replace(/<!--[\s\S]*?-->/g, '')
  let i = 0

  // <script ...>...</script>
  leftover = leftover.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (_, a, body) => {
    const attrs = parseAttrs(a)
    const content = String(body).trim()
    elements.push(
      content
        ? <script key={`hs${i++}`} {...attrs} dangerouslySetInnerHTML={{ __html: content }} />
        : <script key={`hs${i++}`} {...attrs} />
    )
    return ''
  })

  // <title>...</title>
  leftover = leftover.replace(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi, (_, t) => {
    elements.push(<title key={`ht${i++}`}>{String(t).trim()}</title>)
    return ''
  })

  // <meta ...> and <link ...> (void elements)
  leftover = leftover.replace(/<(meta|link)\b([^>]*?)\/?>/gi, (_, tag, a) => {
    const attrs = parseAttrs(a)
    if (tag.toLowerCase() === 'meta' && typeof attrs.name === 'string' && skip.has(attrs.name.toLowerCase())) {
      return ''
    }
    elements.push(
      tag.toLowerCase() === 'meta'
        ? <meta key={`hm${i++}`} {...attrs} />
        : <link key={`hl${i++}`} {...attrs} />
    )
    return ''
  })

  return { elements, leftover: leftover.trim() }
}

export default function HeadTags({
  html,
  part = 'all',
  skipMetaNames = [],
}: {
  html?: string | null
  /** meta names already emitted elsewhere (e.g. via the Metadata API) — dropped to avoid duplicates */
  skipMetaNames?: string[]
  /** 'head' = only meta/link/script/title, 'body' = only the non-head leftovers */
  part?: 'all' | 'head' | 'body'
}) {
  if (!html || !html.trim()) return null
  const { elements, leftover } = parseHeadTags(html, skipMetaNames)
  return (
    <>
      {part !== 'body' && elements}
      {part !== 'head' && leftover && (
        <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: leftover }} />
      )}
    </>
  )
}
