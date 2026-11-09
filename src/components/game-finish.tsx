"use client";

import { useEffect, useState } from "react";

import { GameBoard } from "@/components/game-board";
import { NicknameForm } from "@/components/nickname-form";
import type { Finish } from "@/lib/game-client";
import { GAME_INFO, type GameMode } from "@/lib/games";
import { formatDuration } from "@/lib/leaderboard";
import { announceLeaderboardChange, postJson, readToken } from "@/lib/player";

/**
 * After a scored game: personal record (and "new record!"), a nickname form
 * when the player has none yet, and this week's leaderboard.
 */
export function GameFinish({ mode, finish }: { mode: GameMode; finish: Finish | null }) {
  const [nickname, setNickname] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    announceLeaderboardChange();
    const token = readToken();
    let cancelled = false;
    void (token ? postJson<{ nickname: string | null }>("/api/game/best", { token, mode }) : Promise.resolve(null)).then((result) => {
      if (!cancelled) setNickname(result?.ok ? result.nickname : null);
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const best = finish?.best;
  const bestText =
    best && (mode === "quick" ? `${best.score} z 10${best.durationMs !== null ? ` za ${formatDuration(best.durationMs)}` : ""}` : `${best.score}`);

  return (
    <div className="flex w-full flex-col items-center gap-3" data-testid="game-finish">
      {finish?.newRecord && (
        <p className="font-heading text-2xl font-bold text-gold-dark">
          <span aria-hidden>🏆 </span>Nový osobní rekord!
        </p>
      )}
      {bestText && (
        <p className="text-sm" data-testid="personal-best">
          Osobní rekord: <strong>{bestText}</strong>
        </p>
      )}
      {nickname === null && (
        <NicknameForm current={null} label="Zapiš se do žebříčku – stačí přezdívka" onSaved={setNickname} />
      )}
      <GameBoard mode={mode} title={`${GAME_INFO[mode].name}: žebříček`} className="w-full text-left" />
    </div>
  );
}
