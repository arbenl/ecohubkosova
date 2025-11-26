# Database JSONB Safety Guide

## Problem: Double-Parse Crash

When using Drizzle ORM with postgres-js driver, **JSONB columns can cause runtime crashes** if handled incorrectly.

### Root Cause

1. **postgres-js auto-parses JSONB**: The postgres-js driver automatically parses JSONB columns from PostgreSQL into JavaScript objects before returning them to your application.

2. **Drizzle's jsonb() tries to parse again**: Drizzle's built-in `jsonb()` type handler calls `JSON.parse()` on the value, assuming it's still a JSON string.

3. **Result: Crash at runtime**: Calling `JSON.parse()` on an already-parsed object causes:
   ```
   SyntaxError: Unexpected non-whitespace character after JSON at position 1034
   ```

This manifested on production routes like `/marketplace` and `/partners` where JSONB metadata was queried.

## Solution: Use safeJsonb()

All JSONB columns in this codebase **must** use `safeJsonb()` instead of Drizzle's `jsonb()`.

### Implementation

```typescript
// ❌ NEVER do this - causes double-parse crash
import { jsonb } from "drizzle-orm/pg-core"
metadata: jsonb("metadata")

// ✅ ALWAYS do this - safe for postgres-js
import { safeJsonb } from "@/lib/safe-jsonb"
metadata: safeJsonb("metadata")
```

### How safeJsonb() Works

Located in `src/lib/safe-jsonb.ts`, it:

- Checks if the value is already an object (pre-parsed by postgres-js)
- Returns it directly without parsing if so
- Falls back to `JSON.parse()` only if the value is still a string
- Handles errors gracefully with fallback to empty object

## Automated Protection

### ESLint Guardrail

The repo has an ESLint rule that **blocks all `JSON.parse()` calls in DB/services layers**:

```javascript
// Catches: JSON.parse(), globalThis.JSON.parse(), const {parse} = JSON
"no-restricted-syntax": ["error", {
  selector: "CallExpression[callee.object.name='JSON'][callee.property.name='parse']",
  message: "Use safeJsonb() instead - see docs/db-jsonb-safety.md"
}]
```

Applies to: `src/db/**/*.ts`, `src/services/**/*.ts`

### Regression Tests

15 comprehensive tests in `src/lib/safe-jsonb.test.ts` cover:

- Pre-parsed objects (postgres-js scenario)
- Valid JSON strings
- Invalid JSON fallback
- Edge cases (null, undefined, empty)
- Type safety

## When You Add New JSONB Columns

1. Import `safeJsonb` from `@/lib/safe-jsonb`
2. Use `safeJsonb("column_name")` instead of `jsonb("column_name")`
3. Add inline comment referencing this doc
4. ESLint will catch any accidental `JSON.parse()` usage
