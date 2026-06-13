import Link from "next/link";
import { notFound } from "next/navigation";
import { SourceCard } from "@/components/marketing/SourceCard";
import { getFigureBySlug, getSourcesForFigure } from "@/lib/marketing/data";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const figure = await getFigureBySlug(slug);
  if (!figure) return { title: "Sources not found — Legends Library" };
  return { title: `${figure.name} — Source Library — Legends Library` };
}

export default async function FigureSourcesPage({ params }: Params) {
  const { slug } = await params;
  const figure = await getFigureBySlug(slug);
  if (!figure) notFound();

  const sources = await getSourcesForFigure(figure.id);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/sources" className="text-sm font-semibold text-gold-dark hover:underline">
        ← All source libraries
      </Link>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">
        {figure.name}
      </h1>
      <p className="mt-2 text-sub">
        The primary sources answers are grounded in. Quotes are limited to brief
        excerpts under fair use.
      </p>

      {sources.length === 0 ? (
        <p className="mt-10 rounded-xl border border-border bg-surface p-8 text-center text-sub">
          This source library is in progress. We add a figure only after their
          sources are reviewed, organized, and prepared for citation-backed
          answers.
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <li key={source.id}>
              <SourceCard source={source} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
