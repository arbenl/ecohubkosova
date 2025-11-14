import { NextResponse } from "next/server"
import { z } from "zod"
import { fetchPublicOrganizations } from "@/services/public/organizations"

const querySchema = z.object({
  lloji: z.string().optional(),
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

  const { data, error } = await fetchPublicOrganizations(parsed.data)

  if (error) {
    return NextResponse.json(
      { error: "Nuk u arrit marrja e organizatave.", details: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}
