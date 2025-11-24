import type React from "react"
import { FooterV2 } from "@/components/layout/FooterV2"
import { Header } from "@/components/layout/header/header"

export interface PageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
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
