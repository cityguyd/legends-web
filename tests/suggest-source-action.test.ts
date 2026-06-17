import { test, expect, beforeEach, vi } from "vitest";

// Hoisted so the vi.mock factory can reference these safely.
const { fromMock, insert, maybeSingle } = vi.hoisted(() => {
  const insert = vi.fn();
  const maybeSingle = vi.fn();
  const fromMock = vi.fn((table: string) => {
    if (table === "figures") {
      return { select: () => ({ eq: () => ({ maybeSingle }) }) };
    }
    if (table === "source_suggestions") {
      return { insert };
    }
    throw new Error(`unexpected table: ${table}`);
  });
  return { fromMock, insert, maybeSingle };
});

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: fromMock }),
}));

import { suggestSource } from "@/lib/actions/suggestSource";

beforeEach(() => {
  fromMock.mockClear();
  insert.mockReset();
  maybeSingle.mockReset();
});

test("persists a suggestion with the resolved figure id and normalized email", async () => {
  maybeSingle.mockResolvedValue({ data: { id: "fig-123" }, error: null });
  insert.mockResolvedValue({ error: null });

  await suggestSource(
    "jesus-of-nazareth",
    "What did Jesus say about quantum physics?",
    "  https://example.com/source  ",
    "  Fan@Example.com "
  );

  expect(insert).toHaveBeenCalledWith({
    figure_id: "fig-123",
    figure_slug: "jesus-of-nazareth",
    question: "What did Jesus say about quantum physics?",
    suggested_source: "https://example.com/source",
    email: "fan@example.com",
  });
});

test("stores a null email when none is provided", async () => {
  maybeSingle.mockResolvedValue({ data: { id: "fig-1" }, error: null });
  insert.mockResolvedValue({ error: null });

  await suggestSource("mlk", "Q?", "A book I read");

  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({ email: null, suggested_source: "A book I read" })
  );
});

test("rejects an empty source before touching the database", async () => {
  await expect(suggestSource("mlk", "Q?", "   ")).rejects.toThrow(/source/i);
  expect(fromMock).not.toHaveBeenCalled();
});

test("rejects a malformed email before touching the database", async () => {
  await expect(
    suggestSource("mlk", "Q?", "https://x", "not-an-email")
  ).rejects.toThrow(/valid email/i);
  expect(fromMock).not.toHaveBeenCalled();
});

test("still records the suggestion when the figure is unknown (figure_id null)", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: null });
  insert.mockResolvedValue({ error: null });

  await suggestSource("nobody", "Q?", "https://x");

  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({ figure_id: null, figure_slug: "nobody" })
  );
});

test("surfaces an insert failure", async () => {
  maybeSingle.mockResolvedValue({ data: { id: "fig-1" }, error: null });
  insert.mockResolvedValue({ error: { message: "boom" } });

  await expect(suggestSource("mlk", "Q?", "https://x")).rejects.toThrow(
    /could not record/i
  );
});
