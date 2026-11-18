import { prisma } from '@/lib/prisma'
import { decodePackageImage, getPackageImageUrl } from '@/lib/packageImages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ packageId: string; image: string }> }) {
  const { packageId, image } = await params
  const match = /^(\d{1,3})-([a-f0-9]{24})\.(jpg|png|webp|gif|avif)$/.exec(image)
  const missing = () => new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(packageId) || !match) return missing()
  try {
    const pkg = await prisma.package.findFirst({ where: { id: packageId, status: 'PUBLISHED' }, select: { id: true, featuredImage: true, gallery: true } })
    if (!pkg) return missing()
    const index = Number(match[1])
    const path = getPackageImageUrl(pkg, index)
    if (path !== `/retreat-images/${packageId}/${image}`) return missing()
    const source = index === 0 ? pkg.featuredImage : pkg.gallery[index - 1]
    const decoded = source && decodePackageImage(source)
    if (!decoded) return missing()
    const headers = {
      'Content-Type': decoded.contentType, 'X-Content-Type-Options': 'nosniff',
      // A content-versioned URL changes when the saved photo changes. Revalidate daily
      // so unpublishing a package also expires previously cached photos.
      'Cache-Control': 'public, max-age=86400', ETag: `"${match[2]}"`,
    }
    if (request.headers.get('if-none-match') === headers.ETag) return new Response(null, { status: 304, headers })
    return new Response(new Uint8Array(decoded.bytes), { headers })
  } catch {
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
