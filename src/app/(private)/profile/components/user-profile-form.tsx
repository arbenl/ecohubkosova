"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserProfileUpdateInput } from "@/validation/profile"
import { userProfileUpdateSchema } from "@/validation/profile"
import { updateUserProfile } from "../actions"

interface UserProfileFormProps {
  initialFullName: string
  initialEmail: string
  initialLocation: string
}

interface FieldErrors {
  emri_i_plote?: string
  vendndodhja?: string
}

export function UserProfileForm({ initialFullName, initialEmail, initialLocation }: UserProfileFormProps) {
  const [formData, setFormData] = useState({
    emri_i_plote: initialFullName,
    vendndodhja: initialLocation,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const parsed = userProfileUpdateSchema.safeParse(formData as UserProfileUpdateInput)

    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten()
      setFieldErrors({
        emri_i_plote: fieldErrors.emri_i_plote?.[0],
        vendndodhja: fieldErrors.vendndodhja?.[0],
      })
      setError("Kontrolloni fushat e shënuara dhe provoni përsëri.")
      setSaving(false)
      return
    }

    setFieldErrors({})

    const result = await updateUserProfile(parsed.data)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Profili u përditësua me sukses!")
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
          <Label htmlFor="emri_i_plote">Emri i Plotë</Label>
          <Input name="emri_i_plote" value={formData.emri_i_plote} onChange={handleChange} />
          {fieldErrors.emri_i_plote && <p className="text-sm text-red-600">{fieldErrors.emri_i_plote}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input name="email" value={initialEmail} disabled />
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
