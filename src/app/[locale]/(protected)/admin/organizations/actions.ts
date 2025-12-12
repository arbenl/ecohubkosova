"use server"

import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"
import {
  deleteOrganizationRecord,
  fetchAdminOrganizations,
  updateOrganizationRecord,
  approveOrganizationRecord,
  type AdminOrganization,
  type AdminOrganizationUpdateInput,
} from "@/services/admin/organizations"
import { adminOrganizationUpdateSchema } from "@/validation/admin"
import { createAuditLog } from "@/services/audit"

type OrganizationUpdateData = AdminOrganizationUpdateInput

type GetOrganizationsResult = {
  data: AdminOrganization[] | null
  error: string | null
}

export async function getOrganizations(): Promise<GetOrganizationsResult> {
  try {
    const { data, error } = await fetchAdminOrganizations()

    if (error) {
      console.error("Error fetching organizations:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së organizatave." }
    }

    return { data: data ?? [], error: null }
  } catch (error) {
    console.error("Server Action Error (getOrganizations):", error)
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Gabim i panjohur gjatë marrjes së organizatave.",
    }
  }
}

export async function deleteOrganization(organizationId: string, orgName?: string) {
  const admin = await requireAdminRole()

  try {
    const { error } = await deleteOrganizationRecord(organizationId)

    if (error) {
      console.error("Error deleting organization:", error)
      return { error: error.message ?? "Gabim gjatë fshirjes së organizatës." }
    }

    // Log audit
    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "ORGANIZATION_DELETED",
      entityType: "organization",
      entityId: organizationId,
      entityName: orgName,
    })

    revalidatePath("/admin/organizations")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteOrganization):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së organizatës." }
  }
}

export async function updateOrganization(organizationId: string, formData: OrganizationUpdateData) {
  const admin = await requireAdminRole()

  const parsed = adminOrganizationUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message || "Të dhënat e organizatës nuk janë të vlefshme."
    return { error: message }
  }

  try {
    const { error } = await updateOrganizationRecord(organizationId, parsed.data)

    if (error) {
      console.error("Error updating organization:", error)
      return { error: error.message ?? "Gabim gjatë përditësimit të organizatës." }
    }

    revalidatePath("/admin/organizations")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateOrganization):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të organizatës." }
  }
}

export async function approveOrganization(organizationId: string, orgName?: string) {
  const admin = await requireAdminRole()

  try {
    const { error } = await approveOrganizationRecord(organizationId)
    if (error) {
      return { error: error.message }
    }

    // Log audit
    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "ORGANIZATION_APPROVED",
      entityType: "organization",
      entityId: organizationId,
      entityName: orgName,
    })

    revalidatePath("/admin/organizations")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
