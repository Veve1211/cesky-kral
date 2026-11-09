import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { CollectionGallery } from "@/components/collection-gallery";
import { DailyHomeButton } from "@/components/daily-home-button";
import { TodayRulerCard } from "@/components/daily-leaderboard";
import { IlluminatedInitial } from "@/components/illuminated-initial";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { ReignTimeline } from "@/components/reign-timeline";
import { StartButton, StartButtonSkeleton } from "@/components/start-button";
import { WhoFirstGame } from "@/components/who-first-game";
import { dailyDateKey } from "@/lib/daily";
import { getDailyLeaderboard } from "@/lib/daily-server";
import { getKings, toWhoFirstKings } from "@/lib/kings";
import { pickPair } from "@/lib/who-first";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <section className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">
          Sbírej české panovníky
        </p>
        <h1 className="text-[2.6rem] leading-[1.05] font-bold min-[400px]:text-5xl sm:text-7xl">
          Erbovní kniha <span className="gilt-text gilt-text-ink animate-shimmer">českých panovníků</span>
        </h1>
        <OrnamentDivider />
      </section>

      {/* Static shell above renders instantly; everything below streams in with one DB query. */}
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

async function HomeContent() {
  // Data comes from the DB on each request (never at build time).
  await connection();
  const [kings, board] = await Promise.all([getKings(), getDailyLeaderboard(dailyDateKey(), 1)]);
  const ruler = board.entries[0];
  const duelKings = toWhoFirstKings(kings);

  return (
    <>
      {/* One main button; the daily challenge is a smaller second choice. */}
      <section aria-label="Hrát" className="-mt-4 flex flex-col items-center gap-4 sm:-mt-6">
        <StartButton kings={kings.map(({ slug, name }) => ({ slug, name }))} />
        <DailyHomeButton />
      </section>

      <ReignTimeline variant="compact" kings={kings} />

      {/* Today's first place in the daily challenge. */}
      {ruler && (
        <Link
          href="/vyzva"
          aria-label={`Dnešní vládce: ${ruler.nickname}, ${ruler.score} z 5 – zobrazit žebříček Denní výzvy`}
          className="mx-auto w-full max-w-sm rounded-2xl outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/60"
        >
          <TodayRulerCard entry={ruler} className="py-3" />
        </Link>
      )}

      {duelKings.length >= 2 && (
        <section
          aria-labelledby="who-first-heading"
          className="parchment relative mx-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl px-4 py-5 sm:px-6"
        >
          <CardCorners className="m-1 size-7 text-gold-dark" />
          <div className="text-center">
            <h2 id="who-first-heading" className="text-3xl font-bold">
              <span aria-hidden>⏳ </span>Kdo vládl dřív?
            </h2>
            <p className="text-sm text-muted-foreground">Klepni na toho, kdo začal vládnout dřív.</p>
          </div>
          <WhoFirstGame variant="teaser" kings={duelKings} initialPair={pickPair(duelKings.length)} />
        </section>
      )}

      <p className="mx-auto max-w-xl text-left text-ink/85 sm:text-lg">
        <IlluminatedInitial letter="V" />
        <span className="sr-only">V</span>yber si panovníka a odpověz na pět otázek. Když trefíš aspoň
        čtyři, jeho karta je tvoje. Sbírej dál a stoupej od panoše až k titulu Pán nebo Paní erbovní
        knihy.
      </p>

      {/* Collected state lives in localStorage, so the client components read it. */}
      <CollectionGallery kings={kings} />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Načítám" className="flex flex-col gap-8 sm:gap-10">
      <div className="-mt-4 flex justify-center sm:-mt-6">
        <StartButtonSkeleton />
      </div>
      <div className="parchment h-28 animate-pulse rounded-2xl" />
      <div className="parchment mx-auto h-64 w-full max-w-xl animate-pulse rounded-2xl" />
      <div className="parchment h-28 animate-pulse rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-navy/80" />
        ))}
      </div>
    </div>
  );
}
