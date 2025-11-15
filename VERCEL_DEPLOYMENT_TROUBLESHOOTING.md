# Vercel Deployment Troubleshooting Summary

## Current Issue

Your Vercel deployment is experiencing a redirect loop between login (`/auth/kycu`) and dashboard. This is caused by the profile endpoint returning a 500 error.

## Root Cause

The `/api/auth/profile` endpoint needs **direct database access** to fetch user profiles, which requires the `SUPABASE_DB_URL` environment variable. This variable is likely **not set** in your Vercel dashboard.

## What's Missing in Vercel

When you deployed to Vercel, you probably only set the public variables:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

But you're missing the secret/server variables:
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (optional but good to have)
- ❌ `SUPABASE_DB_URL` (REQUIRED for profile endpoint)

## How Profile Fetch Works

```
Browser → /api/auth/profile
  ↓
Server checks auth (using Supabase JWT from cookies)
  ↓
Server needs to query database for user profile
  ↓
Connects to Supabase database using SUPABASE_DB_URL + Drizzle ORM
  ↓
Returns profile or error
```

**The problem**: Without `SUPABASE_DB_URL`, step 4 fails with 500 error.

## Required Fixes

### Step 1: Verify Local Variables

Your `.env.local` has all 4 variables set:
```
NEXT_PUBLIC_SUPABASE_URL=https://xjyseqtfuxcuviiankhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_DB_URL=postgresql://postgres.xjyseqtfuxcuviiankhy:...
```

### Step 2: Add Missing Variables to Vercel Dashboard

**Go to**: https://vercel.com/dashboard

1. Select your **ecohubkosova** project
2. Click **Settings** → **Environment Variables**
3. Add each missing variable:

#### Variable 1: SUPABASE_DB_URL
```
Name: SUPABASE_DB_URL
Value: postgresql://postgres.xjyseqtfuxcuviiankhy:NFTufxhMGNwK8DqV@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require

Environments: 
  ✓ Production
  ✓ Preview
  (Optional) Development
```

#### Variable 2: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeXNlcXRmdXhjdXZpaWFua2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTIwOSwiZXhwIjoyMDc4NTE1MjA5fQ.VL2EUa-_VraPEZ8a_MmiorKWtV3Emtcj1WYWy9zbGKM

Environments:
  ✓ Production
  ✓ Preview
```

⚠️ **IMPORTANT**: Make sure you copy the FULL value. Don't truncate.

### Step 3: Verify Public Variables Are Still Set

Make sure these are still configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Redeploy

```bash
git push origin next_upgrade
```

This will trigger Vercel to rebuild with the new environment variables.

### Step 5: Monitor Deployment

```bash
# Watch build logs
vercel logs --follow

# Or check in dashboard: https://vercel.com/dashboard/ecohubkosova/deployments
```

### Step 6: Test the Fix

1. Visit your deployment URL
2. Try to login
3. Check if you can access the dashboard
4. Check browser console for any errors
5. Open DevTools → Network tab and verify `/api/auth/profile` returns 200 (not 500)

## Alternative: Using Vercel CLI

If you prefer command line:

```bash
# Login to Vercel if not already
vercel login

# Link project (run this in the project directory)
vercel link

# Add the missing variables
vercel env add SUPABASE_DB_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Pull to verify
vercel env pull

# Redeploy
git push origin next_upgrade
```

## Verification Checklist

After making changes, verify:

- [ ] All 4 variables are set in Vercel dashboard
- [ ] Variables are set for both Production and Preview environments
- [ ] Variable values are complete (not truncated)
- [ ] No typos in variable names
- [ ] Deployment completed successfully
- [ ] Browser shows app (not building)
- [ ] Login redirects to dashboard (not redirect loop)
- [ ] Network tab shows `/api/auth/profile` returning 200
- [ ] Dashboard loads without errors

## Debugging Commands

If issues persist, run these commands:

```bash
# Check Vercel project config
vercel whoami
vercel projects

# List environment variables (only shows names, not values for security)
vercel env list

# View build output
vercel logs --follow --function=profile

# Inspect specific deployment
vercel inspect [your-vercel-url]
```

## Common Mistakes

1. ❌ Copying only partial values (cut off at 50 chars by accident)
2. ❌ Not setting variables for Preview environment
3. ❌ Using wrong variable names (e.g., `SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL`)
4. ❌ Forgetting to redeploy after adding variables
5. ❌ Setting variables only for Development (production won't see them)

## Expected Behavior After Fix

**Before**: Login → Redirect loop (kycu ↔ dashboard)

**After**: 
1. Login screen appears ✅
2. Enter credentials
3. Redirects to dashboard ✅
4. Profile loaded ✅
5. Can navigate pages ✅
6. Logout works ✅

## Support

If issues persist:

1. **Check Vercel logs**:
   - Visit: https://vercel.com/dashboard/ecohubkosova/deployments
   - Click latest deployment
   - View logs for errors

2. **Check Supabase logs**:
   - Visit: https://app.supabase.com/
   - Select your project
   - Database → Webhooks & Functions to see any errors
   - Auth → Logs to see auth events

3. **Local testing**:
   - Run `npm run dev` locally
   - Verify login works locally
   - If local works but Vercel doesn't → environment variable issue

## Files Provided

- `VERCEL_SUPABASE_SETUP.md` - Complete setup guide
- `check-vercel-config.sh` - Script to verify configuration
- `VERCEL_DEPLOYMENT_TROUBLESHOOTING.md` - This file

---

**TL;DR**: Add `SUPABASE_DB_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel dashboard, redeploy, and test.
