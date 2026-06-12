import { render, screen } from "@testing-library/react";
import { LimitModal } from "@/components/chat/LimitModal";

test("anonymous limit modal sells free signup", () => {
  render(<LimitModal kind="anon-daily" open onClose={() => {}} />);
  expect(screen.getByText(/sign up free/i)).toBeInTheDocument();
  expect(screen.getByText(/6 questions a day/i)).toBeInTheDocument();
});
test("free limit modal sells premium at $7", () => {
  render(<LimitModal kind="free-daily" open onClose={() => {}} />);
  expect(screen.getByText(/\$7\/month/i)).toBeInTheDocument();
});
test("save cap modal blocks save and upsells", () => {
  render(<LimitModal kind="save-cap" open onClose={() => {}} />);
  expect(screen.getByText(/5 saved conversations/i)).toBeInTheDocument();
});
