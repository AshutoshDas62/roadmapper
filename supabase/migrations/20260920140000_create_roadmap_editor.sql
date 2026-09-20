-- Phase 3: visual roadmap topic and connection data.
create table if not exists public.roadmap_topics (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  parent_id uuid references public.roadmap_topics(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '',
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_edges (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  source_topic_id uuid not null references public.roadmap_topics(id) on delete cascade,
  target_topic_id uuid not null references public.roadmap_topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint roadmap_edges_distinct_topics check (source_topic_id <> target_topic_id),
  constraint roadmap_edges_unique_connection unique (roadmap_id, source_topic_id, target_topic_id)
);

create index if not exists roadmap_topics_roadmap_id_idx on public.roadmap_topics (roadmap_id);
create index if not exists roadmap_edges_roadmap_id_idx on public.roadmap_edges (roadmap_id);

alter table public.roadmap_topics enable row level security;
alter table public.roadmap_edges enable row level security;

grant select, insert, update, delete on public.roadmap_topics to authenticated;
grant select, insert, update, delete on public.roadmap_edges to authenticated;

drop policy if exists "Users can view topics in their roadmaps" on public.roadmap_topics;
create policy "Users can view topics in their roadmaps"
  on public.roadmap_topics for select to authenticated
  using (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_topics.roadmap_id and roadmaps.user_id = (select auth.uid())));

drop policy if exists "Users can create topics in their roadmaps" on public.roadmap_topics;
create policy "Users can create topics in their roadmaps"
  on public.roadmap_topics for insert to authenticated
  with check (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_topics.roadmap_id and roadmaps.user_id = (select auth.uid())));

drop policy if exists "Users can update topics in their roadmaps" on public.roadmap_topics;
create policy "Users can update topics in their roadmaps"
  on public.roadmap_topics for update to authenticated
  using (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_topics.roadmap_id and roadmaps.user_id = (select auth.uid())))
  with check (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_topics.roadmap_id and roadmaps.user_id = (select auth.uid())));

drop policy if exists "Users can delete topics in their roadmaps" on public.roadmap_topics;
create policy "Users can delete topics in their roadmaps"
  on public.roadmap_topics for delete to authenticated
  using (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_topics.roadmap_id and roadmaps.user_id = (select auth.uid())));

drop policy if exists "Users can view edges in their roadmaps" on public.roadmap_edges;
create policy "Users can view edges in their roadmaps"
  on public.roadmap_edges for select to authenticated
  using (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_edges.roadmap_id and roadmaps.user_id = (select auth.uid())));

drop policy if exists "Users can create edges in their roadmaps" on public.roadmap_edges;
create policy "Users can create edges in their roadmaps"
  on public.roadmap_edges for insert to authenticated
  with check (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_edges.roadmap_id and roadmaps.user_id = (select auth.uid())));

drop policy if exists "Users can delete edges in their roadmaps" on public.roadmap_edges;
create policy "Users can delete edges in their roadmaps"
  on public.roadmap_edges for delete to authenticated
  using (exists (select 1 from public.roadmaps where roadmaps.id = roadmap_edges.roadmap_id and roadmaps.user_id = (select auth.uid())));

create or replace function public.validate_roadmap_topic_parent()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.roadmap_topics parent
    where parent.id = new.parent_id and parent.roadmap_id = new.roadmap_id
  ) then
    raise exception 'A topic parent must belong to the same roadmap';
  end if;
  return new;
end;
$$;

create or replace function public.validate_roadmap_edge_topics()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.roadmap_topics where id = new.source_topic_id and roadmap_id = new.roadmap_id)
    or not exists (select 1 from public.roadmap_topics where id = new.target_topic_id and roadmap_id = new.roadmap_id) then
    raise exception 'Connection topics must belong to the same roadmap';
  end if;
  return new;
end;
$$;

create or replace function public.set_roadmap_topics_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists validate_roadmap_topic_parent on public.roadmap_topics;
create trigger validate_roadmap_topic_parent
  before insert or update on public.roadmap_topics
  for each row execute function public.validate_roadmap_topic_parent();

drop trigger if exists set_roadmap_topics_updated_at on public.roadmap_topics;
create trigger set_roadmap_topics_updated_at
  before update on public.roadmap_topics
  for each row execute function public.set_roadmap_topics_updated_at();

drop trigger if exists validate_roadmap_edge_topics on public.roadmap_edges;
create trigger validate_roadmap_edge_topics
  before insert or update on public.roadmap_edges
  for each row execute function public.validate_roadmap_edge_topics();
