/**
 * EcoHub Kosova – Forgot Password Page
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requestPasswordReset } from "./actions"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await requestPasswordReset(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      setEmail(formData.get("email") as string)
      setIsSubmitting(false)
    }
  }

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
                {t("forgotPassword.emailSentTitle")}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t("forgotPassword.emailSentDescription", { email })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 text-center">
                {t("forgotPassword.emailSentNote")}
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("forgotPassword.backToLogin")}
                  </Link>
                </Button>
              </div>
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
              <Mail className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t("forgotPassword.title")}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t("forgotPassword.description")}
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
                />
              </div>

              <Button
                type="submit"
                className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("forgotPassword.sending")}
                  </div>
                ) : (
                  t("forgotPassword.sendResetLink")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-[#00C896] transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("forgotPassword.backToLogin")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
