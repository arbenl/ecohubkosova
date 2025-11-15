# Vercel & Supabase Environment Configuration Guide

## Required Environment Variables for Vercel

Your application needs the following environment variables configured in Vercel dashboard:

### Public Variables (visible in client-side code)
These start with `NEXT_PUBLIC_` and are safe to expose:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Secret Variables (server-side only)
These must NEVER be exposed to the client:

```
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL = postgresql://postgres.xjyseqtfuxcuviiankhy:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## How to Find Your Credentials

### 1. NEXT_PUBLIC_SUPABASE_URL
- Go to: Supabase Dashboard → Project Settings → API
- Copy the "Project URL"
- Format: `https://your-project.supabase.co`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- Go to: Supabase Dashboard → Project Settings → API
- Under "Project API Keys", find "anon public"
- Copy the key value

### 3. SUPABASE_SERVICE_ROLE_KEY
- Go to: Supabase Dashboard → Project Settings → API
- Under "Project API Keys", find "service_role secret"
- ⚠️ **NEVER share this publicly** - it has full database access!
- Only used in API routes and server actions

### 4. SUPABASE_DB_URL
- Go to: Supabase Dashboard → Project Settings → Database
- Copy the "Connection String" → "URI"
- Format: `postgresql://postgres.[project-id]:[password]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require`

## Setting Up Vercel Environment Variables

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your URL from Supabase
   - **Environments**: Production, Preview, Development
   - Click "Save"
5. Repeat for all 4 variables

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your local project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_DB_URL

# Pull them locally
vercel env pull
```

## Environment Variable Scope

Set each variable for the appropriate environments:

| Variable | Scope | Usage |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Client & server auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Client-side authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Server-side DB operations (keep secret) |
| `SUPABASE_DB_URL` | Production, Preview | Direct database access via Drizzle ORM |

## Checking Current Deployment

### View Environment Variables in Vercel

```bash
# Login to Vercel
vercel login

# View all environment variables for your project
vercel env list

# View specific environment variable (for public vars only)
vercel env pull .env.production.local
```

### Check What Your App Sees

Create a debug page at `src/app/debug/env.tsx`:

```typescript
export default function EnvDebug() {
  return (
    <div className="p-4">
      <h1>Environment Variables</h1>
      <pre>{JSON.stringify({
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ SET' : '✗ MISSING',
        DB_URL_STATUS: process.env.SUPABASE_DB_URL ? '✓ SET' : '✗ MISSING',
        SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ SET' : '✗ MISSING',
      }, null, 2)}</pre>
    </div>
  )
}
```

Then visit: `https://your-vercel-app.vercel.app/debug/env`

## Common Issues & Fixes

### Issue 1: 500 Error on Profile Endpoint

**Symptom**: `/api/auth/profile` returns 500 in production but works locally

**Cause**: `SUPABASE_DB_URL` is missing in Vercel

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `SUPABASE_DB_URL` for Production and Preview environments
3. Redeploy: `git push`

### Issue 2: Redirect Loop (kycu ↔ dashboard)

**Symptom**: Login redirects to kycu, which redirects back to dashboard

**Causes**:
- Missing `SUPABASE_DB_URL` (profile endpoint returns 500)
- Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Incorrect keys (copy-paste error, truncated value)

**Fix**:
1. Verify all 4 variables are set in Vercel
2. Copy full values (don't truncate)
3. Redeploy
4. Check browser console for auth errors

### Issue 3: "Auth Session Missing" on Profile Fetch

**Symptom**: Profile fetch returns 401 unauthorized

**Causes**:
- Anon key doesn't have proper RLS permissions
- Session cookie not being sent with request
- CORS misconfiguration

**Fix**:
1. Verify RLS policies in Supabase Dashboard → SQL Editor
2. Check that cookies are properly configured in both `supabase-server.ts` and route handlers
3. Verify `NEXT_PUBLIC_SUPABASE_URL` matches your Supabase project

### Issue 4: Database Connection Refused

**Symptom**: Drizzle ORM queries fail in production

**Cause**: `SUPABASE_DB_URL` is incorrect or expired

**Fix**:
1. Go to Supabase Dashboard → Database → Connection String
2. Copy the full URI (including password)
3. Update `SUPABASE_DB_URL` in Vercel
4. Note: Connection strings sometimes expire - refresh if older than 30 days

## Security Checklist

- ✅ `NEXT_PUBLIC_*` variables: Safe to expose, used in client code
- ✅ `SUPABASE_SERVICE_ROLE_KEY`: Only in server-side API routes, NEVER in client
- ✅ `SUPABASE_DB_URL`: Only in server-side Drizzle ORM, NEVER in client
- ✅ All secrets are unique per environment (Production ≠ Preview ≠ Development)
- ✅ Rotate keys if you suspect compromise
- ✅ Don't commit `.env.local` to git (add to `.gitignore`)

## Testing Your Configuration

After setting variables in Vercel, test each layer:

### 1. Test Authentication
```bash
# Try logging in at /auth/kycu
# Check browser DevTools → Application → Cookies for auth session
```

### 2. Test Profile Fetch
```bash
# After login, check Network tab in DevTools
# GET /api/auth/profile should return 200 with profile data
```

### 3. Test Dashboard Access
```bash
# After login, navigate to /dashboard
# Should display without errors
```

### 4. Test Logout
```bash
# Click logout
# Should redirect to /auth/kycu
# Cookies should be cleared
```

## Deployment Workflow

1. **Local Testing** (using `.env.local`)
   ```bash
   npm run dev
   ```

2. **Push to GitHub**
   ```bash
   git add -A
   git commit -m "Feature: xyz"
   git push origin next_upgrade
   ```

3. **Vercel Auto-Deploy**
   - Vercel webhook triggers
   - Uses environment variables from dashboard
   - Builds and deploys to preview/production

4. **Verify Deployment**
   - Visit preview URL
   - Test login flow
   - Check for errors in Vercel logs

## Troubleshooting with Vercel Logs

### View Build Logs
```bash
vercel logs --follow
```

### View Runtime Logs
```bash
vercel logs --tail
```

### View Specific Deployment
```bash
vercel inspect [deployment-url]
```

## Step-by-Step Setup for Fresh Deployment

If starting from scratch:

1. **Copy your local variables**
   ```bash
   cat .env.local | grep -E "NEXT_PUBLIC_|SUPABASE_"
   ```

2. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

3. **Add each variable:**
   - Copy from `.env.local`
   - Set scope to: Production, Preview, Development
   - Save

4. **Redeploy:**
   ```bash
   git push origin next_upgrade
   ```

5. **Verify:**
   - Check Vercel logs during build
   - Visit app URL after deploy
   - Test auth flow

6. **Monitor:**
   - Check Vercel Dashboard for errors
   - Review application logs in `/debug/session` or browser console
   - Monitor Supabase Dashboard for usage/errors

---

## Current Status

Your local environment has all required variables set in `.env.local`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_DB_URL`

**Next Step**: Ensure these same 4 variables are added to your **Vercel dashboard** for Production and Preview environments.
