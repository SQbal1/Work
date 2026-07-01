# Placeholder — architecture

Placeholder is an e-invoicing MVP for Saudi/GCC SMEs (Next.js 14 App Router + React 18 +
TypeScript + Tailwind). This file is the current source of truth for how the backend fits
together — read it before touching auth, data, or the schema.

## The big picture

Two data backends coexist, picked automatically per visitor:

- **Anonymous visitors** ("Skip — explore the demo") get the original **localStorage** demo —
  no signup, nothing sent anywhere, seeded with realistic sample data on first run.
- **Signed-in users** get a real **Supabase** workspace (Postgres + Auth), RLS-scoped so each
  tenant only ever sees their own data.

Components never know which one is active — `src/lib/store.tsx`'s `DataProvider` checks for a
Supabase session on mount and picks a `DataAdapter` accordingly. Every mutator on `useStore()`
(`addCustomer`, `updateInvoice`, etc.) has the same signature either way; only the body differs.

```
useStore() in components
        │
        ▼
  src/lib/store.tsx (DataProvider)          ← holds the loaded Database in React state
        │  picks one adapter based on session
        ▼
  src/lib/data/adapter.ts (DataAdapter interface)
   ├── localAdapter.ts    → src/lib/storage.ts → localStorage
   └── supabaseAdapter.ts → src/lib/actions/*.ts → Supabase (Server Actions)
```

## Supabase schema

10 tables, uuid PKs, RLS on everything. Defined across `supabase/migrations/*.sql` (apply in
filename order to reproduce on a fresh project — that's the actual source of truth; regenerate
`src/types/supabase.ts` after any change via Supabase's `generate_typescript_types`).

- `profiles` — 1:1 with `auth.users`, created by the `handle_new_user` trigger on signup.
- `workspaces` / `workspace_members` (`role`: owner/admin/member) — the tenant boundary.
- `companies` / `settings` — one row per workspace (`workspace_id` is the PK, not a separate id).
- `customers`, `products` — standard per-workspace tables.
- `invoices` / `invoice_line_items` / `invoice_events` — `invoice_events` is an append-only audit
  log, the intended foundation for a future real ZATCA integration (not built yet — see below).

**RLS pattern**: every tenant table has a `tenant select` / `tenant write` policy pair built on
two `security definer` helpers, `is_workspace_member(ws_id)` / `is_workspace_admin(ws_id)`.
`invoice_line_items` has no `workspace_id` column, so its policy joins through the parent invoice.

**Two atomic `security definer` functions bypass RLS deliberately, for good reason:**

- `bootstrap_workspace(name)` — creates the workspace + owner membership + empty company/settings
  rows in one transaction. This *has* to run as security definer: the very first
  `workspace_members` row can't satisfy "admins manage members" (which requires an existing
  admin row — chicken-and-egg), and reading back a freshly-inserted `workspaces` row via
  `.select()` after `.insert()` requires SELECT access that also depends on membership existing
  yet. Don't "simplify" this back to plain `.from().insert()` calls — it was tried and breaks.
- `create_invoice(...)` — row-locks `settings`, computes the next invoice number, inserts the
  invoice + line items + a `created` event, all atomically. This is what fixes the old
  localStorage MVP's cross-tab numbering race. `peek_invoice_number(...)` is the non-mutating
  read used for the live preview before submission.

Both are `revoke`d from `public`/`anon` and granted only to `authenticated` as defense-in-depth
(the advisors will flag them as "security definer, callable by X" — that's expected; the
functions self-check membership/auth internally, this isn't a gap).

## Auth flow

- `src/lib/supabase/client.ts` / `server.ts` — browser and server Supabase client factories
  (`@supabase/ssr`). **Both require `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` to be set — the
  client throws synchronously if they're missing, and `DataProvider` calls it unconditionally on
  every page load for every visitor, not just signed-in ones.** No env vars = the whole app is
  down, demo mode included. Always set them, even for pure local dev.
- `src/middleware.ts` — refreshes the session cookie on every request, then two light redirects
  for **authenticated** users only: `/login`/`/signup` while signed in → `/dashboard`; signed in
  but no workspace yet, hitting an `(app)` route → `/onboarding`. Deliberately does **not** gate
  anonymous visitors out of `(app)/*` — that would break "Skip — explore the demo," which is a
  real product decision, not an oversight.
- `src/app/onboarding/page.tsx` — step 5's "finish" calls `createWorkspace()` (only if
  `!hasWorkspace`) before the rest of the wizard's mutators. Gated on `useStore().ready` — the
  finish buttons are disabled until the store has resolved whether a workspace already exists,
  to avoid a race where a fast submit skips workspace creation entirely.

## Server Actions (`src/lib/actions/`)

One file per resource (`workspace.ts`, `company.ts`, `customers.ts`, `products.ts`,
`invoices.ts`) plus `mappers.ts` (snake_case DB rows ↔ the app's camelCase types). Every action
funnels through `requireWorkspaceId()` in `workspace.ts`, which re-derives the workspace from the
current session server-side — **never trust a client-supplied `workspace_id`.**

Mutators in `store.tsx` do a **confirmed-write, not true optimistic UI**: call the adapter, wait
for it to resolve, then update local React state. Simpler and safer than optimistic-then-rollback;
errors are caught in `store.tsx` and toasted centrally, so most component call sites don't need
their own try/catch. The exceptions are `addInvoice`/`updateInvoice`/`duplicateInvoice`, which
rethrow because their callers (`InvoiceBuilder`, the invoices list) need to know success/failure
before navigating.

## Local dev setup

```bash
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY
npm install
npm run dev
```

Apply `supabase/migrations/*.sql` to your own project (Supabase SQL editor, CLI, or MCP) in
filename order to get the schema. Supabase's default email sender is dev-only and
rate-limited — during testing you'll likely want to confirm test users' emails directly via SQL
(`update auth.users set email_confirmed_at = now() where email = '...'`) rather than fighting the
rate limit.

## What's deliberately NOT built yet

- **Real ZATCA integration** — no XML generation, QR codes, digital signing, or submission to
  ZATCA's systems. `invoice_events` exists as the audit-log foundation for this later. The
  Settings → "VAT & ZATCA" card is honest about this ("ZATCA-ready workflow foundation," not a
  compliance claim).
- **Payments / Stripe.**
- **Real email/WhatsApp delivery** — `placeholderSend()` in the invoice detail page still just
  shows a toast.
- **Team invites** — `workspace_members` supports it (role enum, RLS policies for admins to
  manage members), but there's no UI for it yet; Settings → "Team members" is a placeholder.
- **Fine-grained roles** beyond owner/admin/member.
