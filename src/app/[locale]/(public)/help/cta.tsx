"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"

export function NdhimeCTA() {
  const { user } = useAuth()
  const isAuthenticated = Boolean(user)

  return isAuthenticated ? (
    <Button asChild className="w-full mt-4" size="sm">
      <Link href="/dashboard">Shko në Dashboard</Link>
    </Button>
  ) : (
    <Button asChild className="w-full mt-4" size="sm">
      <Link href="/register">Regjistrohu tani</Link>
    </Button>
  )
}
