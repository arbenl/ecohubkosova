# 🚀 Quick Start Guide - New Folder Structure

**Last Updated**: November 17, 2025  
**Status**: ✅ Live and ready to use

---

## 📍 Where Things Are Now

### Public Pages
All public/marketing pages are in: `src/app/[locale]/(site)/`

**Examples:**
- Homepage: `src/app/[locale]/(site)/home/page.tsx`
- Marketplace: `src/app/[locale]/(site)/marketplace/page.tsx`
- About: `src/app/[locale]/(site)/about/page.tsx`

### Protected Pages (Auth Required)
All user-only pages are in: `src/app/[locale]/(protected)/`

**Examples:**
- Dashboard: `src/app/[locale]/(protected)/dashboard/page.tsx`
- Profile: `src/app/[locale]/(protected)/profile/page.tsx`
- Admin: `src/app/[locale]/(protected)/admin/page.tsx`

### Auth Pages
Login, register, callbacks: `src/app/[locale]/(auth)/`

### Layout Components
All layout components: `src/components/layout/`
- `PageLayout` - Main wrapper for all pages
- `SidebarLayout` - For pages with sidebars
- `AuthGate` - Auth protection wrapper
- Header components in `header/` subfolder

### Feature Components
Organized by feature:
- Dashboard: `src/components/dashboard/`
- Admin: `src/components/admin/`
- Profile: `src/components/profile/`
- Shared: `src/components/shared/`

---

## 🎯 Common Tasks

### 1. Add a New Public Page

**Step 1:** Create the page
```bash
mkdir -p src/app/[locale]/(site)/my-page
touch src/app/[locale]/(site)/my-page/page.tsx
```

**Step 2:** Write the page
```typescript
import { PageLayout } from "@/components/layout"

export default function MyPage() {
  return (
    <PageLayout>
      <div className="container">
        <h1>My Page</h1>
        {/* content */}
      </div>
    </PageLayout>
  )
}
```

✅ Done! Layout, header, footer all included automatically.

---

### 2. Add a New Protected Page (Login Required)

**Step 1:** Create the page
```bash
mkdir -p src/app/[locale]/(protected)/my-page
touch src/app/[locale]/(protected)/my-page/page.tsx
```

**Step 2:** Write the page
```typescript
import { PageLayout } from "@/components/layout"

export default function MyPage() {
  return (
    <PageLayout>
      <div className="container">
        <h1>Protected Page</h1>
        {/* content */}
      </div>
    </PageLayout>
  )
}
```

✅ Done! Auth check is automatic via `(protected)/layout.tsx`

---

### 3. Add a Page with Sidebar

**Step 1:** Create sidebar component
```typescript
// src/components/sidebars/my-sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useLocale } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/my-page', label: 'Main' },
  { href: '/my-page/sub1', label: 'Sub 1' },
  { href: '/my-page/sub2', label: 'Sub 2' },
]

export function MySidebar() {
  const pathname = usePathname()
  const locale = useLocale()
  
  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const href = `/${locale}${link.href}`
        const isActive = pathname === href
        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#00C896] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

**Step 2:** Create layout with sidebar
```typescript
// src/app/[locale]/(site)/my-page/layout.tsx
import { SidebarLayout } from '@/components/layout'
import { MySidebar } from '@/components/sidebars/my-sidebar'

export default function MyPageLayout({ children }) {
  return (
    <SidebarLayout sidebar={<MySidebar />}>
      {children}
    </SidebarLayout>
  )
}
```

**Step 3:** Create pages
```typescript
// src/app/[locale]/(site)/my-page/page.tsx
// src/app/[locale]/(site)/my-page/sub1/page.tsx
// etc.
```

✅ Done! Sidebar automatically included.

---

### 4. Create a New Feature Component

**Directory structure:**
```
src/components/my-feature/
├── my-feature-card.tsx
├── my-feature-list.tsx
├── my-feature-form.tsx
└── index.ts
```

**Example:**
```typescript
// src/components/my-feature/my-feature-card.tsx
interface MyFeatureCardProps {
  title: string
  description: string
}

export function MyFeatureCard({ title, description }: MyFeatureCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
```

**Export from index:**
```typescript
// src/components/my-feature/index.ts
export { MyFeatureCard } from './my-feature-card'
export { MyFeatureList } from './my-feature-list'
export { MyFeatureForm } from './my-feature-form'
```

**Use anywhere:**
```typescript
import { MyFeatureCard } from "@/components/my-feature"

export function MyPage() {
  return <MyFeatureCard title="Hello" description="World" />
}
```

---

### 5. Use Shared Components

**Available shared components:**
```typescript
import { Container, Heading, ErrorBoundary } from "@/components/shared"

export function MyPage() {
  return (
    <ErrorBoundary>
      <Container>
        <Heading 
          title="My Page"
          subtitle="Subtitle here"
          center
        />
        {/* content */}
      </Container>
    </ErrorBoundary>
  )
}
```

---

### 6. Add Server Actions

**Keep actions colocated with pages:**
```
src/app/[locale]/(protected)/my-page/
├── page.tsx          ← Page component
├── actions.ts        ← Server actions (colocated)
└── page.test.tsx     ← Tests
```

**Example:**
```typescript
// src/app/[locale]/(protected)/my-page/actions.ts
'use server'

export async function myAction(formData: FormData) {
  // Server-side logic
  return { success: true }
}
```

**Use in page:**
```typescript
// src/app/[locale]/(protected)/my-page/page.tsx
import { myAction } from './actions'

export default function MyPage() {
  return (
    <form action={myAction}>
      {/* form */}
    </form>
  )
}
```

---

## 📂 Import Paths Reference

### Layout Components
```typescript
import { PageLayout, SidebarLayout } from "@/components/layout"
import { Header, LanguageSwitcher, SignOutButton } from "@/components/layout/header"
import { AuthGate } from "@/components/auth/auth-gate"
```

### Feature Components
```typescript
import { DashboardSidebar, StatsCard } from "@/components/dashboard"
import { AdminSidebar, UserTable } from "@/components/admin/users"
import { UserProfileForm } from "@/components/profile"
import { AboutSidebar, KnowledgeSidebar } from "@/components/sidebars"
```

### Shared Components
```typescript
import { Container, Heading, ErrorBoundary } from "@/components/shared"
```

### UI Components
```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// ... etc
```

---

## ✅ Best Practices

### ✅ DO:
- ✅ Use `PageLayout` for all new pages
- ✅ Use `SidebarLayout` for pages with sidebars
- ✅ Put components in `src/components/`, not in routes
- ✅ Organize features in subdirectories
- ✅ Use index.ts for clean exports
- ✅ Keep actions colocated with pages
- ✅ Use `(site)` for public pages
- ✅ Use `(protected)` for user-only pages

### ❌ DON'T:
- ❌ Don't create components in route directories
- ❌ Don't import from old `(public)` or `(private)` (renamed!)
- ❌ Don't use `BaseLayout` directly (use `PageLayout`)
- ❌ Don't put layout logic in pages
- ❌ Don't scatter components across root level
- ❌ Don't duplicate sidebar code (use `SidebarLayout`)

---

## 🔍 File Location Cheat Sheet

```
Need a...                          Location
─────────────────────────────────────────────────
Public page                        (site)/
Protected page                     (protected)/
Auth page (login/register)         (auth)/
Page component                     components/[feature]/
Sidebar component                  components/sidebars/
Shared utility component           components/shared/
Layout wrapper                     components/layout/
Server action                      [page-route]/actions.ts
Hook                               hooks/
Utility function                   lib/ or utils/
Type definition                    types/ or types in file
```

---

## 🚀 Quick Commands

```bash
# Build locally
pnpm build

# Run dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Format code
pnpm format

# Lint
pnpm lint
```

---

## 📞 Questions?

1. **Where do I put X?** → Check "File Location Cheat Sheet" above
2. **How do I add Y?** → Check "Common Tasks" section above
3. **Import path not working?** → Check "Import Paths Reference" above
4. **Need a component example?** → Look in `src/components/` for similar patterns

---

**TL;DR - The Three Rules**

1. 📍 **Pages go in `(site)` or `(protected)` folders**
2. 📦 **Components go in `src/components/` by feature**
3. 🔗 **Use `PageLayout` or `SidebarLayout` wrappers**

That's it! Everything else flows from there. 🎉

---

**Last Updated**: November 17, 2025  
**Status**: ✅ Ready to use
