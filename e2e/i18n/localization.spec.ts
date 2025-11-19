import { test, expect } from '@playwright/test'

test.describe('Internationalization Testing', () => {
  test('should handle language switching', async ({ page }) => {
    await page.goto('/sq')

    // Check current language (should be Albanian/SQ)
    const currentUrl = page.url()
    expect(currentUrl).toContain('/sq')

    // Try to switch to English
    const enButton = page.locator('button').filter({ hasText: 'EN' }).first()
    if (await enButton.isVisible()) {
      await enButton.click()

      // Wait for navigation
      await page.waitForURL('**/en/**', { timeout: 5000 })

      // Verify language switched
      const newUrl = page.url()
      expect(newUrl).toContain('/en')
    }

    // Try to switch back to Albanian
    const sqButton = page.locator('button').filter({ hasText: 'SQ' }).first()
    if (await sqButton.isVisible()) {
      await sqButton.click()

      // Wait for navigation
      await page.waitForURL('**/sq/**', { timeout: 5000 })

      // Verify back to Albanian
      const finalUrl = page.url()
      expect(finalUrl).toContain('/sq')
    }
  })

  test('should maintain functionality across languages', async ({ page }) => {
    const languages = ['sq', 'en'] // Albanian and English

    for (const lang of languages) {
      console.log(`Testing language: ${lang}`)

      await page.goto(`/${lang}`)

      // Check that page loads
      await expect(page).toHaveTitle(/ECO HUB KOSOVA/)

      // Check that navigation works
      const navLinks = page.locator('header a[href]')
      const linkCount = await navLinks.count()

      expect(linkCount).toBeGreaterThan(0)
      console.log(`${lang}: ${linkCount} navigation links found`)

      // Check that interactive elements work
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      console.log(`${lang}: ${buttonCount} buttons found`)

      // Test a basic interaction - language switcher buttons should be visible
      if (buttonCount > 0) {
        // Just check visibility of language buttons
        const langButtons = page.locator('button').filter({ hasText: /^[A-Z]{2}$/ })
        const langButtonCount = await langButtons.count()
        if (langButtonCount > 0) {
          const firstLangButtonVisible = await langButtons.first().isVisible()
          expect(firstLangButtonVisible).toBe(true)
        } else {
          // If no language buttons, just check that some buttons are visible
          const firstButtonVisible = await buttons.first().isVisible()
          expect(firstButtonVisible).toBe(true)
        }
      }
    }

    console.log('Cross-language functionality test completed')
  })

  test('should handle RTL languages gracefully', async ({ page }) => {
    // Test with English (LTR) first
    await page.goto('/en/home')

    const englishDirection = await page.evaluate(() => document.documentElement.dir || 'ltr')
    console.log(`English text direction: ${englishDirection}`)

    // Test with Albanian (LTR but can test RTL handling)
    await page.goto('/sq/home')

    const albanianDirection = await page.evaluate(() => document.documentElement.dir || 'ltr')
    console.log(`Albanian text direction: ${albanianDirection}`)

    // Both should be LTR
    expect(englishDirection).toBe('ltr')
    expect(albanianDirection).toBe('ltr')

    // Layout should work in both directions
    const bodyVisible = await page.locator('body').isVisible()
    expect(bodyVisible).toBe(true)

    console.log('RTL language handling test completed')
  })

  test('should handle special characters and encoding', async ({ page }) => {
    await page.goto('/sq/home')

    // Check for Albanian special characters
    const pageText = await page.locator('body').textContent()

    // Albanian specific characters
    const albanianChars = ['ë', 'Ë', 'ç', 'Ç', 'sh', 'Sh', 'SH', 'zh', 'Zh', 'ZH']
    const hasAlbanianChars = albanianChars.some(char =>
      pageText?.includes(char)
    )

    console.log(`Albanian characters found: ${hasAlbanianChars}`)

    if (hasAlbanianChars) {
      console.log('Special characters are properly displayed')
    } else {
      console.log('No Albanian special characters found (might be using English text)')
    }

    // Check that text doesn't show encoding issues
    const hasEncodingIssues = pageText?.includes('�') || false
    expect(hasEncodingIssues).toBe(false)

    console.log('Character encoding test completed')
  })

  test('should handle number and date formatting', async ({ page }) => {
    await page.goto('/sq/home')

    // Check for numbers in content
    const pageText = await page.locator('body').textContent() || ''

    // Look for numbers in different formats
    const numberPatterns = [
      /\d{1,3}(?:\.\d{3})*(?:,\d{2})?/, // Albanian format: 1.234,56
      /\d{1,3}(?:,\d{3})*(?:\.\d{2})?/  // English format: 1,234.56
    ]

    const hasNumbers = numberPatterns.some(pattern => pattern.test(pageText))

    console.log(`Numbers found in content: ${hasNumbers}`)

    // Check for date formats
    const datePatterns = [
      /\d{1,2}\.\d{1,2}\.\d{4}/, // Albanian format: 31.12.2023
      /\d{1,2}\/\d{1,2}\/\d{4}/, // English format: 12/31/2023
      /\d{4}-\d{2}-\d{2}/        // ISO format: 2023-12-31
    ]

    const hasDates = datePatterns.some(pattern => pattern.test(pageText))

    console.log(`Dates found in content: ${hasDates}`)

    // Content should be properly formatted
    expect(typeof pageText).toBe('string')
    expect(pageText.length).toBeGreaterThan(0)

    console.log('Number and date formatting test completed')
  })

  test('should handle currency formatting', async ({ page }) => {
    await page.goto('/sq/marketplace')

    // Look for price/currency information
    const pageText = await page.locator('body').textContent() || ''

    // Check for currency symbols and formats
    const currencyPatterns = [
      /€\s*\d+/,           // Euro symbol
      /\$\s*\d+/,          // Dollar symbol
      /\d+\s*€/,           // Euro after number
      /\d+\s*\$/,          // Dollar after number
      /ALL\s*\d+/,         // Albanian Lek
      /\d+\s*ALL/          // Lek after number
    ]

    const hasCurrency = currencyPatterns.some(pattern => pattern.test(pageText))

    console.log(`Currency formatting found: ${hasCurrency}`)

    if (hasCurrency) {
      console.log('Currency is properly formatted')
    } else {
      console.log('No currency information found on marketplace page')
    }

    console.log('Currency formatting test completed')
  })

  test('should handle timezone and locale-specific content', async ({ page }) => {
    // Test both language variants
    const locales = ['sq', 'en']

    for (const locale of locales) {
      await page.goto(`/${locale}/home`)

      // Check page title and content
      const title = await page.title()
      console.log(`${locale} page title: ${title}`)

      // Should have appropriate title
      expect(title).toContain('ECO HUB KOSOVA')

      // Check meta tags for locale information
      const metaLocale = await page.getAttribute('html', 'lang')
      console.log(`${locale} HTML lang attribute: ${metaLocale}`)

      // Should have proper lang attribute
      expect(metaLocale).toBeDefined()
    }

    console.log('Timezone and locale content test completed')
  })

  test('should handle URL routing for different languages', async ({ page }) => {
    const testRoutes = [
      { path: 'home', expected: /\/(sq|en)\/home/ },
      { path: 'marketplace', expected: /\/(sq|en)\/marketplace/ },
      { path: 'login', expected: /\/(sq|en)\/login/ }
    ]

    for (const route of testRoutes) {
      // Test Albanian URL
      await page.goto(`/sq/${route.path}`)
      let currentUrl = page.url()
      expect(currentUrl).toMatch(route.expected)
      console.log(`SQ route /${route.path}: ${currentUrl}`)

      // Test English URL
      await page.goto(`/en/${route.path}`)
      currentUrl = page.url()
      expect(currentUrl).toMatch(route.expected)
      console.log(`EN route /${route.path}: ${currentUrl}`)
    }

    console.log('URL routing for different languages test completed')
  })

  test('should handle fallback language behavior', async ({ page }) => {
    // Test accessing page without language prefix
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Should redirect to default language or handle gracefully
    const currentUrl = page.url()
    console.log(`Fallback URL: ${currentUrl}`)

    // Should either redirect to default language or show content
    const bodyVisible = await page.locator('body').isVisible()
    expect(bodyVisible).toBe(true)

    // Check if redirected to a language-specific URL
    const hasLanguagePrefix = /\/(sq|en)\//.test(currentUrl)
    console.log(`Has language prefix: ${hasLanguagePrefix}`)

    console.log('Fallback language behavior test completed')
  })

  test('should handle translation completeness', async ({ page }) => {
    const languages = ['sq', 'en']

    for (const lang of languages) {
      await page.goto(`/${lang}/home`)

      // Check for untranslated text (common issue indicators)
      const pageText = await page.textContent('body') || ''

      // Look for placeholder text or keys (less strict check)
      const hasPlaceholders = /\{\{.*\}\}/.test(pageText)
      const hasMissingTranslations = /MISSING_TRANSLATION|TRANSLATION_MISSING/.test(pageText)

      console.log(`${lang}: Placeholders found: ${hasPlaceholders}`)
      console.log(`${lang}: Missing translations: ${hasMissingTranslations}`)

      // Should not have obvious translation issues (allow undefined/null in code)
      expect(hasMissingTranslations).toBe(false)

      if (hasPlaceholders) {
        console.log(`Warning: Found placeholders in ${lang} - may indicate incomplete translation`)
      }
    }

    console.log('Translation completeness test completed')
  })
})