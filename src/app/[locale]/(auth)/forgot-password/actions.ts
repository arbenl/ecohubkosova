/**
 * EcoHub Kosova – Forgot Password Actions
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

"use server"

import { headers } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit"

const forgotPasswordSchema = z.object({
  email: z.string().email("Ju lutemi vendosni një email të vlefshëm"),
})

export type ForgotPasswordResult = {
  success?: boolean
  error?: string
}

export async function requestPasswordReset(formData: FormData): Promise<ForgotPasswordResult> {
  // Rate limiting - stricter for password reset
  const headersList = await headers()
  const ip = getClientIp(headersList)
  const { success: withinLimit } = checkRateLimit(
    `password-reset:${ip}`,
    RATE_LIMITS.PASSWORD_RESET.limit,
    RATE_LIMITS.PASSWORD_RESET.windowMs
  )

  if (!withinLimit) {
    return {
      error: "Shumë përpjekje. Ju lutemi prisni 5 minuta para se të provoni përsëri.",
    }
  }

  const email = formData.get("email") as string

  // Validate input
  const parsed = forgotPasswordSchema.safeParse({ email })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Email i pavlefshëm" }
  }

  const supabase = await createServerSupabaseClient()

  // Get site URL for redirect
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL is not configured")
    return { error: "Konfigurimi i shërbimit nuk është i saktë." }
  }

  // Send password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?type=recovery`,
  })

  if (error) {
    console.error("Password reset error:", error.message)
    // Don't reveal if email exists or not for security
    // Always return success to prevent email enumeration
  }

  // Always return success to prevent email enumeration attacks
  return { success: true }
}
