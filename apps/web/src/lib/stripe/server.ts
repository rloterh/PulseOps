import 'server-only';

import Stripe from 'stripe';
import { getServerEnv } from '@pulseops/env/server';

let stripeSingleton: Stripe | null = null;

export function getStripe() {
  if (stripeSingleton) {
    return stripeSingleton;
  }

  const env = getServerEnv();

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });

  return stripeSingleton;
}
