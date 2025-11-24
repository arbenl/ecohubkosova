import { NextResponse, type NextRequest } from "next/server"
import { fetchListings } from "@/services/listings"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page") ?? "1")
    const pageSize = Number(searchParams.get("pageSize") ?? "12")
    const type = searchParams.get("type") ?? "te-gjitha"
    const flowType = searchParams.get("flowType") ?? undefined
    const search = searchParams.get("q") ?? searchParams.get("search") ?? ""
    const category = searchParams.get("category") ?? "all"
    const condition = searchParams.get("condition") ?? ""
    const location = searchParams.get("location") ?? ""
    const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest"
    const locale = searchParams.get("locale") ?? undefined

    const result = await fetchListings({
      type,
      flowType,
      search,
      category,
      page,
      pageSize,
      condition,
      location,
      sort,
      locale,
    })

    return NextResponse.json({
      listings: result.data,
      hasMore: result.hasMore,
      page,
      pageSize,
      error: result.error,
    })
  } catch (error) {
    console.error("[Marketplace API] DB error loading listings (V2)", error)

    return NextResponse.json(
      {
        error: "db_unavailable",
        message: "Database is temporarily unavailable for marketplace.",
      },
      { status: 503 }
    )
  }
}
