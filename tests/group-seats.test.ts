import { test, expect } from "vitest";
import { tallySeats, hasFreeSeat } from "@/lib/group/seats";

test("tallies members + pending invites against the allowance", () => {
  expect(tallySeats(10, 3, 2)).toEqual({ total: 10, used: 5, available: 5 });
});

test("available never goes negative when overbooked", () => {
  expect(tallySeats(10, 9, 3)).toEqual({ total: 10, used: 12, available: 0 });
});

test("hasFreeSeat is false exactly when the group is full", () => {
  expect(hasFreeSeat(10, 9, 1)).toBe(false); // 10 used
  expect(hasFreeSeat(10, 9, 0)).toBe(true); // 9 used, 1 open
});

test("a zero/garbage allowance leaves no seats", () => {
  expect(hasFreeSeat(0, 0, 0)).toBe(false);
  expect(tallySeats(NaN as unknown as number, 1, 0).total).toBe(0);
});
