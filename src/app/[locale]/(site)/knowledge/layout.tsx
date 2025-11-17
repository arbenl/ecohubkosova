import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { KnowledgeSidebar } from '@/components/sidebars/knowledge-sidebar'

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarLayout sidebar={<KnowledgeSidebar />}>
      {children}
    </SidebarLayout>
  )
}
