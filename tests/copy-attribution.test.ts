import { withAttribution } from "@/lib/chat/copyAttribution";

test("appends attribution for free tier", () => {
  expect(withAttribution("Quote text", "free"))
    .toBe("Quote text\n\n— via Legends Library, legendslibrary.ai");
});
test("anonymous also gets attribution", () => {
  expect(withAttribution("Q", "anonymous")).toContain("via Legends Library");
});
test("pro copies clean", () => {
  expect(withAttribution("Quote text", "pro")).toBe("Quote text");
});

test("pro copies clean even with figure metadata", () => {
  expect(
    withAttribution("Quote text", "pro", {
      figureName: "Jesus of Nazareth",
      citation: { title: "Matthew 5:9", year: null },
    })
  ).toBe("Quote text");
});

test("distinctive attribution names the figure and the documented source", () => {
  expect(
    withAttribution("Blessed are the peacemakers", "free", {
      figureName: "Jesus of Nazareth",
      citation: { title: "Gospel of Matthew", year: 30 },
    })
  ).toBe(
    "Blessed are the peacemakers\n\n— Jesus of Nazareth, as documented in Gospel of Matthew (30) (via Legends Library, legendslibrary.ai)"
  );
});

test("attribution names the figure even without a citation", () => {
  expect(
    withAttribution("Some line", "free", { figureName: "Martin Luther King, Jr." })
  ).toBe(
    "Some line\n\n— Martin Luther King, Jr. (via Legends Library, legendslibrary.ai)"
  );
});
