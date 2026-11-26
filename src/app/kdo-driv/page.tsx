import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { ModeHeader } from "@/components/mode-header";
import { WhoFirstGame } from "@/components/who-first-game";
import { getWhoFirstKings } from "@/lib/kings";
import { pickPair } from "@/lib/who-first";
import { LockedPage } from "@/components/locked-page";

export const metadata: Metadata = {
  alternates: { canonical: "/kdo-driv" },
  title: "Kdo vládl dřív?",
  description: "Dva panovníci, jedna otázka: kdo z nich začal vládnout dřív? Kolik jich trefíš za sebou?",
};

function WhoFirstPageContent() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:gap-6">
      <ModeHeader icon="⏳" title="Kdo vládl dřív?">
        <p className="max-w-sm text-sm text-parchment/85 sm:text-base">
          Klepni na panovníka, který začal vládnout dřív. Každá trefa přidá
          do série jeden plamínek. Jedna chyba a je konec.
        </p>
      </ModeHeader>

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

// New players see a lock until their first card (src/lib/reveal.ts).
export default function WhoFirstPage() {
  return (
    <LockedPage name="Kdo vládl dřív?">
      <WhoFirstPageContent />
    </LockedPage>
  );
}
