"use client"

import { useState } from "react"
import { Share2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  listingId: string
  listingTitle: string
  className?: string
}

export default function ShareButton({
  listingId,
  listingTitle,
  className = "",
}: ShareButtonProps) {
  const t = useTranslations("marketplace-v2")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const listingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/marketplace/${listingId}`

  const recordShare = async (channel: "copy_link" | "email") => {
    try {
      await fetch("/api/marketplace-v2/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          type: "SHARE",
          metadata: { channel },
        }),
      })
    } catch (error) {
      console.error("Failed to record share:", error)
    }
  }

  const handleCopyLink = async () => {
    setIsLoading(true)
    try {
      await navigator.clipboard.writeText(listingUrl)
      await recordShare("copy_link")
      toast({
        description: t("actions.linkCopied"),
        duration: 2000,
      })
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast({
        description: "Failed to copy link",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareEmail = async () => {
    const subject = encodeURIComponent(`Check out: ${listingTitle}`)
    const body = encodeURIComponent(
      `${t("actions.shareMessage")}\n\n${listingUrl}`
    )
    await recordShare("email")
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
          disabled={isLoading}
        >
          <Share2 className="mr-2 h-4 w-4" />
          {t("actions.share")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink} disabled={isLoading}>
          <span>{t("actions.copyLink")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareEmail} disabled={isLoading}>
          <Mail className="mr-2 h-4 w-4" />
          <span>{t("actions.shareViaEmail")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
