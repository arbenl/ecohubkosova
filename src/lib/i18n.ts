import { getRequestConfig } from "next-intl/server"
import { headers } from "next/headers"
import { defaultLocale } from "./locales"
import type { Locale } from "./locales"

export { locales, type Locale, defaultLocale } from "./locales"

export default getRequestConfig(async () => {
  const headersList = await headers()
  const locale = (headersList.get("x-locale") || defaultLocale) as Locale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
