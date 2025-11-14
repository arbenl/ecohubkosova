"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { OrganizationProfileUpdateInput } from "@/validation/profile"
import { organizationProfileUpdateSchema } from "@/validation/profile"
import { updateOrganizationProfile } from "../actions"

interface OrgProfileFormProps {
  organizationId: string
  initialData: {
    emri: string
    pershkrimi: string
    interesi_primar: string
    person_kontakti: string
    email_kontakti: string
    vendndodhja: string
  }
}

type FieldErrors = Partial<Record<keyof OrganizationProfileUpdateInput, string>>

export function OrganizationProfileForm({ organizationId, initialData }: OrgProfileFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const parsed = organizationProfileUpdateSchema.safeParse(formData)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      setFieldErrors({
        emri: fieldErrors.emri?.[0],
        pershkrimi: fieldErrors.pershkrimi?.[0],
        interesi_primar: fieldErrors.interesi_primar?.[0],
        person_kontakti: fieldErrors.person_kontakti?.[0],
        email_kontakti: fieldErrors.email_kontakti?.[0],
        vendndodhja: fieldErrors.vendndodhja?.[0],
      })
      setError("Kontrolloni fushat e shënuara dhe provoni përsëri.")
      setSaving(false)
      return
    }

    setFieldErrors({})

    const result = await updateOrganizationProfile(organizationId, parsed.data)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Profili i organizatës u përditësua me sukses!")
    }

    setSaving(false)
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gabim</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sukses</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="emri">Emri</Label>
          <Input name="emri" value={formData.emri} onChange={handleChange} />
          {fieldErrors.emri && <p className="text-sm text-red-600">{fieldErrors.emri}</p>}
        </div>
        <div>
          <Label htmlFor="pershkrimi">Përshkrimi</Label>
          <Textarea name="pershkrimi" value={formData.pershkrimi} onChange={handleChange} />
          {fieldErrors.pershkrimi && <p className="text-sm text-red-600">{fieldErrors.pershkrimi}</p>}
        </div>
        <div>
          <Label htmlFor="interesi_primar">Interesi Primar</Label>
          <Input name="interesi_primar" value={formData.interesi_primar} onChange={handleChange} />
          {fieldErrors.interesi_primar && <p className="text-sm text-red-600">{fieldErrors.interesi_primar}</p>}
        </div>
        <div>
          <Label htmlFor="person_kontakti">Person Kontakti</Label>
          <Input name="person_kontakti" value={formData.person_kontakti} onChange={handleChange} />
          {fieldErrors.person_kontakti && <p className="text-sm text-red-600">{fieldErrors.person_kontakti}</p>}
        </div>
        <div>
          <Label htmlFor="email_kontakti">Email Kontakti</Label>
          <Input name="email_kontakti" value={formData.email_kontakti} onChange={handleChange} />
          {fieldErrors.email_kontakti && <p className="text-sm text-red-600">{fieldErrors.email_kontakti}</p>}
        </div>
        <div>
          <Label htmlFor="vendndodhja">Vendndodhja</Label>
          <Input name="vendndodhja" value={formData.vendndodhja} onChange={handleChange} />
          {fieldErrors.vendndodhja && <p className="text-sm text-red-600">{fieldErrors.vendndodhja}</p>}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Duke ruajtur..." : "Ruaj"}
        </Button>
      </form>
    </div>
  )
}
