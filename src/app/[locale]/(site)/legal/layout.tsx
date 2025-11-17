import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { LegalSidebar } from '@/components/sidebars/legal-sidebar'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarLayout sidebar={<LegalSidebar />}>
      {children}
    </SidebarLayout>
  )
}
