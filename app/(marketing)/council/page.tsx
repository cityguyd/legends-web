import { ComingSoon } from "@/components/marketing/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Council | Legends Library",
  description: "Convene a council of historical minds to deliberate any question.",
};

export default function CouncilPage() {
  return (
    <main>
      <section
        className="relative flex min-h-[360px] items-start justify-center"
        style={{
          backgroundImage: `url('/images/council-hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="relative mx-auto max-w-3xl px-6 pt-10 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white drop-shadow-lg md:text-5xl [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            Historical Council
          </h1>
          <p className="text-lg text-white drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Convene five minds from across history to deliberate your most important questions.
          </p>
        </div>
      </section>
      <ComingSoon feature="Historical Council Mode" />
    </main>
  );
}

