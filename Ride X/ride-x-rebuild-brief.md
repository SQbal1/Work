# Fable 5 Ultracode Brief — Ride X, rebuilt from scratch (ultra-premium, bilingual)

## Context — why this exists (for you, not for Fable 5)
This is a **from-scratch rebuild of the Ride X website** — same brand, same business — engineered to a
**world-class, agency-flagship standard**. It's a *candidate*: build it in a fresh Fable 5 ultracode
chat, and if it beats the current site, we replace the current site with it. The single test it must
pass: a ~70-year-old traditional Saudi transportation businessman looks at it and feels *"this is the
kind of work large companies pay serious money for"* within 10 seconds. Everything below is what makes
that happen.

**How to use:** open a new Fable 5 chat (ultracode), paste **everything inside the `BRIEF` block**.
Swap the `[bracketed]` placeholders for your real details. Grade the result with the checklist at the
bottom.

---

## ┌─────────────────────  BRIEF — PASTE FROM HERE  ─────────────────────┐

Build a complete, **bilingual (English + Arabic, full RTL)**, multi-page website for **Ride X**, a
premium private-transport company in Jeddah, Saudi Arabia. This is a luxury-service brand — treat it
like an **agency flagship**, not a template. Ship it flawless: no broken layouts, no empty whitespace
gaps, no cliché stock, no "developer-made" feel.

### 0. North star
- **Cinematic, confident, expensive, trustworthy.** Restraint over decoration. Big editorial
  typography, generous negative space, deliberate pacing, buttery motion.
- The homepage must read as a **story that unfolds as you scroll** — a *case being built* — not a
  stack of sections. This is the single most important quality (see §6).
- It must look like it belongs to a large, established transport company, not a startup.

### 1. Brand, business & positioning
- **Ride X** — private ground transport in **Jeddah, Saudi Arabia**: airport transfers (King Abdulaziz
  International Airport / KAIA), family transportation, corporate/executive transport, and
  scheduled/pre-booked rides.
- **The differentiator (make it the spine of the story):** every trip is coordinated over **WhatsApp**
  and a **fixed quote is confirmed *before* the trip** — price, timing, and vehicle agreed up front.
  **Nothing is booked until the customer approves.** "Trust before price. No surprises on the day."
- **Fleet tiers:** premium **SUV** (the flagship — lead all hero imagery with it), executive **Sedan**
  (1–3 passengers, light luggage), **Van / Group** (larger groups, events, heavy luggage).
- **Lineage / legitimacy:** Ride X operates as a branch of its parent company **MNA International Co.**
  — an established, licensed Saudi transportation company run for decades, with a real Commercial
  Registration and VAT. Surface this tastefully ("A Ride X service, operated by MNA International Co.")
  — it's a credibility asset most competitors can't claim.
- **Voice:** assured, calm, precise, premium. Short confident sentences. Never salesy or loud.

### 2. Audience (two layers)
1. **The decision-maker to win:** a traditional Saudi transport businessman who judges credibility in
   the first 10–20 seconds by visible premium execution — cinematic imagery, confident type, real
   numbers, real people, smoothness, branding. He compares against large established companies. If it
   looks generic or unfinished, he dismisses it. He does not care about hidden engineering.
2. **End customers:** families, visitors/tourists, and businesses in Jeddah who want reliable,
   pre-arranged private transport and hate uncertainty about price and reliability.

### 3. Scope, pages & tech
- **Multi-page site.** Pages: **Home** (the centerpiece), **Services** (overview + detail per service),
  **Fleet**, **Why Jeddah** (a credibility page, see §7), **About** (the MNA story + company info),
  **Contact**, **Request a Quote**, plus **Privacy** and **Terms**. Every page bilingual.
- Modern, clean front-end (your choice), but **fast and lightweight** — motion smoothness beats
  dependency count. Prefer CSS/SVG + a light scroll library over heavy WebGL.
- Fully responsive; design **mobile-first *and* desktop with equal care** at ~390px, ~768px, ~1440px.
- Persistent minimal **EN ⇄ AR toggle** that swaps all copy and flips the whole layout to RTL.

### 4. Visual design system
**Palette (tokens):**
- Deep navy base (dark sections): `#0A1730`; secondary surface `#0E1B33` / `#101F3C`.
- Red accent (primary — the brand signal, used sparingly and precisely): `#D3232E`.
- Off-white on dark `#F5F7FA` / muted `#AEB7C6`.
- Light section base (inner pages / "detail" mode): cool near-white `#F6F7F9`; secondary `#EDEFF3`.
- Text on light `#0A1730` / muted `#586173`.
- **Navy + one red accent only.** No rainbow, no decorative gradients. Flat, deep, premium — the
  feel of a luxury automotive / executive-chauffeur brand.

**Type:**
- **Display (headings):** a confident, modern face with presence — e.g. a grotesk like *Söhne* /
  *Neue Haas Grotesk*, or an editorial sans such as *General Sans* / *Clash Display* (accessible
  substitute: *Space Grotesk* / *Archivo*). Large, tight leading.
- **Body/UI:** a clean humanist sans — *Inter*, *General Sans*, or *Suisse Int'l*.
- **Arabic:** a refined premium Arabic face — *IBM Plex Sans Arabic* or *Tajawal* — sized and spaced
  intentionally (Arabic usually needs slightly larger size / looser line-height). Arabic must look
  **first-class and beautiful**, never a default fallback.
- Scale (desktop): H1 clamp ~56–96px, H2 ~36–52px, eyebrow ~13px uppercase tracked with a red or
  hairline flourish, body ~17–19px, line-height ~1.7. One heading weight, one body weight.
- **Sentence case** everywhere. The one allowed flourish: a single red accent detail (e.g. a red
  period, or a short red rule under the eyebrow).

**Theme rhythm:** **dark, cinematic homepage** (brand/story mode) and **clean light inner pages**
(reference mode) with a persistent nav bar + breadcrumb on inner pages. Make dark↔light transitions
deliberate (e.g. a full-bleed photo bridging them).

### 5. Signature motif — "route identity" (proprietary, reused, self-drawing, bookended)
Build ONE recognizable visual signature and reuse it at every scale — this is what separates Ride X
from every competitor (most have no proprietary motif):
- **The route line:** a white/gold **pickup ring** → a thin **drawn route leg** → a **red destination
  pin**. The leg **draws itself on** (SVG stroke-dashoffset) as it enters the viewport.
- Reuse it: (a) a large route ribbon threading through the hero; (b) on each service card (from → to);
  (c) as the connective tissue of the "how it works" spine (§6.4); (d) as the Jeddah service-area map
  (§6.7); (e) a final **callback** in the footer, fully drawn closed.
- This one motif is the test of: proprietary identity + self-drawing SVG + a motif that bookends the
  page.

### 6. Homepage story arc — section by section (alternate BREATHE and INFORM)
A **BREATHE** beat = one big idea alone on a near-empty screen. An **INFORM** beat = structured
content (cards, a numbered spine, stats). The power is the alternation — this is what makes it a story.

**6.1 — HOOK (breathe).** Full-viewport hero. Cinematic night photo of the premium **SUV** on a Jeddah
street / Corniche, brand-graded (deep navy, red accent). Slow, subtle parallax. Overlaid: brand mark,
eyebrow "Private transport in Jeddah, Saudi Arabia" / «نقل خاص في جدة، المملكة العربية السعودية»,
H1, one line of sub-copy, two CTAs ("Request a quote" / «اطلب عرض سعر» and "Chat on WhatsApp" /
«تواصل عبر واتساب»), plus a small **live-feeling "trip confirmed" card** (pickup → destination, vehicle,
"Fixed quote confirmed"). A quiet scroll cue.
- **H1 (pick one):** "Every ride, agreed before you go." / «كل رحلة، متّفقٌ عليها قبل أن تنطلق.»
  · alt: "Private transport in Jeddah, handled to the last detail." · alt: "The ride, arranged with
  certainty."
- **Sub:** "Airport transfers, family, corporate, and scheduled rides across Jeddah — coordinated on
  WhatsApp, with the price confirmed before every trip." / «توصيل المطار، العائلة، الشركات، والرحلات
  المجدولة في جدة — بالتنسيق عبر واتساب، والسعر مؤكَّد قبل كل رحلة.»

**6.2 — TENSION (breathe).** Near-black screen, one large line that rises in:
"In Jeddah, most rides are a gamble — on the price, the timing, and the car that actually shows up."
/ «في جدة، أغلب المشاوير مغامرة — في السعر، والوقت، والسيارة التي تصل فعلاً.» Sets the stakes so
everything after reads as relief.

**6.3 — PROMISE (breathe → inform).** The fixed-quote model as the hero moment. Big line:
"Every price is agreed before you ride. Nothing is booked until you say yes." / «يُتّفق على السعر قبل
الرحلة. ولا يُحجز شيء حتى توافق.» The hero's trip card expands here into a full-width centerpiece
(pickup ring → route → destination pin), then a short 3-point reassurance row.

**6.4 — PROOF (inform) — the vertical numbered spine.** How it works, as steps **01–04 stacked
vertically** down the **route-identity line**; each numeral is a node on the drawn line, and as you
scroll the line draws downward and each numeral **activates** (fills red) when reached. Numerals must
sit *above* the line (never pierced by it), and copy sits beside each. Steps:
1. Send your request — «أرسل طلبك» (pickup, destination, date, passengers, via form or WhatsApp)
2. We review and reply — «نراجع ونرد» (a clear fixed quote + any questions)
3. Confirm over WhatsApp — «التأكيد عبر واتساب» (approve price + timing; nothing booked until you agree)
4. Ride with confidence — «انطلق باطمئنان» (vehicle + driver details shared before pickup)

**6.5 — FIT (inform).** Services + fleet. First a 4-card **services** row (Airport transfers / Family /
Corporate / Scheduled), each with a **self-drawing route icon** (from → to). Then the **fleet** as an
interactive selector — SUV (default/flagship), Sedan, Van — each with a real photo, passenger + luggage
specs, and one line. SUV leads.

**6.6 — TRUST (breathe + inform).** Social proof where skepticism peaks. **Count-up stats** animating
from 0 on scroll (e.g. `[N]+` rides completed, `[N]+` years operating via MNA, `<[N] min` typical
WhatsApp response). A **testimonial carousel** — 5-star cards with short quotes + name/origin
(2–3 real ones; placeholders for now). A quiet line establishing the **MNA International** lineage.

**6.7 — GROUND (inform) — the Jeddah map.** A styled service-area map of Jeddah using the route motif —
KAIA airport, the Corniche, hotels, business districts, homes — with planned trips continuing beyond
the city. Reads as "we know this city." Title "Serving Jeddah, and beyond." / «نخدم جدة وما حولها.»

**6.8 — CLOSE (breathe → action).** One confident line. The **route motif returns, fully drawn**, as a
callback. Primary CTAs (Request a quote / WhatsApp) + a slim footer.
- "Tell us the trip. We'll send the price." / «أخبرنا بالرحلة، ونرسل لك السعر.»

### 7. Other pages (section specs)
- **Services** — hero + a section per service (Airport transfers, Family, Corporate, Scheduled): what
  it is, who it's for, example use-cases, "what to send when requesting," and a CTA. Reuse the route
  motif per service.
- **Fleet** — each vehicle tier in depth (SUV / Sedan / Van): photos, capacity, luggage, best-for,
  with the SUV as the flagship.
- **Why Jeddah** — a **credibility page** (Ride X's version of Areeco's "Why Saudi Arabia"): build the
  case for arranging premium transport in Jeddah now, citing real, checkable signals — **Vision 2030**,
  **Hajj & Umrah + booming tourism**, **KAIA passenger growth**, major Jeddah events (e.g. Formula 1,
  Red Sea events). It builds trust upstream of the sales pitch. Use real figures with sources.
- **About** — the MNA story (decades of licensed transport operation), operating philosophy /
  principles, and a **company information** block: `[OFFICIAL COMPANY NAME]`, `[CR NUMBER]`,
  `[VAT NUMBER]`, service area, and a downloadable **company profile PDF**.
- **Contact** — a proper form + **WhatsApp deep-link** + `[PHONE]` + **branded** `[EMAIL]` (never a
  personal Gmail) + `[ADDRESS]` + a small **service-area map** + `[OPERATING HOURS]`.
- **Request a Quote** — an **intent-based** form: choose the service (pills), then trip details (pickup,
  destination, date/time, passengers, luggage, vehicle), submitting to WhatsApp or email.
- **Privacy / Terms** — clean, complete legal pages, bilingual.
- Global: a **sticky "Have a question? WhatsApp us" bar** riding through the info-heavy sections; a
  refined bilingual nav with breadcrumbs on inner pages; a rich footer (services, company, contact,
  socials, legal).

### 8. Motion & interaction (tasteful, 60fps, all with reduced-motion fallbacks)
- Hero: slow parallax on the photo; headline resolves in gracefully.
- Section reveals: content rises + fades on enter (~600–800ms, gentle ease-out), staggered by reading
  order; breathe-beat lines get a slower, more dramatic reveal.
- Route motif: legs draw on via stroke-dashoffset as they enter view.
- The 01–04 spine: scroll-scrubbed line draw + per-numeral activation.
- Count-up stats: animate 0 → value once, on first reveal.
- Fleet selector: smooth cross-fade between vehicles; images parallax subtly.
- Testimonials: smooth carousel (auto-advance + manual, pausable).
- CTAs: subtle magnetic/hover lift on pointer devices.
- Optional smooth-scroll — only if it stays buttery.
- **`prefers-reduced-motion`:** disable all of the above; everything appears finished and fully
  readable. Nothing depends on motion to work.

### 9. Bilingual EN / AR + RTL (first-class, not an afterthought)
- Visible **EN ⇄ AR toggle**; Arabic sets `dir="rtl"` and **mirrors the entire layout** (nav, columns,
  the spine, directional icons, the route motif, the map).
- Use **CSS logical properties** so mirroring is clean.
- Arabic copy natural and warm in a **Saudi register** (not stiff MSA, not machine-translated),
  correctly shaped, with proper Arabic typographic sizing. Every string exists in both languages.

### 10. Trust, legitimacy & conversion
- Surface legitimacy: the MNA lineage, `[CR NUMBER]`, `[VAT NUMBER]`, official company name, branded
  email, physical address, operating hours, downloadable company profile PDF.
- Social proof: count-up stats + real testimonials with stars (+ optional partner/client logos).
- Conversion: WhatsApp-first fixed-quote flow; the intent-based quote form; the sticky WhatsApp bar; a
  clear CTA hierarchy (Request a quote = primary; WhatsApp = secondary) repeated at natural moments.

### 11. Imagery art direction
- Subjects: the premium **SUV** (hero vehicle) plus Sedan and Van, real Jeddah settings (the Corniche,
  King Fahd Fountain, the skyline/waterfront, KAIA), and authentic drivers/passengers — including a
  thobe-wearing Saudi businessman for cultural authenticity. Night and golden-hour, deep navy grade
  with red accents, consistent across all images (one-shoot look).
- **No cliché stock, no generic business photos.** Graded placeholders now; real photography later.
- Meaningful `alt` text in both languages on every image.

### 12. Performance, SEO, accessibility
- Responsive images (AVIF/WebP), correct sizes, lazy-load below the fold, preload the hero. Lighthouse
  ~90+; no layout shift.
- SEO: proper titles/meta, Open Graph + Twitter cards, `lang`/`dir`, hreflang EN/AR, and
  `LocalBusiness` / transportation-service JSON-LD with the real details. Real canonical URLs.
- **WCAG AA:** semantic landmarks, logical heading order, visible keyboard focus, sufficient contrast
  (check red on navy and on light), accessible carousel + form controls, reduced-motion respected.

### 13. Fill-in placeholders (owner replaces)
`[OFFICIAL COMPANY NAME]`, `[CR NUMBER]`, `[VAT NUMBER]`, `[BRANDED EMAIL]`, `[PHONE / WHATSAPP]`,
`[ADDRESS]`, `[OPERATING HOURS]`, real ride/trip counts and years operating, 2–3 real testimonials,
real Why-Jeddah figures + sources.

### 14. Deliver
A complete, self-contained, production-quality bilingual multi-page Ride X site implementing all of the
above — the homepage as a directed story, inner pages clean and credible, all in EN and AR, responsive,
animated, and accessible. Craft and cohesion over feature count.

## └─────────────────────  BRIEF — PASTE TO HERE  ─────────────────────┘

---

## Evaluation checklist — how to judge Fable 5's Ride X (for you)
1. **Story, not stack** — does the homepage feel like an unfolding case (breathe/inform), or a column?
2. **First-10-seconds "wow"** — does it read as world-class / large-company immediately?
3. **Route-identity motif** — reused at multiple scales and bookended, or forgotten?
4. **Self-drawing SVG** — route legs + icons draw cleanly (no broken dashes, no line through numerals)?
5. **The 01–04 spine** — draws + activates on scroll, stays aligned?
6. **Count-up stats** — smooth, once, on reveal?
7. **True RTL + Arabic quality** — whole layout mirrored, Arabic beautiful and natural?
8. **Theme rhythm** — deliberate dark-home / light-inner transitions?
9. **Motion taste + reduced-motion** — tasteful, smooth, fully degrades?
10. **Legitimacy** — MNA lineage, CR/VAT, branded email, address, testimonials all present and premium?
11. **Flawless finish** — no broken layouts, whitespace gaps, cliché stock, or contrast failures?
12. **Responsive craft** — mobile designed with equal care?

If Fable 5's version beats the current site on these, switch to it.
