#!/bin/bash
# Footer Locale Verification Script (Playwright-backed)
# Runs a browser-level check to ensure footer language matches route locale.

set -euo pipefail

echo "🔍 Footer Locale Verification (Playwright)"
echo "=============================="
echo ""

# Use the Playwright suite so we assert visible text (not just static HTML).
# This uses the same baseURL and webServer command defined in playwright.config.ts.
pnpm exec playwright test e2e/i18n/footer-locale.spec.ts --project=chromium --config=playwright.config.ts --reporter=line "$@"
