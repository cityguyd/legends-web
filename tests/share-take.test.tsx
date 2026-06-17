import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, test, expect, beforeEach } from "vitest";
import { ShareTake } from "@/components/marketing/ShareTake";

beforeEach(() => {
  vi.restoreAllMocks();
});

test("renders the three share controls", () => {
  render(<ShareTake question="Would MLK condemn riots?" figureName="MLK" />);
  expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /download image/i })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /share on x/i })).toBeInTheDocument();
});

test("'Share on X' points at the tweet intent with the question and current url", () => {
  render(<ShareTake question="Would MLK condemn riots?" figureName="MLK" />);
  const link = screen.getByRole("link", { name: /share on x/i });
  const href = link.getAttribute("href") ?? "";
  expect(href).toContain("twitter.com/intent/tweet");
  expect(href).toContain(encodeURIComponent("Would MLK condemn riots?"));
  // current url (jsdom default origin) is included as the share target
  expect(href).toContain(encodeURIComponent(window.location.href));
});

test("'Copy link' writes the current url to the clipboard", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });

  render(<ShareTake question="Q?" />);
  fireEvent.click(screen.getByRole("button", { name: /copy link/i }));

  await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
  expect(await screen.findByText(/link copied/i)).toBeInTheDocument();
});
