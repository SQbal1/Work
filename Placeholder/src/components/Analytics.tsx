"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Defaults to the same-origin reverse proxy (next.config.mjs rewrites /ingest
// → PostHog EU), which makes requests appear first-party and bypasses
// ad-blockers. Override with a direct host (https://eu.i.posthog.com) if needed.
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/**
 * Parse UTM params from the landing URL + referrer from the document.
 * Returns only the keys actually present, so we never register empty values.
 */
function getSessionAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) result[key] = val;
  }
  if (document.referrer) {
    result.$referrer = document.referrer;
    try {
      result.$referring_domain = new URL(document.referrer).hostname;
    } catch {
      // malformed referrer — skip the derived domain
    }
  }
  return result;
}

/**
 * Initialize PostHog once, at module load on the client — BEFORE any component
 * effect runs. React runs child effects before parent effects, so initializing
 * inside a useEffect would make the very first $pageview see __loaded === false
 * and silently drop it. No-op on the server and when the key is unset, so
 * dev/previews load nothing.
 *
 * Privacy-forward config:
 *  - persistence "memory"      — nothing written to localStorage or cookies
 *  - autocapture off           — only explicit events + pageviews
 *  - session recording off
 *  - surveys / web-vitals off
 *  - person_profiles identified_only — no profiles for anonymous visitors
 *
 * Attribution: UTM params + referrer from the landing URL are parsed once and
 * registered as super properties, so PostHog attaches them to every event
 * (pageviews and custom events) for the life of the session — no per-call code.
 */
if (typeof window !== "undefined" && POSTHOG_KEY && !posthog.__loaded) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://eu.posthog.com", // toolbar/debugger links resolve correctly behind the proxy
    capture_pageview: false, // captured manually below (App Router)
    capture_pageleave: false, // explicit events + pageviews only
    autocapture: false, // no DOM-event autocapture
    capture_heatmaps: false, // remote config enables these by default — force off
    capture_dead_clicks: false, // remote config enables these by default — force off
    disable_session_recording: true,
    disable_surveys: true,
    capture_performance: false, // no web-vitals payloads
    persistence: "memory", // nothing stored on-device
    person_profiles: "identified_only", // anonymous events, no person profiles
  });

  const attribution = getSessionAttribution();
  if (Object.keys(attribution).length > 0) {
    posthog.register(attribution);
  }
}

/** Captures a $pageview on first load and every App Router navigation. */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  if (!POSTHOG_KEY) return null;
  // Suspense is required: useSearchParams() otherwise opts every route out of
  // static rendering (Next.js build warning + performance regression).
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
