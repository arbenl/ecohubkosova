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
      className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift border-gray-200"
      onClick={() => router.push(href)}
    >
      <div className="flex flex-col items-center text-center">
        {icon}
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
    </Card>
  )
}
