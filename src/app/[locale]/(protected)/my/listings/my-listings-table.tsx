"use client"

import { useEffect, useMemo, useState } from "react"
import { Link, useRouter } from "@/i18n/routing"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { archiveListingAction } from "./actions"
import { useToast } from "@/components/ui/use-toast"
import { Eye, Pencil, Archive, MoreHorizontal, Search } from "lucide-react"

type ListingRow = {
  id: string
  title: string
  status?: string | null
  visibility?: string | null
  price?: number | null
  currency?: string | null
  listing_type?: string | null
  flow_type?: string | null
  created_at: string
  updated_at?: string | null
}

type TableLabels = {
  searchPlaceholder: string
  emptyTitle: string
  emptyBody: string
  emptyCta: string
  tabs: Record<string, string>
  columns: Record<string, string>
  statuses: Record<string, string>
  visibilities: Record<string, string>
  actions: Record<string, string>
  archive: {
    title: string
    description: string
    confirm: string
    cancel: string
    success: string
    error: string
  }
}

const TAB_KEYS = ["ACTIVE", "DRAFT", "ARCHIVED"] as const

export function MyListingsTable({
  listings,
  locale,
  labels,
}: {
  listings: ListingRow[]
  locale: string
  labels: TableLabels
}) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<(typeof TAB_KEYS)[number]>("ACTIVE")
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const counts = useMemo(
    () =>
      listings.reduce(
        (acc, listing) => {
          const status = (listing.status || "ACTIVE") as (typeof TAB_KEYS)[number]
          if (status === "DRAFT") acc.draft += 1
          else if (status === "ARCHIVED") acc.archived += 1
          else acc.active += 1
          return acc
        },
        { active: 0, draft: 0, archived: 0 }
      ),
    [listings]
  )

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const statusFiltered = listings.filter((listing) => {
      const status = (listing.status || "ACTIVE").toUpperCase()
      if (activeTab === "ACTIVE") return status === "ACTIVE"
      if (activeTab === "DRAFT") return status === "DRAFT"
      if (activeTab === "ARCHIVED") return status === "ARCHIVED"
      return true
    })

    if (!normalizedQuery) return statusFiltered

    return statusFiltered.filter((listing) => listing.title.toLowerCase().includes(normalizedQuery))
  }, [activeTab, listings, query])

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const aDate = new Date(a.updated_at || a.created_at).getTime()
        const bDate = new Date(b.updated_at || b.created_at).getTime()
        return bDate - aDate
      }),
    [filtered]
  )

  useEffect(() => {
    // Reset query on tab change for clarity
    setQuery("")
  }, [activeTab])

  const statusBadge = (status?: string | null) => {
    const normalized = (status || "ACTIVE").toUpperCase()
    const label = labels.statuses[normalized.toLowerCase()] || normalized
    const variant =
      normalized === "ACTIVE" ? "default" : normalized === "ARCHIVED" ? "secondary" : "outline"
    return (
      <Badge variant={variant} className="capitalize badge-glow">
        {label}
      </Badge>
    )
  }

  const visibilityBadge = (visibility?: string | null) => {
    const normalized = (visibility || "PUBLIC").toUpperCase()
    const label = labels.visibilities[normalized.toLowerCase()] || normalized
    const variant = normalized === "PUBLIC" ? "outline" : "secondary"
    return (
      <Badge variant={variant} className="capitalize">
        {label}
      </Badge>
    )
  }

  const onArchive = async (id: string) => {
    setArchivingId(id)
    try {
      await archiveListingAction(id, locale)
      toast({ title: labels.archive.success })
      router.refresh()
    } catch (error) {
      toast({ title: labels.archive.error, variant: "destructive" })
    } finally {
      setArchivingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as (typeof TAB_KEYS)[number])}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-3">
            <TabsTrigger value="ACTIVE">
              {labels.tabs.active} ({counts.active})
            </TabsTrigger>
            <TabsTrigger value="DRAFT">
              {labels.tabs.draft} ({counts.draft})
            </TabsTrigger>
            <TabsTrigger value="ARCHIVED">
              {labels.tabs.archived} ({counts.archived})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">{labels.columns.title}</TableHead>
              <TableHead>{labels.columns.status}</TableHead>
              <TableHead>{labels.columns.visibility}</TableHead>
              <TableHead>{labels.columns.updated}</TableHead>
              <TableHead className="text-right">{labels.columns.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((listing) => {
              const status = (listing.status || "ACTIVE").toUpperCase()
              const isArchived = status === "ARCHIVED"
              return (
                <TableRow key={listing.id} className="hover:bg-gray-50">
                  <TableCell className="space-y-1">
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="font-semibold text-gray-900 hover:text-emerald-700"
                    >
                      {listing.title}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {labels.columns.price}:{" "}
                      {listing.price ? `${listing.price} ${listing.currency || "EUR"}` : "—"}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(listing.status)}</TableCell>
                  <TableCell>{visibilityBadge(listing.visibility)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(listing.updated_at || listing.created_at).toLocaleDateString(locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{labels.columns.actions}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/marketplace/${listing.id}`} className="gap-2">
                            <Eye className="h-4 w-4" />
                            {labels.actions.view}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/marketplace/${listing.id}/edit`} className="gap-2">
                            <Pencil className="h-4 w-4" />
                            {labels.actions.edit}
                          </Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              disabled={isArchived || archivingId === listing.id}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {labels.actions.archive}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{labels.archive.title}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {labels.archive.description}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{labels.archive.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onArchive(listing.id)}
                                disabled={archivingId === listing.id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {labels.archive.confirm}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-gray-600">
                  <div className="space-y-2">
                    <div className="text-base font-semibold">{labels.emptyTitle}</div>
                    <div className="text-sm text-gray-500">{labels.emptyBody}</div>
                    <Button asChild className="mt-2 eco-gradient">
                      <Link href="/marketplace/add">{labels.emptyCta}</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
