import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  // The requestLocale comes from the [locale] dynamic segment
  const locale = requestLocale || 'sq'

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
