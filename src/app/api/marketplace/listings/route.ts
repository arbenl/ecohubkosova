"use server"

import { NextResponse } from "next/server"
import { fetchListings } from "@/services/listings"
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const ip = getClientIp(request.headers)
  const { success: withinLimit, resetIn } = await checkRateLimit(
    `marketplace-listings:${ip}`,
    RATE_LIMITS.API_SEARCH.limit,
    RATE_LIMITS.API_SEARCH.windowMs
  )

  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests", listings: [], hasMore: false },
      { status: 429, headers: { "Retry-After": Math.ceil(resetIn / 1000).toString() } }
    )
  }

  const url = new URL(request.url)
  const searchParams = url.searchParams

  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "12", 10)
  const type = searchParams.get("type") || "te-gjitha"
  const flowType = searchParams.get("flowType") || undefined
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || "all"
  const condition = searchParams.get("condition") || ""
  const location = searchParams.get("location") || ""
  const tag = searchParams.get("tag") || ""
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest"
  const locale = searchParams.get("locale") || undefined

  const result = await fetchListings({
    type,
    flowType: flowType || undefined,
    search,
    category,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 12,
    condition,
    location,
    tag,
    sort,
    locale,
  })

  if (result.error) {
    return NextResponse.json(
      { error: result.error, listings: [], hasMore: false },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  return NextResponse.json(
    { listings: result.data, hasMore: result.hasMore },
    { headers: { "Cache-Control": "no-store" } }
  )
}
