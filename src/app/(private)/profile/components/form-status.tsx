"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface FormStatusProps {
  error?: string | null
  success?: string | null
}

export function FormStatus({ error, success }: FormStatusProps) {
  if (!error && !success) {
    return null
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Gabim</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Sukses</AlertTitle>
      <AlertDescription>{success}</AlertDescription>
    </Alert>
  )
}
