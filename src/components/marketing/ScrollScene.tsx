"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * ScrollScene
 * ------------------------------------------------------------------
 * Section-level entrance choreography for the marketing homepage.
 *
 * Wraps a section's INNER content (never the <section> background, so the
 * alternating canvas/ink bands never seam) and reveals it as a single,
 * deliberate scene the first time it scrolls into view.
 *
 * This used to scrub `opacity`/`scale`/`y` continuously against scroll
 * progress on every wrapped section — six simultaneous scroll listeners
 * recalculating transforms each frame, with whole sections dimming to ~0.3
 * opacity mid-scroll. That read as laggy and dimmed content while scrolling.
 *
 * It is now a one-shot `whileInView` reveal: intersection-triggered (no
 * per-frame scroll math), GPU-only `transform` + `opacity`, fired once and
 * left at rest. Smooth on scroll, still premium on entrance.
 *
 * `prefers-reduced-motion` and non-desktop / coarse-pointer viewports render
 * a plain, fully-visible container (matches the rest of the homepage motion).
 */

function useDesktopMotion() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return desktop;
}

export function ScrollScene({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** Accepted for call-site compatibility; the one-shot reveal no longer fades on exit. */
  exit?: boolean;
}) {
  const reduced = Boolean(useReducedMotion());
  const desktop = useDesktopMotion();

  if (reduced || !desktop) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
