// This file contains locale constants that can be imported in both server and client components
export const locales = ["sq", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "sq"
