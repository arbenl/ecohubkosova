# Profile Loading - Quick Reference Guide

## Quick Start

### 1. Check Database Health
```bash
curl http://localhost:3000/api/health/db
```

### 2. Use Profile Loader Component
```tsx
import { ProfileLoader } from "@/components/profile/profile-loader"
import { ProfileRetryUI } from "@/components/profile/profile-retry-ui"

export default function MyPage() {
  const [data, setData] = useState(null)
  
  return (
    <ProfileLoader onLoad={setData}>
      {data?.error ? (
        <ProfileRetryUI 
          error={data.error}
          dbUnavailable={data.dbUnavailable}
          onRetry={() => {/* refetch */}}
        />
      ) : (
        <YourContent profile={data?.userProfile} />
      )}
    </ProfileLoader>
  )
}
```

### 3. Manual Profile Fetch
```tsx
const response = await fetch("/api/auth/profile")
const { profile, dbUnavailable, error } = await response.json()

if (response.ok) {
  // Profile loaded successfully
  console.log(profile)
} else if (dbUnavailable) {
  // Database temporarily unavailable (yellow warning)
  console.warn("Database unavailable, please try again")
} else {
  // Other error (red error)
  console.error("Failed to load profile:", error)
}
```

---

## Error Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 + profile | Success | Use profile data |
| 200 + null + dbUnavailable | DB Unavailable | Show yellow warning, allow retry |
| 400 | Bad Request | Check request format |
| 401 | Not Authenticated | Redirect to login |
| 500 | Server Error | Show red error, allow retry |
| 503 | Service Unavailable (Health Check) | Database down |

---

## Database Error Examples

**Connection Refused:**
```
Response: 200 + dbUnavailable: true
Error in logs: "connect ECONNREFUSED 127.0.0.1:5432"
```

**Connection Timeout:**
```
Response: 200 + dbUnavailable: true
Error in logs: "connect ETIMEDOUT"
```

**Missing Credentials:**
```
Response: 200 + dbUnavailable: true
Error in logs: "password authentication failed for user postgres"
```

---

## Monitoring

### Health Check
```bash
# Poll every 30 seconds
while true; do
  status=$(curl -s http://localhost:3000/api/health/db | jq '.database.connected')
  echo "$(date): Database connected: $status"
  sleep 30
done
```

### Logs to Watch
```
[AUTH] Profile request
[AUTH] Profile retrieved successfully
[AUTH] Database connection error (this is expected sometimes)
[health/db] Database health check failed
```

---

## Common Issues

### Issue: "Database temporarily unavailable" (Yellow Warning)
**Cause:** Database connection issue  
**Fix:** 
1. Check database is running: `curl http://localhost:3000/api/health/db`
2. Verify environment variables are set correctly
3. Check database credentials: `SUPABASE_DB_URL`
4. Click retry button or wait for automatic recovery

### Issue: "Failed to load profile" (Red Error)
**Cause:** Other application error  
**Fix:**
1. Check browser console for detailed error
2. Verify user is authenticated (check auth token)
3. Check server logs for error details
4. Try manual refresh

### Issue: Health check endpoint returns error
**Command:**
```bash
curl -v http://localhost:3000/api/health/db
```

**Expected 200:**
```json
{
  "status": "ok",
  "database": { "connected": true, "responseTime": 45 }
}
```

**If 503:**
```json
{
  "status": "error",
  "database": { "connected": false, "error": "..." }
}
```

---

## Integration Examples

### Profile Page
```tsx
import { ProfileLoader } from "@/components/profile/profile-loader"
import { ProfileRetryUI } from "@/components/profile/profile-retry-ui"

export default async function ProfilePage() {
  return (
    <ProfileLoader onLoad={(data) => {
      // Use data.userProfile, data.organization, data.error
    }}>
      {/* Your profile content */}
    </ProfileLoader>
  )
}
```

### Marketplace Page
```tsx
import { ProfileLoader } from "@/components/profile/profile-loader"

export default function MarketplacePage() {
  const [profile, setProfile] = useState(null)
  
  return (
    <ProfileLoader onLoad={(data) => setProfile(data)}>
      {profile?.error ? (
        <ErrorDisplay error={profile} />
      ) : (
        <ListingsGrid profile={profile} />
      )}
    </ProfileLoader>
  )
}
```

---

## API Reference

### GET /api/auth/profile
**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "profile": {
    "id": "user-123",
    "emri_i_plote": "John Doe",
    "email": "john@example.com",
    "roli": "Individ"
  },
  "organization": null,
  "dbUnavailable": false
}
```

**Database Unavailable (200):**
```json
{
  "profile": null,
  "organization": null,
  "dbUnavailable": true,
  "error": "Database temporarily unavailable"
}
```

**Unauthorized (401):**
```json
{
  "profile": null,
  "error": "Përdoruesi nuk është i kyçur."
}
```

### GET /api/health/db
**Authentication:** Not required

**Healthy (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "database": {
    "connected": true,
    "responseTime": 45
  }
}
```

**Unhealthy (503):**
```json
{
  "status": "error",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "database": {
    "connected": false,
    "error": "connect ECONNREFUSED",
    "responseTime": 5000
  }
}
```

---

## Environment Setup

```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

---

## Performance Tips

1. **Use ProfileLoader for automatic handling** - It handles retries and state
2. **Check health before retry** - Call `/api/health/db` to confirm database is back
3. **Implement exponential backoff** - Don't retry instantly, wait 100-200ms
4. **Cache profiles locally** - Use React Context or Zustand for state
5. **Monitor health endpoint** - Set up alerts for database issues

---

## Testing

### Test Database Connection
```tsx
const response = await fetch("/api/health/db")
const health = await response.json()

if (response.ok) {
  console.log("✅ Database connected")
} else {
  console.error("❌ Database unavailable:", health.database.error)
}
```

### Test Profile Loading
```tsx
import { ProfileLoader } from "@/components/profile/profile-loader"

export function TestProfileLoading() {
  return (
    <ProfileLoader onLoad={(data) => {
      console.log("Profile loaded:", data)
      console.log("Database available?", !data.dbUnavailable)
      console.log("Error:", data.error)
    }}>
      <p>Profile loading test...</p>
    </ProfileLoader>
  )
}
```

---

## Summary

✅ **Endpoints:**
- GET `/api/auth/profile` - Load user profile with error handling
- GET `/api/health/db` - Check database health

✅ **Components:**
- `<ProfileLoader>` - Automatic profile loading
- `<ProfileRetryUI>` - User-visible error display

✅ **Features:**
- Automatic retry with backoff
- Database availability detection
- User-friendly error messages (Albanian)
- Graceful degradation

🚀 **Ready to use in any data-loading scenario!**
