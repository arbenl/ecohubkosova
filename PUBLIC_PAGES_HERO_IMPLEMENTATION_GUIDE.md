# PublicPageHero Implementation Examples

## Component Signature

```typescript
interface PublicPageHeroProps {
  namespace: string                    // "partners" | "how-it-works" | "about"
  titleKey: string                     // i18n key for title
  subtitleKey: string                  // i18n key for subtitle
  eyebrowKey?: string                  // Optional eyebrow badge
  actions?: React.ReactNode            // Optional buttons/links
  children?: React.ReactNode           // Optional side content
  variant?: "default" | "centered"     // Layout style
}
```

---

## Example 1: Partners Page (Default Variant with Side Stats)

```jsx
import { PublicPageHero } from "@/components/layout/PublicPageHero"

export function PartnersClient({ locale, partners }) {
  const t = useTranslations("partners")
  
  const stats = useMemo(() => ({
    totalOrgs: partners.length,
    cities: new Set(partners.map(p => p.location)).size,
    roles: new Set(partners.map(p => p.org_role)).size
  }), [partners])

  return (
    <div className="min-h-screen space-y-10 pb-16 bg-white">
      <PublicPageHero
        namespace="partners"
        titleKey="page.title"
        subtitleKey="page.subtitle"
        actions={
          <>
            <Link
              href={ctaHref}
              className="rounded-full bg-white text-emerald-700 px-5 py-2 text-sm font-semibold shadow-sm transition hover:bg-emerald-50"
            >
              {t("hero.ctaBecomePartner")}
            </Link>
            <Link
              href={`/${locale}/marketplace`}
              className="rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              {t("hero.ctaViewMarketplace")}
            </Link>
          </>
        }
      >
        {/* Stats displayed in side panel */}
        <div className="text-sm md:text-base text-emerald-50/90">
          {stats.totalOrgs} {t("stats.organizations")} · 
          {stats.cities} {t("stats.cities")} · 
          {stats.roles} {t("stats.roles")}
        </div>
      </PublicPageHero>

      {/* Rest of page content */}
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Filter buttons, partner grid, etc */}
      </div>
    </div>
  )
}
```

**Result**: Gradient background, left-aligned text, right-aligned stats panel, two CTA buttons

---

## Example 2: How-It-Works Page (Default Variant with Checklist)

```jsx
import { PublicPageHero } from "@/components/layout/PublicPageHero"

export default async function HowItWorksPage({ params }) {
  const { locale } = await params
  const t = await getTranslations("how-it-works")

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <PublicPageHero
        namespace="how-it-works"
        titleKey="pageTitle"
        subtitleKey="pageSubtitle"
        actions={
          <>
            <Link
              href={`/${locale}/marketplace`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              {t("heroCtaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/partners`}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("heroCtaSecondary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
      >
        {/* Checklist panel as children */}
        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
          <ul className="space-y-3 text-sm text-emerald-50">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              {t("steps.discover.title")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              {t("steps.connect.title")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              {t("steps.closeLoop.title")}
            </li>
          </ul>
        </div>
      </PublicPageHero>

      {/* Three-step detailed sections */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        {/* Steps grid */}
      </section>

      {/* Audiences section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        {/* Audiences grid */}
      </section>
    </div>
  )
}
```

**Result**: Gradient background, left text with two CTAs, right panel with checklist preview

---

## Example 3: About Page (Centered Variant)

```jsx
import { PublicPageHero } from "@/components/layout/PublicPageHero"

export default async function AboutUsPage({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "about" })

  return (
    <>
      {/* Hero Section - Centered variant */}
      <PublicPageHero
        namespace="about"
        titleKey="hero.title"
        subtitleKey="hero.subtitle"
        variant="centered"
        actions={
          <>
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 rounded-full">
              <Link href={`/${locale}/marketplace`}>
                {t("hero.cta.primary")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href={`/${locale}/eco-organizations`}>
                {t("hero.cta.secondary")}
              </Link>
            </Button>
          </>
        }
      />

      {/* Advocacy Section */}
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Content */}
        </div>
      </div>

      {/* More sections... */}
    </>
  )
}
```

**Result**: Centered layout with emerald-50 gradient, centered text, centered buttons below

---

## Component Implementation

```typescript
// src/components/layout/PublicPageHero.tsx
"use client"

import { useTranslations } from "next-intl"
import clsx from "clsx"

interface PublicPageHeroProps {
  namespace: string
  titleKey: string
  subtitleKey: string
  eyebrowKey?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  variant?: "default" | "centered"
}

export function PublicPageHero({
  namespace,
  titleKey,
  subtitleKey,
  eyebrowKey,
  actions,
  children,
  variant = "default",
}: PublicPageHeroProps) {
  const t = useTranslations(namespace)

  if (variant === "centered") {
    return (
      <div className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {eyebrowKey && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-4">
                {t(eyebrowKey)}
              </p>
            )}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
              {t(titleKey)}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t(subtitleKey)}
            </p>
            {actions && <div className="flex flex-col sm:flex-row gap-4 justify-center">{actions}</div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white">
      <div className={clsx(
        "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-14",
        children ? "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" : ""
      )}>
        <div className="space-y-4">
          {eyebrowKey && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              {t(eyebrowKey)}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {t(titleKey)}
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-emerald-50">
            {t(subtitleKey)}
          </p>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}
```

---

## Key Patterns

### 1. **Always Use i18n Keys**
✅ GOOD:
```jsx
<PublicPageHero
  namespace="partners"
  titleKey="page.title"
  subtitleKey="page.subtitle"
/>
```

❌ BAD:
```jsx
<PublicPageHero
  namespace="partners"
  title="EcoHub Partners"  // ← Hardcoded!
/>
```

### 2. **Pass Actions as Render Props**
✅ GOOD:
```jsx
<PublicPageHero
  actions={
    <>
      <Link href="/...">CTA 1</Link>
      <Link href="/...">CTA 2</Link>
    </>
  }
/>
```

### 3. **Use Children for Side Panels**
✅ GOOD:
```jsx
<PublicPageHero {...props}>
  <div className="...stats or checklist panel...</div>
</PublicPageHero>
```

### 4. **Use variant="centered" for Full-Width Heroes**
✅ GOOD:
```jsx
<PublicPageHero
  variant="centered"
  {...props}
/>
```

---

**All three pages now share consistent, reusable hero patterns!** 🎉
