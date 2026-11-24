"use client";

import { useEffect, useState, type ComponentProps } from "react";

import { Quiz } from "@/components/quiz";
import { pickRound } from "@/lib/question-rotation";
import type { QuizQuestion } from "@/lib/quiz-types";
import { markSeen, readSeen } from "@/lib/seen-questions";

type KingQuizProps = Extract<ComponentProps<typeof Quiz>, { mode: "king" }>;

/**
 * "Hra o kartu" with rotating questions: the server sends the ruler's whole pool
 * (without correctness) and the round prefers questions this player has not seen
 * yet (localStorage `cesky-kral:seen`). "Zkusit znovu" picks a fresh round.
 */
export function KingRound({
  pool,
  ...quiz
}: Omit<KingQuizProps, "mode" | "questions" | "onRestart"> & { pool: QuizQuestion[] }) {
  const [round, setRound] = useState<{ id: number; questions: QuizQuestion[] } | null>(null);

  function startRound() {
    const questions = pickRound(pool, readSeen());
    markSeen(questions.map((question) => question.id));
    setRound((previous) => ({ id: (previous?.id ?? 0) + 1, questions }));
  }

  // The pick needs localStorage, so it happens in the browser after the first render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(startRound, [pool]);

  if (!round) return <div aria-busy="true" aria-label="Načítám otázky" className="parchment h-80 animate-pulse rounded-2xl" />;

  return <Quiz key={round.id} mode="king" questions={round.questions} onRestart={startRound} {...quiz} />;
}
