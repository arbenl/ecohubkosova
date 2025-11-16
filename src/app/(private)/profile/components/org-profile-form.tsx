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
        <FormField label="Emri" name="emri" error={fieldErrors.emri}>
          <Input name="emri" value={formData.emri} onChange={handleChange} />
        </FormField>
        <FormField label="Përshkrimi" name="pershkrimi" error={fieldErrors.pershkrimi}>
          <Textarea name="pershkrimi" value={formData.pershkrimi} onChange={handleChange} />
        </FormField>
        <FormField label="Interesi Primar" name="interesi_primar" error={fieldErrors.interesi_primar}>
          <Input name="interesi_primar" value={formData.interesi_primar} onChange={handleChange} />
        </FormField>
        <FormField label="Person Kontakti" name="person_kontakti" error={fieldErrors.person_kontakti}>
          <Input name="person_kontakti" value={formData.person_kontakti} onChange={handleChange} />
        </FormField>
        <FormField label="Email Kontakti" name="email_kontakti" error={fieldErrors.email_kontakti}>
          <Input name="email_kontakti" value={formData.email_kontakti} onChange={handleChange} />
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
