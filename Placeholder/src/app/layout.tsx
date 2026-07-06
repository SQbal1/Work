import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";
import { AnalyticsNotice } from "@/components/marketing/AnalyticsNotice";
import { brand } from "@/config/brand";

/**
 * The X-family type system (shared with PayX / RideX):
 * Space Grotesk for display, Inter for UI/body, JetBrains Mono for money and
 * hashes, IBM Plex Sans Arabic for the bilingual invoice surfaces.
 */
const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? brand.url;
const title = `${brand.name} — Simple e-invoicing for SMEs`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s · ${brand.name}`,
  },
  description: brand.tagline,
  applicationName: brand.name,
  keywords: [
    "e-invoicing",
    "ZATCA",
    "VAT invoice",
    "Saudi Arabia",
    "GCC",
    "invoicing software",
    "SME invoicing",
    "KSA VAT",
    brand.name,
  ],
  authors: [{ name: brand.name }],
  alternates: { canonical: "/" },
  // og:image and twitter:image are injected automatically from the
  // app/opengraph-image.tsx and app/twitter-image.tsx route files.
  openGraph: {
    type: "website",
    siteName: brand.name,
    title,
    description: brand.tagline,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: brand.tagline,
  },
  robots: { index: true, follow: true },
  category: "business",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} ${fontArabic.variable}`}
    >
      <body className="min-h-screen bg-canvas font-sans text-bone antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <AnalyticsNotice />
      </body>
    </html>
  );
}
