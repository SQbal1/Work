-- Atomically creates a workspace + owner membership + empty company/settings
-- rows. Runs as security definer to sidestep the chicken-and-egg RLS problem:
-- the very first workspace_members row can't satisfy "admins manage members"
-- (which requires an existing admin row), and reading back the just-inserted
-- workspaces row via RETURNING requires SELECT access that also depends on
-- membership existing yet. This function is the one sanctioned bootstrap path.
create or replace function public.bootstrap_workspace(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.workspaces (name, owner_id)
  values (coalesce(nullif(p_name, ''), 'My Workspace'), v_user_id)
  returning id into v_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, v_user_id, 'owner');

  insert into public.companies (workspace_id) values (v_workspace_id);
  insert into public.settings (workspace_id) values (v_workspace_id);

  return v_workspace_id;
end;
$$;

revoke execute on function public.bootstrap_workspace(text) from public;
grant execute on function public.bootstrap_workspace(text) to authenticated;
