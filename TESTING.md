# Testing Guide

## Overview

This project uses a comprehensive testing strategy with both unit tests (Vitest) and end-to-end tests (Playwright). The E2E tests are enhanced with MCP (Model Context Protocol) integration for AI-driven testing.

## Local Development Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/auth-flow.e2e.spec.ts

# Run tests in headed mode (see browser)
npm run e2e:headed

# Debug tests
npm run e2e:debug

# View test report
npm run e2e:report
```

## Test Structure

```
e2e/
├── auth-flow.e2e.spec.ts      # Authentication tests
├── dashboard.e2e.spec.ts      # Dashboard functionality
├── navigation.e2e.spec.ts     # Navigation tests
└── critical-flows.spec.ts     # Critical user journey tests
```

## MCP Integration

### Playwright MCP Server

The project includes Playwright MCP server integration for AI-driven browser automation.

#### Installation

The Playwright MCP server runs via npx and doesn't need to be installed locally.

#### Configuration

For Codex CLI users, add the Playwright MCP server:

```bash
codex mcp add playwright npx "@playwright/mcp@latest"
```

Or manually edit your MCP configuration file:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_TEST_ID_ATTRIBUTE": "data-testid"
      }
    }
  }
}
```

#### Usage Examples

Once configured, you can use natural language commands like:

- "Run the login flow test and check for any errors"
- "Navigate to the dashboard and verify the main title is visible"
- "Test the user registration form with valid data"
- "Check if the marketplace page loads correctly"

### EcoHub QA MCP Server

The project also includes a custom EcoHub QA MCP server with specialized testing tools:

- `tests_orchestrator` - Bulk test operations
- `coverage_audit` - Coverage analysis
- `build_health` - Build status checks

## Test Data and Environment

### Environment Variables

Create a `.env.test` file for test-specific configuration:

```env
# Database
DATABASE_URL="postgresql://test:test@localhost:5432/ecohub_test"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-test-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-test-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-test-service-key"

# Test user credentials (if needed)
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="password123"
```

### Test Database

```bash
# Reset test database
npm run db:reset:test

# Seed test data
npm run db:seed:test
```

## Writing Tests

### Stable Selectors

Use `data-testid` attributes for reliable element selection:

```tsx
// In component:
<input data-testid="login-email-input" />

// In test:
await page.fill('[data-testid="login-email-input"]', 'test@example.com')
```

### Test Best Practices

1. **Use descriptive test names** that explain the behavior being tested
2. **Avoid arbitrary waits** - use `waitForURL`, `waitForSelector`, or expect-based waits
3. **Test user behavior, not implementation details**
4. **Keep tests fast and deterministic**
5. **Use page objects** for complex interactions

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('User Authentication', () => {
  test('should allow user to log in with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="login-email-input"]', 'user@example.com')
    await page.fill('[data-testid="login-password-input"]', 'password')
    await page.click('[data-testid="login-submit-button"]')

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('[data-testid="dashboard-main-title"]')).toBeVisible()
  })
})
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Manual triggers

### Required Checks

- ✅ Unit tests pass
- ✅ E2E tests pass
- ✅ Code coverage meets minimum threshold (70%)
- ✅ Linting passes
- ✅ TypeScript compilation succeeds

## Troubleshooting

### Common Issues

1. **Tests failing due to timing issues**
   - Increase timeout values in `playwright.config.ts`
   - Use `waitFor` methods instead of fixed delays

2. **Database connection issues**
   - Ensure test database is running
   - Check `.env.test` configuration

3. **Browser context issues**
   - Clear browser cache/storage between tests
   - Use `page.context().clearCookies()` if needed

4. **MCP server connection issues**
   - Verify the MCP server is running
   - Check configuration in your MCP client

### Debug Mode

```bash
# Run E2E tests in debug mode
npm run e2e:debug

# Run with browser visible
npm run e2e:headed
```

## Contributing

When adding new features:

1. **Write unit tests** for individual functions/components
2. **Add E2E tests** for user-facing features
3. **Update this documentation** if testing patterns change
4. **Ensure all tests pass** before submitting PR

## Performance

- **Unit tests**: Should complete in < 30 seconds
- **E2E tests**: Should complete in < 5 minutes
- **Coverage**: Maintain > 70% code coverage

## Support

For testing-related issues:
1. Check the test output for specific error messages
2. Review the Playwright trace files (in `playwright-report/`)
3. Consult the [Playwright documentation](https://playwright.dev/)
4. Check the MCP server logs for AI-driven testing issues