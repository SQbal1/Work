"use client";

import Link from "next/link";
import { RotateCw, Home } from "lucide-react";
import { Logo } from "@/components/Logo";
import { buttonStyles } from "@/components/ui/Button";

/**
 * Branded route-level error boundary. Self-contained on purpose — it must not
 * depend on chrome (nav/footer) that could itself be the thing that threw.
 * `mute-red` is used here as a genuine error semantic (per the palette rules).
 *
 * `reset()` re-renders the segment to retry. In production, `error.digest` is a
 * stable id you can quote to support / wire to telemetry here later.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="aurora flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center text-bone">
      <Logo href="/" />

      <div className="mt-10 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
        <span className="h-2 w-2 rounded-full bg-mute-red" />
        <span className="text-fog">runtime.error</span>
      </div>

      <h1 className="mt-5 text-balance font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mx-auto mt-4 max-w-md text-balance text-sm leading-relaxed text-fog">
        An unexpected error interrupted this page. You can try again, or head back home.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonStyles("primary", "lg")}>
          <RotateCw className="h-4 w-4" /> Try again
        </button>
        <Link href="/" className={buttonStyles("secondary", "lg")}>
          <Home className="h-4 w-4" /> Back home
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-8 font-mono text-[11px] tracking-[0.04em] text-graphite">ref · {error.digest}</p>
      ) : null}
    </div>
  );
}
