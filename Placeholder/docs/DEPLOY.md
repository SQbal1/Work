# Deploy checklist

Short, practical steps to take Placeholder from local to a live host (Netlify or Vercel).
The app is a static Next.js 14 marketing site — no server/database to provision.

---

## 1. Environment variables

All four are `NEXT_PUBLIC_*`, which means they are **inlined at build time** — they must be
set in the **host's build environment**, not only in `.env.local`. Changing one later requires a
fresh build/redeploy to take effect.

| Variable | Set to | If you leave it unset |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The real deployed origin, e.g. `https://placeholder.sa` (no trailing slash) | SEO canonical URLs, Open Graph image, `robots.txt`, and `sitemap.xml` all point at the `placeholder.sa` default instead of your real domain |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog **EU** project key (Project Settings → Project API key, starts with `phc_`) | Analytics never initializes, the cookieless analytics notice never shows, and the conversion funnel stays empty |
| `NEXT_PUBLIC_POSTHOG_HOST` | Leave as `/ingest` (the first-party reverse proxy) | Defaults to `/ingest` anyway — only change to `https://eu.i.posthog.com` if you want to skip the proxy |
| `NEXT_PUBLIC_FORMSPREE_ID` | Your Formspree form id — only the `<id>` part of `https://formspree.io/f/<id>` | The pilot form shows a local success message but **does not actually send** the lead anywhere |

> The PostHog reverse proxy (`/ingest/*` → `eu.i.posthog.com`) is already configured in
> `next.config.mjs` and works on both Netlify and Vercel — nothing to set up there.

### Where to set them

- **Vercel:** Project → Settings → Environment Variables (add to Production, and Preview if you
  want analytics on preview deploys). Then redeploy.
- **Netlify:** Site configuration → Environment variables. Then trigger a new deploy.

---

## 2. Deploy order

1. Set the four env vars in the host build environment (above).
2. Connect the repo (or `vercel` / `netlify deploy --build`). Build command `next build`,
   publish/output handled by the host's Next.js adapter.
3. Because `NEXT_PUBLIC_*` is inlined at build time, **always trigger a fresh build after
   changing any env var** — a cached build keeps the old values.

---

## 3. Post-deploy smoke test (5 checks)

1. **Analytics live** — open the site, view page source, confirm the PostHog key is present;
   the cookieless analytics notice should appear bottom-right.
2. **Funnel fires** — open `/demo`, start the walkthrough, finish it; submit the pilot form on
   `/pricing`. Confirm the events land in your PostHog funnel (`Start walkthrough clicked`,
   `Demo completed`, `Pilot request submitted/success`).
3. **Lead capture** — confirm the pilot submission arrived in your Formspree dashboard / inbox.
4. **SEO reflects the real domain** — visit `/robots.txt` and `/sitemap.xml`; URLs should use
   `NEXT_PUBLIC_SITE_URL`, not `placeholder.sa`. Check the OG image at `/opengraph-image`.
5. **Routes work** — click through Features / Demo / Pricing / Contact (instant client-side nav),
   and hit a bogus URL to confirm the branded 404 renders.

---

## 4. Before going public (not needed for internal pilot testing)

These are fine as-is for internal testing with Ali, but revisit before real customers land:

- **Swap the contact details** in `src/config/brand.ts` — `supportEmail` and the two
  `whatsappContacts` are currently personal lines (Salem / Ali). Move to a business email /
  WhatsApp number for a public launch.
- **Real domain** — point `NEXT_PUBLIC_SITE_URL` (and `brand.url` in `src/config/brand.ts`) at
  the actual domain once chosen; the working name is still "Placeholder".
- **Rotate any exposed keys** — if a PostHog personal API key was ever pasted into chat, delete it
  in PostHog → Personal API keys. (The `NEXT_PUBLIC_POSTHOG_KEY` project key is public by design and
  is fine to ship.)
- **Legal review** — the privacy/terms/compliance pages are honest good-faith drafts, not
  lawyer-reviewed.

---

_Local reference: copy `.env.example` → `.env.local` for local dev. Both `.env*.local` are
gitignored._
