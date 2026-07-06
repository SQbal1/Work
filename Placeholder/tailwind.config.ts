import type { Config } from "tailwindcss";

/**
 * Invoice X design tokens.
 *
 * The visual system is the X-family language (shared DNA with PayX / RideX):
 * a near-black canvas, glass panels on hairline borders, and one surgical
 * accent — Invoice X owns the lime→mint "signal" gradient the way PayX owns
 * cyan→violet and RideX owns red/gold.
 *
 * Token NAMES are stable (canvas/ink/bone/ash/fog/signal/…) so every screen
 * re-skins from here without touching component markup.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — deep, cool near-black (family baseline).
        canvas: "#05070c",
        ink: "#0a0e16",
        raised: "#0e131d",
        // Lines — alpha hairlines so they sit correctly on any surface.
        hairline: "rgba(226,233,244,0.08)",
        graphite: "rgba(226,233,244,0.17)",
        // Text ramp.
        bone: "#f4f6f9",
        cloud: "#c8d0dc",
        ash: "#98a2b3",
        fog: "#68738a",
        // The Invoice X signal — lime, gradient partner mint.
        signal: "#a8ff53",
        mint: "#3ee6a0",
        // Support hues (charts, badges, states).
        "syntax-violet": "#9c9af2",
        "syntax-pink": "#fa3abf",
        "loop-green": "#7ef29d",
        "key-lime": "#d9f07c",
        "tag-magenta": "#e888f8",
        "mute-red": "#ff5c72",
        "warm-gold": "#f0c46a",
        // Legacy brand scale now resolves to the signal system.
        brand: {
          50: "#131a10",
          100: "#1a2414",
          200: "#28381c",
          300: "#476828",
          400: "#7fc044",
          500: "#a8ff53",
          600: "#a8ff53",
          700: "#d9f07c",
          800: "#eaffb5",
          900: "#0a0e16",
          950: "#05070c",
        },
        accent: {
          50: "#0f1a12",
          100: "#142417",
          200: "#1f3a22",
          400: "#7ef29d",
          500: "#a8ff53",
          600: "#8de640",
          700: "#3ee6a0",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Space Grotesk",
          "var(--font-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        arabic: [
          "var(--font-arabic)",
          "IBM Plex Sans Arabic",
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 0 rgba(244,246,249,0.03) inset, 0 10px 30px -12px rgba(0,0,0,0.6)",
        card: "0 1px 0 rgba(244,246,249,0.03) inset, 0 16px 40px -20px rgba(0,0,0,0.7)",
        lift: "0 1px 0 rgba(244,246,249,0.05) inset, 0 24px 60px -24px rgba(0,0,0,0.85)",
        "glow-signal": "0 0 40px -6px rgba(168,255,83,0.4)",
        "glow-soft": "0 0 32px -8px rgba(168,255,83,0.25)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(226,233,244,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,233,244,0.045) 1px, transparent 1px)",
        "gradient-x": "linear-gradient(100deg, #d9f07c 0%, #a8ff53 42%, #3ee6a0 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "shimmer-slide": {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        aurora: {
          "0%": { transform: "translate3d(-6%, -4%, 0) scale(1)", opacity: "0.7" },
          "50%": { transform: "translate3d(5%, 3%, 0) scale(1.08)", opacity: "1" },
          "100%": { transform: "translate3d(-3%, 5%, 0) scale(0.98)", opacity: "0.75" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-up": "fade-up 0.5s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "toast-in": "toast-in 0.2s ease-out both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "shimmer-slide": "shimmer-slide 2.8s linear infinite",
        aurora: "aurora 16s ease-in-out infinite alternate",
        float: "float 7s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
