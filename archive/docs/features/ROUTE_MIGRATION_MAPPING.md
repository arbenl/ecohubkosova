# Route Migration Mapping

This document maps old routes to new routes after the restructuring.

## Public Routes (Public Accessible)

| Old Route               | New Route                  | Description           |
| ----------------------- | -------------------------- | --------------------- |
| `/landing`              | `/home`                    | Homepage/Landing page |
| `/rreth-nesh`           | `/about`                   | About us              |
| `/misioni`              | `/about/mission`           | Mission page          |
| `/koalicioni`           | `/about/coalition`         | Coalition page        |
| `/drejtoria`            | `/about/governance`        | Governance/Management |
| `/kush-jemi`            | `/about/vision`            | Who we are/Vision     |
| `/eksploro`             | `/explore`                 | Explore opportunities |
| `/qendra-e-dijes`       | `/knowledge`               | Knowledge base        |
| `/qendra-e-dijes/[id]`  | `/knowledge/articles/[id]` | Knowledge article     |
| `/partnere`             | `/partners`                | Partners page         |
| `/kontakti`             | `/contact`                 | Contact page          |
| `/ndihme`               | `/help`                    | Help/FAQ section      |
| `/faq`                  | `/faq`                     | FAQ page              |
| `/tregu`                | `/marketplace`             | Marketplace           |
| `/kushtet-e-perdorimit` | `/legal/terms`             | Terms of use          |

## Auth Routes (Centered Layout)

| Old Route           | New Route   | Description          |
| ------------------- | ----------- | -------------------- |
| `/auth/kycu`        | `/login`    | Login page           |
| `/auth/regjistrohu` | `/register` | Registration page    |
| `/auth/sukses`      | `/success`  | Registration success |

## Private Routes (Protected/Authenticated)

| Old Route    | New Route    | Description    |
| ------------ | ------------ | -------------- |
| `/profili`   | `/profile`   | User profile   |
| `/dashboard` | `/dashboard` | User dashboard |
| `/admin`     | `/admin`     | Admin panel    |

## Implementation Notes

### Route Groups Used

- **(public)/** - Public pages with BaseLayout and navigation
- **(auth)/** - Authentication flows with centered layout
- **(private)/** - Protected pages with authentication guard

### Layout Files Created

- `(public)/layout.tsx` - Wraps with BaseLayout
- `(public)/about/layout.tsx` - About section layout
- `(public)/knowledge/layout.tsx` - Knowledge section layout
- `(public)/legal/layout.tsx` - Legal section layout
- `(auth)/layout.tsx` - Centered authentication layout
- `(private)/layout.tsx` - Protected route with auth guard

### Remaining Tasks

1. ✅ Copy all page files to new locations
2. ⏳ Update internal links in components
3. ⏳ Update middleware.ts with new routes
4. ⏳ Update vercel.json redirects for old routes
5. ⏳ Test all routes in dev environment
6. ⏳ Delete old directories (keeping for backup first)
7. ⏳ Commit changes to git
