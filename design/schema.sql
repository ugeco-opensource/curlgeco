create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  default_model_id text,
  gtm_consent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_snapshots_user_id_idx
  on public.workspace_snapshots(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

drop trigger if exists workspace_snapshots_set_updated_at on public.workspace_snapshots;
create trigger workspace_snapshots_set_updated_at
before update on public.workspace_snapshots
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workspace_snapshots enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "user_preferences_own" on public.user_preferences;
create policy "user_preferences_own"
on public.user_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "workspace_snapshots_own" on public.workspace_snapshots;
create policy "workspace_snapshots_own"
on public.workspace_snapshots
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

comment on table public.workspace_snapshots is
'Optional future sync target for curlgeco workspace state. Endpoint secrets should remain local or be encrypted separately before sync.';
