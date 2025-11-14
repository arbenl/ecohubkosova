import type React from "react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
}

export async function BaseLayout({ children, className = "" }: BaseLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <main className={`flex-1 ${className}`}>
        <div className="animate-fade-in">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
