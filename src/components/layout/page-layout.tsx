import type React from "react"
import { FooterV2 } from "@/components/layout/FooterV2"
import { Header } from "@/components/layout/header/header"
import { FeedbackWidget } from "@/components/feedback/feedback-widget"
import { FloatingLeaves } from "@/components/ui/eco-background"

export interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  locale?: string
}

export function PageLayout({ children, className = "", locale }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 relative overflow-hidden">
      {/* Eco-themed ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-100/40 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-teal-100/30 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-emerald-50/20 via-transparent to-teal-50/20 blur-3xl" />

        {/* Floating decorative leaves */}
        <FloatingLeaves />

        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <Header />
      <main className={`flex-1 relative z-10 ${className}`}>
        <div className="animate-fade-in">{children}</div>
      </main>
      <FooterV2 locale={locale} />
      <FeedbackWidget />
    </div>
  )
}
