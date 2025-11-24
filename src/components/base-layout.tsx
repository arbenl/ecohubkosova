import type React from "react"
import { FooterV2 } from "@/components/layout/FooterV2"
import { Header } from "@/components/header"

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Legacy layout component.
 * Uses the unified header component with proper error handling.
 * New components should prefer PageLayout for consistency.
 */
export function BaseLayout({ children, className = "" }: BaseLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <main className={`flex-1 ${className}`}>
        <div className="animate-fade-in">{children}</div>
      </main>
      <FooterV2 />
    </div>
  )
}
