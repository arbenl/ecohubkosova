/**
 * EcoHub Kosova – Reset Password Page
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resetPassword } from "./actions"
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  // Check if we have a valid session from the email link
  useEffect(() => {
    const checkSession = async () => {
      // The auth callback should have set up the session
      // We check if we have tokens in the URL hash or a valid session
      const hash = window.location.hash
      if (hash && (hash.includes("access_token") || hash.includes("type=recovery"))) {
        setIsValidSession(true)
      } else {
        // Check URL params for error
        const errorParam = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")
        if (errorParam) {
          setError(errorDescription || t("resetPassword.invalidLink"))
          setIsValidSession(false)
        } else {
          // Assume valid if no error - the action will verify
          setIsValidSession(true)
        }
      }
    }
    checkSession()
  }, [searchParams, t])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await resetPassword(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      setIsSubmitting(false)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }
  }

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Invalid link state
  if (isValidSession === false && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5 py-12">
        <div className="container px-4 md:px-6 max-w-md">
          <Card className="glass-card rounded-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {t("resetPassword.invalidLinkTitle")}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t("resetPassword.invalidLinkDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full eco-gradient rounded-xl">
                <Link href="/forgot-password">{t("resetPassword.requestNewLink")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5 py-12">
        <div className="container px-4 md:px-6 max-w-md">
          <Card className="glass-card rounded-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {t("resetPassword.successTitle")}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t("resetPassword.successDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 text-center">{t("resetPassword.redirecting")}</p>
              <Button asChild className="w-full eco-gradient rounded-xl">
                <Link href="/login">{t("signIn")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C896]/5 to-[#00A07E]/5 py-12">
      <div className="container px-4 md:px-6 max-w-md">
        <Card className="glass-card rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <KeyRound className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t("resetPassword.title")}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t("resetPassword.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  {t("resetPassword.newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896] pr-10"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">{t("resetPassword.passwordHint")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  {t("resetPassword.confirmPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="rounded-xl border-gray-200 focus:border-[#00C896] focus:ring-[#00C896] pr-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("resetPassword.resetting")}
                  </div>
                ) : (
                  t("resetPassword.resetPassword")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
