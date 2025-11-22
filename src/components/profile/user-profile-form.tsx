"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "./form-field"
import { FormStatus } from "./form-status"
import { updateUserProfile } from "@/app/[locale]/(protected)/profile/actions"
import { useUserProfileForm } from "@/hooks/use-profile-forms"

interface UserProfileFormProps {
  initialFullName: string
  initialEmail: string
  initialLocation: string
}

export function UserProfileForm({ initialFullName, initialEmail, initialLocation }: UserProfileFormProps) {
  const t = useTranslations("profile")
  const tAuth = useTranslations("auth")
  const { formData, fieldErrors, saving, error, success, handleChange, handleSubmit } = useUserProfileForm({
    initialFullName,
    initialLocation,
    submit: updateUserProfile,
  })

  return (
    <div>
      <FormStatus error={error} success={success} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={tAuth("fullName")} name="full_name" error={fieldErrors.full_name}>
          <Input name="full_name" value={formData.full_name} onChange={handleChange} />
        </FormField>
        <FormField label={tAuth("email")} name="email">
          <Input name="email" value={initialEmail} disabled />
        </FormField>
        <FormField label={tAuth("location")} name="location" error={fieldErrors.location}>
          <Input name="location" value={formData.location} onChange={handleChange} />
        </FormField>
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
      </form>
    </div>
  )
}
