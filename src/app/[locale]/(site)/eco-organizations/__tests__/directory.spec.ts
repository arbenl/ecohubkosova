import { test, expect } from "@playwright/test"

test.describe("Eco Organizations Directory", () => {
  test("should display directory page", async ({ page }) => {
    await page.goto("/en/eco-organizations")
    await expect(page.locator("h1")).toContainText("Eco Organizations Directory")
  })

  test("should have filter controls", async ({ page }) => {
    await page.goto("/en/eco-organizations")
    await expect(page.locator("label")).toContainText("Organization Role")
    await expect(page.locator("label")).toContainText("City")
  })

  test("should work in Albanian", async ({ page }) => {
    await page.goto("/sq/eco-organizations")
    await expect(page.locator("h1")).toContainText("Direktorium i Organizatave Eco")
  })
})
