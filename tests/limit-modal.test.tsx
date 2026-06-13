import { render, screen, fireEvent } from "@testing-library/react";
import { LimitModal } from "@/components/chat/LimitModal";

// ── Existing upsell content tests ────────────────────────────────────────────

test("anonymous limit modal sells free signup", () => {
  render(<LimitModal kind="anon-daily" open onClose={() => {}} />);
  expect(screen.getByText(/sign up free/i)).toBeInTheDocument();
  expect(screen.getByText(/6 questions a day/i)).toBeInTheDocument();
});

test("free limit modal sells premium at $5", () => {
  render(<LimitModal kind="free-daily" open onClose={() => {}} />);
  expect(screen.getByText(/\$5\/month/i)).toBeInTheDocument();
});

test("save cap modal blocks save and upsells", () => {
  render(<LimitModal kind="save-cap" open onClose={() => {}} />);
  expect(screen.getByText(/5 saved conversations/i)).toBeInTheDocument();
});

// ── New interaction tests ─────────────────────────────────────────────────────

test("notify form submit shows success state and fires onNotifySubmit with email", () => {
  const onNotifySubmit = vi.fn();
  render(
    <LimitModal
      kind="notify"
      open
      onClose={() => {}}
      onNotifySubmit={onNotifySubmit}
    />
  );

  const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: /notify me/i }));

  // Should show success copy
  expect(screen.getByText(/you're on the list/i)).toBeInTheDocument();
  // Should have called the callback with the email
  expect(onNotifySubmit).toHaveBeenCalledWith("test@example.com");
});

test("dialog close event calls onClose", () => {
  const onClose = vi.fn();
  const { container } = render(
    <LimitModal kind="anon-daily" open onClose={onClose} />
  );

  // In jsdom, native cancel/close events aren't fired by pressing Escape.
  // Simulate by dispatching a 'close' event directly on the dialog element.
  const dialog = container.querySelector("dialog");
  expect(dialog).not.toBeNull();
  fireEvent(dialog!, new Event("close"));

  expect(onClose).toHaveBeenCalled();
});

test("Maybe later button calls onClose", () => {
  const onClose = vi.fn();
  render(<LimitModal kind="anon-daily" open onClose={onClose} />);
  fireEvent.click(screen.getByRole("button", { name: /maybe later/i }));
  expect(onClose).toHaveBeenCalled();
});
