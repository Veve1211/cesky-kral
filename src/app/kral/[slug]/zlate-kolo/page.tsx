import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { KingPortrait } from "@/components/king-portrait";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Quiz } from "@/components/quiz";
import { LEGEND_NOTE } from "@/lib/king-display";
import { getKingBySlug, kingInitial } from "@/lib/kings";
import { getGoldenQuestions } from "@/lib/questions";

export async function generateMetadata({
  params,
}: PageProps<"/kral/[slug]/zlate-kolo">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const king = await getKingBySlug(slug);
  if (!king) return { title: "Král nenalezen" };
  return {
    title: `Zlaté kolo: ${king.name}`,
    description: `Mistrovská úroveň: všechny těžké otázky o panovníkovi ${king.name}.`,
  };
}

export default function GoldenRoundPage({
  params,
}: PageProps<"/kral/[slug]/zlate-kolo">) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Suspense fallback={<GoldenSkeleton />}>
        <GoldenRound params={params} />
      </Suspense>
    </div>
  );
}

async function GoldenRound({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const king = await getKingBySlug(slug);
  if (!king) notFound();

  const questions = await getGoldenQuestions(king.slug);
  const initial = kingInitial(king.name);

  return (
    <>
      <Link
        href={`/kral/${king.slug}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zpět na panovníka
      </Link>

      <header className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-navy px-6 py-8 text-center text-parchment shadow-xl ring-2 ring-gold">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
        <CardCorners className="m-1 size-9 text-gold" />
        <div className="w-24 sm:w-28">
          <KingPortrait
            name={king.name}
            initial={initial}
            imageUrl={king.imageUrl}
            priority
            sizes="112px"
          />
        </div>
        <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
          ✨ Zlaté kolo · mistrovská úroveň
        </p>
        <h1 className="text-4xl leading-tight font-bold sm:text-5xl">{king.name}</h1>
        {king.isLegend && (
          <div className="flex flex-col items-center gap-2">
            <LegendBadge />
            <p className="text-sm text-parchment/80 italic">{LEGEND_NOTE}</p>
          </div>
        )}
        <OrnamentDivider />
        <p className="max-w-sm text-parchment/85">
          {hardQuestionsLabel(questions.length)} v náhodném pořadí. Pro zlatou
          kartu musí být správně všechny.
        </p>
      </header>

      <Quiz
        mode="golden"
        questions={questions}
        king={{ slug: king.slug, name: king.name, initial, imageUrl: king.imageUrl }}
      />
    </>
  );
}

function GoldenSkeleton() {
  return (
    <div aria-busy="true" aria-label="Načítám zlaté kolo" className="flex flex-col gap-6">
      <div className="h-72 animate-pulse rounded-2xl bg-navy/80" />
      <div className="parchment h-80 animate-pulse rounded-2xl" />
    </div>
  );
}

// Czech plural: 1 těžká otázka, 2–4 těžké otázky, 5+ těžkých otázek.
function hardQuestionsLabel(count: number): string {
  if (count === 1) return "1 těžká otázka";
  if (count >= 2 && count <= 4) return `${count} těžké otázky`;
  return `${count} těžkých otázek`;
}
