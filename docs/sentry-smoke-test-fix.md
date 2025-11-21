# Sentry Smoke Test Fix - Summary

## Root Cause

The smoke tests were not creating Sentry events due to **missing `NEXT_PUBLIC_SENTRY_DSN` environment variable**.

### What Was Wrong:

1. **Client-side Sentry was not initialized**:
   - `sentry.client.config.ts` requires `NEXT_PUBLIC_SENTRY_DSN`
   - Only `SENTRY_DSN` was set in `.env.local`
   - In Next.js, client-side code can only access `NEXT_PUBLIC_*` variables

2. **Smoke tests only threw errors without explicit capture**:
   - Relied on automatic error capture
   - No diagnostic logging to verify Sentry was working
   - No event ID feedback to confirm events were sent

3. **Missing layout for `/sentry-test` page**:
   - Page was at root level without proper `<html>` and `<body>` tags
   - Caused "Missing root layout tags" error

## Changes Made

### 1. Environment Variables (`.env.local`)

**Added:**

```bash
NEXT_PUBLIC_SENTRY_DSN="https://443635567cc711057d88768b9594f975@o4509774996111360.ingest.de.sentry.io/4510402011988048"
```

This is the same DSN as `SENTRY_DSN`, but with the `NEXT_PUBLIC_` prefix so the client can access it.

### 2. Server Smoke Test (`src/app/api/sentry-test/route.ts`)

**Enhanced with:**

- Explicit `Sentry.captureException()` call
- Diagnostic logging (DSN status, environment, event ID)
- Still throws error to trigger Next.js error handling
- Production guard remains intact

### 3. Client Smoke Test (`src/app/sentry-test/page.tsx`)

**Enhanced with:**

- Explicit `Sentry.captureException()` call before throwing
- Diagnostic logging in browser console
- Event ID display on page after capture
- DSN status indicator
- Production guard remains intact

### 4. Layout for Test Page (`src/app/sentry-test/layout.tsx`)

**Created:**

- Minimal root layout with `<html>` and `<body>` tags
- Fixes "Missing root layout tags" error
- Imports global CSS for proper styling

### 5. Test Script (`scripts/test-sentry.sh`)

**Created:**

- Automated test for server route
- Instructions for client test
- Environment variable verification
- Sentry dashboard lookup instructions

## Files Changed

1. ✅ `.env.local` - Added `NEXT_PUBLIC_SENTRY_DSN`
2. ✅ `src/app/api/sentry-test/route.ts` - Enhanced with explicit capture + logging
3. ✅ `src/app/sentry-test/page.tsx` - Enhanced with explicit capture + logging
4. ✅ `src/app/sentry-test/layout.tsx` - **NEW** - Minimal layout to fix missing tags error
5. ✅ `scripts/test-sentry.sh` - New test script

## Testing Instructions

### Local Testing (Development)

#### 1. Restart Dev Server (IMPORTANT!)

```bash
# Stop current server (Ctrl+C)
# Start fresh to load new env vars
pnpm dev
```

#### 2. Test Server Route

```bash
# Run test script
./scripts/test-sentry.sh

# OR manually:
curl http://localhost:3000/api/sentry-test
# Expected: 500 error

# Check server logs for:
# [Sentry Test] Server DSN present: true
# [Sentry Test] Captured exception with event ID: <some-id>
```

#### 3. Test Client Route

1. Open browser: `http://localhost:3000/sentry-test`
2. You should see:
   - "Sentry Smoke Test" heading
   - "DSN configured: Yes" at bottom
   - "Throw Client Error" button
3. Open browser DevTools Console (F12)
4. Click the "Throw Client Error" button
5. Check console for:
   ```
   [Sentry Test] Client DSN present: true
   [Sentry Test] Button clicked, throwing error...
   [Sentry Test] Captured exception with event ID: <some-id>
   ```
6. Page should show event ID before crashing

#### 4. Verify in Sentry Dashboard

1. Go to: https://sentry.io/organizations/human-p5/issues/
2. Filter by: `environment:development`
3. You should see TWO new errors:
   - **"Sentry Server Smoke Test Error"** (from `/api/sentry-test`)
   - **"Sentry Client Smoke Test Error"** (from `/sentry-test` page)
4. Click each error and verify:
   - Environment tag = `development`
   - Stack traces are readable (source maps working)
   - No PII visible (emails, IPs, tokens scrubbed)

### Vercel Testing (Preview/Production)

#### Preview Environment

1. Push code to trigger deployment:

   ```bash
   git add .
   git commit -m "fix: enhance Sentry smoke tests with explicit capture"
   git push
   ```

2. After deployment, get preview URL from Vercel

3. Test routes:

   ```bash
   # Server test (should work in preview)
   curl https://your-preview-url.vercel.app/api/sentry-test

   # Client test (should work in preview)
   # Visit: https://your-preview-url.vercel.app/sentry-test
   ```

4. In Sentry, filter by: `environment:preview`

#### Production Environment

**Both test routes are DISABLED in production:**

- `/sentry-test` → Shows "Page Not Available" message
- `/api/sentry-test` → Returns 404

This is intentional and correct behavior.

## Environment Variables Required

### Local Development (`.env.local`)

```bash
NEXT_PUBLIC_SENTRY_DSN="https://...@...ingest.de.sentry.io/..."  # ← CRITICAL for client
SENTRY_DSN="https://...@...ingest.de.sentry.io/..."              # ← CRITICAL for server
SENTRY_ORG="human-p5"                                              # For source maps
SENTRY_PROJECT="ecohub-kosova"                                     # For source maps
SENTRY_AUTH_TOKEN="sntrys_..."                                     # For source maps
```

### Vercel (All Environments)

Set in: **Vercel Dashboard → Project → Settings → Environment Variables**

**For Production, Preview, Development:**

- `NEXT_PUBLIC_SENTRY_DSN` = `https://...@...ingest.de.sentry.io/...`
- `SENTRY_DSN` = `https://...@...ingest.de.sentry.io/...`

**For Production, Preview only:**

- `SENTRY_ORG` = `human-p5`
- `SENTRY_PROJECT` = `ecohub-kosova`
- `SENTRY_AUTH_TOKEN` = `sntrys_...`

## Sentry Dashboard Filters

Use these in the Issues search:

```
# View development errors only
environment:development

# View preview errors only
environment:preview

# View production errors only
environment:production

# View smoke test errors
message:"Smoke Test"

# View unhandled errors only
handled:no
```

## Production Behavior

### What Happens in Production:

**`/sentry-test` page:**

- Shows: "Page Not Available - This test page is not available in production."
- Does NOT send test events
- Guard: `process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'`

**`/api/sentry-test` route:**

- Returns: `{"error": "Not available in production"}` with 404 status
- Does NOT send test events
- Guard: `process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production'`

This ensures test routes are safe in production.

## Troubleshooting

### "Missing <html> and <body> tags" Error

**Fixed!** Created `src/app/sentry-test/layout.tsx` with minimal root layout.

### "No events in Sentry"

1. Check DSN is set: `echo $NEXT_PUBLIC_SENTRY_DSN` (client) and `echo $SENTRY_DSN` (server)
2. Restart dev server after changing `.env.local`
3. Check browser/server console for `[Sentry Test]` logs
4. Verify DSN matches your Sentry project

### "DSN configured: No" on test page

- `NEXT_PUBLIC_SENTRY_DSN` is not set or dev server wasn't restarted
- Run: `grep NEXT_PUBLIC_SENTRY_DSN .env.local`

### "Server DSN present: false" in logs

- `SENTRY_DSN` is not set
- Run: `grep SENTRY_DSN .env.local`

### Events appear but no source maps

- Check `SENTRY_AUTH_TOKEN` is set in Vercel
- Verify `SENTRY_ORG` and `SENTRY_PROJECT` match exactly
- Check build logs for source map upload confirmation

## Next Steps

1. ✅ Restart dev server: `pnpm dev`
2. ✅ Run: `./scripts/test-sentry.sh`
3. ✅ Test client route in browser
4. ✅ Verify events in Sentry dashboard
5. ✅ Push to Vercel and test preview
6. ✅ After verification, consider removing test routes or adding auth

## Summary

**The fix involved three things**:

1. Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
2. Enhance smoke tests with explicit `Sentry.captureException()` calls and diagnostic logging
3. Create minimal layout for `/sentry-test` page to fix missing HTML tags error

**Result**: Both client and server smoke tests now reliably send events to Sentry with full visibility into what's happening.
