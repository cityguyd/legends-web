import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceDb, StripeEventRow } from "@/lib/stripe/handleEvent";

/** Postgres unique-violation SQLSTATE — concurrent webhook delivery race. */
const UNIQUE_VIOLATION = "23505";

/**
 * Wraps the service-role Supabase client into the narrow ServiceDb interface
 * consumed by handleStripeEvent. Errors are thrown (not swallowed) so the
 * webhook route can surface a 5xx and let Stripe retry — the dedup layer
 * makes retries idempotent.
 */
export function createServiceDb(client: SupabaseClient): ServiceDb {
  return {
    async hasEvent(stripeEventId: string): Promise<boolean> {
      const { data, error } = await client
        .from("stripe_events")
        .select("stripe_event_id")
        .eq("stripe_event_id", stripeEventId)
        .maybeSingle();
      if (error) throw new Error(`stripe_events lookup failed: ${error.message}`);
      return data !== null;
    },

    async hasObject(dataObjectId: string, eventType: string): Promise<boolean> {
      const { data, error } = await client
        .from("stripe_events")
        .select("stripe_event_id")
        .eq("data_object_id", dataObjectId)
        .eq("event_type", eventType)
        .limit(1);
      if (error) throw new Error(`stripe_events lookup failed: ${error.message}`);
      return (data?.length ?? 0) > 0;
    },

    async insertEvent(row: StripeEventRow): Promise<boolean> {
      const { error } = await client.from("stripe_events").insert(row);
      if (!error) return true;
      // Lost the insert race against a concurrent delivery → duplicate, skip.
      if (error.code === UNIQUE_VIOLATION) return false;
      throw new Error(`stripe_events insert failed: ${error.message}`);
    },

    async updateProfile(
      id: string,
      patch: Record<string, unknown>
    ): Promise<void> {
      const { error } = await client.from("profiles").update(patch).eq("id", id);
      if (error) throw new Error(`profiles update failed: ${error.message}`);
    },

    async profileIdByCustomer(customerId: string): Promise<string | null> {
      const { data, error } = await client
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (error) throw new Error(`profiles lookup failed: ${error.message}`);
      return typeof data?.id === "string" ? data.id : null;
    },
  };
}
