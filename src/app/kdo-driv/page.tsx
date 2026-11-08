import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { WhoFirstGame } from "@/components/who-first-game";
import { getWhoFirstKings } from "@/lib/kings";
import { pickPair } from "@/lib/who-first";

export const metadata: Metadata = {
  title: "Kdo vládl dřív?",
  description: "Dva panovníci, jedna otázka: kdo z nich začal vládnout dřív? Kolik jich trefíš za sebou?",
};

export default function WhoFirstPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-navy px-6 py-7 text-center text-parchment shadow-xl ring-2 ring-gold">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
        <CardCorners className="m-1 size-9 text-gold" />
        <span className="gilt flex size-12 items-center justify-center rounded-full text-2xl shadow-md" aria-hidden>
          ⏳
        </span>
        <h1 className="text-4xl font-bold sm:text-5xl">Kdo vládl dřív?</h1>
        <OrnamentDivider />
        <p className="max-w-sm text-parchment/85">
          Klepni na panovníka, který začal vládnout dřív. Každá trefa přidá
          do série jeden plamínek. Jedna chyba a je konec.
        </p>
      </header>

      <Suspense fallback={<div aria-busy="true" className="parchment h-72 animate-pulse rounded-2xl" />}>
        <Game />
      </Suspense>
    </div>
  );
}

async function Game() {
  // Data comes from the DB on each request (never at build time).
  await connection();
  const kings = await getWhoFirstKings();
  return <WhoFirstGame variant="full" kings={kings} initialPair={pickPair(kings.length)} />;
}
