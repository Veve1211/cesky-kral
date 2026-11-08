import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Zap } from "lucide-react";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Quiz } from "@/components/quiz";
import { QUICK_ROUND_QUESTIONS } from "@/lib/game-rules";
import { getRandomQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Rychlovka",
};

export default function QuickRoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-navy px-6 py-8 text-center text-parchment shadow-xl ring-2 ring-gold">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
        <CardCorners className="m-1 size-9 text-gold" />
        <span className="gilt flex size-12 items-center justify-center rounded-full text-navy shadow-md">
          <Zap className="size-6" aria-hidden />
        </span>
        <h1 className="text-5xl font-bold">Rychlovka</h1>
        <OrnamentDivider />
        <p className="max-w-sm text-parchment/85">
          {QUICK_ROUND_QUESTIONS} náhodných otázek napříč všemi králi. Kolik jich
          dáš? Do sbírky se nepočítá, jde jen o skóre.
        </p>
      </header>

      <Suspense
        fallback={<div className="parchment h-80 animate-pulse rounded-2xl" />}
      >
        <QuickRound />
      </Suspense>
    </div>
  );
}

async function QuickRound() {
  await connection();
  const questions = await getRandomQuestions(QUICK_ROUND_QUESTIONS);
  return <Quiz mode="quick" questions={questions} />;
}
