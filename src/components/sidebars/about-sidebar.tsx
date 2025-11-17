'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

const aboutLinks = [
  { href: '/about', label: 'Rreth Nesh' },
  { href: '/about/mission', label: 'Misioni' },
  { href: '/about/vision', label: 'Vizioni' },
  { href: '/about/governance', label: 'Qeverisja' },
  { href: '/about/coalition', label: 'Koalicioni' },
]

export function AboutSidebar() {
  const pathname = usePathname()
  const locale = useLocale()

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Rreth Nesh</h2>
      <nav className="space-y-2">
        {aboutLinks.map((link) => {
        const href = `/${locale}${link.href}`
        const isActive = pathname === href
        return (
          <Link
            key={link.href}
            href={href}
            className={cn(
              'block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
              isActive
                ? 'bg-[#00C896] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {link.label}
          </Link>
        )
      })}
      </nav>
    </div>
  )
}
