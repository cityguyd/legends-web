import { vi, test, expect, afterEach } from "vitest";
import { cancelSubscriptionIfPresent } from "@/lib/stripe/subscription";

afterEach(() => {
  vi.restoreAllMocks();
});

test("does nothing when subscriptionId is null", async () => {
  const cancel = vi.fn();

  await cancelSubscriptionIfPresent(null, { subscriptions: { cancel } });

  expect(cancel).not.toHaveBeenCalled();
});

test("cancels an active subscription", async () => {
  const cancel = vi.fn().mockResolvedValue({});

  await cancelSubscriptionIfPresent("sub_abc123", { subscriptions: { cancel } });

  expect(cancel).toHaveBeenCalledOnce();
  expect(cancel).toHaveBeenCalledWith("sub_abc123");
});

test("treats already-cancelled error as non-fatal", async () => {
  const cancel = vi
    .fn()
    .mockRejectedValue(new Error("Subscription has already been canceled"));

  await expect(
    cancelSubscriptionIfPresent("sub_abc123", { subscriptions: { cancel } })
  ).resolves.toBeUndefined();
});

test("treats 'No such subscription' error as non-fatal", async () => {
  const cancel = vi
    .fn()
    .mockRejectedValue(new Error("No such subscription: sub_abc123"));

  await expect(
    cancelSubscriptionIfPresent("sub_abc123", { subscriptions: { cancel } })
  ).resolves.toBeUndefined();
});

test("logs unexpected Stripe errors and continues without throwing", async () => {
  const consoleError = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
  const cancel = vi.fn().mockRejectedValue(new Error("rate_limit_exceeded"));

  await expect(
    cancelSubscriptionIfPresent("sub_abc123", { subscriptions: { cancel } })
  ).resolves.toBeUndefined();
  expect(consoleError).toHaveBeenCalledOnce();
});
