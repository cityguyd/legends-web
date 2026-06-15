import { test, expect, beforeEach, vi } from "vitest";

// Hoisted so the vi.mock factory can reference these safely.
const { fromMock, upsert, maybeSingle } = vi.hoisted(() => {
  const upsert = vi.fn();
  const maybeSingle = vi.fn();
  const fromMock = vi.fn((table: string) => {
    if (table === "figures") {
      return { select: () => ({ eq: () => ({ maybeSingle }) }) };
    }
    if (table === "notify_signups") {
      return { upsert };
    }
    throw new Error(`unexpected table: ${table}`);
  });
  return { fromMock, upsert, maybeSingle };
});

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: fromMock }),
}));

import { notifyMe } from "@/lib/actions/notify";

beforeEach(() => {
  fromMock.mockClear();
  upsert.mockReset();
  maybeSingle.mockReset();
});

test("persists the signup for a known figure (normalizing the email)", async () => {
  maybeSingle.mockResolvedValue({ data: { id: "fig-123" }, error: null });
  upsert.mockResolvedValue({ error: null });

  await notifyMe("abraham-lincoln", "  Fan@Example.com ");

  expect(upsert).toHaveBeenCalledWith(
    { email: "fan@example.com", figure_id: "fig-123" },
    { onConflict: "email,figure_id", ignoreDuplicates: true }
  );
});

test("rejects an invalid email before touching the database", async () => {
  await expect(notifyMe("abraham-lincoln", "not-an-email")).rejects.toThrow(
    /valid email/i
  );
  expect(fromMock).not.toHaveBeenCalled();
});

test("throws for an unknown figure and never inserts", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: null });
  await expect(notifyMe("nobody", "a@b.com")).rejects.toThrow(/unknown figure/i);
  expect(upsert).not.toHaveBeenCalled();
});

test("surfaces an insert failure", async () => {
  maybeSingle.mockResolvedValue({ data: { id: "fig-123" }, error: null });
  upsert.mockResolvedValue({ error: { message: "boom" } });
  await expect(notifyMe("abraham-lincoln", "a@b.com")).rejects.toThrow(
    /could not record/i
  );
});
