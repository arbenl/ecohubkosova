import { test, expect } from "@playwright/test"

test.describe("Home Page i18n", () => {
  test("Albanian home page displays correct translations", async ({ page }) => {
    await page.goto("/sq/home")

    // Verify hero section
    await expect(page.getByText("Lidhu. Bashkëpuno. Krijo Qarkullim.")).toBeVisible()
    await expect(page.getByText("Fillo Bashkëpunimin")).toBeVisible()
    await expect(page.getByText("Eksploro Tregun")).toBeVisible()

    // Verify How It Works section
    await expect(page.getByText("Si Funksionon")).toBeVisible()
    await expect(page.getByText("Krijo Profilin Tënd")).toBeVisible()
    await expect(page.getByText("Zbulo Mundësitë")).toBeVisible()
    await expect(page.getByText("Fillo Bisedimet")).toBeVisible()

    // Verify Marketplace section
    await expect(page.getByText("Tregu i Ekonomisë Qarkulluese")).toBeVisible()
    await expect(page.getByText("Për Shitje")).toBeVisible()
    await expect(page.getByText("Kërkoj të Blej")).toBeVisible()
  })

  test("English home page displays correct translations", async ({ page }) => {
    await page.goto("/en/home")

    // Verify hero section
    await expect(page.getByText("Connect. Collaborate. Create Circulation.")).toBeVisible()
    await expect(page.getByText("Get Started")).toBeVisible()
    await expect(page.getByText("Explore Marketplace")).toBeVisible()

    // Verify How It Works section
    await expect(page.getByText("How It Works")).toBeVisible()
    await expect(page.getByText("Create Your Profile")).toBeVisible()
    await expect(page.getByText("Discover Opportunities")).toBeVisible()
    await expect(page.getByText("Start Conversations")).toBeVisible()

    // Verify Marketplace section
    await expect(page.getByText("Circular Economy Marketplace")).toBeVisible()
    await expect(page.getByText("For Sale")).toBeVisible()
    await expect(page.getByText("Wanted to Buy")).toBeVisible()
  })

  test("Language switcher changes locale correctly", async ({ page }) => {
    // Start on Albanian home page
    await page.goto("/sq/home")
    await expect(page.getByText("Lidhu. Bashkëpuno. Krijo Qarkullim.")).toBeVisible()

    // Switch to English
    await page.getByRole("button", { name: "EN" }).click()
    await expect(page).toHaveURL("/en/home")
    await expect(page.getByText("Connect. Collaborate. Create Circulation.")).toBeVisible()

    // Switch back to Albanian
    await page.getByRole("button", { name: "SQ" }).click()
    await expect(page).toHaveURL("/sq/home")
    await expect(page.getByText("Lidhu. Bashkëpuno. Krijo Qarkullim.")).toBeVisible()
  })
})
