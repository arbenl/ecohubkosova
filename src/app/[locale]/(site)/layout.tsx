import { PageLayout } from "@/components/layout/page-layout"
import type { ReactNode } from "react"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <PageLayout>{children}</PageLayout>
}
