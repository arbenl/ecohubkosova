import { BaseLayout } from "@/components/base-layout"
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/supabase-server"

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const { user } = await getServerUser()

  if (!user) {
    redirect("/login")
  }

  return <BaseLayout>{children}</BaseLayout>
}
