# EcoHub Kosova - i18n Translation Pattern Guide

## Standard Translation Pattern

**TL;DR**: Use namespace-based translations for all new components.

### For Client Components

```tsx
"use client"
import { useTranslations } from "next-intl"

export function MyComponent() {
  const t = useTranslations("namespace") // ✅ Specify namespace

  return (
    <div>
      <h1>{t("title")}</h1> {/* ✅ Use bare keys */}
      <p>{t("description")}</p>
    </div>
  )
}
```

### For Server Components

```tsx
import { getTranslations } from "next-intl/server"

export default async function MyPage() {
  const t = await getTranslations("namespace") // ✅ Specify namespace

  return (
    <div>
      <h1>{t("title")}</h1> {/* ✅ Use bare keys */}
      <p>{t("description")}</p>
    </div>
  )
}
```

## Translation File Structure

Organize translation keys by namespace in both `messages/sq.json` and `messages/en.json`:

```json
{
  "navigation": {
    "home": "Ballina / Home",
    "about": "Rreth nesh / About",
    "marketplace": "Tregu / Marketplace"
  },
  "footer": {
    "description": "...",
    "explore": "Eksploro / Explore"
  },
  "dashboard": {
    "title": "Paneli Kontroll / Dashboard",
    "statistics": "Statistikat / Statistics"
  },
  "home": {
    "hero": {
      "title": "...",
      "subtitle": "..."
    },
    "howItWorks": {
      "title": "..."
    }
  }
}
```

## Namespace Guidelines

| Namespace     | Use For                          | Example Files                         |
| ------------- | -------------------------------- | ------------------------------------- |
| `navigation`  | Header/sidebar nav items         | `header-client.tsx`, `sidebar.tsx`    |
| `footer`      | Footer content                   | `footer.tsx`                          |
| `dashboard`   | Dashboard-specific content       | `dashboard/**/*`                      |
| `marketplace` | Marketplace page content         | `marketplace/page.tsx`                |
| `home`        | Home page content                | `home/page.tsx`                       |
| `auth`        | Authentication forms             | `login/page.tsx`, `register/page.tsx` |
| `common`      | Shared UI text (buttons, labels) | Any component                         |
| `admin`       | Admin panel content              | `admin/**/*`                          |
| `errors`      | Error messages                   | Error pages                           |

## Migration from Old Pattern

Some older components use **dot notation without namespace**:

```tsx
// ❌ OLD PATTERN (still works, but inconsistent)
const t = useTranslations() // No namespace
t("footer.description") // Dot notation
```

**When to update**: Update to the new pattern when making other changes to the component. Don't do mass refactoring just for consistency.

## Best Practices

### 1. Keep Keys Descriptive

```tsx
// ✅ Good
t("hero.ctaRegister") // Clear what it does
t("howItWorks.step1Title") // Clear hierarchy

// ❌ Avoid
t("button1") // Not descriptive
t("text") // Too generic
```

### 2. Organize by UI Section

```json
{
  "home": {
    "hero": {
      /* all hero section keys */
    },
    "howItWorks": {
      /* all how-it-works keys */
    },
    "marketplace": {
      /* marketplace section keys */
    }
  }
}
```

### 3. Keep Albanian and English in Sync

Always add the same keys to both `sq.json` and `en.json`. Use this checklist:

- [ ] Added key to `messages/sq.json`
- [ ] Added matching key to `messages/en.json`
- [ ] Albanian text is natural and accurate
- [ ] English translation is clear and professional

### 4. Validate JSON Structure

Run `pnpm lint` after editing translation files to catch syntax errors.

## Examples from Codebase

### ✅ Correct Usage

**Header Navigation** ([`src/components/layout/header/header-client.tsx`](file:///Users/arbenlila/development/ecohubkosova/src/components/layout/header/header-client.tsx)):

```tsx
const t = useTranslations('navigation')
<Link href={`/${locale}/explore`}>{t('explore')}</Link>
<Link href={`/${locale}/partners`}>{t('partners')}</Link>
<Link href={`/${locale}/marketplace`}>{t('marketplace')}</Link>
```

**Home Page** ([`src/app/[locale]/(site)/home/page.tsx`](<file:///Users/arbenlila/development/ecohubkosova/src/app/[locale]/(site)/home/page.tsx>)):

```tsx
const t = await getTranslations('home')
<h1>{t('hero.title')}</h1>
<p>{t('hero.subtitle')}</p>
<Button>{t('hero.ctaRegister')}</Button>
```

**Dashboard Sidebar** ([`src/components/dashboard/sidebar.tsx`](file:///Users/arbenlila/development/ecohubkosova/src/components/dashboard/sidebar.tsx)):

```tsx
const t = useTranslations('navigation')
<Link href={`/${locale}/dashboard`}>{t('dashboard')}</Link>
<Link href={`/${locale}/marketplace`}>{t('marketplace')}</Link>
```

## Common Mistakes to Avoid

### ❌ Mixing Patterns in Same Component

```tsx
const t = useTranslations("home")
const navT = useTranslations() // ❌ Don't mix patterns

return (
  <>
    <h1>{t("title")}</h1>
    <nav>{navT("navigation.home")}</nav> {/* ❌ Inconsistent */}
  </>
)
```

**Fix**: Use separate translation instances with proper namespaces:

```tsx
const homeT = useTranslations("home")
const navT = useTranslations("navigation")

return (
  <>
    <h1>{homeT("title")}</h1>
    <nav>{navT("home")}</nav> {/* ✅ Consistent */}
  </>
)
```

### ❌ Hardcoded Text

```tsx
<h1>Mirë se vini</h1>  {/* ❌ Hardcoded Albanian */}
<Button>Get Started</Button>  {/* ❌ Hardcoded English */}
```

**Fix**:

```tsx
<h1>{t('welcome')}</h1>  {/* ✅ Localized */}
<Button>{t('getStarted')}</Button>  {/* ✅ Localized */}
```

### ❌ Missing Locale in Links

```tsx
<Link href="/marketplace">  {/* ❌ Missing locale */}
```

**Fix**:

```tsx
<Link href={`/${locale}/marketplace`}>  {/* ✅ Locale-aware */}
```

## Testing Translations

### Manual Testing

1. Start dev server: `pnpm dev`
2. Visit `/sq/home` - verify Albanian text
3. Switch language to EN in header
4. Visit `/en/home` - verify English text
5. Check all navigation links preserve locale

### Automated Testing

Run the test suite to check for i18n issues:

```bash
pnpm test  # Unit tests
pnpm test:e2e  # E2E tests
```

Look for `MISSING_MESSAGE` errors in test output.

## Quick Reference

```tsx
// Client Component Pattern
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')
<div>{t('key')}</div>

// Server Component Pattern
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('namespace')
<div>{t('key')}</div>

// Get Current Locale (Server)
import { getLocale } from 'next-intl/server'
const locale = await getLocale()

// Get Current Locale (Client)
import { useLocale } from 'next-intl'
const locale = useLocale()

// Locale-aware Links
<Link href={`/${locale}/path`}>
```

## Related Documentation

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Middleware](file:///Users/arbenlila/development/ecohubkosova/middleware.ts) - Locale routing logic
- [Root Layout](file:///Users/arbenlila/development/ecohubkosova/src/app/[locale]/layout.tsx) - Message loading
- [Translation Files](file:///Users/arbenlila/development/ecohubkosova/messages/) - sq.json & en.json

---

**Last Updated**: 2025-11-20  
**Questions?** Check the i18n verification report or ask in the team chat.
