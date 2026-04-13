-- Nourish ARFID Companion — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Food Map
create table food_map (
  id text primary key,
  name text not null,
  category text not null,
  prep_method text default '',
  what_i_like text default '',
  wouldnt_eat text default '',
  date_added timestamptz default now()
);

alter table food_map enable row level security;
create policy "Public access" on food_map for all using (true) with check (true);

-- Bridges
create table bridges (
  id text primary key,
  safe_food_name text not null,
  new_food_name text not null,
  suggested_by text default 'Self',
  status text default 'not-tried',
  attempts jsonb default '[]'::jsonb,
  therapist_note text default '',
  created_at timestamptz default now()
);

alter table bridges enable row level security;
create policy "Public access" on bridges for all using (true) with check (true);

-- Triggers
create table triggers (
  id text primary key,
  food text not null,
  trigger_type text not null,
  description text default '',
  avoided boolean default true,
  meal_time text default '',
  date timestamptz default now()
);

alter table triggers enable row level security;
create policy "Public access" on triggers for all using (true) with check (true);

-- Ladders
create table ladders (
  id text primary key,
  target_food text not null,
  steps jsonb default '[]'::jsonb,
  created_by text default 'Self',
  created_at timestamptz default now()
);

alter table ladders enable row level security;
create policy "Public access" on ladders for all using (true) with check (true);

-- Wins
create table wins (
  id text primary key,
  food text not null,
  notes text default '',
  date timestamptz default now(),
  source text default 'manual'
);

alter table wins enable row level security;
create policy "Public access" on wins for all using (true) with check (true);

-- Moods
create table moods (
  id text primary key,
  meal text not null,
  meal_time text default '',
  mood_before text default '',
  mood_after text default '',
  comfort integer default 3,
  notes text default '',
  date timestamptz default now()
);

alter table moods enable row level security;
create policy "Public access" on moods for all using (true) with check (true);

-- Session Notes (therapist only)
create table session_notes (
  id text primary key,
  session_type text not null,
  content text not null,
  date timestamptz default now()
);

alter table session_notes enable row level security;
create policy "Public access" on session_notes for all using (true) with check (true);
