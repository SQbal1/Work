-- 0017: per-workspace invoice branding + content blocks.
--
-- Logo and stamp are stored as (downscaled) data URLs in text columns — small
-- enough for Postgres text, self-contained so the PDF renderer needs no storage
-- bucket or signed URL. Terms/bank details are free-form blocks printed on every
-- generated invoice.

alter table public.settings
  add column if not exists invoice_logo_data_url text not null default '',
  add column if not exists invoice_stamp_data_url text not null default '',
  add column if not exists invoice_stamp_enabled boolean not null default false,
  add column if not exists invoice_terms_text text not null default '',
  add column if not exists invoice_bank_details text not null default '';
