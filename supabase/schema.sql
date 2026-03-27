-- ─────────────────────────────────────────────────────────────
-- DashTrack — Supabase schema
-- Run this in your Supabase project: SQL Editor > New query
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension (already enabled on Supabase by default)
create extension if not exists "uuid-ossp";

-- ─── earnings ────────────────────────────────────────────────
create table if not exists earnings (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  amount        numeric(10, 2) not null check (amount > 0),
  active_hours  numeric(5, 2)  not null check (active_hours > 0),
  notes         text,
  dashed_at     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ─── expenses ────────────────────────────────────────────────
create type expense_type as enum ('gas', 'mileage', 'maintenance', 'other');

create table if not exists expenses (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  type              expense_type not null,
  amount            numeric(10, 2) not null check (amount >= 0),
  description       text,

  -- gas fields
  gallons           numeric(8, 3),
  price_per_gallon  numeric(6, 3),

  -- mileage fields
  miles             numeric(8, 1),
  irs_rate          numeric(5, 3),
  deductible_amount numeric(10, 2),

  expensed_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists earnings_user_dashed   on earnings (user_id, dashed_at desc);
create index if not exists expenses_user_expensed on expenses (user_id, expensed_at desc);
create index if not exists expenses_type          on expenses (user_id, type);

-- ─── Row Level Security ───────────────────────────────────────
alter table earnings enable row level security;
alter table expenses enable row level security;

-- Earnings: users can only see/modify their own rows
create policy "earnings: select own" on earnings
  for select using (auth.uid() = user_id);

create policy "earnings: insert own" on earnings
  for insert with check (auth.uid() = user_id);

create policy "earnings: update own" on earnings
  for update using (auth.uid() = user_id);

create policy "earnings: delete own" on earnings
  for delete using (auth.uid() = user_id);

-- Expenses: same pattern
create policy "expenses: select own" on expenses
  for select using (auth.uid() = user_id);

create policy "expenses: insert own" on expenses
  for insert with check (auth.uid() = user_id);

create policy "expenses: update own" on expenses
  for update using (auth.uid() = user_id);

create policy "expenses: delete own" on expenses
  for delete using (auth.uid() = user_id);
