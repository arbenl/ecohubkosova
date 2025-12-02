"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Archive, Loader2 } from "lucide-react"
import { archiveListingAction } from "./actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "@/i18n/routing"

interface ListingActionsProps {
  listingId: string
  locale: string
  status: string
}

export function ListingActions({ listingId, locale, status }: ListingActionsProps) {
  const [isArchiving, setIsArchiving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleArchive = async () => {
    if (status === "ARCHIVED") return

    try {
      setIsArchiving(true)
      await archiveListingAction(listingId, locale)
      toast({
        title: "Success",
        description: "Listing archived successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive listing",
        variant: "destructive",
      })
    } finally {
      setIsArchiving(false)
    }
  }

  if (status === "ARCHIVED") {
    return (
      <Button variant="ghost" size="sm" disabled className="text-gray-400">
        <Archive className="h-4 w-4 mr-1" />
        Archived
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleArchive}
      disabled={isArchiving}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isArchiving ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Archive className="h-4 w-4 mr-1" />
      )}
      Archive
    </Button>
  )
}
