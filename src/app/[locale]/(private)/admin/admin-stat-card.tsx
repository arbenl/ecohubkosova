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
    <Card className="glass-card hover-lift cursor-pointer" onClick={() => router.push(href)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
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
