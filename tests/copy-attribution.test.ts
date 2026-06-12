import { withAttribution } from "@/lib/chat/copyAttribution";

test("appends attribution for free tier", () => {
  expect(withAttribution("Quote text", "free"))
    .toBe("Quote text\n\n— via Legends Library, legendslibrary.com");
});
test("anonymous also gets attribution", () => {
  expect(withAttribution("Q", "anonymous")).toContain("via Legends Library");
});
test("pro copies clean", () => {
  expect(withAttribution("Quote text", "pro")).toBe("Quote text");
});
