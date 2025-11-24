"use client"

import { useRouter } from "next/navigation"
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
      className="rounded-2xl border-emerald-100 bg-white shadow-sm p-4 hover:shadow-md cursor-pointer transition-shadow"
      onClick={() => router.push(href)}
    >
      <div className="flex flex-col items-center text-center">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
    </Card>
  )
}
