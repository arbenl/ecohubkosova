// src/app/api/marketplace/listings/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { marketplaceListings, users, organizations } from '@/db/schema'
import { and, eq, ilike, asc, desc } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Parse filters from query params
    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '12')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const location = searchParams.get('location')
    const sort = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest'

    const offset = (page - 1) * pageSize

    // Build filters
    const filters = [eq(marketplaceListings.is_approved, true)]

    if (type && type !== 'te-gjitha') {
      filters.push(eq(marketplaceListings.listing_type, type))
    }

    if (search?.trim()) {
      filters.push(ilike(marketplaceListings.title, `%${search.trim()}%`))
    }

    if (category && category !== 'all') {
      filters.push(eq(marketplaceListings.category, category))
    }

    if (condition?.trim()) {
      filters.push(eq(marketplaceListings.gjendja, condition.trim()))
    }

    if (location?.trim()) {
      filters.push(ilike(marketplaceListings.location, `%${location.trim()}%`))
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters)

    // Query with joins
    const rows = await db.get()
      .select({
        id: marketplaceListings.id,
        title: marketplaceListings.title,
        description: marketplaceListings.description,
        category: marketplaceListings.category,
        price: marketplaceListings.price,
        unit: marketplaceListings.unit,
        location: marketplaceListings.location,
        quantity: marketplaceListings.quantity,
        listing_type: marketplaceListings.listing_type,
        gjendja: marketplaceListings.gjendja,
        created_at: marketplaceListings.created_at,
        owner_name: users.full_name,
        owner_email: users.email,
        organization_name: organizations.name,
        organization_email: organizations.contact_email,
      })
      .from(marketplaceListings)
      .leftJoin(users, eq(marketplaceListings.created_by_user_id, users.id))
      .leftJoin(organizations, eq(marketplaceListings.organization_id, organizations.id))
      .where(whereClause)
      .orderBy(sort === 'oldest' ? asc(marketplaceListings.created_at) : desc(marketplaceListings.created_at))
      .limit(pageSize + 1) // +1 to check if there are more
      .offset(offset)

    const hasMore = rows.length > pageSize
    const listings = rows.slice(0, pageSize)

    return NextResponse.json({
      listings,
      hasMore,
      page,
      pageSize
    })
  } catch (error) {
    console.error('[Marketplace API] DB error loading listings', error)

    return NextResponse.json(
      {
        error: 'db_unavailable',
        message: 'Database is temporarily unavailable for marketplace.',
      },
      { status: 503 },
    )
  }
}