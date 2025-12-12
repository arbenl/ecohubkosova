/**
 * EcoHub Kosova – Account Actions
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ChangePasswordResult = {
  success?: boolean
  error?: string
  fieldErrors?: {
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }
}

export async function changePassword(
  prevState: ChangePasswordResult | null,
  formData: FormData
): Promise<ChangePasswordResult> {
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validate input
  const parsed = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      fieldErrors: {
        currentPassword: fieldErrors.currentPassword?.[0],
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    }
  }

  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    return { error: "Nuk jeni të kyçur. Ju lutemi kyçuni përsëri." }
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return {
      fieldErrors: {
        currentPassword: "Fjalëkalimi aktual është i gabuar",
      },
    }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: `Gabim gjatë ndryshimit të fjalëkalimit: ${updateError.message}` }
  }

  return { success: true }
}
