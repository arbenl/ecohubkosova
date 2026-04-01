import { test, expect } from "@playwright/test"

// Use a unique ID for each test worker/retry to avoid email collisions
const getUniqueId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`

test.describe("Organization Registration and Onboarding Stress Test", () => {
  // Increase timeout for stress testing
  test.setTimeout(60000)

  test("should successfully register a new organization and display pending approval warning", async ({
    page,
  }) => {
    const uniqueId = getUniqueId()
    const email = `test-org-${uniqueId}@example.com`
    const password = "TestPassword123!"
    const orgName = `Stress Test Org ${uniqueId}`

    await test.step("Navigate to registration", async () => {
      await page.goto("/sq/register")
      await expect(page.locator("#full_name").first()).toBeVisible()
    })

    await test.step("Step 1: Basic Info", async () => {
      await page.fill("#full_name", "Stress Tester")
      await page.fill("#email", email)
      await page.fill("#password", password)
      await page.fill("#confirmPassword", password)
      await page.fill("#location", "Prishtina")

      // Select Organization role (e.g. OJQ)
      await page.click('label[for="ojq"]')

      // Click Continue
      await page.getByRole("button", { name: /Vazhdo/i }).click()
    })

    await test.step("Step 2: Organization Details", async () => {
      // Wait for step 2 inputs to appear
      await expect(page.locator("#organization_name")).toBeVisible()

      await page.fill("#organization_name", orgName)
      await page.fill("#organization_description", "This is an automated stress test organization.")
      await page.fill("#primary_interest", "Environment")
      await page.fill("#contact_person", "Jane Doe")
      await page.fill("#contact_email", email)

      // Click Continue
      await page.getByRole("button", { name: /Vazhdo/i }).click()
    })

    await test.step("Step 3: Terms and Newsletter", async () => {
      // Wait for step 3 inputs
      await expect(page.locator("#terms")).toBeVisible()

      await page.locator('label[for="terms"]').click()

      // Submit registration
      await page.getByRole("button", { name: /Regjistrohu/i }).click()
    })

    await test.step("Verify Registration Success", async () => {
      // Usually redirects to /success or /sq/success
      await page.waitForURL(/\/success/)
      await expect(page.getByRole("heading", { name: /sukses/i })).toBeVisible()
    })

    await test.step("Verify Pending Approval Banner on Dashboard", async () => {
      // Depending on auth flow, user might need to log in or is auto-logged in.
      // We assume user is auto-logged in. If there is email confirmation required, this part might fail,
      // but we will see that in the test run.
      await page.goto("/sq/my")

      // Look for the "pending approval" banner
      const alert = page.locator(".border-amber-200")
      // "Organizatë në pritje të aprovimit"
      await expect(alert).toContainText("pritje të aprovimit", { timeout: 15000 })

      const countText = alert.locator(".text-amber-800")
      await expect(countText).toContainText("1 organizatë(a)")
    })
  })
})
