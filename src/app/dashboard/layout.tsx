import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/header"
import { getServerUser } from "@/lib/supabase/server"
import { fetchUserProfileById } from "@/services/profile"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, error: userError } = await getServerUser()

  if (!user || userError) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të aksesuar dashboardin.")
  }

  const { userProfile, error: profileError } = await fetchUserProfileById(user.id)

  if (profileError) {
    console.error("DashboardLayout profile load error:", profileError)
  }

  if (!userProfile) {
    redirect("/auth/kycu?message=Profili i përdoruesit nuk u gjet.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole={userProfile.roli || "Individ"} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
