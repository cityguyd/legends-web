import {
  handleStripeEvent,
  type ServiceDb,
  type StripeEventLike,
  type ProfileRef,
} from "@/lib/stripe/handleEvent";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Builds the minimal Stripe event shape handleStripeEvent consumes. */
function evt(
  id: string,
  type: string,
  object: Record<string, unknown>
): StripeEventLike {
  return { id, type, data: { object } };
}

interface MockOptions {
  /** Event ids already present in stripe_events (dedup by event id). */
  existingEventIds?: string[];
  /** [data_object_id, event_type] pairs already processed (object-level dedup). */
  existingObjects?: Array<[string, string]>;
  /**
   * stripe_customer_id → { id, subscriptionId } lookups.
   * Default matching subscriptionId is "sub_1" so existing specs stay green.
   */
  profileByCustomer?: Record<string, ProfileRef>;
  /** When true, updateProfile throws to test the write-before-audit path. */
  updateProfileThrows?: boolean;
}

interface RecordedUpdate {
  table: string;
  id: string;
  patch: Record<string, unknown>;
}

interface RecordedEventInsert {
  stripe_event_id: string;
  event_type: string;
  data_object_id: string;
  raw_payload: unknown;
}

/** Recording stub of the narrow ServiceDb interface. */
function mockServiceDb(opts: MockOptions = {}) {
  const updates: RecordedUpdate[] = [];
  const inserts = { stripe_events: [] as RecordedEventInsert[] };
  const db: ServiceDb & {
    updates: RecordedUpdate[];
    inserts: { stripe_events: RecordedEventInsert[] };
  } = {
    updates,
    inserts,
    async hasEvent(stripeEventId) {
      return (opts.existingEventIds ?? []).includes(stripeEventId);
    },
    async hasObject(dataObjectId, eventType) {
      return (opts.existingObjects ?? []).some(
        ([objectId, type]) => objectId === dataObjectId && type === eventType
      );
    },
    async insertEvent(row) {
      inserts.stripe_events.push(row);
      return true;
    },
    async updateProfile(id, patch) {
      if (opts.updateProfileThrows) {
        throw new Error("simulated profile write failure");
      }
      updates.push({ table: "profiles", id, patch });
    },
    async profileByCustomer(customerId) {
      return opts.profileByCustomer?.[customerId] ?? null;
    },
  };
  return db;
}

// ── Spec tests ────────────────────────────────────────────────────────────────

test("checkout.session.completed sets tier pro and records event", async () => {
  const db = mockServiceDb({ existingEventIds: [] });
  await handleStripeEvent(
    evt("evt_1", "checkout.session.completed", {
      id: "cs_1",
      customer: "cus_1",
      subscription: "sub_1",
      client_reference_id: "user-1",
    }),
    db
  );
  expect(db.updates).toContainEqual({
    table: "profiles",
    id: "user-1",
    patch: {
      tier: "pro",
      stripe_customer_id: "cus_1",
      stripe_subscription_id: "sub_1",
    },
  });
  expect(db.inserts.stripe_events[0].stripe_event_id).toBe("evt_1");
});

test("duplicate event id is a no-op", async () => {
  const db = mockServiceDb({ existingEventIds: ["evt_1"] });
  await handleStripeEvent(
    evt("evt_1", "checkout.session.completed", { id: "cs_1" }),
    db
  );
  expect(db.updates).toHaveLength(0);
});

test("duplicate data_object_id+type with different event id is a no-op", async () => {
  const db = mockServiceDb({
    existingObjects: [["cs_1", "checkout.session.completed"]],
  });
  await handleStripeEvent(
    evt("evt_2", "checkout.session.completed", { id: "cs_1" }),
    db
  );
  expect(db.updates).toHaveLength(0);
});

test("customer.subscription.deleted reverts tier to free when sub ids match", async () => {
  const db = mockServiceDb({
    profileByCustomer: { cus_1: { id: "user-1", subscriptionId: "sub_1" } },
  });
  await handleStripeEvent(
    evt("evt_3", "customer.subscription.deleted", {
      id: "sub_1",
      customer: "cus_1",
    }),
    db
  );
  expect(db.updates).toContainEqual({
    table: "profiles",
    id: "user-1",
    patch: { tier: "free", stripe_subscription_id: null },
  });
});

// ── Robustness tests (beyond spec) ────────────────────────────────────────────

test("unhandled event type records audit row but writes no profile", async () => {
  const db = mockServiceDb();
  await handleStripeEvent(
    evt("evt_4", "invoice.paid", { id: "in_1", customer: "cus_1" }),
    db
  );
  expect(db.inserts.stripe_events).toHaveLength(1);
  expect(db.inserts.stripe_events[0].event_type).toBe("invoice.paid");
  expect(db.updates).toHaveLength(0);
});

test("checkout.session.completed without client_reference_id records event, no crash", async () => {
  const db = mockServiceDb();
  await handleStripeEvent(
    evt("evt_5", "checkout.session.completed", { id: "cs_2", customer: "cus_2" }),
    db
  );
  expect(db.inserts.stripe_events).toHaveLength(1);
  expect(db.updates).toHaveLength(0);
});

test("customer.subscription.deleted with unknown customer records event, no crash", async () => {
  const db = mockServiceDb({ profileByCustomer: {} });
  await handleStripeEvent(
    evt("evt_6", "customer.subscription.deleted", {
      id: "sub_9",
      customer: "cus_unknown",
    }),
    db
  );
  expect(db.inserts.stripe_events).toHaveLength(1);
  expect(db.updates).toHaveLength(0);
});

test("duplicate event id skips the audit insert too", async () => {
  const db = mockServiceDb({ existingEventIds: ["evt_1"] });
  await handleStripeEvent(
    evt("evt_1", "checkout.session.completed", { id: "cs_1" }),
    db
  );
  expect(db.inserts.stripe_events).toHaveLength(0);
});

// ── Write-before-audit (fix 1) ────────────────────────────────────────────────

test("updateProfile throws → insertEvent NOT called (event not recorded → retryable)", async () => {
  const db = mockServiceDb({ updateProfileThrows: true });
  await expect(
    handleStripeEvent(
      evt("evt_throw", "checkout.session.completed", {
        id: "cs_throw",
        customer: "cus_1",
        subscription: "sub_1",
        client_reference_id: "user-throw",
      }),
      db
    )
  ).rejects.toThrow("simulated profile write failure");
  // Audit row must NOT have been inserted — Stripe retries will reprocess fully.
  expect(db.inserts.stripe_events).toHaveLength(0);
});

// ── Out-of-order subscription.deleted guard (fix 5) ──────────────────────────

test("subscription.deleted: stored sub mismatch → no profile update, event recorded", async () => {
  // Stored sub is "sub_2", event says "sub_1" → stale/out-of-order event.
  const db = mockServiceDb({
    profileByCustomer: { cus_1: { id: "user-1", subscriptionId: "sub_2" } },
  });
  await handleStripeEvent(
    evt("evt_mismatch", "customer.subscription.deleted", {
      id: "sub_1",
      customer: "cus_1",
    }),
    db
  );
  // Audit row IS recorded (event happened, we just skip the demotion).
  expect(db.inserts.stripe_events).toHaveLength(1);
  // Profile must NOT have been updated.
  expect(db.updates).toHaveLength(0);
});

// ── hasObject guard: id-less events don't dedup each other (fix 6 minor) ──────

test("id-less events with same type are NOT deduped against each other by object", async () => {
  // First event with empty/missing id
  const db = mockServiceDb({
    existingObjects: [["", "invoice.upcoming"]],
  });
  // A second event with the same empty objectId must NOT be skipped by hasObject.
  // (hasObject is only called when objectId is non-empty.)
  await handleStripeEvent(
    evt("evt_idless", "invoice.upcoming", { customer: "cus_1" }), // no id field
    db
  );
  // The event should be inserted (not skipped by the object-level dedup).
  expect(db.inserts.stripe_events).toHaveLength(1);
});
