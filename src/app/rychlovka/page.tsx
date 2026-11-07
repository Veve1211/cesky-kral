import type { Metadata } from "next";
import { Timer, Zap } from "lucide-react";

import { QuestionSkeleton } from "@/components/question-skeleton";
import { Progress } from "@/components/ui/progress";
import { QUICK_ROUND_QUESTIONS } from "@/lib/game-rules";

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
          dáš?
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>
            Otázka <strong>1</strong> z {QUICK_ROUND_QUESTIONS}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Timer className="size-4" aria-hidden />
            Skóre 0
          </span>
        </div>
        <Progress value={0} max={QUICK_ROUND_QUESTIONS} label="Postup v rychlovce" />
      </div>

      <QuestionSkeleton />
    </div>
  );
}
