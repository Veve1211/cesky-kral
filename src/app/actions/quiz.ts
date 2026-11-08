"use server";

import { getPrisma } from "@/lib/prisma";
import type { AnswerResult } from "@/lib/quiz-types";

function isId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= 2_147_483_647 // Postgres INT max
  );
}

/**
 * Checks a single answer on the server. The client never knows which
 * answer is correct until it calls this action.
 */
export async function checkAnswer(
  questionId: unknown,
  answerId: unknown,
): Promise<AnswerResult> {
  if (!isId(questionId) || !isId(answerId)) {
    return { ok: false, error: "Neplatná odpověď." };
  }

  const question = await getPrisma().question.findUnique({
    where: { id: questionId },
    select: {
      explanation: true,
      sourceUrl: true,
      answers: { select: { id: true, isCorrect: true } },
    },
  });
  if (!question) return { ok: false, error: "Otázka neexistuje." };

  const chosen = question.answers.find((a) => a.id === answerId);
  const correct = question.answers.find((a) => a.isCorrect);
  if (!chosen || !correct) {
    return { ok: false, error: "Neplatná odpověď." };
  }

  const sourceUrl =
    question.sourceUrl && question.sourceUrl.startsWith("https://")
      ? question.sourceUrl
      : null;

  return {
    ok: true,
    correct: chosen.isCorrect,
    correctAnswerId: correct.id,
    explanation: question.explanation,
    sourceUrl,
  };
}
