-- 0016: per-workspace invoice template options (premium template + letterhead mode).
--
-- invoice_header_mode:
--   'standard'   — the app renders its own header (logo slot, company block, title band)
--   'letterhead' — blank space is reserved at the top/bottom of the page instead, so
--                  the invoice can be printed onto the tenant's pre-printed stationery
-- invoice_footer_text: free-form footer (bank details, CR number, a thank-you line…)

alter table public.settings
  add column if not exists invoice_header_mode text not null default 'standard',
  add column if not exists invoice_letterhead_top_mm int not null default 45,
  add column if not exists invoice_letterhead_bottom_mm int not null default 25,
  add column if not exists invoice_footer_text text not null default '';

alter table public.settings
  add constraint settings_invoice_header_mode_check
  check (invoice_header_mode in ('standard', 'letterhead'));

-- Keep the reserved bands within one A4 page (297mm) so a bad value can't
-- produce an all-blank document.
alter table public.settings
  add constraint settings_letterhead_top_mm_check
  check (invoice_letterhead_top_mm between 0 and 120),
  add constraint settings_letterhead_bottom_mm_check
  check (invoice_letterhead_bottom_mm between 0 and 120);
