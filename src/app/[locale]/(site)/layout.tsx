import { PageLayout } from "@/components/layout/page-layout"
import type { ReactNode } from "react"

type SiteLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params
  return <PageLayout locale={locale}>{children}</PageLayout>
}
