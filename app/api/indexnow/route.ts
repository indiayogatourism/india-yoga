/**
 * GET /api/indexnow
 *
 * IndexNow requires that search engines can verify your key by fetching it
 * from  <siteUrl>/<key>.txt  OR from a location you declare in the payload.
 * We declare  keyLocation: "<siteUrl>/api/indexnow"  so this route serves
 * the key as plain text.
 *
 * Set INDEXNOW_KEY in .env (e.g. a UUID like "a1b2c3d4-...").
 */
export const dynamic = 'force-static'

export async function GET() {
  const key = process.env.INDEXNOW_KEY || ''

  if (!key) {
    return new Response('IndexNow key not configured', { status: 404 })
  }

  return new Response(key, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
