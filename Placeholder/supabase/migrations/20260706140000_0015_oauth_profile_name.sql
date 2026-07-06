-- Make the signup profile trigger robust across auth providers.
--
-- Email signup passes `full_name` in raw_user_meta_data (see signup form),
-- but OAuth providers use different keys: Google → full_name/name, GitHub →
-- name/user_name, Apple → name (first login only). The original trigger only
-- read `full_name`, so OAuth signups landed with a blank display_name. Widen
-- it to try each key in turn, falling back to the email's local part so a
-- profile is never nameless.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'user_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      ''
    )
  );
  return new;
end;
$$;
