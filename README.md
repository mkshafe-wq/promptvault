# PromptVault

A personal AI prompt library micro-SaaS. Save, organize, tag, and search your best AI prompts.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth + PostgreSQL + Row-Level Security)
- **Stripe** (Subscriptions)
- **Tailwind CSS**
- **TypeScript**

## Features

| Feature | Free | Pro ($12/mo) |
|---|---|---|
| Prompts | Up to 10 | Unlimited |
| Folders | — | ✓ |
| Tags | — | ✓ |
| Full-text search | ✓ | ✓ |
| CSV export | — | ✓ |
| Magic link auth | ✓ | ✓ |

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd promptvault
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase-schema.sql`
3. In **Authentication → Email**, enable "Magic link" and disable "Confirm email" (or keep it enabled — both work)
4. Copy your project URL and anon key from **Settings → API**

### 3. Stripe

1. Create a product in [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Add a recurring price of $12/month
3. Copy the **Price ID** (starts with `price_`)
4. For webhooks (local dev): `stripe listen --forward-to localhost:3000/api/stripe/webhook`
5. For production: add a webhook endpoint in Stripe Dashboard pointing to `https://yourdomain.com/api/stripe/webhook` with events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

```bash
vercel deploy
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**. Set `NEXT_PUBLIC_APP_URL` to your production domain.
