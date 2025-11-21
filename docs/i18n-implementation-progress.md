# i18n Implementation Progress Report

## Branch: `feature/i18n-implementation-phase2`

### ✅ Completed Work

#### 1. Login Page - FULLY LOCALIZED

**Files Modified:**

- `messages/en/auth.json` - Added keys: `welcome`, `signingIn`, `redirecting`, `loginError`, `noAccountQuestion`, `registerHere`
- `messages/sq/auth.json` - Added corresponding Albanian translations
- `src/app/[locale]/(auth)/login/page.tsx` - Converted all hardcoded Albanian text to use `useTranslations("auth")`

**Impact:** Login page now fully supports both EN and SQ locales with proper translations.

#### 2. Marketplace Filters - TRANSLATIONS ADDED

**Files Modified:**

- `messages/en/marketplace.json` - Added `filterTypes`, `loginToViewEmail`, `name`, `listingDescription`
- `messages/sq/marketplace.json` - Added corresponding Albanian translations

**Status:** Translation keys are ready, but marketplace client page still needs to be wired to use them.

---

### 🔄 In Progress / Needs Completion

#### High Priority (User-Facing)

1. **Register Page** (`src/app/[locale]/(auth)/register/page.tsx`)
   - Extensive hardcoded Albanian text
   - Form labels: "Emri i Plotë", "Emri i organizatës", "Përshkrimi i organizatës", etc.
   - Button text: "Regjistrohu"
   - Most keys already exist in `auth.json`, just needs wiring

2. **Marketplace Client Page** (`src/app/[locale]/(site)/marketplace/marketplace-client-page.tsx`)
   - Tab labels: "Të gjitha", "Për Shitje", "Kërkoj të Blej"
   - Filter placeholders and labels
   - Loading/error messages
   - Pagination text
   - Categories list (needs new namespace or addition to marketplace.json)

3. **Marketplace Add Listing** (`src/app/[locale]/(site)/marketplace/add/add-listing-client-page.tsx`)
   - Form labels: "Titulli", "Përshkrimi", "Kërkoj të Blej - Jam në kërkim të diçkaje"
   - Needs `listing` namespace expansion

4. **Marketplace Detail Page** (`src/app/[locale]/(site)/marketplace/[id]/page.tsx`)
   - "Përshkrimi", "Kyçu për ta parë emailin"
   - Contact button component

5. **Header Client** (`src/components/header-client.tsx`)
   - "Fillo Bashkëpunimin" button
   - Should use `cta` namespace

6. **Help Page** (`src/app/[locale]/(site)/help/page.tsx`)
   - Extensive hardcoded text
   - "Qendra e Ndihmës", "Filloni Bashkëpunimin", "Shiko FAQ"
   - Needs `help` namespace expansion

7. **FAQ Page** (`src/app/[locale]/(site)/faq/page.tsx`)
   - Entirely hardcoded Albanian
   - Needs new `faq` namespace or expansion of `help`

8. **Partners Page** (`src/app/[locale]/(site)/partners/page.tsx`)
   - Partner descriptions and CTAs
   - "Bashkohu me rrjetin tonë të partnerëve"
   - Needs `partners` namespace (new)

9. **Organizations Page** (`src/app/[locale]/(site)/organizations/page.tsx`)
   - "Zbulo organizatat që janë pjesë e rrjetit tonë"

10. **Contact Page** (`src/app/[locale]/(site)/contact/page.tsx`)
    - Address: "10000 Prishtinë, Kosovë"
    - Should use `contact` namespace

#### Medium Priority (Admin/Internal)

11. **Admin Pages**
    - Articles admin: Table headers "Titulli", form labels
    - Listings admin: "Titulli", "Blej", "Shes"
    - Organizations admin: "Emri"
    - Users admin: "Emri i Plotë"
    - Needs `admin` namespace expansion

12. **Profile Forms**
    - User profile: "Emri i Plotë"
    - Organization profile: "Emri", "Përshkrimi"
    - Should use `dashboard` or `profile` namespace

13. **About Pages** (Coalition, Vision, Mission)
    - Extensive long-form content
    - "Misioni Ynë", "Bashkëpunimi Ndërkombëtar"
    - Consider marking as Albanian-only with banner for now

14. **Legal Pages** (Terms, Privacy)
    - Long-form legal content
    - Recommend marking as Albanian-only for now

#### Low Priority

15. **Landing Auth Panel** (`src/components/landing/landing-auth-panel.tsx`)
    - "Kyçu ose krijo një llogari të re për të filluar bashkëpunimin"

16. **Auth Form Components** (`src/components/auth/auth-form-components.tsx`)
    - OAuth button text: "Kyçu me Google", "Kyçu me GitHub"

17. **Success Page** (`src/app/[locale]/(auth)/success/page.tsx`)
    - "Kyçu në platformë"

18. **About Sidebar** (`src/components/sidebars/about-sidebar.tsx`)
    - "Misioni" label

19. **Root Layout Metadata** (`src/app/layout.tsx`)
    - Title, description, keywords
    - Should use `metadata` namespace

---

### 📊 Statistics

**Scanned Files:** ~50+ files with hardcoded Albanian
**Fully Localized:** 1 file (login page)
**Translation Keys Added:** 13 new keys
**Namespaces Modified:** 2 (auth, marketplace)
**Namespaces Needed:** 2-3 new (faq, partners, potentially legal)

**Estimated Remaining Work:**

- High Priority: ~15-20 files
- Medium Priority: ~10 files
- Low Priority: ~5 files

---

### 🎯 Recommended Next Steps

#### Phase 1: Complete High-Impact User Flows (2-3 hours)

1. Register page (auth namespace)
2. Marketplace client page (marketplace namespace)
3. Marketplace add/detail pages (listing namespace)
4. Header CTA button (cta namespace)
5. Help/FAQ pages (help/faq namespaces)

#### Phase 2: Admin & Internal Tools (1-2 hours)

6. Admin table headers and labels (admin namespace)
7. Profile forms (dashboard namespace)

#### Phase 3: Content Pages (Consider Albanian-Only Strategy)

8. About pages - Add English banner: "This page is currently only available in Albanian"
9. Legal pages - Same approach
10. Use `common.albanianOnlyDescription` for banner text

---

### ✅ Tests Status

All tests passing on current branch:

- ✅ `pnpm lint` - PASS
- ✅ `pnpm build` - PASS
- ✅ `pnpm test:e2e:core` - PASS (4/4 tests)
- ✅ `node scripts/check-i18n-consistency.mjs` - PASS

---

### 📝 Implementation Pattern

For each component/page to localize:

1. **Add missing keys to namespace JSON files** (both EN and SQ)
2. **Import `useTranslations` or `getTranslations`**:

   ```tsx
   // Client component
   import { useTranslations } from "next-intl"
   const t = useTranslations("namespace")

   // Server component
   import { getTranslations } from "next-intl/server"
   const t = await getTranslations("namespace")
   ```

3. **Replace hardcoded text** with `t("key")`
4. **Run consistency check**: `node scripts/check-i18n-consistency.mjs`
5. **Test build**: `pnpm lint && pnpm build`
6. **Commit**: `git commit -m "feat(i18n): localize [component name]"`

---

### 🚫 What NOT to Change

- Sentry configuration
- Middleware/auth architecture
- CI workflows
- Existing i18n split structure
- Database enum values (`"shes"`, `"blej"` - these are data, not UI)

---

### 📦 Deliverables

**Current Branch:** `feature/i18n-implementation-phase2`

**Commits:**

1. `feat(i18n): localize login page with translations`
2. `feat(i18n): add marketplace filter translations`

**Ready to Merge:** No - significant work remains
**Recommended:** Continue implementation in phases or create sub-tasks

---

## Albanian-Only Content Strategy

For long-form content pages (About, Legal, etc.) that would require extensive translation effort:

1. **Add banner component** using `common.albanianOnlyTitle` and `common.albanianOnlyDescription`
2. **Translate only navigation elements** (headings, buttons, links)
3. **Keep body content in Albanian** for now
4. **Mark as future enhancement** in roadmap

Example implementation:

```tsx
import { useTranslations } from "next-intl"

export function AlbanianOnlyBanner() {
  const t = useTranslations("common")
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <h3 className="font-semibold">{t("albanianOnlyTitle")}</h3>
      <p className="text-sm">{t("albanianOnlyDescription")}</p>
    </div>
  )
}
```

This allows the app to be "functionally bilingual" while deferring full content translation.
