# User Dashboard CRUD Implementation Plan

**Goal:** Complete P0 fixes to make Listings CRUD fully functional

---

## Phase 1: Service Layer (P0)

### Task 1.1: Add `fetchListingByIdForOwner` function

**File:** `src/services/listings/repo.ts`

**Implementation:**

```typescript
/**
 * Fetch a single listing by ID for the owner.
 * Returns listing regardless of status/visibility.
 * Enforces ownership - returns error if user is not the owner.
 */
export async function fetchListingByIdForOwner(
    listingId: string,
    userId: string
){
    noStore()

    try {
        const records = await db.get()
            .select({...}) // Same joins as fetchListingById
            .from(ecoListings)
            .leftJoin(...)
            .where(
                and(
                    eq(ecoListings.id, listingId),
                    eq(ecoListings.created_by_user_id, userId)  // Ownership check
                )
            )
            .limit(1)

        if (!records[0]) {
            return { data: null, error: "NOT_FOUND" }
        }

        return { data: formatListingRow(records[0]), error: null }
    } catch (error) {
        return { data: null, error: "QUERY_ERROR" }
    }
}
```

---

## Phase 2: Edit Page (P0)

### Task 2.1: Create Edit Page

**File:** `src/app/[locale]/(site)/marketplace/[id]/edit/page.tsx`

**Structure:**

1. Get listing via `fetchListingByIdFor Owner(id, user.id)`
2. If not found/not owner → redirect to listing detail or 404
3. Render form pre-filled with listing data
4. Form submission calls `updateListingAction`

**Key Points:**

- Use same form component as `/marketplace/add` (DRY)
- Pass `initialData` prop to pre-fill form
- Add Back button → `/marketplace/[id]`
- Add Cancel button → `/marketplace/[id]`
- Save button triggers update action

### Task 2.2: Create Update Action

**File:** `src/app/[locale]/(site)/marketplace/[id]/edit/actions.ts`

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "@/i18n/routing"
import { getServerUser } from "@/lib/supabase/server"
import { updateUserListing } from "@/services/listings"
import { listingCreateSchema } from "@/validation/listings"

export async function updateListingAction(listingId: string, formData: FormPayload) {
  const { user } = await getServerUser()
  if (!user) return { error: "Unauthorized" }

  const parsed = listingCreateSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message }
  }

  const result = await updateUserListing(listingId, user.id, parsed.data)

  if ("error" in result) {
    return { error: result.error }
  }

  // Revalidate all affected paths
  revalidatePath(`/marketplace/${listingId}`)
  revalidatePath("/marketplace")
  revalidatePath("/my/listings")

  return { success: true, listingId }
}
```

---

## Phase 3: Detail Page Enhancement (P0)

### Task 3.1: Add Edit Button

**File:** `src/app/[locale]/(site)/marketplace/[id]/page.tsx`

**Changes:**

1. Get current user
2. Compare `listing.user_id === user?.id`
3. If owner, show Edit button
4. Add "Your Listing" badge

```typescript
const { user } = await getServerUser()
const isOwner = user?.id === listing.user_id

{isOwner && (
    <div className="mt-4 flex gap-2">
        <Button asChild variant="default">
            <Link href={`/marketplace/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                {t("editListing")}
            </Link>
        </Button>
    </div>
)}
```

---

## Phase 4: Create Flow Improvement (P0)

### Task 4.1: Add Redirect After Create

**File:** `src/app/[locale]/(site)/marketplace/add/actions.ts`

**Changes:**

1. After successful insert, get the new listing ID
2. Return `{ success: true, listingId: "..." }`
3. Client handles redirect after receiving success

**Implementation:**

```typescript
// In createUserListing:
const [inserted] = await db
  .get()
  .insert(ecoListings)
  .values(insertPayload)
  .returning({ id: ecoListings.id })

return { success: true, listingId: inserted.id }

// In action:
const result = await createUserListing(user.id, parsed.data)
if ("error" in result) {
  return { error: result.error }
}

revalidatePath("/marketplace")
revalidatePath("/my/listings") // Add this

return {
  success: true,
  listingId: result.listingId,
  redirectTo: `/marketplace/${result.listingId}`,
}
```

### Task 4.2: Update Form to Handle Redirect

**File:** `src/app/[locale]/(site)/marketplace/add/add-listing-client-page.tsx`

Handle redirect in form submission:

```typescript
const result = await createListing(formData)
if (result.success && result.redirectTo) {
  router.push(result.redirectTo)
}
```

---

## Phase 5: i18n Keys (P1)

### Task 5.1: Add Missing Keys

**Files:**

- `messages/en/DashboardV2.json`
- `messages/sq/DashboardV2.json`

Add all missing keys identified in audit:

- `myListingsPage.*`
- `editListingPage.*`
- `confirmArchive.*`

---

## Phase 6: Archive Confirmation (P1)

### Task 6.1: Add Confirmation Dialog

**File:** `src/app/[locale]/(protected)/my/listings/listing-actions.tsx`

Use shadcn AlertDialog:

```typescript
<AlertDialog>
    <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
            <Archive className="h-4 w-4 mr-1" />
            {t("myListingsPage.actions.archive")}
        </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmArchive.title")}</AlertDialogTitle>
            <AlertDialogDescription>
                {t("confirmArchive.message")}
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>{t("confirmArchive.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
                {t("confirmArchive.confirm")}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

---

## Implementation Sequence

### Step 1: Service Layer ✅

- Add `fetchListingByIdForOwner`
- Modify `createUserListing` to return listingId

### Step 2: Edit Functionality ✅

- Create edit page
- Create update action
- Add edit button to detail

### Step 3: Create Flow ✅

- Update create action to return listingId
- Add redirect after create
- Revalidate /my/listings

### Step 4: i18n ✅

- Add all missing keys EN/SQ

### Step 5: Confirmation ✅

- Add archive confirmation dialog

### Step 6: Verification ✅

- Run all automated checks
- Manual testing both locales

---

## Testing Checklist

After each phase:

1. **TypeScript:** `pnpm tsc --noEmit`
2. **Lint:** `pnpm lint`
3. **Build:** `pnpm build`
4. **Manual:**
   - Test create → redirects correctly
   - Test edit → saves and shows success
   - Test archive → shows confirmation
   - Test ownership enforcement
   - Test both EN and SQ

---

## Files to Modify/Create

### New Files

1. `src/app/[locale]/(site)/marketplace/[id]/edit/page.tsx`
2. `src/app/[locale]/(site)/marketplace/[id]/edit/actions.ts`

### Modified Files

1. `src/services/listings/repo.ts` - Add fetchListingByIdForOwner, modify createUserListing
2. `src/app/[locale]/(site)/marketplace/add/actions.ts` - Return listingId, revalidate /my/listings
3. `src/app/[locale]/(site)/marketplace/[id]/page.tsx` - Add edit button for owner
4. `src/app/[locale]/(protected)/my/listings/listing-actions.tsx` - Add confirmation dialog
5. `messages/en/DashboardV2.json` - Add keys
6. `messages/sq/DashboardV2.json` - Add keys

---

## ETA: ~2 hours of focused implementation
