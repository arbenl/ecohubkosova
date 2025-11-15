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
SUPABASE_DB_URL = postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## How to Find Your Credentials

### 1. NEXT_PUBLIC_SUPABASE_URL
- Go to: Supabase Dashboard → Project Settings → API
- Copy the "Project URL"
- Format: `https://your-project.supabase.co`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
- Go to: Supabase Dashboard → Project Settings → API
- Under "Project API Keys", find "anon" / "public"
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT token)

### 3. SUPABASE_SERVICE_ROLE_KEY
- Go to: Supabase Dashboard → Project Settings → API
- Under "Project API Keys", find "service_role secret"
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT token)
- ⚠️ **CRITICAL**: This is a SECRET. Keep it private. Never share or commit it.

### 4. SUPABASE_DB_URL
- Go to: Supabase Dashboard → Project Settings → Database
- Copy the "Connection String" → "URI"
- Format: `postgresql://postgres.[project-id]:[password]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require`
- ⚠️ **CRITICAL**: This contains your database password. Keep it private. Never share or commit it.

## Setting Up Vercel Environment Variables

### Option 1: Vercel Dashboard (Recommended for beginners)

1. Go to: [Vercel Dashboard](https://vercel.com/dashboard) → Select Your Project
2. Click: **Settings** → **Environment Variables**
3. Add each variable one by one:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environments: ✓ Production, ✓ Preview, (Optional) Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✓ Production, ✓ Preview, (Optional) Development

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✓ Production, ✓ Preview

Name: SUPABASE_DB_URL
Value: postgresql://postgres.[project-id]:[password]@...
Environments: ✓ Production, ✓ Preview
```

4. Click **Save** after each variable
5. Trigger a redeploy: `git push` or manually redeploy in Vercel

### Option 2: Vercel CLI (For developers who like the terminal)

```bash
# Login to Vercel
vercel login

# Interactive setup - adds to Vercel dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_DB_URL

# Pull them locally to .env.local (optional, for local testing)
vercel env pull

# Redeploy with new environment variables
vercel deploy --prod
```

## Environment Variables Summary

| Variable | Type | Required? | Where to Get | Scope |
|----------|------|-----------|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | ✅ Yes | Supabase Dashboard → Settings → API | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | ✅ Yes | Supabase Dashboard → Settings → API | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | ⚠️ Optional | Supabase Dashboard → Settings → API | Production, Preview |
| `SUPABASE_DB_URL` | Secret | ✅ Yes | Supabase Dashboard → Settings → Database | Production, Preview |

## Checking Current Deployment

To verify environment variables are set correctly, create a test page at `src/app/api/test-env/route.ts`:

```typescript
export async function GET() {
  return Response.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ SET' : '✗ MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ SET' : '✗ MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ SET' : '✗ MISSING',
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL ? '✓ SET' : '✗ MISSING',
  }, { status: 200 })
}
```

Visit: `https://your-domain.vercel.app/api/test-env`

You should see all variables marked as `✓ SET`.

## Using Vercel CLI for Local Development

Once environment variables are added to Vercel:

```bash
# Pull all Vercel environment variables to .env.local
vercel env pull .env.local

# Now pnpm dev will use these values
pnpm dev
```

This is useful for testing production configuration locally before deploying.

## Common Setup Issues

### Issue: Variables set in Vercel but not working locally

**Solution**: Run `vercel env pull .env.local` to sync local environment with Vercel.

### Issue: "Cannot find module 'supabase'" or connection fails

**Cause**: Missing `SUPABASE_DB_URL` or `SUPABASE_SERVICE_ROLE_KEY`

**Solution**:
1. Verify all 4 variables are set in Vercel Dashboard
2. Double-check values are copied completely (not truncated)
3. Redeploy: `git push`

### Issue: ANSI codes or formatting issues with connection string

**Cause**: Password contains special characters

**Solution**:
- Connection strings with special characters should work fine
- If issues persist, regenerate the connection string in Supabase

## Security Best Practices

✅ **DO:**
- Store secrets in Vercel environment variables (never in code)
- Use Vercel's "Secret" type for sensitive variables
- Rotate keys regularly (at least quarterly)
- Use different keys for Production vs Preview
- Use service role key only in server-side code (never send to client)

❌ **DON'T:**
- Commit `.env.local` or any file with secrets to Git
- Share connection strings or API keys
- Use the same secret across multiple projects
- Hardcode secrets in code
- Expose `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DB_URL` to the client

## Testing Connection After Setup

Once variables are set:

```bash
# Trigger a redeploy to apply environment variables
git push

# Wait for build to complete (watch on Vercel dashboard)

# Test a simple endpoint that uses the database
curl https://your-domain.vercel.app/api/v1/articles?limit=1

# Should return JSON (not 500 error)
```

## If Something Goes Wrong

1. Check Vercel Build Logs: Vercel Dashboard → Deployments → (Click a deployment) → Logs
2. Look for error messages like "Cannot find env variable" or connection timeouts
3. Verify all 4 variables are set: Vercel Dashboard → Settings → Environment Variables
4. Make sure values are complete (not truncated)
5. Try redeploying: `git push` or click "Redeploy" in Vercel

## Next Steps

1. ✅ Add all 4 variables to Vercel Dashboard
2. ✅ Trigger a redeploy (`git push`)
3. ✅ Test with `curl` or visit your app
4. ✅ Check logs if any errors occur
5. ✅ Keep secrets safe and rotate regularly

---

**Troubleshooting Guide**: See [`VERCEL_DEPLOYMENT_TROUBLESHOOTING.md`](./VERCEL_DEPLOYMENT_TROUBLESHOOTING.md) if you encounter issues after setup.
