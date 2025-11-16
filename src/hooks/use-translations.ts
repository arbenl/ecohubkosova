import { useTranslations as useNextIntlTranslations } from 'next-intl'

/**
 * Hook to access translations in components
 * Usage: const t = useTranslations()
 *        const welcome = t('common.welcome')
 */
export function useTranslations() {
  return useNextIntlTranslations()
}

/**
 * Get a specific translation key
 * Usage: const msg = getTranslation('auth.email')
 */
export function getTranslationKey(namespace: string): string {
  return namespace
}
