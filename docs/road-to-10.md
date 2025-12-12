# EcoHub Kosova: Road to 10/10 Production Readiness

A complete implementation plan to take the application from **7.0 → 10.0**.

**Estimated Total Effort**: ~80-100 hours  
**Recommended Timeline**: 4-6 weeks

---

## Phase 1: Critical Fixes (7.0 → 8.5)

**Effort**: 15-20 hours | **Timeline**: Week 1

### 1.1 SEO Foundations

#### robots.txt

Create `public/robots.txt`:

```text
User-agent: *
Allow: /

# Disallow admin and protected areas
Disallow: /*/admin/*
Disallow: /*/my/*
Disallow: /api/*

# Sitemap
Sitemap: https://ecohubkosova.com/sitemap.xml
```

#### Dynamic Sitemap

Create `src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecohubkosova.com"
  const locales = ["sq", "en"]

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/marketplace",
    "/knowledge",
    "/eco-organizations",
    "/partners",
    "/faq",
    "/contact",
  ]

  const staticUrlsMultiLang = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page === "" ? 1 : 0.8,
    }))
  )

  // Dynamic: Fetch all listings
  // const listings = await fetchAllListings()
  // const listingUrls = listings.flatMap(listing =>
  //   locales.map(locale => ({
  //     url: `${baseUrl}/${locale}/marketplace/${listing.id}`,
  //     lastModified: new Date(listing.updated_at),
  //     changeFrequency: 'daily' as const,
  //     priority: 0.6,
  //   }))
  // )

  return [...staticUrlsMultiLang]
}
```

#### Meta Tags for All Public Pages

Create `src/lib/metadata.ts`:

```typescript
import { Metadata } from "next"

type PageMetadataParams = {
  title: string
  description: string
  path: string
  locale: string
  image?: string
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  image = "/og-default.jpg",
}: PageMetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ecohubkosova.com"
  const url = `${baseUrl}/${locale}${path}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        sq: `${baseUrl}/sq${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "EcoHub Kosova",
      locale: locale === "sq" ? "sq_XK" : "en_US",
      type: "website",
      images: [{ url: `${baseUrl}${image}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}${image}`],
    },
  }
}
```

Update each public page with `generateMetadata`:

```typescript
// Example: src/app/[locale]/(site)/marketplace/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "marketplace" })

  return generatePageMetadata({
    title: t("pageTitle"),
    description: t("pageDescription"),
    path: "/marketplace",
    locale,
  })
}
```

### 1.2 Security Headers

Update `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

Add basic CSP in `next.config.mjs`:

```javascript
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.sentry.io;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in;
      connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co;
      frame-ancestors 'none';
    `.replace(/\n/g, ""),
  },
]
```

### 1.3 Rate Limiting

Create `src/lib/rate-limit.ts`:

```typescript
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimit.get(key)

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}
```

Apply to auth actions:

```typescript
// In login/actions.ts
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

export async function signIn(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || "unknown"

  const { success } = checkRateLimit(`login:${ip}`, 5, 60000) // 5 attempts per minute
  if (!success) {
    return { error: "Too many attempts. Please wait a minute." }
  }
  // ... rest of login logic
}
```

### 1.4 CI/CD Improvements

Update `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Type Check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Unit Tests with Coverage
        run: pnpm test:coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Build
        run: pnpm build

  e2e-smoke:
    runs-on: ubuntu-latest
    needs: build-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - name: Install Playwright
        run: pnpm exec playwright install chromium
      - name: Run E2E Smoke Tests
        run: pnpm test:e2e:smoke
```

---

## Phase 2: Quality & Performance (8.5 → 9.0)

**Effort**: 20-25 hours | **Timeline**: Week 2

### 2.1 Performance Optimization

#### ISR for Public Pages

```typescript
// src/app/[locale]/(site)/marketplace/page.tsx
export const revalidate = 300 // Revalidate every 5 minutes

// For individual listing pages
export const dynamicParams = true
export async function generateStaticParams() {
  // Generate top 100 most viewed listings
  const listings = await getTopListings(100)
  return listings.flatMap((l) => [
    { locale: "sq", id: l.id },
    { locale: "en", id: l.id },
  ])
}
```

#### Loading Skeletons

Create `src/components/ui/skeleton-card.tsx`:

```typescript
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  )
}
```

Add to pages:

```typescript
// src/app/[locale]/(site)/marketplace/loading.tsx
export default function Loading() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
```

#### Image Optimization

Update `next.config.mjs`:

```javascript
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
}
```

### 2.2 Accessibility Pass

#### Skip to Content Link

Add to `src/app/[locale]/layout.tsx`:

```tsx
<body>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 bg-white px-4 py-2 rounded-lg shadow-lg"
  >
    {t("skipToContent")}
  </a>
  {children}
</body>
```

#### Focus Visible Styles

Add to `globals.css`:

```css
/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid #00c896;
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

#### ARIA Improvements Checklist

- [ ] All form inputs have associated labels
- [ ] All images have alt text (or aria-hidden for decorative)
- [ ] Modals trap focus and have proper roles
- [ ] Error messages are announced (aria-live="polite")
- [ ] Navigation has proper landmarks (nav, main, footer)
- [ ] Buttons have accessible names

### 2.3 Structured Data (JSON-LD)

Create `src/components/seo/json-ld.tsx`:

```tsx
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EcoHub Kosova",
    description: "Circular economy platform for Kosovo",
    url: "https://ecohubkosova.com",
    logo: "https://ecohubkosova.com/logo.png",
    sameAs: ["https://facebook.com/ecohubkosova", "https://instagram.com/ecohubkosova"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function ListingJsonLd({ listing }: { listing: Listing }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images?.[0],
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: listing.price || 0,
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### 2.4 Test Coverage

Add tests for new auth features:

```typescript
// src/app/[locale]/(auth)/forgot-password/actions.test.ts
import { requestPasswordReset } from "./actions"

describe("requestPasswordReset", () => {
  it("returns success for valid email", async () => {
    const formData = new FormData()
    formData.set("email", "test@example.com")
    const result = await requestPasswordReset(formData)
    expect(result.success).toBe(true)
  })

  it("returns success even for non-existent email (prevent enumeration)", async () => {
    const formData = new FormData()
    formData.set("email", "nonexistent@example.com")
    const result = await requestPasswordReset(formData)
    expect(result.success).toBe(true)
  })

  it("validates email format", async () => {
    const formData = new FormData()
    formData.set("email", "not-an-email")
    const result = await requestPasswordReset(formData)
    expect(result.error).toBeDefined()
  })
})
```

---

## Phase 3: Polish & Enterprise Features (9.0 → 9.5)

**Effort**: 25-30 hours | **Timeline**: Week 3-4

### 3.1 Structured Logging

Install pino:

```bash
pnpm add pino pino-pretty
```

Create `src/lib/logger.ts`:

```typescript
import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },
})

// Usage in server actions:
// logger.info({ userId, action: 'login' }, 'User logged in')
// logger.error({ error, userId }, 'Login failed')
```

### 3.2 Email Verification Flow

Add email confirmation requirement:

```typescript
// Update registration to require email verification
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${siteUrl}/auth/callback?type=signup`,
  },
})
```

Create verification pending page:

```typescript
// src/app/[locale]/(auth)/verify-email/page.tsx
export default function VerifyEmailPage() {
  const t = useTranslations('auth')
  return (
    <Card>
      <Mail className="h-12 w-12 text-emerald-600" />
      <h1>{t('verifyEmail.title')}</h1>
      <p>{t('verifyEmail.description')}</p>
    </Card>
  )
}
```

### 3.3 CAPTCHA Integration

Install hCaptcha:

```bash
pnpm add @hcaptcha/react-hcaptcha
```

Add to registration form:

```tsx
import HCaptcha from "@hcaptcha/react-hcaptcha"

function RegisterForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  return (
    <form>
      {/* ...form fields */}
      <HCaptcha sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!} onVerify={setCaptchaToken} />
      <Button disabled={!captchaToken}>Register</Button>
    </form>
  )
}
```

Verify on server:

```typescript
async function verifyHCaptcha(token: string): Promise<boolean> {
  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`,
  })
  const data = await response.json()
  return data.success
}
```

### 3.4 Contributing Guide

Create `CONTRIBUTING.md`:

```markdown
# Contributing to EcoHub Kosova

## Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy environment file: `cp .env.example .env.local`
4. Start dev server: `pnpm dev`

## Code Standards

- TypeScript strict mode
- Format with Prettier: `pnpm format`
- Lint before commit: `pnpm lint`
- Run tests: `pnpm test`

## Pull Request Process

1. Create feature branch from `main`
2. Follow conventional commits
3. Ensure CI passes
4. Request review from CODEOWNERS

## i18n

All user-facing strings must be translated:

- Add to `messages/en/*.json`
- Add to `messages/sq/*.json`
- Use `useTranslations` hook
```

### 3.5 Security Scanning

Add Dependabot:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

## Phase 4: Excellence (9.5 → 10.0)

**Effort**: 20-25 hours | **Timeline**: Week 5-6

### 4.1 Two-Factor Authentication (2FA)

Implement TOTP:

```typescript
// Add 2FA enrollment in account settings
// Use library like `otplib` for TOTP generation
import { authenticator } from "otplib"

function generate2FASecret(email: string) {
  const secret = authenticator.generateSecret()
  const uri = authenticator.keyuri(email, "EcoHub Kosova", secret)
  return { secret, uri }
}

function verify2FAToken(secret: string, token: string) {
  return authenticator.verify({ token, secret })
}
```

### 4.2 PWA Support

Create `public/manifest.json`:

```json
{
  "name": "EcoHub Kosova",
  "short_name": "EcoHub",
  "description": "Circular economy platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#00C896",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add to layout:

```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#00C896" />
```

### 4.3 Privacy-Respecting Analytics

Implement Plausible or Umami:

```tsx
// src/components/analytics.tsx
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null

  return <Script defer data-domain="ecohubkosova.com" src="https://plausible.io/js/script.js" />
}
```

### 4.4 Feedback Widget

Create NPS/feedback component:

```tsx
// src/components/feedback-widget.tsx
"use client"

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number | null>(null)

  return (
    <div className="fixed bottom-4 right-4">
      <Button onClick={() => setOpen(true)}>
        <MessageCircle className="h-5 w-5" />
      </Button>
      {open && (
        <Card className="absolute bottom-16 right-0 w-72">
          <h3>How's your experience?</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                {rating && rating >= n ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          <Textarea placeholder="Tell us more..." />
          <Button onClick={submitFeedback}>Send</Button>
        </Card>
      )}
    </div>
  )
}
```

### 4.5 Complete Screen Reader Testing

Checklist:

- [ ] Test with NVDA (Windows)
- [ ] Test with VoiceOver (Mac/iOS)
- [ ] Test with TalkBack (Android)
- [ ] Document any issues found
- [ ] Fix all critical accessibility issues

---

## Summary: The Full Journey

| Phase   | Score Change | Timeline | Key Deliverables                                                              |
| ------- | ------------ | -------- | ----------------------------------------------------------------------------- |
| Phase 1 | 7.0 → 8.5    | Week 1   | SEO (robots, sitemap, meta), security headers, rate limiting, CI improvements |
| Phase 2 | 8.5 → 9.0    | Week 2   | ISR, skeletons, accessibility, JSON-LD, test coverage                         |
| Phase 3 | 9.0 → 9.5    | Week 3-4 | Logging, email verification, CAPTCHA, contributing guide, security scanning   |
| Phase 4 | 9.5 → 10.0   | Week 5-6 | 2FA, PWA, analytics, feedback, screen reader testing                          |

---

## Which Phase Should We Start With?

I can begin implementing any phase right now. My recommendation:

**Start with Phase 1** - It has the highest impact-to-effort ratio and addresses critical production concerns (SEO, security). Most items are quick wins that can be done in a few hours each.

Would you like me to start implementing Phase 1?
