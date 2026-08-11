import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
      durationDays,
      durationNights,
      priceShared,
      pricePrivate,
      featuredImage,
      inclusions,
      status,
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
        ...(shortDescription !== undefined && { shortDescription, description: shortDescription }),
        ...(durationDays && { durationDays: Number(durationDays) }),
        ...(durationNights && { durationNights: Number(durationNights) }),
        ...(priceShared && { priceShared: Number(priceShared) }),
        ...(pricePrivate && { pricePrivate: Number(pricePrivate) }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(inclusions !== undefined && {
          inclusions: Array.isArray(inclusions)
            ? inclusions
            : typeof inclusions === "string"
            ? inclusions.split("\n").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
        ...(status && { status }),
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
