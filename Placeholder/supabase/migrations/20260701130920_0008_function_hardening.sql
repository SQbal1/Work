-- fix mutable search_path warning
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- create_invoice / peek_invoice_number are meant only for signed-in users
-- (Server Actions acting on behalf of the session). The functions already
-- self-check is_workspace_member()/RLS internally, but revoke anon EXECUTE
-- as defense-in-depth per the security advisor.
revoke execute on function public.create_invoice(uuid, uuid, uuid, date, date, text, numeric, text, jsonb) from public;
grant execute on function public.create_invoice(uuid, uuid, uuid, date, date, text, numeric, text, jsonb) to authenticated;

revoke execute on function public.peek_invoice_number(uuid) from public;
grant execute on function public.peek_invoice_number(uuid) to authenticated;
