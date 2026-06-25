# Placeholder — SaaS Architecture Roadmap

> Status: planning document. Describes how to evolve the current localStorage MVP into a
> real multi-user SaaS **gradually**, without rewriting the app or breaking the prototype.
> This document changes no code.

## 1. Current architecture

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind, `lucide-react` icons.
- **Marketing routes:** `/`, `/features`, `/pricing` — static, framer-motion choreography, monochrome + lime.
- **Prototype app routes** (under `(app)/`): `dashboard`, `customers`, `products` (services), `invoices` (`new`, `[id]`, `[id]/edit`), `settings`.
- **Mock auth / onboarding:** `/login`, `/signup`, `/onboarding` (5-step wizard). No real authentication.
- **Persistence:** browser `localStorage` only, single key `placeholder_db_v1`, SSR-guarded.
- **Local data model:** one typed `Database` object (`src/types/index.ts`) seeded with demo data on first run.

## 2. What is good about the current architecture

- **Clean separation of concerns** — `config/`, `data/`, `lib/`, `components/`, `types/`.
- **Centralized store** — one React Context (`src/lib/store.tsx`) with typed mutators; no Redux/Zustand.
- **Single localStorage seam** — all persistence routes through `src/lib/storage.ts`.
- **Pure domain helpers** — `lib/calc.ts` (money), `lib/status.ts` (derived overdue), `lib/metrics.ts` (dashboard); no side effects.
- **Normalized `Database` type** — each interface ≈ one future DB table; money/status derived, never stored.
- **Clear marketing/prototype separation** — route groups keep the public site independent of the app shell.

## 3. Critical gaps before real SaaS (ranked)

1. **Backend persistence** — replace localStorage with a real database.
2. **Real authentication** — replace mock login/signup.
3. **Workspace/tenant model** — no `userId`/`workspaceId` exists anywhere today; multi-tenancy must be designed into the schema *before* migrating data. Costliest to defer.
4. **Server-side invoice numbering** — `nextInvoiceNumber` increments in client state; two tabs/devices will collide. Needs a DB sequence/transaction.
5. **Deterministic PDF generation** — currently the browser print dialog; move server-side.
6. **ZATCA-ready backend foundation** — XML/QR/event scaffolding server-side (foundation only, not official integration).
7. **Email/WhatsApp delivery via providers** — currently toast placeholders.
8. **Validation/testing layer** — only a "light shape guard" exists; add schema validation + unit tests on money/status logic.

## 4. Recommended future stack

- **Supabase Auth** — email/OTP/social; replaces mock auth.
- **Supabase Postgres** — managed DB mirroring the existing normalized `Database` shape.
- **Row Level Security (RLS)** — every tenant table scoped by `workspace_id`; enforced at the DB.
- **Workspace/company tenancy** — a workspace owns companies, customers, products, invoices, settings.
- **Server Actions / Route Handlers** — for privileged ops (invoice numbering, PDF, delivery, ZATCA payloads).
- **Zod validation** — at every storage/API boundary; derive TS types from schemas where practical.
- **Server-side PDF generation (later)** — React-PDF or headless-Chrome service behind a route.

## 5. Migration strategy (gradual, no rewrite)

The store already isolates persistence behind one seam — exploit it.

1. **Preserve the existing store interface** (`StoreValue` in `src/lib/store.tsx`). Components keep calling the same mutators.
2. **Replace `storage.ts` with a swappable adapter later** — define a `StorageAdapter` interface; ship `LocalStorageAdapter` (today) and add `SupabaseAdapter` later. The store selects one; UI is unchanged.
3. **Add `workspaceId`/`userId` to core types early** — additive, optional fields now so seed/local data still loads; required once the backend lands. This is the one early code change worth doing soon.
4. **Keep a local "demo mode"** — `LocalStorageAdapter` stays for the public demo / offline trials.
5. **No direct Supabase calls scattered in components** — all DB access flows through the adapter + store; components never import the Supabase client.

## 6. Multi-tenant data model plan (future tables)

- **profiles** — extends auth user (display name, locale).
- **workspaces** — top-level tenant (`id`, `name`, `owner_id`).
- **workspace_members** — `workspace_id`, `user_id`, `role` (owner/admin/member).
- **companies** — seller profile per workspace (current `Company`); `workspace_id`.
- **customers** — current `Customer`; `workspace_id`.
- **services/products** — current `Product`; `workspace_id`.
- **invoices** — current `Invoice` minus embedded items; `workspace_id`, `company_id`, `customer_id`.
- **invoice_line_items** — current `InvoiceLineItem`; `invoice_id` FK (extract from the embedded array).
- **invoice_events** — append-only audit (created/sent/paid/viewed); foundation for ZATCA + delivery tracking.
- **settings** — current `Settings`; `workspace_id`; invoice counter moves to a DB sequence/transaction.

All tenant tables carry `workspace_id` and are protected by RLS keyed on `workspace_members`.

## 7. What NOT to build yet

- Stripe / real payment collection.
- Official ZATCA integration (only the foundation/placeholders).
- Full accounting ledger.
- Payroll.
- Inventory management.
- Enterprise permissions (beyond basic owner/admin/member).
- AI assistant.
- Deep analytics / BI.

## 8. Recommended immediate code cleanup (safe)

Verified against the current tree:

- **Dead scroll-motion files** (`ScrollMotionSection.tsx`, `WorkflowScroll*`) — **already removed**; nothing to do.
- **`workflow-trace` CSS/classes** — **already removed**; nothing to do.
- **Phased-out `blue`/`violet` tones** — **DO NOT remove yet.** Still actively used by the prototype app (`dashboard/page.tsx`, `settings/page.tsx`, `lib/status.ts` "Sent" status, `ui/StatCard.tsx`, `ui/Badge.tsx`, `marketing/HeroWorkflowPreview.tsx`). The homepage is already monochrome+lime; these tones are an app-only concern to revisit when the app UI is restyled.
- **Keep the homepage stable**; keep `/features` and `/pricing` working (run `npm run build` after any change).

Net: no destructive cleanup is currently safe beyond what's already done. The genuine early
prep is **additive**: introduce the `StorageAdapter` interface and add optional
`workspaceId`/`userId` fields to core types.
