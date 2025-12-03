# User Dashboard Audit Report - Spec vs Reality

**Date:** 2025-12-02  
**Scope:** User Dashboard (`/my`) and Listings CRUD  
**Priority:** P0 (Critical), P1 (High), P2 (Medium)

---

## Executive Summary

The User Dashboard (`/my`) has been implemented with core functionality in place:

- ✅ Dashboard landing page with stats and quick actions
- ✅ My Listings page showing user's listings
- ✅ Create listing functionality
- ❌ Edit listing page **MISSING** (P0)
- ✅ Archive listing (soft delete) implemented
- ⚠️ Stats are real but may not reflect ARCHIVED listings correctly
- ⚠️ No restore/unarchive functionality
- ⚠️ Missing i18n keys for several components

---

## Part A: Component-by-Component Audit

### 1. Dashboard Landing Page (`/my/page.tsx`)

#### Purpose

Main dashboard showing user stats, quick actions, and alerts. Entry point for all user activities.

#### Current Implementation

**Stats Cards:**

- Saved Listings - ✅ Real data from `eco_listing_interactions`
- Organizations - ✅ Real data from `organization_members`
- My Listings - ✅ Real data from `eco_listings.created_by_user_id`

**Quick Actions:**

- View/Edit Profile → `/my/profile` ✅
- Manage Organization → `/my/organization` ✅
- Add New Listing → `/marketplace/add` ✅

**Alerts:**

- Placeholder "No new alerts" section ✅

#### Gaps/Issues

| Issue                                | Severity | Description                                              |
| ------------------------------------ | -------- | -------------------------------------------------------- |
| Stats count doesn't exclude ARCHIVED | P2       | `myListings` stat counts ALL listings including ARCHIVED |
| No loading state for stats fetch     | P2       | Uses Suspense but could be better                        |
| Hardcoded "Mirë se erdhe" text       | P2       | Should use i18n for greeting                             |

#### Required Fixes

- **P2:** Update `getUserStats` to only count ACTIVE listings
- **P2:** Add i18n key for Albanian greeting

---

### 2. My Listings Page (`/my/listings/page.tsx`)

#### Purpose

Show all user's listings (ACTIVE, DRAFT, ARCHIVED) with ability to view, edit, and archive each.

#### Current Implementation

- ✅ Fetches all user listings via `fetchUserListings(user.id)`
- ✅ Shows title, description, category, price, status badge
- ✅ Empty state with "Create your first listing" CTA
- ✅ Edit button for each listing → `/marketplace/[id]/edit`
- ✅ Archive button via `ListingActions` component

#### Gaps/Issues

| Issue                        | Severity | Description                     |
| ---------------------------- | -------- | ------------------------------- |
| No filtering/tabs for status | P1       | Can't filter ACTIVE vs ARCHIVED |
| Hardcoded "Edit" text        | P1       | Should use i18n                 |
| No pagination                | P2       | Will break with many listings   |
| Missing thumbnail images     | P2       | Shows no image placeholder      |

#### Required Fixes

- **P1:** Add status tabs (All / Active / Archived)
- **P1:** Add i18n keys for all labels
- **P2:** Add pagination (or virtual scroll) for large datasets

---

### 3. Create Listing (`/marketplace/add/page.tsx` + `actions.ts`)

#### Purpose

Allow users to create new listings with form validation and submission.

#### Current Implementation

- ✅ Form with title, description, category, price, location, quantity
- ✅ Server action `createListing` with validation
- ✅ Uses `listingCreateSchema` for validation
- ✅ Creates in eco_listings table with ACTIVE/PUBLIC status
- ✅ Revalidates `/marketplace` after creation

#### Gaps/Issues

| Issue                             | Severity | Description                           |
| --------------------------------- | -------- | ------------------------------------- |
| No redirect after success         | P0       | User doesn't know listing was created |
| No success toast/feedback         | P0       | Silent success                        |
| Doesn't revalidate `/my/listings` | P1       | My Listings page won't update         |
| Missing required i18n keys        | P1       | Error messages hardcoded in Albanian  |

#### Required Fixes

- **P0:** Add redirect to listing detail or /my/listings after success
- **P0:** Add success toast/banner
- **P1:** Revalidate `/my/listings` path
- **P1:** Extract all Albanian text to i18n JSON

---

### 4. Edit Listing (`/marketplace/[id]/edit/page.tsx`)

#### Purpose

Allow listing owners to edit their listings.

#### Current Implementation

**❌ PAGE DOES NOT EXIST**

The route `/marketplace/[id]/edit/page.tsx` is **MISSING**.

#### Required Implementation (P0)

Must create `/marketplace/[id]/edit/page.tsx` with:

1. **Ownership check:**

   ```typescript
   const listing = await fetchListingById(id)
   if (listing.user_id !== user.id) redirect to detail or 404
   ```

2. **Form pre-filled with existing data**
3. **Server action `updateListingAction`** that:
   - Validates input
   - Calls `updateUserListing(listingId, userId, data)`
   - Revalidates `/marketplace/[id]`, `/marketplace`, `/my/listings`
   - Redirects to detail page with success message

4. **UI requirements:**
   - Back button to listing detail
   - Save button (disabled while saving)
   - Cancel button
   - Success/error feedback

---

### 5. Archive Listing (`/my/listings/actions.ts`)

#### Purpose

Soft-delete listings (set status=ARCHIVED, keep in database).

#### Current Implementation

- ✅ Server action `archiveListingAction(listingId, locale)`
- ✅ Calls `deleteUserListing(listingId, userId)` which sets status='ARCHIVED'
- ✅ Ownership enforced in SQL WHERE clause
- ✅ Revalidates `/my/listings` and `/marketplace`

#### Gaps/Issues

| Issue                     | Severity | Description                           |
| ------------------------- | -------- | ------------------------------------- |
| No confirmation dialog    | P1       | Dangerous action without confirmation |
| No success feedback       | P1       | Silent archiving                      |
| `locale` parameter unused | P2       | Action doesn't need locale            |

#### Required Fixes

- **P1:** Add confirmation modal in `ListingActions` component
- **P1:** Add success toast after archive
- **P2:** Remove unused `locale` parameter

---

### 6. Listing Detail Page (`/marketplace/[id]/page.tsx`)

#### Purpose

Show full listing details to any visitor. Owner should see Edit button.

#### Current Implementation

- ✅ Fetches listing via `fetchListingById(id)`
- ✅ Shows full details, contact info, organization
- ✅ Only shows ACTIVE + PUBLIC listings

#### Gaps/Issues

| Issue                    | Severity | Description                           |
| ------------------------ | -------- | ------------------------------------- |
| No Edit button for owner | P0       | Owner can't easily edit their listing |
| No ownership indicator   | P1       | Owner doesn't know it's their listing |

#### Required Fixes

- **P0:** Add Edit button visible only to listing owner
- **P1:** Add "Your listing" badge or indicator

---

### 7. Services Layer (`/services/listings/repo.ts`)

#### Current Implementation

✅ All required service functions exist:

- `fetchListings(options)` - Public marketplace ✅
- `fetchUserListings(userId)` - All user listings ✅
- `fetchListingById(id)` - Single listing ✅
- `createUserListing(userId, data)` - Create ✅
- `updateUserListing(listingId, userId, data)` - Update ✅
- `deleteUserListing(listingId, userId)` - Soft delete ✅

✅ Ownership enforced in all mutations via SQL WHERE clause
✅ Proper error handling and return types
✅ Maps V2 data to V1 Listing type for compatibility

#### Gaps/Issues

| Issue                                         | Severity | Description                                                  |
| --------------------------------------------- | -------- | ------------------------------------------------------------ |
| `fetchListingById` only returns ACTIVE+PUBLIC | P0       | Owner can't view their own DRAFT/ARCHIVED                    |
| No `fetchListingByIdForOwner` function        | P0       | Edit page needs to load owner's listing regardless of status |

#### Required Fixes

- **P0:** Add `fetchListingByIdForOwner(listingId, userId)` that:
  - Returns listing regardless of status/visibility
  - Enforces ownership
  - Used by edit page to load data

---

## Part B: Missing i18n Keys

### DashboardV2.json (EN/SQ)

Missing keys needed:

```json
{
  "myListingsPage": {
    "title": "My Listings",
    "createNew": "Create New Listing",
    "empty": {
      "title": "No listings yet",
      "description": "Create your first listing to start trading in the circular economy.",
      "cta": "Create Listing"
    },
    "tabs": {
      "all": "All",
      "active": "Active",
      "archived": "Archived"
    },
    "actions": {
      "edit": "Edit",
      "archive": "Archive",
      "restore": "Restore"
    },
    "confirmArchive": {
      "title": "Archive Listing?",
      "message": "This listing will be removed from the marketplace. You can restore it later.",
      "confirm": "Archive",
      "cancel": "Cancel"
    }
  },
  "editListingPage": {
    "title": "Edit Listing",
    "saveButton": "Save Changes",
    "cancelButton": "Cancel",
    "backButton": "Back to Listing",
    "success": "Listing updated successfully!",
    "error": "Failed to update listing. Please try again."
  }
}
```

---

## Part C: Priority Summary

### P0 - Critical (Must Fix)

1. **Create `/marketplace/[id]/edit/page.tsx`** - Edit functionality completely missing
2. **Add `fetchListingByIdForOwner` service** - Edit page needs this
3. **Add redirect after create** - User doesn't know if listing was created
4. **Add Edit button to detail page** - No way to get to edit page

### P1 - High (Should Fix)

5. **Add confirmation dialog for archive** - Prevent accidental deletion
6. **Add status filtering to My Listings** - Can't distinguish ACTIVE from ARCHIVED
7. **Add all i18n keys** - Many hardcoded strings
8. **Revalidate `/my/listings` after create** - Stale data

### P2 - Medium (Nice to Have)

9. **Fix stats to exclude ARCHIVED** - Misleading count
10. **Add pagination to My Listings** - Scalability
11. **Add success toasts** - Better UX feedback

---

## Part D: Recommended Implementation Order

**Phase 1 - CRUD Completion (P0)**

1. Create `fetchListingByIdForOwner` service function
2. Create `/marketplace/[id]/edit/page.tsx` with form
3. Create `updateListingAction` server action
4. Add Edit button to listing detail page
5. Add redirect after create listing

**Phase 2 - UX Improvements (P1)** 6. Add i18n keys to DashboardV2.json (EN/SQ) 7. Add confirmation modal for archive 8. Add status tabs to My Listings 9. Add success/error toasts throughout

**Phase 3 - Polish (P2)** 10. Fix stats query 11. Add pagination 12. Add loading skeletons

---

## Verification Checklist

After implementing fixes, verify:

### Automated

- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] `ecohub-qa build_health` passes
- [ ] `ecohub-qa navigation_audit` passes
- [ ] `ecohub-qa i18n_audit` passes

### Manual (Both EN and SQ)

- [ ] Dashboard loads with real stats
- [ ] Can create listing → redirects to detail → shows success
- [ ] New listing appears in My Listings immediately
- [ ] Can edit listing → saves → shows success → redirects
- [ ] Edit shows pre-filled form data
- [ ] Non-owner cannot edit (404 or redirect)
- [ ] Can archive listing → shows confirmation → archives → disappears from marketplace
- [ ] Archived listing still visible in My Listings with correct badge
- [ ] Edit button appears on own listings only
- [ ] All text is properly translated

---

## Next Steps

**Immediate:** Implement Phase 1 (P0 fixes) to complete CRUD functionality.

See implementation plan in next artifact.
