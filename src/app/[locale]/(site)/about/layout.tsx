import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { AboutSidebar } from '@/components/sidebars/about-sidebar'

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarLayout sidebar={<AboutSidebar />}>
      {children}
    </SidebarLayout>
  )
}
