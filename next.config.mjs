/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Linting is handled separately; don't block production builds on lint rules.
  eslint: { ignoreDuringBuilds: true },
  // Required so /ingest/ keeps its trailing slash before the rewrite matches.
  skipTrailingSlashRedirect: true,
  // Reverse-proxy PostHog (EU) under our own origin so analytics requests are
  // first-party and survive ad-blockers. The client points at /ingest
  // (see components/Analytics.tsx). Portable across Netlify and Vercel.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
