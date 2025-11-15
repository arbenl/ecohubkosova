# Vercel Deployment Troubleshooting Guide

## Problem: API Profile Endpoint Returns 500 Error

The `/api/auth/profile` endpoint is returning a 500 error when accessing user profiles in production.

### Root Cause

The `/api/auth/profile` endpoint needs **direct database access** to fetch user profiles, which requires the 
`SUPABASE_DB_URL` environment variable. This variable is likely **not set** in your Vercel dashboard.

## What's Missing in Vercel

Check your Vercel environment variables. You should have:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` (public)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (optional but good to have)
- ❌ `SUPABASE_DB_URL` (REQUIRED for profile endpoint)

## How Profile Fetch Works

1. Client calls `/api/auth/profile`
2. Server checks session cookies from Supabase Auth
3. Gets user ID from session
4. Connects to Supabase database using SUPABASE_DB_URL + Drizzle ORM
5. Returns profile or error

**The problem**: Without `SUPABASE_DB_URL`, step 4 fails with 500 error.

## Required Fixes

### Step 1: Get Your Credentials from Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to: **Project Settings** → **API** (or **Database**)
4. Copy your credentials

### Step 2: Add to Vercel Dashboard

Example `.env` that should be set in Vercel:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_DB_URL=postgresql://postgres....
```

#### Variable 1: SUPABASE_DB_URL
```
Name: SUPABASE_DB_URL
Value: postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require

Environments: 
  ✓ Production
  ✓ Preview
  (Optional) Development
```

⚠️ **IMPORTANT**: Get this value from your Supabase Dashboard → Project Settings → Database → Connection String → URI.
⚠️ **SECURITY**: Never commit actual database connection strings to the repository.

#### Variable 2: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[REDACTED_SERVICE_ROLE_KEY]

Environments:
  ✓ Production
  ✓ Preview
```

⚠️ **IMPORTANT**: Get this value from your Supabase Dashboard → Project Settings → API → Service Role Secret Key (or from `.env.local` if using Vercel CLI).
⚠️ **SECURITY**: Never commit actual secret values to the repository. Use placeholder values in documentation.

### Step 3: Verify Public Variables Are Still Set

Make sure these are still configured (they should be):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Deploy and Test

```bash
git push
```

This triggers a new Vercel build. Test the endpoint:

```bash
curl https://your-domain.vercel.app/api/auth/profile
```

Expected response (when authenticated):
```json
{ "userId": "abc-123-def-456" }
```

## Alternative: Use Vercel CLI

If you prefer CLI:

```bash
# Login to Vercel
vercel login

# Add environment variables interactively
vercel env add SUPABASE_DB_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Pull them locally
vercel env pull .env.local

# Push changes and redeploy
git push
```

## Common Issues & Solutions

### Issue 1: 500 Error on `/api/auth/profile`

**Cause**: `SUPABASE_DB_URL` is missing in Vercel

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `SUPABASE_DB_URL` for Production and Preview environments
3. Redeploy: `git push`

### Issue 2: Unauthorized (401) on Profile Endpoint

**Cause**: User session is invalid or expired

**Fix**:
1. Make sure user is logged in (check cookies)
2. Try logging out and back in

### Issue 3: "Connection refused" or Timeout Errors

**Causes**:
- Missing `SUPABASE_DB_URL` (profile endpoint returns 500)
- Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Incorrect keys (copy-paste error, truncated value)

**Fix**:
1. Double-check all 4 variables are set in Vercel
2. Copy the FULL values (don't truncate)
3. Make sure production credentials are used
4. Redeploy and test

### Issue 4: "Database connection failed" Error

**Cause**: `SUPABASE_DB_URL` is incorrect or expired

**Fix**:
1. Go back to Supabase Dashboard
2. Copy a fresh `SUPABASE_DB_URL` connection string
3. Update `SUPABASE_DB_URL` in Vercel
4. Note: Connection strings sometimes expire - refresh if older than 30 days

## Environment Variable Checklist

- ✅ `SUPABASE_SERVICE_ROLE_KEY`: Only in server-side API routes, NEVER in client
- ✅ `SUPABASE_DB_URL`: Only in server-side Drizzle ORM, NEVER in client
- ✅ All secrets are unique per environment (Production ≠ Preview ≠ Development)
- ✅ Rotate keys if you suspect compromise
- ✅ Never commit `.env` files with real secrets

## Testing Locally First

Before deploying to Vercel, test locally:

```bash
# Make sure .env.local has these variables
SUPABASE_DB_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Start dev server
pnpm dev

# Test endpoint
curl http://localhost:3000/api/auth/profile
```

If it works locally but fails on Vercel, the issue is the environment variable is missing in Vercel dashboard.

## Vercel Deployment Settings

If you want to verify settings in Vercel dashboard:

```
Project → Settings → Environment Variables
```

You should see:

| Variable Name | Environment | Scope | Value |
|---------------|-------------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Plaintext | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Plaintext | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Secret | `eyJhbGci...` |
| `SUPABASE_DB_URL` | Production, Preview | Secret | `postgresql://...` |

## Next Steps

1. **Immediate**: Add `SUPABASE_DB_URL` to Vercel (from Supabase Dashboard → Project Settings → Database)
2. **Optional**: Also add `SUPABASE_SERVICE_ROLE_KEY` for better security practices
3. **Verify**: Redeploy and test the `/api/auth/profile` endpoint
4. **Monitor**: Check Vercel logs for any remaining errors

---

**TL;DR**: Add `SUPABASE_DB_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel dashboard, redeploy, and test.
