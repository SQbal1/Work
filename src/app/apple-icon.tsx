import { ImageResponse } from "next/og";

// Apple touch icon (180×180) — lime brand mark on ink, matching the logo.
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
          backgroundColor: "#121317",
        }}
      >
        <div style={{ width: 92, height: 92, borderRadius: 24, backgroundColor: "#a8ff53" }} />
      </div>
    ),
    { ...size },
  );
}
