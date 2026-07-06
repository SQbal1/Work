-- Atomically allocate the next invoice number, insert the invoice + its line
-- items + a "created" audit event, all in one transaction. Row-locks
-- settings so concurrent calls in the same workspace never see the same
-- counter value (fixes the client-side race the old localStorage MVP had).
create or replace function public.create_invoice(
  p_workspace_id uuid,
  p_id uuid,
  p_customer_id uuid,
  p_issue_date date,
  p_due_date date,
  p_status text,
  p_discount_percent numeric,
  p_notes text,
  p_items jsonb -- array of {product_id, name, quantity, unit_price, vat_rate, sort_order}
)
returns public.invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_next bigint;
  v_number text;
  v_invoice public.invoices;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'not a member of this workspace';
  end if;

  select invoice_prefix, next_invoice_number into v_prefix, v_next
    from public.settings where workspace_id = p_workspace_id
    for update;

  if not found then
    raise exception 'no settings row for workspace %', p_workspace_id;
  end if;

  v_number := v_prefix || v_next::text;

  update public.settings
    set next_invoice_number = v_next + 1
    where workspace_id = p_workspace_id;

  insert into public.invoices (
    id, workspace_id, customer_id, number, issue_date, due_date,
    status, discount_percent, notes
  ) values (
    p_id, p_workspace_id, p_customer_id, v_number, p_issue_date, p_due_date,
    p_status, p_discount_percent, p_notes
  ) returning * into v_invoice;

  insert into public.invoice_line_items (
    invoice_id, product_id, name, quantity, unit_price, vat_rate, sort_order
  )
  select
    v_invoice.id,
    (item->>'product_id')::uuid,
    item->>'name',
    (item->>'quantity')::numeric,
    (item->>'unit_price')::numeric,
    (item->>'vat_rate')::numeric,
    coalesce((item->>'sort_order')::int, 0)
  from jsonb_array_elements(p_items) as item;

  insert into public.invoice_events (invoice_id, workspace_id, event_type, payload)
  values (v_invoice.id, p_workspace_id, 'created', '{}'::jsonb);

  return v_invoice;
end;
$$;

-- Non-mutating peek for UI preview before submission (no lock, safe to call repeatedly).
create or replace function public.peek_invoice_number(p_workspace_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select invoice_prefix || next_invoice_number::text
  from public.settings where workspace_id = p_workspace_id;
$$;
