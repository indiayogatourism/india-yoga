import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { uploadToS3 } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    const isAdmin = dbUser?.role === 'admin' || userEmail === 'indiayogatourism@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const formData = await req.formData()
    const rawFiles = formData.getAll('files').concat(formData.getAll('file'))
    const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      let fileUrl = ''
      // Check if AWS S3 credentials exist
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        try {
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const key = `uploads/${Date.now()}_${cleanFileName}`
          fileUrl = await uploadToS3(key, buffer, file.type || 'image/jpeg')
        } catch (s3Err: any) {
          console.error('AWS S3 Upload Failed (falling back to Base64 Data URL):', s3Err?.message || s3Err)
        }
      }

      if (!fileUrl) {
        // Fallback: Convert to Base64 Data URL for instant display without cloud setup
        const mimeType = file.type || 'image/jpeg'
        const base64Data = buffer.toString('base64')
        fileUrl = `data:${mimeType};base64,${base64Data}`
      }

      uploadedUrls.push(fileUrl)
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0] || '',
      urls: uploadedUrls,
    })
  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 })
  }
}
