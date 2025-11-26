"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "./form-field"
import { updateUserProfile } from "../actions"
import { useUserProfileForm } from "@/hooks/use-profile-forms"
import { useToast } from "@/hooks/use-toast"

interface UserProfileFormProps {
  initialFullName: string
  initialEmail: string
  initialLocation: string
}

export function UserProfileForm({
  initialFullName,
  initialEmail,
  initialLocation,
}: UserProfileFormProps) {
  const { toast } = useToast()
  const { formData, fieldErrors, saving, error, success, handleChange, handleSubmit } =
    useUserProfileForm({
      initialFullName,
      initialLocation,
      submit: updateUserProfile,
    })

  // Show success toast when success state changes
  React.useEffect(() => {
    if (success) {
      toast({
        title: "Sukses",
        description: success,
      })
    }
  }, [success, toast])

  return (
    <div>
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Emri i Plotë" name="full_name" error={fieldErrors.full_name}>
          <Input name="full_name" value={formData.full_name} onChange={handleChange} />
        </FormField>
        <FormField label="Email" name="email">
          <Input name="email" value={initialEmail} disabled />
        </FormField>
        <FormField label="Vendndodhja" name="location" error={fieldErrors.location}>
          <Input name="location" value={formData.location} onChange={handleChange} />
        </FormField>
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {saving ? "Duke ruajtur..." : "Ruaj"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={saving}
            className="rounded-full"
          >
            Anulo
          </Button>
        </div>
      </form>
    </div>
  )
}
