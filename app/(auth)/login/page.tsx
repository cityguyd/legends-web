import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Welcome back — Legends Library",
  description: "Return to your saved conversations, source-backed answers, and historical debates.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
