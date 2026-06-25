import type { Transition, Variants } from "framer-motion";

export const SPRINGS = {
  badge: { type: "spring", stiffness: 360, damping: 32, mass: 0.76 },
  headline: { type: "spring", stiffness: 300, damping: 34, mass: 0.9 },
  body: { type: "spring", stiffness: 260, damping: 30, mass: 0.82 },
  cta: { type: "spring", stiffness: 420, damping: 34, mass: 0.68 },
  preview: { type: "spring", stiffness: 150, damping: 28, mass: 1.12 },
  parallax: { type: "spring", stiffness: 120, damping: 24, mass: 1.1 },
  hover: { type: "spring", stiffness: 520, damping: 38, mass: 0.58 },
  state: { type: "spring", stiffness: 360, damping: 30, mass: 0.74 },
  line: { type: "spring", stiffness: 190, damping: 28, mass: 0.84 },
  scrollCard: { type: "spring", stiffness: 210, damping: 30, mass: 0.9 },
  // Smooths the raw scroll progress before it drives the pinned story.
  // Lower stiffness = more "scrubbed lag"; higher = tighter to the wheel.
  scroll: { type: "spring", stiffness: 140, damping: 30, mass: 0.4 },
  // Physics for non-scrubbed micro-interactions inside the story (chips, pills).
  story: { type: "spring", stiffness: 220, damping: 30, mass: 0.8 },
} satisfies Record<string, Transition>;

export const STAGGER = {
  hero: 0.11,
  headline: 0.1,
  pills: 0.08,
  sectionCards: 0.07,
};

export const SCROLL_RANGES = {
  input: [0, 1] as [number, number],
  heroPreview: {
    y: [0, 74] as [number, number],
    scale: [1, 0.965] as [number, number],
    rotateX: [0, 2.4] as [number, number],
  },
  heroGlow: {
    x: [0, -58] as [number, number],
    y: [0, 82] as [number, number],
    opacity: [0.92, 0.42] as [number, number],
  },
  abstract: {
    y: [0, -54] as [number, number],
    rotate: [0, 8] as [number, number],
  },
  chips: {
    y: [0, -34] as [number, number],
    opacity: [0.9, 0.45] as [number, number],
  },
  firstSection: {
    y: [52, -18] as [number, number],
    scale: [0.965, 1] as [number, number],
    opacity: [0.3, 1] as [number, number],
  },
};

/**
 * Tuning surface for the pinned "Workflow Scroll Story" centerpiece.
 *
 * Everything that controls feel lives here so the component stays declarative:
 *  - scrollVh ........ total scroll length of the section (taller = slower, more
 *                      deliberate scrub). Effective pinned travel is
 *                      (scrollVh - 100)vh because the stage is pinned at 100vh.
 *  - stages .......... number of narrative stages (drives the 0..N-1 stageFloat).
 *  - enter / exit .... how far an incoming/outgoing stage panel travels + scales
 *                      as it crossfades through the fixed viewport.
 *  - visibility ...... crossfade windows around each stage center, in stageFloat
 *                      units. `lead` = distance at which a panel starts/ends
 *                      fading; `settle` = distance at which it is fully shown.
 *  - internalLead .... how early (in stageFloat units before a stage centers) its
 *                      internal micro-animation begins, so content is fully
 *                      populated by the time the stage is centered.
 *  - parallax ........ px of drift for the background atmosphere glows.
 *  - glow ............ background atmosphere intensity (violet/pink, decorative).
 */
export const WORKFLOW_STORY = {
  stages: 5,
  scrollVh: 360,
  enter: { x: 40, y: 28, scale: 0.95 },
  exit: { x: -30, y: -22, scale: 0.97 },
  visibility: { lead: 0.5, settle: 0.28 },
  internalLead: 0.45,
  parallax: 20,
  glow: { opacity: 0.16 },
} as const;

export const WORKFLOW_TIMING = {
  loopMs: 12000,
  finalStep: 8,
  checkpoints: [0, 880, 1740, 2860, 4100, 5400, 6900, 8350, 9800],
};

export const heroContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER.hero,
      delayChildren: 0.08,
    },
  },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRINGS.body,
  },
};
