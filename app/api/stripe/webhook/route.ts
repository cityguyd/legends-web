import type Stripe from "stripe";
import { handleStripeEvent } from "@/lib/stripe/handleEvent";
import { createServiceDb } from "@/lib/stripe/serviceDbAdapter";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * POST /api/stripe/webhook — Stripe event sink.
 *
 * Responses:
 *  - 500 on server misconfiguration (missing STRIPE_WEBHOOK_SECRET) so Stripe
 *    retries — it will never succeed if the secret is wrong, but a 500 is the
 *    honest signal for ops to fix the env var. Distinct from…
 *  - 400 on a bad/missing signature header (Stripe will not retry usefully).
 *  - 200 once the event is recorded — including unhandled types and payloads
 *    missing expected fields (handleStripeEvent logs those), so Stripe does
 *    not retry forever.
 *  - 500 on infrastructure failures (DB down) so Stripe DOES retry; the
 *    stripe_events dedup makes retries idempotent.
 *
 * The raw request body is required for signature verification — App Router
 * route handlers expose it untouched via req.text().
 */
export async function POST(req: Request) {
  // Env guard first: missing secret is a server misconfiguration → 500.
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("stripe webhook: STRIPE_WEBHOOK_SECRET is not set");
    return new Response("server misconfiguration", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("missing signature", { status: 400 });
  }

  // Hoist getStripe() above constructEvent so an env failure (missing
  // STRIPE_SECRET_KEY) produces a clear 500 rather than being swallowed
  // by the constructEvent try/catch and mislabeled "invalid signature".
  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error("stripe webhook: failed to initialise Stripe client", err);
    return new Response("server misconfiguration", { status: 500 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  try {
    await handleStripeEvent(event, createServiceDb(createServiceClient()));
  } catch (error) {
    console.error(`stripe webhook ${event.id} (${event.type}) failed`, error);
    return new Response("event processing failed", { status: 500 });
  }

  return Response.json({ received: true });
}
