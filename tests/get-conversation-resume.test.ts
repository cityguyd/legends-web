import { test, expect, vi, beforeEach } from "vitest";

const { getUser, fromMock } = vi.hoisted(() => ({
  getUser: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser }, from: fromMock }),
}));

import { getConversationForResume } from "@/lib/actions/conversations";

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
});

function wireTables(opts: {
  conv: Record<string, unknown> | null;
  figure?: { slug: string; name: string } | null;
  messages?: Array<Record<string, unknown>>;
}) {
  fromMock.mockImplementation((table: string) => {
    if (table === "conversations") {
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: opts.conv }) }) }) };
    }
    if (table === "figures") {
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: opts.figure ?? null }) }) }) };
    }
    if (table === "messages") {
      return { select: () => ({ eq: () => ({ order: async () => ({ data: opts.messages ?? [] }) }) }) };
    }
    throw new Error(`unexpected table: ${table}`);
  });
}

test("returns figure slug + mapped messages for the owner", async () => {
  wireTables({
    conv: { id: "conv-1", figure_id: "fig-1", user_id: "user-1" },
    figure: { slug: "martin-luther-king", name: "Martin Luther King, Jr." },
    messages: [
      { role: "user", text: "What about economic inequality?", citations: null, confidence: null },
      { role: "figure", text: "He tied poverty to justice.", citations: [], confidence: "inferred" },
    ],
  });
  const result = await getConversationForResume("conv-1");
  expect(result.kind).toBe("ok");
  if (result.kind === "ok") {
    expect(result.data.figureSlug).toBe("martin-luther-king");
    expect(result.data.conversationId).toBe("conv-1");
    expect(result.data.messages[0]).toMatchObject({
      role: "user", text: "What about economic inequality?",
    });
    expect(result.data.messages[1]).toMatchObject({ role: "figure", confidence: "inferred" });
  }
});

test("not_found when the conversation belongs to someone else", async () => {
  wireTables({ conv: { id: "conv-1", figure_id: "fig-1", user_id: "someone-else" } });
  expect((await getConversationForResume("conv-1")).kind).toBe("not_found");
});

test("unauthorized when signed out", async () => {
  getUser.mockResolvedValue({ data: { user: null } });
  expect((await getConversationForResume("conv-1")).kind).toBe("unauthorized");
});
