import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/dashboard/ProfileForm"
import { User, Mail, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfileSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const clerkUser = await currentUser()
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!dbUser) redirect("/sign-in")

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-headline-md font-bold text-2xl text-primary">
          Profile Settings
        </h1>
        <p className="text-sm text-on-surface-variant">
          Manage your personal information and contact details for ashram stays.
        </p>
      </div>

      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/30">
          {clerkUser?.imageUrl ? (
            <img
              src={clerkUser.imageUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border-2 border-primary/20">
              {dbUser.name.charAt(0)}
            </div>
          )}

          <div>
            <h2 className="font-headline-md font-bold text-xl text-primary">
              {clerkUser?.fullName || dbUser.name}
            </h2>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-outline" />
              <span>{dbUser.email}</span>
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Clerk Verified Guest Account</span>
            </span>
          </div>
        </div>

        {/* Profile Edit Form */}
        <ProfileForm
          initialData={{
            name: dbUser.name || clerkUser?.fullName || "",
            phone: dbUser.phone || "",
            country: dbUser.country || "",
          }}
        />
      </div>
    </div>
  )
}
