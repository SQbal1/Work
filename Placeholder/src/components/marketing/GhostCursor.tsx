"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "framer-motion";

/**
 * GhostCursor
 * ------------------------------------------------------------------
 * A fake, decorative tutorial cursor for the /demo guided walkthrough.
 * It is NOT a site cursor and does not touch the user's real pointer —
 * it only renders during a step's automated *demo* phase to show where
 * the action is, then disappears so the user performs it themselves.
 *
 * Choreography per mount (one step):
 *   appear → idle wobble → curved travel (with overshoot) → hover
 *   (target glows via `.ghost-hovered`) → anticipation → click
 *   compression + lime ripple → fade out.
 *
 * It calls `onAct` at the click (so the parent can reveal the demoed
 * result) and `onEnd` after the fade (so the parent unlocks the action
 * phase). Transform + opacity only; Framer Motion (already a dep). The
 * whole element is `pointer-events:none` and `position:fixed`, so it
 * never affects layout or blocks input. Parent only mounts this on
 * desktop pointer devices with motion enabled.
 */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function GhostCursor({
  targetSelector = "[data-demo-target]",
  nextSelector = "[data-demo-next]",
  boundsSelector = "[data-demo-stage]",
  onAct,
  onEnd,
}: {
  targetSelector?: string;
  nextSelector?: string;
  boundsSelector?: string;
  onAct?: () => void;
  onEnd?: () => void;
}) {
  const [scope, animate] = useAnimate();
  const [clicks, setClicks] = useState(0);
  const [label, setLabel] = useState("Watch");

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timers.push(window.setTimeout(res, ms));
      });
    const findTarget = () => document.querySelector<HTMLElement>(targetSelector);

    // Allowed region for the cursor tip: the live viewport (recomputed every
    // call, never cached), intersected with the demo stage when present, with a
    // small inset so the pointer never sits hard against an edge or under the
    // sticky nav. This is what keeps the cursor inside the viewport / container
    // no matter how the user resizes the window. Falls back to the viewport if
    // the stage can't be found or the intersection collapses on tiny layouts.
    const boundsRect = () => {
      const m = 16;
      let left = m;
      let top = 72; // clear the sticky marketing nav
      let right = window.innerWidth - m;
      let bottom = window.innerHeight - m;
      const stage = document.querySelector<HTMLElement>(boundsSelector);
      if (stage) {
        const s = stage.getBoundingClientRect();
        left = Math.max(left, s.left + m);
        top = Math.max(top, s.top + m);
        right = Math.min(right, s.right - m);
        bottom = Math.min(bottom, s.bottom - m);
      }
      if (right - left < 40) {
        left = m;
        right = window.innerWidth - m;
      }
      if (bottom - top < 40) {
        top = 72;
        bottom = window.innerHeight - m;
      }
      return { left, top, right, bottom };
    };
    const clampPt = (x: number, y: number) => {
      const b = boundsRect();
      return { x: clamp(x, b.left, b.right), y: clamp(y, b.top, b.bottom) };
    };

    const run = async () => {
      const cursor = scope.current as HTMLElement | null;
      if (!cursor) return;

      // The step's panel can mount a beat late (crossfade between steps), so
      // poll briefly for the target before giving up.
      let el = findTarget();
      let waited = 0;
      while (!el && waited < 1400) {
        await wait(90);
        if (cancelled) return;
        waited += 90;
        el = findTarget();
      }

      // Still no target — don't get stuck; let the parent advance.
      if (!el) {
        await wait(120);
        if (cancelled) return;
        onAct?.();
        await wait(320);
        if (cancelled) return;
        onEnd?.();
        return;
      }

      let rect = el.getBoundingClientRect();
      // Bring the target on-screen before pointing at it.
      if (rect.top < 72 || rect.bottom > window.innerHeight - 8) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        await wait(380);
        if (cancelled) return;
        rect = el.getBoundingClientRect();
      }

      // Live center of the target — recomputed (never cached) so the cursor
      // stays aligned even if the page scrolls or the window is resized between
      // movements.
      const centerOf = (node: HTMLElement) => {
        const r = node.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };

      let tc = centerOf(el);
      const start = clampPt(tc.x - 128, tc.y - 104);
      const sx = start.x;
      const sy = start.y;

      // place (instant) then appear
      await animate(cursor, { x: sx, y: sy, opacity: 0, scale: 0.7 }, { duration: 0 });
      if (cancelled) return;
      setLabel("Watch");
      await animate(cursor, { opacity: 1, scale: 1 }, { duration: 0.24, ease: "easeOut" });
      if (cancelled) return;

      // idle wobble — a small sign of life before moving, with a soft breath
      // of scale so it reads as organic rather than a teleporting sprite.
      await animate(
        cursor,
        {
          x: [sx, sx + 7, sx - 5, sx],
          y: [sy, sy - 5, sy + 3, sy],
          scale: [1, 1.04, 0.99, 1],
        },
        { duration: 0.52, ease: "easeInOut" },
      );
      if (cancelled) return;

      // Re-measure right before travelling (handles scroll/resize during
      // idle/appear) and clamp the landing point into the live bounds.
      tc = centerOf(el);
      const tEnd = clampPt(tc.x, tc.y);
      let tx = tEnd.x;
      let ty = tEnd.y;

      // curved travel with a slight overshoot past the target, then settle —
      // every control point clamped so the arc never leaves the viewport.
      const tMid = clampPt(sx + (tx - sx) * 0.55 + 14, sy + (ty - sy) * 0.5 - 20);
      const tOver = clampPt(tx + 9, ty + 5);
      await animate(
        cursor,
        {
          x: [sx, tMid.x, tOver.x, tx],
          y: [sy, tMid.y, tOver.y, ty],
        },
        { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
      );
      if (cancelled) return;

      // hover — target responds
      el.classList.add("ghost-hovered");
      setLabel("Click");
      await wait(170);
      if (cancelled) return;

      // Recompute once more right before clicking; if the page scrolled or the
      // window was resized, settle onto the target's current (clamped) position
      // so the click + ripple land on the correct button.
      const liveTarget = centerOf(el);
      const tNow = clampPt(liveTarget.x, liveTarget.y);
      if (Math.abs(tNow.x - tx) > 2 || Math.abs(tNow.y - ty) > 2) {
        tx = tNow.x;
        ty = tNow.y;
        await animate(cursor, { x: tx, y: ty }, { duration: 0.16, ease: "easeOut" });
        if (cancelled) return;
      }

      // anticipation + click compression
      await animate(
        cursor,
        { scale: [1, 1.1, 0.82, 0.96] },
        { duration: 0.34, times: [0, 0.28, 0.6, 1], ease: "easeInOut" },
      );
      if (cancelled) return;
      setClicks((c) => c + 1); // fire ripple
      onAct?.();
      await animate(cursor, { scale: 1 }, { duration: 0.16 });
      await wait(180);
      if (cancelled) return;
      el.classList.remove("ghost-hovered");

      // Hand the step into its action phase — but DON'T auto-advance. The user
      // still performs the real action + clicks Next/Finish themselves.
      onEnd?.();

      // Post-action preview: glide to the panel's Next/Finish button and rest
      // there as a forward cue. Never clicks it (the layer is pointer-events:none).
      const nextEl = document.querySelector<HTMLElement>(nextSelector);
      if (!nextEl) return;

      setLabel("Now you");
      // On stacked (tablet/mobile) layouts the Next/Finish button sits far
      // below the workspace — bring it on-screen before gliding so the cue
      // never sails off the viewport.
      let nrect = nextEl.getBoundingClientRect();
      if (nrect.top < 72 || nrect.bottom > window.innerHeight - 8) {
        nextEl.scrollIntoView({ block: "center", behavior: "smooth" });
        await wait(380);
        if (cancelled) return;
        nrect = nextEl.getBoundingClientRect();
      }
      // Recompute the Next button's position right before moving (scroll/resize
      // safe) and clamp the path into the live bounds.
      const nc = clampPt(nrect.left + nrect.width / 2, nrect.top + nrect.height / 2);
      const nMid = clampPt(
        tx + (nc.x - tx) * 0.5 + (nc.x >= tx ? 16 : -16),
        ty + (nc.y - ty) * 0.5 - 16,
      );
      await animate(
        cursor,
        {
          x: [tx, nMid.x, nc.x],
          y: [ty, nMid.y, nc.y],
        },
        { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
      );
      if (cancelled) return;
      nextEl.classList.add("ghost-hovered");
      await animate(cursor, { scale: [1, 1.06, 1] }, { duration: 0.34, ease: "easeInOut" });

      // Rest on the cue with a soft, continuous "alive" float — a gentle 2D
      // wander plus a faint breath of scale — until the user performs the real
      // action and this component unmounts. Each leg re-reads the live button
      // center so the cue stays put if the page scrolls. Cancel-safe: the loop
      // exits on cleanup (cancelled) so it never spins after unmount.
      const drift = [
        { dx: 0, dy: -5 },
        { dx: 6, dy: -1 },
        { dx: 2, dy: 4 },
        { dx: -6, dy: 0 },
      ];
      let leg = 0;
      while (!cancelled) {
        const base = centerOf(nextEl);
        const d = drift[leg % drift.length];
        leg += 1;
        const p = clampPt(base.x + d.dx, base.y + d.dy);
        await animate(
          cursor,
          { x: p.x, y: p.y, scale: [1, 1.02, 1] },
          { duration: 1.7, ease: "easeInOut" },
        );
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      document
        .querySelectorAll(".ghost-hovered")
        .forEach((n) => n.classList.remove("ghost-hovered"));
    };
    // Runs once per mount; parent remounts on step change AND (debounced) on
    // window resize / orientation change via `key={`${step}-${layoutNonce}`}`,
    // so the whole path is recomputed against the current layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      ref={scope}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      className="pointer-events-none fixed left-0 top-0 z-[65]"
      style={{ willChange: "transform, opacity" }}
    >
      {/* soft lime glow */}
      <span className="absolute -left-4 -top-4 h-9 w-9 rounded-full bg-signal/25 blur-md" />

      {/* click ripple */}
      <AnimatePresence>
        {clicks > 0 ? (
          <motion.span
            key={clicks}
            className="absolute -left-3 -top-3 h-6 w-6 rounded-full border-2 border-signal"
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: 3.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ) : null}
      </AnimatePresence>

      {/* minimal label */}
      <span className="absolute left-4 top-5 whitespace-nowrap rounded-[5px] border border-signal/40 bg-ink/90 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-signal">
        {label}
      </span>

      {/* pointer (tip at origin) */}
      <svg
        width="22"
        height="24"
        viewBox="0 0 22 24"
        fill="none"
        className="absolute left-0 top-0"
        style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.55))" }}
      >
        <path
          d="M1 1 L1 19 L5.6 14.6 L8.7 22.2 L11.4 21 L8.3 13.5 L14.5 13.4 Z"
          fill="#a8ff53"
          stroke="#05070c"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

/**
 * StaticHint
 * ------------------------------------------------------------------
 * The reduced-motion replacement for GhostCursor. No animation — it simply
 * pins the same lime pointer + a "Your turn" chip next to the active target so
 * users who opt out of motion still get a clear "act here" cue. Recomputes its
 * position on resize / orientation change (and the parent remounts it per step
 * + on layout settle) so it always sits on the correct control, and scrolls
 * the target into view if it's off-screen. `pointer-events:none`, `z-[65]`.
 */
export function StaticHint({
  targetSelector = "[data-demo-target]",
}: {
  targetSelector?: string;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let timer = 0;
    let polls = 0;

    const place = () => {
      const el = document.querySelector<HTMLElement>(targetSelector);
      if (!el) return false;
      let r = el.getBoundingClientRect();
      if (r.top < 72 || r.bottom > window.innerHeight - 8) {
        el.scrollIntoView({ block: "center" });
        r = el.getBoundingClientRect();
      }
      setPos({
        x: clamp(r.left + r.width / 2, 20, window.innerWidth - 20),
        y: clamp(r.top - 8, 72, window.innerHeight - 20),
      });
      return true;
    };

    // The step panel can mount a beat late (crossfade), so poll briefly.
    const poll = () => {
      if (place()) return;
      polls += 1;
      if (polls < 16) timer = window.setTimeout(poll, 90);
    };
    poll();

    window.addEventListener("resize", place);
    window.addEventListener("orientationchange", place);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", place);
      window.removeEventListener("orientationchange", place);
    };
  }, [targetSelector]);

  if (!pos) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[65]"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <span className="absolute left-4 top-5 whitespace-nowrap rounded-[5px] border border-signal/40 bg-ink/90 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-signal">
        Your turn
      </span>
      <svg
        width="22"
        height="24"
        viewBox="0 0 22 24"
        fill="none"
        className="absolute left-0 top-0"
        style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.55))" }}
      >
        <path
          d="M1 1 L1 19 L5.6 14.6 L8.7 22.2 L11.4 21 L8.3 13.5 L14.5 13.4 Z"
          fill="#a8ff53"
          stroke="#05070c"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
