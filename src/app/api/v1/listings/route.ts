import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchPublicListings } from "@/services/public/listings"

const querySchema = z.object({
  category: z.string().optional(),
  type: z.enum(["shes", "blej"]).optional(),
  search: z.string().optional(),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()))

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parametrat e kërkesës nuk janë të vlefshme.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { data, error } = await fetchPublicListings(parsed.data)

  if (error) {
    return NextResponse.json(
      { error: "Nuk u arrit marrja e listimeve.", details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}
