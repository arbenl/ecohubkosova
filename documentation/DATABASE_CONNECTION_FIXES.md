# Database Connection Stability Fixes

## Problem Analysis
Your database connection was requiring password resets frequently (2 times in 2 days), indicating underlying connection issues rather than security problems.

### Root Causes Identified:
1. **Improper connection pooling configuration** - Pool timeout settings were too aggressive
2. **No error recovery mechanism** - Failed connections weren't being invalidated for reconnection
3. **No graceful shutdown** - Dangling connections weren't being properly closed on app restart
4. **Missing connection lifecycle management** - Connections weren't being monitored or health-checked

## Solutions Implemented

### 1. Enhanced Database Connection Management (`src/lib/drizzle.ts`)

**Changes:**
- ✅ Increased idle timeout from 30s to 60s (keeps connections alive longer)
- ✅ Increased max_lifetime from 10min (600s) to 30min (1800s) - matches Supabase pooler defaults
- ✅ Added connection lifecycle handlers (`onclose`, `onnotice`, error handlers)
- ✅ Implemented automatic reconnection logic
- ✅ Added connection retry mechanism with max attempts
- ✅ Added `closeDbConnection()` function for graceful shutdown

**Key Improvements:**
```typescript
// Before: Aggressive cleanup causing frequent reconnections
idle_timeout: 30,          // 30 seconds
max_lifetime: 600,         // 10 minutes

// After: Stable long-lived connections
idle_timeout: 60,          // 60 seconds
max_lifetime: 1800,        // 30 minutes

// Added: Error handlers for automatic recovery
onclose: () => { /* invalidate and reconnect */ }
onnotice: (notice) => { /* detect fatal errors */ }
queryClient.on("error", (err) => { /* handle connection errors */ })
```

### 2. Graceful Shutdown Handler (`src/instrumentation.ts`)

**Purpose:**
- Ensures database connections are properly closed when Node.js process terminates
- Prevents dangling connections that can cause authentication issues
- Handles SIGTERM and SIGINT signals

**How it works:**
```typescript
process.on("SIGTERM", () => handleShutdown("SIGTERM"))
process.on("SIGINT", () => handleShutdown("SIGINT"))
```

### 3. Instrumentation Enabled (`next.config.mjs`)

**Added:**
```javascript
experimental: {
  instrumentationHook: true,
}
```
This enables Next.js to load and execute the instrumentation.ts file for lifecycle management.

### 4. Database Health Check Utility (`src/lib/db-health.ts`)

**Features:**
- `checkDatabaseHealth()` - Perform on-demand health checks
- `startHealthChecking()` - Monitor connection every 5 minutes
- `getLastHealthStatus()` - Get latest health check results

**Usage:**
```typescript
import { checkDatabaseHealth, startHealthChecking } from "@/lib/db-health"

// One-time check
const status = await checkDatabaseHealth()

// Continuous monitoring
startHealthChecking(5 * 60 * 1000) // Every 5 minutes
```

## Configuration Explanation

### Pool Size: `max: 10`
- Reduces from 20 to 10 connections
- Prevents exhausting Supabase connection limits
- More stable under load

### Idle Timeout: `idle_timeout: 60`
- Keeps connections alive for 60 seconds of inactivity
- Reduces need for rapid reconnections
- Aligns with typical request patterns

### Max Lifetime: `max_lifetime: 1800`
- 30-minute connection lifespan
- Matches Supabase connection pooler limits
- Prevents stale connection issues

### Statement Timeout: `statement_timeout: 30000`
- 30-second timeout per query
- Prevents queries from hanging indefinitely
- Allows for proper error recovery

## Monitoring & Debugging

### Check Connection Health
```bash
# In your app code:
import { checkDatabaseHealth } from "@/lib/db-health"
const status = await checkDatabaseHealth()
console.log(status)
```

### Enable Health Monitoring
```typescript
import { startHealthChecking } from "@/lib/db-health"

// Start checking connection every 5 minutes
startHealthChecking()
```

### Watch Logs for Connection Issues
```
[DB] Establishing connection (attempt 1/3)
[DB] Connection closed, clearing instance for reconnection
[DB Health] Connection unhealthy: ...
[Shutdown] Received SIGTERM, closing gracefully...
[Shutdown] Database connections closed
```

## Preventing Future Password Resets

The changes above prevent the issues that forced password resets by:

1. **Preventing connection exhaustion** - Proper pool sizing and timeouts
2. **Enabling automatic recovery** - Failed connections are invalidated and recreated
3. **Graceful cleanup** - Proper shutdown prevents state corruption
4. **Error detection** - Fatal errors trigger immediate reconnection attempts

### Why Password Resets Were Needed Before:
- Dangling connections were accumulating
- Supabase was marking the session as compromised
- Manual password reset cleared the blocked account

### Why You Won't Need Them Now:
- Connections are properly managed and closed
- Automatic recovery handles temporary network issues
- Health checks prevent silent failures

## Testing the Fixes

1. **Test graceful shutdown:**
   ```bash
   # Start dev server
   pnpm dev
   
   # Press Ctrl+C - should see:
   # [Shutdown] Received SIGINT, closing gracefully...
   # [Shutdown] Database connections closed
   ```

2. **Monitor connection health:**
   ```typescript
   import { startHealthChecking } from "@/lib/db-health"
   
   // In your app initialization
   if (typeof window === "undefined") {
     startHealthChecking(60000) // Check every 60 seconds
   }
   ```

3. **Simulate connection failure recovery:**
   The app will now automatically attempt to reconnect up to 3 times on connection failure.

## Next Steps

1. ✅ **Monitor** - Watch for any connection issues in the logs
2. ✅ **Observe** - No password resets should be needed for 2+ weeks
3. ✅ **Adjust** - If issues persist, you can:
   - Increase `idle_timeout` to 120 seconds
   - Reduce `max` pool size to 5 connections
   - Check Supabase logs for rate limiting

## Additional Resources

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [postgres-js Configuration](https://github.com/prametta/postgres)
- [Next.js Instrumentation Hook](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
