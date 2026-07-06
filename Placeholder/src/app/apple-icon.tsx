import { ImageResponse } from "next/og";

// Apple touch icon (180×180) — the gradient X on near-black, matching the logo.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#05070c",
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(168,255,83,0.18), transparent 70%)",
        }}
      >
        <svg width="104" height="104" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="x" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9f07c" />
              <stop offset="45%" stopColor="#a8ff53" />
              <stop offset="100%" stopColor="#3ee6a0" />
            </linearGradient>
          </defs>
          <path
            d="M4 3.5 L10.4 12 L4 20.5 H8.1 L12.4 14.7 L16.7 20.5 H20.8 L14.4 12 L20.8 3.5 H16.7 L12.4 9.3 L8.1 3.5 Z"
            fill="url(#x)"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
