import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/header"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të aksesuar dashboardin.")
  }

  const { data: userProfile } = await supabase.from("users").select("roli").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole={userProfile?.roli || "Individ"} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
