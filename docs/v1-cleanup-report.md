# V1 Cleanup & Regression Prevention - Implementation Report

**Date:** 2025-12-02  
**Status:** ✅ Phase A Complete | 🔄 Phase B In Progress

---

## Phase A: Prevent Missed Links & 404s

### ✅ 1. Regression Guards Script

**Created:** `scripts/regression-guards.sh`

Checks for two critical anti-patterns:

- Manual locale prefixing (`/${locale}`)
- Direct usage of `next/navigation` primitives instead of `@/i18n/routing`

**Usage:**

```bash
npm run check:regression
```

**Fixed Issues:**

- ✅ Replaced `useRouter` from `next/navigation` in `contact-listing-button.tsx`
- ✅ Replaced `useRouter` from `next/navigation` in `admin-stat-card.tsx`

### ✅ 2. Smoke Navigation Test

**Created:** `e2e/smoke-navigation.spec.ts`

Tests navigation across both locales (`en`, `sq`) to ensure:

- Locale prefixes persist through navigation
- Header links work correctly
- Footer links work correctly
- No 404s or locale-dropping

**Current Status:** ⚠️ Failing on EN footer FAQ link (see Phase B)

### ✅ 3. V1 Artifact Removal

| Artifact                          | Action                       | Status |
| --------------------------------- | ---------------------------- | ------ |
| `src/app/[locale]/(site)/explore` | Redirected to `/marketplace` | ✅     |
| `src/app/api/v1`                  | Deleted                      | ✅     |
| `messages/*/explore.json`         | Deleted                      | ✅     |
| `src/lib/i18n.ts`                 | Removed `explore` namespace  | ✅     |
| `src/types/global.d.ts`           | Removed `explore` type       | ✅     |
| Header navigation                 | Removed "Explore" link       | ✅     |

---

## Phase B: Footer Locale Issue (🔄 In Progress)

### Symptom

Footer displays Albanian text on both `/sq` and `/en` routes.

### Root Cause Analysis

**Checked:**

1. ✅ `messages/en/footer.json` - Contains correct English translations
2. ✅ `messages/sq/footer.json` - Contains correct Albanian translations
3. ✅ `src/app/[locale]/layout.tsx` - Correctly awaits params and sets locale
4. ✅ `src/lib/i18n.ts` - Updated to use `requestLocale` (Next.js 15 pattern)
5. ✅ `FooterV2.tsx` - Uses `getTranslations("footer")` correctly

**Diagnosis:**
The issue is likely **Case A**: locale/message loading configuration.

### Debug Steps Added

1. **In `src/app/[locale]/layout.tsx`:**

   ```typescript
   if (locale === "en") {
     console.log(`[DEBUG] LocaleLayout: locale=${locale}`)
     console.log(`[DEBUG] Footer tagline: ${messages.footer?.tagline}`)
   }
   ```

2. **In `src/lib/i18n.ts`:**

   ```typescript
   console.log(`[i18n] requestLocale: ${locale}`)
   ```

### Next Steps

1. **Run dev server and check logs:**

   ```bash
   npm run dev
   # Visit http://localhost:3000/en/home
   # Check console for debug output
   ```

2. **Based on output:**
   - If locale is `en` but tagline is Albanian → message loader bug
   - If locale is `sq` when it should be `en` → routing/middleware bug
   - If both are correct → client-side hydration issue

3. **Remove debug logs after fix**

---

## CI/CD Integration Recommendations

### Pre-Push Script

Add to `package.json`:

```json
{
  "scripts": {
    "pre-push": "npm run lint && npm run check:regression && npm run tsc --noEmit"
  }
}
```

### GitHub Actions Workflow

```yaml
name: Quality Checks
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm check:regression
      - run: pnpm tsc --noEmit
      - run: pnpm build
      - run: ecohub-qa navigation_audit
      - run: ecohub-qa i18n_audit
```

---

## Files Modified

### Created

- `scripts/regression-guards.sh`
- `e2e/smoke-navigation.spec.ts`

### Modified

- `src/components/header-client.tsx` - Removed Explore link
- `src/app/[locale]/(site)/explore/page.tsx` - Now redirects to marketplace
- `src/lib/i18n.ts` - Removed explore namespace, updated to use requestLocale
- `src/types/global.d.ts` - Removed explore type
- `src/app/[locale]/layout.tsx` - Added debug logging
- `src/app/[locale]/(site)/marketplace/[id]/contact-listing-button.tsx` - Fixed router import
- `src/components/admin/admin-stat-card.tsx` - Fixed router import
- `src/app/[locale]/(protected)/admin/articles/actions.ts` - Added null check
- `package.json` - Added `check:regression` script

### Deleted

- `src/app/api/v1/*` (entire directory)
- `messages/en/explore.json`
- `messages/sq/explore.json`
- `src/app/[locale]/(site)/explore/cta.tsx`
- `src/app/[locale]/(site)/explore/loading.tsx`
- `src/app/[locale]/(site)/explore/*.test.tsx`

---

## Verification Commands

```bash
# Run regression guards
npm run check:regression

# Type check
pnpm tsc --noEmit

# Build check
pnpm build

# Run smoke tests
npx playwright test e2e/smoke-navigation.spec.ts

# Run MCP audits (if available)
ecohub-qa navigation_audit
ecohub-qa i18n_audit
```

---

## Outstanding Issues

1. **Footer locale bug** - Debug logs added, needs manual verification
2. **Smoke test failure** - FAQ link timing out (may be related to footer locale issue)

---

## Recommendations

1. **Complete Phase B** by running dev server with debug logs
2. **Add pre-commit hooks** using husky for regression guards
3. **Integrate MCP audits** into CI pipeline
4. **Document canonical routing patterns** for new developers
5. **Create ADR** (Architecture Decision Record) for locale-aware navigation
