/**
 * Locale-aware navigation utilities.
 * Ensures all programmatic navigation includes the current locale prefix.
 * Prevents users from being dumped onto non-existent routes.
 */

'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/locales'

/**
 * Hook for locale-aware client-side navigation.
 * Automatically prepends the current locale to all routes.
 * 
 * Usage:
 * const navigate = useLocalizedRouter()
 * navigate('/dashboard') // -> /sq/dashboard
 * navigate('/login?error=auth') // -> /sq/login?error=auth
 */
export const useLocalizedRouter = () => {
  const locale = useLocale() as Locale
  const router = useRouter()

  return {
    push: (href: string) => {
      // Handle absolute URLs and external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        window.location.href = href
        return
      }

      // Prevent double locale prefixes
      if (href.startsWith(`/${locale}/`) || href === `/${locale}`) {
        router.push(href)
        return
      }

      // Add locale prefix if missing
      const localizedHref = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`
      router.push(localizedHref)
    },

    replace: (href: string) => {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        window.location.replace(href)
        return
      }

      if (href.startsWith(`/${locale}/`) || href === `/${locale}`) {
        router.replace(href)
        return
      }

      const localizedHref = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`
      router.replace(localizedHref)
    },

    refresh: () => router.refresh(),
    back: () => router.back(),
  }
}

/**
 * Server-side locale-aware navigation redirect.
 * Use in server components and server actions.
 *
 * Usage:
 * import { redirect } from 'next/navigation'
 * const localeRedirect = getLocalizedRedirect()
 * localeRedirect('/dashboard') // -> /sq/dashboard
 */
export const getLocalizedRedirect = (locale: Locale | string) => {
  return (href: string) => {
    // Handle absolute URLs
    if (href.startsWith('http://') || href.startsWith('https://')) {
      // Can't redirect to external URLs in server context, must use different approach
      throw new Error(
        `Cannot redirect to external URL: ${href}. Use response.redirect() or window.location instead.`
      )
    }

    // Prevent double locale prefixes
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) {
      return href
    }

    // Add locale prefix if missing
    return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`
  }
}

/**
 * Build a localized href for use in Link components.
 * Ensures proper routing with locale prefix.
 *
 * Usage:
 * <Link href={buildLocalizedHref('/dashboard', locale)}>Dashboard</Link>
 */
export const buildLocalizedHref = (href: string, locale: Locale | string): string => {
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) {
    return href
  }

  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`
}
