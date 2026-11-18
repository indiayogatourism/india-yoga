import { createHash } from 'node:crypto'

interface ImagePackage { id: string; featuredImage: string | null; gallery?: string[]; ogImage?: string | null }
const maxEmbeddedBytes = 8 * 1024 * 1024

/** Raster-only saved data; never fetch remote/user-supplied URLs or execute SVG. */
export function decodePackageImage(value: string) {
  if (value.length > Math.ceil(maxEmbeddedBytes * 4 / 3) + 100) return null
  const match = /^data:image\/(jpeg|png|webp|gif|avif);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match) return null
  const bytes = Buffer.from(match[2], 'base64')
  if (!bytes.length || bytes.length > maxEmbeddedBytes || bytes.toString('base64') !== match[2]) return null
  const type = match[1]
  const valid = type === 'jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : type === 'png' ? bytes.toString('hex', 0, 8) === '89504e470d0a1a0a'
    : type === 'webp' ? bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
    : type === 'gif' ? /^GIF8[79]a$/.test(bytes.toString('ascii', 0, 6))
    : bytes.toString('ascii', 4, 8) === 'ftyp' && /avif|avis/.test(bytes.toString('ascii', 8, 32))
  return valid ? { bytes, contentType: `image/${type}`, extension: type === 'jpeg' ? 'jpg' : type } : null
}

export function getPackageImageUrl(pkg: ImagePackage, index: number): string | null {
  const source = index === 0 ? pkg.featuredImage : pkg.gallery?.[index - 1]
  if (!source) return null
  if (!source.startsWith('data:')) return source
  const image = decodePackageImage(source)
  if (!image || !/^[a-zA-Z0-9_-]{1,128}$/.test(pkg.id)) return null
  const version = createHash('sha256').update(new Uint8Array(image.bytes)).digest('hex').slice(0, 24)
  return `/retreat-images/${pkg.id}/${index}-${version}.${image.extension}`
}

/** Published renders use URLs; original CMS content is untouched, including draft previews. */
export function withPackageImageUrls<T extends ImagePackage>(pkg: T): T {
  const result = { ...pkg, featuredImage: getPackageImageUrl(pkg, 0) }
  if (pkg.gallery) result.gallery = pkg.gallery.map((_, index) => getPackageImageUrl(pkg, index + 1)).filter((src): src is string => !!src)
  if (pkg.ogImage?.startsWith('data:')) {
    const index = [pkg.featuredImage, ...(pkg.gallery || [])].indexOf(pkg.ogImage)
    result.ogImage = index >= 0 ? getPackageImageUrl(pkg, index) : null
  }
  return result
}
