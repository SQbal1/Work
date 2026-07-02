-- ZATCA Phase-2 structural preview: UBL XML + invoice hash chaining + signing.
--
-- IMPORTANT: `zatca_keys` holds a locally-generated ECDSA (secp256k1) keypair
-- per workspace, created lazily in Node (Postgres cannot generate secp256k1
-- keys). This is a self-signed DEVELOPMENT key, NOT a ZATCA-issued CSID — it
-- lets the app produce a structurally correct, internally-consistent hash
-- chain and signature for preview purposes, not a legally cleared/reported
-- invoice. See CLAUDE.md.

create table public.zatca_keys (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  private_key_pem text not null,
  public_key_pem text not null,
  last_icv bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.zatca_keys enable row level security;

create policy "tenant select" on public.zatca_keys for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.zatca_keys for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

-- Chain/signature fields on invoices. All nullable — null means unsigned.
-- zatca_signature/zatca_public_key are small enough to duplicate here (rather
-- than only in invoice_events) so the QR can render them on every page view
-- without an extra fetch; the full UBL XML stays invoice_events-only, per the
-- comment on zatca_finalize_signature() below.
alter table public.invoices
  add column zatca_icv bigint,
  add column zatca_previous_hash text,
  add column zatca_invoice_hash text,
  add column zatca_signature text,
  add column zatca_public_key text,
  add column zatca_signed_at timestamptz;

-- Reserve the next ICV (invoice counter value) + previous-invoice-hash (PIH)
-- for an invoice, atomically. Row-locks zatca_keys so two concurrent signing
-- calls in the same workspace can never claim the same slot — mirrors
-- create_invoice()'s settings-row-lock pattern for invoice numbering.
--
-- The actual XML/hash/signature is computed in Node (Postgres can't do
-- secp256k1 signing), so this function only reserves the sequence position;
-- zatca_finalize_signature() below writes the computed artifacts back.
create or replace function public.zatca_reserve_sequence(
  p_invoice_id uuid,
  p_workspace_id uuid
)
returns table(icv bigint, previous_hash text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last_icv bigint;
  v_next_icv bigint;
  v_previous_hash text;
  v_already_signed timestamptz;
  v_first_seed constant text := 'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==';
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'not a member of this workspace';
  end if;

  select i.zatca_signed_at into v_already_signed
    from public.invoices i
    where i.id = p_invoice_id and i.workspace_id = p_workspace_id;

  if not found then
    raise exception 'invoice not found in this workspace';
  end if;

  if v_already_signed is not null then
    raise exception 'invoice already signed';
  end if;

  select last_icv into v_last_icv
    from public.zatca_keys
    where workspace_id = p_workspace_id
    for update;

  if not found then
    raise exception 'zatca key not found' using errcode = 'P0001';
  end if;

  -- Chain to the last *finalized* invoice, not merely reserved — a reservation
  -- that never finalized (e.g. the app crashed mid-signing) must not become a
  -- dead end that resets the chain back to the first-invoice seed.
  select zatca_invoice_hash into v_previous_hash
    from public.invoices
    where workspace_id = p_workspace_id and zatca_invoice_hash is not null
    order by zatca_icv desc
    limit 1;

  v_next_icv := v_last_icv + 1;
  v_previous_hash := coalesce(v_previous_hash, v_first_seed);

  update public.zatca_keys set last_icv = v_next_icv where workspace_id = p_workspace_id;

  update public.invoices
    set zatca_icv = v_next_icv, zatca_previous_hash = v_previous_hash
    where id = p_invoice_id and workspace_id = p_workspace_id;

  return query select v_next_icv, v_previous_hash;
end;
$$;

-- Writes back the computed hash/signature and records an immutable 'signed'
-- audit event carrying the full UBL XML, signature, and public key.
create or replace function public.zatca_finalize_signature(
  p_invoice_id uuid,
  p_workspace_id uuid,
  p_invoice_hash text,
  p_signature text,
  p_public_key text,
  p_ubl_xml text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_icv bigint;
  v_previous_hash text;
  v_signed_at timestamptz;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'not a member of this workspace';
  end if;

  select zatca_icv, zatca_previous_hash, zatca_signed_at
    into v_icv, v_previous_hash, v_signed_at
    from public.invoices
    where id = p_invoice_id and workspace_id = p_workspace_id;

  if not found then
    raise exception 'invoice not found in this workspace';
  end if;

  if v_icv is null then
    raise exception 'no reserved sequence for this invoice — call zatca_reserve_sequence first';
  end if;

  if v_signed_at is not null then
    raise exception 'invoice already signed';
  end if;

  update public.invoices
    set zatca_invoice_hash = p_invoice_hash,
        zatca_signature = p_signature,
        zatca_public_key = p_public_key,
        zatca_signed_at = now()
    where id = p_invoice_id and workspace_id = p_workspace_id;

  insert into public.invoice_events (invoice_id, workspace_id, event_type, payload)
  values (
    p_invoice_id, p_workspace_id, 'signed',
    jsonb_build_object(
      'icv', v_icv,
      'previous_hash', v_previous_hash,
      'invoice_hash', p_invoice_hash,
      'signature', p_signature,
      'public_key', p_public_key,
      'ubl_xml', p_ubl_xml
    )
  );
end;
$$;

revoke execute on function public.zatca_reserve_sequence(uuid, uuid) from public;
grant execute on function public.zatca_reserve_sequence(uuid, uuid) to authenticated;

revoke execute on function public.zatca_finalize_signature(uuid, uuid, text, text, text, text) from public;
grant execute on function public.zatca_finalize_signature(uuid, uuid, text, text, text, text) to authenticated;
