# Sentry Monitoring

This project uses [Sentry](https://sentry.io) for error tracking and performance monitoring. The integration is built on top of `@sentry/nextjs`.

## Configuration Files

The Sentry configuration is split across several files to handle different Next.js runtimes:

- **`sentry.client.config.ts`**: Configuration for the browser (Client Components, client-side logic).
- **`sentry.server.config.ts`**: Configuration for the Node.js server (Server Components, API routes).
- **`sentry.edge.config.ts`**: Configuration for Edge runtime (Middleware, Edge API routes).
- **`next.config.mjs`**: Build-time configuration (source maps, tunneling, tree-shaking).
- **`src/instrumentation.ts`**: Server-side initialization hook.

## Environment Variables

To ensure Sentry works correctly, the following environment variables must be set:

### Runtime (Client & Server)

These are needed for the application to send events to Sentry.

- `NEXT_PUBLIC_SENTRY_DSN`: The Data Source Name (DSN) for your Sentry project.
  - _Required_ for client-side reporting.
  - _Recommended_ to keep consistent across environments.

### Build Time (CI/CD & Vercel)

These are needed for uploading source maps and release tracking.

- `SENTRY_AUTH_TOKEN`: Your Sentry Auth Token (needs `project:releases` scope).
- `SENTRY_ORG`: The Sentry organization slug (e.g., `human-p5`).
- `SENTRY_PROJECT`: The Sentry project slug (e.g., `ecohub-kosova`).

> **Note**: On Vercel, the Sentry integration usually sets these automatically. For local development, you can put them in `.env.local`.

## Usage

### Automatic Reporting

Sentry automatically captures:

- Uncaught exceptions in Client and Server components.
- API route errors.
- Performance traces for page loads and navigations.

### Manual Reporting

You can manually report errors or messages using the Sentry SDK:

```typescript
import * as Sentry from "@sentry/nextjs"

try {
  // Your code
} catch (error) {
  Sentry.captureException(error)
}

// Capturing a message
Sentry.captureMessage("Something happened", "info")
```

### Testing Sentry

We have dedicated smoke test routes for verifying Sentry integration:

**Client-side Test:**

1. Navigate to `/sentry-test` in your browser
2. Click the "Throw Client Error" button
3. This should trigger a client-side error that gets reported to Sentry

**Server-side Test:**

1. Navigate to `/api/sentry-test` in your browser (or use `curl`)
2. This should trigger a server-side error and return a 500 status
3. The error should be reported to Sentry

> **Note**: These test routes are available in all environments. Remove them or add auth protection before deploying to production.

## Post-Deployment Verification

After deploying to Vercel (or any other environment), follow this checklist:

### 1. Trigger Test Errors

- [ ] Visit `https://your-domain.com/sentry-test` and click "Throw Client Error"
- [ ] Visit `https://your-domain.com/api/sentry-test` (should show error page)

### 2. Verify in Sentry Dashboard

For each error, check that:

- [ ] **Environment** is correct (e.g., `production`, `preview`, `development`)
- [ ] **Release** shows the git commit SHA (e.g., `abc1234`)
- [ ] **Stack trace** shows readable file names and line numbers (source maps working)
- [ ] **PII is absent**: No email addresses, IP addresses, or auth tokens visible
- [ ] **Tags** include useful context (locale, if configured)

### 3. Verify Source Maps

- [ ] In Sentry, click on a stack trace line
- [ ] It should show the original source code, not minified/compiled code
- [ ] If source maps are missing, check that `SENTRY_AUTH_TOKEN` is set in Vercel

### 4. Cleanup

- [ ] Remove or protect the `/sentry-test` routes before production launch
- [ ] Consider adding authentication or environment checks to these routes

## Troubleshooting

- **Missing Events?** Check if your ad-blocker is blocking requests. We use a tunnel route (`/monitoring`) to mitigate this, but strict blockers might still interfere.
- **Build Failures?** If `SENTRY_AUTH_TOKEN` is missing, source map upload will fail. Ensure the token is present in your CI environment.
- **No Source Maps?** Verify `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are set in Vercel's environment variables.
- **Client Errors Not Reporting?** Ensure `NEXT_PUBLIC_SENTRY_DSN` is set (not just `SENTRY_DSN`).
