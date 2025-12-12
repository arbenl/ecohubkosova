# Authentication & Account Components

> **License**: MIT – All components in this document are licensed under MIT and can be freely reused in other Next.js + Supabase projects.
>
> **Copyright**: (c) 2025 Kosovo Advocacy and Development Center (KADC)

This document describes the reusable authentication and account management components built for EcoHub Kosova. These components are designed to work with:

- **Next.js 15+** (App Router)
- **Supabase Auth**
- **next-intl** for internationalization
- **shadcn/ui** components
- **Tailwind CSS**

---

## Table of Contents

1. [App Shell](#app-shell)
2. [Account Settings](#account-settings)
3. [Forgot Password Flow](#forgot-password-flow)
4. [Reset Password Flow](#reset-password-flow)
5. [Auth Callback Handler](#auth-callback-handler)
6. [Required Dependencies](#required-dependencies)
7. [Environment Variables](#environment-variables)
8. [i18n Keys Reference](#i18n-keys-reference)

---

## App Shell

**Location**: `src/components/layout/app-shell.tsx`

A responsive authenticated layout shell with:

- Sticky sidebar navigation (desktop)
- Mobile drawer with hamburger menu
- User dropdown with profile/account/sign-out options
- CTA button for quick actions

### Props

```typescript
interface AppShellProps {
  children: ReactNode
  navItems: NavItem[] // Navigation items with label, href, icon, description
  ctaLabel: string // Call-to-action button label
  heading: string // Sidebar heading
  eyebrow?: string // Small text above heading
}

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  description?: string
}
```

### Usage

```tsx
import { AppShell } from "@/components/layout/app-shell"
import { LayoutDashboard, Settings } from "lucide-react"

export default function DashboardLayout({ children }) {
  const navItems = [
    {
      label: "Overview",
      href: "/my",
      icon: <LayoutDashboard className="h-4 w-4" />,
      description: "Your dashboard home",
    },
    {
      label: "Settings",
      href: "/my/account",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  return (
    <AppShell navItems={navItems} ctaLabel="Create New" heading="My Workspace" eyebrow="Dashboard">
      {children}
    </AppShell>
  )
}
```

### Dependencies

- `@/lib/auth-provider` (useAuth hook)
- `@/i18n/routing` (Link, usePathname)
- shadcn/ui: Button, DropdownMenu components
- lucide-react icons

---

## Account Settings

**Location**: `src/app/[locale]/(protected)/my/account/`

A complete account settings page with:

- Email display (read-only)
- Profile editing (name, location)
- Password change
- Language preference toggle

### Files

| File                        | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `page.tsx`                  | Server component that fetches user data |
| `account-settings-form.tsx` | Client form with all settings sections  |
| `actions.ts`                | Server action for password change       |

### Password Change Flow

1. User enters current password (verified via Supabase sign-in attempt)
2. User enters new password + confirmation
3. Server validates with Zod schema
4. Password updated via `supabase.auth.updateUser()`

### Server Action API

```typescript
// changePassword action
type ChangePasswordResult = {
  success?: boolean
  error?: string
  fieldErrors?: {
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }
}
```

---

## Forgot Password Flow

**Location**: `src/app/[locale]/(auth)/forgot-password/`

Allows users to request a password reset email.

### Files

| File         | Purpose                                |
| ------------ | -------------------------------------- |
| `page.tsx`   | Client component with email input form |
| `actions.ts` | Server action to send reset email      |

### Flow

1. User enters email address
2. Server calls `supabase.auth.resetPasswordForEmail()`
3. **Always returns success** (prevents email enumeration attacks)
4. User sees confirmation screen with instructions

### Security Note

The action always returns success even if the email doesn't exist. This prevents attackers from discovering valid email addresses.

```typescript
// Always return success to prevent email enumeration
return { success: true }
```

---

## Reset Password Flow

**Location**: `src/app/[locale]/(auth)/reset-password/`

Allows users to set a new password after clicking the email link.

### Files

| File         | Purpose                                 |
| ------------ | --------------------------------------- |
| `page.tsx`   | Client component with new password form |
| `actions.ts` | Server action to update password        |

### Flow

1. User clicks link in email → redirected to `/auth/callback`
2. Callback verifies token and establishes session
3. User lands on `/reset-password` with valid session
4. User enters new password + confirmation
5. Password updated, user signed out, redirected to login

### States

The page handles these states:

- **Loading**: Checking session validity
- **Invalid Link**: Token expired or invalid
- **Form**: Valid session, show password form
- **Success**: Password reset complete

---

## Auth Callback Handler

**Location**: `src/app/auth/callback/route.ts`

Handles Supabase email confirmation and recovery links.

### Supported Types

- `signup` - Email confirmation after registration
- `recovery` - Password reset links
- `magiclink` - Magic link authentication (if enabled)

### Flow

```
Email Link → /auth/callback?token_hash=xxx&type=recovery
                    ↓
          Verify OTP with Supabase
                    ↓
          ┌────────┴────────┐
          ↓                 ↓
    type=recovery      other types
          ↓                 ↓
   /reset-password        /my
```

---

## Required Dependencies

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.x",
    "@supabase/supabase-js": "^2.x",
    "next": "^15.x",
    "next-intl": "^3.x",
    "zod": "^3.x",
    "lucide-react": "^0.x"
  }
}
```

### shadcn/ui Components Used

- `Button`
- `Input`
- `Label`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Alert`, `AlertDescription`

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Required for password reset emails
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## i18n Keys Reference

### auth.json

```json
{
  "forgotPassword": {
    "title": "Reset Password",
    "description": "Enter your email...",
    "emailSentTitle": "Check your email",
    "emailSentDescription": "We have sent a password reset link to {email}",
    "emailSentNote": "Click the link in the email...",
    "backToLogin": "Back to login",
    "sendResetLink": "Send Reset Link",
    "sending": "Sending..."
  },
  "resetPassword": {
    "title": "Set New Password",
    "description": "Please enter your new password below.",
    "newPassword": "New Password",
    "confirmPassword": "Confirm Password",
    "passwordHint": "Must be at least 6 characters long",
    "resetPassword": "Reset Password",
    "resetting": "Resetting...",
    "successTitle": "Password Reset",
    "successDescription": "Your password has been successfully reset.",
    "redirecting": "Redirecting you to login...",
    "invalidLinkTitle": "Invalid Link",
    "invalidLinkDescription": "This password reset link is invalid or has expired.",
    "invalidLink": "Invalid or expired link",
    "requestNewLink": "Request a new link"
  }
}
```

### DashboardV2.json (Account Section)

```json
{
  "account": {
    "title": "Account Settings",
    "subtitle": "Manage your account preferences and settings",
    "emailSection": "Email Address",
    "emailDescription": "Your email address is used for login and notifications",
    "email": "Email",
    "emailNote": "Email cannot be changed...",
    "profileSection": "Profile Information",
    "profileDescription": "Update your personal details",
    "fullName": "Full Name",
    "location": "Location",
    "locationPlaceholder": "e.g., Prishtina, Kosovo",
    "passwordSection": "Change Password",
    "passwordDescription": "Update your account password for security",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmPassword": "Confirm New Password",
    "passwordHint": "Password must be at least 6 characters long.",
    "changePassword": "Change Password",
    "changingPassword": "Changing...",
    "passwordSuccess": "Password changed successfully!",
    "languageSection": "Language Preferences",
    "languageDescription": "Choose your preferred language",
    "preferredLanguage": "Preferred Language",
    "languageNote": "The interface will switch immediately.",
    "save": "Save changes",
    "saving": "Saving...",
    "success": "Account settings updated successfully!"
  },
  "nav": {
    "account": "Account",
    "accountDesc": "Manage your account settings"
  }
}
```

---

## Customization Guide

### Changing the Color Scheme

The components use these Tailwind classes for theming:

- Primary: `emerald-600`, `emerald-700`, `emerald-100`
- Gradient: `eco-gradient` (custom class)
- Accent: `[#00C896]`, `[#00A07E]`

To change colors, update these in your Tailwind config or replace in components.

### Adding More Account Settings

To add new settings sections to the account page:

1. Add translation keys to `DashboardV2.json`
2. Add a new `<Card>` section in `account-settings-form.tsx`
3. Create server action if needed in `actions.ts`

### Extending the Navigation

To add new navigation items to the AppShell:

```tsx
// In your layout.tsx
const navItems = [
  // ... existing items
  {
    label: t("nav.newSection"),
    description: t("nav.newSectionDesc"),
    href: "/my/new-section",
    icon: <YourIcon className="h-4 w-4" />,
  },
]
```

---

## Testing Checklist

- [ ] Login with valid credentials → redirects to `/my`
- [ ] Login with invalid credentials → shows error
- [ ] Click "Forgot password?" → navigates to forgot password page
- [ ] Submit email on forgot password → shows success (regardless of email existence)
- [ ] Click reset link from email → lands on reset password page
- [ ] Submit new password → success, redirected to login
- [ ] Login with new password → works
- [ ] Navigate to Account Settings → all sections visible
- [ ] Update profile info → success message
- [ ] Change password (correct current) → success message
- [ ] Change password (wrong current) → error on current password field
- [ ] Change language → page reloads in new locale
- [ ] Sign out from dropdown → redirects to login
- [ ] Mobile: hamburger menu opens drawer
- [ ] Mobile: navigation works from drawer

---

_Last updated: December 2024_
