import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import CreatePackageForm from '@/components/CreatePackageForm'

export default async function NewPackagePage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    redirect('/sign-in')
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!dbUser || dbUser.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen">
      {/* Admin Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors group"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                arrow_back
              </span>
            </Link>
            <div>
              <span className="text-xs font-label-price text-outline uppercase tracking-wider block mb-1">
                Package Builder
              </span>
              <h1 className="font-headline-md text-2xl leading-none text-primary">
                Create New Retreat Package
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <CreatePackageForm />
      </main>
    </div>
  )
}
