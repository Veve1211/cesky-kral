import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { TodayRulerCard } from "@/components/daily-leaderboard";
import { GameBoard } from "@/components/game-board";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { dailyDateKey } from "@/lib/daily";
import { getDailyLeaderboard } from "@/lib/daily-server";
import { getGameLeaderboard } from "@/lib/game-server";
import { GAME_INFO, GAME_MODES } from "@/lib/games";

export const metadata: Metadata = {
  title: "Žebříčky",
  description: "Nejlepší hráči Českého krále: Dnešní vládce, týdenní a celkové žebříčky.",
};

export default function LeaderboardsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-navy px-6 py-7 text-center text-parchment shadow-xl ring-2 ring-gold">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
        <CardCorners className="m-1 size-9 text-gold" />
        <span className="gilt flex size-12 items-center justify-center rounded-full text-2xl shadow-md" aria-hidden>
          🏆
        </span>
        <h1 className="text-4xl font-bold sm:text-5xl">Žebříčky</h1>
        <OrnamentDivider />
        <p className="max-w-sm text-parchment/85">
          Počítá se nejlepší výsledek každého hráče. Týden začíná v pondělí o půlnoci. Skóre počítá
          server, ne prohlížeč.
        </p>
      </header>
      <Suspense fallback={<div aria-busy="true" className="parchment h-96 animate-pulse rounded-2xl" />}>
        <Boards />
      </Suspense>
    </div>
  );
}

async function Boards() {
  await connection();
  const [daily, ...games] = await Promise.all([
    getDailyLeaderboard(dailyDateKey(), 1),
    ...GAME_MODES.map(async (mode) => ({
      mode,
      week: await getGameLeaderboard(mode, "week"),
      all: await getGameLeaderboard(mode, "all"),
    })),
  ]);
  return (
    <>
      <section aria-labelledby="daily-ruler-heading" className="flex flex-col gap-2">
        <h2 id="daily-ruler-heading" className="text-3xl font-bold">
          Denní výzva
        </h2>
        {daily.entries[0] ? (
          <TodayRulerCard entry={daily.entries[0]} />
        ) : (
          <p className="parchment rounded-2xl p-4 text-center">Trůn Dnešního vládce je zatím prázdný.</p>
        )}
        <Link href="/vyzva" className="self-center text-sm font-medium underline decoration-gold underline-offset-4">
          Celý dnešní žebříček
        </Link>
      </section>
      {games.map(({ mode, week, all }) => (
        <section key={mode} className="flex flex-col gap-2">
          <GameBoard mode={mode} title={GAME_INFO[mode].name} initial={{ week, all }} />
          <Link href={GAME_INFO[mode].href} className="self-center text-sm font-medium underline decoration-gold underline-offset-4">
            Hrát {GAME_INFO[mode].name}
          </Link>
        </section>
      ))}
    </>
  );
}
