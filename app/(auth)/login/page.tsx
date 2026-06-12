import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — Legends Library",
  description: "Sign in to your Legends Library account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
