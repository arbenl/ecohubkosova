"use client"
import { useLocale } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { useAuth } from "@/lib/auth-provider"

export function PartnereCTA() {
  const locale = useLocale()
  const { user } = useAuth()
  const isAuthenticated = Boolean(user)

  return isAuthenticated ? (
    <Button
      asChild
      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-md transition"
    >
      <Link href="/dashboard">Shko në EcoHub</Link>
    </Button>
  ) : (
    <Button asChild variant="outline">
      <Link href="/register">Regjistrohu si partner</Link>
    </Button>
  )
}
