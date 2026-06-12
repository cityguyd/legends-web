import Stripe from "stripe";

/**
 * Lazy Stripe client factory. Instantiated per call (cheap — plain object, no
 * connection pool) so module import never reads env vars: builds and tests
 * succeed without STRIPE_SECRET_KEY set.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

/** Absolute site origin for Stripe redirect URLs. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
