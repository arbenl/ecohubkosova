# E2E Testing Guide

This directory contains end-to-end tests for EcoHub Kosova using Playwright.

## Structure

```
e2e/
├── auth/                 # Authentication tests (signup, login, logout)
├── marketplace/          # Marketplace functionality tests
├── pages/               # Page Object Models
│   └── auth.page.ts     # AuthPage class for auth flows
├── helpers/             # Test utilities
│   └── test-utils.ts    # Shared helper functions
├── fixtures.ts          # Custom test fixtures
└── playwright.config.ts # Playwright configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Running dev server: `pnpm dev`
- Database seeded with test data (optional)

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e/auth/login.spec.ts

# Run with UI mode (recommended for development)
pnpm test:e2e --ui

# Run with debug mode
pnpm test:e2e --debug

# Generate coverage report
pnpm test:e2e --coverage
```

### Configuration

Tests run against `http://localhost:3000` (configured in `playwright.config.ts`).

**Key Settings:**
- Timeout: 30s per test
- Retries: 0 (1 on CI/CD)
- Workers: Multiple in parallel
- Report: HTML report in `playwright-report/`

## Page Object Model

Tests use the Page Object Model pattern for maintainability. Each page has a dedicated class:

### AuthPage Example

```typescript
import { AuthPage } from '../pages/auth.page';

test('register flow', async ({ page }) => {
  const authPage = new AuthPage(page);
  
  await authPage.navigateToRegister();
  await authPage.fillBasicInfo({
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    location: 'Prishtinë, Kosovë',
  });
  
  await authPage.selectRole('Individ');
  await authPage.clickContinue();
  await authPage.submitRegistration();
  await authPage.verifyRegistrationSuccess();
});
```

### Creating New Page Objects

1. Create class file: `e2e/pages/[feature].page.ts`
2. Define selectors as private properties
3. Add public methods for user interactions
4. Add assertion methods for verification

```typescript
export class MarketplacePage {
  private readonly listingTitle = 'input[placeholder="Përshkrim i listimit"]';
  
  constructor(private page: Page) {}
  
  async createListing(data: ListingData): Promise<void> {
    await this.page.fill(this.listingTitle, data.title);
    // ... more interactions
  }
  
  async verifyListingCreated(): Promise<void> {
    await expect(this.page).toHaveURL('/marketplace/listing/*');
  }
}
```

## Test Data

### Generating Unique Test Data

Use `generateTestEmail()` helper to create unique emails:

```typescript
import { generateTestEmail } from '../helpers/test-utils';

const email = generateTestEmail(); // test.1731234567890.abc123@example.com
```

This prevents test data collisions across runs.

## Best Practices

### 1. Use Explicit Waits

```typescript
// ✅ Good
await authPage.page.waitForURL('/auth/success', { timeout: 5000 });

// ❌ Avoid
await authPage.page.waitForTimeout(2000);
```

### 2. Test User Workflows

```typescript
// ✅ Good - Tests complete flow
test('user can register and login', async ({ page }) => {
  // ... register
  // ... login
  // ... verify dashboard
});

// ❌ Avoid - Too granular
test('email input accepts text', async ({ page }) => {
  // ...
});
```

### 3. Independent Tests

Each test should be able to run independently and in any order:

```typescript
// ✅ Good - Self-contained setup
test.beforeEach(async ({ page }) => {
  await authPage.navigateToLogin();
});

// ❌ Avoid - Depends on previous test
test('login', async () => { /* ... */ });
test('logout', async () => { /* ... */ }); // Fails if 'login' didn't run first
```

### 4. Meaningful Assertions

```typescript
// ✅ Good
await authPage.verifyRegistrationSuccess();
await expect(page).toHaveURL('/auth/success');

// ❌ Avoid
expect(page.url()).toBeTruthy();
```

## Priority Tests

### Phase 1 (Current)

- ✅ User Registration (signup.spec.ts)
- ✅ User Login (login.spec.ts)
- ✅ User Logout (logout.spec.ts)

### Phase 2 (Next)

- Marketplace: Create Listing
- Marketplace: View Listings
- Marketplace: View Details
- Marketplace: Contact Seller

### Phase 3

- Admin: Manage Users
- Admin: Manage Organizations
- Admin: Manage Listings

### Phase 4

- Search & Filter
- Notifications
- Profile Management
- Organization Management

## Debugging

### UI Mode (Recommended)

```bash
pnpm test:e2e --ui
```

Interactive mode with:
- Step-by-step execution
- Locator picker
- Network inspection
- DOM inspection

### Headed Mode

```bash
pnpm test:e2e --headed
```

Run tests with browser UI visible.

### Debug Mode

```bash
pnpm test:e2e --debug
```

Includes debugger breakpoints and Playwright Inspector.

### Screenshots & Videos

Tests automatically capture:
- Screenshots on failure
- Videos of full test runs (optional)

Located in: `test-results/`

## Troubleshooting

### Tests time out

**Problem:** Tests exceed 30s timeout
**Solution:** 
- Increase timeout in specific test: `test.setTimeout(60000)`
- Check if dev server is running
- Verify selectors match actual elements

### Selectors don't match

**Problem:** "locator not found" errors
**Solution:**
- Use UI mode to inspect and pick correct locators
- Check for dynamic content that loads after page ready
- Verify element visibility before interaction

### Tests pass locally but fail in CI

**Problem:** Race conditions or environment differences
**Solution:**
- Add explicit waits for network requests
- Mock API calls if needed
- Verify test data exists in staging DB
- Check timezone differences

### Database state issues

**Problem:** Tests fail due to existing test data
**Solution:**
- Use unique emails with `generateTestEmail()`
- Clean test data between runs if needed
- Use database transactions for test isolation

## Performance

### Running Tests Efficiently

```bash
# Run tests in parallel (default)
pnpm test:e2e

# Run serially (for debugging)
pnpm test:e2e --workers=1

# Run only critical path
pnpm test:e2e e2e/auth/*.spec.ts
```

Current test suite:
- **Total tests:** 20+
- **Estimated runtime:** ~2-3 minutes
- **Parallelization:** 4 workers

## CI/CD Integration

### GitHub Actions

Tests run on:
- Every PR
- Merge to main
- Scheduled daily

### Upload Artifacts

Failed test results are uploaded:
- Screenshots
- Videos
- HTML reports
- Traces

## Contributing

### Adding New Tests

1. Create test file: `e2e/[feature]/[scenario].spec.ts`
2. Use existing Page Objects or create new one
3. Follow naming convention: `test('should [action]')`
4. Add comments explaining complex interactions
5. Ensure test is independent and reproducible

### Code Style

```typescript
// Use async/await
test('should do something', async ({ page }) => {
  // Setup
  const authPage = new AuthPage(page);
  
  // Action
  await authPage.navigateToLogin();
  await authPage.login('email', 'pass');
  
  // Assert
  await authPage.verifyLoginSuccess();
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-page)

## Next Steps

1. ✅ Phase 1: Auth tests (COMPLETE)
2. Marketplace tests (e2e/marketplace/)
3. Admin tests (e2e/admin/)
4. Integration with CI/CD
5. Performance monitoring
