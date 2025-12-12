"use server"

import { requireAdminRole } from "@/lib/auth/roles"
import { fetchAuditLogs, countAuditLogs, type AuditLogEntry } from "@/services/audit"

type GetAuditLogsResult = {
  data: AuditLogEntry[] | null
  total: number
  error: string | null
}

export async function getAuditLogs(limit = 50, offset = 0): Promise<GetAuditLogsResult> {
  await requireAdminRole()

  try {
    const [logsResult, countResult] = await Promise.all([
      fetchAuditLogs(limit, offset),
      countAuditLogs(),
    ])

    if (logsResult.error) {
      return { data: null, total: 0, error: logsResult.error.message }
    }

    return {
      data: logsResult.data ?? [],
      total: countResult.count,
      error: null,
    }
  } catch (error) {
    console.error("Server Action Error (getAuditLogs):", error)
    return {
      data: null,
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
