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
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    await prisma.package.delete({
      where: { id },
    })

    revalidatePath("/admin/packages")
    revalidatePath("/packages")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Package delete error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 })
  }
}
