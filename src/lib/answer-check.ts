import "server-only";

import { questionKey } from "@/lib/mastery";
import { getPrisma } from "@/lib/prisma";
import type { AnswerResult } from "@/lib/quiz-types";

export function isId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= 2_147_483_647 // Postgres INT max
  );
}

/**
 * Checks a single answer on the server (used by the `checkAnswer` action
 * and by the scored API routes). The client never knows which answer is
 * correct until the server has checked it.
 */
export async function evaluateAnswer(
  questionId: unknown,
  answerId: unknown,
): Promise<AnswerResult> {
  if (!isId(questionId) || !isId(answerId)) {
    return { ok: false, error: "Neplatná odpověď." };
  }

  const [question, rulerCount] = await Promise.all([getPrisma().question.findUnique({
    where: { id: questionId },
    select: {
      text: true,
      explanation: true,
      sourceUrl: true,
      answers: { select: { id: true, isCorrect: true } },
      king: {
        select: {
          slug: true,
          name: true,
          title: true,
          imageUrl: true,
          _count: { select: { questions: true } },
        },
      },
    },
  }), getPrisma().king.count()]);
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
    ruler: {
      slug: question.king.slug,
      name: question.king.name,
      title: question.king.title,
      imageUrl: question.king.imageUrl,
      questionKey: questionKey(question.king.slug, question.text),
      totalQuestions: question.king._count.questions,
      rulerCount,
    },
  };
}
