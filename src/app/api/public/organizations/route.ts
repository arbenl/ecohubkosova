import { fetchPublicOrganizations } from "@/services/public/organizations"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 100)
    const type = searchParams.get("type") || undefined
    const search = searchParams.get("search") || undefined

    const result = await fetchPublicOrganizations({
      type,
      search,
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    // Limit the results
    const data = (result.data || []).slice(0, limit)

    return NextResponse.json({ data, total: data.length })
  } catch (error) {
    console.error("[api/public/organizations]", error)
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    )
  }
}
