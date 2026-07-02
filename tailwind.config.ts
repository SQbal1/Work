import type { Config } from "tailwindcss";

/**
 * Design tokens for Placeholder.
 * The visual system maps the DESIGN.md dark technical palette into Tailwind
 * while keeping the existing component API intact.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#1c1e21",
        ink: "#121317",
        hairline: "#272a2e",
        graphite: "#3b3e45",
        bone: "#e5e7eb",
        cloud: "#d7d9dd",
        ash: "#b5b8c0",
        fog: "#878c99",
        signal: "#a8ff53",
        "syntax-violet": "#9c9af2",
        "syntax-pink": "#fa3abf",
        "loop-green": "#afec73",
        "key-lime": "#d9f07c",
        "tag-magenta": "#e888f8",
        "mute-red": "#f43f5e",
        // Legacy brand scale now resolves to the new signal-lime system.
        brand: {
          50: "#20261d",
          100: "#28321f",
          200: "#354527",
          300: "#58742f",
          400: "#7fc044",
          500: "#a8ff53",
          600: "#a8ff53",
          700: "#d9f07c",
          800: "#eaffb5",
          900: "#121317",
          950: "#0c0d10",
        },
        accent: {
          50: "#1e2c1b",
          100: "#253820",
          200: "#355427",
          400: "#afec73",
          500: "#a8ff53",
          600: "#8de640",
          700: "#6fb833",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist)",
          "Geist",
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
          "var(--font-satoshi)",
          "Satoshi",
          "General Sans",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "Geist Mono",
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        soft: "none",
        card: "none",
        lift: "none",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(215,217,221,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(215,217,221,0.045) 1px, transparent 1px)",
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
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-up": "fade-up 0.5s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "toast-in": "toast-in 0.2s ease-out both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
