/**
 * EcoHub Kosova – Account Settings Form Component
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUserProfile } from "../profile/actions"
import { changePassword } from "./actions"
import {
  Loader2,
  Mail,
  User,
  MapPin,
  Globe,
  Check,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react"

interface AccountSettingsFormProps {
  userEmail: string
  userId: string
  initialFullName: string
  initialLocation: string
  currentLocale: string
}

export function AccountSettingsForm({
  userEmail,
  userId,
  initialFullName,
  initialLocation,
  currentLocale,
}: AccountSettingsFormProps) {
  const t = useTranslations("DashboardV2")
  const router = useRouter()

  // Profile form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState(currentLocale)

  // Password form state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const full_name = formData.get("full_name") as string
    const location = formData.get("location") as string

    const result = await updateUserProfile(userId, { full_name, location })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      setIsSubmitting(false)

      // If locale changed, navigate to new locale
      if (selectedLocale !== currentLocale) {
        router.push("/my/account", { locale: selectedLocale as "sq" | "en" })
      }
    }
  }

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsChangingPassword(true)
    setPasswordError(null)
    setPasswordFieldErrors({})
    setPasswordSuccess(false)

    const formData = new FormData(event.currentTarget)
    const result = await changePassword(null, formData)

    if (result.success) {
      setPasswordSuccess(true)
      // Reset the form
      event.currentTarget.reset()
    } else if (result.fieldErrors) {
      setPasswordFieldErrors(result.fieldErrors)
    } else if (result.error) {
      setPasswordError(result.error)
    }

    setIsChangingPassword(false)
  }

  function handleLocaleChange(newLocale: string) {
    setSelectedLocale(newLocale)
    // Navigate to the same page with the new locale
    router.push("/my/account", { locale: newLocale as "sq" | "en" })
  }

  return (
    <div className="space-y-6">
      {/* Account Information Card */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-600" />
            {t("account.emailSection")}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t("account.emailDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6 pt-0">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              {t("account.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="rounded-lg bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500">{t("account.emailNote")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information Card */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            {t("account.profileSection")}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t("account.profileDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-700">
                  {t("account.fullName")}
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  defaultValue={initialFullName}
                  required
                  className="rounded-lg"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("account.location")}
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={initialLocation}
                  placeholder={t("account.locationPlaceholder")}
                  className="rounded-lg"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">{t("account.success")}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("account.saving")}
                  </>
                ) : (
                  t("account.save")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            {t("account.passwordSection")}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t("account.passwordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6 pt-0">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700">
                  {t("account.currentPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    className="rounded-lg pr-10"
                    disabled={isChangingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {passwordFieldErrors.currentPassword && (
                  <p className="text-xs text-red-600">{passwordFieldErrors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">
                  {t("account.newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="rounded-lg pr-10"
                    disabled={isChangingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">{t("account.passwordHint")}</p>
                {passwordFieldErrors.newPassword && (
                  <p className="text-xs text-red-600">{passwordFieldErrors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  {t("account.confirmPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="rounded-lg pr-10"
                    disabled={isChangingPassword}
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
                {passwordFieldErrors.confirmPassword && (
                  <p className="text-xs text-red-600">{passwordFieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {passwordError && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">{t("account.passwordSuccess")}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("account.changingPassword")}
                  </>
                ) : (
                  t("account.changePassword")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Language Preferences Card */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CardHeader className="p-5 md:p-6">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="h-5 w-5 text-emerald-600" />
            {t("account.languageSection")}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t("account.languageDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6 pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-gray-700">
                {t("account.preferredLanguage")}
              </Label>
              <Select value={selectedLocale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sq">
                    <span className="flex items-center gap-2">🇽🇰 Shqip</span>
                  </SelectItem>
                  <SelectItem value="en">
                    <span className="flex items-center gap-2">🇬🇧 English</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{t("account.languageNote")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
