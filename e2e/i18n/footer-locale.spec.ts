import { expect, test } from "@playwright/test"

const cases = [
  {
    locale: "en",
    path: "/en/how-it-works",
    expected: "About EcoHub",
    unexpected: "Rreth EcoHub",
    heading: "Explore",
    headingUnexpected: "Eksploro",
  },
  {
    locale: "sq",
    path: "/sq/how-it-works",
    expected: "Rreth EcoHub",
    unexpected: "About EcoHub",
    heading: "Eksploro",
    headingUnexpected: "Explore",
  },
]

test.describe("Footer locale fidelity", () => {
  for (const scenario of cases) {
    test(`shows ${scenario.locale} footer content on ${scenario.path}`, async ({ page }) => {
      await page.goto(scenario.path)

      const html = page.locator("html")
      await expect(html).toHaveAttribute("lang", scenario.locale)

      const footer = page.locator("footer").first()
      await expect(footer).toBeVisible()

      await expect(footer).toContainText(scenario.expected)
      await expect(footer).not.toContainText(scenario.unexpected)

      await expect(footer).toContainText(scenario.heading)
      await expect(footer).not.toContainText(scenario.headingUnexpected)
    })
  }
})
