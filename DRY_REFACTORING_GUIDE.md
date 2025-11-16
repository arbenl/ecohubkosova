# DRY Refactoring Guide - Authentication

This document outlines the refactoring done to eliminate code duplication in the authentication flows and provides guidance for future auth feature development.

## Problem Statement

The original authentication implementation had significant code duplication:

1. **Login and Register Pages**: Both had similar form state management, submission logic, and error handling
2. **Server Actions**: Shared patterns for validation, error logging, and database operations
3. **UI Components**: Repeated button, alert, and loading state components
4. **Form Field Management**: Identical input field change handlers in both login and register

## Solution: Shared Utilities

### 1. **useAuthForm Hook** (`src/hooks/use-auth-form.ts`)

**Problem**: Form state, error handling, and submit logic was duplicated between login and register pages.

**Solution**: Centralized hook providing:

- Form state management (message, error, loading states)
- Submit handler with consistent error/redirect logic
- Router integration for navigation

**Usage Example**:

```tsx
import { useAuthForm } from "@/hooks/use-auth-form"

export default function LoginPage() {
  const { error, isSubmitting, handleSubmit, setError } = useAuthForm()

  const handleFormSubmit = async (formData: FormData) => {
    await handleSubmit(signIn, formData)
  }

  return <form action={handleFormSubmit}>{/* form fields */}</form>
}
```

### 2. **useFormFields Hook** (`src/hooks/use-auth-form.ts`)

**Problem**: Input field change handlers and form state updates were duplicated.

**Solution**: Generic hook for managing form field state with support for:

- Text inputs, textareas, checkboxes
- Radio groups
- Form reset functionality

**Usage Example**:

```tsx
import { useFormFields } from "@/hooks/use-auth-form"

const { formData, handleChange, handleRadioChange } = useFormFields({
  email: "",
  password: "",
  roli: "Individ"
})

// In JSX:
<input name="email" onChange={handleChange} />
<RadioGroup>
  <RadioGroupItem
    value="Individ"
    onClick={() => handleRadioChange("Individ", "roli")}
  />
</RadioGroup>
```

### 3. **Auth Service** (`src/services/auth.ts`)

**Problem**: Server-side auth operations (sign-in, sign-up, validation) had repetitive error handling and logging.

**Solution**: Centralized service providing:

- `validateAuthCredentials()`: Schema validation with logging
- `handleSupabaseSignIn()`: Consistent sign-in logic with error handling
- `handleSupabaseSignUp()`: Consistent sign-up logic with error handling
- `setSessionCookie()`: Session persistence across auth flows

**Usage Example**:

```tsx
import { handleSupabaseSignIn, validateAuthCredentials } from "@/services/auth"
import { loginSchema } from "@/validation/auth"

export async function signIn(prevState: any, formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  const validation = await validateAuthCredentials(email, password, loginSchema)
  if (validation.error) return validation

  return await handleSupabaseSignIn(email, password)
}
```

### 4. **Auth Form Components** (`src/components/auth/auth-form-components.tsx`)

**Problem**: Button, alert, and OAuth component implementations were duplicated.

**Solution**: Reusable components:

- `AuthAlert`: Error and message display
- `AuthSubmitButton`: Styled submit button with loading state
- `OAuthButton`: OAuth provider button with provider-specific handling

**Usage Example**:

```tsx
import { AuthAlert, AuthSubmitButton, OAuthButton } from "@/components/auth/auth-form-components"

export function LoginForm() {
  return (
    <>
      <AuthAlert error={error} message={message} />
      <AuthSubmitButton
        isSubmitting={isSubmitting}
        loadingText="Duke u kyçur..."
        submitText="Kyçu"
      />
      <OAuthButton provider="google" isSubmitting={isSubmitting} onClick={handleGoogleSignIn} />
    </>
  )
}
```

## Migration Path

### For Existing Auth Pages

1. **Login Page** (`src/app/(auth)/login/page.tsx`):
   - Replace form state with `useAuthForm()`
   - Replace UI components with `AuthAlert`, `AuthSubmitButton`, `OAuthButton`
   - Remove duplicated submit logic

2. **Register Page** (`src/app/(auth)/register/page.tsx`):
   - Replace form state with `useFormFields()`
   - Replace UI components with shared components
   - Consolidate step management into hook

3. **Server Actions**:
   - Update `login/actions.ts` to use `handleSupabaseSignIn()`
   - Update `register/actions.ts` to use `handleSupabaseSignUp()` and `validateAuthCredentials()`

### For New Auth Features

When adding new auth features (e.g., password reset, 2FA):

1. Use `useAuthForm()` or `useFormFields()` for state management
2. Add new functions to `src/services/auth.ts` for shared server logic
3. Import shared components from `src/components/auth/auth-form-components.tsx`
4. Follow the validation → action → response pattern

## Coverage Benefits

These refactorings provide:

- **Testability**: Isolated hooks and services are easier to unit test
- **Maintainability**: Bug fixes apply to all auth flows automatically
- **Consistency**: All auth pages follow the same patterns
- **Scalability**: New auth flows can be built faster using existing utilities

## Testing Strategy

See `TESTING_STRATEGY.md` for comprehensive testing approach for auth modules.

Key test coverage targets:

- `useAuthForm`: Form state management, error handling, redirect logic
- `useFormFields`: Field updates, radio changes, form reset
- `services/auth.ts`: Validation, sign-in/up logic, error scenarios
- `components/auth/*`: Component rendering and user interactions
