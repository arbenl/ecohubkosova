# Authentication Architecture - Visual Guide

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      AuthProvider Component                      │
│                     (Orchestration Layer)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
          ┌──────────────┐  ┌──────────┐  ┌──────────────────┐
          │ProfileManager│  │UserState │  │SupabaseInitializer
          │              │  │ Manager  │  │                  │
          │ • fetch()    │  │ • reset()│  │ • listen()       │
          │ • retry()    │  │ • hydrate│  │ • handleEvents() │
          │ • timeout()  │  │ • clear()│  │                  │
          └──────────────┘  └──────────┘  └──────────────────┘
                │                 ▲                │
                └─────────────────┼────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
    ┌────────────────────────────┐  ┌──────────────────────────┐
    │  SessionExpirationHandler  │  │   SignOutHandler         │
    │  • handleSessionExpired()  │  │   • createHandler()      │
    └────────────────────────────┘  │   • logout()             │
                                    └──────────────────────────┘
```

## Module Lifecycle

### 1. Component Mount
```
AuthProvider mounts
    ↓
Create all managers (memoized)
    ↓
Call primeUser()
    ↓
Supabase getUser() → ServerComponent initialUser
    ↓
hydrateUser() → ProfileManager.fetchUserProfile()
    ↓
UserStateManager.hydrateUser()
    ↓
setupAuthStateListener() → Ready to handle events
```

### 2. User Sign In
```
User clicks login
    ↓
signInWithPassword() (Supabase API)
    ↓
Auth event: SIGNED_IN
    ↓
SupabaseInitializer handles event
    ↓
ProfileManager.fetchUserProfile()
    ↓
UserStateManager.hydrateUser()
    ↓
User logged in ✓
```

### 3. User Sign Out
```
User clicks logout
    ↓
signOut() (SignOutHandler)
    ↓
Client: supabase.auth.signOut()
    ↓
Reset: resetSupabaseBrowserClient()
    ↓
Server: /api/auth/signout
    ↓
Auth event: SIGNED_OUT
    ↓
SupabaseInitializer handles event
    ↓
UserStateManager.clearUser()
    ↓
Navigate: window.location.replace("/auth/kycu")
    ↓
User logged out ✓
```

### 4. Session Expiration
```
URL: ?session_expired=true
    ↓
useEffect → searchParams
    ↓
SessionExpirationHandler.handleSessionExpired()
    ↓
startTransition(() => userStateManager.reset())
    ↓
State cleared, redirect on next page load
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    UserStateManager State                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  user: User | null           ← Current authenticated user       │
│  userProfile: Profile | null ← User profile data               │
│  isLoading: boolean          ← Loading indicator               │
│  isAdmin: boolean            ← Role-based flag                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ↑           ↑           ↑           ↑
         │           │           │           │
    hydrate()   clearUser()  reset()    Direct setters
         │           │           │           │
         └───────────┴───────────┴───────────┘
              AuthProvider useCallbacks
```

## Error Handling Strategy

```
API Call (ProfileManager)
    ↓
Failed (non-401)? → Retry (max 2 attempts)
    ↓
Timeout? → AbortError handled → Return null
    ↓
Success? → Return profile
    ↓
Failed (401)? → Auth error → Return null
    ↓
UserStateManager → Handle null profile gracefully
```

## Ref-Based Race Condition Prevention

```
Three concurrent operations:

1. hydrateUser() in progress
   └─ hydrationInFlightRef.current = true
   └─ Blocks: signOut(), auth events

2. signOut() in progress
   └─ signOutInFlightRef.current = true
   └─ Blocks: hydrateUser(), auth events
   └─ Double-checked during getUser()

3. Auth event from Supabase
   └─ Checks: active && !hydrationInFlight && !signOutInFlight
   └─ Skips if any is true
   └─ Prevents race conditions
```

## Component Dependency Tree

```
AuthProvider (root)
    │
    ├─ useRouter() → Next.js router
    ├─ useSearchParams() → URL params
    ├─ useTransition() → startTransition
    ├─ useMemo() → managers
    ├─ useRef() → tracking refs
    │
    └─ useEffect (multiple)
        ├─ Setup auth listener
        ├─ Handle session expiration
        └─ Cleanup subscriptions
            
useAuth() hook
    └─ Returns AuthContextType
        ├─ user
        ├─ userProfile
        ├─ isLoading
        ├─ signOutPending
        ├─ isAdmin
        ├─ signOut()
        ├─ signInWithPassword()
        └─ refreshUserProfile()

useSupabase() hook
    └─ Returns Supabase client
```

## Performance Characteristics

```
Operation               Time        Impact
────────────────────────────────────────────
Initial Mount           ~1s         High (blocking)
Profile Fetch           200-800ms   Medium (retryable)
Sign In                 500-1500ms  High (blocking)
Sign Out                100-200ms   Low (background)
Auth State Change       <100ms      Very Low
Session Check           <50ms       Negligible
```

## Testing Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Unit Test Structure                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ProfileManager.test.ts                                         │
│  ├─ Should fetch profile successfully                          │
│  ├─ Should retry on 5xx errors                                │
│  ├─ Should timeout after 5s                                   │
│  └─ Should handle 401 errors                                  │
│                                                                 │
│  UserStateManager.test.ts                                       │
│  ├─ Should reset all state                                    │
│  ├─ Should hydrate user and profile                           │
│  ├─ Should set isAdmin correctly                              │
│  └─ Should clear user only                                    │
│                                                                 │
│  SupabaseInitializer.test.ts                                   │
│  ├─ Should handle SIGNED_IN event                             │
│  ├─ Should handle SIGNED_OUT event                            │
│  ├─ Should handle TOKEN_REFRESHED event                       │
│  └─ Should handle USER_UPDATED event                          │
│                                                                 │
│  SessionExpirationHandler.test.ts                              │
│  ├─ Should detect session expiration                          │
│  ├─ Should reset state on expiration                          │
│  └─ Should handle missing param                               │
│                                                                 │
│  AuthProvider.integration.test.ts                              │
│  ├─ Should initialize with user                               │
│  ├─ Should handle login flow                                  │
│  ├─ Should handle logout flow                                 │
│  └─ Should handle error scenarios                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Organization

```
src/
├── lib/
│   ├── auth-provider.tsx ........................ Orchestration layer
│   │
│   └── auth/
│       ├── profile-manager.ts .................. Profile fetching
│       ├── user-state-manager.ts .............. State management
│       ├── supabase-initializer.ts ............ Auth listener
│       ├── session-expiration-handler.ts ...... Expiration logic
│       ├── signout-handler.ts ................. Logout flow
│       ├── logging.ts .......................... Centralized logging
│       ├── __tests__/
│       └── ...other utilities
│
├── app/
│   ├── auth/
│   │   ├── kycu/
│   │   │   └── actions.ts ..................... Sign in action
│   │   └── regjistrohu/
│   │       └── actions.ts ..................... Sign up action
│   │
│   └── ...other pages
│
└── components/
    ├── auth-loading.tsx
    ├── base-layout.tsx
    └── ...other components
```

## Security Controls

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layer Controls                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Browser Client Isolation                                     │
│    └─ resetSupabaseBrowserClient() after logout                │
│                                                                 │
│ 2. Race Condition Prevention                                    │
│    ├─ hydrationInFlightRef ← Blocks concurrent hydrations     │
│    └─ signOutInFlightRef   ← Prevents premature state change  │
│                                                                 │
│ 3. Session Management                                           │
│    ├─ Session versioning (incremented per login)              │
│    └─ Expiration detection via URL param                      │
│                                                                 │
│ 4. Information Leakage Prevention                               │
│    └─ Generic error messages (don't reveal user existence)    │
│                                                                 │
│ 5. Open Redirect Prevention                                     │
│    └─ Hardcoded NEXT_PUBLIC_SITE_URL for redirects           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Migration Path: Old → New

```
Old (Monolithic)              New (Modular)
────────────────────────────────────────────────────
fetchUserProfile() in ────→ ProfileManager
  auth-provider

resetAuthState() in ────→ UserStateManager
  auth-provider

onAuthStateChange() in ────→ SupabaseInitializer
  auth-provider

Session expiration in ────→ SessionExpirationHandler
  auth-provider

Sign out handler ────→ SignOutHandler (unchanged)
  signout-handler.ts
```

This refactoring improves **maintainability**, **testability**, and **code clarity** while maintaining **100% backward compatibility**.
