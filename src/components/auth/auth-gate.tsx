import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/supabase-server"
import type React from "react"

interface AuthGateProps {
  children: React.ReactNode
  locale: string
  requiredRole?: "Admin" | "Organizata" | "Individ"
}

export async function AuthGate({ children, locale, requiredRole }: AuthGateProps) {
  const { user } = await getServerUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  if (requiredRole) {
    // Additional role check can be added here if needed
    // For now, just check authentication
  }

  return <>{children}</>
}
