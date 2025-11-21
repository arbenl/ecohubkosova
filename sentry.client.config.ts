import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.feedbackIntegration({
      // Additional Feedback configuration goes here, for example:
      colorScheme: "auto",
    }),
  ],

  // Set environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",

  // Set release for better tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version,

  // PII Scrubbing
  beforeSend(event) {
    if (event.user) {
      // Don't send user email or other PII
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

  // Performance monitoring
  tracesSampler: (samplingContext) => {
    // Skip health check endpoints
    if (samplingContext.request?.url?.includes("/api/health")) {
      return 0.0
    }

    // Sample API routes at higher rate
    if (samplingContext.request?.url?.includes("/api/")) {
      return 0.5
    }

    // Default sample rate
    return process.env.NODE_ENV === "production" ? 0.1 : 1.0
  },
})
