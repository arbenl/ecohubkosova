# E2E Testing: Common Issues & Fixes for ecohubkosova

## Quick Diagnostics

Before running tests, verify your setup:

```bash
# 1. Check if Next.js dev server can start
pnpm dev

# 2. In another terminal, verify it's accessible
curl http://localhost:3000

# 3. Can you manually login?
# Visit http://localhost:3000/sq/login
# Try logging in with your test credentials

# 4. Check environment variables
echo $TEST_USER_EMAIL
echo $TEST_USER_PASSWORD
```

---

## Issue #1: Login Tests Timeout or Fail to Redirect

### Symptoms
```
Error: "Login failed - navigation did not occur within 10s"
Current URL: http://localhost:3000/sq/login
```

### Root Causes in ecohubkosova

Your app uses Supabase authentication with custom session versioning. If tests fail:

**Check 1: Supabase Configuration**
```bash
# Verify environment variables are set
grep "NEXT_PUBLIC_SUPABASE" .env.local
```

Expected output:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**If missing:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Find your project
3. Copy the URL and ANON_KEY
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart `pnpm dev`

**Check 2: Test User Actually Exists**
```bash
# Navigate to http://localhost:3000/sq/register
# Create a test user manually if needed
# Use email: test-user@example.com
# Password: TestPassword123!
```

**Check 3: Session Versioning**
Your app uses custom session versioning in `/src/lib/auth/session-version.ts`. This might cause issues.

Look for in `src/app/api/auth/signout/route.ts`:
```typescript
response.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
```

If this cookie isn't being cleared properly, old sessions might persist. **Fix**:

```typescript
// In signout route, ensure all auth cookies are cleared
response.cookies.set("__session", "", { path: "/", maxAge: 0 })
response.cookies.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)

// Also clear Supabase cookies
response.cookies.set("sb-access-token", "", { path: "/", maxAge: 0 })
response.cookies.set("sb-refresh-token", "", { path: "/", maxAge: 0 })
```

### Solution

1. **Clear browser data and restart**:
   ```bash
   # Kill dev server
   Ctrl+C
   
   # Clear everything
   rm -rf .next node_modules/.cache
   
   # Restart
   pnpm dev
   ```

2. **Test manually first**:
   - Open `http://localhost:3000/sq/login`
   - Try logging in manually
   - Does it work? If yes, issue is with test setup
   - If no, issue is with app/auth setup

3. **Update test with better debugging**:
   ```typescript
   // Add this to TC-001 test for debugging
   await page.screenshot({ path: './test-results/before-login.png' });
   await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL);
   await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD);
   await page.screenshot({ path: './test-results/form-filled.png' });
   
   await page.locator(selectors.loginButton).click();
   
   // Wait and log
   await page.waitForTimeout(2000);
   console.log('URL after login attempt:', page.url());
   console.log('Page content:', await page.content());
   
   await page.screenshot({ path: './test-results/after-login.png' });
   ```

---

## Issue #2: Logout Button Not Found

### Symptoms
```
Error: "Sign-out button not found"
Tried selectors: "button:has-text("Dilni")"
```

### Root Cause
The logout button might be:
- Hidden in a dropdown menu
- Inside a conditionally rendered header
- Has different text in your locale

### Debugging

1. **Run test in headed mode**:
   ```bash
   pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-005" --headed
   ```
   Watch where the logout button appears

2. **Use Inspector to find correct selector**:
   ```bash
   pnpm exec playwright test e2e/auth.e2e.spec.ts --debug
   ```
   - Click "Pick locator" button in Inspector
   - Click the logout button
   - Copy the suggested selector

3. **Check your header component**:
   Look in `src/components/layout/header/` for `sign-out-button.tsx`

   Current implementation:
   ```tsx
   <Button variant={variant} size={size} className={className} 
           onClick={handleClick} disabled={signOutPending}>
     {signOutPending ? (
       <span className="flex items-center gap-2">
         <Loader2 className="h-4 w-4 animate-spin" />
         Duke u çkyçur...
       </span>
     ) : (
       children
     )}
   </Button>
   ```
   
   The default text is "Dilni", but it might be wrapped in a menu.

### Solution

**Option A: Add data-testid to button** (Recommended)

In `src/components/layout/header/sign-out-button.tsx`:
```tsx
<Button 
  variant={variant} 
  size={size} 
  className={className}
  data-testid="sign-out-button"  // Add this
  onClick={handleClick} 
  disabled={signOutPending}
>
```

Then update test selector:
```typescript
const selectors = {
  signOutButton: '[data-testid="sign-out-button"]',
};
```

**Option B: Update selector to match your menu structure**

If button is in a menu dropdown, update selector:
```typescript
// Check if button is in dropdown
const menuButton = page.locator('button[aria-label="Profile"]').first();
if (await menuButton.isVisible()) {
  await menuButton.click();
  await page.waitForTimeout(300);
}

// Now click logout
const logoutButton = page.locator('button:has-text("Dilni")').first();
await logoutButton.click();
```

---

## Issue #3: Protected Dashboard Accessible Without Login

### Symptoms
```
SECURITY ISSUE: Dashboard accessible without authentication!
Current URL: http://localhost:3000/sq/dashboard
```

**THIS IS CRITICAL!**

### Root Cause
Middleware is not properly protecting the route. Check `middleware.ts`:

```typescript
const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/profile", "/marketplace/add"]
```

### Solution

1. **Verify middleware is protecting dashboard**:
   ```typescript
   // middleware.ts - Look for this section
   const isProtected = PROTECTED_PREFIXES.some((prefix) => 
     relativePathname.startsWith(prefix)
   );

   if (isProtected && !hasSession) {
     // MUST redirect to login
     const loginUrl = `/${locale}/${AUTH_PREFIXES[0]}`; // /locale/login
     return NextResponse.redirect(new URL(loginUrl, req.url));
   }
   ```

2. **Verify session detection is working**:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   const hasSession = Boolean(session);
   ```

   Add logging:
   ```typescript
   if (isProtected) {
     console.log('Protected route check:', {
       path: relativePathname,
       hasSession,
       userId: session?.user?.id,
     });
   }
   ```

3. **Restart dev server and check logs**:
   ```bash
   pnpm dev  # Watch console output
   
   # In another terminal, run test
   pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-004" --headed
   ```

4. **Check if cookies are being sent**:
   In Playwright test, add:
   ```typescript
   // After unauthenticated access attempt
   const cookies = await page.context().cookies();
   console.log('Cookies:', cookies.map(c => c.name));
   ```

---

## Issue #4: Session Not Persisting Across Navigations

### Symptoms
```
Getting redirected to login when navigating between pages after login
```

### Root Cause
Your app uses Supabase sessions with custom versioning. Session might not be properly stored.

### Debug Steps

1. **Check if session cookies are created**:
   ```typescript
   // Add to test after login
   const cookies = await page.context().cookies();
   const sessionCookies = cookies.filter(c => 
     c.name.includes('sb-') || c.name === '__session' || 
     c.name.includes('session')
   );
   console.log('Session cookies:', sessionCookies);
   expect(sessionCookies.length).toBeGreaterThan(0);
   ```

2. **Check session version cookie**:
   Look in `src/lib/auth/session-version.ts` for cookie handling.

   Current implementation expects:
   ```typescript
   const SESSION_VERSION_COOKIE = 'eco_session_version';
   ```

   Verify it's being set in `src/app/[locale]/(auth)/login/actions.ts`:
   ```typescript
   const newVersion = await incrementSessionVersion(userId);
   if (newVersion !== null) {
     const cookieStore = await cookies();
     cookieStore.set(SESSION_VERSION_COOKIE, String(newVersion), SESSION_VERSION_COOKIE_OPTIONS);
   }
   ```

3. **Test localStorage/sessionStorage**:
   Add to test:
   ```typescript
   const localStorageData = await page.evaluate(() => 
     JSON.stringify(localStorage)
   );
   console.log('localStorage:', localStorageData);
   ```

### Solution

**Ensure Auth Provider is properly initialized**:

In `src/lib/auth-provider.tsx`, verify `useAuth()` hook:
```tsx
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Verify session persistence on navigation**:
```typescript
// Add to test
const sessionBefore = await page.evaluate(() => 
  JSON.stringify(sessionStorage)
);

await page.goto(`${HOME_URL}/marketplace`);
await page.waitForLoadState('networkidle');

const sessionAfter = await page.evaluate(() => 
  JSON.stringify(sessionStorage)
);

expect(sessionBefore).toBe(sessionAfter);
```

---

## Issue #5: Locale Routing Issues

### Symptoms
```
Test tries to visit /login but gets 404
Current URL: http://localhost:3000/404
```

### Root Cause
Your app uses Next.js `[locale]` dynamic routing. Tests must include locale in URL.

### Solution

The test already does this correctly:
```typescript
const LOCALE = 'sq'; // or 'en', 'fr', etc.
const LOGIN_URL = `/${LOCALE}/login`;
```

**If tests are still failing:**

1. **Check available locales**:
   ```bash
   grep -r "as const" src/lib/locales.ts | head -5
   ```

   Should show something like:
   ```
   const LOCALES = ['sq', 'en', 'fr'] as const;
   ```

2. **Update LOCALE in test**:
   ```typescript
   // e2e/auth.e2e.spec.ts
   const LOCALE = 'en'; // Change from 'sq' to match your needs
   ```

3. **Verify middleware handles locale**:
   ```typescript
   // middleware.ts - check locale extraction
   const pathSegments = pathname.split("/").filter(Boolean);
   const locale = pathSegments[0];
   const relativePathname = "/" + pathSegments.slice(1).join("/");
   ```

---

## Issue #6: Tests Pass Locally But Fail in CI/CD

### Common Causes
1. Environment variables not set
2. Database state is different (test data doesn't exist)
3. Timing issues on slower CI machines
4. Browser cache not cleared between runs

### Solutions

1. **Set environment variables in CI**:
   ```yaml
   # .github/workflows/e2e-tests.yml
   - run: pnpm exec playwright test e2e/auth.e2e.spec.ts
     env:
       TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
       TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
   ```

2. **Increase timeouts for CI**:
   ```typescript
   // e2e/auth.e2e.spec.ts
   if (process.env.CI) {
     test.setTimeout(60000); // 60 seconds in CI
   }
   ```

3. **Create test user if it doesn't exist**:
   Add a setup step in CI:
   ```yaml
   - name: Create test user
     run: node scripts/create-test-user.js
     env:
       SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
       SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
   ```

4. **Clear browser cache**:
   ```typescript
   test.beforeEach(async ({ page, context }) => {
     await context.clearCookies();
     await page.evaluate(() => {
       localStorage.clear();
       sessionStorage.clear();
     });
   });
   ```

---

## Issue #7: Google Sign-In Not Working in Tests

### Symptoms
```
Google sign-in button not clickable or not working
```

### Root Cause
Playwright can't easily handle OAuth redirects. Recommended: Skip Google tests, test email/password flow.

### Solution

**Option 1: Skip Google tests**
```typescript
test.skip('Google sign-in', async ({ page }) => {
  // Google sign-in can't be reliably tested with Playwright
});
```

**Option 2: Mock Google auth** (Advanced)
```typescript
// This requires intercepting the OAuth callback
test('Google sign-in flow', async ({ page, context }) => {
  // Mock the Google OAuth response
  await context.route('**/accounts.google.com/**', route => {
    route.abort();
  });
  
  // Then simulate the callback
  // This is complex - recommend skipping this test
});
```

**Recommendation**: Focus tests on email/password auth (more reliable), test OAuth manually once.

---

## Testing Checklist

Before running full test suite, verify:

- [ ] `pnpm dev` runs without errors
- [ ] Can manually login at http://localhost:3000/sq/login
- [ ] Dashboard accessible after manual login
- [ ] Logout button appears after login
- [ ] Test user credentials in environment variables
- [ ] Playwright browsers installed: `pnpm exec playwright install`
- [ ] No TypeScript errors: `pnpm build`

If all checkboxes pass, run:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts
```

---

## Quick Commands

```bash
# Run all tests
pnpm exec playwright test e2e/auth.e2e.spec.ts

# Run specific test
pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001"

# Run with browser visible (headed)
pnpm exec playwright test e2e/auth.e2e.spec.ts --headed

# Run in interactive debug mode
pnpm exec playwright test e2e/auth.e2e.spec.ts --debug

# View test report
pnpm exec playwright show-report

# Run with verbose logging
pnpm exec playwright test e2e/auth.e2e.spec.ts --reporter=list

# Clear cache and reinstall
rm -rf .next node_modules/.cache
pnpm install
pnpm exec playwright install
```

---

## Need More Help?

When reporting test failures, include:

1. **Error message** (full stack trace)
2. **Test name** (TC-001, TC-002, etc.)
3. **Environment**:
   ```bash
   node --version
   pnpm --version
   grep "next" package.json
   ```
4. **Logs from `pnpm dev`** (copy/paste console output)
5. **Screenshots** from `test-results/` directory
6. **Relevant code** from `src/app/[locale]/(auth)/login/` if you modified it

---

## References

- Playwright Docs: https://playwright.dev
- Supabase Auth: https://supabase.com/docs/guides/auth
- Next.js + Playwright: https://nextjs.org/docs/testing
- Your app's auth: `src/lib/auth-provider.tsx`
- Your app's login: `src/app/[locale]/(auth)/login/page.tsx`
- Your app's middleware: `middleware.ts`
