import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  // This is typically used to determine the locale, but we're handling it via [locale] segment
  const locale = requestLocale || 'sq'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
