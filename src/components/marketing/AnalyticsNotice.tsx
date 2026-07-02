"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";

/**
 * Transparency notice for our cookieless, memory-only analytics (see
 * components/Analytics.tsx). This is deliberately NOT a consent gate: the
 * analytics set no cookies and write nothing to the device, so there is no
 * tracking to block — we just inform visitors and link to the privacy policy.
 *
 * Dismissal is remembered in localStorage (a functional preference, not
 * tracking) so it shows once. Renders nothing until mounted to avoid an
 * SSR/markup mismatch, and respects reduced-motion via opacity-only fade.
 */
const STORAGE_KEY = "ph-analytics-notice-dismissed";

// Only surface the notice where analytics actually runs (key set). In local
// dev / previews with no key, Analytics loads nothing — so claiming we measure
// usage would be untrue. Mirrors the gate in components/Analytics.tsx.
const ANALYTICS_ACTIVE = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

export function AnalyticsNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ANALYTICS_ACTIVE) return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      // localStorage blocked (private mode / strict settings) — show it anyway.
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — worst case it shows again next visit.
    }
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="region"
          aria-label="Analytics notice"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-[4px] border border-hairline bg-ink/95 p-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-[6px] sm:inset-x-auto sm:right-4 sm:left-auto sm:bottom-4"
        >
          <div className="flex items-start gap-3">
            <Cookie aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-fog">
                We use privacy-first, <span className="text-cloud">cookieless</span> analytics to
                understand site usage — no cookies, no cross-site tracking, processed in the EU.{" "}
                <Link
                  href="/privacy"
                  className="text-signal underline-offset-2 transition hover:underline"
                >
                  Learn more
                </Link>
                .
              </p>
              <button
                type="button"
                onClick={dismiss}
                className="mt-3 inline-flex items-center rounded-[4px] border border-hairline bg-canvas px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-cloud transition hover:border-graphite hover:text-bone focus-ring"
              >
                Got it
              </button>
            </div>
            <button
              type="button"
              aria-label="Dismiss notice"
              onClick={dismiss}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-[4px] text-fog transition hover:bg-canvas hover:text-bone focus-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
