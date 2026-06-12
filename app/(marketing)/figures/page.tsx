import Link from "next/link";
import { FigureCard } from "@/components/marketing/FigureCard";
import { getFigures, type Figure } from "@/lib/marketing/data";

export const revalidate = 3600;

export const metadata = {
  title: "Figures — Legends Library",
  description:
    "Explore the great thinkers, leaders, and visionaries whose words still shape our world.",
};

type Filters = { era?: string; category?: string; region?: string };

function distinct(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort();
}

function applyFilters(figures: Figure[], filters: Filters): Figure[] {
  return figures.filter(
    (f) =>
      (!filters.era || f.era === filters.era) &&
      (!filters.region || f.region === filters.region) &&
      (!filters.category || f.category.includes(filters.category))
  );
}

function chipHref(filters: Filters, patch: Filters): string {
  const next = { ...filters, ...patch };
  const params = new URLSearchParams();
  if (next.era) params.set("era", next.era);
  if (next.category) params.set("category", next.category);
  if (next.region) params.set("region", next.region);
  const qs = params.toString();
  return qs ? `/figures?${qs}` : "/figures";
}

function FilterChips({
  label,
  values,
  active,
  filters,
  param,
}: {
  label: string;
  values: string[];
  active?: string;
  filters: Filters;
  param: keyof Filters;
}) {
  if (values.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-sub">
        {label}
      </span>
      <Link
        href={chipHref(filters, { [param]: undefined })}
        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
          !active
            ? "border-gold bg-gold text-white"
            : "border-border bg-surface text-ink hover:border-gold"
        }`}
      >
        All
      </Link>
      {values.map((value) => (
        <Link
          key={value}
          href={chipHref(filters, { [param]: value })}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            active === value
              ? "border-gold bg-gold text-white"
              : "border-border bg-surface text-ink hover:border-gold"
          }`}
        >
          {value}
        </Link>
      ))}
    </div>
  );
}

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: Filters = {
    era: typeof params.era === "string" ? params.era : undefined,
    category: typeof params.category === "string" ? params.category : undefined,
    region: typeof params.region === "string" ? params.region : undefined,
  };

  const figures = await getFigures();
  const filtered = applyFilters(figures, filters);

  const eras = distinct(figures.map((f) => f.era));
  const regions = distinct(figures.map((f) => f.region));
  const categories = distinct(figures.flatMap((f) => f.category));

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="font-display text-5xl font-bold text-ink">
            Meet the Minds
          </h1>
          <p className="mt-3 font-display text-lg italic text-gold-dark">
            The voices of history, ready for today.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-sub">
            Explore the great thinkers, leaders, and visionaries whose words
            still shape our world. Ask them anything. Backed by primary
            sources.
          </p>
        </div>
      </section>

      {/* Filters + roster */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-3">
          <FilterChips
            label="Era"
            values={eras}
            active={filters.era}
            filters={filters}
            param="era"
          />
          <FilterChips
            label="Category"
            values={categories}
            active={filters.category}
            filters={filters}
            param="category"
          />
          <FilterChips
            label="Region"
            values={regions}
            active={filters.region}
            filters={filters}
            param="region"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-surface p-10 text-center text-sub">
            {figures.length === 0
              ? "The library is being stocked. New figures arrive soon."
              : "No figures match those filters yet."}
          </p>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((figure) => (
              <li key={figure.slug}>
                <FigureCard
                  figure={{
                    slug: figure.slug,
                    name: figure.name,
                    tagline: figure.tagline,
                    era: figure.era,
                    categories: figure.category,
                    wave: figure.wave,
                    portraitUrl: figure.portrait_url,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Verified sources strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">
            All Figures. Verified Sources.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sub">
            Every answer comes from primary sources — letters, speeches, books,
            and writings from the figure themselves. No opinions added. Just
            history, in their own words.
          </p>
          <Link
            href="/how-it-works"
            className="mt-5 inline-block text-sm font-semibold text-gold-dark hover:underline"
          >
            How It Works →
          </Link>
        </div>
      </section>
    </>
  );
}
