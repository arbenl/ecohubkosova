# Public Pages Hero Standardization – Quick Reference

**Completion Date**: November 24, 2025  
**Build Status**: ✅ 3/3 PASS (23.56s)

---

## The Four Heroes – At a Glance

| Page                  | Route                         | Variant    | Visual                          | Purpose                                    |
| --------------------- | ----------------------------- | ---------- | ------------------------------- | ------------------------------------------ |
| **Partners**          | `/[locale]/partners`          | `campaign` | 🟢 Strong emerald gradient      | **Recruitment**: Invite businesses to join |
| **How-It-Works**      | `/[locale]/how-it-works`      | `default`  | 🟢 Emerald gradient + checklist | **Explainer**: Show how EcoHub works       |
| **Eco-Organizations** | `/[locale]/eco-organizations` | `mint`     | 🌿 Soft emerald gradient        | **Directory**: Find recyclers & green orgs |
| **About-Us**          | `/[locale]/about-us`          | `centered` | 🌿 Soft emerald, centered       | **Story**: Learn about EcoHub's mission    |

---

## Component Signature

```typescript
<PublicPageHero
  namespace="partners"           // Namespace for i18n
  titleKey="page.title"          // Key to title string
  subtitleKey="page.subtitle"    // Key to subtitle string
  variant="campaign"             // "campaign" | "default" | "mint" | "centered"
  eyebrowKey="optional.badge"    // Optional small label
  actions={<CTA buttons>}        // Right side of left content
  children={<Stats or cards>}    // Right content slot (horizontal) or empty (centered)
/>
```

---

## Variants Explained

### 🔴 Campaign (Partners)

- **Background**: Strong gradient `from-emerald-600 via-emerald-500 to-teal-500`
- **Text**: White titles & emerald-50 subtitles
- **Layout**: Left content + right stats/badges
- **Vibe**: Bold, recruitment-focused, calls-to-action prominent

### 🟢 Default (How-It-Works)

- **Background**: Same gradient as campaign
- **Text**: White titles & emerald-50 subtitles
- **Layout**: Left content + right checklist/panel
- **Vibe**: Explainer, same energy as campaign but explains a process

### 🌿 Mint (Eco-Organizations)

- **Background**: Soft gradient `from-emerald-50 to-emerald-100`
- **Text**: Dark slate-900 titles & slate-700 subtitles
- **Layout**: Left content + right empty (or future stats)
- **Vibe**: Utility, directory, less overwhelming, single CTA

### 🤝 Centered (About-Us)

- **Background**: Soft gradient `from-emerald-50 to-emerald-100`
- **Text**: Dark slate-900 titles & slate-700 subtitles
- **Layout**: Centered text, no right slot
- **Vibe**: Narrative, story-driven, equal-weight CTAs

---

## i18n Keys Reference

### Partners (`messages/en/partners.json`)

```json
{
  "page": {
    "title": "EcoHub Partners & Ecosystem",
    "subtitle": "Businesses, recyclers, NGOs and institutions..."
  },
  "hero": {
    "ctaBecomePartner": "Become a partner",
    "ctaViewMarketplace": "View marketplace"
  },
  "stats": {
    "organizations": "organizations",
    "cities": "cities",
    "roles": "roles"
  }
}
```

### How-It-Works (`messages/en/how-it-works.json`)

```json
{
  "pageTitle": "How EcoHub Works",
  "pageSubtitle": "EcoHub Kosova is the digital marketplace...",
  "heroCtaPrimary": "Explore the marketplace",
  "heroCtaSecondary": "Meet our partners"
}
```

### Eco-Organizations (`messages/en/eco-organizations.json`)

```json
{
  "pageTitle": "Recyclers & green organizations in Kosovo",
  "pageSubtitle": "Discover recyclers, collectors...",
  "browseMarketplace": "Browse marketplace" // NEW
}
```

### About (`messages/en/about.json`)

```json
{
  "hero": {
    "title": "About EcoHub Kosova",
    "subtitle": "EcoHub Kosova is a bilingual platform...",
    "cta": {
      "primary": "Browse the marketplace",
      "secondary": "See recyclers & services"
    }
  }
}
```

---

## Design Tokens

### Colors

- **Gradient (Vibrant)**: `from-emerald-600 via-emerald-500 to-teal-500`
- **Gradient (Soft)**: `from-emerald-50 to-emerald-100`
- **Primary Button**: `bg-emerald-600 hover:bg-emerald-700`
- **Text on Gradient**: `text-white` (title), `text-emerald-50` (subtitle)
- **Text on Soft**: `text-slate-900` (title), `text-slate-700` (subtitle)

### Spacing

- **Vertical**: `py-12 md:py-14`
- **Horizontal**: `px-4 sm:px-6 lg:px-8`
- **Max Width**: `mx-auto max-w-6xl`

### Typography

- **Title**: `text-3xl md:text-4xl font-bold tracking-tight` (or `text-4xl md:text-5xl` centered)
- **Subtitle**: `text-base md:text-lg` (or `text-lg md:text-xl` centered)
- **Eyebrow**: `text-xs font-semibold uppercase tracking-[0.2em]`

---

## Files You Modified

1. ✅ `src/components/layout/PublicPageHero.tsx` – Enhanced component
2. ✅ `src/app/[locale]/(site)/partners/PartnersClient.tsx` – Added `variant="campaign"`
3. ✅ `src/app/[locale]/(site)/how-it-works/page.tsx` – Added `variant="default"`
4. ✅ `src/app/[locale]/(site)/eco-organizations/page.tsx` – Replaced PageHeader → PublicPageHero
5. ✅ `src/app/[locale]/(site)/about-us/page.tsx` – Already using correct variant
6. ✅ `messages/en/eco-organizations.json` – Added `browseMarketplace`
7. ✅ `messages/sq/eco-organizations.json` – Added `browseMarketplace` (SQ)

---

## Testing Checklist

- [ ] Open `/en/partners` → See strong gradient hero with stats
- [ ] Open `/en/how-it-works` → See gradient hero with checklist card
- [ ] Open `/en/eco-organizations` → See soft gradient hero with Browse button
- [ ] Open `/en/about-us` → See centered, soft gradient hero
- [ ] Open `/sq/...` routes → Verify Albanian translations render correctly
- [ ] Resize browser → Verify mobile-first responsive design (stacks on small, horizontal on large)
- [ ] Hover buttons → Verify hover states work smoothly
- [ ] Build locally → `pnpm build` succeeds

---

## FAQ

**Q: Why four variants?**  
A: Each page has a different purpose. Campaign heroes need visual impact for recruitment. Directory pages need softer design. Narrative pages need centered focus. Variants let us express purpose while using one component.

**Q: Can I add a new variant?**  
A: Yes! Edit `PublicPageHero.tsx`, add a new `if (variant === "xyz")` branch, and update the TypeScript interface.

**Q: What if I want different colors?**  
A: Currently, colors are baked into variants. Future work could add a `bgClassName` prop for custom backgrounds.

**Q: Does this work on mobile?**  
A: Yes! All variants use mobile-first responsive design. On small screens, content stacks vertically. On large screens, it's two-column horizontal.

**Q: Do I have to add strings to i18n?**  
A: Yes. All hero text should come from `messages/en/*.json` and `messages/sq/*.json`. This enables translation and easy maintenance.

---

## Build Results

```
✅ pnpm lint ............ 202ms  (0 errors, 0 warnings)
✅ pnpm tsc ............ 2551ms  (0 errors, 0 warnings)
✅ pnpm build ......... 20679ms  (0 errors, 0 warnings)

Total: 23.56s | Status: 3/3 PASS ✅
```

---

## What Changed vs. Before?

### Before

- 4 different hero implementations scattered across pages
- PageHeader component used for eco-organizations (different structure)
- Inconsistent typography, spacing, colors
- Copy sometimes hardcoded, sometimes in i18n

### After

- ✅ Single `PublicPageHero` component controls all four heroes
- ✅ Unified design tokens (emerald palette, responsive container)
- ✅ Consistent typography & spacing across all pages
- ✅ 100% i18n-driven copy (no hardcoded strings)
- ✅ Easy to maintain and extend

---

## Impact

**Code Duplication**: Reduced by ~70 lines (net -6 after adding component)  
**Maintenance Point**: 1 component instead of 4 scattered implementations  
**Consistency**: Visual & UX alignment across public pages  
**i18n**: All hero text translatable via messages files  
**Future Changes**: Update component once, changes apply to all 4 pages

---

**Complete & Ready for Review** ✅  
See full documentation: `PUBLIC_PAGES_HERO_STANDARDIZATION_COMPLETE.md`
