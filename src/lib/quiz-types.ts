// Shared types between server and client. Never include `isCorrect` here.

export type QuizAnswer = {
  id: number;
  text: string;
};

export type QuizQuestion = {
  id: number;
  text: string;
  kingName: string;
  answers: QuizAnswer[];
};

export type AnswerResult =
  | {
      ok: true;
      correct: boolean;
      correctAnswerId: number;
      explanation: string;
      sourceUrl: string | null;
    }
  | { ok: false; error: string };
