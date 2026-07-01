create table public.companies (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  name text not null default '',
  legal_name text not null default '',
  email text not null default '',
  phone text not null default '',
  vat_number text not null default '',
  cr_number text not null default '',
  address text not null default '',
  city text not null default '',
  business_type text not null default 'consulting',
  updated_at timestamptz not null default now()
);
-- one row per workspace (workspace_id as PK) mirrors "single company per workspace" in Company type

create table public.settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  invoice_prefix text not null default 'INV-',
  next_invoice_number bigint not null default 1001,
  default_vat_rate numeric(5,4) not null default 0.15,
  default_due_days int not null default 30,
  default_notes text not null default '',
  currency text not null default 'SAR',
  onboarded boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null default '',
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  vat_number text not null default '',
  address text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index on public.customers (workspace_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null default '',
  description text not null default '',
  unit_price numeric(12,2) not null default 0,
  vat_category text not null default 'standard' check (vat_category in ('standard','zero','exempt')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.products (workspace_id);
