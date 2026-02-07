"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export function SentryClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    const sentryEnv = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development";

    if (!sentryDsn) {
      return;
    }

    Sentry.init({
      dsn: sentryDsn,
      environment: sentryEnv,
      debug: false,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  }, []);

  return <>{children}</>;
}
