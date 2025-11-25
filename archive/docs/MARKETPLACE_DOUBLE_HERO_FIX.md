# Marketplace Double-Hero Fix & V1→V2 Transition Completion

## Summary

Fixed the double-hero/double-heading issue on `/[locale]/marketplace` landing page that was rendering both:

1. The new Phase 4.13 marketplace hero (correct)
2. A duplicate "The Marketplace for Circular Economy" h2 from within MarketplaceClientPage (removed)

Result: Single, clean hero section followed by filters and listings grid.

---

## Changes Made

### 1. **marketplace-client-page.tsx** (Main refactor)

**File**: `src/app/[locale]/(site)/marketplace/marketplace-client-page.tsx`

**Changes**:

- Added optional props to `MarketplaceClientPageProps`:
  - `showHero?: boolean` (defaults to `true`)
  - `heroTitle?: string` (defaults to "The Marketplace for Circular Economy")

- Updated component signature to accept these props with defaults

- Wrapped the old hero heading in a conditional render:
  ```tsx
  {
    /* Hero Section (optional) */
  }
  {
    showHero && (
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{heroTitle}</h2>
      </div>
    )
  }
  ```

**Impact**:

- Default behavior (`showHero=true`) preserves backward compatibility for any standalone usage
- Can be hidden (`showHero=false`) when embedded in the landing page
- Filters, search, and listings grid continue to render normally (outside conditional)

### 2. **marketplace-landing-client.tsx** (Usage update)

**File**: `src/app/[locale]/(site)/marketplace/marketplace-landing-client.tsx`

**Changes**:

- Removed duplicate h2 heading: `<h2>The Marketplace for Circular Economy</h2>`
- Updated MarketplaceClientPage usage:
  ```tsx
  <MarketplaceClientPage
    locale={locale}
    initialSearchParams={initialSearchParams}
    showHero={false} // Hide the old hero since landing page has its own
  />
  ```

**Impact**:

- `/[locale]/marketplace` now renders with only one hero (the main Phase 4.13 hero)
- Clean visual hierarchy: Hero → Filters/Search → Listings Grid → CTA Sections

### 3. **marketplace-client-page.test.tsx** (Test update)

**File**: `src/app/[locale]/(site)/marketplace/marketplace-client-page.test.tsx`

**Changes**:

- Updated both test cases to include the new optional props:
  - First test: `showHero={true}` to verify default behavior
  - Second test: `showHero={false}` to verify embedded mode

**Impact**:

- Tests remain passing and properly exercise both modes

### 4. **marketplace-landing.spec.ts** (E2E enhancement)

**File**: `e2e/marketplace-landing.spec.ts`

**Changes**:

- Added new E2E test: `"should display only one primary hero (no double-hero)"`
- Verifies:
  - Exactly one `<h1>` exists (main marketplace hero)
  - The h1 contains "Marketplace"
  - Filter buttons are visible (marketplace section is not hidden)

**Impact**:

- QA now catches regression if double-hero appears again
- Confirms fix works across `/en/marketplace` and `/sq/marketplace`

---

## Result: What the User Sees

### Before (Issue)

```
Hero Section (Phase 4.13)
├─ Title: "The Marketplace for Circular Economy"
├─ Subtitle & CTAs
└─ Search Bar

Marketplace Section (OLD - redundant)
├─ Title: "The Marketplace for Circular Economy"  ← DUPLICATE!
├─ Filter Pills
├─ Search Bar
└─ Listings Grid
```

### After (Fixed)

```
Hero Section (Phase 4.13)
├─ Title: "The Marketplace for Circular Economy"
├─ Subtitle & CTAs
└─ Search Bar

Marketplace Section (CLEAN - no duplicate hero)
├─ Filter Pills (Të gjitha / Për Shitje / Kërkoj të Blej)
├─ Filters & Search (integrated)
└─ Listings Grid

Recyclers Teaser Section
└─ ...
```

---

## Backward Compatibility

✅ **Preserved**:

- Default `showHero=true` means any future standalone MarketplaceClientPage usage will still render its hero
- No breaking changes to component API
- All existing tests updated and passing

---

## Files Modified (Summary)

| File                               | Purpose               | Changes                                                  |
| ---------------------------------- | --------------------- | -------------------------------------------------------- |
| `marketplace-client-page.tsx`      | Component enhancement | Added `showHero`, `heroTitle` props + conditional render |
| `marketplace-landing-client.tsx`   | Landing page usage    | Removed duplicate h2, passed `showHero={false}`          |
| `marketplace-client-page.test.tsx` | Unit tests            | Updated test calls with new props                        |
| `marketplace-landing.spec.ts`      | E2E tests             | Added double-hero regression test                        |

---

## QA Status

### Build Checks ✅

- **Lint**: 0 errors (`pnpm lint` ✓)
- **TypeScript**: 0 errors (ESM compilation)
- **Build**: Successful (`pnpm build` ✓)

### Test Coverage ✅

- Existing marketplace-client-page tests updated and passing
- New E2E test added: `"should display only one primary hero (no double-hero)"`
- Legacy marketplace redirects still passing (from Phase: Legacy Marketplace Cleanup)

### Manual Verification ✅

- `/[locale]/marketplace` renders single hero followed by filters + grid
- No duplicate headings or sections
- All locales work: `/en/marketplace` and `/sq/marketplace`

---

## Next Steps (If Needed)

1. **Clean up MarketplaceV2Client separately** if it also has a hero section
   - Currently MarketplaceV2Client is used for V2-specific views
   - MarketplaceClientPage is the primary listing view in the landing

2. **I18n namespace consolidation** (future):
   - Ensure both `marketplace.json` and `marketplace-landing.json` i18n keys are consistent
   - Currently hard-coded hero text; can be migrated to i18n in Phase 4.14+

3. **Design refinement** (future):
   - Consider visual separation between CTA section and marketplace grid
   - Currently uses consistent spacing; may want distinct background colors

---

## Phase Attribution

- **Phase 4.13**: Marketplace Landing Page (hero, layout, teasers)
- **Phase 4.14** (this work): Fix double-hero + enable flexible hero rendering
- **Phase: Legacy Marketplace Cleanup**: Marketplace-V2 redirects (still active, unaffected)

---

## Conclusion

The double-hero issue is resolved by introducing a flexible `showHero` prop to `MarketplaceClientPage`. This allows the component to work both standalone (with hero) and embedded in the landing page (without hero), keeping code DRY and maintainable.

All QA checks remain green: 0 lint errors, 0 TS errors, build successful, E2E tests passing.
