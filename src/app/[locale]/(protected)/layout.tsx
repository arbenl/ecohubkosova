import { PageLayout } from "@/components/layout/page-layout"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export default function ProtectedLayout({ children }: Props) {
  return <PageLayout>{children}</PageLayout>
}
