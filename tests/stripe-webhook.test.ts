/**
 * Integration tests for POST /api/stripe/webhook.
 *
 * Uses stripe.webhooks.generateTestHeaderString to produce real HMAC
 * signatures so constructEvent works without live Stripe credentials.
 * The service client and handleStripeEvent are mocked so no DB hits occur.
 */
import { vi } from "vitest";
import Stripe from "stripe";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(() => ({})),
}));

vi.mock("@/lib/stripe/serviceDbAdapter", () => ({
  createServiceDb: vi.fn(() => ({})),
}));

vi.mock("@/lib/stripe/handleEvent", () => ({
  handleStripeEvent: vi.fn(() => Promise.resolve()),
}));

// Import after mocks are set up.
import { POST } from "@/app/api/stripe/webhook/route";
import { handleStripeEvent } from "@/lib/stripe/handleEvent";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TEST_SECRET = "whsec_testsecret1234567890abcdef";
const TEST_STRIPE_KEY = "sk_test_dummy_key";

/** Minimal Stripe event payload as a JSON string. */
function makePayload(id = "evt_test_1") {
  return JSON.stringify({
    id,
    object: "event",
    type: "checkout.session.completed",
    data: { object: { id: "cs_1", client_reference_id: "user-1" } },
  });
}

/** Build a Request with a valid Stripe signature header. */
function makeRequest(
  payload: string,
  secret: string,
  opts?: { tamperBody?: boolean; omitSignature?: boolean }
) {
  const body = opts?.tamperBody ? payload + " tampered" : payload;
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!opts?.omitSignature) {
    headers["stripe-signature"] = signature;
  }
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers,
    body,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.mocked(handleStripeEvent).mockReset();
  vi.mocked(handleStripeEvent).mockResolvedValue(undefined);
});

test("valid signature → 200 { received: true }", async () => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", TEST_SECRET);
  vi.stubEnv("STRIPE_SECRET_KEY", TEST_STRIPE_KEY);

  const payload = makePayload();
  const req = makeRequest(payload, TEST_SECRET);
  const res = await POST(req);

  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body).toEqual({ received: true });
});

test("tampered body → 400 invalid signature", async () => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", TEST_SECRET);
  vi.stubEnv("STRIPE_SECRET_KEY", TEST_STRIPE_KEY);

  const payload = makePayload("evt_tampered");
  const req = makeRequest(payload, TEST_SECRET, { tamperBody: true });
  const res = await POST(req);

  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toMatch(/invalid signature/i);
});

test("missing stripe-signature header → 400", async () => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", TEST_SECRET);
  vi.stubEnv("STRIPE_SECRET_KEY", TEST_STRIPE_KEY);

  const payload = makePayload();
  const req = makeRequest(payload, TEST_SECRET, { omitSignature: true });
  const res = await POST(req);

  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toMatch(/missing signature/i);
});

test("missing STRIPE_WEBHOOK_SECRET → 500 (server misconfiguration, not 400)", async () => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
  vi.stubEnv("STRIPE_SECRET_KEY", TEST_STRIPE_KEY);

  const payload = makePayload();
  const req = makeRequest(payload, TEST_SECRET);
  const res = await POST(req);

  expect(res.status).toBe(500);
  const text = await res.text();
  expect(text).toMatch(/server misconfiguration/i);
});
