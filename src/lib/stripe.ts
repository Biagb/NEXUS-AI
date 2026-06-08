import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Returns a singleton Stripe instance configured for the app.
 * Lazy-initialized to prevent build-time errors when env vars are missing.
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }

  stripeInstance = new Stripe(secretKey, {
    typescript: true,
    appInfo: {
      name: 'AI Marketing Autopilot',
      version: '0.1.0',
    },
  });

  return stripeInstance;
}
