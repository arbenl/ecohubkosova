const DEFAULT_IMAGE_DOMAINS = ["images.unsplash.com", "placehold.co"]

import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts')

const parseCsvList = (value) =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? []

const getSupabaseHost = () => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    return url ? new URL(url).hostname : null
  } catch (error) {
    console.warn("[next.config] Invalid NEXT_PUBLIC_SUPABASE_URL provided:", error)
    return null
  }
}

const supabaseHost = getSupabaseHost()
const extraHosts = parseCsvList(process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS)
const allowedDomains = Array.from(new Set([...DEFAULT_IMAGE_DOMAINS, ...extraHosts, supabaseHost].filter(Boolean)))
const supabaseHttpsHost = supabaseHost ? `https://${supabaseHost}` : null

const imageSrc = ["'self'", "data:", "blob:", ...allowedDomains.map((domain) => `https://${domain}`)]
const connectSrc = ["'self'", "https://vitals.vercel-insights.com", "https://*.supabase.co"]
if (supabaseHttpsHost) {
  connectSrc.push(supabaseHttpsHost)
}

// Secure CSP without 'unsafe-inline' and 'unsafe-eval'
// Uses strict-dynamic for Next.js inline scripts
const csp = [
  "default-src 'self';",
  "script-src 'self' 'strict-dynamic' 'nonce-{nonce}';",
  "style-src 'self';",
  `img-src ${imageSrc.join(" ")};`,
  "font-src 'self' data:;",
  `connect-src ${connectSrc.join(" ")};`,
  "frame-ancestors 'none';",
  "base-uri 'self';",
  "form-action 'self';",
].join(" ")

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: csp.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true, // Enable instrumentation for graceful shutdown and connection management
  },
  serverExternalPackages: ["@supabase/supabase-js"],
  transpilePackages: ["@supabase/auth-js", "@supabase/ssr"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: allowedDomains.map((domain) => ({
      protocol: "https",
      hostname: domain,
      pathname: "/**",
    })),
    formats: ["image/avif", "image/webp"],
  },
}

export default withNextIntl(nextConfig)
