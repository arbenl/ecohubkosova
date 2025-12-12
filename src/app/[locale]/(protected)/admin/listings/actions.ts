"use server"

import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"
import {
  deleteListingRecord,
  fetchAdminListings,
  updateListingRecord,
  approveListingRecord,
  rejectListingRecord,
  getListingForNotification,
  type AdminListing,
  type AdminListingUpdateInput,
} from "@/services/admin/listings"
import { adminListingUpdateSchema } from "@/validation/admin"
import { sendListingApprovedEmail } from "@/services/notifications/email-service"
import { createAuditLog } from "@/services/audit"

type ListingUpdateData = AdminListingUpdateInput

type GetListingsResult = {
  data: AdminListing[] | null
  error: string | null
}

export async function getListings(): Promise<GetListingsResult> {
  try {
    const { data, error } = await fetchAdminListings()

    if (error) {
      console.error("Error fetching listings:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së listimeve." }
    }

    return { data: data ?? [], error: null }
  } catch (error) {
    console.error("Server Action Error (getListings):", error)
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Gabim i panjohur gjatë marrjes së listimeve.",
    }
  }
}

export async function deleteListing(listingId: string) {
  const user = await requireAdminRole()

  try {
    // Get listing info before deletion for audit
    const { data: listingData } = await getListingForNotification(listingId)

    const { error } = await deleteListingRecord(listingId)

    if (error) {
      console.error("Error deleting listing:", error)
      return { error: error.message ?? "Gabim gjatë fshirjes së listimit." }
    }

    // Log audit
    await createAuditLog({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "LISTING_DELETED",
      entityType: "listing",
      entityId: listingId,
      entityName: listingData?.title,
    })

    revalidatePath("/admin/listings")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteListing):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së listimit." }
  }
}

export async function updateListing(listingId: string, formData: ListingUpdateData) {
  const user = await requireAdminRole()

  const parsed = adminListingUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Të dhënat e listimit nuk janë të vlefshme."
    return { error: message }
  }

  try {
    const { error } = await updateListingRecord(listingId, parsed.data)

    if (error) {
      console.error("Error updating listing:", error)
      return { error: error.message ?? "Gabim gjatë përditësimit të listimit." }
    }

    // Log audit
    await createAuditLog({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "LISTING_UPDATED",
      entityType: "listing",
      entityId: listingId,
      entityName: parsed.data.title,
    })

    revalidatePath("/admin/listings")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateListing):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të listimit." }
  }
}

export async function approveListing(listingId: string) {
  const user = await requireAdminRole()

  try {
    const { error } = await approveListingRecord(listingId)
    if (error) {
      return { error: error.message }
    }

    // Get listing data for email and audit
    const { data: listingData } = await getListingForNotification(listingId)

    // Log audit
    await createAuditLog({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "LISTING_APPROVED",
      entityType: "listing",
      entityId: listingId,
      entityName: listingData?.title,
    })

    // Send email notification
    try {
      if (listingData?.userEmail) {
        await sendListingApprovedEmail({
          to: listingData.userEmail,
          userName: listingData.userName || "Përdorues",
          listingTitle: listingData.title,
          listingId: listingId,
        })
      }
    } catch (notifyError) {
      console.error("Failed to send approval email:", notifyError)
    }

    revalidatePath("/admin/listings")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function bulkApproveListings(listingIds: string[]) {
  const user = await requireAdminRole()

  if (!listingIds.length) {
    return { error: "Asnjë listim nuk është zgjedhur." }
  }

  const results: { success: number; failed: number; errors: string[] } = {
    success: 0,
    failed: 0,
    errors: [],
  }

  for (const listingId of listingIds) {
    try {
      const { error } = await approveListingRecord(listingId)
      if (error) {
        results.failed++
        results.errors.push(`${listingId}: ${error.message}`)
        continue
      }

      // Get listing data for audit
      const { data: listingData } = await getListingForNotification(listingId)

      // Log audit
      await createAuditLog({
        actorId: user?.id,
        actorEmail: user?.email,
        action: "LISTING_APPROVED",
        entityType: "listing",
        entityId: listingId,
        entityName: listingData?.title,
        details: { bulkApproval: true },
      })

      // Send email notification (don't await to speed up bulk)
      if (listingData?.userEmail) {
        sendListingApprovedEmail({
          to: listingData.userEmail,
          userName: listingData.userName || "Përdorues",
          listingTitle: listingData.title,
          listingId: listingId,
        }).catch((err) => console.error("Bulk email failed:", err))
      }

      results.success++
    } catch (err: any) {
      results.failed++
      results.errors.push(`${listingId}: ${err.message}`)
    }
  }

  revalidatePath("/admin/listings")

  if (results.failed > 0 && results.success === 0) {
    return { error: `Të gjitha aprovumet dështuan: ${results.errors.join(", ")}` }
  }

  return {
    success: true,
    message: `${results.success} listime u aprovuan${results.failed > 0 ? `, ${results.failed} dështuan` : ""}.`,
    details: results,
  }
}
