import { NextRequest, NextResponse } from "next/server"
import { eq, and, sql } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoListingInteractions, interactionTypeEnum } from "@/db/schema"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type InteractionType = (typeof interactionTypeEnum.enumValues)[number]

interface InteractionRequest {
    listingId: string
    type: InteractionType
    metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createServerSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }

        const body: InteractionRequest = await request.json()
        const { listingId, type, metadata = {} } = body

        if (!listingId || !type) {
            return NextResponse.json(
                { error: "listingId and type are required" },
                { status: 400 }
            )
        }

        // Validate interaction type
        if (!interactionTypeEnum.enumValues.includes(type)) {
            return NextResponse.json(
                { error: "Invalid interaction type" },
                { status: 400 }
            )
        }

        // For SAVE interactions, check if already exists (unique constraint)
        if (type === "SAVE") {
            const existing = await db
                .get()
                .select()
                .from(ecoListingInteractions)
                .where(
                    and(
                        eq(ecoListingInteractions.listing_id, listingId),
                        eq(ecoListingInteractions.user_id, user.id),
                        eq(ecoListingInteractions.interaction_type, type)
                    )
                )
                .limit(1)

            if (existing.length > 0) {
                // Already saved, this is actually an unsave - delete it
                await db
                    .get()
                    .delete(ecoListingInteractions)
                    .where(
                        and(
                            eq(ecoListingInteractions.listing_id, listingId),
                            eq(ecoListingInteractions.user_id, user.id),
                            eq(ecoListingInteractions.interaction_type, type)
                        )
                    )

                return NextResponse.json({
                    success: true,
                    action: "unsaved",
                    message: "Listing unsaved"
                })
            }
        }

        // Insert the interaction
        await db
            .get()
            .insert(ecoListingInteractions)
            .values({
                listing_id: listingId,
                user_id: user.id,
                interaction_type: type,
                metadata: metadata,
            })

        return NextResponse.json({
            success: true,
            action: type === "SAVE" ? "saved" : "recorded",
            message: `${type} interaction recorded`
        })

    } catch (error) {
        console.error("Error recording interaction:", error)

        // Handle unique constraint violation for SAVE (shouldn't happen due to our check, but just in case)
        if (error instanceof Error && error.message.includes("duplicate key")) {
            return NextResponse.json(
                { error: "Interaction already exists" },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: "Failed to record interaction" },
            { status: 500 }
        )
    }
}

// GET endpoint to check if user has saved a listing
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const listingId = searchParams.get("listingId")
        const type = searchParams.get("type") as InteractionType

        if (!listingId || !type) {
            return NextResponse.json(
                { error: "listingId and type are required" },
                { status: 400 }
            )
        }

        const interaction = await db
            .get()
            .select()
            .from(ecoListingInteractions)
            .where(
                and(
                    eq(ecoListingInteractions.listing_id, listingId),
                    eq(ecoListingInteractions.user_id, user.id),
                    eq(ecoListingInteractions.interaction_type, type)
                )
            )
            .limit(1)

        return NextResponse.json({
            exists: interaction.length > 0,
            interaction: interaction[0] || null
        })

    } catch (error) {
        console.error("Error checking interaction:", error)
        return NextResponse.json(
            { error: "Failed to check interaction" },
            { status: 500 }
        )
    }
}