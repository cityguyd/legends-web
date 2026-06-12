import type Stripe from "stripe";
import { handleStripeEvent } from "@/lib/stripe/handleEvent";
import { createServiceDb } from "@/lib/stripe/serviceDbAdapter";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * POST /api/stripe/webhook — Stripe event sink.
 *
 * Responses:
 *  - 400 only on a bad/missing signature (Stripe will not retry usefully).
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
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
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
