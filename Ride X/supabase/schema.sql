-- Ride X lead capture schema for Supabase
-- Run this in the Supabase SQL editor before enabling the frontend integration.

create extension if not exists pgcrypto;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  full_name text not null,
  phone text not null,
  whatsapp text,
  service_type text not null,
  pickup_location text,
  destination text,
  travel_date date,
  travel_time text,
  passenger_count integer,
  notes text,
  language text,
  status text default 'new'
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  full_name text not null,
  phone text,
  email text,
  inquiry_type text not null,
  message text not null,
  language text,
  status text default 'new'
);

alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Public can insert quote requests" on public.quote_requests;
create policy "Public can insert quote requests"
  on public.quote_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can insert contact messages" on public.contact_messages;
create policy "Public can insert contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- No select, update, or delete policies are created here.
-- With RLS enabled, public users can insert only and cannot read, update, or delete rows.
