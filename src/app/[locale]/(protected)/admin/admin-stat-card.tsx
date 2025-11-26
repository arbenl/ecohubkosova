"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import type React from "react"

interface AdminStatCardProps {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  href: string
  pendingCount?: number
  pendingMessage?: string
}

export default function AdminStatCard({
  title,
  value,
  description,
  icon,
  href,
  pendingCount,
  pendingMessage,
}: AdminStatCardProps) {
  const router = useRouter()

  return (
    <Card
      className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
      onClick={() => router.push(href)}
      tabIndex={0}
      role="button"
      aria-label={`View ${title} - ${value} total`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          router.push(href)
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-5 md:p-6">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-5 md:p-6 pt-0">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        {pendingCount && pendingCount > 0 && (
          <div className="mt-2 flex items-center text-amber-600 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {pendingCount} {pendingMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
