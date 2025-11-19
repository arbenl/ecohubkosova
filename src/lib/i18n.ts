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
    if (!locales.includes(locale as any)) {
      locale = defaultLocale
    }

    // Load messages safely with fallback
    let messages = {}
    try {
      messages = (await import(`../../messages/${locale}.json`)).default
    } catch {
      // If locale messages fail, try default locale
      try {
        messages = (await import(`../../messages/${defaultLocale}.json`)).default
      } catch {
        // If even default fails, use empty object
        messages = {}
      }
    }

    return {
      locale,
      messages,
    }
  } catch (error) {
    // Fallback on any error
    return {
      locale: defaultLocale,
      messages: {},
    }
  }
})
