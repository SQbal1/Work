import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";
import { AnalyticsNotice } from "@/components/marketing/AnalyticsNotice";
import { brand } from "@/config/brand";

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
    <html lang="en">
      <body className="min-h-screen bg-canvas font-sans text-bone antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <AnalyticsNotice />
      </body>
    </html>
  );
}
