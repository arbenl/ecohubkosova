# EcoHub Kosovo - Auth Flow Comprehensive Analysis

## 🔍 Executive Summary

Your auth system has several **architectural inconsistencies** that cause:
1. **Stale session state** requiring hard refreshes
2. **Incorrect redirects** to `/auth/kycu` when user should be authenticated
3. **Session version mismatches** triggering unexpected logouts

The core issues are:
- **Async session propagation delays** between client and middleware
- **Session version logic flaws** that don't account for legitimate cookie clears
- **Weak client-side session hydration** from server (only on login, not on app launch)
- **Middleware querying database on every protected route hit** (heavy, unnecessary)

---

## 📊 Current Auth Flow

### 1. **LOGIN FLOW** → `/[locale]/login`

#### Page Component (`src/app/[locale]/(auth)/login/page.tsx`)
```tsx
const handleSubmit = async (e) => {
  // 1. Submit form to server action
  const result = await signIn(null, formData)

  // 2. If successful, get tokens from response
  if (result.success === true && result.session) {
    // 3. CLIENT SETS SESSION (critical step!)
    await supabase.auth.setSession(result.session)
  }

  // 4. Force RSC tree refresh
  router.refresh()

  // 5. Push to dashboard
  router.push(`/${locale}/dashboard`)
}
```

#### Server Action (`src/app/[locale]/(auth)/login/actions.ts`)
```typescript
export async function signIn(prevState, formData) {
  // 1. Get credentials
  const { email, password } = formData

  // 2. Authenticate via Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  // 3. Increment session version (custom tracking)
  const newVersion = await incrementSessionVersion(userId)

  // 4. Set cookie with session version
  const cookieStore = await cookies()
  cookieStore.set(SESSION_VERSION_COOKIE, String(newVersion), options)

  // 5. Return tokens to client
  return {
    success: true,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    }
  }
}
```

#### Result
- ✅ `access_token` + `refresh_token` → Supabase auth cookie (`sb-*`)
- ✅ `SESSION_VERSION_COOKIE` → custom session versioning
- ✅ Client calls `setSession()` → triggers `onAuthStateChange` in AuthProvider
- ✅ `router.refresh()` → re-renders Server Components
- ✅ Redirects to dashboard

---

### 2. **MIDDLEWARE** → Every request

#### Session Check (`middleware.ts` lines 62-73)
```typescript
const { session } = await supabase.auth.getSession()
const hasSession = Boolean(session)
const sessionUserId = session?.user?.id ?? null
const cookieSessionVersion = req.cookies.get(SESSION_VERSION_COOKIE)?.value ?? null
```

#### Protected Route Logic (lines 81-141)
```typescript
if (sessionUserId && (isProtected || isAdminRoute)) {
  // 1. Query database for role + session_version
  const { data: userRow } = await supabase
    .from("users")
    .select("roli, session_version")
    .eq("id", sessionUserId)
    .single()

  // 2. Compare session_version: cookie vs database
  if (cookieSessionVersion && cookieSessionVersion !== dbVersionString) {
    // MISMATCH → Force logout!
    await supabase.auth.signOut({ scope: "global" })
    return NextResponse.redirect(`/${locale}/login?session_expired=true`)
  }

  // 3. Sync cookie if mismatch
  if (!cookieSessionVersion || cookieSessionVersion !== dbVersionString) {
    res.cookies.set(SESSION_VERSION_COOKIE, dbVersionString, options)
  }
}
```

#### Redirect Logic (lines 154-166)
```typescript
// No session + protected route → redirect to login
if (isProtected && !hasSession) {
  return NextResponse.redirect(`/${locale}/login?redirectedFrom=...`)
}

// Has session + auth route → redirect to dashboard
if (isAuthRoute && hasSession) {
  return NextResponse.redirect(`/${locale}/dashboard`)
}
```

---

### 3. **AUTHPROVIDER** (Client Context) → `src/lib/auth-provider.tsx`

#### Initialization
```tsx
export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)

  useEffect(() => {
    // Setup auth state listener (onAuthStateChange)
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // SIGNED_IN → fetch profile + set user
        // SIGNED_OUT → clear user
        // TOKEN_REFRESHED → refresh profile
      }
    )
    return () => data.subscription.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, userProfile, isAdmin, ... }}>
      <SupabaseContext.Provider value={supabase}>
        {children}
      </SupabaseContext.Provider>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) // ← Client code uses this
export const useSupabase = () => useContext(SupabaseContext) // ← For queries
```

#### On Login
1. Client calls `supabase.auth.setSession(tokens)` in login page
2. Supabase client emits `SIGNED_IN` event
3. `onAuthStateChange` callback fires
4. Profile is fetched and `AuthContext` updated
5. Components re-render with `user` + `userProfile`

#### On App Launch
1. AuthProvider mounted with `initialUser` from server (if provided)
2. `onAuthStateChange` listener set up
3. If session exists in cookies, Supabase fires `SIGNED_IN` event
4. If not, listener waits...
5. ⚠️ **No explicit call to getUser()** → session might not hydrate until event fires

---

### 4. **LOGOUT FLOW**

#### Client Call (`useAuth` hook)
```tsx
const { signOut } = useAuth()
await signOut() // From auth-provider.tsx
```

#### SignOut Handler (`src/lib/auth/signout-handler.ts`)
```typescript
async function signOut() {
  // 1. Client-side signout
  await supabase.auth.signOut({ scope: "local" })

  // 2. Reset browser client singleton
  resetSupabaseBrowserClient()

  // 3. Call server endpoint to clear cookies
  const response = await fetch("/api/auth/signout", { method: "POST" })

  // 4. Wait 100ms for cookie cleanup
  await new Promise(resolve => setTimeout(resolve, 100))

  // 5. Clear auth state in React
  resetAuthState()

  // 6. Navigate to login
  router.push(`/${locale}/login`)
}
```

#### Server Endpoint (`src/app/api/auth/signout/route.ts`)
```typescript
export async function POST() {
  const supabase = await createRouteHandlerSupabaseClient()
  const { error } = await supabase.auth.signOut({ scope: "global" })

  const response = NextResponse.json({ success: !error })

  // Clear Supabase auth cookies
  response.cookies.set("__session", "", { maxAge: 0 })
  response.cookies.set(SESSION_VERSION_COOKIE, "", { maxAge: 0 })

  return response
}
```

---

## 🚨 ROOT CAUSE ANALYSIS

### Issue 1: **Sessions Not Updating Until Hard Refresh**

#### Why It Happens
1. User logs in on `/[locale]/login` → `setSession()` called
2. `onAuthStateChange` fires on login page (not yet navigated)
3. Profile fetched, AuthContext updated
4. `router.push()` navigates to dashboard
5. **On dashboard load**, AuthProvider initialized AGAIN (fresh component)
6. `initialUser` prop passed from server might be OLD or NULL
7. `onAuthStateChange` listener waits for events (don't always fire on mount)
8. **User sees "Loading..." until middleware refresh or hard refresh triggers re-render**

#### Attack Points
- `AuthProvider` gets `initialUser` from server but if that's NULL/stale, client won't auto-update
- `router.refresh()` revalidates RSCs but doesn't immediately guarantee `onAuthStateChange` fires
- Session cookies exist but client hasn't called `supabase.auth.getUser()` explicitly

#### Example Symptom
```
1. User logs in → setSession() ✓
2. router.push("/dashboard") → page navigates
3. Dashboard's AuthProvider mounts with initialUser=null
4. No onAuthStateChange event fires (session already exists!)
5. AuthContext.user = null
6. Dashboard shows "Loading..." or redirect-to-login
7. User hard-refreshes
8. Supabase client reads cookies → emits SIGNED_IN
9. Profile loaded → Works! ✓
```

---

### Issue 2: **Incorrect Redirects to `/auth/kycu`**

#### Why It Happens
1. Protected route accessed (`/dashboard`)
2. Middleware calls `supabase.auth.getSession()` → checks cookies
3. **Browser latency or cookie sync delay** → session not in cookies YET
4. `hasSession = false` in middleware
5. **Redirect to `/login?redirectedFrom=/dashboard`**
6. User is actually logged in, but cookies/session haven't propagated

#### Attack Points
- **Timing issue**: Session set on client, but middleware checks before cookie is readable
- **Multi-origin delay**: Supabase auth cookies set, but Next.js middleware.ts reads in same request
- **Locale extraction bug** (lines 35-37):
  ```typescript
  const pathSegments = pathname.split("/").filter(Boolean)
  const locale = pathSegments[0]
  const relativePathname = "/" + pathSegments.slice(1).join("/")
  ```
  If middleware checks routes like `/${locale}/dashboard`, and route list has `/dashboard` (no locale), mismatch!

#### Example Symptom
```
1. User logs in, redirected to /sq/dashboard
2. Page renders, then middleware runs on next navigation
3. Cookie not in request headers yet
4. Middleware: hasSession = false
5. Redirect to /sq/login?redirectedFrom=/sq/dashboard
6. User confused! They just logged in!
```

---

### Issue 3: **Session Version Mismatch Causing Logouts**

#### Why It Happens
1. Login: `SESSION_VERSION_COOKIE` set to `v1` in server action
2. Middleware: compares cookie `v1` vs DB `v1` ✓ Match
3. **User clears cookies** (legitimate) → cookie gone
4. Next request: Middleware reads empty cookie
5. DB still has `v1`
6. Check: `cookieSessionVersion (null) !== dbVersionString (v1)`
7. **MISMATCH → FORCE LOGOUT!**

#### Attack Points
- Session version logic assumes cookie always exists
- Doesn't distinguish between "cache miss" vs "session hijack"
- Legitimate scenarios (cookie clear, private browsing, etc.) treated as security threat

#### Example Symptom
```
1. User logged in, clear browser cookies (Cmd+Shift+Del)
2. Try to access /dashboard
3. Middleware sees mismatch (null cookie vs "v1" in DB)
4. Logs user out with "session_expired" redirect
5. User has to log in again
```

---

### Issue 4: **Session Version Sync on Every Request**

#### Why It Happens
```typescript
// middleware.ts lines 139-142
if (!cookieSessionVersion || cookieSessionVersion !== dbVersionString) {
  res.cookies.set(SESSION_VERSION_COOKIE, dbVersionString, ...)
}
```

This runs on EVERY protected route hit if cookie is missing.

#### Performance Impact
- DB query per request if cookie not synced
- Cookie write on every request (unnecessary)
- Adds latency to all protected routes

#### Attack Points
- No cache; no "already checked" tracking
- Doesn't account for session-less users

---

## ✅ CORRECTED ARCHITECTURE

### Recommended Changes (Next.js + Supabase Best Practices)

#### **A. Fix Session Hydration on App Launch**

**Problem**: `initialUser` from server might be null/stale
**Solution**: Always explicitly check session on client hydration

```tsx
// src/lib/auth-provider.tsx
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const hydrationDoneRef = useRef(false)

  // NEW: Explicit hydration from cookies on mount
  useEffect(() => {
    if (hydrationDoneRef.current) return
    hydrationDoneRef.current = true

    const hydrateFromSession = async () => {
      if (initialUser) {
        // Server already provided user, skip
        logAuthAction("hydrate", "Using server-provided initialUser")
        return
      }

      // No initial user → check cookies for session
      const { data: { user: sessionUser } } = await supabase.auth.getUser()
      if (sessionUser) {
        logAuthAction("hydrate", "Found session in cookies", { userId: sessionUser.id })
        setUser(sessionUser)
        // Fetch profile...
      } else {
        logAuthAction("hydrate", "No session found")
        setUser(null)
      }
    }

    hydrateFromSession()
  }, [initialUser, supabase])

  // Listen for auth changes
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Update state on changes...
    })
    return () => data?.subscription?.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, ... }}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### **B. Fix Session Version Logic (Remove False Positives)**

**Problem**: Null cookie treated as session hijack
**Solution**: Only invalidate on EXPLICIT mismatch (not missing cookie)

```typescript
// middleware.ts - REVISED
if (sessionUserId && (isProtected || isAdminRoute)) {
  const { data: userRow } = await supabase
    .from("users")
    .select("session_version")
    .eq("id", sessionUserId)
    .single()

  if (!userRow) {
    // User deleted or not found
    logMiddlewareEvent(pathname, "User not found in DB")
    // Don't force logout yet; let route handle it
    // (user might legitimately have orphaned session)
  } else {
    const dbVersion = String(userRow.session_version)

    // ONLY force logout if cookie EXISTS but is DIFFERENT
    // (not if cookie is missing - that's normal on first request)
    if (cookieSessionVersion && cookieSessionVersion !== dbVersion) {
      logMiddlewareEvent(pathname, "Session version mismatch (possible hijack)")
      await supabase.auth.signOut({ scope: "global" })
      return NextResponse.redirect(`/${locale}/login?session_expired=true`)
    }

    // Sync missing cookie (first request after login)
    if (!cookieSessionVersion) {
      logMiddlewareEvent(pathname, "Syncing session version cookie (first request)")
      res.cookies.set(SESSION_VERSION_COOKIE, dbVersion, options)
    }
  }
}
```

#### **C. Reduce Middleware DB Queries (Cache Session State)**

**Problem**: Query DB on every protected route hit
**Solution**: Trust Supabase auth session; only query for role/profile on demand

```typescript
// middleware.ts - REVISED
if (sessionUserId && isAdminRoute) {
  // ONLY query if accessing admin route
  const { data: userRow } = await supabase
    .from("users")
    .select("roli")
    .eq("id", sessionUserId)
    .single()

  if (!userRow?.roli?.includes("Admin")) {
    return NextResponse.redirect(`/${locale}/login?message=Unauthorized`)
  }
  // No session version check needed here!
}

// For regular protected routes, just trust Supabase session
if (isProtected && !hasSession) {
  return NextResponse.redirect(`/${locale}/login?redirectedFrom=${pathname}`)
}
```

#### **D. Fix Locale/Route Matching**

**Problem**: Protected route list doesn't match locale-prefixed paths
**Solution**: Extract locale first, then check against relative routes

```typescript
// middleware.ts - REVISED
const pathSegments = pathname.split("/").filter(Boolean)
const locale = pathSegments[0] || "sq" // default locale
const relativePathname = "/" + pathSegments.slice(1).join("/")

// Check routes without locale prefix
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin", "/marketplace/add"]
const ADMIN_PREFIXES = ["/admin"]
const AUTH_PREFIXES = ["/login", "/register"]

const isProtected = PROTECTED_PREFIXES.some(prefix => 
  relativePathname.startsWith(prefix)
)
const isAdminRoute = ADMIN_PREFIXES.some(prefix => 
  relativePathname.startsWith(prefix)
)
const isAuthRoute = AUTH_PREFIXES.some(prefix => 
  relativePathname.startsWith(prefix)
)
```

---

## 📋 Action Items

### Priority 1 (Fixes stale session issue)
- [ ] Add explicit `supabase.auth.getUser()` call in `AuthProvider.useEffect` on mount
- [ ] Pass `initialUser` from server (already done in layout)
- [ ] Ensure `router.refresh()` after login completes before redirect

### Priority 2 (Fixes incorrect redirects)
- [ ] Review locale extraction in middleware (lines 35-37)
- [ ] Test route matching with various paths (`/sq/dashboard`, `/en/admin`, etc.)
- [ ] Add logging to track redirect reasons

### Priority 3 (Fixes logouts on cookie clear)
- [ ] Change session version logic to only trigger on EXPLICIT mismatch
- [ ] Treat missing cookie as normal, not threat
- [ ] Remove unnecessary session version sync on every request

### Priority 4 (Performance)
- [ ] Reduce middleware DB queries for protected routes (not admin)
- [ ] Move role check to route handlers (lazy load when needed)
- [ ] Cache user role in context for client-side admin checks

---

## 🧪 Testing Recommendations

```bash
# Test 1: Login without hard refresh
1. Visit /sq/login
2. Enter credentials
3. Should redirect to /sq/dashboard
4. Dashboard should show user info (not loading)
5. Hard refresh should work fine
6. PASS: No loading state, immediate render

# Test 2: Access protected route while logged out
1. Session cleared
2. Visit /sq/dashboard
3. Should redirect to /sq/login
4. URL shows redirectedFrom
5. PASS: Clean redirect

# Test 3: Clear cookies after login
1. Log in successfully
2. Open DevTools → Application → Cookies
3. Delete all cookies
4. Refresh page
5. Should redirect to login (not force logout with error)
6. PASS: Can log in again normally

# Test 4: Admin route access
1. Log in as admin
2. Visit /sq/admin
3. Should allow access
4. Log in as non-admin
5. Visit /sq/admin
6. Should redirect to login with message
7. PASS: Role-based access control works
```

---

## 📚 Reference Docs

- [Supabase SSR with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app)
- [Middleware Sessions in Next.js](https://nextjs.org/docs/app/building-your-application/routing/middleware)
