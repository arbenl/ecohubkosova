"use client"
import { useLocale } from "next-intl"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"

export function NdhimeCTA() {
  const locale = useLocale()
  const { user } = useAuth()
  const isAuthenticated = Boolean(user)

  return isAuthenticated ? (
    <Button asChild className="w-full mt-4" size="sm">
      <Link href={`/${locale}/my/organization`}>Shko në EcoHub</Link>
    </Button>
  ) : (
    <Button asChild className="w-full mt-4" size="sm">
      <Link href={`/${locale}/register`}>Regjistrohu tani</Link>
    </Button>
  )
}
