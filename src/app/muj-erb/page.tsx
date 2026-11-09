import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { CrestEditor } from "@/components/crest-editor";
import { OrnamentDivider } from "@/components/ornaments";
import { getKingSlugs } from "@/lib/kings";

export const metadata: Metadata = {
  title: "Můj erb",
  description: "Navrhni si vlastní erb: tvar štítu, barvy podle heraldických pravidel, figura a heslo.",
};

export default function MyCrestPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">Heraldická dílna</p>
        <h1 className="text-5xl font-bold sm:text-6xl">Můj erb</h1>
        <OrnamentDivider />
        <p className="max-w-xl text-muted-foreground">
          Vyber tvar štítu, dělení, barvy, figuru a heslo. Další díly odemkneš korunami učenosti – čím víc
          toho o panovnících víš, tím vzácnější erb.
        </p>
      </header>
      <Suspense fallback={<div aria-busy="true" className="parchment h-96 animate-pulse rounded-2xl" />}>
        <Editor />
      </Suspense>
    </div>
  );
}

async function Editor() {
  await connection();
  // The number of rulers decides "zlatá koruna u všech" (the rarest parts).
  const slugs = await getKingSlugs();
  return <CrestEditor kingSlugs={slugs} />;
}
