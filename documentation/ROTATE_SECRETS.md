# How to Rotate Exposed Supabase Credentials (New UI)

## ⚠️ URGENT: These credentials are exposed and must be rotated immediately

Exposed credentials:
- `SUPABASE_SERVICE_ROLE_KEY` (JWT token)
- `SUPABASE_DB_URL` (with database password)

---

## Step 1: Understand the New Supabase API Keys Interface

Supabase recently updated their API keys. You'll see:
- **Publishable key** (replaces anon key) - safe for client
- **Secret key** (replaces service_role key) - keep secret, server-only

---

## Step 2: Rotate Your API Keys

### In Supabase Dashboard:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Settings** → **API**
4. You'll see the new interface with:
   - "Publishable key" (the public anon key)
   - Below that, look for "Reveal" or a section for "Secret keys"

### To Regenerate/Rotate Keys:

1. Click on **"Publishable key"** section
2. Look for a **"Regenerate"** button or **three-dot menu (⋮)**
3. Click **"Regenerate"** (or "Create new key")
4. **⚠️ WARNING**: This will invalidate the old key
5. Copy the NEW Publishable key

### For the Secret Key:

1. Still in **Settings** → **API**
2. Scroll down to find **"Secret key"** or similar section
3. Click the **three-dot menu (⋮)** or **"Regenerate"** button
4. Confirm regeneration
5. Copy the NEW Secret key

---

## Step 3: Rotate Database Password

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Settings** → **Database**
4. Look for **"Database Password"** section (near the top)
5. Click **"Reset Password"** button
6. Confirm the reset (new password will be generated)
7. Copy the new password displayed

---

## Step 4: Get New Connection String

After resetting the database password:

1. Still in **Settings** → **Database**
2. Look for **"Connection string"** section
3. Select the **"URI"** tab
4. Copy the connection string - this is your new `SUPABASE_DB_URL`
5. Should look like: `postgresql://postgres.[project-id]:[NEW_PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require`

---

## Step 5: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Navigate to: **Settings** → **Environment Variables**
4. Update these three variables with NEW values:

```
NEXT_PUBLIC_SUPABASE_ANON_KEY = [NEW_PUBLISHABLE_KEY]
SUPABASE_SERVICE_ROLE_KEY = [NEW_SECRET_KEY]
SUPABASE_DB_URL = [NEW_CONNECTION_STRING]
```

For each:
- Click the variable
- Click **"Edit"**
- Paste the new value
- Click **"Save"**

---

## Step 6: Update Local .env.local

1. Update your local file with new credentials:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY="[NEW_PUBLISHABLE_KEY]"
NEXT_PUBLIC_SUPABASE_URL="https://xjyseqtfuxcuviiankhy.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[NEW_SECRET_KEY]"
SUPABASE_DB_URL="[NEW_CONNECTION_STRING]"
NEXT_PUBLIC_FORCE_DEV_SIGNOUT="true"
```

2. Restart dev server:

```bash
pnpm dev
```

---

## Step 7: Trigger Vercel Redeploy

Option A - Via Git (recommended):
```bash
git push
```

Option B - Via Vercel Dashboard:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three-dot menu (⋮)**
4. Select **"Redeploy"**

---

## Verify New Credentials Work

Test that everything is working:

```bash
# Local test
curl http://localhost:3000/api/auth/profile

# Production test
curl https://your-domain.vercel.app/api/auth/profile
```

Both should return user profile data (not 500 error or "Unauthorized").

---

## Still Can't Find Rotation Option?

### Try These Alternative Locations:

1. **Settings page structure** (varies by account):
   - Settings → API → Look for regenerate/rotate buttons
   - Settings → API → Scroll down for "Legacy API Keys" section
   - Settings → Database → Password reset

2. **Documentation**:
   - https://supabase.com/docs/guides/api#managing-api-keys
   - https://supabase.com/docs/guides/database/managing-passwords

3. **Contact Supabase Support**:
   - In dashboard, click **"Help"** → **"Send us feedback"**
   - Or email: support@supabase.io

---

## ✅ Completion Checklist

- [ ] Found and copied NEW Publishable key
- [ ] Found and copied NEW Secret key
- [ ] Reset Database Password
- [ ] Copied new SUPABASE_DB_URL connection string
- [ ] Updated Vercel NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Updated Vercel SUPABASE_SERVICE_ROLE_KEY
- [ ] Updated Vercel SUPABASE_DB_URL
- [ ] Updated local .env.local with new values
- [ ] Restarted dev server (pnpm dev)
- [ ] Tested endpoints work
- [ ] Verified no 500 or auth errors
- [ ] Triggered Vercel redeploy (git push)

---

## Security Summary

✅ After rotation:
- Old exposed credentials are now **invalid and useless**
- GitHub exposure is **neutralized** (old keys won't work)
- New deployment uses **only new credentials**
- Local development uses **new credentials**
- Database access is **protected** with new password

⚠️ Monitoring:
- Watch Supabase dashboard for any suspicious activity
- Monitor Vercel logs for errors
- Check database usage is normal

---

## Key Differences (Old vs New UI)

| Old UI | New UI |
|--------|--------|
| "anon" key | "Publishable key" |
| "service_role" key | "Secret key" |
| Click menu to rotate | Look for Regenerate button |
| Manual key management | Automated regeneration |

The functionality is the same - you're just using the new interface!
