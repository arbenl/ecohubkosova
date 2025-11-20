import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ locale }) => {
  // Validate and default to 'sq' if locale is invalid
  const validLocale = locale && ["sq", "en"].includes(locale) ? locale : "sq"

  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  }
})
