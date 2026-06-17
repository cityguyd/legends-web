import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductHeader } from "@/components/product/ProductHeader";
import { GroupManager } from "@/components/product/GroupManager";
import { createClient } from "@/lib/supabase/server";
import { claimGroupInvites } from "@/lib/actions/group";
import { getGroupAdminView } from "@/lib/group/data";

export const metadata = { title: "Group — Legends Library" };
export const dynamic = "force-dynamic";

export default async function GroupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/group");

  // A newly-invited member claims their seat on first authenticated load.
  await claimGroupInvites();

  const view = await getGroupAdminView();

  return (
    <div className="min-h-screen bg-bg text-ink">
      <ProductHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-ink">Your group</h1>
        <p className="mt-1 text-sm text-sub">
          Manage seats for your organization — invite teammates by email and
          they get unlimited access on your plan.
        </p>

        <div className="mt-6">
          {view ? (
            <GroupManager view={view} />
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="font-display text-lg font-bold text-ink">
                You&apos;re not managing a group
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-sub">
                Group and Institution plans cover a whole team, church, or
                classroom. If you were invited, your seat is now active — head to
                your account to start asking. To set up a group plan, get in
                touch.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/account"
                  className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-gold"
                >
                  Go to account
                </Link>
                <a
                  href="mailto:support@legendslibrary.ai?subject=Group%20plan"
                  className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
                >
                  Set up a group plan
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
