"use client";

import { useEffect, useState } from "react";

import { GameFinish } from "@/components/game-finish";
import { Quiz } from "@/components/quiz";
import { useCollectionReady } from "@/lib/collection";
import { sendAnswer, startScoredGame, type Finish, type Session } from "@/lib/game-client";
import { formatDuration } from "@/lib/leaderboard";
import { postJson, readToken } from "@/lib/player";
import type { AnswerResult, QuizQuestion } from "@/lib/quiz-types";

type Phase = { kind: "connecting" } | { kind: "scored"; session: Session<"quick"> } | { kind: "offline" };

/**
 * Rychlovka scored on the server: the server picks the ten questions and
 * counts the answers. When it can't be reached, the questions rendered with
 * the page are played without a score in the leaderboard.
 */
export function QuickGame({ fallbackQuestions }: { fallbackQuestions: QuizQuestion[] }) {
  const ready = useCollectionReady();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: "connecting" });
  const [finish, setFinish] = useState<Finish | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void startScoredGame("quick").then((session) => {
      if (cancelled) return;
      setFinish(null);
      setPhase(session ? { kind: "scored", session } : { kind: "offline" });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, round]);

  if (phase.kind === "connecting") {
    return <div aria-busy="true" aria-label="Připravuji otázky" className="parchment h-80 animate-pulse rounded-2xl" />;
  }

  if (phase.kind === "offline") {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-xl border border-gold-dark/40 px-4 py-2 text-center text-sm text-muted-foreground">
          Žebříček je teď nedostupný. Hrát můžeš, výsledek se ale nezapíše.
        </p>
        <Quiz mode="quick" questions={fallbackQuestions} />
      </div>
    );
  }

  const { session } = phase;
  async function check(questionId: number, answerId: number): Promise<AnswerResult> {
    const result = await sendAnswer("quick", { token: session.token, sessionId: session.game.sessionId }, { questionId, answerId });
    if (result.ok && result.finish) setFinish(result.finish);
    return result;
  }

  return (
    <div className="flex flex-col gap-4">
      <PersonalBestLine key={round} />
      <Quiz
        key={session.game.sessionId}
        mode="quick"
        questions={session.game.questions}
        check={check}
        onRestart={() => {
          setPhase({ kind: "connecting" });
          setRound((r) => r + 1);
        }}
        resultExtra={<GameFinish mode="quick" finish={finish} />}
      />
    </div>
  );
}

/** "Tvůj rekord: 8 z 10 (1 min 05 s)" before the game starts. */
function PersonalBestLine() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const token = readToken();
    let cancelled = false;
    void (token ? postJson<{ best: { score: number; durationMs: number | null } | null }>("/api/game/best", { token, mode: "quick" }) : Promise.resolve(null)).then(
      (result) => {
        if (cancelled || !result?.ok || !result.best) return;
        const { score, durationMs } = result.best;
        setText(`${score} z 10${durationMs !== null ? ` (${formatDuration(durationMs)})` : ""}`);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <p className="min-h-5 text-center text-sm text-muted-foreground" data-testid="quick-best">
      {text && (
        <>
          <span aria-hidden>🏆 </span>Tvůj osobní rekord: <strong className="text-ink">{text}</strong>
        </>
      )}
    </p>
  );
}
