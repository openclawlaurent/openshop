# Sentry Setup Instructions

## Environment Variables Required

Add these environment variables to your Doppler configuration:

### Required

- `NEXT_PUBLIC_SENTRY_DSN` - Your Sentry project DSN (found in Sentry project settings)

### Optional but Recommended

- `NEXT_PUBLIC_SENTRY_ENVIRONMENT` - Environment name (e.g., "development", "staging", "production")
  - Falls back to NODE_ENV if not set
  - Helps filter errors by environment in Sentry dashboard

### Optional (for source map upload)

Only needed if you want prettified stack traces in production:

- `SENTRY_ORG` - Your Sentry organization slug
- `SENTRY_PROJECT` - Your Sentry project slug
- `SENTRY_AUTH_TOKEN` - Sentry auth token for source map uploads

## Getting Started

1. Create a new Next.js project in Sentry: https://sentry.io/
2. Copy the DSN from your project settings
3. Add the environment variables to Doppler:

   ```bash
   # Required
   doppler secrets set NEXT_PUBLIC_SENTRY_DSN="your-dsn-here"

   # Recommended - set different values per Doppler environment
   doppler secrets set NEXT_PUBLIC_SENTRY_ENVIRONMENT="development"  # or "staging", "production"

   # Optional - only if you want source map upload
   doppler secrets set SENTRY_ORG="your-org-slug"
   doppler secrets set SENTRY_PROJECT="your-project-slug"
   doppler secrets set SENTRY_AUTH_TOKEN="your-auth-token"
   ```

## Testing Sentry Integration

Sentry is now fully integrated and will automatically capture:

- Unhandled errors and exceptions
- API route errors
- Client-side JavaScript errors
- Custom messages sent via `Sentry.captureException()` or `Sentry.captureMessage()`

All errors will appear in your Sentry dashboard with:

- Proper environment tags (development/staging/production)
- Full stack traces
- Browser and server context
- Automatic error grouping

## Features Configured

- Client-side error tracking
- Server-side error tracking
- Edge runtime error tracking
- Session replay (10% sample rate, 100% on errors)
- Performance monitoring
- Source map upload (in production builds)
- Ad-blocker circumvention via `/monitoring` tunnel

## PostHog Configuration

PostHog has been configured to:

- Disable autocapture (to prevent exception tracking)
- Disable session recording (handled by Sentry instead)
