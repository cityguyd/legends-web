import { test, expect, vi, beforeEach } from "vitest";

// Shared, mutable mock state lives inside the hoisted block so both the mock
// factories and the tests reference the same object.
const h = vi.hoisted(() => {
  const state = {
    user: { id: "admin-1", email: "a@org.com" } as { id: string; email?: string } | null,
    profile: null as Record<string, unknown> | null,
    memberCount: 0,
    pendingCount: 0,
  };
  const getUser = vi.fn(async () => ({ data: { user: state.user } }));
  const upsert = vi.fn(async () => ({ error: null }));
  const fromMock = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: (_cols: string, opts?: { head?: boolean; count?: string }) =>
          opts?.head
            ? { eq: () => Promise.resolve({ count: state.memberCount }) }
            : {
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: state.profile }),
                }),
              },
      };
    }
    if (table === "group_invites") {
      return {
        select: () => ({
          eq: () => ({ is: () => Promise.resolve({ count: state.pendingCount }) }),
        }),
        upsert,
      };
    }
    throw new Error(`unexpected table: ${table}`);
  });
  return { state, getUser, upsert, fromMock };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: h.getUser } }),
}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: h.fromMock }),
}));

import { inviteToGroup } from "@/lib/actions/group";

const ADMIN = { id: "admin-1", group_id: "admin-1", group_role: "admin", seat_count: 10, tier: "group" };

beforeEach(() => {
  h.state.user = { id: "admin-1", email: "a@org.com" };
  h.state.profile = { ...ADMIN };
  h.state.memberCount = 3;
  h.state.pendingCount = 2;
  h.upsert.mockClear();
  h.upsert.mockResolvedValue({ error: null });
});

test("invites a member when a seat is available", async () => {
  await inviteToGroup("  New@Member.com ");
  expect(h.upsert).toHaveBeenCalledWith(
    { group_id: "admin-1", email: "new@member.com" },
    { onConflict: "group_id,email", ignoreDuplicates: true }
  );
});

test("rejects an invite when all seats are used", async () => {
  h.state.memberCount = 8;
  h.state.pendingCount = 2; // 10 used / 10 seats
  await expect(inviteToGroup("x@y.com")).rejects.toThrow(/no seats/i);
  expect(h.upsert).not.toHaveBeenCalled();
});

test("rejects an invalid email before any DB work", async () => {
  await expect(inviteToGroup("not-an-email")).rejects.toThrow(/valid email/i);
  expect(h.upsert).not.toHaveBeenCalled();
});

test("rejects when the caller is not a group admin", async () => {
  h.state.profile = { id: "u-2", group_id: "g-1", group_role: "member", tier: "group" };
  await expect(inviteToGroup("x@y.com")).rejects.toThrow(/group admin/i);
  expect(h.upsert).not.toHaveBeenCalled();
});
