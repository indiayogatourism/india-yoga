import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
}
