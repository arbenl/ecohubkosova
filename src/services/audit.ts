import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { auditLogs, users } from "@/db/schema"

export type AuditAction =
  | "LISTING_APPROVED"
  | "LISTING_REJECTED"
  | "LISTING_DELETED"
  | "LISTING_UPDATED"
  | "ORGANIZATION_APPROVED"
  | "ORGANIZATION_REJECTED"
  | "ORGANIZATION_DELETED"
  | "USER_APPROVED"
  | "USER_DELETED"
  | "USER_ROLE_CHANGED"
  | "ARTICLE_PUBLISHED"
  | "ARTICLE_UNPUBLISHED"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"

export type EntityType = "listing" | "organization" | "user" | "article" | "system"

export interface CreateAuditLogInput {
  actorId?: string
  actorEmail?: string
  action: AuditAction
  entityType: EntityType
  entityId?: string
  entityName?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export interface AuditLogEntry {
  id: string
  actorId: string | null
  actorEmail: string | null
  actorName: string | null
  action: string
  entityType: string
  entityId: string | null
  entityName: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error.")

/**
 * Create an audit log entry
 */
export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    await db
      .get()
      .insert(auditLogs)
      .values({
        actor_id: input.actorId || null,
        actor_email: input.actorEmail || null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        entity_name: input.entityName || null,
        details: input.details ? JSON.stringify(input.details) : null,
        ip_address: input.ipAddress || null,
      })
    return { error: null }
  } catch (error) {
    console.error("[AuditService] Failed to create audit log:", error)
    return { error: toError(error) }
  }
}

/**
 * Fetch audit logs with pagination
 */
export async function fetchAuditLogs(limit = 50, offset = 0) {
  try {
    const rows = await db
      .get()
      .select({
        id: auditLogs.id,
        actorId: auditLogs.actor_id,
        actorEmail: auditLogs.actor_email,
        actorName: users.full_name,
        action: auditLogs.action,
        entityType: auditLogs.entity_type,
        entityId: auditLogs.entity_id,
        entityName: auditLogs.entity_name,
        details: auditLogs.details,
        ipAddress: auditLogs.ip_address,
        createdAt: auditLogs.created_at,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actor_id, users.id))
      .orderBy(desc(auditLogs.created_at))
      .limit(limit)
      .offset(offset)

    const data: AuditLogEntry[] = rows.map((row) => ({
      id: row.id,
      actorId: row.actorId,
      actorEmail: row.actorEmail,
      actorName: row.actorName,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      entityName: row.entityName,
      details: row.details,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt.toISOString(),
    }))

    return { data, error: null }
  } catch (error) {
    console.error("[AuditService] Failed to fetch audit logs:", error)
    return { data: null, error: toError(error) }
  }
}

/**
 * Get total count of audit logs
 */
export async function countAuditLogs() {
  try {
    const result = await db.get().select().from(auditLogs)
    return { count: result.length, error: null }
  } catch (error) {
    return { count: 0, error: toError(error) }
  }
}
