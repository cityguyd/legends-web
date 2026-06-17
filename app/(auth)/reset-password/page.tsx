import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "New Password — Legends Library",
  description: "Set a new password for your Legends Library account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
