# Sentry API Route Not Working - Troubleshooting Guide

## Quick Diagnosis

Run this command to test the API route:

```bash
./scripts/test-sentry-api.sh
```

## Common Issues & Solutions

### Issue 1: Dev Server Not Running

**Symptom**: `curl` fails with connection error

**Solution**:

```bash
# Start dev server
pnpm dev
```

### Issue 2: Sentry Not Initialized on Server

**Symptom**: Response shows `"sentryInitialized": false`

**Possible Causes**:

1. `SENTRY_DSN` not set in `.env.local`
2. Server config file not loaded
3. Dev server needs restart

**Solution**:

```bash
# 1. Check DSN is set
grep SENTRY_DSN .env.local

# 2. Restart dev server (IMPORTANT!)
# Stop with Ctrl+C, then:
pnpm dev
```

### Issue 3: Event Captured But Not in Sentry Dashboard

**Symptom**: Response shows event ID, but nothing in Sentry

**Possible Causes**:

1. Wrong DSN (different project)
2. Network/firewall blocking Sentry
3. Event still in queue (wait 30 seconds)

**Solution**:

```bash
# 1. Verify DSN matches your Sentry project
echo $SENTRY_DSN
# Should be: https://...@...ingest.de.sentry.io/4510402011988048

# 2. Check Sentry dashboard
# Go to: https://sentry.io/organizations/human-p5/issues/
# Filter: environment:development

# 3. Wait 30 seconds and refresh
```

### Issue 4: No Console Logs Appearing

**Symptom**: No `[Sentry Test API]` logs in terminal

**Possible Causes**:

1. Looking at wrong terminal
2. Logs being suppressed
3. Route not being hit

**Solution**:

```bash
# Make sure you're looking at the terminal where "pnpm dev" is running
# You should see logs like:
# [Sentry Test API] ==================
# [Sentry Test API] Server DSN present: true
# [Sentry Test API] Captured exception with event ID: abc123...
```

## Step-by-Step Verification

### Step 1: Verify Environment Variables

```bash
# Check .env.local has both DSNs
cat .env.local | grep SENTRY_DSN

# Expected output:
# SENTRY_DSN="https://443635567cc711057d88768b9594f975@o4509774996111360.ingest.de.sentry.io/4510402011988048"
# NEXT_PUBLIC_SENTRY_DSN="https://443635567cc711057d88768b9594f975@o4509774996111360.ingest.de.sentry.io/4510402011988048"
```

### Step 2: Restart Dev Server

```bash
# This is CRITICAL - env vars are only loaded on server start
# Stop current server (Ctrl+C)
pnpm dev
```

### Step 3: Test API Route

```bash
# In a NEW terminal (keep dev server running in the other)
curl http://localhost:3000/api/sentry-test

# Expected response (formatted):
# {
#   "error": "Sentry Server Smoke Test Error",
#   "eventId": "abc123...",
#   "sentryInitialized": true,
#   "dsnConfigured": true
# }
```

### Step 4: Check Server Logs

Look at the terminal where `pnpm dev` is running. You should see:

```
[Sentry Test API] ==================
[Sentry Test API] Server DSN present: true
[Sentry Test API] DSN value (first 20 chars): https://443635567cc
[Sentry Test API] Environment: development
[Sentry Test API] VERCEL_ENV: undefined
[Sentry Test API] Captured exception with event ID: abc123...
[Sentry Test API] Sentry client initialized: true
[Sentry Test API] Flushed Sentry queue
```

### Step 5: Verify in Sentry Dashboard

1. Go to: https://sentry.io/organizations/human-p5/issues/
2. Filter by: `environment:development`
3. Look for: **"Sentry Server Smoke Test Error"**
4. Click it and verify:
   - Tags include `test_type: server_smoke_test`
   - Tags include `route: /api/sentry-test`
   - Stack trace is visible

## If Still Not Working

### Check Sentry Server Config

```bash
# View the server config
cat sentry.server.config.ts

# Verify it has:
# - dsn: process.env.SENTRY_DSN
# - debug: process.env.NODE_ENV === "development"
```

### Check if Sentry is Blocking Events

Sometimes Sentry has rate limits or filters. Check:

1. Go to: https://sentry.io/settings/human-p5/projects/ecohub-kosova/filters/
2. Make sure "Localhost" is NOT in the ignored errors
3. Check rate limits: https://sentry.io/settings/human-p5/projects/ecohub-kosova/performance/

### Manual Test with Direct Sentry Call

Create a test file to verify Sentry works:

```typescript
// test-sentry-direct.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://443635567cc711057d88768b9594f975@o4509774996111360.ingest.de.sentry.io/4510402011988048",
  debug: true,
  environment: "test",
})

const eventId = Sentry.captureException(new Error("Direct Sentry Test"))
console.log("Event ID:", eventId)

await Sentry.flush(2000)
console.log("Flushed")
```

Run it:

```bash
npx tsx test-sentry-direct.ts
```

If this works, the issue is with the Next.js integration.

## Expected Behavior

When working correctly:

1. **Request**: `curl http://localhost:3000/api/sentry-test`
2. **Response**: JSON with `eventId` and `sentryInitialized: true`
3. **Server Logs**: Multiple `[Sentry Test API]` log lines
4. **Sentry Dashboard**: New error appears within 30 seconds

## Get Help

If none of this works, provide:

1. Output of: `./scripts/test-sentry-api.sh`
2. Server logs (the `[Sentry Test API]` lines)
3. Output of: `grep SENTRY .env.local`
4. Screenshot of Sentry dashboard filters
