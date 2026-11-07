import { Suspense } from "react";
import { connection } from "next/server";

import { CollectionGallery } from "@/components/collection-gallery";
import { getKings } from "@/lib/kings";

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          Sbírka panovníků
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Získej všechny české krále
        </h1>
        <p className="max-w-xl text-muted-foreground sm:text-lg">
          Vyber si panovníka a odpověz na pět otázek. Když trefíš aspoň čtyři,
          jeho karta je tvoje.
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
      <div className="h-28 animate-pulse rounded-2xl bg-card" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-navy/80" />
        ))}
      </div>
    </div>
  );
}
