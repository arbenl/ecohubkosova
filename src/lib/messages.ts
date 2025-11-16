/**
 * Utility to load messages for a given locale
 * This helps with proper path resolution in layouts
 */
export async function getMessagesForLocale(locale: string) {
  try {
    const messages = await import(`../../messages/${locale}.json`)
    return messages.default
  } catch {
    // Fallback to sq if locale not found
    const messages = await import(`../../messages/sq.json`)
    return messages.default
  }
}
