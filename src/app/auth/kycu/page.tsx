"use client"

import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signInWithGoogle } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Duke u kyçur...
        </div>
      ) : (
        "Kyçu"
      )}
    </Button>
  )
}

function GoogleSignInButton() {
  const { pending } = useFormStatus()

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle()
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={pending}
      type="button"
      className="w-full rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
          Duke u ridrejtuar...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.38 0-1.5.62-1.5 1.4V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
          </svg>
          Kyçu me Google
        </>
      )}
    </button>
  )
}

export default function KycuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const [state, formAction] = useFormState(signIn, null)

  // Handle client-side redirect after successful login or Google OAuth redirect
  useEffect(() => {
    if (!state) return

    // Handle successful login - redirect to dashboard
    if (state.success === true) {
      router.push("/dashboard")
      return
    }

    // Handle Google OAuth redirect
    if ("redirectUrl" in state && state.redirectUrl) {
      window.location.href = state.redirectUrl
      return
    }
  }, [state, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5">
      <div className="max-w-md mx-auto glass-card rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mirë se erdhe</h1>
          <p className="text-gray-600">Kyçu në llogarinë tënde</p>
        </div>

        {message && (
          <Alert className="mb-6 border-[#00C896]/20 bg-[#00C896]/5">
            <AlertCircle className="h-4 w-4 text-[#00C896]" />
            <AlertDescription className="text-gray-700">{message}</AlertDescription>
          </Alert>
        )}

        {state?.message && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{state.message}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@example.com"
              autoComplete="email"
              className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Fjalëkalimi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
              required
            />
          </div>

          <SubmitButton />
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Ose vazhdo me</span>
          </div>
        </div>

        <GoogleSignInButton />

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Nuk ke llogari?{" "}
            <a href="/auth/regjistrohu" className="text-[#00C896] hover:text-[#00A07E] font-medium transition-colors">
              Regjistrohu këtu
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
