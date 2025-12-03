"use client"

import { useRouter } from "@/i18n/routing"
import { Card } from "@/components/ui/card"
import type React from "react"

interface AdminQuickActionCardProps {
  title: string
  icon: React.ReactNode
  href: string
}

export default function AdminQuickActionCard({ title, icon, href }: AdminQuickActionCardProps) {
  const router = useRouter()

  return (
    <Card
      className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 md:p-6 hover:shadow-md cursor-pointer transition-shadow focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
      onClick={() => router.push(href)}
      tabIndex={0}
      role="button"
      aria-label={`Navigate to ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          router.push(href)
        }
      }}
    >
      <div className="flex flex-col items-center text-center">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
    </Card>
  )
}
