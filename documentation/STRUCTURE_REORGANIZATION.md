# App Structure Reorganization Plan

## Current Issues
- Root `page.tsx` only redirects to `/landing`
- Many top-level directories (eksploro, rreth-nesh, koalicioni, etc.) - unclear if public or private
- Auth pages are in `/auth/kycu`, `/auth/regjistrohu` instead of conventional `/login`, `/register`
- No clear separation between public, private, and auth routes

## Proposed New Structure

```
src/app/
├── page.tsx                          ← Root (redirects to /home)
├── (public)/                         ← Route group for public pages
│   ├── layout.tsx                   ← Shared public layout
│   ├── home/
│   │   └── page.tsx                 ← Hero/landing page (moved from /landing)
│   ├── about/                        ← About section
│   │   ├── page.tsx                 ← Main about (from /rreth-nesh)
│   │   ├── mission/page.tsx         ← Mission (from /misioni)
│   │   ├── coalition/page.tsx       ← Coalition (from /koalicioni)
│   │   └── values/page.tsx          ← Values/Team
│   ├── explore/                      ← Browse section
│   │   ├── page.tsx                 ← Explore main (from /eksploro)
│   │   ├── opportunities/page.tsx   ← From /drejtoria
│   │   ├── marketplace/page.tsx     ← From /tregu
│   │   └── knowledge/page.tsx       ← From /qendra-e-dijes
│   ├── partners/page.tsx            ← From /partnere
│   ├── contact/page.tsx             ← From /kontakti
│   ├── help/page.tsx                ← From /ndihme
│   ├── faq/page.tsx                 ← From /faq
│   └── legal/
│       └── terms/page.tsx           ← From /kushtet-e-perdorimit
│
├── (auth)/                           ← Route group for auth pages
│   ├── layout.tsx                   ← Auth-specific layout
│   ├── login/page.tsx               ← From /auth/kycu
│   ├── register/page.tsx            ← From /auth/regjistrohu
│   ├── success/page.tsx             ← From /auth/sukses
│   └── callback/page.tsx            ← OAuth callback
│
├── (private)/                        ← Route group for protected pages
│   ├── layout.tsx                   ← Protected layout (middleware checks)
│   ├── dashboard/page.tsx           ← Main dashboard
│   ├── profile/page.tsx             ← From /profili
│   └── admin/                        ← Admin section
│       ├── page.tsx
│       ├── users/page.tsx
│       ├── organizations/page.tsx
│       ├── listings/page.tsx
│       └── articles/page.tsx
│
├── api/                              ← API routes (unchanged)
├── components/                       ← Global components
└── debug/                            ← Debug pages (remove in production)
```

## Benefits of This Structure

✅ **Clear Organization**: (public), (auth), (private) route groups make intent obvious
✅ **Better Naming**: `/home` instead of `/landing`, `/login` instead of `/auth/kycu`
✅ **Scalability**: Easy to add more sections (e.g., blog, docs, etc.)
✅ **SEO**: More semantic URL structure
✅ **Convention**: Follows Next.js 13+ route groups best practices
✅ **Middleware-Ready**: Easy to apply different layouts/protections per route group

## Migration Path

### Phase 1: Create New Structure (no breaking changes)
- Create (public), (auth), (private) folders with layouts
- Create new page.tsx files in each location
- Keep old routes temporarily

### Phase 2: Copy Content
- Copy content from old pages to new pages
- Update imports/references

### Phase 3: Update Links
- Update all internal links to use new routes
- Update navigation components
- Update middleware redirects

### Phase 4: Remove Old Routes
- Delete old directories once verified
- Clean up redirects

## Route Mapping Reference

| Old Route | New Route | Group | Type |
|-----------|-----------|-------|------|
| `/landing` | `/home` | (public) | Hero page |
| `/rreth-nesh` | `/about` | (public) | Main about |
| `/misioni` | `/about/mission` | (public) | Mission |
| `/koalicioni` | `/about/coalition` | (public) | Coalition |
| `/eksploro` | `/explore` | (public) | Explore main |
| `/drejtoria` | `/explore/opportunities` | (public) | Directory |
| `/tregu` | `/explore/marketplace` | (public) | Marketplace |
| `/qendra-e-dijes` | `/explore/knowledge` | (public) | Knowledge hub |
| `/partnere` | `/partners` | (public) | Partners |
| `/kontakti` | `/contact` | (public) | Contact |
| `/ndihme` | `/help` | (public) | Help |
| `/faq` | `/faq` | (public) | FAQ |
| `/kushtet-e-perdorimit` | `/legal/terms` | (public) | Legal |
| `/auth/kycu` | `/login` | (auth) | Login |
| `/auth/regjistrohu` | `/register` | (auth) | Register |
| `/auth/sukses` | `/success` | (auth) | Success |
| `/auth/callback` | `/callback` | (auth) | OAuth callback |
| `/dashboard` | `/dashboard` | (private) | Dashboard |
| `/profili` | `/profile` | (private) | User profile |
| `/admin` | `/admin` | (private) | Admin |

## Implementation Notes

1. **Route Groups** are invisible in URLs - users see `/about`, not `/(public)/about`
2. Each route group can have its own `layout.tsx` with different styling/behavior
3. The (private) layout can include middleware checks to redirect unauthenticated users
4. This follows the Next.js 13+ App Router best practices (Vercel's own documentation)

## SEO Impact

Current URLs (less semantic):
- `/rreth-nesh` (Albanian, hard to guess)
- `/eksploro` (Albanian, unclear)
- `/auth/kycu` (not RESTful)

New URLs (more semantic):
- `/about` (universal, SEO-friendly)
- `/explore` (clearer intent)
- `/login` (standard convention)

This makes it easier for:
- New developers to understand the app
- Search engines to crawl
- Users to share links
- Maintaining consistency across locales (if you add multi-language support later)
