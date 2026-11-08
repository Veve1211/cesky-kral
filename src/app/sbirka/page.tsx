import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { MyCollection, MyCollectionSkeleton } from "@/components/my-collection";
import { OrnamentDivider } from "@/components/ornaments";
import { getKings } from "@/lib/kings";

export const metadata: Metadata = {
  title: "Moje sbírka",
  description: "Panovníci, které už máš ve sbírce, a ti, kteří ti ještě chybí.",
};

export default function CollectionPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">
          Erbovní kniha
        </p>
        <h1 className="text-5xl leading-[1.05] font-bold sm:text-6xl">
          Moje <span className="gilt-text">sbírka</span>
        </h1>
        <OrnamentDivider />
      </header>

      <Suspense fallback={<MyCollectionSkeleton />}>
        <Collection />
      </Suspense>
    </div>
  );
}

async function Collection() {
  // Data comes from the DB on each request (never at build time).
  await connection();
  const kings = await getKings();
  return <MyCollection kings={kings} />;
}
