import {
  handleStripeEvent,
  type ServiceDb,
  type StripeEventLike,
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
  /** stripe_customer_id → profile id lookups. */
  profileByCustomer?: Record<string, string>;
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
      updates.push({ table: "profiles", id, patch });
    },
    async profileIdByCustomer(customerId) {
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

test("customer.subscription.deleted reverts tier to free", async () => {
  const db = mockServiceDb({ profileByCustomer: { cus_1: "user-1" } });
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
