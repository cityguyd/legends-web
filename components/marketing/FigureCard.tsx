import Image from "next/image";
import Link from "next/link";
import { isLive } from "@/lib/marketing/data";
import { NotifyButton } from "./NotifyButton";

export interface FigureCardFigure {
  slug: string;
  name: string;
  tagline: string | null;
  era: string | null;
  categories: string[];
  wave: number;
  portraitUrl?: string | null;
  shortName?: string | null;
}

/**
 * Derives a short conversational name for the "Ask {name}" CTA.
 * Fallback chain: explicit shortName -> initials when the suffix-stripped
 * name has 3+ capitalized words -> first word.
 * "Martin Luther King, Jr." -> "MLK", "Jesus of Nazareth" -> "Jesus".
 */
export function shortName(figure: Pick<FigureCardFigure, "name" | "shortName">): string {
  if (figure.shortName) return figure.shortName;
  const cleaned = figure.name.replace(/,?\s+(Jr|Sr)\.?$/i, "").trim();
  const capitalized = cleaned.split(/\s+/).filter((w) => /^[A-Z]/.test(w));
  if (capitalized.length >= 3) {
    return capitalized.map((w) => w[0]).join("");
  }
  return cleaned.split(/\s+/)[0];
}

export function FigureCard({ figure }: { figure: FigureCardFigure }) {
  const live = isLive(figure);
  const isHeaderImage = figure.portraitUrl?.startsWith("/images/figures/") ?? false;

  return (
    <article className="relative flex h-full w-full flex-col rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
      {!live && (
        <span className="absolute right-3 top-3 rounded-full bg-bubble px-2.5 py-0.5 text-xs font-medium text-sub">
          Coming Soon
        </span>
      )}

      {figure.portraitUrl ? (
        <div className="mx-auto mb-4 size-28 overflow-hidden rounded-full border-2 border-gold/40 bg-card">
          <Image
            src={figure.portraitUrl}
            alt={`Portrait of ${figure.name}`}
            width={112}
            height={112}
            className={`size-full object-cover object-top${live ? "" : " opacity-60 grayscale"}`}
          />
        </div>
      ) : (
        <div className="mx-auto mb-4 size-28 overflow-hidden rounded-full border-2 border-gold/40 bg-card">
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center font-display text-2xl text-gold"
          >
            {figure.name.charAt(0)}
          </span>
        </div>
      )}

      <h3 className="font-display text-lg font-bold text-ink">{figure.name}</h3>
      {figure.era && <p className="mt-0.5 text-sm text-gold-dark">{figure.era}</p>}
      {figure.tagline && (
        <p className="mt-2 text-sm leading-snug text-sub">{figure.tagline}</p>
      )}

      {figure.categories.length > 0 && (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
          {figure.categories.map((category) => (
            <li
              key={category}
              className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-sub"
            >
              {category}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4 flex flex-col gap-2">
        {live ? (
          <Link
            href={`/chat/${figure.slug}`}
            className="inline-block w-full rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark text-center"
          >
            Ask {shortName(figure)}
          </Link>
        ) : (
          <NotifyButton figureSlug={figure.slug} />
        )}
        <Link
          href={`/figures/${figure.slug}`}
          className="inline-block w-full rounded-lg border border-border bg-surface px-4 py-1.5 text-xs font-medium text-sub transition-colors hover:border-gold hover:text-ink text-center"
        >
          More Info
        </Link>
      </div>
    </article>
  );
}
