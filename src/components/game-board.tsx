"use client";

import { useEffect, useState } from "react";

import { GAME_INFO, PERIOD_NAMES, type GameMode, type Period } from "@/lib/games";
import { formatDuration, type BoardEntry } from "@/lib/leaderboard";
import { LEADERBOARD_CHANGED } from "@/lib/player";
import { cn } from "@/lib/utils";

export type Board = { entries: BoardEntry[]; total: number };

/** One leaderboard as a list (server-safe: no hooks). */
export function BoardList({ board, mode, testId }: { board: Board; mode: GameMode; testId?: string }) {
  if (board.entries.length === 0) {
    return (
      <p className="py-3 text-center text-sm text-muted-foreground" data-testid={testId}>
        Zatím nikdo. Buď první!
      </p>
    );
  }
  const { timed, unit } = GAME_INFO[mode];
  return (
    <ol className="flex flex-col divide-y divide-gold-dark/20" data-testid={testId}>
      {board.entries.map((entry) => (
        <li key={entry.rank} className="flex items-center gap-3 py-2" data-testid="board-row">
          <span className={cn("w-8 text-right font-heading text-xl font-bold tabular-nums", entry.rank === 1 ? "text-gold-dark" : "text-ink/70")}>
            {entry.rank === 1 ? <span aria-label="1.">👑</span> : `${entry.rank}.`}
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold">{entry.nickname}</span>
          <span className="tabular-nums">
            <strong>{entry.score}</strong>
            <span className="sr-only"> {unit}</span>
            {mode === "quick" && <span aria-hidden>/10</span>}
          </span>
          {timed && entry.durationMs !== null && (
            <span className="w-20 text-right text-sm text-muted-foreground tabular-nums">{formatDuration(entry.durationMs)}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

async function fetchBoard(mode: GameMode, period: Period): Promise<Board | null> {
  try {
    const response = await fetch(`/api/game/leaderboard?mode=${mode}&period=${period}`, { cache: "no-store" });
    const data = (await response.json()) as { ok: boolean } & Board;
    return data.ok && Array.isArray(data.entries) ? { entries: data.entries, total: data.total } : null;
  } catch {
    return null;
  }
}

/** Weekly / all-time leaderboard of one game with a switch; reloads after a game. */
export function GameBoard({
  mode,
  initial,
  className,
  title = "Žebříček",
}: {
  mode: GameMode;
  initial?: Partial<Record<Period, Board>>;
  className?: string;
  title?: string;
}) {
  const [period, setPeriod] = useState<Period>("week");
  const [boards, setBoards] = useState<Partial<Record<Period, Board>>>(initial ?? {});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const reload = () => setVersion((v) => v + 1);
    window.addEventListener(LEADERBOARD_CHANGED, reload);
    return () => window.removeEventListener(LEADERBOARD_CHANGED, reload);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchBoard(mode, period).then((board) => {
      if (!cancelled && board) setBoards((current) => ({ ...current, [period]: board }));
    });
    return () => {
      cancelled = true;
    };
  }, [mode, period, version]);

  const board = boards[period];
  const headingId = `board-${mode}`;
  return (
    <section aria-labelledby={headingId} className={cn("parchment relative flex flex-col gap-2 rounded-2xl px-4 py-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={headingId} className="font-heading text-2xl font-bold">
          <span aria-hidden>{GAME_INFO[mode].icon} </span>
          {title}
        </h3>
        <div role="group" aria-label="Období" className="flex rounded-full bg-navy/10 p-0.5 text-sm">
          {(["week", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              onClick={() => setPeriod(value)}
              className="min-h-9 rounded-full px-3 font-semibold outline-none focus-visible:ring-4 focus-visible:ring-ring/60 aria-pressed:bg-navy aria-pressed:text-parchment"
            >
              {PERIOD_NAMES[value]}
            </button>
          ))}
        </div>
      </div>
      {board ? <BoardList board={board} mode={mode} testId={`board-${mode}-${period}`} /> : <div className="h-24" aria-busy="true" />}
    </section>
  );
}
