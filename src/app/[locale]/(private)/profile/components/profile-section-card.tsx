"use client"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { type ReactNode } from "react"

interface ProfileSectionCardProps {
  title: string
  description: string
  children: ReactNode
}

export function ProfileSectionCard({ title, description, children }: ProfileSectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
