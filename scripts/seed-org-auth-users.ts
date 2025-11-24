/**
 * Seed Auth users for every organization with a contact_email.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/seed-org-auth-users.ts
 *
 * Behavior:
 * - For each organization (contact_email present, is_approved = true), ensure:
 *   1) Supabase Auth user exists (email = contact_email, password = 123456, email confirmed, metadata set)
 *   2) public.users row exists with same id/email
 *   3) public.organization_members row exists linking user to org as ADMIN (is_approved = true)
 * - Idempotent: safe to re-run; reuses existing auth users and skips existing rows.
 *
 * NOTE: must_change_password is set in user_metadata; UI should enforce a password change on login.
 */

import { createClient, type User } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars")
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type OrgRow = {
  id: string
  name: string
  contact_email: string
  location?: string | null
  is_approved?: boolean | null
}

const DEFAULT_PASSWORD = "123456" // STAGING ONLY
const DEFAULT_ROLE = "Organizational"
const DEFAULT_LOCATION = "Kosovo"

async function fetchOrganizations(): Promise<OrgRow[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id,name,contact_email,location,is_approved")
    .not("contact_email", "is", null)
    .eq("is_approved", true)

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`)
  }

  return data ?? []
}

async function findAuthUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 })
  if (error) {
    throw new Error(`Failed checking user ${email}: ${error.message}`)
  }
  const target = email.toLowerCase()
  const match = data?.users?.find((u) => (u.email ?? "").toLowerCase() === target)
  return match ?? null
}

async function ensureAuthUser(org: OrgRow) {
  const email = org.contact_email
  const metadata = {
    must_change_password: true,
    initial_org_id: org.id,
    initial_org_name: org.name,
    role: "ORG_ADMIN_AUTO",
  }

  const existing = await findAuthUserByEmail(email)
  if (existing) {
    const user = existing
    // Patch metadata if missing
    const needsPatch =
      user.user_metadata?.must_change_password !== true ||
      user.user_metadata?.initial_org_id !== org.id ||
      user.user_metadata?.initial_org_name !== org.name ||
      user.user_metadata?.role !== "ORG_ADMIN_AUTO"

    if (needsPatch) {
      await supabase.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, ...metadata } })
    }
    return { user, created: false }
  }

  // Create new auth user
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  })
  if (createErr || !created?.user) {
    throw new Error(`Failed to create auth user for ${email}: ${createErr?.message ?? "unknown error"}`)
  }
  return { user: created.user, created: true }
}

async function ensureAppUser(authUser: User, org: OrgRow) {
  const { data, error } = await supabase.from("users").select("id").eq("id", authUser.id).single()
  if (!error && data) {
    return { created: false }
  }

  const insertPayload = {
    id: authUser.id,
    full_name: org.name ?? authUser.email ?? "Organization User",
    email: authUser.email ?? org.contact_email,
    location: org.location || DEFAULT_LOCATION,
    role: DEFAULT_ROLE,
    // is_approved, created_at, updated_at have defaults
  }

  const { error: insertErr } = await supabase.from("users").insert(insertPayload)
  if (insertErr) {
    throw new Error(`Failed to insert users row for ${authUser.email}: ${insertErr.message}`)
  }
  return { created: true }
}

async function ensureOrgMembership(authUser: User, org: OrgRow) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", org.id)
    .eq("user_id", authUser.id)
    .single()

  if (!error && data) {
    return { created: false }
  }

  const { error: insertErr } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: authUser.id,
    role_in_organization: "ADMIN",
    is_approved: true,
  })
  if (insertErr) {
    throw new Error(
      `Failed to insert organization_members for org=${org.id}, user=${authUser.id}: ${insertErr.message}`
    )
  }
  return { created: true }
}

async function main() {
  const orgs = await fetchOrganizations()
  console.log(`Found ${orgs.length} organizations with contact_email to process`)

  let authCreated = 0
  let authReused = 0
  let usersCreated = 0
  let membershipsCreated = 0

  for (const org of orgs) {
    const { user, created } = await ensureAuthUser(org)
    if (created) {
      authCreated += 1
      console.log(`Created auth user for org ${org.name} (${org.contact_email})`)
    } else {
      authReused += 1
      console.log(`Reused existing auth user for org ${org.name} (${org.contact_email})`)
    }

    const userResult = await ensureAppUser(user, org)
    if (userResult.created) {
      usersCreated += 1
    }

    const memberResult = await ensureOrgMembership(user, org)
    if (memberResult.created) {
      membershipsCreated += 1
    }
  }

  console.log("----- Summary -----")
  console.log(`Organizations scanned: ${orgs.length}`)
  console.log(`Auth users created:   ${authCreated}`)
  console.log(`Auth users reused:    ${authReused}`)
  console.log(`users rows created:   ${usersCreated}`)
  console.log(`organization_members created: ${membershipsCreated}`)
}

main().catch((err) => {
  console.error("Fatal error in seed-org-auth-users:", err)
  process.exit(1)
})
