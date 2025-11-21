import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  // Set environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

  // Set release for better tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version,

  // PII Scrubbing for Edge
  beforeSend(event) {
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }

    // Scrub potential tokens in request headers
    if (event.request?.headers) {
      delete event.request.headers["Authorization"]
      delete event.request.headers["authorization"]
      delete event.request.headers["x-api-key"]
    }

    return event
  },
})
