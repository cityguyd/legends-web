"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

const SAFE_NEXT = /^\/(?![/\\])/;

function getNextParam(): string {
  if (typeof window === "undefined") return "/dashboard";
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("next") ?? "";
  return SAFE_NEXT.test(raw) && !raw.includes("\\") ? raw : "/dashboard";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(
    null
  );

  const siteUrl =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin)
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";

  async function handleOAuth(provider: "google" | "apple") {
    const supabase = createClient();
    setError(null);
    setMessage(null);
    setOauthLoading(provider);
    const next = getNextParam();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
    // On success the browser navigates away; no need to clear oauthLoading.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError(result.error.message);
      } else if (mode === "signup") {
        setMessage("Check your email to confirm your account before signing in.");
      } else {
        window.location.href = getNextParam();
      }
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="font-display text-3xl text-ink font-bold text-center mb-2">
        {isSignup ? "Sign Up Free" : "Welcome back"}
      </h1>
      <p className="text-center text-sm font-body text-sub mb-2">
        {isSignup
          ? "Start asking history’s greatest minds about today’s most controversial issues."
          : "Return to your saved conversations, source-backed answers, and historical debates."}
      </p>
      {isSignup && (
        <p className="text-center text-xs font-body text-sub mb-6">
          Get 6 free questions per day, source-backed answers, citations, and confidence labels.
        </p>
      )}
      {!isSignup && <div className="mb-6" />}

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={oauthLoading !== null || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface border border-border rounded-lg text-ink font-body text-sm font-medium hover:bg-card transition-colors disabled:opacity-60"
        >
          <GoogleIcon />
          {oauthLoading === "google" ? "Please wait…" : "Continue with Google"}
        </button>

        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={oauthLoading !== null || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface border border-border rounded-lg text-ink font-body text-sm font-medium hover:bg-card transition-colors disabled:opacity-60"
        >
          <AppleIcon />
          {oauthLoading === "apple" ? "Please wait…" : "Continue with Apple"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sub text-xs font-body">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email / password form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs font-body text-sub">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-2.5 px-3 bg-surface border border-border rounded-lg text-ink font-body text-sm placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-body text-sub">
              Password
            </label>
            {!isSignup && (
              /* TODO: wire real password reset flow */
              <Link
                href="/login"
                className="text-xs font-body text-gold hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            placeholder="Password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-2.5 px-3 bg-surface border border-border rounded-lg text-ink font-body text-sm placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {message && (
          <p className="text-sm font-body text-confidence-inf bg-confidence-inf-bg px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        {error && (
          <p className="text-sm font-body text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || oauthLoading !== null}
          className="w-full py-3 bg-gold text-surface font-body font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Please wait…" : isSignup ? "Create Free Account" : "Sign in"}
        </button>
      </form>

      {/* Terms line — signup only */}
      {isSignup && (
        <p className="mt-4 text-center text-xs font-body text-sub">
          By creating an account, you agree to the{" "}
          <Link href="/terms" className="text-gold hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      )}

      {/* Footer link */}
      <p className="mt-4 text-center text-xs font-body text-sub">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Legends Library?{" "}
            <Link href="/signup" className="text-gold hover:underline">
              Create a free account
            </Link>
          </>
        )}
      </p>

      {/* AI disclaimer */}
      <p className="mt-4 text-center text-xs font-body text-sub italic">
        {isSignup
          ? "AI responses are source-grounded reconstructions — not real statements from the people depicted."
          : "AI reconstructions grounded in primary sources — not real statements."}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 814 1000" aria-hidden="true">
      <path
        d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.8 30 317.5 30 234.2 30 109.4 107.7 38.8 182.5 38.8c68.7 0 116.9 44.7 157.4 44.7 38.9 0 100.7-47.4 175.7-47.4 28.3 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
        fill="currentColor"
      />
    </svg>
  );
}
