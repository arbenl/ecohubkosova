const DEFAULT_IMAGE_DOMAINS = ["images.unsplash.com", "placehold.co"]

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

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
  transpilePackages: ["@supabase/auth-js", "@supabase/ssr"],
  images: {
    domains: allowedDomains,
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig
