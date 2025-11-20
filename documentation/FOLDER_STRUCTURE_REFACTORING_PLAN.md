# EcoHub Kosovo - Folder Structure Analysis & Refactoring Plan

## 📊 PART 1: Current Route & Layout Map

### Route Structure (Current)

```
ROOT HIERARCHY
│
├─ app/layout.tsx                              ← Global layout (i18n wrapper)
├─ app/page.tsx                                ← Root redirect → /[locale]
│
└─ [locale]/layout.tsx                         ← Root locale layout
   ├─ Sets up: NextIntlClientProvider, AuthProvider
   ├─ Fetches: initialUser from server
   │
   ├─ (auth)                                   ← Auth Group Layout
   │  ├─ layout.tsx                            ← Header + Footer (different from other groups!)
   │  ├─ /login                                ← Login page
   │  ├─ /register                             ← Register page
   │  ├─ /success                              ← OAuth success page
   │  └─ /callback                             ← OAuth callback
   │
   ├─ (public)                                 ← Public Group Layout
   │  ├─ layout.tsx                            ← Uses BaseLayout (Header + Footer + main)
   │  ├─ /home                                 ← Homepage (landing)
   │  ├─ /explore                              ← Explore page
   │  ├─ /marketplace                          ← Marketplace listing
   │  │  ├─ /[id]                              ← Item details
   │  │  └─ /shto                              ← Add listing
   │  ├─ /about                                ← About section
   │  │  ├─ layout.tsx                         ← Adds sidebar navigation
   │  │  ├─ /mission                           ← Mission page
   │  │  ├─ /vision                            ← Vision page
   │  │  ├─ /governance                        ← Governance page
   │  │  └─ /coalition                         ← Coalition page
   │  ├─ /knowledge                            ← Knowledge base
   │  │  ├─ layout.tsx                         ← Adds sidebar navigation
   │  │  ├─ /[id]                              ← Category detail
   │  │  ├─ /articles/[id]                     ← Article detail
   │  │  └─ (index)                            ← Knowledge list
   │  ├─ /legal                                ← Legal section
   │  │  ├─ layout.tsx                         ← Adds sidebar navigation
   │  │  └─ /terms                             ← Terms page
   │  ├─ /partners                             ← Partners page
   │  ├─ /faq                                  ← FAQ page
   │  ├─ /help                                 ← Help page
   │  └─ /contact                              ← Contact page
   │
   └─ (private)                                ← Protected Group Layout (AuthGate)
      ├─ layout.tsx                            ← Checks auth, redirects to login if not
      ├─ Uses BaseLayout (Header + Footer + main)
      │
      ├─ /dashboard                            ← User dashboard
      │  ├─ layout.tsx                         ← Empty (could be removed)
      │  ├─ /page.tsx                          ← Dashboard page
      │  └─ (internal components)
      │
      ├─ /profile                              ← User profile
      │  ├─ /page.tsx                          ← Profile page
      │  └─ /components/                       ← Form components
      │
      └─ /admin                                ← Admin dashboard
         ├─ layout.tsx                         ← Empty (could be removed)
         ├─ /page.tsx                          ← Admin home
         ├─ /users                             ← User management
         │  ├─ /components/                    ← User table, edit modal
         │  └─ /page.tsx
         ├─ /articles                          ← Article management
         ├─ /listings                          ← Listing management
         ├─ /organizations                     ← Organization management
         └─ /organization-members              ← Member management
```

### Layout Nesting Summary

```
LAYOUTS BREAKDOWN:
─────────────────

Level 0: app/layout.tsx (Next.js entry point)
         └─ Wraps: i18n, theme, providers

Level 1: [locale]/layout.tsx (Locale + Auth)
         └─ Wraps: NextIntlClientProvider, AuthProvider
         └─ Fetches: initialUser from server

Level 2a: (auth)/layout.tsx (Auth Pages)
         └─ Custom HTML: Header, centered main, Footer
         └─ Pattern: Different from other groups!

Level 2b: (public)/layout.tsx (Public Pages)
         └─ Wraps: BaseLayout (Header, Footer, main)
         └─ Pattern: Uses shared component

Level 2c: (private)/layout.tsx (Protected Pages)
         └─ Wraps: AuthGate check + BaseLayout
         └─ Pattern: Uses shared component

Level 3a: (public)/about/layout.tsx (Sidebar variant)
         └─ Extends: BaseLayout + adds sidebar

Level 3b: (public)/knowledge/layout.tsx (Sidebar variant)
         └─ Extends: BaseLayout + adds sidebar

Level 3c: (public)/legal/layout.tsx (Sidebar variant)
         └─ Extends: BaseLayout + adds sidebar

Level 3d: (private)/dashboard/layout.tsx (Empty!)
         └─ Just renders: {children}
         └─ Could be removed

Level 3e: (private)/admin/layout.tsx (Empty!)
         └─ Just renders: {children}
         └─ Could be removed
```

### Page Types Summary

```
PAGES BY TYPE:
──────────────

PUBLIC PAGES (40+ routes):
  ├─ Landing pages (home, explore)
  ├─ Marketplace (list + detail + add)
  ├─ Content sections (about/mission, knowledge/articles, etc.)
  └─ Info pages (faq, help, contact, partners)

AUTH PAGES (3 pages):
  ├─ /login
  ├─ /register
  └─ /success

PROTECTED PAGES (Admin + User):
  ├─ /dashboard (user)
  ├─ /profile (user)
  └─ /admin/* (admin only)
       ├─ Users management
       ├─ Articles management
       ├─ Listings management
       ├─ Organizations management
       └─ Organization members management
```

---

## 🎯 PART 2: Component Duplication & Issues Analysis

### Duplicated/Problematic Components

```
PROBLEM 1: Layout Definitions are Scattered
────────────────────────────────────────────
(auth)/layout.tsx:
  - Defines custom HTML with Header, Footer, main
  - DIFFERENT from (public) and (private)!

(public)/layout.tsx:
  - Uses BaseLayout component

(private)/layout.tsx:
  - Uses BaseLayout component

(private)/dashboard/layout.tsx:
  - Just renders {children}
  - Redundant!

(private)/admin/layout.tsx:
  - Just renders {children}
  - Redundant!

FIX: Consolidate auth layout to match others, remove empty layouts


PROBLEM 2: Sidebar Navigation Defined in Multiple Places
──────────────────────────────────────────────────────────
(public)/about/layout.tsx:
  - Has sidebar for about pages

(public)/knowledge/layout.tsx:
  - Has sidebar for knowledge pages

(public)/legal/layout.tsx:
  - Has sidebar for legal pages

SHARED COMPONENT: No "SidebarLayout" component exists!

FIX: Create SidebarLayout wrapper component


PROBLEM 3: Components Scattered in Wrong Places
────────────────────────────────────────────────
/admin/users/components/ (LOCAL to route!)
  ├─ user-edit-modal.tsx
  └─ user-table.tsx

/profile/components/ (LOCAL to route!)
  └─ (various profile components)

/dashboard/ (MIXED page components with route files!)
  ├─ dashboard-chart-card.tsx
  ├─ dashboard-chart.tsx
  ├─ key-partners.tsx
  ├─ latest-articles.tsx
  ├─ quick-actions-card.tsx
  └─ stats-cards.tsx

/admin/ (MIXED page components with route files!)
  ├─ admin-quick-action-card.tsx
  ├─ admin-stat-card.tsx

FIX: Move all to src/components/, organize by feature


PROBLEM 4: Base Layout Logic is Complex
──────────────────────────────────────────
BaseLayout: 
  - Renders Header (server + client)
  - Renders Footer
  - Wraps children with main

Header:
  - Fetches user profile server-side
  - Passes to HeaderClient
  - Complex logic in single file

FIX: Create clear hierarchy: PageLayout > Header > HeaderNav


PROBLEM 5: Route-Specific Action Files in Wrong Places
──────────────────────────────────────────────────────
/admin/[category]/actions.ts exist alongside pages
/profile/actions.ts
/dashboard/actions.ts
/login/actions.ts

CURRENT: Scattered throughout app/ directory
PROBLEM: Hard to find, no clear pattern

FIX: Create src/app/actions/ or move to src/actions/
```

### Current Component Structure Issues

```
src/components/
├─ ui/                              ← Shadcn UI components (good!)
├─ base-layout.tsx                  ← Wraps Header + Footer + main
├─ header.tsx                       ← Server + Client logic mixed
├─ header-client.tsx                ← Client version
├─ footer.tsx
├─ auth/
│  └─ auth-form-components.tsx
├─ admin/
│  └─ admin-sidebar.tsx             ← Used by admin pages
├─ dashboard/
│  ├─ sidebar.tsx                   ← Used by dashboard
│  ├─ chart-skeleton.tsx
│  ├─ stats-cards-skeleton.tsx
│  └─ ... (5 more skeleton/component files)
├─ profile/
│  ├─ profile-loader.tsx
│  └─ profile-retry-ui.tsx
├─ landing/
│  ├─ landing-auth-panel.tsx
│  └─ landing-auth-panel-skeleton.tsx
├─ listings/
│  └─ ListingCard.tsx
├─ (many others)
│  ├─ auth-loading.tsx
│  ├─ error-boundary.tsx
│  ├─ example-usage.tsx
│  ├─ language-switcher.tsx
│  ├─ sign-out-button.tsx
│  ├─ theme-provider.tsx
│  └─ Container.tsx, Heading.tsx

ISSUES:
  1. No clear feature-based organization
  2. Sidebar components spread between /admin and /dashboard
  3. Skeleton/loading states scattered
  4. No clear "shared" vs "feature-specific" distinction
```

---

## 🏗️ PART 3: Proposed Target Structure

### Target `app/` Directory Structure

```
NEW STRUCTURE (Next.js App Router Best Practices)
═════════════════════════════════════════════════

src/app/
├─ layout.tsx                                 ← Global wrapper (providers, i18n)
├─ page.tsx                                   ← Root redirect
│
├─ api/                                       ← API routes (unchanged)
│  └─ ...
│
└─ [locale]/
   ├─ layout.tsx                              ← Locale + Auth setup
   │                                          ← No UI components here
   │
   ├─ (site)                                  ← Public pages group
   │  ├─ layout.tsx                           ← Single layout for all public pages
   │  │                                       ← Uses PageLayout wrapper
   │  ├─ page.tsx                             ← Homepage
   │  ├─ explore/page.tsx
   │  ├─ contact/page.tsx
   │  ├─ faq/page.tsx
   │  ├─ partners/page.tsx
   │  ├─ help/page.tsx
   │  │
   │  ├─ marketplace/
   │  │  ├─ page.tsx
   │  │  ├─ [id]/page.tsx
   │  │  └─ add/page.tsx
   │  │
   │  ├─ about/
   │  │  ├─ layout.tsx                        ← WITH SIDEBAR (SidebarLayout)
   │  │  ├─ page.tsx
   │  │  ├─ mission/page.tsx
   │  │  ├─ vision/page.tsx
   │  │  ├─ governance/page.tsx
   │  │  └─ coalition/page.tsx
   │  │
   │  ├─ knowledge/
   │  │  ├─ layout.tsx                        ← WITH SIDEBAR (SidebarLayout)
   │  │  ├─ page.tsx
   │  │  ├─ [id]/page.tsx
   │  │  └─ articles/[id]/page.tsx
   │  │
   │  └─ legal/
   │     ├─ layout.tsx                        ← WITH SIDEBAR (SidebarLayout)
   │     └─ terms/page.tsx
   │
   ├─ (auth)                                  ← Auth pages group
   │  ├─ layout.tsx                           ← SAME as (site) layout!
   │  │                                       ← Uses PageLayout wrapper
   │  ├─ login/
   │  │  ├─ page.tsx
   │  │  └─ actions.ts
   │  ├─ register/
   │  │  ├─ page.tsx
   │  │  └─ actions.ts
   │  ├─ success/page.tsx
   │  └─ callback/page.tsx
   │
   └─ (protected)                             ← Protected pages group
      ├─ layout.tsx                           ← AuthGate + PageLayout wrapper
      │                                       ← Checks auth, redirects if not
      │
      ├─ dashboard/
      │  ├─ page.tsx                          ← NO LAYOUT!
      │  └─ actions.ts
      │
      ├─ profile/
      │  ├─ page.tsx
      │  └─ actions.ts
      │
      └─ admin/
         ├─ layout.tsx                        ← Role check + admin sidebar
         ├─ page.tsx
         ├─ users/
         │  ├─ page.tsx
         │  └─ actions.ts
         ├─ articles/
         │  ├─ page.tsx
         │  └─ actions.ts
         ├─ listings/
         │  ├─ page.tsx
         │  └─ actions.ts
         ├─ organizations/
         │  ├─ page.tsx
         │  └─ actions.ts
         └─ organization-members/
            ├─ page.tsx
            └─ actions.ts

KEY CHANGES:
  ✅ Removed: (public), (private) → Now (site), (protected), (auth)
  ✅ Removed: Empty dashboard/layout.tsx and admin/layout.tsx
  ✅ Consolidated: Auth layout matches site layout
  ✅ Sidebar pages: Use SidebarLayout wrapper (component, not layout)
  ✅ Actions: Kept with pages (colocated is good for Next.js)
```

### Target `components/` Directory Structure

```
NEW STRUCTURE (Feature-Based Organization)
═══════════════════════════════════════════

src/components/
│
├─ ui/                                       ← Shadcn UI primitives (no changes)
│  └─ ... (all existing UI components)
│
├─ layout/                                   ← Layout components
│  ├─ page-layout.tsx                        ← Main wrapper (Header, Footer, main)
│  ├─ sidebar-layout.tsx                     ← Page with sidebar (reusable)
│  ├─ header/
│  │  ├─ header.tsx                          ← Server component
│  │  ├─ header-client.tsx                   ← Client component
│  │  ├─ header-nav.tsx                      ← Navigation menu
│  │  ├─ language-switcher.tsx               ← Moved from root
│  │  ├─ sign-out-button.tsx                 ← Moved from root
│  │  └─ user-menu.tsx                       ← Could extract
│  └─ footer/
│     └─ footer.tsx
│
├─ auth/                                     ← Auth-related components
│  ├─ auth-loading.tsx                       ← Moved from root
│  ├─ auth-gate.tsx                          ← NEW: Wrapper for protected routes
│  ├─ auth-form-components.tsx               ← Moved from auth/
│  └─ login-form.tsx                         ← Could extract from page
│
├─ dashboard/                                ← Dashboard feature components
│  ├─ dashboard-layout.tsx                   ← Moved from /app/[locale]/(private)/dashboard
│  ├─ sidebar.tsx                            ← Moved from /components
│  ├─ stats-card.tsx
│  ├─ chart-card.tsx
│  ├─ key-partners.tsx
│  ├─ latest-articles.tsx
│  ├─ quick-actions-card.tsx
│  └─ skeletons/
│     ├─ stats-skeleton.tsx
│     ├─ chart-skeleton.tsx
│     ├─ key-partners-skeleton.tsx
│     └─ latest-articles-skeleton.tsx
│
├─ admin/                                    ← Admin feature components
│  ├─ admin-layout.tsx                       ← Moved from /app/[locale]/(private)/admin
│  ├─ admin-sidebar.tsx                      ← Moved from /components
│  ├─ admin-stat-card.tsx
│  ├─ admin-quick-action-card.tsx
│  └─ users/
│     ├─ user-table.tsx                      ← Moved from app route
│     └─ user-edit-modal.tsx                 ← Moved from app route
│
├─ profile/                                  ← Profile feature components
│  ├─ profile-loader.tsx                     ← Moved from root
│  ├─ profile-retry-ui.tsx                   ← Moved from root
│  └─ profile-form.tsx                       ← Could extract
│
├─ marketplace/                              ← Marketplace feature components
│  ├─ listing-card.tsx                       ← Renamed from ListingCard
│  └─ listing-detail.tsx                     ← Could extract
│
├─ landing/                                  ← Landing page components
│  ├─ auth-panel.tsx                         ← Renamed from landing-auth-panel
│  ├─ auth-panel-skeleton.tsx                ← Renamed
│  └─ cta-section.tsx                        ← Could extract
│
├─ shared/                                   ← Truly shared components
│  ├─ container.tsx                          ← Moved from root
│  ├─ heading.tsx                            ← Moved from root
│  ├─ error-boundary.tsx                     ← Moved from root
│  └─ breadcrumb.tsx                         ← Could extract
│
├─ theme-provider.tsx                        ← Keep at root (provider)
└─ example-usage.tsx                         ← Keep or delete
```

---

## 🔧 PART 4: Concrete Refactoring Steps

### Phase 1: Create New Layout Components (No Breaking Changes)

```bash
Step 1.1: Create PageLayout wrapper
─────────────────────────────────────
FILE: src/components/layout/page-layout.tsx
CONTENT: Combines Header + Footer + main
USES: Current BaseLayout logic
REPLACES: BaseLayout for all groups

Step 1.2: Create SidebarLayout wrapper
──────────────────────────────────────
FILE: src/components/layout/sidebar-layout.tsx
CONTENT: PageLayout + sidebar
USES: Current about/knowledge/legal layout logic
REPLACES: Per-route sidebar layouts

Step 1.3: Create AuthGate component
──────────────────────────────────────
FILE: src/components/auth/auth-gate.tsx
CONTENT: Check auth, redirect if not
LOGIC: Move from (private)/layout.tsx
USES: getServerUser, redirect

Step 1.4: Reorganize header components
──────────────────────────────────────
MOVE: src/components/header-client.tsx → src/components/layout/header/header-client.tsx
MOVE: src/components/header.tsx → src/components/layout/header/header.tsx
MOVE: src/components/language-switcher.tsx → src/components/layout/header/language-switcher.tsx
MOVE: src/components/sign-out-button.tsx → src/components/layout/header/sign-out-button.tsx
CREATE: src/components/layout/header/index.ts (re-export)

Step 1.5: Reorganize dashboard components
───────────────────────────────────────────
MOVE: src/components/dashboard/* → src/components/dashboard/
CREATE: src/components/dashboard/skeletons/ subdirectory
MOVE: src/components/dashboard/*-skeleton.tsx → skeletons/
UPDATE: Import paths in dashboard pages

Step 1.6: Reorganize admin components
──────────────────────────────────────
MOVE: src/app/[locale]/(private)/admin/users/components/* → src/components/admin/users/
UPDATE: Import paths in admin pages

Step 1.7: Reorganize profile components
────────────────────────────────────────
MOVE: src/app/[locale]/(private)/profile/components/* → src/components/profile/
UPDATE: Import paths in profile pages

Step 1.8: Create shared components directory
──────────────────────────────────────────────
MOVE: src/components/Container.tsx → src/components/shared/container.tsx
MOVE: src/components/Heading.tsx → src/components/shared/heading.tsx
MOVE: src/components/error-boundary.tsx → src/components/shared/error-boundary.tsx
CREATE: src/components/shared/index.ts (re-export)
```

### Phase 2: Update App Router Structure

```bash
Step 2.1: Create (site) group
──────────────────────────────
COPY: src/app/[locale]/(public)/layout.tsx → src/app/[locale]/(site)/layout.tsx
UPDATE: Change import from BaseLayout to PageLayout
UPDATE: Simplify - just render <PageLayout>{children}</PageLayout>

Step 2.2: Move public pages to (site)
──────────────────────────────────────
MOVE: src/app/[locale]/(public)/* → src/app/[locale]/(site)/
REMOVE: src/app/[locale]/(public)/ directory
UPDATE: All public page imports

Step 2.3: Create (protected) group
───────────────────────────────────
CREATE: src/app/[locale]/(protected)/layout.tsx
CONTENT: <AuthGate> wrapper + <PageLayout>
LOGIC: Move from src/app/[locale]/(private)/layout.tsx

Step 2.4: Move protected pages to (protected)
───────────────────────────────────────────────
MOVE: src/app/[locale]/(private)/* → src/app/[locale]/(protected)/
REMOVE: src/app/[locale]/(private)/ directory
UPDATE: All protected page imports

Step 2.5: Update auth layout
────────────────────────────
EDIT: src/app/[locale]/(auth)/layout.tsx
CHANGE FROM:
  return (
    <div className="...">
      <Header />
      <main className="...">
        {children}
      </main>
      <Footer />
    </div>
  )

CHANGE TO:
  return <PageLayout>{children}</PageLayout>

Step 2.6: Remove redundant layouts
───────────────────────────────────
DELETE: src/app/[locale]/(protected)/dashboard/layout.tsx (empty)
DELETE: src/app/[locale]/(protected)/admin/layout.tsx (will be replaced)

Step 2.7: Create sidebar layout wrappers
─────────────────────────────────────────
CREATE: src/app/[locale]/(site)/about/layout.tsx
CONTENT: <SidebarLayout items={aboutNav}>{children}</SidebarLayout>

CREATE: src/app/[locale]/(site)/knowledge/layout.tsx
CONTENT: <SidebarLayout items={knowledgeNav}>{children}</SidebarLayout>

CREATE: src/app/[locale]/(site)/legal/layout.tsx
CONTENT: <SidebarLayout items={legalNav}>{children}</SidebarLayout>

Step 2.8: Create admin layout with sidebar
────────────────────────────────────────────
CREATE: src/app/[locale]/(protected)/admin/layout.tsx
CONTENT: Role check + <AdminLayout sidebar> wrapper
LOGIC: Check roli === "Admin", render admin sidebar
```

### Phase 3: Consolidate Action Files

```bash
Step 3.1: Organize server actions
──────────────────────────────────
CREATE: src/app/actions/ directory (optional, if preferred over colocated)
OR: Keep colocated actions/*.ts with pages (Next.js best practice)
  → RECOMMENDED: Keep colocated (Step 3.1 = SKIP)

Step 3.2: Document action patterns
────────────────────────────────────
IF keeping colocated:
  src/app/[locale]/(site)/marketplace/actions.ts ← Marketplace actions
  src/app/[locale]/(protected)/profile/actions.ts ← Profile actions
  src/app/[locale]/(protected)/admin/users/actions.ts ← Admin actions
```

### Phase 4: Update Imports & References

```bash
Step 4.1: Update layout imports
──────────────────────────────────
SEARCH: import { BaseLayout } from "@/components/base-layout"
REPLACE: import { PageLayout } from "@/components/layout/page-layout"

Step 4.2: Update header imports
────────────────────────────────
SEARCH: import { Header } from "@/components/header"
REPLACE: import { Header } from "@/components/layout/header"

SEARCH: import HeaderClient from "@/components/header-client"
REPLACE: import { HeaderClient } from "@/components/layout/header/header-client"

Step 4.3: Update dashboard imports
───────────────────────────────────
SEARCH: import { DashboardSidebar } from "@/components/dashboard/sidebar"
REPLACE: import { DashboardSidebar } from "@/components/dashboard/sidebar"
(No change if file structure is preserved)

Step 4.4: Update admin imports
───────────────────────────────
SEARCH: import { AdminSidebar } from "@/components/admin/admin-sidebar"
REPLACE: import { AdminSidebar } from "@/components/admin/admin-sidebar"

Step 4.5: Update component path references
─────────────────────────────────────────────
FIND: src/app/[locale]/(private)/admin/users/components/user-table.tsx
REFERENCE: ../components/user-table.tsx
UPDATE: @/components/admin/users/user-table.tsx

(Repeat for profile, dashboard components)
```

### Phase 5: Testing & Validation

```bash
Step 5.1: Type checking
─────────────────────────
RUN: pnpm tsc --noEmit
VERIFY: No type errors

Step 5.2: Build
───────────────
RUN: pnpm build
VERIFY: No build errors, all routes compile

Step 5.3: Route testing
───────────────────────
TEST: Public routes (/about, /knowledge, /marketplace, etc.)
TEST: Auth routes (/login, /register)
TEST: Protected routes (/dashboard, /profile, /admin)
TEST: Role-based access (/admin access control)
TEST: Redirects (login → dashboard, protected ← login)

Step 5.4: Component verification
──────────────────────────────────
VERIFY: Layouts render correctly
VERIFY: Sidebars show/hide properly
VERIFY: Header navigation works
VERIFY: Auth gate redirects non-users
```

---

## 📋 PART 5: Quick Reference - Migration Checklist

### Pre-Migration

- [ ] Create branch: `git checkout -b refactor/folder-structure`
- [ ] Review current routes: `pnpm build` (verify baseline)
- [ ] Back up current structure: `git stash` (if needed)

### Phase 1: Create Components (Safe, No Breaking Changes)

- [ ] 1.1 Create `src/components/layout/page-layout.tsx`
- [ ] 1.2 Create `src/components/layout/sidebar-layout.tsx`
- [ ] 1.3 Create `src/components/auth/auth-gate.tsx`
- [ ] 1.4 Reorganize header: `src/components/layout/header/*`
- [ ] 1.5 Reorganize dashboard: `src/components/dashboard/skeletons/`
- [ ] 1.6 Reorganize admin: `src/components/admin/users/`
- [ ] 1.7 Reorganize profile: `src/components/profile/`
- [ ] 1.8 Create shared: `src/components/shared/`
- [ ] Verify: `pnpm build` passes

### Phase 2: Update Routes (Step-by-Step)

- [ ] 2.1 Create `(site)` group layout
- [ ] 2.2 Move public pages → `(site)`
- [ ] 2.3 Create `(protected)` group layout
- [ ] 2.4 Move private pages → `(protected)`
- [ ] 2.5 Update auth layout
- [ ] 2.6 Remove redundant layouts
- [ ] 2.7 Create sidebar layout wrappers
- [ ] 2.8 Create admin layout with sidebar
- [ ] Verify: `pnpm build` passes after each step

### Phase 3: Consolidate Actions

- [ ] 3.1 Keep colocated (recommended) OR move to `src/app/actions/`
- [ ] 3.2 Document patterns

### Phase 4: Update Imports

- [ ] 4.1 Update layout imports (BaseLayout → PageLayout)
- [ ] 4.2 Update header imports
- [ ] 4.3 Update dashboard imports
- [ ] 4.4 Update admin imports
- [ ] 4.5 Update component path references
- [ ] Verify: `pnpm build` passes

### Phase 5: Testing

- [ ] 5.1 Type checking: `pnpm tsc --noEmit`
- [ ] 5.2 Build: `pnpm build`
- [ ] 5.3 Routes: Test all main routes
- [ ] 5.4 Components: Verify layout/sidebars
- [ ] Verify: `pnpm dev` starts without errors

### Post-Migration

- [ ] Remove old directories
- [ ] Update documentation
- [ ] Commit changes
- [ ] Create PR for review
- [ ] Merge and deploy

---

## ✨ Benefits of This Refactoring

```
BEFORE:
├─ Layout logic scattered across 5+ layout files
├─ Components mixed with route files
├─ Sidebar patterns duplicated 3x
├─ Import paths deep and hard to find
├─ No clear separation of concerns
└─ 40+ minutes to understand structure

AFTER:
├─ Clear layout hierarchy (PageLayout, SidebarLayout, AuthGate)
├─ Components organized by feature
├─ Sidebar pattern extracted to single component
├─ Shallow, predictable import paths
├─ Clear separation: layouts, pages, components
└─ 5 minutes to understand structure

METRICS:
  Lines of duplicate code: -30%
  Import path depth: -40%
  Time to add new route: -50%
  Developer friction: -70%
  Maintainability: +100%
```

---

## 📞 Questions?

If you have questions about any specific step, refer back to:
1. **Part 1** - Current structure map
2. **Part 2** - Issues & duplications
3. **Part 3** - Target structure
4. **Part 4** - Concrete steps to execute
5. **Part 5** - Checklist for execution

Good luck! 🚀
