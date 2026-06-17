-- PromptVault — Supabase Schema
-- Run this in the Supabase SQL editor to set up your database.

create extension if not exists "uuid-ossp";

create table if not exists public.folders (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz default now()
);

alter table public.folders enable row level security;

create policy "Users can manage their own folders"
  on public.folders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.prompts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  folder_id   uuid references public.folders(id) on delete set null,
  title       text not null,
  content     text not null,
  tags        text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.prompts enable row level security;

create policy "Users can manage their own prompts"
  on public.prompts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists prompts_user_id_idx on public.prompts(user_id);
create index if not exists prompts_folder_id_idx on public.prompts(folder_id);

create table if not exists public.subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text check (status in ('active', 'cancelled', 'past_due', 'trialing', 'incomplete')),
  plan                    text check (plan in ('free', 'pro')) default 'free',
  current_period_end      timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger prompts_updated_at
  before update on public.prompts
  for each row execute function public.handle_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();
