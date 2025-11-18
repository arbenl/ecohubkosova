"use client"

import { useCallback, useState } from "react"
import { deleteListing, updateListing } from "@/app/[locale]/(protected)/admin/listings/actions"
import type { AdminListing } from "@/services/admin/listings"

export type { AdminListing } from "@/services/admin/listings"

type UpdateResponse = { error?: string } | void

export function useAdminListings(initialListings: AdminListing[]) {
  const [listings, setListings] = useState<AdminListing[]>(initialListings)
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë listim?")) {
      return
    }

    const result = await deleteListing(id)
    if (result.error) {
      alert(result.error)
      return
    }

    setListings((prev) => prev.filter((listing) => listing.id !== id))
    alert("Listimi u fshi me sukses!")
  }, [])

  const handleUpdate = useCallback(
    async (id: string, parsedData: Partial<AdminListing>): Promise<UpdateResponse> => {
      // Filter out undefined values to ensure all required fields are present
      const cleanData = Object.fromEntries(
        Object.entries(parsedData).filter(([, v]) => v !== undefined)
      )
      const result = await updateListing(id, cleanData as any)
      if (result.error) {
        return { error: result.error }
      }

      setListings((prev) => prev.map((listing) => (listing.id === id ? { ...listing, ...parsedData } : listing)))
      alert("Listimi u përditësua me sukses!")
      return {}
    },
    []
  )

  return {
    listings,
    editingListing,
    setEditingListing,
    handleDelete,
    handleUpdate,
  }
}
