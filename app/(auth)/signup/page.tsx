import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign Up Free — Legends Library",
  description:
    "Create your free Legends Library account and start asking history's greatest minds anything.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
