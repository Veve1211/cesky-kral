import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Zap } from "lucide-react";

import { ModeHeader } from "@/components/mode-header";
import { QuickGame } from "@/components/quick-game";
import { QUICK_ROUND_QUESTIONS } from "@/lib/game-rules";
import { getRandomQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Rychlovka",
};

export default function QuickRoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3 sm:gap-6">
      <ModeHeader icon={<Zap className="size-5 sm:size-6" />} title="Rychlovka">
        <p className="max-w-sm text-sm text-parchment/85 sm:text-base">
          {QUICK_ROUND_QUESTIONS} náhodných otázek napříč všemi králi. Kolik jich
          dáš? Rozhoduje počet správných, při shodě čas. Do sbírky se nepočítá.
        </p>
      </ModeHeader>

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
  // Fallback questions for playing without the server score.
  return <QuickGame fallbackQuestions={questions} />;
}
