# PromptVault — Complete Deployment Guide

---

## 1. SUPABASE SQL SCHEMA

Paste the entire block below into the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Auto-populated on signup via trigger below
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- Populated by Stripe webhook
-- ============================================================
create table public.subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  status                  text not null default 'inactive',
  plan                    text not null default 'free',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ============================================================
-- PROMPTS TABLE
-- ============================================================
create table public.prompts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  content     text not null,
  folder      text,
  tags        text[] default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

---

## 2. ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_APP_URL=
```

## 3. SUPABASE SETUP

Create a project at https://supabase.com, run the SQL schema, configure email auth (magic link), set your Site URL and redirect URLs, then copy your API keys.

## 4. STRIPE SETUP

Create a product at $12/month recurring, copy the Price ID, create a webhook endpoint pointing to `/api/stripe/webhook`, and copy your API keys and webhook secret.

## 5. VERCEL DEPLOYMENT

Push to GitHub, import to Vercel, add all environment variables, deploy, then update `NEXT_PUBLIC_APP_URL` and the Stripe webhook URL with your production domain.

## 6. DAY 1 LAUNCH CHECKLIST

Post on Reddit (r/ChatGPT, r/artificial, r/SideProject), Hacker News Show HN, Indie Hackers, X/Twitter, and Discord communities. Reply to every comment within 2 hours.
