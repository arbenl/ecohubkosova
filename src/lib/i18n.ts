import { getRequestConfig } from "next-intl/server"
import { headers } from "next/headers"

export const locales = ["sq", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "sq"

export default getRequestConfig(async () => {
  const headersList = await headers()
  const locale = (headersList.get("x-locale") || defaultLocale) as Locale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
