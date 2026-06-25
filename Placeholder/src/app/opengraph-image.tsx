import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

/**
 * Dynamically generated Open Graph / social share image (1200×630).
 * On-brand: dark ink canvas, faint grid, lime glow + accent. Next.js wires
 * this into og:image automatically (and twitter-image.tsx re-exports it).
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
          backgroundColor: "#121317",
          backgroundImage:
            "linear-gradient(to right, rgba(215,217,221,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(215,217,221,0.05) 1px, transparent 1px)",
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
              "radial-gradient(circle at 50% 50%, rgba(168,255,83,0.22), rgba(168,255,83,0) 70%)",
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
                borderRadius: 12,
                backgroundColor: "#1c1e21",
                border: "1px solid #272a2e",
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#a8ff53" }} />
            </div>
            <div style={{ marginLeft: 18, fontSize: 32, fontWeight: 600, color: "#e5e7eb" }}>
              {brand.name}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid #272a2e",
              backgroundColor: "rgba(168,255,83,0.06)",
              color: "#878c99",
              fontSize: 22,
            }}
          >
            Saudi / GCC e-invoicing
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 600, color: "#e5e7eb", lineHeight: 1.05 }}>
            Create invoices. Validate VAT.
          </div>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 600, color: "#a8ff53", lineHeight: 1.1 }}>
            Track payment state.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              maxWidth: 920,
              fontSize: 30,
              color: "#878c99",
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
            borderTop: "1px solid #272a2e",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", color: "#878c99", fontSize: 24 }}>
            VAT-ready workflow foundation
          </div>
          <div style={{ display: "flex", color: "#d7d9dd", fontSize: 24 }}>{brand.domain}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
