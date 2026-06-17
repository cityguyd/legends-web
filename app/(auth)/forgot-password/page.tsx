import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Legends Library",
  description: "Reset your Legends Library account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
