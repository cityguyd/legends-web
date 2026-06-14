import { ComingSoon } from "@/components/marketing/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debates | Legends Library",
  description: "Watch history's greatest minds debate the issues that shaped civilization.",
};

export default function DebatesPage() {
  return (
    <main>
      <section
        className="relative flex min-h-[360px] items-start justify-center"
        style={{
          backgroundImage: `url('/images/debates-hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="relative mx-auto max-w-3xl px-6 pt-10 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white drop-shadow-lg md:text-5xl [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            Debates
          </h1>
          <p className="text-lg text-white drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Two great minds. One question. An argument for the ages.
          </p>
        </div>
      </section>
      <ComingSoon feature="Debate Mode" />
    </main>
  );
}

