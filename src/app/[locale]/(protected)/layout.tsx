import { PageLayout } from "@/components/layout/page-layout"
import { getServerUser } from "@/lib/supabase/server"
import { redirect } from "@/i18n/routing"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function ProtectedLayout({ children, params }: Props) {
  const { locale } = await params
  const { user } = await getServerUser()

  if (!user) {
    redirect({ href: "/login", locale })
  }

  return <PageLayout>{children}</PageLayout>
}
