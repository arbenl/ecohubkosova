"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateOrganizationProfile } from "./actions"
import { Loader2, ArrowLeft } from "lucide-react"

interface OrganizationProfileEditFormProps {
  organizationId: string
  initialData: {
    name: string
    description: string
    primary_interest: string
    contact_person: string
    contact_email: string
    location: string
  }
  locale: string
}

export function OrganizationProfileEditForm({
  organizationId,
  initialData,
  locale,
}: OrganizationProfileEditFormProps) {
  const t = useTranslations("my-organization-profile")
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
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      primary_interest: formData.get("primary_interest") as string,
      contact_person: formData.get("contact_person") as string,
      contact_email: formData.get("contact_email") as string,
      location: formData.get("location") as string,
    }

    const result = await updateOrganizationProfile(organizationId, data)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setSuccess(true)
      setIsSubmitting(false)
      setTimeout(() => {
        router.push("/my/organization")
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
            <Label htmlFor="name">{t("fields.name")}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={initialData.name}
              required
              className="rounded-lg"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("fields.description")}</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData.description}
              required
              rows={4}
              className="rounded-lg"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_interest">{t("fields.primaryInterest")}</Label>
            <Input
              id="primary_interest"
              name="primary_interest"
              type="text"
              defaultValue={initialData.primary_interest}
              className="rounded-lg"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">{t("fields.contactPerson")}</Label>
            <Input
              id="contact_person"
              name="contact_person"
              type="text"
              defaultValue={initialData.contact_person}
              required
              className="rounded-lg"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">{t("fields.contactEmail")}</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={initialData.contact_email}
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
              defaultValue={initialData.location}
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
