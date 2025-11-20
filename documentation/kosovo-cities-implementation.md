# Kosovo Cities Location Selector - Implementation Summary

## What Was Implemented

Added a city/town selector for Kosovo locations in the marketplace listing forms.

### 1. Database Changes

**New Table: `cities`**

- Created table to store Kosovo towns and cities
- Fields: `id`, `name_sq` (Albanian), `name_en` (English), `municipality`, `region`, `is_active`, `display_order`
- Populated with 36 Kosovo cities/towns
- Indexed for performance

**Major Cities Included:**

- Prishtinë (Pristina)
- Prizren
- Pejë (Peja)
- Gjakovë (Gjakova)
- Ferizaj
- Gjilan
- Mitrovicë (Mitrovica)
- Plus 29 more municipalities

**File**: [`scripts/migrations/add-kosovo-cities.sql`](file:///Users/arbenlila/development/ecohubkosova/scripts/migrations/add-kosovo-cities.sql)

### 2. Backend Implementation

**Server Action**: [`src/db/cities.ts`](file:///Users/arbenlila/development/ecohubkosova/src/db/cities.ts)

- `getCities(locale)` - Fetches cities from database
- Returns city list in appropriate language (sq/en)
- Server-side function for use in Server Components

**Schema Update**: [`src/db/schema.ts`](file:///Users/arbenlila/development/ecohubkosova/src/db/schema.ts)

- Added `cities` table definition
- Exported `City` type for TypeScript

### 3. UI Changes

**Add Listing Form** ([`src/app/[locale]/(site)/marketplace/add/`](<file:///Users/arbenlila/development/ecohubkosova/src/app/[locale]/(site)/marketplace/add/>))

**Before**:

```tsx
<Input placeholder="p.sh. Prishtinë, Kosovë" name="location" />
```

**After**:

```tsx
<Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)}>
  <SelectTrigger>
    <SelectValue placeholder="Zgjidhni qytetin" />
  </SelectTrigger>
  <SelectContent>
    {cities.map((city) => (
      <SelectItem key={city.value} value={city.value}>
        {city.label} {city.region && `(${city.region})`}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Modified Files**:

1. [`page.tsx`](<file:///Users/arbenlila/development/ecohubkosova/src/app/[locale]/(site)/marketplace/add/page.tsx>) - Fetches cities and passes to client component
2. [`add-listing-client-page.tsx`](<file:///Users/arbenlila/development/ecohubkosova/src/app/[locale]/(site)/marketplace/add/add-listing-client-page.tsx>) - Updated location field to use dropdown

### 4. Marketplace Filter

**Also Fixed**: Removed `disabled={isLoading}` from location filter in marketplace page

- File: [`marketplace-client-page.tsx`](<file:///Users/arbenlila/development/ecohubkosova/src/app/[locale]/(site)/marketplace/marketplace-client-page.tsx>)
- Previously: Location field was permanently disabled
- Now: Location field is always editable

---

## How to Deploy

### Step 1: Run Database Migration

You need to run the migration to create the `cities` table.

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `scripts/migrations/add-kosovo-cities.sql`
4. Paste and click **Run**

**Option B: Via psql**

```bash
psql "your-supabase-connection-string" < scripts/migrations/add-kosovo-cities.sql
```

See [`scripts/migrations/README-cities-migration.md`](file:///Users/arbenlila/development/ecohubkosova/scripts/migrations/README-cities-migration.md) for detailed instructions.

### Step 2: Verify Migration

```sql
-- Check cities were created
SELECT COUNT(*) FROM cities;
-- Should return: 36

-- View sample cities
SELECT name_sq, name_en, region
FROM cities
ORDER BY display_order
LIMIT 10;
```

### Step 3: Deploy Code

```bash
# Build and deploy
pnpm build
# Deploy to Vercel or your hosting platform
```

### Step 4: Test

1. Go to `/sq/marketplace/add` or `/en/marketplace/add`
2. Click on "Vendndodhja" / "Location" field
3. Verify dropdown shows Kosovo cities
4. Select a city and submit the form
5. Verify the listing saves with the selected city

---

## Technical Notes

### TypeScript Warnings

You may see TypeScript warnings about the `cities` table until the migration is run:

```
Argument of type '"cities"' is not assignable to parameter...
```

This is normal. The code includes `@ts-ignore` comment to suppress these warnings. Once the migration is run and Supabase regenerates the types, the warnings will disappear.

### Bilingual Support

Cities are stored with both Albanian (`name_sq`) and English (`name_en`) names:

- Albanian users see: "Prishtinë", "Pejë", "Gjakovë"
- English users see: "Pristina", "Peja", "Gjakova"

The `getCities()` function automatically returns the appropriate language based on the current locale.

### Database Structure

```sql
cities (
  id              UUID PRIMARY KEY,
  name_sq         TEXT NOT NULL,      -- "Prishtinë"
  name_en         TEXT NOT NULL,      -- "Pristina"
  municipality    TEXT,               -- Municipality/commune
  region          TEXT,               -- "Prishtinë" (region)
  is_active       BOOLEAN DEFAULT true,
  display_order   INTEGER DEFAULT 0,  -- For sorting
  created_at      TIMESTAMP
)
```

Cities are sorted by `display_order`:

- 1-7: Major cities (displayed first)
- 10+: Other municipalities (alphabetical)

---

## Future Improvements

1. **Add Municipality Filter**: Allow filtering by municipality/region
2. **Add Search**: Add search functionality to the city dropdown for quicker selection
3. **Admin Panel**: Create admin interface to manage cities (add/edit/deactivate)
4. **Neighborhood/Districts**: Add sub-locations for major cities (e.g., "Prishtinë - Qendra", "Prishtinë - Fushe Kosove")
5. **Update Existing Data**: Migrate existing listings with free-text locations to use the new city dropdown values

---

## Files Changed

### Created:

- `src/db/cities.ts` - Server action to fetch cities
- `scripts/migrations/add-kosovo-cities.sql` - Database migration
- `scripts/migrations/README-cities-migration.md` - Migration instructions

### Modified:

- `src/db/schema.ts` - Added cities table definition
- `src/app/[locale]/(site)/marketplace/add/page.tsx` - Fetch and pass cities
- `src/app/[locale]/(site)/marketplace/add/add-listing-client-page.tsx` - Replace input with select
- `src/app/[locale]/(site)/marketplace/marketplace-client-page.tsx` - Removed disabled state from location filter

---

## Questions?

If you encounter issues:

1. Verify the migration ran successfully (`SELECT COUNT(*) FROM cities;` should return 36)
2. Check Supabase logs for any errors
3. Verify environment variables are set correctly
4. Clear Next.js cache: `rm -rf .next` and restart dev server
