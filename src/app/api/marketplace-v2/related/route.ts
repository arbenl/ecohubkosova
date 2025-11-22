import { NextResponse } from "next/server"
import { db } from "@/lib/drizzle"
import { ecoListings, ecoCategories } from "@/db/schema"
import { eq, and, ne, inArray, desc } from "drizzle-orm"

const DEFAULT_LIMIT = 6
const MAX_LIMIT = 12

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

        const currentId = searchParams.get("currentId")
        const categoryId = searchParams.get("categoryId")
        const tagsParam = searchParams.get("tags")
        const limit = parseLimitParam(searchParams.get("limit"))

        if (!currentId) {
            return NextResponse.json(
                { error: "currentId parameter is required" },
                { status: 400 }
            )
        }

        // Build where conditions
        const conditions = [
            eq(ecoListings.status, "ACTIVE"),
            eq(ecoListings.visibility, "PUBLIC"),
            ne(ecoListings.id, currentId), // Exclude current listing
        ]

        // Category filter - prioritize category matches
        if (categoryId) {
            conditions.push(eq(ecoListings.category_id, categoryId))
        }

        // Tags filter - if no category match, try tags
        let tags: string[] = []
        if (tagsParam) {
            tags = tagsParam.split(",").map(tag => tag.trim()).filter(Boolean)
            // For now, skip tag filtering as it requires array overlap functionality
            // TODO: Implement proper array overlap filtering when needed
        }

        // Fetch related listings
        const relatedListings = await db
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
                category_name_en: ecoCategories.name_en,
                category_name_sq: ecoCategories.name_sq,
                category_id: ecoCategories.id,
            })
            .from(ecoListings)
            .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
            .where(and(...conditions))
            .orderBy(desc(ecoListings.created_at))
            .limit(limit)

        return NextResponse.json({
            listings: relatedListings,
            count: relatedListings.length,
        })
    } catch (error) {
        console.error("Error fetching related listings:", error)
        return NextResponse.json(
            { error: "Failed to fetch related listings" },
            { status: 500 }
        )
    }
}