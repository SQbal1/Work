"use client";

import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, type Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
};

/** Staggered container — wrap a group and put each child in <FadeItem>. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

/** A single staggered child. Only animates inside a <Stagger>. */
export function FadeItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/** Standalone fade-up, optionally delayed. */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up to `value` on mount. Formats via `format` (defaults to rounded int). */
export function CountUp({
  value,
  format,
  duration = 0.9,
  className,
}: {
  value: number;
  format?: (n: number) => ReactNode;
  duration?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, reduced, duration]);

  return <span className={className}>{format ? format(display) : Math.round(display).toString()}</span>;
}
