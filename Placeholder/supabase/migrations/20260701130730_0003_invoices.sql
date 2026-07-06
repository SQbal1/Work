create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  number text not null,
  issue_date date not null,
  due_date date not null,
  status text not null default 'draft' check (status in ('draft','sent','paid')),
  discount_percent numeric(5,2) not null default 0,
  notes text not null default '',
  paid_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, number)
);
create index on public.invoices (workspace_id);
create index on public.invoices (workspace_id, status);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  vat_rate numeric(5,4) not null default 0.15,
  sort_order int not null default 0
);
create index on public.invoice_line_items (invoice_id);

-- ZATCA/audit foundation only — no XML/signing logic in this phase.
create table public.invoice_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.invoice_events (invoice_id);
