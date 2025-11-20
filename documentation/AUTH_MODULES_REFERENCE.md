# Auth Modules Quick Reference

## Module Overview

### Core Modules (Newly Extracted)

#### ProfileManager
**File**: `src/lib/auth/profile-manager.ts`
**Purpose**: Fetch user profiles with retry logic and timeout handling

```typescript
import { ProfileManager } from "@/lib/auth/profile-manager"

const profileManager = new ProfileManager(abortRef)
const profile = await profileManager.fetchUserProfile(userId, attempt)
profileManager.cleanup()
```

**Configuration**:
- `PROFILE_FETCH_TIMEOUT`: 5000ms
- `MAX_PROFILE_RETRIES`: 2 attempts

---

#### UserStateManager
**File**: `src/lib/auth/user-state-manager.ts`
**Purpose**: Centralized state management for user, profile, loading, and admin status

```typescript
import { UserStateManager } from "@/lib/auth/user-state-manager"

const stateManager = new UserStateManager(
  setUser,
  setUserProfile,
  setIsLoading,
  setIsAdmin
)

stateManager.reset() // Clear all state
stateManager.hydrateUser(user, profile) // Set user and profile
stateManager.clearUser() // Remove user only
```

---

#### SupabaseInitializer
**File**: `src/lib/auth/supabase-initializer.ts`
**Purpose**: Setup Supabase auth state listener and handle auth events

```typescript
import { SupabaseInitializer } from "@/lib/auth/supabase-initializer"

const initializer = new SupabaseInitializer(
  supabase,
  profileManager,
  userStateManager,
  profileFetchAbortRef
)

const unsubscribe = initializer.setupAuthStateListener(primeUserFn)

// On cleanup:
unsubscribe()
```

**Handled Events**:
- `SIGNED_IN` - Fetch profile and hydrate user
- `SIGNED_OUT` - Clear user state
- `TOKEN_REFRESHED` - Run prime logic
- `USER_UPDATED` - Refresh all data

---

#### SessionExpirationHandler
**File**: `src/lib/auth/session-expiration-handler.ts`
**Purpose**: Detect and handle session expiration from URL params

```typescript
import { SessionExpirationHandler } from "@/lib/auth/session-expiration-handler"

const handler = new SessionExpirationHandler(
  () => userStateManager.reset(),
  startTransition
)

const wasExpired = handler.handleSessionExpired(searchParams)
// Returns true if session was expired and state was reset
```

**Checks for**: `?session_expired=true` in URL

---

### Supporting Modules (Already in place)

#### SignOutHandler
**File**: `src/lib/auth/signout-handler.ts`
**Purpose**: Execute logout flow with proper sequencing

**Flow**:
1. Client-side signout
2. Reset browser Supabase client
3. Server-side signout
4. Wait 100ms for cleanup
5. Navigate to login page

```typescript
const signOut = createSignOutHandler({
  supabase,
  router,
  resetAuthState,
  signOutInFlightRef,
  setSignOutPending,
})

await signOut()
```

---

#### Logging
**File**: `src/lib/auth/logging.ts`
**Purpose**: Centralized auth action logging

```typescript
import { logAuthAction } from "@/lib/auth/logging"

logAuthAction("action", "Human readable message", {
  userId: "123",
  status: 200,
})
```

---

## Usage in AuthProvider

```typescript
// 1. Create managers
const userStateManager = new UserStateManager(setUser, setUserProfile, setIsLoading, setIsAdmin)
const profileManager = new ProfileManager(profileFetchAbortRef)
const supabaseInitializer = new SupabaseInitializer(supabase, profileManager, userStateManager, profileFetchAbortRef)
const sessionExpirationHandler = new SessionExpirationHandler(() => userStateManager.reset(), startTransition)

// 2. Use in effects
useEffect(() => {
  const unsubscribe = supabaseInitializer.setupAuthStateListener(primeUser)
  return unsubscribe
}, [supabaseInitializer, primeUser])

useEffect(() => {
  sessionExpirationHandler.handleSessionExpired(searchParams)
}, [searchParams, sessionExpirationHandler])

// 3. Call from callbacks
const hydrateUser = async (nextUser) => {
  const profile = await profileManager.fetchUserProfile(nextUser.id)
  userStateManager.hydrateUser(nextUser, profile)
}
```

---

## Testing Patterns

### ProfileManager Tests
```typescript
describe('ProfileManager', () => {
  it('should retry on non-401 failures', async () => {
    // Mock failed first attempt, successful second
  })
  
  it('should timeout after 5 seconds', async () => {
    // Mock slow endpoint
  })
})
```

### UserStateManager Tests
```typescript
describe('UserStateManager', () => {
  it('should set all state on hydrate', () => {
    manager.hydrateUser(user, profile)
    expect(setUser).toHaveBeenCalledWith(user)
  })
  
  it('should reset all state', () => {
    manager.reset()
    expect(setUser).toHaveBeenCalledWith(null)
  })
})
```

### SupabaseInitializer Tests
```typescript
describe('SupabaseInitializer', () => {
  it('should fetch profile on SIGNED_IN event', async () => {
    // Mock auth event
  })
  
  it('should clear user on SIGNED_OUT event', async () => {
    // Mock auth event
  })
})
```

---

## File Organization

```
src/lib/auth/
├── __tests__/               # Test files
├── logging.ts              # Centralized logging (37 lines)
├── profile-manager.ts      # Profile fetching (71 lines) [NEW]
├── profile-service.ts      # Legacy service (81 lines) [CAN DEPRECATE]
├── roles.ts               # Role utilities (33 lines)
├── session-expiration-handler.ts  # Session timeout (25 lines) [NEW]
├── session-version.ts     # Session versioning (24 lines)
├── signout-handler.ts     # Logout flow (94 lines)
├── supabase-initializer.ts # Auth listener setup (63 lines) [NEW]
└── user-state-manager.ts  # State management (50 lines) [NEW]

src/lib/
├── auth-provider.tsx       # Main provider, orchestration (250 lines, down from 325)
├── supabase-browser.ts     # Browser client singleton
├── supabase-server.ts      # Server client
├── supabase.ts             # Client factory
└── ... other utilities
```

---

## Migration Checklist

- ✅ ProfileManager created and working
- ✅ UserStateManager created and working
- ✅ SupabaseInitializer created and working
- ✅ SessionExpirationHandler created and working
- ✅ AuthProvider refactored to use all managers
- ✅ All TypeScript types checked
- ✅ Build successful
- ✅ No breaking changes to public API
- ✅ All existing functionality preserved

---

## Future Improvements

1. **Custom Hooks**: Extract managers into custom hooks
   - `useProfileManager()` - Returns ProfileManager instance
   - `useAuthState()` - Returns UserStateManager instance
   - `useSessionExpiration()` - Returns SessionExpirationHandler instance

2. **Error Handling**: Create error boundary for auth-specific errors

3. **Testing**: Add unit tests for each module

4. **Documentation**: Add JSDoc comments to all public methods

5. **Deprecation**: Remove `profile-service.ts` once all uses migrated
