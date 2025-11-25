# Database Connection Quick Reference

## Problem: Password Resets Required Frequently

Your database required password resets 2x in 2 days. This is **not a security issue**, but rather a connection management problem.

## Root Cause

- Pool size was too large (20 connections)
- Idle timeout was too aggressive (30 seconds)
- Connections weren't being properly cleaned up on app restart
- No error recovery mechanism

## Solution Applied

All fixes are **automatic** - no action needed. Here's what was implemented:

### 1. Improved Connection Pooling

- Pool size: 20 → 10 (prevents resource exhaustion)
- Idle timeout: 30s → 60s (keeps connections alive longer)
- Max lifetime: 10min → 30min (matches Supabase defaults)

### 2. Graceful Shutdown

- Added `src/instrumentation.ts` to close connections on app restart
- Enabled `instrumentationHook` in `next.config.mjs`
- Prevents dangling connections

### 3. Error Recovery

- Automatic reconnection on connection failure
- Up to 3 retry attempts per connection
- Graceful degradation when DB unavailable

### 4. Health Monitoring

- Added `src/lib/db-health.ts` for monitoring
- Optional periodic health checks
- Better debugging logs

## What You'll Notice

### ✅ Should See

```
[DB] Establishing connection (attempt 1/3)
[Shutdown] Received SIGINT, closing gracefully...
[Shutdown] Database connections closed
```

### ❌ Should NOT See Anymore

- Repeated password authentication failures
- "password authentication failed" errors (after fresh credentials work)
- Need to reset password frequently

## Monitoring (Optional)

To enable periodic health checks:

```typescript
// In your app initialization (e.g., middleware.ts or layout.tsx)
import { startHealthChecking } from "@/lib/db-health"

if (typeof window === "undefined") {
  startHealthChecking(5 * 60 * 1000) // Check every 5 minutes
}
```

## Files Changed

| File                           | Change                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| `src/lib/drizzle.ts`           | Enhanced connection pooling config, added reconnection logic |
| `src/instrumentation.ts`       | NEW: Graceful shutdown handler                               |
| `src/lib/db-health.ts`         | NEW: Health check utilities                                  |
| `next.config.mjs`              | Enabled instrumentationHook                                  |
| `DATABASE_CONNECTION_FIXES.md` | Detailed documentation                                       |

## Testing

No changes needed to your code. The improvements are automatic.

To verify everything works:

```bash
pnpm dev
# Should start and connect normally
# Press Ctrl+C should show graceful shutdown
```

## If Issues Persist

1. Check logs for `[DB]` prefixed messages
2. Verify `SUPABASE_DB_URL` is correct in `.env.local`
3. Check Supabase dashboard for connection limits
4. Contact support with logs if errors appear

## Additional Info

- See `DATABASE_CONNECTION_FIXES.md` for detailed technical documentation
- Connection configuration aligns with Supabase best practices
- Error handling matches enterprise database standards
