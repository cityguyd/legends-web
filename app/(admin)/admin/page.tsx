import { createServiceClient } from "@/lib/supabase/service";
import { setFigureLive, setQuestionPublished } from "@/lib/actions/admin";
import { ProvisionGroupForm } from "@/components/admin/ProvisionGroupForm";
import { FEATURED_CARDS } from "@/lib/marketing/homeCards";

export const metadata = { title: "Admin — Legends Library" };

// Revalidate on every request (admin page — no caching needed)
export const dynamic = "force-dynamic";

function Badge({ children, variant }: { children: React.ReactNode; variant: "green" | "amber" }) {
  const cls =
    variant === "green"
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-amber-100 text-amber-700 border border-amber-200";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold text-ink border-b border-border pb-1 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function AdminPage() {
  const db = createServiceClient();

  // Fetch figures
  const { data: figures } = await db
    .from("figures")
    .select("id, name, slug, wave, min_corpus_ok")
    .order("wave", { ascending: true })
    .order("name", { ascending: true });

  // Fetch notify signups count per figure
  const { data: signupRows } = await db
    .from("notify_signups")
    .select("figure_id");

  // Aggregate counts
  const signupCounts: Record<string, number> = {};
  (signupRows ?? []).forEach((row: { figure_id: string }) => {
    signupCounts[row.figure_id] = (signupCounts[row.figure_id] ?? 0) + 1;
  });

  // Build figure lookup for signups table
  const figureMap: Record<string, { name: string; slug: string }> = {};
  (figures ?? []).forEach((f) => {
    figureMap[f.id] = { name: f.name, slug: f.slug };
  });

  // Sorted signup list
  const signupList = Object.entries(signupCounts)
    .map(([figureId, count]) => ({
      figureId,
      name: figureMap[figureId]?.name ?? figureId,
      slug: figureMap[figureId]?.slug ?? "",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // Fetch featured questions
  const { data: questions } = await db
    .from("featured_questions")
    .select("slug, question, published")
    .order("published", { ascending: false })
    .order("slug", { ascending: true });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Admin Dashboard</h1>

      {/* Section 1: Figures */}
      <Section title="Figures">
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-card text-sub">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Slug</th>
                <th className="px-4 py-2 text-center font-semibold">Wave</th>
                <th className="px-4 py-2 text-center font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(figures ?? []).map((figure) => (
                <tr key={figure.id} className="hover:bg-card/50">
                  <td className="px-4 py-2 font-medium text-ink">{figure.name}</td>
                  <td className="px-4 py-2 text-sub font-mono text-xs">{figure.slug}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="rounded bg-card px-2 py-0.5 text-xs font-medium text-sub border border-border">
                      W{figure.wave ?? "?"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {figure.min_corpus_ok ? (
                      <Badge variant="green">Live ✓</Badge>
                    ) : (
                      <Badge variant="amber">Corpus pending</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await setFigureLive(figure.id, true);
                        }}
                      >
                        <button
                          type="submit"
                          disabled={!!figure.min_corpus_ok}
                          className="rounded bg-gold px-3 py-1 text-xs font-semibold text-white hover:bg-gold-dark disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Set Live
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await setFigureLive(figure.id, false);
                        }}
                      >
                        <button
                          type="submit"
                          disabled={!figure.min_corpus_ok}
                          className="rounded border border-border px-3 py-1 text-xs font-semibold text-sub hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Set Pending
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {!figures?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sub text-sm">
                    No figures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section 2: Notify Signups */}
      <Section title="Notify Signups">
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-card text-sub">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Figure</th>
                <th className="px-4 py-2 text-left font-semibold">Slug</th>
                <th className="px-4 py-2 text-right font-semibold">Signups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {signupList.map((row) => (
                <tr key={row.figureId} className="hover:bg-card/50">
                  <td className="px-4 py-2 font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-sub">{row.slug}</td>
                  <td className="px-4 py-2 text-right font-semibold text-ink">{row.count}</td>
                </tr>
              ))}
              {!signupList.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sub text-sm">
                    No signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section 3: Featured Questions */}
      <Section title="Featured Questions">
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-card text-sub">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Slug</th>
                <th className="px-4 py-2 text-left font-semibold">Question</th>
                <th className="px-4 py-2 text-center font-semibold">Published</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(questions ?? []).map((q) => (
                <tr key={q.slug} className="hover:bg-card/50">
                  <td className="px-4 py-2 font-mono text-xs text-sub">{q.slug}</td>
                  <td className="px-4 py-2 text-ink max-w-sm truncate" title={q.question}>
                    {q.question}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {q.published ? (
                      <Badge variant="green">Yes</Badge>
                    ) : (
                      <Badge variant="amber">No</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <form
                      action={async () => {
                        "use server";
                        await setQuestionPublished(q.slug, !q.published);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded border border-border px-3 py-1 text-xs font-semibold text-sub hover:bg-card"
                      >
                        {q.published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!questions?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sub text-sm">
                    No featured questions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section: Group / Institution provisioning */}
      <Section title="Group / Institution Plans">
        <p className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-sub">
          The &quot;email to close&quot; path. Grant an existing account a Group
          (10 seats) or Institution (50 seats) plan; they become the group admin
          and manage seats at{" "}
          <code className="font-mono text-xs bg-surface border border-border rounded px-1 py-0.5">
            /group
          </code>
          .
        </p>
        <div className="rounded-xl border border-border bg-surface p-4">
          <ProvisionGroupForm />
        </div>
      </Section>

      {/* Section 4: Homepage Featured Cards (informational) */}
      <Section title="Homepage Featured Cards">
        <p className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-sub">
          Featured cards are managed in{" "}
          <code className="font-mono text-xs bg-surface border border-border rounded px-1 py-0.5">
            lib/marketing/homeCards.ts
          </code>
          . Update the <code className="font-mono text-xs">live</code> field and redeploy to promote a figure.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-card text-sub">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Figure Slug</th>
                <th className="px-4 py-2 text-left font-semibold">Question</th>
                <th className="px-4 py-2 text-center font-semibold">Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {FEATURED_CARDS.map((card) => (
                <tr key={card.figureSlug} className="hover:bg-card/50">
                  <td className="px-4 py-2 font-mono text-xs text-sub">{card.figureSlug}</td>
                  <td className="px-4 py-2 text-ink max-w-sm truncate" title={card.question}>
                    {card.question}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {card.live ? (
                      <Badge variant="green">Live</Badge>
                    ) : (
                      <Badge variant="amber">Pending</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </main>
  );
}
