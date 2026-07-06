# Invoice X — architecture

Invoice X (formerly "Placeholder"; repo folder still named Placeholder) is an e-invoicing MVP for Saudi/GCC SMEs (Next.js 14 App Router + React 18 +
TypeScript + Tailwind). This file is the current source of truth for how the backend fits
together — read it before touching auth, data, or the schema.

## Design system (X family)

Invoice X shares the X-family visual language with the sibling PayX / RideX projects (sibling
folders under `Claude Code/`): near-black canvas, glass panels on alpha hairlines, Space Grotesk
display + Inter body + JetBrains Mono for money, IBM Plex Sans Arabic for bilingual surfaces, and
one surgical accent — the lime→mint "signal" gradient (`--gradient-x`, `.text-gradient-x`). Every
standalone/trailing X in a product name renders in that gradient via `src/components/XName.tsx`.
Tokens live in `tailwind.config.ts` + `src/app/globals.css`; token NAMES (canvas/ink/bone/ash/
fog/signal/…) are stable — reskin by changing values, not markup. Fonts load via `next/font` in
`src/app/layout.tsx`.

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

11 tables, uuid PKs, RLS on everything. Defined across `supabase/migrations/*.sql` (apply in
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

## ZATCA Phase 2 preview (structural, not certified)

`src/lib/zatca/` builds a UBL 2.1 invoice XML, chains invoice hashes
(ICV/PIH), and signs the result with an ECDSA (secp256k1) key — but that key
is **generated locally per workspace, not a real ZATCA-issued CSID**. This is
a structural preview of the Phase 2 pipeline, not a live ZATCA connection;
`/compliance` and the Settings → "VAT & ZATCA" card both say so explicitly.
No compliance-check/reporting/clearance API calls are made — that requires
real onboarding credentials (OTP-based, through ZATCA's Fatoora portal) that
this project doesn't have.

- `zatca_keys` (migration `0012`) holds one self-signed keypair per
  workspace, generated lazily in Node the first time an invoice is signed
  (Postgres can't do secp256k1 keygen). `src/lib/actions/zatcaSigning.ts`'s
  `getOrCreateZatcaKeyRow()` is race-safe via `upsert(..., { ignoreDuplicates:
  true })` + re-select, not a lock.
- Two `security definer` functions split the atomic part from the
  can't-be-SQL part, the same way `create_invoice` splits numbering from line
  items: `zatca_reserve_sequence()` row-locks `zatca_keys` and atomically
  claims the next ICV + previous-invoice-hash (so concurrent signing calls in
  one workspace can never collide), then Node builds the XML/hash/signature
  with that reserved data, and `zatca_finalize_signature()` writes it back
  plus an immutable `'signed'` `invoice_events` row carrying the full XML
  (the XML lives only in the event payload, not duplicated on `invoices` —
  downloading it always reads back exactly what was hashed).
- Once `zatca_signed_at` is set, `updateInvoice`/`deleteInvoice`
  (`src/lib/actions/invoices.ts`) reject further changes to financial fields
  or deletion — a "signed" invoice that can still silently change afterward
  would be worse than not signing it.
- The signing flow is **Supabase-only** and intentionally bypasses the
  `DataAdapter` abstraction — `signInvoiceZatca()` is called directly from
  the invoice detail page (gated on `useStore().usingSupabase`), and its
  result is applied to local state via `patchInvoiceLocal()`, a
  local-state-only setter on `StoreValue` that skips the adapter entirely.
  The local demo has no real database to chain hashes against, so this
  doesn't degrade there — it's just hidden.
- Known gap, stated plainly rather than silently: the hash is computed over
  the generated XML directly, not ZATCA's official canonicalization
  algorithm (which strips the `UBLExtensions` signature block first) — not
  yet byte-conformant with a real ZATCA SDK.

### ZATCA CSID onboarding (step 1 of the real integration)

Settings → "ZATCA CSID onboarding" (`ZatcaCsrCard.tsx`) generates a real
Certificate Signing Request — the artifact a business submits through
ZATCA's Fatoora portal (with an OTP) to request an actual Compliance CSID.
This is a distinct keypair/table from the `zatca_keys` preview above; it's
meant to eventually hold a real ZATCA-issued credential, not a simulation.

- `src/lib/zatca/csr.ts` hand-rolls the minimal DER/ASN.1 needed to build a
  PKCS#10 CSR with a secp256k1 key in ZATCA's non-standard field layout (VAT
  number, invoice-type support, address, and business category live in a
  subjectAltName `directoryName`, not the Subject DN). No off-the-shelf
  Node library builds this shape (node-forge's CSR path is RSA-oriented;
  WebCrypto-based libraries don't support secp256k1), so this follows the
  same "implement the crypto primitive directly" approach as `signing.ts`.
  **The field layout was assembled from public ZATCA onboarding references,
  not verified byte-for-byte against ZATCA's official CSR template** —
  treat it as a best-effort structural preview like the UBL XML above. If
  ZATCA's actual validator rejects a field, that tells us exactly what to
  fix.
- `zatca_csr_requests` (migration `0013`) stores one CSR per workspace. The
  private key is AES-256-GCM-encrypted before it touches the database
  (`src/lib/zatca/csrEncryption.ts`) with a server-only
  `ZATCA_CSR_ENCRYPTION_KEY` — treated as a secret from day one since it's
  meant to eventually correspond to a real CSID, not a demo artifact.
- `status` only models the two states that have real logic behind them
  today (`not_started` implied by no row, `csr_generated`). The rest of the
  onboarding ladder (compliance CSID received → compliance checks passed →
  production CSID → live) intentionally isn't modeled yet — adding those
  enum values with nothing behind them would just be dead state. Add them
  when the corresponding action (submitting the CSR to ZATCA, exchanging
  for a Compliance CSID, running compliance-check submissions, etc.) is
  actually built.
- Still not built: submitting the CSR to ZATCA, exchanging it for a
  Compliance/Production CSID, and any live Compliance Check / Reporting /
  Clearance API calls. All of that requires a real ZATCA sandbox account
  and OTP obtained through the Fatoora portal — a manual, external step
  this project can't automate.

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
rate limit. Also set `ZATCA_CSR_ENCRYPTION_KEY` (`openssl rand -base64 32`) — required before the
Settings → "ZATCA CSID onboarding" card can generate a CSR.

## What's deliberately NOT built yet

- **Real ZATCA integration** — UBL XML generation, invoice hash chaining, and signing now exist as
  a structural preview (see "ZATCA Phase 2 preview" above), and CSR generation exists for real
  CSID onboarding (see "ZATCA CSID onboarding" above), but the invoice-signing key is still a
  locally generated development key, not a ZATCA-issued CSID, and there is still no
  compliance-check, reporting, or clearance API call to ZATCA's actual systems — that requires
  submitting the generated CSR through ZATCA's Fatoora portal first, a manual external step. The
  Settings → "VAT & ZATCA" card and `/compliance` are honest about this ("ZATCA-ready workflow
  foundation," not a compliance claim).
- **Payments / Stripe.**
- **Real email/WhatsApp delivery** — `placeholderSend()` in the invoice detail page still just
  shows a toast.
- **Team invites** — `workspace_members` supports it (role enum, RLS policies for admins to
  manage members), but there's no UI for it yet; Settings → "Team members" is a placeholder.
- **Fine-grained roles** beyond owner/admin/member.
