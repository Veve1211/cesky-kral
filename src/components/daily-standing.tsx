"use client";

import { useEffect, useState } from "react";

import { NicknameForm } from "@/components/nickname-form";
import { gapText, placeText, type Standing } from "@/lib/leaderboard";
import { announceLeaderboardChange, postJson, readToken } from "@/lib/player";

type Loaded = { standing: Standing | null; nickname: string | null };

/**
 * The player's place in today's leaderboard after the challenge, and what
 * was missing for one place higher. Without a nickname: where they would
 * be, and a form to join.
 */
export function DailyStanding({ dateKey, onStanding }: { dateKey: string; onStanding?: (standing: Standing | null) => void }) {
  const [loaded, setLoaded] = useState<Loaded | "loading" | "none">("loading");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Loads after the result shows and again after a nickname is saved.
    announceLeaderboardChange();
    const token = readToken();
    let cancelled = false;
    void (token ? postJson<Loaded>("/api/daily/standing", { token, date: dateKey }) : Promise.resolve(null)).then((result) => {
      if (cancelled) return;
      if (!result?.ok) {
        setLoaded("none");
        return;
      }
      setLoaded({ standing: result.standing, nickname: result.nickname });
      onStanding?.(result.standing);
    });
    return () => {
      cancelled = true;
    };
  }, [dateKey, onStanding, version]);

  if (loaded === "loading") return <p className="min-h-16" aria-busy="true" />;
  if (loaded === "none" || loaded.standing === null) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="daily-standing">
        Tenhle výsledek se do dnešního žebříčku nepočítá.
      </p>
    );
  }

  const { standing, nickname } = loaded;
  const gap = gapText(standing);
  return (
    <div className="flex w-full flex-col items-center gap-2" data-testid="daily-standing">
      {standing.ranked ? (
        standing.rank === 1 ? (
          <p className="font-heading text-2xl font-bold">
            <span aria-hidden>👑 </span>Jsi Dnešní vládce!
          </p>
        ) : (
          <p className="font-heading text-2xl font-bold">
            <span aria-hidden>🏆 </span>Tvoje pořadí: {placeText(standing.rank, standing.total)}
          </p>
        )
      ) : (
        <p className="font-heading text-xl font-bold">
          <span aria-hidden>🏆 </span>Patřilo by ti {placeText(standing.rank, standing.total)}
        </p>
      )}
      {gap && <p className="text-sm text-ink/85">{gap}</p>}
      {!standing.ranked && (
        <NicknameForm
          current={nickname}
          label="Zapiš se do žebříčku – stačí přezdívka"
          onSaved={() => setVersion((v) => v + 1)}
          className="mt-1"
        />
      )}
    </div>
  );
}
