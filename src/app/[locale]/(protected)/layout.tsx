import { PageLayout } from "@/components/layout/page-layout"
import { AuthGate } from "@/components/auth/auth-gate"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function ProtectedLayout({ children, params }: Props) {
  const { locale } = await params

  return (
    <AuthGate locale={locale}>
      <PageLayout>{children}</PageLayout>
    </AuthGate>
  )
}
