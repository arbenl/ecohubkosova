# Sentry Deployment & Verification Guide

This guide walks you through verifying and testing your Sentry integration for EcoHub Kosova.

## 1. Environment Variables Verification

### On Vercel Dashboard

1. **Navigate to your project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `ecohubkosova` project

2. **Check Environment Variables**:
   - Click **Settings** → **Environment Variables**
   - Verify the following are set:

   | Variable                 | Type                | Scope               | Required For              |
   | ------------------------ | ------------------- | ------------------- | ------------------------- |
   | `NEXT_PUBLIC_SENTRY_DSN` | **Public** (client) | All environments    | ✅ Client error reporting |
   | `SENTRY_DSN`             | **Secret** (server) | All environments    | ✅ Server error reporting |
   | `SENTRY_ORG`             | Secret              | Production, Preview | 🔧 Source map upload      |
   | `SENTRY_PROJECT`         | Secret              | Production, Preview | 🔧 Source map upload      |
   | `SENTRY_AUTH_TOKEN`      | **Secret**          | Production, Preview | 🔧 Source map upload      |

3. **Environment Scope**:
   - ✅ = **Required for basic error reporting** (set for all: Production, Preview, Development)
   - 🔧 = **Required for source maps** (set for Production and Preview at minimum)

4. **Double-check**:
   ```
   NEXT_PUBLIC_SENTRY_DSN → Should be visible in Preview & Production (starts with https://...)
   SENTRY_DSN → Should match the public DSN (can be the same value)
   SENTRY_ORG → Your org slug (e.g., "human-p5")
   SENTRY_PROJECT → Your project slug (e.g., "ecohub-kosova")
   SENTRY_AUTH_TOKEN → Sensitive token from Sentry (hidden in UI)
   ```

### Local Verification

Check your `.env.local`:

```bash
# Should contain:
NEXT_PUBLIC_SENTRY_DSN=https://...@...ingest.sentry.io/...
SENTRY_DSN=https://...@...ingest.sentry.io/...
SENTRY_ORG=human-p5
SENTRY_PROJECT=ecohub-kosova
SENTRY_AUTH_TOKEN=sntrys_...
```

## 2. Deployment & Smoke Test Plan

### Step 1: Deploy to Preview

**Option A: Via Git Push**

```bash
# Make a trivial change to trigger deployment
git commit --allow-empty -m "chore: trigger Sentry verification deploy"
git push origin main  # or your feature branch
```

**Option B: Via Vercel UI**

- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
- Select **Redeploy**

### Step 2: Wait for Build

Monitor the build logs:

- Look for: `✓ Completed runAfterProductionCompile in XXXms`
- This confirms Sentry's build plugin ran
- Check for source map upload messages (if `SENTRY_AUTH_TOKEN` is set)

### Step 3: Run Smoke Tests

#### Local Testing (Development)

```bash
# Start dev server
pnpm dev

# In browser:
# 1. Client test: http://localhost:3000/sentry-test
#    → Click "Throw Client Error" button
#    → Should see React error boundary or error page
#    → Check browser console for Sentry event ID

# 2. Server test: http://localhost:3000/api/sentry-test
#    → Should return 500 error
#    → Check server logs for Sentry event ID

# Or via curl:
curl http://localhost:3000/api/sentry-test
# Expected: 500 response
```

#### Preview Testing

After Vercel deployment completes:

```bash
# Get your preview URL from Vercel (e.g., ecohubkosova-xyz123.vercel.app)

# 1. Client test:
# Visit: https://ecohubkosova-xyz123.vercel.app/sentry-test
# If production guard is active, should show "not available" message
# Otherwise, click button to throw error

# 2. Server test:
curl https://ecohubkosova-xyz123.vercel.app/api/sentry-test
# Expected: 404 (if production guard) or 500 (if guard allows preview)
```

#### Production Testing

**⚠️ IMPORTANT**: The test routes are guarded and will return 404 in production.

For production verification:

1. **Don't use test routes** (they're disabled)
2. **Trigger a real error** (e.g., navigate to a non-existent page like `/thispagedoesnotexist`)
3. **Or temporarily disable the guard** to test, then re-enable

## 3. Sentry Dashboard Verification

### Step 1: Access Sentry

1. Go to [sentry.io](https://sentry.io)
2. Navigate to your project: **human-p5** → **ecohub-kosova**
3. Click **Issues** to see errors

### Step 2: Verify Event Properties

For each test error that appears, check:

#### ✅ Environment Tag

- Click on an issue → **Tags** section
- `environment`: Should be `development`, `preview`, or `production`
- Matches where you triggered the error

#### ✅ Release Tag

- Look for `release` tag in the same section
- Should show a git commit SHA (e.g., `abc123def456`)
- Comes from `VERCEL_GIT_COMMIT_SHA` env var

#### ✅ Stack Trace (Source Maps)

- Scroll to **Exception** section
- Click on any line in the stack trace
- **Good**: Shows original file paths like `src/app/sentry-test/page.tsx:14`
- **Bad**: Shows minified paths like `webpack://.../_next/static/chunks/...`

**If source maps are missing**:

- Check `SENTRY_AUTH_TOKEN` is set in Vercel
- Look for upload errors in build logs
- Verify `SENTRY_ORG` and `SENTRY_PROJECT` match exactly

#### ✅ PII Scrubbing

- Click on an issue → **Additional Data** → **Request**
- **Check these are ABSENT**:
  - `user.email` (should be deleted)
  - `user.ip_address` (should be deleted)
  - `request.headers.Authorization` (should be deleted)
  - `request.headers.x-api-key` (should be deleted)

### Step 3: Useful Filters

Use these in the **Issues** search bar:

```
# View only production errors
environment:production

# View errors from a specific release
release:abc123def456

# View errors from specific routes
url:*/api/*
url:*/marketplace/*

# View unhandled errors only
handled:no

# Combine filters
environment:production handled:no
```

### Step 4: Set Up Alerts (Optional)

1. Go to **Alerts** → **Create Alert**
2. Recommended setup:
   - **Trigger**: When an issue is first seen
   - **Filter**: `environment:production`
   - **Action**: Email or Slack notification

## 4. Post-Deployment Checklist

Use this checklist for every production deployment:

### Pre-Deployment

- [ ] All Sentry env vars set in Vercel (verify in Settings → Environment Variables)
- [ ] `.env.local` has correct DSN for local testing
- [ ] Test routes (`/sentry-test`, `/api/sentry-test`) are guarded or removed

### Deploy

- [ ] Push code or trigger redeploy
- [ ] Monitor build logs for Sentry plugin completion
- [ ] Verify source map upload succeeded (check logs for `Uploading source maps`)

### Verification (Preview/Staging First)

- [ ] Visit preview URL home pages: `/en/home`, `/sq/home`
- [ ] Check browser console for any Sentry errors
- [ ] Optional: Trigger test error (if guards allow)

### Sentry Dashboard Check

- [ ] Open Sentry dashboard → **Issues**
- [ ] Filter by `environment:production` (or `preview`)
- [ ] For any new errors:
  - [ ] Environment tag is correct
  - [ ] Release shows git SHA
  - [ ] Stack traces are readable (source maps working)
  - [ ] No PII visible (emails, IPs, tokens)

### Production Safety

- [ ] Verify `/sentry-test` returns 404 in production
- [ ] Verify `/api/sentry-test` returns 404 in production
- [ ] Consider removing test routes entirely after initial verification

### Ongoing Monitoring

- [ ] Set up Sentry alerts for production errors
- [ ] Check Sentry weekly for new issues
- [ ] Review error trends before each release

---

## Troubleshooting

### No Events Appearing

1. **Check browser console**: Should see Sentry event ID logged
2. **Check server logs**: Should see `Event sent to Sentry: <event-id>`
3. **Verify DSN**: In browser DevTools → Network → Filter "sentry" → Should see requests
4. **Check tunnel**: Requests should go to `/monitoring` (tunnel route)

### Source Maps Not Working

1. **Verify build logs**: Look for `✓ Source maps uploaded to Sentry`
2. **Check token**: Ensure `SENTRY_AUTH_TOKEN` has `project:releases` scope
3. **Verify org/project**: Must exactly match Sentry project settings
4. **Redeploy**: Sometimes first deploy fails, redeploy to retry upload

### PII Still Visible

1. **Check `beforeSend`**: Should be in all config files (client/server/edge)
2. **Clear cache**: Sentry might show cached data, wait 5 minutes
3. **Verify config**: Review `sentry.*.config.ts` files for `beforeSend` hook

### Test Routes Not Working

1. **Development**: Should work normally
2. **Preview**: Check if `VERCEL_ENV` or `NODE_ENV` guards are blocking
3. **Production**: Intentionally blocked by guards (this is correct)

---

## Quick Reference

**Env Vars Priority**:

1. `NEXT_PUBLIC_SENTRY_DSN` - **CRITICAL** (client-side)
2. `SENTRY_DSN` - **CRITICAL** (server-side)
3. `SENTRY_AUTH_TOKEN` - Important (source maps)
4. `SENTRY_ORG` + `SENTRY_PROJECT` - Important (source maps)

**Test Routes**:

- Client: `/sentry-test` (button click)
- Server: `/api/sentry-test` (GET request)

**Sentry Dashboard Checks**:

- Environment ✅
- Release ✅
- Source maps ✅
- No PII ✅
