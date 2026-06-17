import Link from "next/link";
import { getFigures, isLive } from "@/lib/marketing/data";

export const revalidate = 3600;

export const metadata = {
  title: "Sources",
  description:
    "Every figure is built from a source library: speeches, letters, books, interviews, and verified writings.",
  openGraph: {
    title: 'Sources — Legends Library',
    url: '/sources',
  },
  twitter: { title: 'Sources — Legends Library' },
};

export default async function SourcesIndexPage() {
  const figures = await getFigures();

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold text-ink">
          All Figures. Cold Sources.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-sub">
          Every figure in Legends Library is built from a source library:
          speeches, letters, books, interviews, and verified writings. Ask the
          bold question — then check the receipts.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map((figure) => (
          <li key={figure.slug}>
            <Link
              href={`/sources/${figure.slug}`}
              className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-gold"
            >
              <span className="font-display text-lg font-bold text-ink">
                {figure.name}
              </span>
              {figure.era && (
                <span className="mt-0.5 text-sm text-gold-dark">{figure.era}</span>
              )}
              <span className="mt-auto pt-4 text-sm font-semibold text-gold-dark">
                {isLive(figure) ? "View Sources →" : "Library in progress →"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
