import type React from "react";
import Link from "next/link";
import { getFeaturedQuestions } from "@/lib/marketing/data";

export const revalidate = 3600;

export const metadata = {
  title: "Hot Questions",
  description:
    "Browse source-grounded answers to history's hottest questions — citations and confidence labels included.",
  openGraph: {
    title: 'Hot Questions — Legends Library',
    url: '/questions',
  },
  twitter: { title: 'Hot Questions — Legends Library' },
};

const TOPIC_ICONS: Record<string, React.ReactElement> = {
  Politics: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5 6.5 5 8 2z" stroke="#D59E3C" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  Economics: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="#D59E3C" strokeWidth="1.2"/>
      <path d="M8 4.5v7M6 6.5c0-1 1-1.5 2-1.5s2 .5 2 1.5-1 1.5-2 1.5-2 .5-2 1.5 1 1.5 2 1.5 2-.5 2-1.5" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  "War & Peace": (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <path d="M3 13L13 3M10 3h3v3" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="5" cy="11" r="2" stroke="#D59E3C" strokeWidth="1.2"/>
    </svg>
  ),
  "Civil Rights": (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <path d="M8 2v12M4 6l4-4 4 4" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 10h8" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Philosophy: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <circle cx="8" cy="6" r="3" stroke="#D59E3C" strokeWidth="1.2"/>
      <path d="M8 9v5M5.5 14h5" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Science: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <path d="M6 2v5L3 13h10L10 7V2" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 2h4" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="7" cy="11" r="0.5" fill="#D59E3C"/>
      <circle cx="10" cy="11" r="0.5" fill="#D59E3C"/>
    </svg>
  ),
  Religion: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <path d="M8 2v12M5 6h6" stroke="#D59E3C" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Leadership: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4" aria-hidden="true">
      <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4L8 2z" stroke="#D59E3C" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
};

export default async function HotQuestionsPage() {
  const questions = await getFeaturedQuestions();

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[360px] items-start justify-center"
        style={{
          backgroundImage: `url('/images/questions-hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="relative mx-auto max-w-3xl px-6 pt-10 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white drop-shadow-lg md:text-5xl [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            Hot Questions
          </h1>
          <p className="text-lg text-white drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            The questions history's greatest minds would find most compelling.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8 flex flex-wrap gap-2">
          {Object.entries(TOPIC_ICONS).map(([label, icon]) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>

        {questions.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border bg-surface p-10 text-center">
            <p className="text-sub">
              Fresh hot takes are being prepared. In the meantime, put a figure on
              the spot yourself.
            </p>
            <Link
              href="/figures"
              className="mt-6 inline-block rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Ask a Bold Question →
            </Link>
          </div>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {questions.map((q) => (
              <li
                key={q.slug}
                className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm"
              >
                <Link
                  href={`/questions/${q.slug}`}
                  className="font-display text-xl font-bold leading-snug text-ink hover:underline"
                >
                  {q.question}
                </Link>
                {q.figure_name && (
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gold-dark">
                    {q.figure_name}
                  </p>
                )}
                <div className="mt-auto pt-4">
                  <Link
                    href={`/questions/${q.slug}`}
                    className="text-sm font-semibold text-gold-dark hover:underline"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    View Analysis →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

