import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";

import { CrestSvg, crestDescription } from "@/components/crest-svg";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { crestFromQuery } from "@/lib/heraldry";

export const metadata: Metadata = {
  title: "Erb",
  description: "Erb z Českého krále. Vytvoř si vlastní!",
};

/** A shared coat of arms: everything is in the link (validated), nothing is stored. */
export default function SharedCrestPage({ searchParams }: PageProps<"/erb">) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
      <Suspense fallback={<div aria-busy="true" className="parchment h-96 w-full animate-pulse rounded-2xl" />}>
        <SharedCrest searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SharedCrest({ searchParams }: { searchParams: PageProps<"/erb">["searchParams"] }) {
  const design = crestFromQuery(await searchParams);
  if (!design) notFound();
  return (
    <section className="parchment relative flex w-full flex-col items-center gap-4 rounded-2xl px-6 py-8">
      <CardCorners className="m-1 size-8 text-gold-dark" />
      <p className="text-xs font-semibold tracking-[0.3em] text-gold-dark uppercase">Erb z erbovní knihy</p>
      <div className="w-56 drop-shadow-lg" data-testid="shared-crest">
        <CrestSvg design={design} />
      </div>
      <p className="sr-only">{crestDescription(design)}</p>
      <OrnamentDivider />
      <p className="text-ink/85">Tenhle erb si někdo složil v Českém králi. Díly odemyká znalostmi o českých panovnících.</p>
      <Button asChild variant="accent" size="lg">
        <Link href="/muj-erb">
          <Shield aria-hidden />
          Vytvoř si vlastní erb
        </Link>
      </Button>
    </section>
  );
}
