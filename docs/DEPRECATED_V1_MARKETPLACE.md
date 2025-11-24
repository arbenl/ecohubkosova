# Marketplace V1 vs V2 – Deprecation & Architecture Guide

## TL;DR

- **V1 marketplace** (`tregu_listime` / `marketplaceListings` table) is **internal-only**.
- **V2 marketplace** (`eco_listings` + supporting tables) is the **public, eco-first marketplace**.
- All **public-facing routes** (`/[locale]/marketplace/*`) must use **V2**.
- V1 stays around only for legacy user submissions and admin tooling.

---

## V1 – Legacy Marketplace (Internal Only)

### Database Schema

**Main Table**: `tregu_listime` (exposed as `marketplaceListings` in Drizzle schema)

**Structure**:
```sql
CREATE TABLE tregu_listime (
  id UUID PRIMARY KEY,
  created_by_user_id UUID NOT NULL (FK → users),
  organization_id UUID (FK → organizations),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  price DECIMAL,
  unit TEXT,
  location TEXT,
  gjendja TEXT (condition),
  listing_type TEXT ('shes' | 'blej'), -- sell or buy
  is_approved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Relationships**:
- User who created listing → `users` table
- Organization (if listed under org) → `organizations` table

### Usage Rules

#### ✅ OK to Use For:
- Admin dashboards querying user submissions
- Back-office review/approval workflows
- Historical data migration scripts
- Analytics on legacy user submissions
- Internal audit trails

#### ❌ DO NOT Use For:
- Public marketplace pages (`/[locale]/marketplace`, `/[locale]/marketplace/[id]`)
- New features or public-facing functionality
- New E2E tests verifying public marketplace behavior
- Any API endpoint that serves public marketplace data
- New marketplace UIs or components

### Service Layer Code

**File**: `src/services/listings.ts`

**Functions using V1** (INTERNAL ONLY):
```typescript
// These use V1 (marketplaceListings / tregu_listime)
export async function fetchListings() { ... }  // Admin/dashboard only
export async function createUserListing() { ... }  // User submissions (legacy)
export async function updateUserListing() { ... }  // User submissions (legacy)
export async function deleteUserListing() { ... }  // User submissions (legacy)
```

⚠️ **NOTE**: These are used by the legacy user-created listing flow. They should NOT be used for public marketplace display.

---

## V2 – Eco-First Marketplace (Public)

### Database Schema

**Main Tables**:

1. **`eco_listings`** – Core marketplace listings
   ```sql
   id UUID PRIMARY KEY,
   created_by_user_id UUID NOT NULL,
   organization_id UUID (FK → organizations),
   category_id UUID (FK → eco_categories),
   title TEXT,
   description TEXT,
   flow_type enum ('OFFER_WASTE', 'OFFER_MATERIAL', 'OFFER_RECYCLED_PRODUCT', 'REQUEST_MATERIAL', 'SERVICE_*'),
   condition enum ('NEW', 'USED', 'SCRAP', etc.),
   quantity DECIMAL,
   unit TEXT,
   price DECIMAL,
   currency TEXT,
   city TEXT,
   eco_labels TEXT[],
   tags TEXT[],
   status enum ('ACTIVE', 'DRAFT', 'SOLD', ...),
   visibility enum ('PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'),
   verification_status enum ('VERIFIED', 'UNVERIFIED', ...),
   created_at TIMESTAMPTZ,
   updated_at TIMESTAMPTZ
   ```

2. **`eco_categories`** – Hierarchical category taxonomy
   ```sql
   id UUID PRIMARY KEY,
   slug TEXT UNIQUE,
   name_en TEXT, name_sq TEXT,
   parent_id UUID (self-reference for hierarchy),
   ...
   ```

3. **`eco_organizations`** – Eco-specific organization data
   ```sql
   id UUID PRIMARY KEY,
   organization_id UUID UNIQUE NOT NULL (FK → organizations),
   org_role enum ('PRODUCER', 'RECYCLER', 'COLLECTOR', ...),
   verification_status enum ('VERIFIED', 'PENDING', ...),
   waste_types_handled TEXT[],
   service_areas TEXT[],
   certifications TEXT[],
   ...
   ```

4. **`eco_listing_media`** – Listing images
5. **`eco_listing_interactions`** – Views, saves, contacts, shares

### Service Layer Code

**File**: `src/services/listings.ts`

**Public V2 Functions**:
```typescript
// These ONLY use V2 (eco_listings)
export async function fetchListingById(id: string) {
  // Queries: eco_listings + eco_categories + organizations join
  // Returns: Listing with organization.name + organization.contact_email
  // Filters: status = 'ACTIVE' AND visibility = 'PUBLIC'
}
```

**File**: `src/services/eco-organizations.ts`

**Eco-Organization Functions**:
```typescript
export async function fetchEcoOrganizationById(organizationId: string)
export async function fetchEcoOrganizationsByRole(role: string)
// These query: eco_organizations + organizations (joined)
```

### API Routes (Public V2)

All these routes serve eco_listings ONLY:

| Route | Purpose | Uses |
| --- | --- | --- |
| `GET /api/marketplace/listings` | Main marketplace API | eco_listings + ecoCategories |
| `GET /api/marketplace-v2/listings` | V2 dedicated API | eco_listings (type-safe) |
| `GET /api/marketplace-v2/interactions` | Save/contact/view tracking | eco_listing_interactions |
| `GET /api/marketplace-v2/related` | Related listings | eco_listings (filtered) |

### Public Routes (V2 Marketplace)

| Path | Component | V2 Tables Used |
| --- | --- | --- |
| `/[locale]/marketplace` | Landing + grid | eco_listings, ecoCategories |
| `/[locale]/marketplace/[id]` | Detail page | eco_listings, organizations (via join) |
| `/[locale]/marketplace/add` | Create form | (still uses V1 for now, but submits should go to eco_listings) |
| `/[locale]/my/saved-listings` | Saved listings | eco_listing_interactions + eco_listings |
| `/[locale]/eco-organizations` | Org directory | eco_organizations + organizations |
| `/[locale]/eco-organizations/[id]` | Org profile | eco_organizations + organizations |

### Key Differences from V1

| Aspect | V1 | V2 |
| --- | --- | --- |
| **Visibility** | Internal only | Public |
| **Flow Type** | Simple "shes"/"blej" | Complex enums (OFFER_WASTE, SERVICE_REPAIR, etc.) |
| **Organization Join** | Direct FK | Via eco_organizations → organizations |
| **Categories** | Flat, text-based | Hierarchical (parent_id) |
| **Interactions Tracking** | None | Comprehensive (views, saves, contacts, shares) |
| **Eco Data** | None | Eco labels, certifications, waste types |
| **Media** | Not tracked in schema | `eco_listing_media` table |
| **Status/Visibility** | is_approved boolean | Separate enums (status, visibility, verification_status) |

---

## Migration & Contact Info Wiring

### How Organization Contact Info Flows (V2)

1. **Detail Page Route** (`src/app/[locale]/(site)/marketplace/[id]/page.tsx`):
   ```typescript
   const { data: listing } = await fetchListingById(id)
   // listing.organizations? { name, contact_email }
   ```

2. **Service Query** (`src/services/listings.ts`):
   ```typescript
   export async function fetchListingById(id: string) {
     // Joins eco_listings → organizations via eco_listings.organization_id
     const records = await db
       .select({
         listing: ecoListings,
         organization_name: organizations.name,
         organization_contact_email: organizations.contact_email,
       })
       .from(ecoListings)
       .leftJoin(organizations, eq(ecoListings.organization_id, organizations.id))
     // Returns: listing.organizations = { name, contact_email }
   }
   ```

3. **UI Display** (Detail Page Sidebar):
   ```tsx
   {listing.organizations ? (
     <>
       <p>Organization: {listing.organizations.name}</p>
       <a href={`mailto:${listing.organizations.contact_email}`}>
         {listing.organizations.contact_email}
       </a>
     </>
   ) : (
     <>
       <p>Creator: {listing.users?.full_name}</p>
       <a href={`mailto:${listing.users?.email}`}>
         {listing.users?.email}
       </a>
     </>
   )}
   ```

---

## Guidelines for New Code

### Rule 1: Identify Public vs Internal

- **If building a public marketplace feature** (user sees it at `/marketplace/*`):
  - ✅ Use `eco_listings` / V2 services
  - ❌ Never touch `tregu_listime`

- **If building admin/internal tooling**:
  - ✅ May read/write `tregu_listime` for legacy flows
  - 📝 Add a comment: `// V1 legacy table – internal only`

### Rule 2: Always Use Service Layer

**Good** ✅:
```typescript
// Public marketplace route
import { fetchListingById } from "@/services/listings"
const { data: listing } = await fetchListingById(id)
```

**Bad** ❌:
```typescript
// Don't query database directly
const listing = await db.select().from(marketplaceListings).where(eq(...))
```

### Rule 3: Check Your Imports

- Importing `marketplaceListings`? → V1 (internal only)
- Importing `ecoListings`? → V2 (public marketplace)

If you're in a public route and see `marketplaceListings`, refactor to use `ecoListings` instead.

### Rule 4: Test with the Right Data

- **Unit/E2E tests for V2**: Use `eco_listings` + seeded eco_organizations data
- **Unit/E2E tests for V1 flows**: Use legacy test data, keep internal only

---

## How to Check Your Changes

### Checklist Before Committing

1. **New feature is public-facing** (users see it)?
   - [ ] ✅ Uses `eco_listings`, not `marketplaceListings`
   - [ ] ✅ Routes under `/[locale]/marketplace*`
   - [ ] ✅ Queries go through `src/services/listings.ts` or similar
   - [ ] ✅ E2E tests use V2 URLs (`/sq/marketplace/[id]`)

2. **New feature is internal** (admin only)?
   - [ ] ✅ Comment says `// V1 legacy – internal only`
   - [ ] ✅ Uses appropriate admin routes (`/dashboard/*`, `/admin/*`)
   - [ ] ✅ No public URLs touched

3. **Importing tables directly**?
   - [ ] Never: `import { marketplaceListings } from "@/db/schema"` in public routes
   - [ ] ✅ Use: `import { ecoListings } from "@/db/schema"` for V2

### Troubleshooting

**Q: "My listing detail page isn't showing organization info"**
- A: Check if `fetchListingById()` is joining `organizations` table
- A: Verify `eco_listings.organization_id` is set for that listing
- A: Check Supabase RLS policy allows reading joined organizations

**Q: "Why is `/api/marketplace/listings` using `eco_listings` instead of `marketplaceListings`?"**
- A: Because it's a public API endpoint. Only V2 serves public data.
- A: V1 is only for internal flows (user create/update/delete submissions).

**Q: "Can I still use `marketplaceListings`?"**
- A: Only for internal admin code. Add clear comment: `// V1 legacy table – internal only`
- A: Prefer migrating to V2 when possible.

---

## Data Status

### Seeded Data (V2)

✅ 12 Kosovo eco organizations in `organizations` + `eco_organizations`
- REC-KOS, PLASTIKA, EUROGOMA, ECO KOS, POWERPACK, etc.

✅ 6+ demo listings in `eco_listings`
- Linked to seeded organizations via `organization_id`
- Show full contact info (org name + email) on detail pages

---

## Further Reading

- **Marketplace V2 Schema**: `src/db/schema/marketplace-v2.ts`
- **V2 Service Layer**: `src/services/listings.ts`
- **Detail Page Route**: `src/app/[locale]/(site)/marketplace/[id]/page.tsx`
- **E2E Tests**: `e2e/marketplace-v2/listing-organization-contact.spec.ts`

---

**Last Updated**: November 23, 2025
**Status**: V2 Public Marketplace – V1 Internal Only
