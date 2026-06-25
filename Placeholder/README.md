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
- **localStorage** for persistence (no backend, no paid APIs, no real auth/payments)
- Lightweight **React Context** for state — no Redux/Zustand

## Run locally

Requires Node 18.17+ (tested on Node 24).

```bash
npm install      # install dependencies
npm run dev      # start dev server → http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

On first run the app **seeds realistic demo data** (a consulting firm, customers, services, and
invoices) so every screen looks alive. Reset or clear it anytime from **Settings → Data & export**.

---

## What's included

### Pages / screens (`src/app`)

| Route | Screen |
| --- | --- |
| `/` | Marketing landing page (hero, mock dashboard, pain points, how it works, features, who it's for, pricing, FAQ, CTA, footer) |
| `/login`, `/signup` | Prototype auth (no real authentication — routes into the app/onboarding) |
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

### 🔌 Add a real backend later
All persistence flows through **one seam**: `src/lib/storage.ts` (`loadDatabase` / `saveDatabase`)
and the mutators in **`src/lib/store.tsx`**. Swap those bodies for API/database calls (e.g. Supabase,
Postgres) and the UI keeps working unchanged. The `Database` type already mirrors a normalized schema.

### 📜 Add real ZATCA / PDF / WhatsApp / Email later
These are deliberately stubbed for the MVP:
- **PDF** — `src/app/(app)/invoices/[id]/page.tsx` → `downloadPdf()` currently uses the browser print
  dialog (`print` CSS lives in `src/app/globals.css`). Replace with a real PDF generator/service.
- **WhatsApp / Email** — same file, `placeholderSend()` shows a toast. Wire up your provider here.
- **ZATCA** — the **`CompletenessChecklist`** (`src/components/invoices/CompletenessChecklist.tsx`) and
  the **Settings → VAT & ZATCA** card are guidance/placeholders. Real e‑invoice XML, QR codes, and the
  ZATCA Integration phase belong here. **A final compliance review is required before production use.**
- **Auth & payments** — `/login` and `/signup` are mock forms; no payment gateway is integrated.

---

## Project structure

```
src/
├── app/                  # routes (App Router)
│   ├── (app)/            # authenticated app (shared AppShell layout)
│   ├── login, signup     # prototype auth
│   ├── onboarding        # setup wizard
│   ├── layout.tsx        # root layout + providers
│   └── page.tsx          # marketing landing page
├── components/
│   ├── ui/               # design-system primitives
│   ├── layout/           # shell, sidebar, topbar, page header
│   └── {marketing,auth,dashboard,customers,products,invoices,settings}/
├── config/               # brand + nav
├── data/                 # business types, constants, marketing copy, seed
├── lib/                  # storage, store, calc, status, metrics, format, toast, cn, id
└── types/                # the data model
```

---

_Placeholder is a prototype foundation. Do not use it for real legal/tax billing without a proper
compliance review and a production backend._
