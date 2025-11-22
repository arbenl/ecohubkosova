"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

interface SaveButtonProps {
  listingId: string
  variant?: "icon" | "text"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function SaveButton({
  listingId,
  variant = "icon",
  size = "md",
  className = "",
}: SaveButtonProps) {
  const t = useTranslations("marketplace-v2")
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading_save, setIsLoading_save] = useState(false)

  // Check if listing is already saved
  useEffect(() => {
    if (!user?.id) return

    const checkSaved = async () => {
      try {
        const response = await fetch(
          `/api/marketplace-v2/interactions?listingId=${listingId}&type=SAVE`,
          { method: "GET" }
        )
        if (response.ok) {
          const data = await response.json()
          setIsSaved(data.exists || false)
        }
      } catch (error) {
        console.error("Failed to check saved status:", error)
      }
    }

    checkSaved()
  }, [user?.id, listingId])

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user?.id) {
      router.push(`/${locale}/login?message=Please login to save listings`)
      return
    }

    setIsLoading_save(true)
    try {
      const response = await fetch("/api/marketplace-v2/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          type: "SAVE",
        }),
      })

      if (response.ok) {
        setIsSaved(!isSaved)
      }
    } catch (error) {
      console.error("Failed to toggle save:", error)
    } finally {
      setIsLoading_save(false)
    }
  }

  if (isLoading) {
    return null
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        className={`rounded-full ${className}`}
        onClick={handleToggleSave}
        disabled={isLoading_save}
        title={isSaved ? t("actions.unsave") : t("actions.save")}
      >
        <Heart
          className={`h-5 w-5 ${
            isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
      </Button>
    )
  }

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      className={className}
      onClick={handleToggleSave}
      disabled={isLoading_save}
    >
      <Heart
        className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
      />
      {isSaved ? t("actions.saved") : t("actions.save")}
    </Button>
  )
}
