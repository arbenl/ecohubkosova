import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import DbIssueBanner from "@/components/db-issue-banner"
import { getServerUser } from "@/lib/supabase/server"
import { getCachedUserProfileById } from "@/services/profile"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, error: userError } = await getServerUser()

  if (!user || userError) {
    redirect("/login?message=Ju duhet të kyçeni për të aksesuar dashboardin.")
  }

  const profileResult = await getCachedUserProfileById(user.id)

  const dbError = profileResult.dbUnavailable === true
  if (dbError) {
    const logFn = process.env.NODE_ENV === "production" ? console.error : console.warn
    logFn("[DashboardLayout] Failed to load profile", {
      userId: user.id,
      error: profileResult.errorMessage,
    })
    // Non-blocking: allow the dashboard to render with a safe fallback profile
    // and surface a banner so developers/users know there was a transient DB issue.
  }

  // If the user has no profile (normal for new users), redirect to onboarding.
  if (profileResult.errorType === "no_profile") {
    redirect("/onboarding?message=Ju lutem plotësoni profilin tuaj për të vazhduar.")
  }

  // If there's a DB error, don't block — create a safe fallback profile so the UI
  // remains interactive while we show a non-blocking banner.
  let userProfile = profileResult.userProfile
  if (dbError && !userProfile) {
    userProfile = {
      id: user.id,
      full_name: user.email?.split("@")[0] ?? "Përdorues",
      email: user.email ?? "",
      location: "",
      role: "Individ",
      is_approved: false,
      created_at: new Date().toISOString(),
    } as any
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar userRole={userProfile?.role || "Individ"} />
        <div className="flex-1 overflow-auto">
          {dbError ? <DbIssueBanner /> : null}
          {children}
        </div>
      </div>
    </div>
  )
}
