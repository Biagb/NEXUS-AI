import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

// Disable Next.js body parsing — Stripe requires the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const supabase = createAdminClient();

  // Read raw body for signature verification
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    const upsertSubscriptionForUser = async (
      subscription: Stripe.Subscription,
      userId: string
    ) => {
      const priceId = subscription.items.data[0]?.price?.id || '';

      const { error } = await supabase
        .from('subscriptions')
        .upsert(
          {
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            price_id: priceId,
            current_period_end: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000).toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error(`Error upserting subscription ${subscription.id} for user ${userId}:`, error);
        return false;
      }

      return true;
    };

    switch (event.type) {
      // ─── Initial subscription creation (after successful checkout) ───
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.user_id || session.client_reference_id;

          if (!userId) {
            console.error('No user_id found in checkout session metadata');
            break;
          }

          // Fetch full subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const ok = await upsertSubscriptionForUser(subscription, userId);
          if (ok) {
            console.log(`Subscription ${subscription.id} created for user ${userId}`);
          }
        }
        break;
      }

      // ─── Subscription updated (renewal, plan change, etc.) ───
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadataUserId = subscription.metadata?.user_id;

        if (metadataUserId) {
          const ok = await upsertSubscriptionForUser(subscription, metadataUserId);
          if (ok) {
            console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
          }
          break;
        }

        // Fallback for subscriptions created before metadata support
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('id', subscription.id)
          .single();

        if (!existingSub) {
          console.warn(`No existing subscription found for Stripe ID: ${subscription.id}`);
          break;
        }

        const ok = await upsertSubscriptionForUser(subscription, existingSub.user_id);
        if (ok) {
          console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
        }
        break;
      }

      // ─── Subscription deleted / canceled ───
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000).toISOString(),
          })
          .eq('id', subscription.id);

        if (error) {
          console.error('Error marking subscription as canceled:', error);
        } else {
          console.log(`Subscription ${subscription.id} marked as canceled`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
