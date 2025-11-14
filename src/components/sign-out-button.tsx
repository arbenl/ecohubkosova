"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

interface SignOutButtonProps {
  variant?: "default" | "outline" | "ghost"
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  children?: ReactNode
  onBeforeSignOut?: () => void
}

export function SignOutButton({
  variant = "outline",
  className,
  size,
  children = "Dilni",
  onBeforeSignOut,
}: SignOutButtonProps) {
  const { signOut, signOutPending } = useAuth()

  const handleClick = async () => {
    onBeforeSignOut?.()
    await signOut()
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick} disabled={signOutPending}>
      {signOutPending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Duke u çkyçur...
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
