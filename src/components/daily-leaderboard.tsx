"use client";

import { useEffect, useState } from "react";

import { CardCorners } from "@/components/ornaments";
import { formatDuration, type BoardEntry } from "@/lib/leaderboard";
import { LEADERBOARD_CHANGED } from "@/lib/player";
import { cn } from "@/lib/utils";

type Board = { entries: BoardEntry[]; total: number };

/**
 * Today's leaderboard: most correct answers first, a tie is decided by the
 * time. The first place is shown big as "Dnešní vládce". Loads again when a
 * game on this page ends or a nickname is saved.
 */
export function DailyLeaderboard({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    const reload = async () => {
      try {
        const response = await fetch("/api/daily/leaderboard", { cache: "no-store" });
        const data = (await response.json()) as { ok: boolean } & Board;
        if (!cancelled && data.ok && Array.isArray(data.entries)) setBoard({ entries: data.entries, total: data.total });
      } catch {
        // Keep what we have.
      }
    };
    window.addEventListener(LEADERBOARD_CHANGED, reload);
    return () => {
      cancelled = true;
      window.removeEventListener(LEADERBOARD_CHANGED, reload);
    };
  }, []);

  const [first, ...rest] = board.entries;

  return (
    <section aria-labelledby="daily-board-heading" className="flex flex-col gap-3">
      <h2 id="daily-board-heading" className="text-center text-4xl font-bold">
        Dnešní žebříček
      </h2>
      <p className="-mt-2 text-center text-sm text-muted-foreground">
        Rozhoduje počet správných odpovědí, při shodě čas.
        {board.total > 0 && ` Zapsaných hráčů: ${board.total}.`}
      </p>
      {first ? <TodayRulerCard entry={first} /> : <EmptyThrone />}
      {rest.length > 0 && (
        <ol className="parchment relative flex flex-col divide-y divide-gold-dark/20 rounded-2xl px-4 py-2" aria-label="Další místa">
          {rest.map((entry) => (
            <li key={entry.rank} className="flex items-center gap-3 py-2" data-testid="board-row">
              <span className="w-8 text-right font-heading text-xl font-bold text-gold-dark tabular-nums">{entry.rank}.</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{entry.nickname}</span>
              <span className="tabular-nums">
                <strong>{entry.score}</strong>/5
              </span>
              {entry.durationMs !== null && (
                <span className="w-20 text-right text-sm text-muted-foreground tabular-nums">{formatDuration(entry.durationMs)}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** First place – big, as "Dnešní vládce". */
export function TodayRulerCard({ entry, className }: { entry: BoardEntry; className?: string }) {
  return (
    <div
      data-testid="today-ruler"
      className={cn(
        "relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-navy px-5 py-5 text-center text-parchment shadow-xl ring-2 ring-gold",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-gold/50" />
      <CardCorners className="m-1 size-7 text-gold" />
      <span aria-hidden className="text-3xl">
        👑
      </span>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">Dnešní vládce</p>
      <p className="max-w-full truncate font-heading text-3xl font-bold" data-testid="today-ruler-name">
        {entry.nickname}
      </p>
      <p className="text-sm text-parchment/85 tabular-nums">
        {entry.score} z 5 správně
        {entry.durationMs !== null && ` · ${formatDuration(entry.durationMs)}`}
      </p>
    </div>
  );
}

function EmptyThrone() {
  return (
    <p className="parchment rounded-2xl px-5 py-5 text-center text-ink/85" data-testid="today-ruler-empty">
      <span aria-hidden>👑 </span>Trůn Dnešního vládce je zatím prázdný. Dohraj výzvu, zadej přezdívku a usedni na něj.
    </p>
  );
}
