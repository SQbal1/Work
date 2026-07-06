"use client";

import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleDot } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { HeroWorkflowPreview } from "@/components/marketing/HeroWorkflowPreview";
import {
  heroContainer,
  heroItem,
  SCROLL_RANGES,
  SPRINGS,
  STAGGER,
} from "@/components/marketing/motion";
import { buttonStyles } from "@/components/ui/Button";
import { XName } from "@/components/XName";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

const headlineLines = ["Create invoices.", "Validate VAT.", "Track every riyal."];

const trustPills = ["VAT-aware totals", "Bilingual EN/AR invoices", "ZATCA-ready foundation"];

export function LandingHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const reduced = Boolean(prefersReducedMotion);
  const desktopMotion = useFineDesktopMotion();
  const motionEnabled = desktopMotion && !reduced;
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const previewActive = useInView(heroRef, { amount: 0.08, margin: "160px" });
  const copyY = useTransform(scrollYProgress, [0, 0.7, 1], [0, -14, -52]);
  const copyScale = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.992, 0.972]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.76, 0.34]);

  return (
    <motion.section
      ref={heroRef}
      animate="show"
      className="aurora hero-motion-grid home-hero relative border-b border-hairline"
      initial={motionEnabled ? "hidden" : false}
      variants={heroContainer}
    >
      <HeroAtmosphere reduced={!motionEnabled} scrollYProgress={scrollYProgress} />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] max-w-[88rem] items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(320px,0.66fr)_minmax(0,1.34fr)] lg:grid-rows-[700px] lg:gap-10 lg:px-8 lg:py-9 xl:grid-cols-[minmax(360px,0.72fr)_minmax(720px,1.28fr)] xl:gap-12">
        <motion.div
          className="max-w-2xl lg:max-w-[30rem] xl:max-w-[31rem]"
          style={
            !motionEnabled
              ? undefined
              : { opacity: copyOpacity, scale: copyScale, y: copyY }
          }
          variants={heroContainer}
        >
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-graphite bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cloud backdrop-blur-sm"
            transition={SPRINGS.badge}
            variants={heroItem}
            whileHover={reduced ? undefined : { y: -2, borderColor: "rgba(168, 255, 83, 0.35)" }}
          >
            <CircleDot className="signal-pulse h-3.5 w-3.5 text-signal" />
            Saudi/GCC e-invoicing
          </motion.span>

          <motion.h1
            className="mt-7 font-display text-[2.85rem] font-semibold leading-[1.02] tracking-tight sm:text-[3.6rem] lg:text-[clamp(3rem,1.4rem+2.3vw,4rem)] xl:text-[clamp(3.3rem,1.3rem+2.5vw,4.3rem)]"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: STAGGER.headline,
                  delayChildren: 0.06,
                },
              },
            }}
          >
            {headlineLines.map((line, index) => (
              <span className="block overflow-hidden pb-1" key={line}>
                <motion.span
                  className={cn(
                    "block",
                    index === headlineLines.length - 1 ? "text-gradient-x" : "text-metal",
                  )}
                  variants={{
                    hidden: { y: "112%", opacity: 0, rotateX: -8 },
                    show: {
                      y: "0%",
                      opacity: 1,
                      rotateX: 0,
                      transition: SPRINGS.headline,
                    },
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p className="mt-7 max-w-xl text-base leading-[1.7] text-ash sm:text-lg" variants={heroItem}>
            Small teams still track customer records, VAT checks, invoice status, and payment
            follow-up across spreadsheets, WhatsApp, and memory. <XName name={brand.name} /> brings
            that workflow into one calm, VAT-aware path.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-nowrap"
            variants={heroItem}
          >
            <motion.div
              className="rounded-[10px] sm:w-auto"
              transition={SPRINGS.hover}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -3,
                      scale: 1.012,
                    }
              }
              whileTap={reduced ? undefined : { scale: 0.992 }}
            >
              <Link className={buttonStyles("primary", "lg", "w-full sm:w-auto")} href="/signup">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div
              className="rounded-[10px] sm:w-auto"
              transition={SPRINGS.hover}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -3,
                      scale: 1.008,
                    }
              }
              whileTap={reduced ? undefined : { scale: 0.994 }}
            >
              <Link className={buttonStyles("secondary", "lg", "w-full sm:w-auto")} href="/demo">
                Open demo workspace
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-9 flex flex-wrap content-start gap-2.5 lg:min-h-[68px]"
            variants={heroContainer}
          >
            {trustPills.map((pill) => (
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-3 py-1.5 text-xs text-cloud backdrop-blur-sm"
                key={pill}
                transition={SPRINGS.hover}
                variants={heroItem}
                whileHover={reduced ? undefined : { y: -2, borderColor: "rgba(168, 255, 83, 0.3)" }}
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-signal" />
                {pill}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <ProductPreviewStage
          active={previewActive}
          reduced={!motionEnabled}
          scrollYProgress={scrollYProgress}
        />
      </div>
    </motion.section>
  );
}

function useFineDesktopMotion() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return enabled;
}

function ProductPreviewStage({
  active,
  reduced,
  scrollYProgress,
}: {
  active: boolean;
  reduced: boolean;
  scrollYProgress: MotionValue<number>;
}) {
  const scrollY = useTransform(scrollYProgress, SCROLL_RANGES.input, SCROLL_RANGES.heroPreview.y);
  const scrollScale = useTransform(scrollYProgress, SCROLL_RANGES.input, SCROLL_RANGES.heroPreview.scale);
  const scrollRotateX = useTransform(
    scrollYProgress,
    SCROLL_RANGES.input,
    SCROLL_RANGES.heroPreview.rotateX,
  );
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 0.88, 0.48]);
  const pointerRotateX = useMotionValue(0);
  const pointerRotateY = useMotionValue(0);
  const hoverGlow = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const interactiveRotateX = useSpring(pointerRotateX, SPRINGS.tilt);
  const interactiveRotateY = useSpring(pointerRotateY, SPRINGS.tilt);
  const interactiveGlow = useSpring(hoverGlow, SPRINGS.hover);
  const interactiveGlareX = useSpring(glareX, SPRINGS.tilt);
  const interactiveGlareY = useSpring(glareY, SPRINGS.tilt);
  const borderAlpha = useTransform(interactiveGlow, [0, 1], [0.08, 0.26]);
  const shadowAlpha = useTransform(interactiveGlow, [0, 1], [0, 0.16]);
  const glareAlpha = useTransform(interactiveGlow, [0, 1], [0, 0.13]);
  const borderColor = useMotionTemplate`rgba(168, 255, 83, ${borderAlpha})`;
  const previewShadow = useMotionTemplate`0 0 34px rgba(168, 255, 83, ${shadowAlpha})`;
  const previewGlare = useMotionTemplate`radial-gradient(circle at ${interactiveGlareX}% ${interactiveGlareY}%, rgba(255, 255, 255, ${glareAlpha}), transparent 36%)`;
  const interactiveRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestPointer = useRef({ glareX: 50, glareY: 50, rotateX: 0, rotateY: 0 });
  const trackingPointer = useRef(false);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const resetPointer = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    trackingPointer.current = false;
    pointerRotateX.set(0);
    pointerRotateY.set(0);
    hoverGlow.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [glareX, glareY, hoverGlow, pointerRotateX, pointerRotateY]);

  useEffect(() => {
    if (reduced) return;

    const handleWindowPointerMove = (event: globalThis.PointerEvent) => {
      if (!trackingPointer.current || event.pointerType === "touch") return;

      const rect = interactiveRef.current?.getBoundingClientRect();
      if (!rect) return;

      const outside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

      if (outside) resetPointer();
    };

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleWindowPointerMove);
  }, [reduced, resetPointer]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const normalizedY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    trackingPointer.current = true;
    latestPointer.current = {
      glareX: (normalizedX + 1) * 50,
      glareY: (normalizedY + 1) * 50,
      rotateX: normalizedY * 7,
      rotateY: normalizedX * -7,
    };

    hoverGlow.set(1);

    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      pointerRotateX.set(latestPointer.current.rotateX);
      pointerRotateY.set(latestPointer.current.rotateY);
      glareX.set(latestPointer.current.glareX);
      glareY.set(latestPointer.current.glareY);
    });
  };

  return (
    <motion.div
      className="hero-preview-shell home-hero-preview w-full min-w-0 lg:ml-auto lg:h-[700px] lg:max-w-[clamp(640px,65vw,1000px)]"
      style={{ perspective: 1200 }}
      variants={{
        hidden: { opacity: 0, y: 46, scale: 0.958, rotateX: 6, rotateY: -3 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          transition: SPRINGS.preview,
        },
      }}
    >
      <motion.div
        className="h-full"
        style={
          reduced
            ? undefined
            : {
                opacity: scrollOpacity,
                rotateX: scrollRotateX,
                scale: scrollScale,
                y: scrollY,
                transformStyle: "preserve-3d",
              }
        }
      >
        <motion.div
          className="relative h-full transform-gpu"
          data-hero-preview-interactive
          ref={interactiveRef}
          onPointerLeave={resetPointer}
          onPointerMove={handlePointerMove}
          style={
            reduced
              ? undefined
              : {
                  transformOrigin: "center",
                  rotateX: interactiveRotateX,
                  rotateY: interactiveRotateY,
                  transformStyle: "preserve-3d",
                }
          }
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[10px] border border-signal/[0.08] bg-signal/[0.018]"
            style={
              reduced
                ? undefined
                : {
                    backgroundImage: previewGlare,
                    borderColor,
                    boxShadow: previewShadow,
                    transform: "translateZ(1px)",
                  }
            }
          />
          <HeroWorkflowPreview active={active && !reduced} staticMode={reduced} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function HeroAtmosphere({
  reduced: _reduced,
  scrollYProgress: _scrollYProgress,
}: {
  reduced: boolean;
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <>
      <div aria-hidden="true" className="hero-scroll-grid" />
      <div aria-hidden="true" className="hero-aura" />
      {/* Breathing aurora — lime top-left, mint right (the Invoice X pair). */}
      <div
        aria-hidden="true"
        className="aurora-blob -top-[28%] left-[6%] -z-10 h-[55vh] w-[52vw]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(168,255,83,0.1), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="aurora-blob -top-[12%] right-[0%] -z-10 h-[48vh] w-[44vw]"
        style={{
          animationDelay: "-8s",
          background: "radial-gradient(ellipse at center, rgba(62,230,160,0.09), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[13%] hidden h-32 w-56 rounded-[14px] border border-hairline bg-grid-faint opacity-25 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[18%] left-[4%] hidden h-24 w-44 rounded-[14px] border border-hairline bg-ink/50 opacity-35 xl:block"
      >
        <span className="absolute left-4 top-4 h-1.5 w-1.5 rounded-full bg-signal" />
        <span className="absolute bottom-5 right-5 h-1 w-16 bg-hairline" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[3%] top-[34%] hidden rounded-full border border-hairline bg-ink/80 px-3 py-1 font-mono text-[11px] text-fog backdrop-blur-sm xl:block"
      >
        VAT sync <span className="text-signal">active</span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[26%] right-[7%] hidden rounded-full border border-hairline bg-ink/80 px-3 py-1 font-mono text-[11px] text-fog backdrop-blur-sm xl:block"
      >
        receivable <span className="text-signal">open</span>
      </div>
    </>
  );
}
