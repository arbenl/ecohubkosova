"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "@/i18n/routing"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import {
  createOrganizationForUser,
  claimOrganizationForUser,
  type CreateOrganizationInput,
} from "@/services/organization-onboarding"
import { fetchOrganizationsList } from "@/services/organizations"
import { organizationOnboardingSchema } from "@/validation/organization"
import type { Organization } from "@/types"

export interface CreateOrganizationResult {
  success?: boolean
  organizationId?: string
  error?: string
}

export interface ClaimOrganizationResult {
  success?: boolean
  error?: string
}

export interface SearchOrganizationsResult {
  data?: Organization[]
  error?: string
}

/**
 * Search for organizations by name or description (server action)
 */
export async function searchOrganizationsAction(
  searchTerm: string
): Promise<SearchOrganizationsResult> {
  try {
    const result = await fetchOrganizationsList({
      search: searchTerm,
      type: "all",
      interest: "all",
      page: 1,
    })

    return { data: result.data }
  } catch (error) {
    console.error("[searchOrganizationsAction] Failed:", error)
    return { error: error instanceof Error ? error.message : "Search failed" }
  }
}

/**
 * Create a new organization for the authenticated user
 */
export async function createOrganizationAction(
  formData: CreateOrganizationInput,
  locale: string
): Promise<CreateOrganizationResult> {
  const t = await getTranslations("my-organization")
  const tCommon = await getTranslations("common")
  const supabase = await createServerSupabaseClient()

  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user?.id) {
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale,
    })
    return { error: "Unauthorized" }
  }

  // Validate input
  const parsed = organizationOnboardingSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? t("form.createError") }
  }

  const result = await createOrganizationForUser(user.id, parsed.data)

  if (result.error) {
    return { error: result.error }
  }

  if (!result.data?.organizationId) {
    return { error: t("form.createError") }
  }

  // Revalidate both locale versions of the path
  revalidatePath("/sq/my/organization")
  revalidatePath("/en/my/organization")

  return {
    success: true,
    organizationId: result.data.organizationId,
  }
}

/**
 * Claim an existing organization for the authenticated user
 */
export async function claimOrganizationAction(
  organizationId: string,
  locale: string
): Promise<ClaimOrganizationResult> {
  const t = await getTranslations("my-organization")
  const tCommon = await getTranslations("common")
  const supabase = await createServerSupabaseClient()

  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user?.id) {
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale,
    })
    return { error: "Unauthorized" }
  }

  if (!organizationId?.trim()) {
    return { error: t("form.invalidOrg") }
  }

  const result = await claimOrganizationForUser(user.id, organizationId)

  if (result.error) {
    return { error: result.error }
  }

  // Revalidate both locale versions of the path
  revalidatePath("/sq/my/organization")
  revalidatePath("/en/my/organization")

  return { success: true }
}
