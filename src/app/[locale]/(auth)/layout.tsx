import type { ReactNode } from "react"
import { PageLayout } from "@/components/layout/page-layout"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout className="flex items-center justify-center py-12">
      {children}
    </PageLayout>
  )
}
