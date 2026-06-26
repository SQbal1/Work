"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { SPRINGS } from "@/components/marketing/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, scale: 0.992 }}
      transition={{ ...SPRINGS.body, delay: delay / 1000 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px", amount: 0.12 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
    >
      {children}
    </motion.div>
  );
}
