-- Temporary diagnostic function used while debugging an RLS issue during
-- workspace bootstrap. Dropped in 0011_drop_debug_whoami — kept here only so
-- this file mirrors the remote project's actual migration history exactly.
create or replace function public.debug_whoami()
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'uid', auth.uid(),
    'role', current_setting('request.jwt.claim.role', true),
    'jwt_sub', current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );
$$;
grant execute on function public.debug_whoami() to authenticated, anon;
