// Types and styles shared by the quiz (quiz.tsx) and its result screens (quiz-results.tsx).
import type { ReactNode } from "react";

import type { ChronicleKing } from "@/components/chronicle-dialog";
import type { Chronicle } from "@/lib/chronicle";
import type { AnswerResult, QuizQuestion } from "@/lib/quiz-types";

export const HEADING_FOCUS = "scroll-mt-20 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export type QuizKing = {
  slug: string;
  name: string;
  initial: string;
  imageUrl: string | null;
};

export type QuizProps =
  | {
      mode: "king";
      questions: QuizQuestion[];
      allKingSlugs: string[];
      /** "Zkusit znovu" starts a fresh round picked by the caller (`KingRound`). */
      onRestart?: () => void;
      /** A restarted round: keyboard focus goes to the first question, as after an in-place restart. */
      focusFirstQuestion?: boolean;
      king: Omit<ChronicleKing, "chronicle"> &
        QuizKing & {
          chronicle: Chronicle | null;
        };
    }
  | { mode: "golden"; questions: QuizQuestion[]; king: QuizKing }
  | {
      mode: "quick";
      questions: QuizQuestion[];
      /** Checks (and records) the answer on the server – scored mode. */
      check?: (questionId: number, answerId: number) => Promise<AnswerResult>;
      /** A new game is started by the caller (new server session). */
      onRestart?: () => void;
      /** Shown on the result card (personal record, leaderboard…). */
      resultExtra?: ReactNode;
    }
  | {
      /** Daily challenge: resumable, every answer is reported, results are shown by the caller. */
      mode: "daily";
      questions: QuizQuestion[];
      startIndex: number;
      startScore: number;
      /** Right/wrong of the questions answered before a resume (round crowns). */
      startMarks: readonly boolean[];
      onAnswered: (index: number, correct: boolean) => void;
      onFinished: () => void;
      /** Checks (and records) the answer on the server – scored mode. */
      check?: (questionId: number, answerId: number) => Promise<AnswerResult>;
    };
