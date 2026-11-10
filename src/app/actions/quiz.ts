"use server";

import { evaluateAnswer } from "@/lib/answer-check";
import type { AnswerResult } from "@/lib/quiz-types";

/**
 * Checks a single answer on the server. The client never knows which
 * answer is correct until it calls this action.
 */
export async function checkAnswer(questionId: unknown, answerId: unknown): Promise<AnswerResult> {
  return evaluateAnswer(questionId, answerId);
}
