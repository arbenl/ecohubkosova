import type React from "react"

export interface SidebarLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  className?: string
}

export function SidebarLayout({ children, sidebar, className = "" }: SidebarLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-48 overflow-y-auto border-r border-gray-200 bg-white">
        {sidebar}
      </aside>
      <main className={`flex-1 overflow-y-auto ${className}`}>
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  )
}
