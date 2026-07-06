import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

/**
 * Dynamically generated Open Graph / social share image (1200×630).
 * On-brand: near-black canvas, faint grid, lime→mint gradient X. Next.js
 * wires this into og:image automatically (twitter-image.tsx re-exports it).
 */
export const alt = `${brand.name} — Simple e-invoicing for SMEs in Saudi Arabia & the GCC`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#05070c",
          backgroundImage:
            "linear-gradient(to right, rgba(226,233,244,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,233,244,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px, 48px 48px",
          fontFamily: "sans-serif",
        }}
      >
        {/* lime glow, top-right */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -180,
            width: 760,
            height: 760,
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(168,255,83,0.2), rgba(168,255,83,0) 70%)",
          }}
        />
        {/* mint glow, bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -300,
            left: -220,
            width: 720,
            height: 720,
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(62,230,160,0.14), rgba(62,230,160,0) 70%)",
          }}
        />

        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "#0a0e16",
                border: "1px solid rgba(226,233,244,0.17)",
                color: "#a8ff53",
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              X
            </div>
            <div style={{ display: "flex", marginLeft: 18, fontSize: 34, fontWeight: 600 }}>
              <span style={{ color: "#f4f6f9" }}>Invoice&nbsp;</span>
              <span style={{ color: "#a8ff53" }}>X</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid rgba(226,233,244,0.17)",
              backgroundColor: "rgba(168,255,83,0.06)",
              color: "#98a2b3",
              fontSize: 22,
            }}
          >
            Saudi / GCC e-invoicing
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 600, color: "#f4f6f9", lineHeight: 1.05 }}>
            Invoicing, engineered
          </div>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 600, color: "#a8ff53", lineHeight: 1.1 }}>
            for the ZATCA era.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              maxWidth: 920,
              fontSize: 30,
              color: "#98a2b3",
              lineHeight: 1.4,
            }}
          >
            {brand.shortTagline} Built for SMEs and micro-businesses in Saudi Arabia &amp; the GCC.
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(226,233,244,0.17)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", color: "#98a2b3", fontSize: 24 }}>
            Part of the X family: PayX · RideX
          </div>
          <div style={{ display: "flex", color: "#c8d0dc", fontSize: 24 }}>{brand.domain}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
