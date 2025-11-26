/**
 * Safe JSONB type for Drizzle ORM
 * Handles the case where postgres-js may have already parsed JSONB columns
 * or when the data might be malformed.
 */

import { customType } from "drizzle-orm/pg-core"

/**
 * Internal type configuration - exported for testing
 * @internal
 */
export const createSafeJsonbConfig = <TData = unknown>(name: string) => ({
  dataType() {
    return "jsonb"
  },
  toDriver(value: TData): string {
    // Convert to JSON string for insertion
    return JSON.stringify(value)
  },
  fromDriver(value: string | object): TData {
    // Handle case where postgres-js has already parsed the value
    if (typeof value === "object" && value !== null) {
      return value as TData
    }

    // Handle string values - need to parse
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as TData
      } catch (error) {
        console.error(`[safeJsonb] Failed to parse JSONB value for column "${name}":`, {
          error,
          valueLength: value.length,
          valueStart: value.substring(0, 100),
          valueEnd: value.substring(Math.max(0, value.length - 100)),
          position1034: value.substring(1030, 1040),
        })
        // Return empty object as fallback to prevent crashes
        return {} as TData
      }
    }

    // Unexpected type - return empty object
    console.warn(`[safeJsonb] Unexpected value type for column "${name}":`, typeof value)
    return {} as TData
  },
})

export const safeJsonb = <TData = unknown>(name: string) =>
  customType<{ data: TData; driverData: string | object }>(createSafeJsonbConfig<TData>(name))(name)
