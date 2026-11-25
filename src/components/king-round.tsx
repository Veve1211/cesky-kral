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
 * yet (localStorage `cesky-kral:seen`). "Zkusit znovu" repeats the same questions
 * in a new order (answers shuffled too) – the player learns them (Veve, 25. 11.);
 * a new visit of the page picks a new round.
 */
export function KingRound({
  pool,
  ...quiz
}: Omit<KingQuizProps, "mode" | "questions" | "onRestart" | "focusFirstQuestion"> & { pool: QuizQuestion[] }) {
  const [round, setRound] = useState<{ id: number; questions: QuizQuestion[] } | null>(null);

  function startRound() {
    const questions = pickRound(pool, readSeen());
    markSeen(questions.map((question) => question.id));
    setRound((previous) => ({ id: (previous?.id ?? 0) + 1, questions }));
  }

  function retryRound() {
    setRound((previous) =>
      previous
        ? {
            id: previous.id + 1,
            questions: shuffled(previous.questions).map((question) => ({ ...question, answers: shuffled(question.answers) })),
          }
        : previous,
    );
  }

  // The pick needs localStorage, so it happens in the browser after the first render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(startRound, [pool]);

  if (!round) return <div aria-busy="true" aria-label="Načítám otázky" className="parchment h-80 animate-pulse rounded-2xl" />;

  return (
    <Quiz
      key={round.id}
      mode="king"
      questions={round.questions}
      onRestart={retryRound}
      focusFirstQuestion={round.id > 1}
      {...quiz}
    />
  );
}

/** A new array in random order (Fisher–Yates). */
function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
