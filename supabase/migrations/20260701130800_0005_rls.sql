alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.companies enable row level security;
alter table public.settings enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.invoice_events enable row level security;

-- helper: is the current user a member of a given workspace?
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(ws_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
      and role in ('owner','admin')
  );
$$;

-- profiles: user can see/update only their own row
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- workspaces
create policy "select own workspaces" on public.workspaces
  for select using (public.is_workspace_member(id));
create policy "insert own workspace" on public.workspaces
  for insert with check (owner_id = auth.uid());
create policy "owner can update workspace" on public.workspaces
  for update using (owner_id = auth.uid());

-- workspace_members
create policy "select own membership rows" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));
create policy "admins manage members" on public.workspace_members
  for insert with check (public.is_workspace_admin(workspace_id));
create policy "admins update members" on public.workspace_members
  for update using (public.is_workspace_admin(workspace_id));
create policy "admins delete members" on public.workspace_members
  for delete using (public.is_workspace_admin(workspace_id));

-- tenant tables scoped by workspace_id
create policy "tenant select" on public.companies for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.companies for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "tenant select" on public.settings for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.settings for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "tenant select" on public.customers for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.customers for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "tenant select" on public.products for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.products for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "tenant select" on public.invoices for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.invoices for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "tenant select" on public.invoice_events for select using (public.is_workspace_member(workspace_id));
create policy "tenant write" on public.invoice_events for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

-- invoice_line_items has no workspace_id column; scope via parent invoice
create policy "tenant select via invoice" on public.invoice_line_items
  for select using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_workspace_member(i.workspace_id)));
create policy "tenant write via invoice" on public.invoice_line_items
  for all using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_workspace_member(i.workspace_id)))
  with check (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_workspace_member(i.workspace_id)));
