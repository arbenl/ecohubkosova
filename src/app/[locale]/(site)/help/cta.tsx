"use client"
import { useLocale } from "next-intl"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { useAuth } from "@/lib/auth-provider"

export function NdhimeCTA() {
  const locale = useLocale()
  const { user } = useAuth()
  const isAuthenticated = Boolean(user)

  return isAuthenticated ? (
    <Button asChild className="w-full mt-4" size="sm">
      <Link href="/dashboard">Shko në EcoHub</Link>
    </Button>
  ) : (
    <Button asChild className="w-full mt-4" size="sm">
      <Link href="/register">Regjistrohu tani</Link>
    </Button>
  )
}
