import { render, screen, fireEvent } from "@testing-library/react";
import { StatusNotice } from "@/components/chat/StatusNotice";
import { vi } from "vitest";

const noop = () => {};

test.each(["idle", "consulting", "typing", "complete"] as const)(
  "renders nothing for status '%s'",
  (status) => {
    const { container } = render(<StatusNotice status={status} onRetry={noop} />);
    expect(container.firstChild).toBeNull();
  }
);

test("error branch shows 'Try again' button and fires retry callback", () => {
  const retry = vi.fn();
  render(<StatusNotice status="error" onRetry={retry} />);
  expect(screen.getByRole("alert")).toBeInTheDocument();
  const btn = screen.getByRole("button", { name: /try again/i });
  fireEvent.click(btn);
  expect(retry).toHaveBeenCalledTimes(1);
});

test("limited status renders nothing (LimitModal owns that moment)", () => {
  const { container } = render(
    <StatusNotice
      status={{ kind: "limited", detail: "You have used all 5 free questions." }}
      onRetry={noop}
    />
  );
  expect(container.firstChild).toBeNull();
});

test("blocked status shows message", () => {
  render(
    <StatusNotice
      status={{ kind: "blocked", message: "Library not ready yet." }}
      onRetry={noop}
    />
  );
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByText("Library not ready yet.")).toBeInTheDocument();
});
