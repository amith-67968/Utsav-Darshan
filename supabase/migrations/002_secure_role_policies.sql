-- Use a SECURITY DEFINER helper for role checks so policies never query
-- profiles through profiles RLS (which causes recursive policy evaluation).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Profiles readable by owner or admin" on public.profiles;
drop policy if exists "Users update own profile basics" on public.profiles;
create policy "Profiles readable by owner or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Users update own profile basics" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = 'user');

drop policy if exists "Admins manage categories" on public.event_categories;
create policy "Admins manage categories" on public.event_categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Only approved events public, creators see their own" on public.events;
drop policy if exists "Admins update events" on public.events;
create policy "Only approved events public, creators see their own" on public.events
  for select using (status = 'approved' or created_by = auth.uid() or public.is_admin());
create policy "Admins update events" on public.events
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage reports" on public.event_reports;
create policy "Admins manage reports" on public.event_reports
  for all using (public.is_admin()) with check (public.is_admin());
