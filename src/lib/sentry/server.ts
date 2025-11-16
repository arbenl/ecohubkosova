import * as Sentry from '@sentry/nextjs';

/**
 * Server-side Sentry configuration
 * Handles errors on the backend and during SSR
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV !== 'test',
  
  // Integrations
  integrations: [
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
  
  // Configuration
  attachStacktrace: true,
  maxBreadcrumbs: 50,
  
  // Ignore errors from browser extensions and specific patterns
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Chrome extensions
    'chrome-extension://',
    // Firefox extensions
    'moz-extension://',
    // Safari extensions
    'safari-extension://',
  ],
});

export { Sentry };
