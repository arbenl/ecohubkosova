"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateUserProfile } from "./actions"
import { Loader2, ArrowLeft } from "lucide-react"

interface UserProfileEditFormProps {
  userId: string
  initialFullName: string
  initialLocation: string
  locale: string
}

export function UserProfileEditForm({
  userId,
  initialFullName,
  initialLocation,
  locale,
}: UserProfileEditFormProps) {
  const t = useTranslations("my-profile")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
      setTimeout(() => {
        router.push(`/${locale}/my`)
      }, 1500)
    }
  }

  return (
    <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <CardHeader className="p-5 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">{t("formTitle")}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {t("formDescription")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">{t("fields.fullName")}</Label>
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
            <Label htmlFor="location">{t("fields.location")}</Label>
            <Input
              id="location"
              name="location"
              type="text"
              defaultValue={initialLocation}
              placeholder={t("fields.locationPlaceholder")}
              className="rounded-lg"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">{t("success")}</p>
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
                  {t("saving")}
                </>
              ) : (
                t("save")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-full"
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
