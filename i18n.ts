import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = requestLocale || 'sq'
  
  try {
    const messages = (await import(`./messages/${locale}.json`)).default
    return {
      locale,
      messages,
    }
  } catch {
    // Fallback to Albanian if locale not found
    const messages = (await import(`./messages/sq.json`)).default
    return {
      locale: 'sq',
      messages,
    }
  }
})
