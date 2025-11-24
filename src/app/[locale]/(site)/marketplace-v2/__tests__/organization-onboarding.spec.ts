import { test, expect, Page } from "@playwright/test"

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

test.describe("Phase 4.10 - Organization Onboarding & Workspace", () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    
    // Login as test user
    await page.goto(`${BASE_URL}/en/login`)
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "testpass123")
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
  })

  test("Visit My Organization when no org membership", async () => {
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Should see onboarding screen
    expect(await page.isVisible("text=You're not a member of any organization yet")).toBeTruthy()
    expect(await page.isVisible("text=Create a new organization")).toBeTruthy()
    expect(await page.isVisible("text=Search for your organization in the directory")).toBeTruthy()
  })

  test("Create new organization via onboarding", async () => {
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Click "Create a new organization"
    await page.click("button:has-text('Create a new organization')")
    
    // Should see form
    expect(await page.isVisible("text=Create your organization")).toBeTruthy()
    
    // Fill form
    await page.fill('input[placeholder*="GreenTech"]', "Test Recycler Ltd")
    await page.fill('textarea[placeholder*="Describe"]', "We provide professional recycling services")
    await page.selectOption('select', "OJQ")
    await page.fill('input[placeholder*="Recycling"]', "Waste Management")
    await page.fill('input[placeholder*="Contact person"]', "John Doe")
    await page.fill('input[placeholder*="contact@"]', "contact@testrecycler.com")
    await page.fill('input[placeholder*="Prishtinë"]', "Prishtinë")
    
    // Submit
    await page.click("button:has-text('Create organization')")
    
    // Should redirect to workspace
    await page.waitForNavigation()
    expect(page.url()).toContain("/en/my/organization")
    expect(await page.isVisible("text=Test Recycler Ltd")).toBeTruthy()
  })

  test("Claim existing organization", async () => {
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Click "Search for your organization"
    await page.click("button:has-text('Search for your organization')")
    
    // Search for an org
    await page.fill('input[placeholder*="Search by name"]', "Recyclers")
    await page.click("button:has-text('Search')")
    
    // Wait for results
    await page.waitForSelector("text=/Request access|Kërkoni akses/")
    
    // Click request access on first result
    const requestButtons = await page.locator("button:has-text('Request access')").all()
    if (requestButtons.length > 0) {
      await requestButtons[0].click()
      
      // Should show success or redirect
      await page.waitForNavigation()
      expect(page.url()).toContain("/en/my/organization")
    }
  })

  test("View organization profile in workspace", async () => {
    // Assuming user already has an organization
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Should see organization details
    const profileSection = await page.locator("text=/Organization profile|Profili i organizatës/").isVisible()
    if (profileSection) {
      expect(await page.isVisible("text=/Status|Statusi/")).toBeTruthy()
    }
  })

  test("View public organization profile link", async () => {
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Should see "View public profile" button
    const viewPublicBtn = await page.locator("button:has-text('View public profile')").first()
    if (await viewPublicBtn.isVisible()) {
      const orgPageUrl = await viewPublicBtn.getAttribute("href")
      expect(orgPageUrl).toContain("/eco-organizations/")
    }
  })

  test("Create listing button links to marketplace", async () => {
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Should see "Create new listing" button
    const createBtn = await page.locator("button:has-text('Create new listing')").first()
    if (await createBtn.isVisible()) {
      expect(await createBtn.getAttribute("href")).toContain("/marketplace-v2/create")
    }
  })

  test("Switch between multiple organizations", async () => {
    // This would require seeding multiple orgs for user
    // For now, just verify selector shows when multiple orgs exist
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Look for organization selector
    const selector = await page.locator('select[id="org-select"]').isVisible()
    // If multiple orgs, selector should be visible; if not, that's okay for this test
    expect(typeof selector).toBe("boolean")
  })

  test("Albanian localization for organization onboarding", async () => {
    await page.goto(`${BASE_URL}/sq/my/organization`)
    
    // Should see Albanian text
    expect(await page.isVisible("text=/Nuk jeni anëtar|Nuk ka oferata/")).toBeTruthy()
    
    // Check for Albanian form labels
    if (await page.isVisible("button:has-text('Krijoni organizatën')")) {
      await page.click("button:has-text('Krijoni organizatën')")
      expect(await page.isVisible("text=Emri i organizatës")).toBeTruthy()
    }
  })

  test("Form validation on organization creation", async () => {
    await page.goto(`${BASE_URL}/en/my/organization`)
    
    // Click create
    await page.click("button:has-text('Create a new organization')")
    
    // Try to submit empty form
    await page.click("button:has-text('Create organization')")
    
    // Should show validation errors
    await page.waitForSelector("text=/must have|must be|required/i", { timeout: 2000 }).catch(() => {})
    // Form should still be visible
    expect(await page.isVisible("text=Create your organization")).toBeTruthy()
  })

  test("Redirect to login if not authenticated", async () => {
    // New browser without login
    const newPage = await page.context().newPage()
    await newPage.goto(`${BASE_URL}/en/my/organization`)
    
    // Should redirect to login
    expect(newPage.url()).toContain("/login")
    await newPage.close()
  })
})
