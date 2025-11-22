"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
  userProfileUpdateSchema,
  organizationProfileUpdateSchema,
} from "@/validation/profile"
import type {
  UserProfileUpdateInput,
  OrganizationProfileUpdateInput,
} from "@/validation/profile"

type SubmitResult = { error?: string } | void

type SubmitUserProfile = (
  payload: UserProfileUpdateInput
) => Promise<SubmitResult>

type SubmitOrganizationProfile = (
  organizationId: string,
  payload: OrganizationProfileUpdateInput
) => Promise<SubmitResult>

export function useUserProfileForm({
  initialFullName,
  initialLocation,
  submit,
}: {
  initialFullName: string
  initialLocation: string
  submit: SubmitUserProfile
}) {
  const t = useTranslations("profile")
  const [formData, setFormData] = useState<UserProfileUpdateInput>({
    full_name: initialFullName,
    location: initialLocation,
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof UserProfileUpdateInput, string>>
  >({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target
      setFormData((prev) => ({ ...prev, [name]: value }))
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSaving(true)
      setError(null)
      setSuccess(null)

      const parsed = userProfileUpdateSchema.safeParse(formData)
      if (!parsed.success) {
        const { fieldErrors } = parsed.error.flatten()
        setFieldErrors({
          full_name: fieldErrors.full_name?.[0],
          location: fieldErrors.location?.[0],
        })
        setError(t("checkFields"))
        setSaving(false)
        return
      }

      setFieldErrors({})
      const result = await submit(parsed.data)

      if (result && result.error) {
        setError(result.error)
      } else {
        setSuccess(t("profileUpdatedSuccess"))
      }

      setSaving(false)
    },
    [formData, submit, t]
  )

  return {
    formData,
    fieldErrors,
    saving,
    error,
    success,
    handleChange,
    handleSubmit,
  }
}

export function useOrganizationProfileForm({
  organizationId,
  initialData,
  submit,
}: {
  organizationId: string
  initialData: OrganizationProfileUpdateInput
  submit: SubmitOrganizationProfile
}) {
  const t = useTranslations("profile")
  const [formData, setFormData] =
    useState<OrganizationProfileUpdateInput>(initialData)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof OrganizationProfileUpdateInput, string>>
  >({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = event.target
      setFormData((prev) => ({ ...prev, [name]: value }))
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSaving(true)
      setError(null)
      setSuccess(null)

      const parsed = organizationProfileUpdateSchema.safeParse(formData)
      if (!parsed.success) {
        const { fieldErrors } = parsed.error.flatten()
        setFieldErrors({
          name: fieldErrors.name?.[0],
          description: fieldErrors.description?.[0],
          primary_interest: fieldErrors.primary_interest?.[0],
          contact_person: fieldErrors.contact_person?.[0],
          contact_email: fieldErrors.contact_email?.[0],
          location: fieldErrors.location?.[0],
        })
        setError(t("checkFields"))
        setSaving(false)
        return
      }

      setFieldErrors({})
      const result = await submit(organizationId, parsed.data)

      if (result && result.error) {
        setError(result.error)
      } else {
        setSuccess(t("orgProfileUpdatedSuccess"))
      }

      setSaving(false)
    },
    [formData, organizationId, submit, t]
  )

  return {
    formData,
    fieldErrors,
    saving,
    error,
    success,
    handleChange,
    handleSubmit,
  }
}
