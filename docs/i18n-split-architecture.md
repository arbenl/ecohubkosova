# i18n Split Architecture

## Overview

The EcoHub Kosova application uses `next-intl` for internationalization with a modular, namespace-based file structure. Translation files are split by feature/namespace to improve maintainability and reduce merge conflicts.

## File Structure

```
messages/
├── en/
│   ├── about.json
│   ├── admin.json
│   ├── auth.json
│   ├── common.json
│   ├── contact.json
│   ├── cta.json
│   ├── dashboard.json
│   ├── errors.json
│   ├── explore.json
│   ├── footer.json
│   ├── help.json
│   ├── home.json
│   ├── listing.json
│   ├── marketplace.json
│   ├── metadata.json
│   ├── navigation.json
│   └── sidebar.json
└── sq/
    ├── about.json
    ├── admin.json
    ├── auth.json
    ├── common.json
    ├── contact.json
    ├── cta.json
    ├── dashboard.json
    ├── errors.json
    ├── explore.json
    ├── footer.json
    ├── help.json
    ├── home.json
    ├── listing.json
    ├── marketplace.json
    ├── metadata.json
    ├── navigation.json
    └── sidebar.json
```

## How It Works

### Loading Mechanism

The `src/lib/i18n.ts` file loads all translation namespaces dynamically based on the current locale:

```typescript
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale && ["sq", "en"].includes(locale) ? locale : "sq"

  // Load all namespaces
  const [navigation, home, auth, ...] = await Promise.all([
    import(`../../messages/${validLocale}/navigation.json`),
    import(`../../messages/${validLocale}/home.json`),
    import(`../../messages/${validLocale}/auth.json`),
    // ...
  ])

  return {
    locale: validLocale,
    messages: {
      navigation: navigation.default,
      home: home.default,
      auth: auth.default,
      // ...
    }
  }
})
```

### Type Safety

The `src/types/global.d.ts` file aggregates all namespace types to provide full TypeScript autocomplete:

```typescript
import navigation from "../../messages/en/navigation.json"
import home from "../../messages/en/home.json"
// ...

type Messages = {
  navigation: typeof navigation
  home: typeof home
  // ...
}

declare global {
  interface IntlMessages extends Messages {}
}
```

## Usage Patterns

### Server Components

```typescript
import { getTranslations } from 'next-intl/server'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  return <h1>{t('hero.title')}</h1>
}
```

### Client Components

```typescript
'use client'

import { useTranslations } from 'next-intl'

export function Navigation() {
  const t = useTranslations('navigation')

  return <nav>{t('home')}</nav>
}
```

## Adding a New Namespace

To add a new namespace (e.g., `partners`):

1. **Create the JSON files**:
   - `messages/en/partners.json`
   - `messages/sq/partners.json`

2. **Update `src/lib/i18n.ts`**:

   ```typescript
   const [
     navigation,
     // ... existing imports
     partners, // Add here
   ] = await Promise.all([
     import(`../../messages/${validLocale}/navigation.json`),
     // ... existing imports
     import(`../../messages/${validLocale}/partners.json`), // Add here
   ])

   return {
     locale: validLocale,
     messages: {
       navigation: navigation.default,
       // ... existing namespaces
       partners: partners.default, // Add here
     },
   }
   ```

3. **Update `src/types/global.d.ts`**:

   ```typescript
   import partners from "../../messages/en/partners.json"

   type Messages = {
     navigation: typeof navigation
     // ... existing types
     partners: typeof partners // Add here
   }
   ```

4. **Verify consistency**:
   ```bash
   node scripts/check-i18n-consistency.mjs
   ```

## Key Consistency

All translation keys must exist in both English and Albanian with the same structure. Use the consistency checker:

```bash
node scripts/check-i18n-consistency.mjs
```

This script will:

- Verify all EN files have corresponding SQ files
- Check that all keys exist in both locales
- Report any missing or extra keys

## Best Practices

1. **Albanian as Source of Truth**: When there's a conflict or missing key, prefer the Albanian version as authoritative.

2. **Namespace Organization**: Group related translations together:
   - `navigation`: Header/footer navigation
   - `auth`: Login, register, password flows
   - `home`: Home page content
   - `dashboard`: User dashboard
   - `marketplace`: Marketplace listings
   - `common`: Shared UI elements (buttons, labels, etc.)
   - `errors`: Error messages
   - `metadata`: Page titles and meta descriptions

3. **Nested Keys**: Use dot notation for nested translations:

   ```json
   {
     "hero": {
       "title": "Welcome",
       "subtitle": "Get started today"
     }
   }
   ```

   Access with: `t('hero.title')`

4. **No Runtime Concatenation**: Avoid building translation keys dynamically. Always use static strings for better type safety.

5. **Keep Keys Synchronized**: When adding a new key to one locale, immediately add it to the other locale as well.

## Maintenance

- Run `node scripts/check-i18n-consistency.mjs` before committing changes
- Keep namespace files focused and under 100 keys
- Split large namespaces if they grow too big
- Document any Albanian-only content with comments
