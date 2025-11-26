# CSP (Content Security Policy) Fix & E2E Testing Guide

## Problem Summary

The application was blocking almost all Next.js/Turbopack scripts due to an over-restrictive Content-Security-Policy:

```
Refused to load the script '/_next/...turbopack...js' because it violates
the Content Security Policy directive...
```

**Root Cause**: The CSP in `next.config.mjs` did not properly account for Turbopack's development mode requirements, which uses:

- `'unsafe-eval'` for JIT compilation and transforms
- `'unsafe-inline'` for injected dev scripts
- `blob:` protocol for web workers and dynamic imports
- WebSocket connections for HMR (Hot Module Replacement)

---

## Solution: Dev vs Prod CSP Separation

The fix implements **environment-aware CSP** in `next.config.mjs`:

### Development CSP (PERMISSIVE)

```javascript
const devCsp = [
  "default-src 'self' blob: data: http: https:;",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: http: https:;",
  "style-src 'self' 'unsafe-inline' blob: data:;",
  "img-src ... blob: data: http: https:;",
  "font-src 'self' data: blob:;",
  "connect-src ... blob: ws: wss:;",
  "media-src 'self' data: blob: http: https:;",
  "frame-src 'self' data: blob:;",
].join(" ")
```

**Why this works:**

- ✅ `'unsafe-eval'` + `'unsafe-inline'` allow Turbopack JIT transforms
- ✅ `blob:` allows web workers and dynamic code loading
- ✅ `http: https: ws: wss:` allow localhost dev server + HMR WebSocket
- ✅ Permissive enough that no dev scripts are blocked

### Production CSP (STRICT)

```javascript
const prodCsp = [
  "default-src 'self';",
  "script-src 'self' 'strict-dynamic' 'nonce-{nonce}';",
  "style-src 'self';",
  "img-src ...;",
  "font-src 'self' data:;",
  "connect-src ...;",
  // ... other directives
].join(" ")
```

**Why this is secure:**

- ✅ Strict CSP for production with nonce-based script execution
- ✅ No `'unsafe-eval'` or `'unsafe-inline'`
- ✅ Compatible with Next.js compiled bundles (which are deterministic, so nonce can be set once per build)

---

## Files Changed

### 1. `next.config.mjs`

**Changed:**

- Split CSP into `prodCsp` and `devCsp` constants
- Conditionally apply based on `process.env.NODE_ENV`
- Added `http:`, `https:`, `ws:`, `wss:` to `devConnectSrc`
- Added `blob:` to script-src, style-src, connect-src in dev

**Key code:**

```javascript
const isProd = process.env.NODE_ENV === 'production'

// ... devCsp definition ...
// ... prodCsp definition ...

const csp = isProd ? prodCsp : devCsp

// Applied in headers()
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [{
        key: "Content-Security-Policy",
        value: csp.replace(/\s{2,}/g, " ").trim(),
      }, ...],
    },
  ]
}
```

---

## E2E Testing for CSP Violations

Two new E2E test files detect CSP problems automatically:

### 1. `e2e/auth.e2e.spec.ts` (Updated)

**New feature:** CSP monitoring in auth flow tests

Each test:

1. Sets up console monitoring via `setupCSPMonitoring(page)`
2. Watches for keywords: `"Refused to load"`, `"Content Security Policy"`, etc.
3. **Fails if ANY CSP violations occur**
4. Tests cover:
   - Login page load
   - Form submission
   - Dashboard access
   - Logout
   - Multiple route navigation

**Example test:**

```typescript
test("TC-001: Login with valid credentials (no CSP violations)", async ({ page }) => {
  const csp = setupCSPMonitoring(page)

  // ... perform login ...

  csp.throwIfViolations()
  console.log(`✓ TC-001 passed, no CSP violations`)
})
```

### 2. `e2e/csp-detection.e2e.spec.ts` (New)

**Dedicated CSP testing** with network and console monitoring:

- Checks if Turbopack/Next.js scripts are loaded
- Monitors for inline CSP violation messages
- Tests all key routes for CSP issues
- Reports blocked resources count

**Example:**

```typescript
test("should load login page without CSP violations", async ({ page }) => {
  const cspCollector = createCSPViolationCollector()
  page.on("console", cspCollector.consoleHandler)
  page.on("response", cspCollector.responseHandler)

  await page.goto(LOGIN_URL)
  cspCollector.throwIfViolations()
})
```

---

## How to Run the Tests

### Run all auth tests (including CSP checks):

```bash
export SKIP_WEB_SERVER=1  # Dev server must be running
pnpm exec playwright test e2e/auth.e2e.spec.ts
```

### Run only CSP detection tests:

```bash
export SKIP_WEB_SERVER=1
pnpm exec playwright test e2e/csp-detection.e2e.spec.ts
```

### Run with verbose output:

```bash
export SKIP_WEB_SERVER=1
pnpm exec playwright test e2e/auth.e2e.spec.ts --reporter=list
```

### Watch a test in headed mode:

```bash
export SKIP_WEB_SERVER=1
pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001" --headed --workers=1
```

---

## Verifying the Fix Works

### In Browser DevTools

1. Open `http://localhost:3000/sq/home` in dev
2. Open **DevTools Network tab**
3. Look for scripts: All `/_next/..js` files should show **200 status** (not blocked:csp)
4. Open **Console tab**
5. Should see **NO errors** starting with "Refused to load" or "Content Security Policy"

### With Playwright Tests

Run:

```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts
```

**Expected output:**

```
✓ TC-001 Login successful, no CSP violations
✓ TC-002 Invalid credentials handled, no CSP violations
✓ TC-003 Dashboard accessible, no CSP violations
✓ TC-004 Unauthenticated redirect works, no CSP violations
... all tests passing
```

If CSP violations are detected, test will fail with:

```
❌ CSP Violations detected:
  - [error] Refused to load the script ...
```

---

## Future Prevention: CI/CD Integration

### Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:csp": "playwright test e2e/csp-detection.e2e.spec.ts",
    "test:e2e:auth": "playwright test e2e/auth.e2e.spec.ts"
  }
}
```

### GitHub Actions Example:

```yaml
- name: Run E2E CSP Tests
  run: |
    pnpm dev > /dev/null 2>&1 &
    sleep 10
    export SKIP_WEB_SERVER=1
    pnpm test:e2e
```

If anyone accidentally tightens the dev CSP (e.g., removes `blob:` or `'unsafe-eval'`), the E2E tests will **automatically fail** in CI, catching the issue before deployment.

---

## Technical Details

### Why `'unsafe-eval'` is needed in dev (but not prod):

Turbopack in dev mode JIT-compiles modules on-the-fly:

```javascript
// Turbopack internally does something like:
new Function(`... dynamic module code ...`)()
```

This requires `'unsafe-eval'`. In production, Next.js pre-compiles everything, so it's not needed and can be safely removed.

### Why `blob:` is needed in dev:

1. **Web Workers**: Turbopack uses `new Blob()` + `URL.createObjectURL()` for worker code
2. **Dynamic imports**: Some bundled code creates blob URLs for code loading
3. **Hot Module Replacement**: HMR frames may use blob sources

### WebSocket connections (`ws: wss:`):

Turbopack HMR client connects to dev server via WebSocket:

```
ws://localhost:3000/_next/webpack_hmr
```

The `connect-src` must allow `ws:` and `wss:` protocols.

---

## Troubleshooting

### Tests still show CSP violations?

1. **Verify `next.config.mjs` was updated:**

   ```bash
   grep -A 5 "devCsp =" next.config.mjs
   ```

2. **Check that dev server restarted:**

   ```bash
   pkill -f "next dev"
   pnpm dev
   ```

3. **Clear browser cache:**
   - DevTools → Application → Clear site data
   - Or use incognito window

### "Refused to load the script" still appears?

1. Check the script URL in the error message (e.g., `/_next/...turbopack...js`)
2. Verify the source in `connect-src` CSP directive
3. Make sure `'unsafe-eval'` and `'unsafe-inline'` are in `script-src`

### E2E tests timeout?

1. Ensure dev server is running: `pnpm dev`
2. Check dev server is healthy: `curl http://localhost:3000/sq`
3. Run tests with verbose logging: `--reporter=list`

---

## Summary

| Aspect                      | Before             | After                          |
| --------------------------- | ------------------ | ------------------------------ |
| Dev CSP blocking scripts    | ❌ Yes, breaks dev | ✅ Permissive, Turbopack works |
| Prod CSP strength           | Same as dev        | ✅ Strict & secure             |
| CSP violations detected     | ❌ Manual testing  | ✅ Automatic E2E tests         |
| CI/CD regression prevention | ❌ None            | ✅ E2E fails if CSP tightened  |

The fix ensures:

- ✅ Dev mode is **fully functional** (no blocked scripts)
- ✅ Prod is **still secure** (strict CSP with nonce)
- ✅ **Regression prevention** via automated E2E CSP violation detection
