import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryEnv = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development";

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnv,
    debug: false,
    tracesSampleRate: 1.0,
  });
}
