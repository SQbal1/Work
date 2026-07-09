-- 0018: logo sizing + embedded letterhead header/footer banners.
--
-- invoice_logo_scale: logo size as a percentage of the default (clamped 50–200).
-- The header/footer images are full-width banners stored as data URLs, printed
-- edge-to-edge on the invoice when invoice_letterhead_image_enabled is on — so a
-- tenant's invoice "generates directly onto their letterhead".

alter table public.settings
  add column if not exists invoice_logo_scale int not null default 100,
  add column if not exists invoice_letterhead_image_enabled boolean not null default false,
  add column if not exists invoice_header_image_data_url text not null default '',
  add column if not exists invoice_footer_image_data_url text not null default '';

alter table public.settings
  add constraint settings_invoice_logo_scale_check
  check (invoice_logo_scale between 50 and 200);
