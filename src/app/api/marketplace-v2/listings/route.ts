import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { ecoListings, ecoCategories } from "@/db/schema"
import { flowTypeEnum } from "@/db/schema/enums"
import { eq, and, or, ilike, inArray, count, desc } from "drizzle-orm"
import type { Listing, MarketplaceListingsResponse } from "@/app/[locale]/(site)/marketplace-v2/types"

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 100

type FlowType = (typeof flowTypeEnum.enumValues)[number]

const parsePageParam = (value: string | null): number => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 1
    }
    return Math.floor(parsed)
}

const parseLimitParam = (value: string | null): number => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_LIMIT
    }
    return Math.min(Math.floor(parsed), MAX_LIMIT)
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        // Parse query parameters
        const q = searchParams.get("q") // Search query
        const flowType = searchParams.get("flowType") // Flow type filter
        const page = parsePageParam(searchParams.get("page"))
        const limit = parseLimitParam(searchParams.get("limit"))

        // Build where conditions
        const conditions = [
            eq(ecoListings.status, "ACTIVE"),
            eq(ecoListings.visibility, "PUBLIC"),
        ]

        // Search filter (title or description)
        const trimmedQuery = q?.trim()
        if (trimmedQuery) {
            conditions.push(
                or(
                    ilike(ecoListings.title, `%${trimmedQuery}%`),
                    ilike(ecoListings.description, `%${trimmedQuery}%`)
                )!
            )
        }

        // Flow type filter (can be comma-separated for OR logic)
        const trimmedFlowTypes =
            flowType
                ?.split(",")
                .map((ft) => ft.trim())
                .filter(Boolean) ?? []
        if (trimmedFlowTypes.length === 1) {
            conditions.push(eq(ecoListings.flow_type, trimmedFlowTypes[0] as FlowType))
        } else if (trimmedFlowTypes.length > 1) {
            conditions.push(inArray(ecoListings.flow_type, trimmedFlowTypes as FlowType[]))
        }

        const whereClause = and(...conditions)

        // Get total count for pagination
        const [countResult] = await db
            .get()
            .select({ count: count() })
            .from(ecoListings)
            .where(whereClause)

        const totalCount = Number(countResult?.count ?? 0)
        const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / limit)
        const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1
        const offset = (safePage - 1) * limit

        // Query with joins and pagination
        const listings: Listing[] = await db
            .get()
            .select({
                id: ecoListings.id,
                title: ecoListings.title,
                description: ecoListings.description,
                flow_type: ecoListings.flow_type,
                price: ecoListings.price,
                currency: ecoListings.currency,
                pricing_type: ecoListings.pricing_type,
                city: ecoListings.city,
                eco_labels: ecoListings.eco_labels,
                tags: ecoListings.tags,
                created_at: ecoListings.created_at,
                category_name_en: ecoCategories.name_en,
                category_name_sq: ecoCategories.name_sq,
                category_id: ecoCategories.id,
                category_slug: ecoCategories.slug,
            })
            .from(ecoListings)
            .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
            .where(whereClause)
            .orderBy(desc(ecoListings.created_at)) // Newest first
            .limit(limit)
            .offset(offset)

        const response: MarketplaceListingsResponse = {
            success: true,
            listings,
            count: listings.length,
            totalCount,
            page: safePage,
            limit,
            totalPages,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("[Marketplace V2 API] Error fetching listings:", error)

        return NextResponse.json(
            {
                success: false,
                error: "db_error",
                message: "Failed to fetch listings",
            },
            { status: 500 }
        )
    }
}
