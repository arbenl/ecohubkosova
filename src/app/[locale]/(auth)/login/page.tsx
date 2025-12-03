"use client"
/* eslint-env browser */
/* global HTMLFormElement, FormData */

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter, Link } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signInWithGoogle, type SignInResponse } from "./actions"
import type { Locale } from "@/lib/locale"
import { defaultLocale } from "@/lib/locale"
import { useSupabase } from "@/lib/auth-provider"

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const t = useTranslations("auth")
  return (
    <Button
      type="submit"
      className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
      disabled={isSubmitting}
      data-testid="login-submit-button"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          {t("signingIn")}
        </div>
      ) : (
        t("signIn")
      )}
    </Button>
  )
}

function GoogleSignInButton({ isSubmitting }: { isSubmitting: boolean }) {
  const t = useTranslations("auth")
  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle()
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isSubmitting}
      type="button"
      className="w-full rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
          {t("redirecting")}
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
          {t("signInGoogle")}
        </>
      )}
    </button>
  )
}

export default function KycuPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const locale = (useLocale() as Locale | undefined) ?? defaultLocale
  const supabase = useSupabase()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectInProgressRef = useRef(false)

  // Reset the redirect flag when navigating back to this page
  useEffect(() => {
    redirectInProgressRef.current = false
    setIsSubmitting(false)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting || redirectInProgressRef.current) return

    setIsSubmitting(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      const result: SignInResponse = await signIn(null, formData)

      // Handle errors
      if (result.message) {
        setError(result.message)
        setIsSubmitting(false)
        return
      }

      // Handle successful login
      if (result.success === true) {
        // If the server returned session tokens, set them on the client
        if (result.session && supabase) {
          try {
            await supabase.auth.setSession(result.session)
          } catch {
            // ignore setSession errors; fallback to full refresh
          }
        }

        redirectInProgressRef.current = true
        // Give the browser a moment to update state before redirecting
        await new Promise((resolve) => setTimeout(resolve, 100))
        // Refresh RSC tree so middleware and server layouts see new cookies/session
        try {
          router.refresh()
        } catch {
          /* ignore */
        }

        router.push("/my")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginError"))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5">
      <div className="max-w-md mx-auto glass-card rounded-2xl p-8 shadow-none border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("welcome")}</h1>
          <p className="text-gray-600">{t("signInDescription")}</p>
        </div>

        {message && (
          <Alert className="mb-6 border-[#00C896]/20 bg-[#00C896]/5">
            <AlertCircle className="h-4 w-4 text-[#00C896]" />
            <AlertDescription className="text-gray-700">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              {t("email")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@example.com"
              autoComplete="email"
              className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
              required
              disabled={isSubmitting}
              data-testid="login-email-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896]"
              required
              disabled={isSubmitting}
              data-testid="login-password-input"
            />
          </div>

          <SubmitButton isSubmitting={isSubmitting} />
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">{t("orContinueWith")}</span>
          </div>
        </div>

        <GoogleSignInButton isSubmitting={isSubmitting} />

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {t("noAccountQuestion")}{" "}
            <Link
              href="/register"
              className="text-[#00C896] hover:text-[#00A07E] font-medium transition-colors"
            >
              {t("registerHere")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
