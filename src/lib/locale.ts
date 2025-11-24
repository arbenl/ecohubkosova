import { defaultLocale, locales, type Locale } from "./locales"

export function deriveLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean)
  const candidate = segments[0]
  if (locales.includes(candidate as Locale)) {
    return candidate as Locale
  }
  return defaultLocale
}

export { defaultLocale, locales, type Locale }
