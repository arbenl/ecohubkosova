"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "./form-field"
import { FormStatus } from "./form-status"
import { updateOrganizationProfile } from "../actions"
import type { OrganizationProfileUpdateInput } from "@/validation/profile"
import { useOrganizationProfileForm } from "@/hooks/use-profile-forms"

interface OrgProfileFormProps {
  organizationId: string
  initialData: OrganizationProfileUpdateInput
}

export function OrganizationProfileForm({ organizationId, initialData }: OrgProfileFormProps) {
  const { formData, fieldErrors, saving, error, success, handleChange, handleSubmit } = useOrganizationProfileForm({
    organizationId,
    initialData,
    submit: updateOrganizationProfile,
  })

  return (
    <div>
      <FormStatus error={error} success={success} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Emri" name="name" error={fieldErrors.name}>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </FormField>
        <FormField label="Përshkrimi" name="description" error={fieldErrors.description}>
          <Textarea name="description" value={formData.description} onChange={handleChange} />
        </FormField>
        <FormField label="Interesi Primar" name="primary_interest" error={fieldErrors.primary_interest}>
          <Input name="primary_interest" value={formData.primary_interest} onChange={handleChange} />
        </FormField>
        <FormField label="Person Kontakti" name="contact_person" error={fieldErrors.contact_person}>
          <Input name="contact_person" value={formData.contact_person} onChange={handleChange} />
        </FormField>
        <FormField label="Email Kontakti" name="contact_email" error={fieldErrors.contact_email}>
          <Input name="contact_email" value={formData.contact_email} onChange={handleChange} />
        </FormField>
        <FormField label="Vendndodhja" name="location" error={fieldErrors.location}>
          <Input name="location" value={formData.location} onChange={handleChange} />
        </FormField>
        <Button type="submit" disabled={saving}>
          {saving ? "Duke ruajtur..." : "Ruaj"}
        </Button>
      </form>
    </div>
  )
}
