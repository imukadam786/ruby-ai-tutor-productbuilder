// ─── components/PostHogProvider.tsx ──────────────────────────────────────────
// Client-side PostHog initializer. Wrap the app root with this component so
// that posthog-js is booted once and available to all analytics calls.
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return; // skip in dev if env var not set

    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false, // we instrument everything manually
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
