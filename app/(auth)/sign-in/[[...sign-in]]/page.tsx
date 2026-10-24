import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      {/* redirect_url (set by middleware) wins; otherwise go to /dashboard,
          which forwards admins to /admin automatically. */}
      <SignIn routing="path" path="/sign-in" fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" />
    </div>
  )
}
