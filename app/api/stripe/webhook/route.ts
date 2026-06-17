import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function upsertSubscription(userId: string, stripeCustomerId: string, stripeSubscriptionId: string, status: string, plan: string, currentPeriodEnd: number) {
  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    { user_id: userId, stripe_customer_id: stripeCustomerId, stripe_subscription_id: stripeSubscriptionId, status, plan, current_period_end: new Date(currentPeriodEnd * 1000).toISOString(), updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) { console.error('Error upserting subscription:', error); throw error; }
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;
        const userId = session.metadata?.user_id;
        if (!userId) break;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(userId, session.customer as string, subscription.id, subscription.status, 'pro', subscription.current_period_end);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        if (!userId) {
          const { data } = await supabaseAdmin.from('subscriptions').select('user_id').eq('stripe_customer_id', subscription.customer as string).single();
          if (!data?.user_id) break;
          await upsertSubscription(data.user_id, subscription.customer as string, subscription.id, subscription.status, 'pro', subscription.current_period_end);
          break;
        }
        await upsertSubscription(userId, subscription.customer as string, subscription.id, subscription.status, 'pro', subscription.current_period_end);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: existingSub } = await supabaseAdmin.from('subscriptions').select('user_id').eq('stripe_subscription_id', subscription.id).single();
        if (existingSub?.user_id) await supabaseAdmin.from('subscriptions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('stripe_subscription_id', subscription.id);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) await supabaseAdmin.from('subscriptions').update({ status: 'past_due', updated_at: new Date().toISOString() }).eq('stripe_subscription_id', invoice.subscription as string);
        break;
      }
      default: break;
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
