/**
 * Pure Stripe webhook event handler — all persistence goes through the
 * injected ServiceDb, so the dedup + tier logic is unit-testable and this
 * module reads no env vars. The webhook route wraps the real service-role
 * Supabase client via lib/stripe/serviceDbAdapter.ts.
 *
 * Dedup is two-layered (both required by migration 003's stripe_events table):
 *  1. by Stripe event id (Stripe retries deliver the same id), and
 *  2. by (data_object_id, event_type) — Stripe can emit DIFFERENT event ids
 *     for the same logical object transition (e.g. resent/regenerated events),
 *     and the unique index on (data_object_id, event_type, stripe_event_id)
 *     alone does not stop those.
 *
 * Failure policy: bad/missing payload fields (no client_reference_id, unknown
 * customer) are logged and the audit row is still recorded — the webhook must
 * 200 so Stripe doesn't retry forever. Only infrastructure errors (ServiceDb
 * rejections) propagate.
 */

/** Minimal structural shape of a Stripe event — Stripe.Event satisfies it. */
export interface StripeEventLike {
  id: string;
  type: string;
  data: { object: unknown };
}

export interface StripeEventRow {
  stripe_event_id: string;
  event_type: string;
  data_object_id: string;
  raw_payload: unknown;
}

/** Narrow persistence interface implemented by the service-role adapter. */
export interface ServiceDb {
  /** True when this Stripe event id was already processed. */
  hasEvent(stripeEventId: string): Promise<boolean>;
  /** True when this (data object, event type) pair was already processed. */
  hasObject(dataObjectId: string, eventType: string): Promise<boolean>;
  /**
   * Insert the audit row. Returns false when a concurrent delivery already
   * inserted the same event id (race-safe dedup via the primary key).
   */
  insertEvent(row: StripeEventRow): Promise<boolean>;
  updateProfile(id: string, patch: Record<string, unknown>): Promise<void>;
  /** Resolve a profile id from profiles.stripe_customer_id; null on miss. */
  profileIdByCustomer(customerId: string): Promise<string | null>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function handleStripeEvent(
  event: StripeEventLike,
  db: ServiceDb
): Promise<void> {
  const object = asRecord(event.data?.object);
  const objectId = asString(object.id) ?? "";

  // ── Dedup ──────────────────────────────────────────────────────────────────
  if (await db.hasEvent(event.id)) return;
  if (await db.hasObject(objectId, event.type)) return;

  // ── Audit row (every event type, processed or not) ─────────────────────────
  const inserted = await db.insertEvent({
    stripe_event_id: event.id,
    event_type: event.type,
    data_object_id: objectId,
    raw_payload: event,
  });
  // Concurrent delivery won the insert race — treat as a duplicate.
  if (!inserted) return;

  // ── Type-specific profile writes ────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const userId = asString(object.client_reference_id);
      if (!userId) {
        console.warn(
          `stripe: ${event.id} checkout.session.completed has no client_reference_id — recorded, no profile write`
        );
        return;
      }
      await db.updateProfile(userId, {
        tier: "pro",
        stripe_customer_id: asString(object.customer),
        stripe_subscription_id: asString(object.subscription),
      });
      return;
    }

    case "customer.subscription.deleted": {
      const customerId = asString(object.customer);
      const profileId = customerId
        ? await db.profileIdByCustomer(customerId)
        : null;
      if (!profileId) {
        console.warn(
          `stripe: ${event.id} customer.subscription.deleted for unknown customer ${customerId ?? "(missing)"} — recorded, no profile write`
        );
        return;
      }
      await db.updateProfile(profileId, {
        tier: "free",
        stripe_subscription_id: null,
      });
      return;
    }

    default:
      // Unhandled type: audit row already recorded above; nothing else to do.
      return;
  }
}
