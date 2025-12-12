/**
 * EcoHub Kosova – Reset Password Actions
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Fjalëkalimi duhet të ketë të paktën 6 karaktere"),
    confirmPassword: z.string().min(1, "Ju lutemi konfirmoni fjalëkalimin"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Fjalëkalimet nuk përputhen",
    path: ["confirmPassword"],
  })

export type ResetPasswordResult = {
  success?: boolean
  error?: string
}

export async function resetPassword(formData: FormData): Promise<ResetPasswordResult> {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validate input
  const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Të dhëna të pavlefshme" }
  }

  const supabase = await createServerSupabaseClient()

  // Check if we have a valid session (user should be authenticated via recovery link)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error:
        "Lidhja e rivendosjes ka skaduar ose është e pavlefshme. Ju lutemi kërkoni një lidhje të re.",
    }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (updateError) {
    console.error("Password update error:", updateError.message)
    return { error: `Gabim gjatë ndryshimit të fjalëkalimit: ${updateError.message}` }
  }

  // Sign out after password reset to force re-login with new password
  await supabase.auth.signOut()

  return { success: true }
}
