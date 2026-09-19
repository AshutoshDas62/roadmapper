-- Phase 2: user-owned roadmap metadata. Topic content is added in a later phase.
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '',
  category text not null default 'General',
  icon text not null default 'map',
  visibility text not null default 'PRIVATE' check (visibility in ('PRIVATE', 'PUBLIC')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists roadmaps_user_id_created_at_idx
  on public.roadmaps (user_id, created_at desc);

alter table public.roadmaps enable row level security;

grant select, insert, update, delete on public.roadmaps to authenticated;

drop policy if exists "Users can view their own roadmaps" on public.roadmaps;
create policy "Users can view their own roadmaps"
  on public.roadmaps for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own roadmaps" on public.roadmaps;
create policy "Users can create their own roadmaps"
  on public.roadmaps for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own roadmaps" on public.roadmaps;
create policy "Users can update their own roadmaps"
  on public.roadmaps for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own roadmaps" on public.roadmaps;
create policy "Users can delete their own roadmaps"
  on public.roadmaps for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_roadmaps_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_roadmaps_updated_at on public.roadmaps;
create trigger set_roadmaps_updated_at
  before update on public.roadmaps
  for each row execute function public.set_roadmaps_updated_at();
