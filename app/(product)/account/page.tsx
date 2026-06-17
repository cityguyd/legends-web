import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";
import { ProductHeader } from "@/components/product/ProductHeader";
import { refreshSubscriptionStatus } from "@/lib/actions/account";
import { claimGroupInvites } from "@/lib/actions/group";
import { FREE_SAVE_CAP } from "@/lib/conversations/shared";
import { createClient } from "@/lib/supabase/server";

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Premium",
  group: "Group",
  institution: "Institution",
};

export const metadata = {
  title: "Account — Legends Library",
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Proxy already guards /account — this is defense in depth.
  if (!user) redirect("/login?next=/account");

  // If this user was invited to a group, attach their seat on first visit.
  await claimGroupInvites();

  const [{ data: profile }, { count: savedCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, tier, created_at, group_role")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const tier = typeof profile?.tier === "string" ? profile.tier : "free";
  const isOrg = tier === "group" || tier === "institution";
  const isGroupAdmin = isOrg && profile?.group_role === "admin";
  // "Premium-equivalent" access: unlimited usage + premium perks.
  const isPro = tier === "pro" || isOrg;
  const email = user.email ?? "";
  const displayName =
    (typeof profile?.display_name === "string" &&
      profile.display_name.trim()) ||
    email.split("@")[0] ||
    "Legend";
  const avatarUrl =
    typeof profile?.avatar_url === "string" && profile.avatar_url
      ? profile.avatar_url
      : null;
  const memberSince =
    typeof profile?.created_at === "string"
      ? new Date(profile.created_at).toLocaleDateString()
      : null;
  const saved = savedCount ?? 0;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <ProductHeader />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-ink">Account</h1>

        <div className="mt-6 flex flex-col gap-5">
          {/* Profile */}
          <SectionCard title="Profile">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/40 bg-card">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="size-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="font-display text-xl text-gold"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-ink">
                  {displayName}
                </p>
                <p className="truncate text-sm text-sub">{email}</p>
                {memberSince && (
                  <p className="mt-0.5 text-xs text-sub">
                    Member since {memberSince}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Plan */}
          <SectionCard title="Plan">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    isPro
                      ? "bg-gold text-white"
                      : "border border-border bg-card text-sub"
                  }`}
                >
                  {TIER_LABEL[tier] ?? "Free"}
                </span>
                <p className="mt-2 text-sm text-sub">
                  {isOrg
                    ? isGroupAdmin
                      ? "You manage this organization plan — every seat gets unlimited access."
                      : "Your seat is on an organization plan — unlimited questions (fair use)."
                    : isPro
                      ? "Unlimited questions (fair use), unlimited saves, clean copy, and PDF export."
                      : "6 questions a day and up to 5 saved conversations."}
                </p>
              </div>
              {isGroupAdmin ? (
                <Link
                  href="/group"
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
                >
                  Manage group →
                </Link>
              ) : isOrg ? null : isPro ? (
                <a
                  href="/api/stripe/portal"
                  className="rounded-lg border border-gold px-4 py-2 text-sm font-semibold text-gold-dark transition-colors hover:bg-card"
                >
                  Manage Subscription
                </a>
              ) : (
                <a
                  href="/api/stripe/checkout"
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
                >
                  Go Premium — $5/month
                </a>
              )}
            </div>
            {/* Escape hatch: webhooks can lag right after checkout. */}
            <form action={refreshSubscriptionStatus} className="mt-4">
              <button
                type="submit"
                className="text-xs font-medium text-sub underline-offset-2 hover:text-ink hover:underline"
              >
                Just upgraded? Refresh subscription status
              </button>
            </form>
          </SectionCard>

          {/* Usage */}
          <SectionCard title="Usage">
            <p className="text-sm text-sub">
              <span className="font-display text-2xl font-bold text-ink">
                {saved}
              </span>{" "}
              saved conversation{saved === 1 ? "" : "s"}
              {!isPro && ` of ${FREE_SAVE_CAP} free slots`}
            </p>
            <Link
              href="/conversations"
              className="mt-2 inline-block text-sm font-semibold text-gold-dark hover:underline"
            >
              View conversations →
            </Link>
          </SectionCard>

          {/* Data & account */}
          <SectionCard title="Your data">
            <div className="flex flex-col items-start gap-4">
              <a
                href="/conversations/export"
                download
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-gold"
              >
                Export all conversations (JSON)
              </a>
              <DeleteAccountButton />
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
