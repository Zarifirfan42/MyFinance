-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

create extension if not exists "uuid-ossp";

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date not null,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense', 'investment', 'savings')),
  account text not null
);

alter table public.activities enable row level security;

-- Example: allow anonymous read/write with the anon key (adjust for production)
create policy "Allow public read activities"
  on public.activities for select
  using (true);

create policy "Allow public insert activities"
  on public.activities for insert
  with check (true);

-- For production with Supabase Auth, replace the policies above with user-scoped rules,
-- add e.g. user_id uuid references auth.users(id), backfill rows, then:
--
-- drop policy if exists "Allow public read activities" on public.activities;
-- drop policy if exists "Allow public insert activities" on public.activities;
-- alter table public.activities add column if not exists user_id uuid references auth.users(id);
-- create policy "Users read own activities" on public.activities for select using (auth.uid() = user_id);
-- create policy "Users insert own activities" on public.activities for insert with check (auth.uid() = user_id);
