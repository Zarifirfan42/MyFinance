-- Run in Supabase SQL editor after activities.sql

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  asset_name text not null,
  date date not null,
  value_rm numeric(12, 2) not null,
  unique (asset_name, date)
);

alter table public.price_history enable row level security;

create policy "Allow public read price_history"
  on public.price_history for select
  using (true);

create policy "Allow public insert price_history"
  on public.price_history for insert
  with check (true);

create policy "Allow public update price_history"
  on public.price_history for update
  using (true);

-- Initial snapshot for tracked assets (today's date). Re-run safe: conflicts skip.
insert into public.price_history (asset_name, date, value_rm) values
  ('Public Gold', current_date, 7959.00),
  ('Versa Gold', current_date, 1496.93),
  ('iShares Silver Trust', current_date, 207.58),
  ('BTC', current_date, 227.19),
  ('ETH', current_date, 110.45),
  ('XRP', current_date, 23.50),
  ('SOL', current_date, 21.45)
on conflict (asset_name, date) do update set value_rm = excluded.value_rm;
