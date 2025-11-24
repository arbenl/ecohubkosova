# Database Audit Quick Reference
**Date:** 2025-11-24  
**Full Report:** `docs/database-audit-2025-11-24.md`

---

## 🎯 Top 5 Issues

1. **Redundant org contact data** (organizations vs eco_organizations.metadata)
2. **Inconsistent org roles** (organizations.type vs eco_organizations.org_role)
3. **Legacy V1 still active** (tregu_listime has 24 rows, mutations use it!)
4. **Complex contact resolution** (3 fallback locations for email/phone)
5. **Missing type safety** on FK relationships

---

## 📊 Current State

| Table | Rows | Status |
|-------|------|--------|
| `users` | 51 | ✅ Active |
| `organizations` | 46 | ✅ Active (26 without eco profile) |
| `eco_organizations` | 20 | ✅ Active (extends 20 orgs) |
| `organization_members` | 49 | ✅ Active |
| `eco_listings` (V2) | 9 | ⚠️ **Low usage** |
| `tregu_listime` (V1) | 24 | ⚠️ **Still receiving writes!** |
| `eco_categories` | 25 | ✅ Active |

---

## 🚀 Recommended Migration Order

### **Step 1: Normalize Org Contact Info** (Low Risk)
**Goal:** Single source of truth in `organizations` table

```sql
-- Add columns
ALTER TABLE organizations 
  ADD COLUMN contact_phone TEXT,
  ADD COLUMN contact_website TEXT;

-- Backfill from metadata
UPDATE organizations org
SET 
  contact_phone = (eco.metadata->>'phone')::text,
  contact_website = (eco.metadata->>'website')::text
FROM eco_organizations eco
WHERE eco.organization_id = org.id;
```

**Code changes:**
- Update `src/db/schema.ts` (add columns)
- Remove metadata parsing in `src/services/listings.ts` lines 69-74, 321-328
- Update seed scripts

**Validation:**
```bash
pnpm lint && pnpm tsc --noEmit && pnpm build
pnpm test:e2e -- marketplace
```

---

### **Step 2: Align Org Roles** (Medium Risk)
**Goal:** Use `org_role` enum everywhere, deprecate `type`

```sql
-- Migrate legacy values
UPDATE organizations
SET type = CASE
  WHEN type = 'OJQ' THEN 'NGO'
  WHEN type = 'Ndërmarrje Sociale' THEN 'SOCIAL_ENTERPRISE'
  WHEN type = 'Kompani' THEN 'COMPANY'
  ELSE type
END;
```

**Code changes:**
- Add i18n keys for org_role enum
- Update filters in `PartnersClient.tsx`
- Update admin forms

---

### **Step 3: Migrate Mutations to V2** (High Value, Medium-High Risk)
**Goal:** Stop writing to `tregu_listime`, use `eco_listings`

**Critical change:**
```typescript
// src/services/listings.ts:431 (BEFORE)
await db.get().insert(marketplaceListings).values({ ... })

// AFTER
await db.get().insert(ecoListings).values({
  category_id: payload.category_id, // NEW: required
  flow_type: payload.flow_type,     // NEW: enum
  status: 'DRAFT',                  // NEW: approval workflow
  visibility: 'PUBLIC',
  ...
})
```

**Validation:**
- Test create/update/delete in staging
- Verify new listings appear in marketplace V2
- Run E2E tests

---

## 🔍 Validation Queries

### Check for orphaned eco_organizations
```sql
SELECT eco.id FROM eco_organizations eco
LEFT JOIN organizations org ON eco.organization_id = org.id
WHERE org.id IS NULL;
-- Expected: 0 rows
```

### Verify contact data consistency
```sql
SELECT org.name, org.contact_email, eco.metadata->>'phone' AS metadata_phone
FROM organizations org
JOIN eco_organizations eco ON eco.organization_id = org.id
WHERE eco.metadata->>'phone' IS NOT NULL;
```

### Count listings by version
```sql
SELECT 'V1' AS version, COUNT(*) FROM tregu_listime
UNION ALL
SELECT 'V2', COUNT(*) FROM eco_listings;
```

---

## ⚠️ Critical Findings

### **URGENT: Mutations still use V1**
```typescript
// src/services/listings.ts:431-445
// createUserListing() inserts into marketplaceListings (V1)
// This means user-created listings DON'T appear in marketplace V2!
```

**Impact:** New listings invisible to public users  
**Fix:** Migrate mutations to V2 (Step 3 above)

### **Data Fragmentation**
- Public reads from `eco_listings` (V2)
- User writes go to `tregu_listime` (V1)
- **Result:** 9 V2 listings (visible) vs 24 V1 listings (hidden)

---

## 📋 Quick Commands

### Run audit queries
```bash
psql "$SUPABASE_DB_URL" -f docs/database-audit-queries.sql
```

### Apply migration (staging)
```bash
pnpm dlx supabase db push
pnpm drizzle:generate
```

### Verify build health
```bash
pnpm lint && pnpm tsc --noEmit && pnpm build
```

### Run E2E tests
```bash
pnpm test:e2e -- marketplace-v2
```

---

## 🎯 Success Criteria

After completing all migrations:

- [ ] All org contact info in `organizations` table (no metadata parsing)
- [ ] All filters use `org_role` enum (no legacy `type` values)
- [ ] All new listings go to `eco_listings` (V2)
- [ ] `tregu_listime` is read-only (admin view only)
- [ ] Contact resolution uses single query (no fallback logic)
- [ ] All tests pass (`pnpm lint && pnpm tsc && pnpm build`)

---

**See full report:** `docs/database-audit-2025-11-24.md`
