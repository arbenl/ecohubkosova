"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Archive, Loader2, Pencil } from "lucide-react"
import { archiveListingAction } from "@/app/[locale]/(protected)/my/listings/actions"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"

export function OwnerListingActions({
  listingId,
  locale,
  isArchived,
}: {
  listingId: string
  locale: string
  isArchived: boolean
}) {
  const [open, setOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations("marketplace-v2")

  const onArchive = async () => {
    setArchiving(true)
    try {
      await archiveListingAction(listingId, locale)
      toast({ title: t("owner.archiveSuccess") })
      router.refresh()
    } catch (error) {
      toast({ title: t("owner.archiveError"), variant: "destructive" })
    } finally {
      setArchiving(false)
      setOpen(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-900 mb-3">{t("owner.title")}</div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2 interactive-press">
          <Link href={`/marketplace/${listingId}/edit`}>
            <Pencil className="h-4 w-4" />
            {t("owner.edit")}
          </Link>
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-red-700 hover:text-red-800 interactive-press"
              disabled={isArchived}
            >
              {archiving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {t("owner.archive")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("owner.archiveTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("owner.archiveDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("owner.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onArchive}
                disabled={archiving}
                className="bg-red-600 hover:bg-red-700"
              >
                {t("owner.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
