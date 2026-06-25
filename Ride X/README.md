# Ride X Website

Static marketing and lead-capture website for Ride X — private transport coordination in Jeddah, Saudi Arabia. Bilingual (English / Arabic with RTL), dark premium theme, no build step.

## Run locally

Open `index.html` directly in a browser, or run a small local server from this folder:

```bash
python3 -m http.server 4173
```

## Pages

| Path | Purpose |
|---|---|
| `/` | Homepage: hero, services, how it works, vehicle options, service area, FAQ |
| `/services/` | Service detail: airport, family, corporate, scheduled |
| `/quote/` | Quote request form (Supabase-backed with WhatsApp fallback) |
| `/contact/` | Contact channels + inquiry form |
| `/about/` | Company story, principles, company info placeholder |
| `/privacy/`, `/terms/` | Legal drafts — **review before launch** |
| `/404.html` | Not-found page (configure at the hosting layer) |

## Supabase lead capture

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Put the project URL and anon/public key in `supabase-config.js`.
3. Do not put the Supabase service role key in frontend files.

Until Supabase is configured, form submissions gracefully fall back to a
pre-filled WhatsApp message so no lead is lost.

## Before launch checklist

- [ ] Set real domain in `sitemap.xml`, `robots.txt`, and every page's canonical/OG tags (search for `REPLACE-ME`)
- [ ] Replace `contact@ridex.sa` placeholder email everywhere (search for `REPLACE-ME`)
- [ ] Confirm the phone (+966 54 743 3452) and WhatsApp (+966 56 934 2309) numbers
- [ ] Set exact operating hours on the contact page
- [ ] Have `/privacy/` and `/terms/` reviewed (Saudi PDPL) and remove their `noindex` tags
- [ ] Add CR/VAT/company details on the About page when available
- [ ] Configure Supabase credentials
- [ ] Native-speaker review of the Arabic copy
