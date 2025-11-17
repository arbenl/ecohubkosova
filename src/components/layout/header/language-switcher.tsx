'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import type { Locale } from '@/lib/locales'
import { locales } from '@/lib/locales'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()

  const handleLocaleChange = (newLocale: Locale) => {
    // Replace the locale prefix in the pathname
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPathname = segments.join('/')
    router.push(newPathname)
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
          }`}
          aria-current={locale === loc ? 'page' : undefined}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
