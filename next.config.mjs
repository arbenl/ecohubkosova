/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/kycu',
        permanent: false,
      },
      {
        source: '/register',
        destination: '/auth/regjistrohu', 
        permanent: false,
      },
    ]
  },
}

export default nextConfig
