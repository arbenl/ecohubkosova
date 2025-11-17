"use client"

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
  const { formData, fieldErrors, saving, error, success, handleChange, handleSubmit } = useUserProfileForm({
    initialFullName,
    initialLocation,
    submit: updateUserProfile,
  })

  return (
    <div>
      <FormStatus error={error} success={success} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Emri i Plotë" name="emri_i_plote" error={fieldErrors.emri_i_plote}>
          <Input name="emri_i_plote" value={formData.emri_i_plote} onChange={handleChange} />
        </FormField>
        <FormField label="Email" name="email">
          <Input name="email" value={initialEmail} disabled />
        </FormField>
        <FormField label="Vendndodhja" name="vendndodhja" error={fieldErrors.vendndodhja}>
          <Input name="vendndodhja" value={formData.vendndodhja} onChange={handleChange} />
        </FormField>
        <Button type="submit" disabled={saving}>
          {saving ? "Duke ruajtur..." : "Ruaj"}
        </Button>
      </form>
    </div>
  )
}
