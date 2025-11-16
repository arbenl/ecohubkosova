"use client"

import { Label } from "@/components/ui/label"
import { type ReactNode } from "react"

interface FormFieldProps {
  label: string
  name: string
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ label, name, error, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
