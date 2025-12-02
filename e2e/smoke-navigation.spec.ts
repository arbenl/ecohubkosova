import { test, expect } from "@playwright/test"

test.describe("Smoke Navigation & Locale Persistence", () => {
  const locales = ["en", "sq"]

  for (const locale of locales) {
    test(`should navigate correctly in ${locale} without dropping locale`, async ({ page }) => {
      // 1. Visit Home
      await page.goto(`/${locale}/home`)
      await expect(page).toHaveURL(new RegExp(`/${locale}/home`))

      // 2. Click "Marketplace" in header
      const marketplaceText = locale === "en" ? "Marketplace" : "Tregu"
      await page.click(`nav >> text=${marketplaceText}`)
      await expect(page).toHaveURL(new RegExp(`/${locale}/marketplace`))

      // 3. Click "Partners" in header
      const partnersText = locale === "en" ? "Partners" : "Partnerët"
      await page.click(`nav >> text=${partnersText}`)
      await expect(page).toHaveURL(new RegExp(`/${locale}/partners`))

      // 4. Check Footer Link (e.g., FAQ)
      const faqText = locale === "en" ? "FAQ" : "Pyetje të shpeshta"
      await page.click(`footer >> text=${faqText}`)
      await expect(page).toHaveURL(new RegExp(`/${locale}/faq`))
    })
  }
})
