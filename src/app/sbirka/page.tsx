import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { MyCollection } from "@/components/my-collection";
import { OrnamentDivider } from "@/components/ornaments";
import { getKings } from "@/lib/kings";

export const metadata: Metadata = {
  title: "Moje sbírka",
  description: "Panovníci, které máš ve sbírce, a tvoje zlaté karty.",
};

export default function MyCollectionPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">
          Tvoje erbovní kniha
        </p>
        <h1 className="text-5xl leading-[1.05] font-bold sm:text-6xl">Moje sbírka</h1>
        <OrnamentDivider />
        <p className="max-w-xl text-ink/85">
          U každého získaného panovníka tě čeká ✨ Zlaté kolo: všechny těžké
          otázky a ani jedna chyba. Odměnou je zlatá karta.
        </p>
      </section>

      <Suspense
        fallback={<div aria-busy="true" className="parchment h-40 animate-pulse rounded-2xl" />}
      >
        <Collection />
      </Suspense>
    </div>
  );
}

async function Collection() {
  await connection();
  const kings = await getKings();
  return <MyCollection kings={kings} />;
}
