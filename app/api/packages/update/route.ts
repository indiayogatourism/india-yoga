import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, packages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    const isAdminEmail = userEmail === "indiayogatourism@gmail.com"

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!isAdminEmail && dbUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const {
      id,
      title,
      slug,
      shortDescription,
      description,
      category,
      location,
      locationTag,
      durationDays,
      durationNights,
      priceShared,
      pricePrivate,
      originalPrice,
      maxGroupSize,
      difficultyLevel,
      featuredImage,
      gallery,
      highlights,
      inclusions,
      exclusions,
      isBestseller,
      isLimitedSpots,
      isRecommended,
      isNew,
      spotsLeft,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      customHtmlTags,
    } = body

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    // Check slug collision with other packages
    if (slug) {
      const existing = await prisma.package.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      })
      if (existing) {
        return NextResponse.json({ error: "Another package with this URL slug already exists." }, { status: 400 })
      }
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(slug && { slug: slug.trim() }),
        ...(category && { category }),
        ...(location !== undefined && { location }),
        ...(locationTag !== undefined && { locationTag }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(description !== undefined && { description }),
        ...(durationDays !== undefined && { durationDays: Number(durationDays) }),
        ...(durationNights !== undefined && { durationNights: Number(durationNights) }),
        ...(priceShared !== undefined && { priceShared: Number(priceShared) }),
        ...(pricePrivate !== undefined && { pricePrivate: Number(pricePrivate) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice !== null && originalPrice !== "" ? Number(originalPrice) : null }),
        ...(maxGroupSize !== undefined && { maxGroupSize: Number(maxGroupSize) }),
        ...(difficultyLevel !== undefined && { difficultyLevel }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(gallery !== undefined && {
          gallery: Array.isArray(gallery)
            ? gallery
            : typeof gallery === "string"
            ? gallery.split("\n").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
        ...(highlights !== undefined && {
          highlights: Array.isArray(highlights)
            ? highlights
            : typeof highlights === "string"
            ? highlights.split("\n").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
        ...(inclusions !== undefined && {
          inclusions: Array.isArray(inclusions)
            ? inclusions
            : typeof inclusions === "string"
            ? inclusions.split("\n").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
        ...(exclusions !== undefined && {
          exclusions: Array.isArray(exclusions)
            ? exclusions
            : typeof exclusions === "string"
            ? exclusions.split("\n").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
        ...(isBestseller !== undefined && { isBestseller: Boolean(isBestseller) }),
        ...(isLimitedSpots !== undefined && { isLimitedSpots: Boolean(isLimitedSpots) }),
        ...(isRecommended !== undefined && { isRecommended: Boolean(isRecommended) }),
        ...(isNew !== undefined && { isNew: Boolean(isNew) }),
        ...(spotsLeft !== undefined && { spotsLeft: spotsLeft !== null && spotsLeft !== "" ? Number(spotsLeft) : null }),
        ...(status && { status }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(metaKeywords !== undefined && { metaKeywords }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(ogTitle !== undefined && { ogTitle }),
        ...(ogDescription !== undefined && { ogDescription }),
        ...(ogImage !== undefined && { ogImage }),
        ...(customHtmlTags !== undefined && { customHtmlTags }),
      },
    })

    revalidatePath("/admin/packages")
    revalidatePath("/packages")
    revalidatePath(`/packages/${updatedPackage.slug}`)

    return NextResponse.json({ success: true, package: updatedPackage })
  } catch (error: any) {
    console.error("Package update error:", error)
    return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 })
  }
}
