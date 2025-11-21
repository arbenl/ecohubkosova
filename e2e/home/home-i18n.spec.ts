import { test, expect } from "@playwright/test"

test.describe("Home Page i18n", () => {
  test("Albanian home page displays correct translations", async ({ page }) => {
    await page.goto("/sq/home")

    // Verify hero section
    await expect(
      page.getByRole("heading", { name: "Lidhu. Bashkëpuno. Krijo Qarkullim." })
    ).toBeVisible()
    // Scope to main to avoid header/footer matches if any
    const main = page.locator("main")
    await expect(main.getByRole("link", { name: "Fillo Bashkëpunimin" })).toBeVisible()
    await expect(main.getByRole("link", { name: "Eksploro Tregun" })).toBeVisible()

    // Verify How It Works section
    await expect(page.getByRole("heading", { name: "Si Funksionon" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Krijo Profilin Tënd" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Zbulo Mundësitë" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Fillo Bisedimet" })).toBeVisible()

    // Verify Marketplace section
    await expect(page.getByRole("heading", { name: "Tregu i Ekonomisë Qarkulluese" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Për Shitje" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Kërkoj të Blej" })).toBeVisible()
  })

  test("English home page displays correct translations", async ({ page }) => {
    await page.goto("/en/home")

    // Verify hero section
    await expect(
      page.getByRole("heading", { name: "Connect. Collaborate. Create Circulation." })
    ).toBeVisible()

    const main = page.locator("main")
    await expect(main.getByRole("link", { name: "Get Started" })).toBeVisible()
    await expect(main.getByRole("link", { name: "Explore Marketplace" })).toBeVisible()

    // Verify How It Works section
    await expect(page.getByRole("heading", { name: "How It Works" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Create Your Profile" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Discover Opportunities" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Start Conversations" })).toBeVisible()

    // Verify Marketplace section
    await expect(page.getByRole("heading", { name: "Circular Economy Marketplace" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "For Sale" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Wanted to Buy" })).toBeVisible()
  })

  test("Language switcher changes locale correctly", async ({ page }) => {
    // Set viewport to ensure desktop header is visible
    await page.setViewportSize({ width: 1280, height: 720 })

    // Start on Albanian home page
    await page.goto("/sq/home")
    await expect(
      page.getByRole("heading", { name: "Lidhu. Bashkëpuno. Krijo Qarkullim." })
    ).toBeVisible()

    // Switch to English - use first() in case mobile menu button is also present in DOM
    const enButton = page.getByRole("button", { name: "EN" }).first()
    await expect(enButton).toBeVisible()
    await enButton.click()

    await expect(page).toHaveURL("/en/home")
    await expect(
      page.getByRole("heading", { name: "Connect. Collaborate. Create Circulation." })
    ).toBeVisible()

    // Switch back to Albanian
    const sqButton = page.getByRole("button", { name: "SQ" }).first()
    await expect(sqButton).toBeVisible()
    await sqButton.click()

    await expect(page).toHaveURL("/sq/home")
    await expect(
      page.getByRole("heading", { name: "Lidhu. Bashkëpuno. Krijo Qarkullim." })
    ).toBeVisible()
  })
})
