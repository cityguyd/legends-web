import { test, expect } from "vitest";
import { applyEvent, makeChatState } from "@/lib/chat/chatReducer";

test("done event with truncated=true sets accumulator.truncated", () => {
  const state = makeChatState();
  const next = applyEvent(state, { type: "done", data: { truncated: true } });
  expect(next.readyToReveal).toBe(true);
  expect(next.truncated).toBe(true);
});

test("done event without truncated defaults to false", () => {
  const state = makeChatState();
  const next = applyEvent(state, { type: "done", data: {} });
  expect(next.truncated).toBe(false);
});
