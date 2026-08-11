import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export const dynamic = "force-dynamic"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    redirect("/sign-in")
  }

  // Ensure DB User exists
  const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  const isAdminEmail = userEmail === "indiayogatourism@gmail.com"

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: userEmail || clerkUser.emailAddresses[0]?.emailAddress || "",
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Guest User",
        role: isAdminEmail ? "admin" : "guest",
      },
    })
  }

  // Redirect admin users to admin panel
  if (dbUser.role === "admin" || isAdminEmail) {
    redirect("/admin")
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
