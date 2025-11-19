# App Structure Reorganization - Implementation Guide

## Quick Start

Your app has grown with many top-level routes. Reorganizing them into **route groups** will make the codebase:
- ✅ More maintainable
- ✅ More scalable
- ✅ Easier for new developers to understand
- ✅ Better for SEO
- ✅ More professional URLs

## What Are Route Groups?

Route groups in Next.js use parentheses: `(groupName)/` and:
- **Don't affect URLs** - users still see `/home` not `/(public)/home`
- **Can have separate layouts** - different styling/behavior per group
- **Organize logically** - public, auth, private pages clearly separated

## Step-by-Step Implementation

### Step 1: Create Route Group Structure (5 minutes)

Create three route group directories:

```bash
mkdir -p src/app/(public)/{about,explore,legal,components}
mkdir -p src/app/(auth)
mkdir -p src/app/(private)/admin
mkdir -p src/app/(public)/home
mkdir -p src/app/(public)/explore/{opportunities,marketplace,knowledge}
mkdir -p src/app/(public)/about/{mission,coalition}
```

### Step 2: Create Layout Files (5 minutes)

**src/app/(public)/layout.tsx**
```tsx
import { BaseLayout } from "@/components/base-layout"
import type { ReactNode } from "react"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>
}
```

**src/app/(auth)/layout.tsx**
```tsx
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
```

**src/app/(private)/layout.tsx**
```tsx
import { BaseLayout } from "@/components/base-layout"
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/supabase-server"

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const { user } = await getServerUser()
  
  if (!user) {
    redirect("/login")
  }

  return <BaseLayout>{children}</BaseLayout>
}
```

### Step 3: Move Pages (10 minutes)

Create new pages in the appropriate route groups:

**src/app/(public)/home/page.tsx**
```tsx
// Copy content from src/app/landing/page.tsx
// Update any relative imports if needed
```

**src/app/(public)/about/page.tsx**
```tsx
// Copy content from src/app/rreth-nesh/page.tsx
```

**src/app/(public)/explore/page.tsx**
```tsx
// Copy content from src/app/eksploro/page.tsx
```

**src/app/(auth)/login/page.tsx**
```tsx
// Copy content from src/app/auth/kycu/page.tsx
```

**src/app/(auth)/register/page.tsx**
```tsx
// Copy content from src/app/auth/regjistrohu/page.tsx
```

**src/app/(private)/profile/page.tsx**
```tsx
// Copy content from src/app/(private)/profile/page.tsx (consolidated; previous profili route removed)
```

### Step 4: Update Links (15 minutes)

Use this find-and-replace guide:

**In all component and page files:**

```
Search: /landing        Replace: /home
Search: /rreth-nesh     Replace: /about
Search: /misioni        Replace: /about/mission
Search: /koalicioni     Replace: /about/coalition
Search: /eksploro       Replace: /explore
Search: /drejtoria      Replace: /explore/opportunities
Search: /tregu          Replace: /marketplace
Search: /qendra-e-dijes Replace: /knowledge
Search: /partnere       Replace: /partners
Search: /kontakti       Replace: /contact
Search: /ndihme         Replace: /help
Search: /faq            Replace: /faq
Search: /kushtet-e-perdorimit  Replace: /legal/terms
Search: /auth/kycu      Replace: /login
Search: /auth/regjistrohu Replace: /register
Search: /auth/sukses    Replace: /success
Search: /profili        Replace: /profile
```

### Step 5: Update Middleware (10 minutes)

**src/middleware.ts** - Update redirects:

```typescript
// Before
if (!session && pathname.startsWith("/profili")) {
  return NextResponse.redirect(new URL("/auth/kycu", request.url))
}

// After
if (!session && pathname.startsWith("/profile")) {
  return NextResponse.redirect(new URL("/login", request.url))
}
```

### Step 6: Test Everything (10 minutes)

```bash
npm run dev
```

Test these routes:
- `/home` - Public hero page
- `/about` - About page
- `/about/mission` - Mission
- `/explore` - Explore page
- `/login` - Login
- `/register` - Register
- `/dashboard` - Dashboard (protected)
- `/profile` - Profile (protected)
- Old routes should still work temporarily via redirects

### Step 7: Setup Redirects from Old URLs (5 minutes)

Create redirect page for old routes to avoid breaking existing links:

**src/app/landing/page.tsx** (create if not exists)
```tsx
import { redirect } from "next/navigation"

export default function OldLanding() {
  redirect("/home")
}
```

Repeat for all old routes:
- `/rreth-nesh` → `/about`
- `/auth/kycu` → `/login`
- etc.

### Step 8: Cleanup (5 minutes after confirming everything works)

Once verified that:
- ✅ All new routes work
- ✅ All links updated
- ✅ Build succeeds
- ✅ Old redirect pages work

Then delete old directories:
```bash
rm -rf src/app/landing
rm -rf src/app/auth/kycu
rm -rf src/app/auth/regjistrohu
rm -rf src/app/rreth-nesh
# ... etc
```

## Complete Route Mapping

| Old URL | New URL | Location |
|---------|---------|----------|
| `/` | `/home` | `(public)/home/page.tsx` |
| `/landing` | `/home` | Redirect or delete |
| `/about` | `/about` | `(public)/about/page.tsx` |
| `/rreth-nesh` | `/about` | Redirect to `/about` |
| `/misioni` | `/about/mission` | `(public)/about/mission/page.tsx` |
| `/koalicioni` | `/about/coalition` | `(public)/about/coalition/page.tsx` |
| `/explore` | `/explore` | `(public)/explore/page.tsx` |
| `/eksploro` | `/explore` | Redirect to `/explore` |
| `/drejtoria` | `/explore/opportunities` | `(public)/explore/opportunities/page.tsx` |
| `/tregu` | `/explore/marketplace` | `(public)/explore/marketplace/page.tsx` |
| `/qendra-e-dijes` | `/knowledge` | `(public)/knowledge/page.tsx` |
| `/partners` | `/partners` | `(public)/partners/page.tsx` |
| `/partnere` | `/partners` | Redirect to `/partners` |
| `/contact` | `/contact` | `(public)/contact/page.tsx` |
| `/kontakti` | `/contact` | Redirect to `/contact` |
| `/help` | `/help` | `(public)/help/page.tsx` |
| `/ndihme` | `/help` | Redirect to `/help` |
| `/faq` | `/faq` | `(public)/faq/page.tsx` |
| `/legal/terms` | `/legal/terms` | `(public)/legal/terms/page.tsx` |
| `/kushtet-e-perdorimit` | `/legal/terms` | Redirect to `/legal/terms` |
| `/login` | `/login` | `(auth)/login/page.tsx` |
| `/auth/kycu` | `/login` | Redirect to `/login` |
| `/register` | `/register` | `(auth)/register/page.tsx` |
| `/auth/regjistrohu` | `/register` | Redirect to `/register` |
| `/success` | `/success` | `(auth)/success/page.tsx` |
| `/auth/sukses` | `/success` | Redirect to `/success` |
| `/callback` | `/callback` | `(auth)/callback/page.tsx` |
| `/auth/callback` | `/callback` | Redirect to `/callback` |
| `/dashboard` | `/dashboard` | `(private)/dashboard/page.tsx` |
| `/profile` | `/profile` | `(private)/profile/page.tsx` |
| `/profili` | `/profile` | Redirect to `/profile` |
| `/admin` | `/admin` | `(private)/admin/page.tsx` |

## Benefits After Reorganization

✅ **Clearer Intent** - `(public)`, `(auth)`, `(private)` groups make purpose obvious
✅ **Better SEO** - `/about`, `/login` are more semantic than `/rreth-nesh`, `/auth/kycu`
✅ **Easier Navigation** - URL structure matches mental model
✅ **Scalability** - Easy to add new sections without cluttering root
✅ **Developer Experience** - New team members understand structure immediately
✅ **Professional URLs** - Can share links without explaining what each page means

## Timeline

- **Small refactor (no breaking changes)**: 1 hour total
- **Test thoroughly**: 30 minutes
- **Deploy with redirects**: Safe to deploy
- **Cleanup old routes**: Can do later or gradually

## Before and After

### Before
```
User types: /rreth-nesh
Response: "What is this page?"

User types: /auth/kycu
Response: "Why isn't this just /login?"

User types: /qendra-e-dijes
Response: "This should redirect to /knowledge"
```

### After
```
User types: /about
Response: "Perfect, about page"

User types: /login
Response: "Obviously the login page"

User types: /explore/knowledge
Response: "Makes sense, knowledge hub in explore section"
```

## Recommendation

**Start with a smaller migration:**

1. Create (public), (auth), (private) route groups
2. Move just the top 5 most important pages
3. Test thoroughly
4. Deploy
5. Then gradually move remaining pages

This reduces risk and gives you time to validate the pattern before full restructuring.
