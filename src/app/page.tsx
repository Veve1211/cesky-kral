import { Suspense } from "react";
import { connection } from "next/server";

import { CollectionGallery } from "@/components/collection-gallery";
import { IlluminatedInitial } from "@/components/illuminated-initial";
import { OrnamentDivider } from "@/components/ornaments";
import { getKings } from "@/lib/kings";

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">
          Sbírej české panovníky
        </p>
        <h1 className="text-5xl leading-[1.05] font-bold sm:text-7xl">
          Erbovní kniha <span className="gilt-text animate-shimmer">českých panovníků</span>
        </h1>
        <OrnamentDivider />
        <p className="max-w-xl text-left text-ink/85 sm:text-lg">
          <IlluminatedInitial letter="V" />
          <span className="sr-only">V</span>yber si panovníka a odpověz na pět otázek. Když trefíš aspoň čtyři,
          jeho karta je tvoje a v galerii se rozzáří barvami. Sbírej dál a
          stoupej od panoše až k titulu Český král nebo Česká královna.
        </p>
      </section>

      <Suspense fallback={<GallerySkeleton />}>
        <Gallery />
      </Suspense>
    </div>
  );
}

async function Gallery() {
  // Data comes from the DB on each request (never at build time).
  await connection();
  const kings = await getKings();
  // Collected state lives in localStorage, so the client component reads it.
  return <CollectionGallery kings={kings} />;
}

function GallerySkeleton() {
  return (
    <div aria-busy="true" aria-label="Načítám galerii" className="flex flex-col gap-10">
      <div className="parchment h-28 animate-pulse rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-navy/80" />
        ))}
      </div>
    </div>
  );
}
