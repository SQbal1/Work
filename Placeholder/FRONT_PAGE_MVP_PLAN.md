# Front Page MVP Plan

## Purpose

This file is a focused implementation brief for Claude Code / Codex.

The broader product context already exists in `Codex.md`. This file narrows the next task to the public marketing pages only.

Current priority:

> Build first, debug second, design last.

Do not get stuck polishing every section before the MVP can be shown to Ali and early testers.

---

## Current Website State

The first two homepage sections are already strong and should be preserved unless explicitly requested.

### Section 1: Hero

The hero currently establishes the product as a dark fintech/SaaS e-invoicing MVP for Saudi/GCC businesses.

It includes:

- dark technical interface aesthetic
- invoice workspace mockup
- client request panel
- VAT/payment validation panel
- workflow/invoice log
- green accent color
- clear headline around invoices, VAT, and payment state

Do not replace the hero with a generic SaaS layout.

### Section 2: Scroll Workflow Demo

The second section shows a request becoming a tracked receivable.

It includes:

- workflow trace positioning
- step list
- client request state
- customer record / invoice / validation / payment progression
- scroll-driven product storytelling direction

This section is the main premium motion section for now.

Do not add many more cinematic sections yet. The page should remain MVP-focused.

---

## Current Strategic Decision

Wipe or ignore the sections after the first two if they feel generic, bloated, or visually inconsistent.

The remaining homepage should be simple, clear, and useful.

The goal is not to create a huge animated SaaS landing page right now.

The goal is to create a credible homepage that explains:

1. what problem the product solves
2. what the workflow is
3. who it is for
4. what features exist in the MVP
5. how early customers can start

---

## Pages To Build For This MVP Phase

Only three public HTML/routes/pages are needed for now:

1. Homepage
2. Features page
3. Pricing page

Do not build these yet unless requested later:

- demo page
- dashboard
- authentication
- billing portal
- Stripe checkout
- full app backend

Those come after the public pages are stable.

---

# Homepage Plan

## Keep

Keep these sections:

1. Hero
2. Scroll workflow demo

Improve only if necessary for responsiveness, bugs, or consistency.

---

## Add Section 3: Problem Section

Purpose:

Show the operational pain clearly.

The problem is not “businesses need accounting software.”

The problem is:

> Small businesses lose invoice visibility because customer data, VAT checks, and payment status are scattered across spreadsheets, WhatsApp, emails, and memory.

Suggested structure:

- dark background continuation
- three compact problem cards
- minimal animation only
- no huge cinematic sequence here

Cards:

### 1. Customer data scattered

Small teams repeatedly re-enter the same client details across invoices, chats, and spreadsheets.

### 2. VAT checks are manual

Totals, VAT fields, and invoice readiness are often checked by eye before sending.

### 3. Payments lose visibility

Once an invoice is sent, teams still track payment state manually through messages or spreadsheets.

Design direction:

- dark neutral cards
- subtle green accents
- small interface fragments
- calm, serious fintech style

---

## Add Section 4: Core Workflow Section

Purpose:

Explain the product in plain operational terms.

This should not compete visually with the scroll workflow section.

Suggested headline:

> A focused path from customer record to paid invoice.

Workflow:

1. Save customer record
2. Generate invoice
3. Calculate VAT-aware totals
4. Track payment state

Suggested layout:

- horizontal or vertical workflow depending on screen size
- each step has one sentence
- include tiny UI details such as status badges, invoice IDs, or completion checks

Avoid:

- generic feature blocks
- repeated hero mockups
- excessive glowing cards

---

## Add Section 5: Built For Section

Purpose:

Show the early target market without over-expanding the product.

Suggested headline:

> Built first for service businesses that need invoice clarity.

Target users:

- Consulting firms
- Logistics SMEs
- Small agencies
- Professional service providers
- Freelancers / owner-operated teams

Important:

Do not imply the product deeply supports every industry yet.

Use wording like:

> Starting with service workflows, designed to expand into adjacent SME operations later.

---

## Add Section 6: MVP Feature Grid

Purpose:

List what the product actually aims to include in the MVP.

Feature cards:

- Customer database
- Reusable customer records
- Invoice generation
- VAT-aware totals
- Payment status tracking
- Workflow visibility
- Invoice preview
- PDF export placeholder, only if not implemented yet

Rules:

- Do not claim official ZATCA compliance.
- Use “ZATCA-ready foundation” or “VAT readiness checks,” not “ZATCA compliant.”
- Do not mention Stripe or online payments as live features.
- Do not add AI features.

---

## Add Section 7: Pilot / Pricing Preview

Purpose:

Give the homepage a commercial CTA without requiring Stripe or automated billing.

Suggested headline:

> Start with a guided pilot.

Suggested card:

### Pilot access

For early businesses testing a cleaner invoice workflow.

Includes:

- manual onboarding
- direct feedback loop
- customer records
- invoice workflow
- VAT-aware totals
- payment tracking

CTA:

> Request pilot access

Secondary CTA:

> View pricing

Important:

Do not build Stripe yet.

For the MVP, payments can be handled manually through bank transfer, invoice, or direct arrangement.

---

## Add Section 8: Final CTA

Purpose:

End with a simple conversion section.

Suggested headline:

> Turn client requests into tracked receivables.

Suggested subcopy:

> Placeholder helps small teams move from customer record to invoice to payment state without spreadsheet confusion.

Buttons:

- Request pilot access
- View features

---

# Features Page Plan

## Purpose

The features page should explain the product more concretely than the homepage.

It should not become a giant ERP feature catalog.

---

## Suggested Structure

### 1. Features Hero

Headline:

> Everything needed to move from customer to invoice to payment state.

Subcopy:

> A focused invoicing workspace for small businesses that need clarity, reusable records, VAT-aware totals, and visible receivables.

---

### 2. Feature Group: Customer Records

Explain:

- save customer profiles
- reuse customer information
- reduce repeated manual entry
- keep VAT number placeholder / business details organized

---

### 3. Feature Group: Invoice Creation

Explain:

- create invoices from existing customers
- add service lines
- calculate subtotal, VAT, and total
- preview before sending

---

### 4. Feature Group: VAT-Aware Workflow

Explain carefully:

- VAT-aware totals
- invoice completeness checks
- readiness indicators
- compliance placeholders

Required disclaimer-style wording:

> Official ZATCA integration is not part of the MVP. The current goal is to create a cleaner VAT-aware workflow foundation, not claim certified compliance.

---

### 5. Feature Group: Payment Tracking

Explain:

- Draft / Sent / Open / Paid states
- track what still needs follow-up
- see receivables in one place

---

### 6. Feature Group: Workflow Visibility

Explain:

- see where each invoice stands
- reduce scattered tracking
- keep customer, invoice, VAT, and payment state connected

---

### 7. Features CTA

CTA:

> Request pilot access

Secondary:

> View pricing

---

# Pricing Page Plan

## Purpose

The pricing page should support early conversations, not automated self-serve SaaS billing yet.

Do not add Stripe in this phase.

---

## Suggested Structure

### 1. Pricing Hero

Headline:

> Simple pilot pricing for early teams.

Subcopy:

> Start with a guided invoicing workflow before committing to a larger system.

---

## Pricing Cards

Use simple placeholder pricing until Salem and Ali decide final numbers.

### Pilot

For first businesses testing the workflow.

Includes:

- manual onboarding
- customer records
- invoice creation
- VAT-aware totals
- payment status tracking
- direct feedback loop

CTA:

> Request pilot access

### Growth / Coming Later

For businesses that need more users, templates, exports, and deeper workflow control.

Label this clearly as:

> Coming after pilot validation

Potential future features:

- team members
- advanced invoice templates
- PDF export
- email/WhatsApp sending
- reporting
- integrations

### Custom / Consulting Setup

For businesses that need setup help or workflow adaptation.

This may fit Ali/Areeco's business network later.

Includes:

- setup guidance
- workflow mapping
- custom onboarding
- priority feedback

CTA:

> Talk to us

---

## Pricing Rules

Do not implement:

- Stripe
- subscription checkout
- automated billing portal
- trials
- coupon codes
- account limits enforced by backend

For now, pricing is a marketing/conversation page.

Manual payment is acceptable for early validation.

---

# Motion Design Rules

The first two sections can stay motion-heavy.

After that, use restraint.

Allowed:

- subtle reveal animations
- small status transitions
- simple card hover states
- lightweight Framer Motion
- minor GSAP only if already used cleanly

Avoid:

- turning every section into a cinematic animation
- adding motion before layout/content is stable
- performance-heavy scroll effects
- fake complexity
- generic glowing SaaS cards

Motion should explain the product, not decorate the page.

---

# Implementation Instructions For Claude Code / Codex

When implementing:

1. Inspect existing files and route structure first.
2. Preserve the current hero and workflow sections unless a bug requires changes.
3. Remove or replace generic sections after the second section.
4. Build clean homepage sections 3-8 based on this file.
5. Create or update routes for `/features` and `/pricing`.
6. Keep data static for now.
7. Do not add Stripe, auth, database, or backend logic.
8. Do not claim official ZATCA compliance.
9. Keep styling consistent with the dark fintech/technical UI aesthetic.
10. Run build after changes.
11. Summarize modified files and any remaining issues.

---

# Current Success Criteria

This phase is successful if:

- homepage has a coherent story after the first two sections
- features page explains the MVP clearly
- pricing page supports pilot conversations
- site does not feel like a generic SaaS template
- no overbuilt SaaS infrastructure is added yet
- public pages can be shown to Ali for feedback
- development can continue toward demo/dashboard afterward

