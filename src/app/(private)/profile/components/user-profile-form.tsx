"use client"

import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserProfile } from "../actions"
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
