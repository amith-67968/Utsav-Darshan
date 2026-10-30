create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 80),
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (char_length(event_name) between 3 and 140),
  city text not null,
  location text not null,
  category_id uuid not null references public.event_categories(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  description text not null,
  cultural_significance text,
  poster_url text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_dates_ordered check (end_date >= start_date)
);

create table if not exists public.event_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reported_by uuid references public.profiles(id) on delete set null,
  reason text not null check (char_length(reason) between 8 and 2000),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists events_public_dates_idx on public.events(status,start_date);
create index if not exists events_city_idx on public.events(lower(city));
create index if not exists events_category_idx on public.events(category_id);
create index if not exists events_creator_idx on public.events(created_by,created_at desc);
create index if not exists event_reports_status_idx on public.event_reports(status,created_at desc);

create or replace function public.create_profile_for_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end; $$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute procedure public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.event_categories enable row level security;
alter table public.events enable row level security;
alter table public.event_reports enable row level security;

create policy "Profiles readable by owner or admin" on public.profiles for select using (auth.uid()=id or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Users update own profile basics" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id and role='user');
create policy "Categories visible to all" on public.event_categories for select using (true);
create policy "Admins manage categories" on public.event_categories for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Only approved events public, creators see their own" on public.events for select using (status='approved' or created_by=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Authenticated contributors submit pending events" on public.events for insert to authenticated with check (created_by=auth.uid() and status='pending');
create policy "Admins update events" on public.events for update using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "Authenticated users create reports" on public.event_reports for insert to authenticated with check (reported_by=auth.uid());
create policy "Admins manage reports" on public.event_reports for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

insert into public.event_categories(name,slug) values ('Festival','festival'),('Fair','fair'),('Yatra','yatra'),('Cultural','cultural'),('Music & dance','music-dance'),('Heritage','heritage'),('Temple event','temple-event') on conflict do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('event-posters','event-posters',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "Public can view event posters" on storage.objects for select using(bucket_id='event-posters');
create policy "Authenticated users upload event posters" on storage.objects for insert to authenticated with check(bucket_id='event-posters' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Owners update event posters" on storage.objects for update to authenticated using(bucket_id='event-posters' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='event-posters' and (storage.foldername(name))[1]=auth.uid()::text);
