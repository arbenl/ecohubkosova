import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Tracing
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set sample rate for error events
  integrations: [
    // Replay integration commented out due to version compatibility
    // new Sentry.Replay({
    //   // Mask all text content, but keep media playback
    //   maskAllText: true,
    //   blockAllMedia: false,
    // }),
  ],
  
  // Capture 10% of all sessions
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture 100% of transactions with an error
  replaysOnErrorSampleRate: 1.0,
  
  // Attach stack traces
  attachStacktrace: true,
  
  // Maximum number of breadcrumbs
  maxBreadcrumbs: 50,
  
  // Performance related
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV !== 'test',
});

export { Sentry };
