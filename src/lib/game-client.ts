"use client";

import type { DuelAnswer, Finish, StartResult, TimelineAnswer } from "@/lib/game-server";
import type { GameMode } from "@/lib/games";
import { ensurePlayer, postJson } from "@/lib/player";
import type { AnswerResult } from "@/lib/quiz-types";

// Browser side of the server-scored games (types only from the server module).

type GameOf<M extends GameMode> = M extends "quick" ? Extract<StartResult, { mode: "quick" }> : Exclude<StartResult, { mode: "quick" }>;
export type Session<M extends GameMode> = { token: string; game: GameOf<M> };

/** Starts a scored game; null when the server can't be reached (play unscored). */
export async function startScoredGame<M extends GameMode>(mode: M): Promise<Session<M> | null> {
  const token = await ensurePlayer();
  if (!token) return null;
  const result = await postJson<{ game: StartResult }>("/api/game/start", { token, mode });
  if (!result.ok || result.game.mode !== mode) return null;
  return { token, game: result.game as GameOf<M> };
}

type Answers = {
  quick: AnswerResult & { finish?: Finish };
  "who-first": DuelAnswer;
  timeline: TimelineAnswer;
};

export async function sendAnswer<M extends GameMode>(
  mode: M,
  session: { token: string; sessionId: string },
  fields: object,
): Promise<Answers[M]> {
  const result = await postJson<{ result: Answers[M] }>("/api/game/answer", {
    ...fields,
    token: session.token,
    mode,
    sessionId: session.sessionId,
  });
  return result.ok ? result.result : ({ ok: false, error: result.error } as Answers[M]);
}

export type { Finish };
