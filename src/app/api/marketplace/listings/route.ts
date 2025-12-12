"use server"

import { NextResponse } from "next/server"
import { fetchListings } from "@/services/listings"

export async function GET(request: Request) {
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
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest"
  const locale = searchParams.get("locale") || undefined

  const result = await fetchListings({
    type,
    flowType: flowType || undefined,
    search,
    category,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 12,
    condition,
    location,
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
