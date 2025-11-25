# EcoHub V2 Routing Quick Reference

**For Developers:** Use this as your canonical routing guide.

---

## Public Marketplace Routes

### Browse Listings

```
Route: /[locale]/marketplace
Purpose: Landing hub with hero section and V2 listings
Access: Public (no auth required)
Example: /sq/marketplace, /en/marketplace
```

### View Listing Detail

```
Route: /[locale]/marketplace/[id]
Purpose: Detailed view of a single listing
Access: Public (no auth required)
Example: /sq/marketplace/abc123, /en/marketplace/abc123
```

### Create New Listing

```
Route: /[locale]/marketplace/add
Purpose: Form to create a new listing
Access: Protected (auth required, org member)
Example: /sq/marketplace/add, /en/marketplace/add
```

### Edit Listing

```
Route: /[locale]/marketplace/[id]/edit
Purpose: Form to edit an existing listing
Access: Protected (auth required, listing owner)
Example: /sq/marketplace/abc123/edit, /en/marketplace/abc123/edit
```

---

## User Account Routes (My EcoHub)

### Organization Profile

```
Route: /[locale]/my/organization
Purpose: User's organization dashboard (profile, listings, analytics, members)
Access: Protected (auth required)
Example: /sq/my/organization, /en/my/organization
```

### Saved Listings

```
Route: /[locale]/my/saved-listings
Purpose: Bookmarked listings by current user
Access: Protected (auth required)
Example: /sq/my/saved-listings, /en/my/saved-listings
```

---

## Public Directory

### Organizations Directory

```
Route: /[locale]/eco-organizations
Purpose: Directory of all verified organizations
Access: Public (no auth required)
Example: /sq/eco-organizations, /en/eco-organizations
```

---

## Navigation Implementation Rules

### 1. Always Use Dynamic Locale

```tsx
// ✅ CORRECT - Uses dynamic locale from props/hooks
<Link href={`/${locale}/marketplace`}>Browse</Link>

// ❌ WRONG - Hard-coded locale
<Link href="/en/marketplace">Browse</Link>
```

### 2. Use Next.js Link Component

```tsx
import Link from "next/link"

// ✅ CORRECT
;<Link href={`/${locale}/marketplace`}>Go to Marketplace</Link>

// ⚠️ Use router only for programmatic navigation
import { useRouter } from "next/navigation"
const router = useRouter()
router.push(`/${locale}/marketplace`)
```

### 3. Import Translations Correctly

```tsx
import { useTranslations } from "next-intl"

// ✅ CORRECT - Use "marketplace" namespace (not marketplace-v2)
const t = useTranslations("marketplace")
return <h1>{t("title")}</h1>

// ❌ WRONG
const t = useTranslations("marketplace-v2")
```

### 4. Get Locale From Props or Hooks

```tsx
// In page.tsx (Server Component)
export default function Page({ params }) {
  const { locale } = await params
  return <Component locale={locale} />
}

// In client components
import { useLocale } from "next-intl"
export default function ClientComponent() {
  const locale = useLocale() // "sq" or "en"
  return <Link href={`/${locale}/marketplace`}>Link</Link>
}
```

---

## Legacy Routes (Deprecated - But Still Working)

These routes **still exist but redirect** to canonical paths. Don't use them in new code.

```
/[locale]/marketplace-v2          → /[locale]/marketplace
/[locale]/marketplace-v2/[id]     → /[locale]/marketplace/[id]
/[locale]/marketplace-v2/[id]/edit → /[locale]/marketplace/[id]
/[locale]/marketplace-v2/add      → /[locale]/marketplace/add
```

---

## Component Link Examples

### Listing Card Component

```tsx
// ✅ CORRECT - Links to detail with dynamic locale
<Link href={`/${locale}/marketplace/${listing.id}`}>View Listing</Link>
```

### CTA Button Component

```tsx
// ✅ CORRECT - Creates listing with dynamic locale
<Link href={`/${locale}/marketplace/add`}>Create Listing</Link>
```

### Empty State Component

```tsx
// ✅ CORRECT - Browse link with dynamic locale
<Link href={`/${locale}/marketplace`}>Browse Marketplace</Link>
```

---

## Locale Switching

All routes automatically work with both locales:

- `/sq/marketplace` (Albanian)
- `/en/marketplace` (English)

The locale is preserved in URL and routing is automatic via middleware.

---

## Common Mistakes ❌ → ✅

| Mistake                     | Issue           | Fix                          |
| --------------------------- | --------------- | ---------------------------- |
| `/marketplace/add`          | Missing locale  | `/${locale}/marketplace/add` |
| `/en/marketplace`           | Hard-coded      | `/${locale}/marketplace`     |
| `marketplace-v2`            | Legacy route    | `marketplace`                |
| Using `href="/marketplace"` | Server redirect | Use `Link` component         |

---

## API Endpoints (For Reference)

| Endpoint                           | Purpose                | Method |
| ---------------------------------- | ---------------------- | ------ |
| `/api/marketplace/listings`        | Get canonical listings | GET    |
| `/api/marketplace-v2/listings`     | Legacy (still works)   | GET    |
| `/api/marketplace-v2/interactions` | Save/unsave listings   | POST   |
| `/api/public/organizations`        | Get org directory      | GET    |

---

## Quick Links

📄 **Full Technical Documentation:** `ROUTING_NAVIGATION_SANITY_PASS.md`  
📋 **Verification Checklist:** `SANITY_PASS_VERIFICATION_CHECKLIST.md`  
📊 **Executive Summary:** `SANITY_PASS_EXECUTIVE_SUMMARY.md`

---

## Support

- ✅ All routes verified and working
- ✅ Both locales (sq, en) functional
- ✅ E2E tests cover all navigation flows
- ✅ TypeScript types enforce correct usage

**If you encounter routing issues, refer to the full technical documentation.**
