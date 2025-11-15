"use client"

import { useRef, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Shared hook for managing auth form state and submission logic.
 * Reduces code duplication between login and register pages.
 */
export function useAuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectInProgressRef = useRef(false)

  const handleSubmit = useCallback(
    async (formAction: (formData: FormData) => Promise<any>, formData: FormData) => {
      if (redirectInProgressRef.current) return
      setError("")
      setIsSubmitting(true)

      try {
        const result = await formAction(formData)

        if (result?.error) {
          setError(result.error)
          setIsSubmitting(false)
          return
        }

        if (result?.redirectUrl) {
          redirectInProgressRef.current = true
          window.location.href = result.redirectUrl
          return
        }

        if (result?.message) {
          setError(result.message)
          setIsSubmitting(false)
          return
        }

        if (result?.success !== false) {
          redirectInProgressRef.current = true
          router.push("/auth/success")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Një gabim ndodhi gjatë përpunimit."
        setError(errorMessage)
        setIsSubmitting(false)
      }
    },
    [router]
  )

  return {
    router,
    searchParams,
    message,
    error,
    setError,
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
    redirectInProgressRef,
  }
}

/**
 * Shared hook for managing form field changes (inputs, textareas, checkboxes)
 */
export function useFormFields<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    },
    []
  )

  const handleRadioChange = useCallback((value: string, fieldName: keyof T) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialState)
  }, [initialState])

  return {
    formData,
    setFormData,
    handleChange,
    handleRadioChange,
    resetForm,
  }
}
