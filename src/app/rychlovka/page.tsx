import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Zap } from "lucide-react";

import { Quiz } from "@/components/quiz";
import { QUICK_ROUND_QUESTIONS } from "@/lib/game-rules";
import { getRandomQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Rychlovka",
};

export default function QuickRoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header className="flex flex-col gap-3 rounded-2xl bg-navy p-6 text-parchment shadow-md">
        <span className="flex size-11 items-center justify-center rounded-full bg-gold text-navy">
          <Zap className="size-5" aria-hidden />
        </span>
        <h1 className="text-3xl font-bold">Rychlovka</h1>
        <p className="text-parchment/80">
          {QUICK_ROUND_QUESTIONS} náhodných otázek napříč všemi králi. Kolik jich
          dáš? Do sbírky se nepočítá, jde jen o skóre.
        </p>
      </header>

      <Suspense
        fallback={<div className="h-80 animate-pulse rounded-2xl bg-card" />}
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
