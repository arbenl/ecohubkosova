import { getRequestConfig } from "next-intl/server"
import { headers } from "next/headers"
import { defaultLocale, locales } from "./locales"
import type { Locale } from "./locales"

export { locales, type Locale, defaultLocale } from "./locales"

export default getRequestConfig(async () => {
  try {
    const headersList = await headers()
    let locale = (headersList.get("x-locale") || defaultLocale) as Locale

    // Validate locale is in supported list
    if (!locales.includes(locale)) {
      locale = defaultLocale
    }

    // Load messages safely with fallback
    let messages = {}
    try {
      if (locale === 'sq') {
        messages = (await import(`../../messages/sq.json`)).default
      } else if (locale === 'en') {
        messages = (await import(`../../messages/en.json`)).default
      } else {
        messages = (await import(`../../messages/${defaultLocale}.json`)).default
      }
      console.log(`Loaded messages for ${locale}:`, Object.keys(messages))
    } catch (error) {
      console.error(`Failed to load messages for ${locale}:`, error)
      // If locale messages fail, try default locale
      try {
        messages = (await import(`../../messages/${defaultLocale}.json`)).default
        console.log(`Loaded fallback messages for ${defaultLocale}:`, Object.keys(messages))
      } catch (fallbackError) {
        console.error(`Failed to load fallback messages:`, fallbackError)
        // If even default fails, use empty object
        messages = {}
      }
    }

    return {
      locale,
      messages,
    }
  } catch {
    // Fallback on any error
    return {
      locale: defaultLocale,
      messages: {},
    }
  }
})
