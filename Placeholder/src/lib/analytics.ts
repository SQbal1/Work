import posthog from "posthog-js";

/**
 * Analytics abstraction — PostHog.
 * ------------------------------------------------------------------
 * Initialized in components/Analytics.tsx. This module exposes only the
 * app-facing API: canonical event names and track(). Pageviews are captured
 * in Analytics.tsx; UTM/referrer super-properties are registered there too,
 * so they ride along on every event below automatically.
 *
 * track() is a safe no-op until PostHog is initialized (key unset → local dev
 * and previews stay clean). Call sites never need to guard.
 */

/** Canonical custom event names — keep in sync with the PostHog dashboard / funnels. */
export const AnalyticsEvent = {
  StartWalkthrough: "Start walkthrough clicked",
  DemoCompleted: "Demo completed",
  PilotRequestSubmitted: "Pilot request submitted",
  PilotRequestSuccess: "Pilot request success",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/** Fire a custom event. No-ops gracefully if PostHog isn't initialized. */
export function track(
  event: AnalyticsEventName,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, props);
}
