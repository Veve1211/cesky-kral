// Shared types between server and client. Never include `isCorrect` here.

export type QuizAnswer = {
  id: number;
  text: string;
};

export type QuizQuestion = {
  id: number;
  text: string;
  difficulty: 1 | 2 | 3;
  kingName: string;
  isLegend: boolean;
  answers: QuizAnswer[];
};

export type AnswerResult =
  | {
      ok: true;
      correct: boolean;
      correctAnswerId: number;
      explanation: string;
      sourceUrl: string | null;
      /** For "Koruny učenosti": which ruler the question belongs to. */
      ruler: AnswerRuler;
    }
  | { ok: false; error: string };

export type AnswerRuler = {
  slug: string;
  name: string;
  title: string;
  imageUrl: string | null;
  /** Stable id of the question (see `questionKey`), not the database id. */
  questionKey: string;
  /** How many questions the ruler has – crown thresholds scale with it. */
  totalQuestions: number;
};
