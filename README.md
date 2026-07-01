# Placeholder

> A simple, modern **e‑invoicing platform for SMEs and micro‑businesses** in Saudi Arabia & the GCC.
> _Create invoices, track payments, and manage customers — without accounting confusion._

**Placeholder** is an MVP prototype for customer discovery and demos. It is **not** a finished
commercial product and makes **no claim of official ZATCA compliance**. Compliance is represented as
**guided UI and validation placeholders** ("ZATCA‑ready workflow foundation"), not real integration.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18**
- **TypeScript** (simple, readable types)
- **Tailwind CSS** for styling (no UI kit dependency)
- **lucide-react** for icons
- **Supabase** (Postgres + Auth) for signed-in workspaces — real accounts, RLS-scoped
  multi-tenant data, no payments yet
- **localStorage** as a local demo mode for anonymous visitors ("Skip — explore the demo") —
  no signup required, nothing sent anywhere
- Lightweight **React Context** for state — no Redux/Zustand

See [CLAUDE.md](CLAUDE.md) for the full architecture (schema, RLS, auth flow, the
local/Supabase adapter split).

## Run locally

Requires Node 18.17+ (tested on Node 24).

```bash
npm install      # install dependencies
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY (required — see below)
npm run dev      # start dev server → http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set even for local dev —
the store checks for a Supabase session on every page load regardless of whether you sign in.
Point them at your own Supabase project and apply the SQL files in `supabase/migrations/` (in
order) to get the schema. Anonymous visitors still get the local demo either way; only real
sign-in requires a working project.

On first run the app **seeds realistic demo data** (a consulting firm, customers, services, and
invoices) so every screen looks alive. Reset or clear it anytime from **Settings → Data & export**.

---

## What's included

### Pages / screens (`src/app`)

| Route | Screen |
| --- | --- |
| `/` | Marketing landing page (hero, mock dashboard, pain points, how it works, features, who it's for, pricing, FAQ, CTA, footer) |
| `/login`, `/signup` | Real Supabase Auth (email/password) — "Skip — explore the demo" still routes anonymous visitors straight into the app with local data, no account needed |
| `/onboarding` | 5‑step setup wizard (business type → company → customer → service → first invoice) |
| `/dashboard` | Stats (total/paid/unpaid/overdue), monthly revenue chart, quick actions, recent invoices |
| `/customers` | Customer list + add / view / edit / delete (search) |
| `/products` | Products & services list + add / edit / delete + active/inactive toggle |
| `/invoices` | Invoice table with status filters (draft/sent/paid/overdue), search, mark paid, duplicate, delete draft |
| `/invoices/new` | **Invoice builder** — customer, line items (catalogue + custom), VAT, discount, notes, due date, status, live preview, completeness checklist |
| `/invoices/[id]` | Clean invoice preview + Download PDF / WhatsApp / Email (placeholders) + manage actions |
| `/invoices/[id]/edit` | Edit an existing invoice (reuses the builder) |
| `/settings` | Company profile, invoice preferences, VAT/ZATCA placeholder, team placeholder, business type, data export |

### Reusable components (`src/components`)

- **`ui/`** — `Button`, `Card`, `Input`, `Textarea`, `Select`, `Field`, `Modal`, `Table`, `Badge`,
  `StatCard`, `EmptyState`, `Toast`, `Avatar`
- **`layout/`** — `AppShell`, `Sidebar` (collapses to a mobile drawer), `Topbar`, `PageHeader`
- **Feature modules** — `marketing/`, `auth/`, `dashboard/`, `customers/`, `products/`, `invoices/`,
  `settings/` (forms, the shared `InvoiceDocument`, `CompletenessChecklist`, etc.)
- **`Providers`** (toast + data store) and **`Logo`**

### Data model (`src/types/index.ts`)

`Company`, `Customer`, `Product`, `Invoice`, `InvoiceLineItem`, `Settings`, `BusinessTypeId`,
`VatCategory`, `InvoiceStatus` (+ derived `overdue`), and the persisted `Database` shape. Each
interface is intentionally flat so it maps cleanly to a future DB table. Money math lives in
`src/lib/calc.ts`; invoice status derivation in `src/lib/status.ts`; dashboard metrics in
`src/lib/metrics.ts`.

---

## Where to change things

### 🏷️ Branding / rename "Placeholder"
- **`src/config/brand.ts`** — product name, tagline, currency, VAT rate, support email. Changing
  `name` here updates the nav, footer, auth, invoices, logo letter, and page titles everywhere.
- **`tailwind.config.ts`** — the `brand` color scale (and `accent`) drive the whole theme.

### 🧩 Content & config
- **`src/data/marketing.ts`** — all landing‑page copy (pain points, steps, features, pricing, FAQ).
- **`src/data/businessTypes.ts`** — supported business verticals.
- **`src/data/constants.ts`** — VAT categories and payment‑term presets.
- **`src/data/seed.ts`** — the demo workspace.
- **`src/config/nav.ts`** — sidebar navigation.

### 🔌 Backend & auth
Signed-in users get a real Supabase-backed workspace (Postgres + Auth, RLS-scoped per tenant);
anonymous visitors still get the original localStorage demo. `src/lib/store.tsx` picks between
the two via a `DataAdapter` (`src/lib/data/{local,supabase}Adapter.ts`) based on whether there's
a session — components never know which one is active. Full architecture, schema, and RLS
details live in [CLAUDE.md](CLAUDE.md).

### 📜 Add real ZATCA / PDF / WhatsApp / Email later
These are deliberately stubbed for the MVP:
- **PDF** — `src/app/(app)/invoices/[id]/page.tsx` → `downloadPdf()` currently uses the browser print
  dialog (`print` CSS lives in `src/app/globals.css`). Replace with a real PDF generator/service.
- **WhatsApp / Email** — same file, `placeholderSend()` shows a toast. Wire up your provider here.
- **ZATCA** — the **`CompletenessChecklist`** (`src/components/invoices/CompletenessChecklist.tsx`) and
  the **Settings → VAT & ZATCA** card are guidance/placeholders. Real e‑invoice XML, QR codes, and the
  ZATCA Integration phase belong here. **A final compliance review is required before production use.**
- **Payments** — no payment gateway is integrated. (Auth is real — see above — only billing isn't.)

---

## Project structure

```
src/
├── app/                  # routes (App Router)
│   ├── (app)/            # authenticated app (shared AppShell layout)
│   ├── login, signup     # real Supabase Auth
│   ├── onboarding        # setup wizard (creates the workspace on first run)
│   ├── layout.tsx        # root layout + providers
│   └── page.tsx          # marketing landing page
├── components/
│   ├── ui/               # design-system primitives
│   ├── layout/           # shell, sidebar, topbar, page header
│   └── {marketing,auth,dashboard,customers,products,invoices,settings}/
├── config/               # brand + nav
├── data/                 # business types, constants, marketing copy, seed
├── lib/
│   ├── store.tsx         # the store components use — picks local vs Supabase
│   ├── storage.ts        # localStorage persistence (local demo mode)
│   ├── data/              # DataAdapter interface + local/supabase implementations
│   ├── actions/           # Supabase Server Actions (one file per resource)
│   ├── supabase/          # browser/server Supabase client factories
│   └── calc, status, metrics, format, toast, cn, id  # small pure helpers
├── middleware.ts          # session refresh + workspace-onboarding redirect
└── types/                # the app's data model + generated Supabase types

supabase/migrations/       # the schema, in order — apply to a fresh project to reproduce it
```

---

_Placeholder is a prototype foundation with a real backend, but still makes no claim of ZATCA
compliance. Do not use it for real legal/tax billing without a proper compliance review._
