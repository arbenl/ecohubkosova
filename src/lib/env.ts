const normalizeBoolean = (value: string | undefined | null): boolean | undefined => {
  if (value === undefined || value === null) return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === "false") return false
  if (normalized === "true") return true
  return undefined
}

/**
 * Feature flag for marketplace writes.
 * Defaults to true so V2 remains the only write path.
 */
export function isMarketplaceV2WritesEnabled(): boolean {
  const envValue =
    process.env.NEXT_PUBLIC_USE_MARKETPLACE_V2_WRITES ?? process.env.USE_MARKETPLACE_V2_WRITES
  const parsed = normalizeBoolean(envValue)
  if (parsed === undefined) return true
  return parsed
}
