# EcoHub Kosova Database Schema Audit & Hardening Plan

**Date:** 2025-11-24  
**Auditor:** AI Assistant (via MCP tools + direct DB inspection)  
**Scope:** Marketplace V2 schema, organization data model, legacy V1 cleanup

---

## Executive Summary

This audit reviews the EcoHub Kosova database schema focusing on the Marketplace V2 implementation (`eco_listings`, `eco_organizations`, `organizations`, `users`, `organization_members`) and identifies opportunities to **harden and simplify** the backend.

### Current State

- **51 users**, **46 organizations**, **20 eco_organizations**, **49 organization_members**
- **9 eco_listings** (V2), **24 tregu_listime** (V1 legacy)
- **25 eco_categories**
- Marketplace V2 is operational but coexists with legacy V1 tables
- Organization data is split across `organizations` and `eco_organizations`

### Top 5 Issues Identified

1. **Redundant organization contact data** across `organizations` and `eco_organizations.metadata`
2. **Inconsistent org role/type fields** (`organizations.type` vs `eco_organizations.org_role`)
3. **Legacy V1 tables still active** (`tregu_listime` has 24 rows, mutations still use it)
4. **Missing FK constraint** from `eco_organizations` to `organizations` (exists but not enforced in code layer)
5. **Fragmented contact info resolution** (email, phone, website scattered across 3 locations)

---

## A. Schema Overview & Relationships

### Core Tables Diagram (Text)

```
users (51 rows)
  ├── id (PK, FK to auth.users)
  ├── full_name, email, location, role
  ├── session_version (for single-session enforcement)
  └── is_approved

organizations (46 rows)
  ├── id (PK)
  ├── name, description, primary_interest
  ├── contact_person, contact_email, location
  ├── type (text: "OJQ", "Ndërmarrje Sociale", "Kompani", "RECYCLER", "COLLECTOR")
  └── is_approved

eco_organizations (20 rows) [extends organizations]
  ├── id (PK)
  ├── organization_id (FK → organizations.id, UNIQUE)
  ├── org_role (enum: PRODUCER, RECYCLER, COLLECTOR, etc.)
  ├── verification_status (enum: UNVERIFIED, PENDING, VERIFIED, REJECTED)
  ├── certifications[], licenses[], waste_types_handled[]
  ├── pickup_available, delivery_available
  ├── metadata (jsonb) ← contains phone, website, contact_person (redundant!)
  └── total_listings, total_transactions

organization_members (49 rows)
  ├── id (PK)
  ├── organization_id (FK → organizations.id)
  ├── user_id (FK → users.id)
  ├── role_in_organization (text: "ADMIN", "MEMBER", etc.)
  └── is_approved

eco_listings (9 rows) [Marketplace V2]
  ├── id (PK)
  ├── created_by_user_id (FK → users.id)
  ├── organization_id (FK → eco_organizations.id, nullable)
  ├── category_id (FK → eco_categories.id)
  ├── flow_type (enum: OFFER_WASTE, REQUEST_MATERIAL, SERVICE_*, etc.)
  ├── title, description, price, currency, pricing_type
  ├── city, region, location_details
  ├── status (DRAFT, ACTIVE, SOLD, FULFILLED, ARCHIVED, REJECTED)
  ├── visibility (PUBLIC, MEMBERS_ONLY, PRIVATE)
  └── eco_labels[], tags[], certifications[]

tregu_listime (24 rows) [Legacy V1]
  ├── id (PK)
  ├── created_by_user_id (FK → users.id)
  ├── organization_id (FK → organizations.id, nullable)
  ├── titulli, pershkrimi, kategori, cmimi
  ├── lloji_listimit ("shes", "blej")
  └── eshte_aprovuar
```

### Key Foreign Key Relationships

| From Table             | Column               | To Table               | On Delete |
| ---------------------- | -------------------- | ---------------------- | --------- |
| `eco_organizations`    | `organization_id`    | `organizations.id`     | CASCADE   |
| `eco_listings`         | `organization_id`    | `eco_organizations.id` | SET NULL  |
| `eco_listings`         | `created_by_user_id` | `users.id`             | CASCADE   |
| `organization_members` | `organization_id`    | `organizations.id`     | CASCADE   |
| `organization_members` | `user_id`            | `users.id`             | CASCADE   |
| `tregu_listime`        | `organization_id`    | `organizations.id`     | SET NULL  |

---

## B. Inconsistencies & Complexity Hotspots

### 1. **Redundant Organization Contact Data**

**Problem:**  
Contact information is stored in **three places**:

1. `organizations.contact_email`, `organizations.contact_person` (canonical)
2. `eco_organizations.metadata` (jsonb with `phone`, `website`, `contact_person`)
3. Resolved at runtime in `src/services/listings.ts` lines 69-74, 321-328

**Evidence:**

```typescript
// src/services/listings.ts:69-74
const orgMetadata = (row.organization_metadata ?? {}) as Record<string, unknown>
const orgPhone = typeof orgMetadata.phone === "string" ? orgMetadata.phone : null
const orgWebsite = typeof orgMetadata.website === "string" ? orgMetadata.website : null
const orgContactPerson =
  row.organization_contact_person ??
  (typeof orgMetadata.contact_person === "string" ? orgMetadata.contact_person : null)
```

**Impact:**

- Data can become inconsistent (e.g., `contact_person` in `organizations` differs from `metadata.contact_person`)
- Every listing query must resolve contact info from 2 sources
- Seed scripts must maintain both locations

**Recommendation:** Normalize to a single source of truth (see Migration Step 1 below)

---

### 2. **Inconsistent Org Role/Type Fields**

**Problem:**  
Organizations have **two overlapping classification systems**:

1. `organizations.type` (text: "OJQ", "Ndërmarrje Sociale", "Kompani", "RECYCLER", "COLLECTOR")
2. `eco_organizations.org_role` (enum: PRODUCER, RECYCLER, COLLECTOR, SERVICE_PROVIDER, NGO, etc.)

**Evidence from DB:**

```sql
-- Sample data shows mixed usage:
name: "POWERPACK Sh.p.k."
  organizations.type = "RECYCLER"
  eco_organizations.org_role = "RECYCLER"

name: "Kosovo Glass Works"
  organizations.type = "Kompani"
  eco_organizations.org_role = "RECYCLER"
```

**Impact:**

- Confusion about which field to use for filtering/display
- Legacy `type` values ("OJQ", "Kompani") don't align with V2 enum
- i18n translations must handle both systems

**Recommendation:** Deprecate `organizations.type` in favor of `eco_organizations.org_role` (see Migration Step 2)

---

### 3. **Legacy V1 Tables Still Active**

**Problem:**  
`tregu_listime` (V1) has **24 rows** and is still used by mutation functions:

**Evidence:**

```typescript
// src/services/listings.ts:431-445 (createUserListing)
await db.get().insert(marketplaceListings).values({
  created_by_user_id: userId,
  organization_id: organizationId,
  title: payload.title,
  // ... inserts into tregu_listime (V1), not eco_listings (V2)!
})
```

**Impact:**

- New listings go to V1 table, not V2
- Public flows read from V2 (`fetchListings` uses `eco_listings`)
- **Data fragmentation**: user-created listings invisible in marketplace!

**Recommendation:** Migrate mutations to V2 and soft-deprecate V1 (see Migration Step 3)

---

### 4. **Missing Enforcement of eco_organizations → organizations FK**

**Problem:**  
While the FK exists in SQL, the Drizzle schema doesn't enforce it in type-safe queries:

**Evidence:**

```typescript
// src/db/schema/marketplace-v2.ts:74-77
organization_id: uuid("organization_id")
  .references(() => organizations.id, { onDelete: "cascade" })
  .notNull()
  .unique(),
```

The FK is declared, but queries like `fetchListingById` must manually join:

```typescript
// src/services/listings.ts:300-301
.leftJoin(ecoOrganizations, eq(ecoListings.organization_id, ecoOrganizations.id))
.leftJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
```

**Impact:**

- Every listing query requires 2 joins to get org contact info
- Risk of orphaned `eco_organizations` if FK not enforced at app layer

**Recommendation:** Add a helper view or denormalize org name/email into `eco_organizations` (see Migration Step 4)

---

### 5. **Fragmented Contact Info Resolution**

**Problem:**  
Contact info for listings is resolved via complex fallback logic:

**Evidence:**

```typescript
// src/services/listings.ts:86, 341
contact: row.organization_email ?? row.owner_email ?? "",
```

**Impact:**

- ContactCardV2 must implement same fallback logic
- Inconsistent display if org email is missing but metadata has phone
- Hard to audit "who is the contact for this listing?"

**Recommendation:** Normalize contact info and add a `resolved_contact_email` computed field (see Migration Step 1)

---

## C. Concrete Improvement Plan (Incremental, Safe)

### Migration Batch 1: Normalize Organization Contact Info

**Goal:** Single source of truth for org contact data in `organizations` table.

**Changes:**

1. **DB Migration** (`20251124_normalize_org_contact_info.sql`):

   ```sql
   -- Add new columns to organizations (if not exist)
   ALTER TABLE organizations
     ADD COLUMN IF NOT EXISTS contact_phone TEXT,
     ADD COLUMN IF NOT EXISTS contact_website TEXT;

   -- Backfill from eco_organizations.metadata
   UPDATE organizations org
   SET
     contact_phone = COALESCE(
       org.contact_phone,
       (eco.metadata->>'phone')::text
     ),
     contact_website = COALESCE(
       org.contact_website,
       (eco.metadata->>'website')::text
     ),
     contact_person = COALESCE(
       org.contact_person,
       (eco.metadata->>'contact_person')::text
     )
   FROM eco_organizations eco
   WHERE eco.organization_id = org.id
     AND (
       eco.metadata->>'phone' IS NOT NULL
       OR eco.metadata->>'website' IS NOT NULL
       OR eco.metadata->>'contact_person' IS NOT NULL
     );

   -- Add comment for future deprecation
   COMMENT ON COLUMN eco_organizations.metadata IS
     'DEPRECATED: Use organizations.contact_phone/website instead. Will be removed in v3.';
   ```

2. **Code Changes:**
   - Update `src/db/schema.ts` to add `contact_phone`, `contact_website` to `organizations`
   - Update `src/services/listings.ts` to read from `organizations` only (remove metadata parsing)
   - Update `src/services/partners.ts` similarly
   - Update seed scripts to populate `organizations` columns directly

3. **Data Migration Strategy:**
   - Run migration on staging first
   - Verify all 20 eco_organizations have contact info in `organizations`
   - Keep `metadata` column for 1 release cycle (soft deprecation)
   - Remove `metadata` contact fields in next major version

4. **Risk Level:** **Low**
   - Additive migration (no data loss)
   - Backward compatible (old code still works)
   - Can rollback by reverting code changes

5. **Suggested Order:** **First** (foundational cleanup)

---

### Migration Batch 2: Align Org Roles to Single Enum

**Goal:** Use `eco_organizations.org_role` as canonical classification; deprecate `organizations.type`.

**Changes:**

1. **DB Migration** (`20251124_align_org_roles.sql`):

   ```sql
   -- Migrate legacy type values to org_role
   UPDATE organizations org
   SET type = CASE
     WHEN type = 'OJQ' THEN 'NGO'
     WHEN type = 'Ndërmarrje Sociale' THEN 'SOCIAL_ENTERPRISE'
     WHEN type = 'Kompani' THEN 'COMPANY'
     ELSE type
   END
   WHERE type IN ('OJQ', 'Ndërmarrje Sociale', 'Kompani');

   -- Ensure all organizations with eco_organizations have aligned type
   UPDATE organizations org
   SET type = eco.org_role::text
   FROM eco_organizations eco
   WHERE eco.organization_id = org.id
     AND org.type != eco.org_role::text;

   -- Add check constraint (optional, for data integrity)
   ALTER TABLE organizations
     ADD CONSTRAINT organizations_type_matches_eco_role
     CHECK (
       NOT EXISTS (
         SELECT 1 FROM eco_organizations eco
         WHERE eco.organization_id = organizations.id
           AND organizations.type != eco.org_role::text
       )
     );
   ```

2. **Code Changes:**
   - Update `src/types/index.ts` to deprecate `Organization.type` in favor of `org_role`
   - Update all UI filters to use `org_role` enum values
   - Add i18n keys for new enum values (NGO, SOCIAL_ENTERPRISE, etc.)
   - Update admin forms to use `org_role` dropdown

3. **Data Migration Strategy:**
   - Backfill `type` from `org_role` for all eco_organizations
   - Update seeds to use consistent enum values
   - Add deprecation warning in code comments

4. **Risk Level:** **Medium**
   - Requires i18n updates
   - May break existing filters if not tested thoroughly

5. **Suggested Order:** **Second** (after contact info normalization)

---

### Migration Batch 3: Migrate Mutations to V2 & Soft-Deprecate V1

**Goal:** Stop writing to `tregu_listime` (V1); use `eco_listings` (V2) for all new listings.

**Changes:**

1. **Code Changes:**
   - Update `src/services/listings.ts` mutations (`createUserListing`, `updateUserListing`, `deleteUserListing`) to use `eco_listings` instead of `marketplaceListings`
   - Add validation to require `category_id` (FK to `eco_categories`)
   - Map legacy `listing_type` ("shes"/"blej") to `flow_type` enum

   **Example:**

   ```typescript
   // src/services/listings.ts (NEW)
   export async function createUserListing(
     userId: string,
     payload: ListingCreateInput
   ): Promise<ListingMutationResult> {
     try {
       const organizationId = await findApprovedOrganizationId(userId)
       const ecoOrgId = organizationId ? await findEcoOrganizationId(organizationId) : null

       await db
         .get()
         .insert(ecoListings)
         .values({
           created_by_user_id: userId,
           organization_id: ecoOrgId,
           category_id: payload.category_id, // NEW: required
           title: payload.title,
           description: payload.description,
           flow_type: payload.flow_type, // NEW: enum
           price: payload.price,
           currency: "EUR",
           pricing_type: payload.pricing_type || "FIXED",
           city: payload.city,
           region: payload.region,
           status: "DRAFT", // Admin approval required
           visibility: "PUBLIC",
           tags: payload.tags || [],
         })

       return { success: true }
     } catch (error) {
       console.error("[createUserListing] Failed:", error)
       return { error: "Gabim gjatë shtimit të listimit." }
     }
   }
   ```

2. **DB Migration** (optional, for safety):

   ```sql
   -- Make tregu_listime read-only (prevent accidental writes)
   REVOKE INSERT, UPDATE, DELETE ON tregu_listime FROM authenticated;
   GRANT SELECT ON tregu_listime TO authenticated;

   -- Add trigger to log any attempted writes (for monitoring)
   CREATE OR REPLACE FUNCTION prevent_tregu_listime_writes()
   RETURNS TRIGGER AS $$
   BEGIN
     RAISE EXCEPTION 'tregu_listime is deprecated. Use eco_listings instead.';
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER tregu_listime_write_prevention
     BEFORE INSERT OR UPDATE OR DELETE ON tregu_listime
     FOR EACH ROW EXECUTE FUNCTION prevent_tregu_listime_writes();
   ```

3. **Data Migration Strategy:**
   - **Do NOT migrate existing V1 listings to V2** (too risky, data loss potential)
   - Keep V1 listings visible in admin-only views
   - All new listings go to V2
   - After 3 months, archive V1 listings to separate table

4. **Risk Level:** **Medium-High**
   - Requires thorough testing of create/update/delete flows
   - User-facing forms must be updated to collect V2 fields
   - Rollback requires reverting code + re-enabling V1 writes

5. **Suggested Order:** **Third** (after org data is normalized)

---

### Migration Batch 4: Add Helper View for Listing Contact Info

**Goal:** Simplify contact info resolution with a database view.

**Changes:**

1. **DB Migration** (`20251124_listing_contact_view.sql`):

   ```sql
   CREATE OR REPLACE VIEW eco_listings_with_contact AS
   SELECT
     el.*,
     org.name AS organization_name,
     org.contact_email AS organization_contact_email,
     org.contact_phone AS organization_contact_phone,
     org.contact_website AS organization_contact_website,
     org.contact_person AS organization_contact_person,
     u.full_name AS creator_full_name,
     u.email AS creator_email,
     cat.name_en AS category_name_en,
     cat.name_sq AS category_name_sq,
     -- Resolved contact (org takes precedence)
     COALESCE(org.contact_email, u.email) AS resolved_contact_email,
     COALESCE(org.contact_person, u.full_name) AS resolved_contact_person
   FROM eco_listings el
   LEFT JOIN eco_organizations eco ON el.organization_id = eco.id
   LEFT JOIN organizations org ON eco.organization_id = org.id
   LEFT JOIN users u ON el.created_by_user_id = u.id
   LEFT JOIN eco_categories cat ON el.category_id = cat.id;

   -- Grant SELECT to authenticated users
   GRANT SELECT ON eco_listings_with_contact TO authenticated;
   ```

2. **Code Changes:**
   - Update `src/services/listings.ts` to query from view instead of manual joins
   - Simplify `formatListingRow` to use `resolved_contact_email` directly

3. **Risk Level:** **Low**
   - View is read-only, no data mutation
   - Easy to drop if performance issues arise

4. **Suggested Order:** **Fourth** (optional optimization)

---

## D. Migration Checklist (For Each Batch)

### Batch 1: Normalize Org Contact Info

- [ ] Write migration file `supabase/migrations/20251124_normalize_org_contact_info.sql`
- [ ] Update Drizzle schema `src/db/schema.ts` (add `contact_phone`, `contact_website`)
- [ ] Run `pnpm drizzle:generate` to update types
- [ ] Update `src/services/listings.ts` (remove metadata parsing)
- [ ] Update `src/services/partners.ts` (remove metadata parsing)
- [ ] Update seed scripts (`scripts/seed-eco-orgs-simple.sql`)
- [ ] Run migration on staging: `pnpm dlx supabase db push`
- [ ] Verify: `psql "$SUPABASE_DB_URL" -c "SELECT name, contact_email, contact_phone, contact_website FROM organizations LIMIT 5"`
- [ ] Run: `pnpm lint && pnpm tsc --noEmit && pnpm build`
- [ ] Run E2E tests: `pnpm test:e2e -- marketplace`
- [ ] Deploy to staging, verify marketplace contact cards display correctly
- [ ] Merge to `main` after QA approval

### Batch 2: Align Org Roles

- [ ] Write migration file `supabase/migrations/20251124_align_org_roles.sql`
- [ ] Update `src/types/index.ts` (deprecate `type` field)
- [ ] Add i18n keys for `org_role` enum (`messages/sq/common.json`, `messages/en/common.json`)
- [ ] Update filters in `src/app/[locale]/(site)/partners/PartnersClient.tsx`
- [ ] Update admin forms to use `org_role` dropdown
- [ ] Run migration on staging
- [ ] Verify: `psql "$SUPABASE_DB_URL" -c "SELECT name, type, org_role FROM organizations o JOIN eco_organizations e ON o.id = e.organization_id LIMIT 10"`
- [ ] Run: `pnpm lint && pnpm tsc --noEmit && pnpm build`
- [ ] Test partner filters in UI (ensure "RECYCLER" filter works)
- [ ] Merge after QA

### Batch 3: Migrate Mutations to V2

- [ ] Update `src/validation/listings.ts` to add V2 fields (`category_id`, `flow_type`, etc.)
- [ ] Rewrite `createUserListing` to insert into `eco_listings`
- [ ] Rewrite `updateUserListing` to update `eco_listings`
- [ ] Rewrite `deleteUserListing` to delete from `eco_listings`
- [ ] Add helper `findEcoOrganizationId(organizationId: string)` to resolve `eco_organizations.id`
- [ ] Update user-facing forms to collect `category_id` and `flow_type`
- [ ] Write migration to make `tregu_listime` read-only (optional)
- [ ] Run: `pnpm lint && pnpm tsc --noEmit && pnpm build`
- [ ] Test create/update/delete flows in staging
- [ ] Verify new listings appear in marketplace V2
- [ ] Run E2E tests: `pnpm test:e2e -- marketplace-v2`
- [ ] Merge after thorough QA

### Batch 4: Add Contact View (Optional)

- [ ] Write migration file `supabase/migrations/20251124_listing_contact_view.sql`
- [ ] Update `src/services/listings.ts` to query from `eco_listings_with_contact`
- [ ] Simplify `formatListingRow` logic
- [ ] Run migration on staging
- [ ] Verify query performance: `EXPLAIN ANALYZE SELECT * FROM eco_listings_with_contact WHERE status = 'ACTIVE' LIMIT 10`
- [ ] Run: `pnpm lint && pnpm tsc --noEmit && pnpm build`
- [ ] Merge if performance is acceptable

---

## E. Summary & Next Steps

### Top 5 Schema/Usage Issues (Recap)

1. **Redundant org contact data** → Normalize to `organizations` table (Batch 1)
2. **Inconsistent org roles** → Align to `org_role` enum (Batch 2)
3. **Legacy V1 mutations active** → Migrate to V2 (Batch 3)
4. **Complex contact resolution** → Add helper view (Batch 4)
5. **Missing type safety on FKs** → Enforce in Drizzle schema (ongoing)

### First 2-3 Migration Steps (Recommended Order)

1. **Batch 1: Normalize Org Contact Info** (Low risk, high value)
   - Adds `contact_phone`, `contact_website` to `organizations`
   - Backfills from `eco_organizations.metadata`
   - Simplifies all contact info queries

2. **Batch 2: Align Org Roles** (Medium risk, required for i18n consistency)
   - Migrates legacy `type` values to enum
   - Updates UI filters to use `org_role`
   - Adds i18n keys for new values

3. **Batch 3: Migrate Mutations to V2** (High value, medium-high risk)
   - Stops writing to `tregu_listime`
   - Ensures all new listings use V2 schema
   - Requires thorough testing of user flows

### Tools Used in This Audit

- ✅ `node tools/run-mcp-task.js project_map` (repo structure)
- ✅ `view_file` (schema files, services, migrations)
- ✅ `psql "$SUPABASE_DB_URL"` (live DB inspection, row counts, schema details)
- ✅ `grep_search` (code usage patterns for `contact_email`, `tregu_listime`, etc.)
- ✅ Direct file inspection of:
  - `src/db/schema/marketplace-v2.ts`
  - `src/db/schema/enums.ts`
  - `src/services/listings.ts`
  - `supabase/migrations/20251122000000_create_marketplace_v2.sql`
  - `docs/data-layer-review.md`
  - `docs/architecture-plan.md`

---

## F. Open Questions & Risks

1. **Should we migrate existing V1 listings to V2?**
   - **Recommendation:** No. Too risky (24 listings, potential data loss). Keep V1 read-only for admins.

2. **What about `organizations` without `eco_organizations`?**
   - **Current state:** 46 organizations, 20 eco_organizations (26 orgs are "plain")
   - **Recommendation:** Leave as-is. Not all orgs need marketplace profiles.

3. **How to handle `organization_members.role_in_organization`?**
   - **Current:** Text field ("ADMIN", "MEMBER", etc.)
   - **Recommendation:** Convert to enum in future migration (not urgent)

4. **Performance impact of contact view?**
   - **Recommendation:** Test with EXPLAIN ANALYZE. If slow, add materialized view or denormalize.

5. **RLS policies for V2 mutations?**
   - **Current:** RLS policies exist for `eco_listings` (see migration file)
   - **Recommendation:** Verify policies allow user mutations after Batch 3

---

## Appendix: Sample Queries for Validation

### Check for orphaned eco_organizations

```sql
SELECT eco.id, eco.organization_id
FROM eco_organizations eco
LEFT JOIN organizations org ON eco.organization_id = org.id
WHERE org.id IS NULL;
-- Expected: 0 rows
```

### Check for inconsistent contact data

```sql
SELECT
  org.name,
  org.contact_person AS org_contact_person,
  eco.metadata->>'contact_person' AS eco_contact_person
FROM organizations org
JOIN eco_organizations eco ON eco.organization_id = org.id
WHERE org.contact_person != COALESCE(eco.metadata->>'contact_person', org.contact_person);
```

### Count listings by version

```sql
SELECT 'V1 (tregu_listime)' AS version, COUNT(*) FROM tregu_listime
UNION ALL
SELECT 'V2 (eco_listings)', COUNT(*) FROM eco_listings;
```

### Verify all eco_listings have valid category_id

```sql
SELECT el.id, el.title, el.category_id
FROM eco_listings el
LEFT JOIN eco_categories cat ON el.category_id = cat.id
WHERE cat.id IS NULL;
-- Expected: 0 rows
```

---

**End of Audit Report**
