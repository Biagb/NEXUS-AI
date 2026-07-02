import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const stripe = getStripe();
    const adminSupabase = createAdminClient();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.mode !== 'subscription' || !session.subscription) {
      return NextResponse.json({ error: 'No subscription found for this session' }, { status: 400 });
    }

    const sessionUserId = session.metadata?.user_id || session.client_reference_id;
    if (sessionUserId !== user.id) {
      return NextResponse.json({ error: 'Session does not belong to current user' }, { status: 403 });
    }

    const subscription = session.subscription as Stripe.Subscription;
    const priceId = subscription.items.data[0]?.price?.id || '';

    const { error } = await adminSupabase.from('subscriptions').upsert(
      {
        id: subscription.id,
        user_id: user.id,
        status: subscription.status,
        price_id: priceId,
        current_period_end: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000).toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      console.error('Checkout confirm upsert error:', error);
      return NextResponse.json({ error: 'Failed to sync subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkout confirm error:', error);
    return NextResponse.json({ error: 'Failed to confirm checkout session' }, { status: 500 });
  }
}
