# Routing Contract

This document defines the canonical routes for the EcoHub Kosova application. All internal navigation must adhere to these paths.

## Canonical Routes

| Page            | Canonical Path      | Dynamic Params | Notes                                                   |
| --------------- | ------------------- | -------------- | ------------------------------------------------------- |
| Home            | `/`                 | -              | Redirects to `/[locale]/home` or handles via middleware |
| How It Works    | `/how-it-works`     | -              |                                                         |
| Partners        | `/partners`         | -              | List of eco-organizations                               |
| Partner Detail  | `/partners/[id]`    | `id` (UUID)    |                                                         |
| Marketplace     | `/marketplace`      | -              |                                                         |
| Listing Detail  | `/marketplace/[id]` | `id` (UUID)    |                                                         |
| User Dashboard  | `/my`               | -              | Protected route                                         |
| Admin Dashboard | `/admin`            | -              | Protected route (Admin only)                            |
| Login           | `/login`            | -              |                                                         |
| Register        | `/register`         | -              |                                                         |

## Dynamic Link Interpolation

**Strict Rule:** Do not use string interpolation for `href` attributes. Use the `Link` component from `@/i18n/routing` with proper route params if supported, or ensure clean template literals.

**Incorrect:**

```tsx
href="/partners/${organization.eco_org_id}" // String literal with un-evaluated interpolation
href={`/partners/${id}`} // Manual path construction (acceptable if using canonical Link, but prefer typed routes if available)
```

**Correct:**

```tsx
import { Link } from "@/i18n/routing"

;<Link href={`/partners/${id}`}>...</Link>
```

## i18n Navigation

- **Imports:** Always import `Link`, `useRouter`, `redirect`, `usePathname` from `@/i18n/routing`.
- **Prefixes:** Do NOT manually add `/${locale}` to paths. The `Link` component handles this automatically.
- **Language Switch:** Switching languages should preserve the current canonical path and parameters.
