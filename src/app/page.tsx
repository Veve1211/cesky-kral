import { cache, Suspense } from "react";
import { connection } from "next/server";

import { CollectionGallery } from "@/components/collection-gallery";
import { DailyHomeButton } from "@/components/daily-home-button";
import { HomeMoreLinks, HomeRank } from "@/components/home-extras";
import { KofiButton } from "@/components/kofi-button";
import { ReignTimeline } from "@/components/reign-timeline";
import { StartButton, StartButtonSkeleton } from "@/components/start-button";
import { getKings } from "@/lib/kings";

// One DB query per request, shared by the rank pill and the rest of the page.
const loadKings = cache(async () => {
  // Data comes from the DB on each request (never at build time).
  await connection();
  return getKings();
});

/**
 * Home page, top to bottom: rank block → one sentence + the main game button →
 * Řeka času strip → gallery → two cards (Můj erb, Kdo vládl dřív?) → groš.
 * Everything else lives on its own page (header menu), so the main game wins.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <section className="flex flex-col items-center gap-3 text-center">
        <Suspense fallback={<div className="parchment h-[136px] w-full max-w-xl animate-pulse rounded-2xl sm:h-24" aria-hidden />}>
          <HomeRankSection />
        </Suspense>
        <h1 className="text-[2.2rem] leading-[1.05] font-bold min-[400px]:text-[2.6rem] sm:text-6xl">
          Erbovní kniha <span className="gilt-text gilt-text-ink animate-shimmer">českých panovníků</span>
        </h1>
        <p className="max-w-md text-base text-ink/85 sm:text-lg">
          Odpovídej na otázky o českých panovnících a sbírej je jako karty.
        </p>
      </section>

      {/* Static shell above renders instantly; everything below streams in. */}
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

async function HomeRankSection() {
  const kings = await loadKings();
  return <HomeRank kings={kings} />;
}

async function HomeContent() {
  const kings = await loadKings();

  return (
    <>
      {/* The one main button; the daily challenge is only a small link under it. */}
      <section aria-label="Hrát" className="-mt-2 flex flex-col items-center gap-3">
        <StartButton kings={kings.map(({ slug, name }) => ({ slug, name }))} />
        <DailyHomeButton />
      </section>

      <ReignTimeline variant="compact" kings={kings} />

      {/* Collected state lives in localStorage, so the client components read it. */}
      <CollectionGallery kings={kings} />

      <HomeMoreLinks />

      {/* The only groš on the home page: low, after the main content. */}
      <KofiButton className="mx-auto max-w-sm" />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Načítám" className="flex flex-col gap-6 sm:gap-8">
      <div className="-mt-2 flex justify-center">
        <StartButtonSkeleton />
      </div>
      <div className="parchment h-24 animate-pulse rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-navy/80" />
        ))}
      </div>
    </div>
  );
}
