import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});

export function formatPrice(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export const PLANS = {
  free: {
    name: 'Free',
    promptLimit: 10,
    features: ['Up to 10 prompts', 'Basic search', 'Magic link auth'],
  },
  pro: {
    name: 'Pro',
    promptLimit: Infinity,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    priceMonthly: 1200,
    features: ['Unlimited prompts', 'Folders & tags', 'Full-text search', 'CSV export', 'Priority support'],
  },
} as const;
