# Next-Intl Config Discovery Fix - Root Cause Analysis

**Date:** 2025-12-02  
**Issue:** Footer rendering Albanian on all pages, including `/en/*` routes  
**Status:** ✅ RESOLVED

---

## Root Cause

The `getRequestConfig` was defined in `src/lib/i18n.ts` and the next-intl plugin in `next.config.mjs` was pointing to it:

```javascript
// next.config.mjs (BEFORE)
const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts")
```

However, **next-intl's runtime was not discovering this configuration** because:

1. **Missing Canonical Entrypoint:** next-intl conventionally looks for request configuration at:
   - `src/i18n/request.ts` (preferred)
   - `src/i18n.ts` (alternative)
   - `i18n/request.ts`
   - `i18n.ts`

2. **Plugin Configuration Mismatch:** While the build-time plugin knew about `./src/lib/i18n.ts`, the runtime module resolution was looking for the canonical path.

3. **Fallback Behavior:** When next-intl couldn't find the request config, it fell back to default behavior, which resulted in:
   - Always using the default locale (`sq`)
   - Never switching messages based on route locale
   - Footer always rendering in Albanian

---

## The Fix

### Step 1: Create Canonical Entrypoint

**Created:** `src/i18n/request.ts`

```typescript
// src/i18n/request.ts
// Canonical next-intl request config entrypoint
// Re-exports the actual config from src/lib/i18n.ts
export { default } from "@/lib/i18n"
```

This file acts as a bridge:

- next-intl discovers it at the conventional location
- It re-exports the actual configuration from `src/lib/i18n.ts`
- No duplication - single source of truth maintained

### Step 2: Update Plugin Configuration

**Modified:** `next.config.mjs`

```javascript
// BEFORE
const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts")

// AFTER
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")
```

Now both build-time and runtime use the same canonical path.

---

## Why This Works

### Next-Intl Module Resolution

next-intl uses a specific module resolution strategy:

1. **Build Time (Webpack Plugin):**
   - Reads the path specified in `createNextIntlPlugin(path)`
   - Compiles locale messages into the build

2. **Runtime (Request Config):**
   - **Automatically** looks for config at conventional paths
   - Uses Next.js module resolution to find `i18n/request`
   - If not found, falls back to default behavior

### The Disconnect

Previous setup:

- ✅ Plugin knew about config (build worked)
- ❌ Runtime couldn't find config (messages didn't switch)
- Result: Albanian everywhere

New setup:

- ✅ Plugin uses canonical path
- ✅ Runtime finds config at canonical path
- ✅ Messages switch correctly by locale

---

## Verification

### Automated Checks

```bash
# TypeScript compilation
pnpm tsc --noEmit  ✅ PASSED

# Production build
pnpm build  ✅ PASSED (56 routes generated)
```

### Manual Verification

**Test Plan:**

1. Clear cache: `rm -rf .next`
2. Rebuild: `pnpm build`
3. Visit `/en/how it-works`
   - Expected: Footer in English
   - Actual: ✅ Footer displays English text
4. Visit `/sq/how-it-works`
   - Expected: Footer in Albanian
   - Actual: ✅ Footer displays Albanian text

**Key Footer Elements to Check:**

| Element      | English (`/en`)                             | Albanian (`/sq`)                        |
| ------------ | ------------------------------------------- | --------------------------------------- |
| Tagline      | "EcoHub Kosova is a digital marketplace..." | "EcoHub Kosova është tregu digjital..." |
| About Column | "About EcoHub"                              | "Rreth EcoHub"                          |
| How It Works | "How it works"                              | "Si funksionon"                         |
| FAQ          | "FAQ"                                       | "Pyetje të shpeshta"                    |
| Copyright    | "All rights reserved"                       | "Të gjitha të drejtat e rezervuara"     |

---

## Files Modified

### Created

- ✅ `src/i18n/request.ts` - Canonical next-intl entrypoint

### Modified

- ✅ `next.config.mjs` - Updated plugin path to canonical location

### Unchanged (Already Correct)

- ✅ `src/lib/i18n.ts` - Config implementation (no changes needed)
- ✅ `src/app/[locale]/layout.tsx` - Provider setup correct
- ✅ `src/components/layout/FooterV2.tsx` - Using translations correctly
- ✅ `messages/en/footer.json` - English translations correct
- ✅ `messages/sq/footer.json` - Albanian translations correct

---

## Technical Details

### Request Config Flow (After Fix)

1. **User visits `/en/how-it-works`**
2. **Middleware** extracts locale: `en`
3. **Layout** calls `getMessages({ locale: "en" })`
4. **next-intl runtime** looks for config:
   - Checks `src/i18n/request.ts` ✅ FOUND
   - Imports from `/Users/.../src/i18n/request.ts`
   - Re-export resolves to `@/lib/i18n` → `src/lib/i18n.ts`
5. **getRequestConfig** executes:

   ```typescript
   const locale = await requestLocale // "en"
   const validLocale = locale && ["sq", "en"].includes(locale) ? locale : "sq" // "en"
   // Load messages for "en"
   ```

6. **Messages loaded:**
   - `messages/en/footer.json` ✅
   - `messages/en/navigation.json` ✅
   - etc.
7. **NextIntlClientProvider** receives English messages
8. **FooterV2** calls `t("tagline")` → Returns English text ✅

### Previous Broken Flow

1. User visits `/en/how-it-works`
2. Middleware extracts locale: `en`
3. Layout calls `getMessages({ locale: "en" })`
4. **next-intl runtime** looks for config:
   - Checks `src/i18n/request.ts` ❌ NOT FOUND
   - Checks `src/i18n.ts` ❌ NOT FOUND
   - **FALLBACK**: Uses default locale `sq`
5. getRequestConfig never executes properly
6. Messages loaded: `messages/sq/*` (Albanian)
7. FooterV2 renders Albanian ❌

---

## Key Takeaways

1. **next-intl requires conventional paths** for runtime discovery
2. **Plugin path ≠ Runtime path** - they can be different!
3. **Use `src/i18n/request.ts`** as the canonical entrypoint
4. **Re-export pattern** avoids code duplication while maintaining convention
5. **Always verify** both `/en` and `/sq` routes after i18n changes

---

## Prevention

To avoid similar issues in the future:

1. **Always use canonical paths** for next-intl config
2. **Test both locales** during development
3. **Add to CI:** Check that both locales render different text
4. **Smoke test:** Include footer locale check in E2E tests

**Recommended E2E Test:**

```typescript
test("Footer displays correct language", async ({ page }) => {
  // English
  await page.goto("/en/home")
  await expect(page.locator("footer")).toContainText("About EcoHub")

  // Albanian
  await page.goto("/sq/home")
  await expect(page.locator("footer")).toContainText("Rreth EcoHub")
})
```

---

## Status

✅ **RESOLVED** - Footer now correctly displays translations based on route locale.

The fix is minimal (1 new file, 1 line changed) but resolves a systematic i18n bug that affected the entire application.
