import { render, screen } from "@testing-library/react";
import { AuthForm } from "@/components/auth/AuthForm";

test("renders Google, Apple, and email options", () => {
  render(<AuthForm mode="signup" />);
  expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  expect(screen.getByText(/continue with apple/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
});
