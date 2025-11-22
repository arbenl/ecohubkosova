"use client"

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { listingFormSchema, type ListingFormInput } from "@/validation/listings"

type SubmitResult = { error?: string } | void

type SubmitListing = (payload: ListingFormInput) => Promise<SubmitResult>

export function useListingForm({
  initialData,
  submit,
}: {
  initialData?: Partial<ListingFormInput>
  submit: SubmitListing
}) {
  const t = useTranslations("marketplace-v2")
  const [formData, setFormData] = useState<ListingFormInput>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    category_id: initialData?.category_id ?? "",
    flow_type: initialData?.flow_type ?? "OFFER_WASTE",
    condition: initialData?.condition,
    lifecycle_stage: initialData?.lifecycle_stage,
    quantity: initialData?.quantity,
    unit: initialData?.unit,
    price: initialData?.price,
    currency: initialData?.currency ?? "EUR",
    pricing_type: initialData?.pricing_type ?? "FIXED",
    country: initialData?.country ?? "XK",
    city: initialData?.city,
    region: initialData?.region,
    location_details: initialData?.location_details,
    eco_labels: initialData?.eco_labels ?? [],
    eco_score: initialData?.eco_score,
    tags: initialData?.tags ?? [],
    media: initialData?.media ?? [],
  })

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ListingFormInput, string>>
  >({})

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target
      
      // Handle checkbox arrays (eco_labels, tags)
      if (type === "checkbox" && (name === "eco_labels" || name === "tags")) {
        const currentArray = Array.isArray(formData[name as keyof ListingFormInput])
          ? (formData[name as keyof ListingFormInput] as string[])
          : []
        
        if ((event.target as HTMLInputElement).checked) {
          setFormData((prev) => ({
            ...prev,
            [name]: [...currentArray, value],
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: currentArray.filter((v) => v !== value),
          }))
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: value || undefined }))
      }
      
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    },
    [formData]
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSaving(true)
      setError(null)
      setSuccess(null)

      const parsed = listingFormSchema.safeParse(formData)
      if (!parsed.success) {
        const { fieldErrors } = parsed.error.flatten()
        setFieldErrors(fieldErrors as Partial<Record<keyof ListingFormInput, string>>)
        setError(t("form.checkFields"))
        setSaving(false)
        return
      }

      setFieldErrors({})
      const result = await submit(parsed.data)

      if (result && result.error) {
        setError(result.error)
      } else {
        setSuccess(t("form.success"))
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
