"use client"

import { useCallback, useState } from "react"
import {
  deleteListing,
  updateListing,
  approveListing,
  bulkApproveListings,
} from "@/app/[locale]/(protected)/admin/listings/actions"
import type { AdminListing } from "@/services/admin/listings"

export type { AdminListing } from "@/services/admin/listings"

type UpdateResponse = { error?: string } | void

export function useAdminListings(initialListings: AdminListing[]) {
  const [listings, setListings] = useState<AdminListing[]>(initialListings)
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë listim?")) {
      return
    }

    const result = await deleteListing(id)
    if (result.error) {
      alert(result.error)
      return
    }

    setListings((prev: AdminListing[]) => prev.filter((listing) => listing.id !== id))
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    alert("Listimi u fshi me sukses!")
  }, [])

  const handleUpdate = useCallback(
    async (id: string, parsedData: Partial<AdminListing>): Promise<UpdateResponse> => {
      const cleanData = Object.fromEntries(
        Object.entries(parsedData).filter(([, v]) => v !== undefined)
      )
      const result = await updateListing(id, cleanData as any)
      if (result.error) {
        return { error: result.error }
      }

      setListings((prev: AdminListing[]) =>
        prev.map((listing) => (listing.id === id ? { ...listing, ...parsedData } : listing))
      )
      alert("Listimi u përditësua me sukses!")
      return {}
    },
    []
  )

  const handleApprove = useCallback(async (id: string) => {
    const result = await approveListing(id)
    if (result.error) return { error: result.error }
    setListings((prev: AdminListing[]) =>
      prev.map((listing) => (listing.id === id ? { ...listing, is_approved: true } : listing))
    )
    return {}
  }, [])

  const handleBulkApprove = useCallback(async (ids: string[]) => {
    const result = await bulkApproveListings(ids)
    if (result.error) return { error: result.error }

    // Update local state
    setListings((prev: AdminListing[]) =>
      prev.map((listing) =>
        ids.includes(listing.id) ? { ...listing, is_approved: true } : listing
      )
    )
    setSelectedIds(new Set())

    return { success: true, message: result.message }
  }, [])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  return {
    listings,
    editingListing,
    setEditingListing,
    handleDelete,
    handleUpdate,
    handleApprove,
    handleBulkApprove,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
  }
}
