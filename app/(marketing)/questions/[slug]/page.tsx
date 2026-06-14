import Link from "next/link";
import { notFound } from "next/navigation";
import { TypewriterAnswer } from "@/components/chat/TypewriterAnswer";
import { shortName } from "@/components/marketing/FigureCard";
import { FIGURE_HEADERS } from "@/lib/marketing/assets";
import {
  getFeaturedQuestionBySlug,
  getFeaturedQuestions,
  getFiguresByIds,
  isLive,
  type FeaturedResponse,
  type FigureDetail,
} from "@/lib/marketing/data";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Empty at build time without DB env — pages then render on demand via ISR.
  const questions = await getFeaturedQuestions();
  return questions.map((question) => ({ slug: question.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const question = await getFeaturedQuestionBySlug(slug);
  if (!question) return { title: "Question not found — Legends Library" };
  return {
    title: `${question.question} — Legends Library`,
    description: `How history's greatest minds answer: "${question.question}" — AI reconstructions grounded in primary sources.`,
  };
}

function ResponseBlock({
  response,
  figure,
}: {
  response: FeaturedResponse;
  figure: FigureDetail | undefined;
}) {
  const name = figure?.name ?? response.figureName ?? "Unknown figure";
  const portraitUrl = figure
    ? (figure.portrait_url ?? FIGURE_HEADERS[figure.slug] ?? null)
    : null;

  return (
    <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <TypewriterAnswer
        text={response.answer}
        figureSlug={figure?.slug ?? ""}
        figureName={name}
        portraitUrl={portraitUrl}
        confidence={response.confidence}
        citationsCount={response.citations.length}
      />
    </article>
  );
}

export default async function QuestionAnalysisPage({ params }: Params) {
  const { slug } = await params;
  const question = await getFeaturedQuestionBySlug(slug);
  if (!question) notFound();

  const figures = await getFiguresByIds(question.figureIds);
  const figureById = new Map(figures.map((f) => [f.id, f]));
  const liveFigures = figures
    .filter(isLive)
    .sort(
      (a, b) =>
        question.figureIds.indexOf(a.id) - question.figureIds.indexOf(b.id)
    );

  const evidence = question.responses.flatMap((response) =>
    response.citations.map((citation) => ({
      citation,
      figureName:
        question.responses.length > 1
          ? (figureById.get(response.figureId ?? "")?.name ??
            response.figureName)
          : null,
    }))
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {/* Topic chip + question */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full border border-gold bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
          {question.format === "debate" ? "Debate" : "Analysis"}
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink">
          {question.question}
        </h1>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Responses */}
        <div className="space-y-6">
          {question.responses.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-8 text-center text-sub">
              This analysis is being prepared. Check back soon.
            </p>
          ) : (
            question.responses.map((response, i) => (
              <ResponseBlock
                key={response.figureId ?? i}
                response={response}
                figure={figureById.get(response.figureId ?? "")}
              />
            ))
          )}
        </div>

        {/* The Evidence sidebar */}
        <aside>
          <h2 className="font-display text-xl font-bold text-ink">
            The Evidence
          </h2>
          {evidence.length === 0 ? (
            <p className="mt-4 text-sm text-sub">
              No citations available for this answer.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {evidence.map(({ citation, figureName }, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <p className="text-sm font-semibold text-ink">
                    {citation.url ? (
                      <a
                        href={citation.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="underline hover:text-gold-dark"
                      >
                        {citation.title}
                      </a>
                    ) : (
                      citation.title
                    )}
                    {citation.year !== null && (
                      <span className="font-normal text-sub">
                        {" "}
                        · {citation.year}
                      </span>
                    )}
                  </p>
                  {figureName && (
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-gold-dark">
                      {figureName}
                    </p>
                  )}
                  {citation.snippet && (
                    <blockquote className="mt-2 border-l-2 border-gold/40 pl-3 text-sm italic leading-snug text-sub">
                      {citation.snippet}
                    </blockquote>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-sub">
            Quotes limited to brief excerpts under fair use.
          </p>
        </aside>
      </div>

      {/* End CTA */}
      <div className="mt-14 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">
          Have your own question?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sub">
          Ask it directly — answers grounded in primary sources, with every
          claim cited.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {liveFigures.length > 0 ? (
            liveFigures.map((figure) => (
              <Link
                key={figure.id}
                href={`/chat/${figure.slug}`}
                className="rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
              >
                Ask {shortName(figure)}
              </Link>
            ))
          ) : (
            <Link
              href="/figures"
              className="rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Browse the Figures
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
