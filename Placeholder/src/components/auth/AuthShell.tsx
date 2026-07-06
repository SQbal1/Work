"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Centered auth panel on the technical dark canvas. Used by login + signup.
 * When an `aside` is supplied (signup's live workspace preview) the layout
 * widens to two columns on desktop; on mobile the aside drops below the form
 * so the panel never feels cramped. The panel rises in on mount unless the
 * visitor prefers reduced motion.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  aside,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const hasAside = Boolean(aside);

  const panelMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE },
      };

  return (
    <div className="aurora min-h-screen">
      {/* ambient aurora pair behind the panel */}
      <div
        aria-hidden="true"
        className="aurora-blob -top-[20%] left-[10%] h-[46vh] w-[46vw]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(168,255,83,0.08), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="aurora-blob bottom-[0%] right-[6%] h-[40vh] w-[38vw]"
        style={{
          animationDelay: "-7s",
          background: "radial-gradient(ellipse at center, rgba(62,230,160,0.07), transparent 65%)",
        }}
      />
      <div
        className={cn(
          "relative mx-auto flex min-h-screen flex-col justify-center px-4 py-12",
          hasAside ? "max-w-5xl" : "max-w-md",
        )}
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className={cn(hasAside && "grid items-stretch gap-6 lg:grid-cols-[1fr_1.05fr]")}>
          <motion.div {...panelMotion} className="glass-strong rounded-2xl p-7 shadow-lift sm:p-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-bone">{title}</h1>
            {subtitle ? <p className="mt-1.5 text-sm text-fog">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
          </motion.div>

          {aside ? (
            <motion.div
              {...(reduced
                ? {}
                : {
                    initial: { opacity: 0, y: 16 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.5, ease: EASE, delay: 0.08 },
                  })}
              className="hidden lg:block"
            >
              {aside}
            </motion.div>
          ) : null}
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-fog">{footer}</div> : null}
        <p className="mt-6 text-center text-xs text-fog">
          MVP prototype, not yet a finished commercial product.
        </p>
      </div>
    </div>
  );
}
