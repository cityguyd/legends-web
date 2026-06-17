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
 * Write-before-audit ordering (fix 1):
 *  Profile writes happen BEFORE the audit insert. Double profile writes are
 *  idempotent (patches derive from immutable event fields). If insertEvent
 *  returns false (lost race) the other delivery did the same idempotent write —
 *  correct. If the profile write throws, nothing was recorded so Stripe retries
 *  fully.
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

/** Profile fields returned by profileByCustomer. */
export interface ProfileRef {
  id: string;
  subscriptionId: string | null;
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
  /**
   * Resolve a profile's id and current stripe_subscription_id from
   * profiles.stripe_customer_id; null on miss.
   */
  profileByCustomer(customerId: string): Promise<ProfileRef | null>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

const PAID_TIERS = ["pro", "group", "institution"] as const;
const DEFAULT_SEATS: Record<string, number> = { group: 10, institution: 50 };

/**
 * The tier to grant from a checkout session. Self-serve Premium checkouts carry
 * no tier metadata → "pro". Organization checkouts/invoices set
 * `metadata.tier` to "group" / "institution". Unknown values fall back to "pro".
 */
function resolveTier(object: Record<string, unknown>): string {
  const requested = asString(asRecord(object.metadata).tier);
  return requested && (PAID_TIERS as readonly string[]).includes(requested)
    ? requested
    : "pro";
}

/** Seat allowance from `metadata.seat_count`, else the plan default. */
function resolveSeatCount(object: Record<string, unknown>, tier: string): number {
  const raw = Number(asRecord(object.metadata).seat_count);
  if (Number.isFinite(raw) && raw > 0) return Math.floor(raw);
  return DEFAULT_SEATS[tier] ?? 1;
}

export async function handleStripeEvent(
  event: StripeEventLike,
  db: ServiceDb
): Promise<void> {
  const object = asRecord(event.data?.object);
  const objectId = asString(object.id) ?? "";

  // ── Dedup ──────────────────────────────────────────────────────────────────
  if (await db.hasEvent(event.id)) return;
  // Only dedup by (objectId, type) when the event has a non-empty object id —
  // id-less unhandled events must not dedup against each other.
  if (objectId && (await db.hasObject(objectId, event.type))) return;

  // ── Type-specific profile writes (before audit insert) ─────────────────────
  // Profile writes are idempotent (patches come from immutable event fields).
  // Doing them before insertEvent means: if the write throws, nothing is
  // recorded and Stripe retries fully. If insertEvent later returns false
  // (lost race), the other delivery did the same idempotent write — correct.
  switch (event.type) {
    case "checkout.session.completed": {
      const userId = asString(object.client_reference_id);
      if (!userId) {
        console.warn(
          `stripe: ${event.id} checkout.session.completed has no client_reference_id — will record, no profile write`
        );
        break;
      }
      const patch: Record<string, unknown> = {
        tier: resolveTier(object),
        stripe_customer_id: asString(object.customer),
        stripe_subscription_id: asString(object.subscription),
      };
      // Organization tiers: the buyer becomes the group admin and the group is
      // keyed by their own user id. Seats come from metadata, else the plan
      // default (group 10 / institution 50).
      if (patch.tier === "group" || patch.tier === "institution") {
        patch.group_id = userId;
        patch.group_role = "admin";
        patch.seat_count = resolveSeatCount(object, patch.tier);
      }
      await db.updateProfile(userId, patch);
      break;
    }

    case "customer.subscription.deleted": {
      const customerId = asString(object.customer);
      const deletedSubId = asString(object.id);
      const profile = customerId
        ? await db.profileByCustomer(customerId)
        : null;
      if (!profile) {
        console.warn(
          `stripe: ${event.id} customer.subscription.deleted for unknown customer ${customerId ?? "(missing)"} — will record, no profile write`
        );
        break;
      }
      // Out-of-order guard: only demote when the deleted sub matches stored sub.
      if (profile.subscriptionId && profile.subscriptionId !== deletedSubId) {
        console.warn(
          `stripe: ${event.id} customer.subscription.deleted sub ${deletedSubId} does not match stored sub ${profile.subscriptionId} — will record, skipping demotion`
        );
        break;
      }
      await db.updateProfile(profile.id, {
        tier: "free",
        stripe_subscription_id: null,
      });
      break;
    }

    default:
      // Unhandled type: fall through to audit record.
      break;
  }

  // ── Audit row (every event type, processed or not) ─────────────────────────
  const inserted = await db.insertEvent({
    stripe_event_id: event.id,
    event_type: event.type,
    data_object_id: objectId,
    raw_payload: event,
  });
  // Concurrent delivery won the insert race — the other delivery already did
  // the same idempotent profile write above.
  if (!inserted) return;
}
