"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "@/i18n/routing"
import { getTranslations, getLocale } from "next-intl/server"
import {
  ensureUserOrganizationMembership,
  fetchCurrentUserProfile,
  updateOrganizationRecord,
  updateUserProfileRecord,
  type ProfileOrganization,
  type ProfileResult,
  type ProfileUser,
} from "@/services/profile"
import {
  organizationProfileUpdateSchema,
  userProfileUpdateSchema,
  type OrganizationProfileUpdateInput,
  type UserProfileUpdateInput,
} from "@/validation/profile"

export type UserProfile = ProfileUser
type Organization = ProfileOrganization

export async function getProfileData(): Promise<ProfileResult> {
  return fetchCurrentUserProfile()
}

export type UserProfileUpdate = UserProfileUpdateInput

export async function updateUserProfile(formData: UserProfileUpdateInput) {
  const locale = await getLocale()
  const t = await getTranslations("profile")
  const tCommon = await getTranslations("common")
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale,
    })
    return { error: "Unauthorized" }
  }

  const parsed = userProfileUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? t("updateError") }
  }

  const payload = parsed.data

  try {
    const { error } = await updateUserProfileRecord(user.id, payload)

    if (error) {
      console.error("Error updating user profile:", error)
      return { error: error.message || t("updateError") }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateUserProfile):", error)
    return { error: error.message || t("unknownError") }
  }
}

export async function updateOrganizationProfile(
  organizationId: string,
  formData: OrganizationProfileUpdateInput
) {
  const locale = await getLocale()
  const t = await getTranslations("profile")
  const tCommon = await getTranslations("common")
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale,
    })
    return { error: "Unauthorized" }
  }

  const parsed = organizationProfileUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? t("updateError") }
  }

  const payload = parsed.data

  try {
    const membership = await ensureUserOrganizationMembership(organizationId, user.id)

    if (membership.error) {
      console.error("Error verifying organization membership:", membership.error)
      return { error: t("updateError") }
    }

    if (!membership.isMember) {
      return { error: tCommon("accessDenied") }
    }

    const { error } = await updateOrganizationRecord(organizationId, payload)

    if (error) {
      console.error("Error updating organization profile:", error)
      return { error: error.message || t("updateError") }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateOrganizationProfile):", error)
    return { error: error.message || t("unknownError") }
  }
}
