-- ZATCA CSID onboarding, step 1: CSR generation.
--
-- Stores one Certificate Signing Request (+ its encrypted private key) per
-- workspace — the artifact a business submits through ZATCA's Fatoora portal
-- (with an OTP) to request a Compliance CSID. This is a distinct keypair from
-- zatca_keys (migration 0012), which is the internal self-signed development
-- key used for the invoice-signing structural preview; this one is meant to
-- eventually correspond to a real ZATCA-issued CSID. See src/lib/zatca/csr.ts
-- for what is and isn't verified about the CSR's field layout, and CLAUDE.md.
--
-- `status` only has the two states real logic exists for today. Later steps
-- (compliance_csid_received, compliance_passed, production_csid_received,
-- live) get added once the corresponding onboarding actions are built —
-- adding the enum values now with nothing behind them would just be dead
-- state.

create table public.zatca_csr_requests (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  vat_number text not null,
  organization_name text not null,
  branch_name text not null,
  city text not null,
  invoice_type text not null check (invoice_type in ('standard', 'simplified', 'both')),
  csr_pem text not null,
  encrypted_private_key text not null,
  status text not null default 'csr_generated' check (status in ('not_started', 'csr_generated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.zatca_csr_requests enable row level security;

create policy "tenant select" on public.zatca_csr_requests for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.zatca_csr_requests for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
