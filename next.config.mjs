const DEFAULT_IMAGE_DOMAINS = ["images.unsplash.com", "placehold.co"]

import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

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

// Content Security Policy
// - In production: strict, nonce-based scripts (requires headers to provide a real nonce)
// - In development: PERMISSIVE to support Next.js Turbopack (HMR, inline scripts, eval, dynamic imports)
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

const devConnectSrc = [
  ...connectSrc,
  'http://localhost:*',
  'http://127.0.0.1:*',
  'ws://localhost:*',
  'ws://127.0.0.1:*',
  'wss://localhost:*',
  'wss://127.0.0.1:*',
]

// Production CSP: strict, but allows Next.js compiled bundles
const prodCsp = [
  "default-src 'self';",
  // Using self + unsafe-inline to avoid per-request nonces while allowing Next.js inline bootstrap
  "script-src 'self' 'unsafe-inline';",
  "style-src 'self';",
  `img-src ${imageSrc.join(" ")};`,
  "font-src 'self' data:;",
  `connect-src ${connectSrc.join(" ")};`,
  "frame-ancestors 'none';",
  "base-uri 'self';",
  "form-action 'self';",
].join(' ')

// Development CSP: very permissive for Turbopack/HMR/hot reload
// Note: 'unsafe-eval' is needed for Turbopack and React Refresh dev transforms
const devCsp = [
  "default-src 'self' blob: data: http: https:;",
  // 'unsafe-eval' needed for Turbopack transforms + HMR
  // 'unsafe-inline' needed for inline React + Next dev scripts
  // blob: needed for web workers and dynamic module loading
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: http: https:;",
  // 'unsafe-inline' needed for injected dev styles + HMR
  "style-src 'self' 'unsafe-inline' blob: data:;",
  `img-src ${imageSrc.join(" ")} blob: data: http: https:;`,
  "font-src 'self' data: blob:;",
  `connect-src ${devConnectSrc.join(" ")} blob:;`,
  "media-src 'self' data: blob: http: https:;",
  "frame-ancestors 'none';",
  "base-uri 'self';",
  "form-action 'self';",
  // Allow child frames for dev tools
  "frame-src 'self' data: blob:;",
].join(' ')

const csp = isProd ? prodCsp : devCsp

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
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/qendra-e-dijes",
        destination: "/knowledge",
        permanent: true,
      },
      {
        source: "/:locale/qendra-e-dijes",
        destination: "/:locale/knowledge",
        permanent: true,
      },
    ]
  },
}

import { withSentryConfig } from "@sentry/nextjs"

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
