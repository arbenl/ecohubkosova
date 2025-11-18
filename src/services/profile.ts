import { unstable_noStore as noStore } from "next/cache"
import { cache } from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users } from "@/db/schema"
import type { OrganizationProfileUpdateInput, UserProfileUpdateInput } from "@/validation/profile"

export type ProfileUser = {
  id: string
  full_name: string
  email: string
  location: string
  role: string
  is_approved: boolean
  created_at: string
}

export type ProfileOrganization = {
  id: string
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string
  is_approved: boolean
}

export type ProfileErrorType = "none" | "not_authenticated" | "no_profile" | "database_error"

export type ProfileResult = {
  userProfile: ProfileUser | null
  organization: ProfileOrganization | null
  error: string | null
  errorType: ProfileErrorType
  errorMessage?: string
  dbUnavailable?: boolean
}

export type UserProfileErrorType = Exclude<ProfileErrorType, "not_authenticated">

export type UserProfileResult = {
  userProfile: ProfileUser | null
  error: string | null
  errorType: UserProfileErrorType
  errorMessage?: string
  dbUnavailable?: boolean
}

type UserRow = typeof users.$inferSelect
type OrganizationRow = typeof organizations.$inferSelect

// ============================================================================
// TRANSFORMERS - Clean separation of concerns
// ============================================================================

const toProfileUser = (record: UserRow): ProfileUser => ({
  id: record.id,
  full_name: record.full_name,
  email: record.email,
  location: record.location,
  role: record.role,
  is_approved: record.is_approved,
  created_at: record.created_at.toISOString(),
})

const toProfileOrganization = (record: OrganizationRow): ProfileOrganization => ({
  id: record.id,
  name: record.name,
  description: record.description,
  primary_interest: record.primary_interest,
  contact_person: record.contact_person,
  contact_email: record.contact_email,
  location: record.location,
  type: record.type,
  is_approved: record.is_approved,
})

// ============================================================================
// UTILITIES - Reusable helpers
// ============================================================================

const isConnectionError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false
  
  const message = error.message.toLowerCase()
  return (
    message.includes("connection") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("pool") ||
    message.includes("timeout") ||
    message.includes("fatal") ||
    error.name === "PostgresError"
  )
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const shouldAttachOrganization = (role?: string): boolean => {
  return !!role && role !== "Individ" && role !== "Admin"
}

const logDatabaseIssue = (label: string, payload: Record<string, unknown>, error: unknown): string => {
  const errorMsg = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown database error"
  const logger = process.env.NODE_ENV === "production" ? console.error : console.warn
  logger(`[${label}]`, { ...payload, error: errorMsg })
  return errorMsg
}

// ============================================================================
// QUERY HELPER - Unified retry logic with exponential backoff
// ============================================================================

const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 2
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry non-connection errors
      if (!isConnectionError(error)) {
        throw error
      }

      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`[${operationName}] Failed after ${maxRetries + 1} attempts: ${errorMsg}`)
        throw error
      }

      // Exponential backoff: 100ms, 200ms, 400ms
      const delayMs = Math.pow(2, attempt) * 100
      console.warn(`[${operationName}] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`)
      await sleep(delayMs)
    }
  }

  throw lastError
}

// ============================================================================
// DATABASE QUERIES - Single responsibility, proper error handling
// ============================================================================

async function findUserProfile(userId: string): Promise<ProfileUser | null> {
  return executeWithRetry(
    async () => {
      const records = await db
        .get()
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      return records[0] ? toProfileUser(records[0]) : null
    },
    "findUserProfile",
    2
  )
}

type ProfileWithOrganizationRow = {
  user?: UserRow
  organization?: OrganizationRow | null
}

async function findUserProfileWithOrganization(
  userId: string
): Promise<ProfileWithOrganizationRow | null> {
  return executeWithRetry(
    async () => {
      const records = await db
        .get()
        .select({
          user: users,
          organization: organizations,
        })
        .from(users)
        .leftJoin(
          organizationMembers,
          and(
            eq(organizationMembers.user_id, users.id),
            eq(organizationMembers.is_approved, true)
          )
        )
        .leftJoin(organizations, eq(organizations.id, organizationMembers.organization_id))
        .where(eq(users.id, userId))
        .limit(1)

      return (records[0] ?? null) as ProfileWithOrganizationRow | null
    },
    "findUserProfileWithOrganization",
    2
  )
}

// ============================================================================
// PUBLIC API - Server actions with proper error boundaries
// ============================================================================

export async function fetchCurrentUserProfile(): Promise<ProfileResult> {
  noStore()
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    return {
      userProfile: null,
      organization: null,
      error: "Përdoruesi nuk është i kyçur.",
      errorType: "not_authenticated",
      errorMessage: sessionError?.message,
    }
  }

  try {
    const profileRow = await findUserProfileWithOrganization(user.id)
    const userProfile = profileRow?.user ? toProfileUser(profileRow.user) : null

    // No profile found is a normal state (new user or profile not created by trigger yet)
    if (!userProfile) {
      return {
        userProfile: null,
        organization: null,
        error: null,
        errorType: "no_profile",
      }
    }

    const organization = 
      userProfile && shouldAttachOrganization(userProfile.role) && profileRow?.organization
        ? toProfileOrganization(profileRow.organization)
        : null

    return {
      userProfile,
      organization,
      error: null,
      errorType: "none",
      dbUnavailable: false,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = (error as any)?.code
    const isAuthError =
      errorCode === "28P01" ||
      errorMessage.includes("28P01") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("SUPABASE_DB_URL")

    const normalizedMessage = logDatabaseIssue(
      isAuthError ? "fetchCurrentUserProfile:auth" : "fetchCurrentUserProfile:query",
      {
        userId: user.id,
        errorCode,
        isAuthError,
      },
      error
    )

    return {
      userProfile: null,
      organization: null,
      error: "Problemi me lidhjen e bazës e të dhënave. Ju lutem provoni më vonë.",
      errorType: "database_error",
      errorMessage: normalizedMessage,
      dbUnavailable: isAuthError, // Only set dbUnavailable for real connection/auth failures
    }
  }
}

export async function fetchUserProfileById(userId: string): Promise<UserProfileResult> {
  noStore()

  try {
    const profile = await findUserProfile(userId)

    if (!profile) {
      return {
        userProfile: null,
        error: null,
        errorType: "no_profile",
        errorMessage: "Profili i përdoruesit nuk ekziston.",
        dbUnavailable: false,
      }
    }

    return {
      userProfile: profile,
      error: null,
      errorType: "none",
      dbUnavailable: false,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = (error as any)?.code
    const isConnectionError =
      errorCode === "28P01" ||  // password auth failed
      errorCode === "57P01" ||  // admin shutdown
      /terminating connection/i.test(errorMessage) ||
      /ECONNREFUSED|ENOTFOUND/i.test(errorMessage)

    const errorMsg = logDatabaseIssue("fetchUserProfileById", { userId, errorCode, isConnectionError }, error)

    return {
      userProfile: null,
      error: "Gabim gjatë ngarkimit të profilit të përdoruesit.",
      errorType: "database_error",
      errorMessage: errorMsg,
      dbUnavailable: isConnectionError, // Only set dbUnavailable for real connection failures
    }
  }
}

export async function updateUserProfileRecord(userId: string, data: UserProfileUpdateInput) {
  try {
    await db
      .get()
      .update(users)
      .set({
        full_name: data.full_name,
        location: data.location,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))

    return { error: null }
  } catch (error) {
    const errorMsg = logDatabaseIssue("updateUserProfileRecord", { userId }, error)
    return { error: error instanceof Error ? error : new Error(errorMsg) }
  }
}

export async function updateOrganizationRecord(
  organizationId: string,
  data: OrganizationProfileUpdateInput
) {
  try {
    await db
      .get()
      .update(organizations)
      .set({
        name: data.name,
        description: data.description,
        primary_interest: data.primary_interest,
        contact_person: data.contact_person,
        contact_email: data.contact_email,
        location: data.location,
        updated_at: new Date(),
      })
      .where(eq(organizations.id, organizationId))

    return { error: null }
  } catch (error) {
    const errorMsg = logDatabaseIssue("updateOrganizationRecord", { organizationId }, error)
    return { error: error instanceof Error ? error : new Error(errorMsg) }
  }
}

export async function ensureUserOrganizationMembership(
  organizationId: string,
  userId: string
) {
  try {
    const records = await db
      .get()
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, userId),
          eq(organizationMembers.is_approved, true)
        )
      )
      .limit(1)
    const record = records[0]

    return { isMember: Boolean(record), error: null }
  } catch (error) {
    const errorMsg = logDatabaseIssue("ensureUserOrganizationMembership", { organizationId, userId }, error)
    return { isMember: false, error: error instanceof Error ? error : new Error(errorMsg) }
  }
}

export const getCachedUserProfileById = cache(async (userId: string) => fetchUserProfileById(userId))
