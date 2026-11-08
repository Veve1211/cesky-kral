import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { IlluminatedInitial } from "@/components/illuminated-initial";
import { KingPortrait } from "@/components/king-portrait";
import { LegendBadge } from "@/components/legend-badge";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { Quiz } from "@/components/quiz";
import { CORRECT_TO_COLLECT } from "@/lib/game-rules";
import { formatReign, LEGEND_NOTE } from "@/lib/king-display";
import { getKingBySlug, getKingSlugs, kingInitial } from "@/lib/kings";
import { getKingQuestions } from "@/lib/questions";

export async function generateMetadata({
  params,
}: PageProps<"/kral/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const king = await getKingBySlug(slug);
  if (!king) return { title: "Král nenalezen" };
  return {
    title: king.name,
    description: `Zahraj si o kartu: ${king.name}. ${king.shortBio}`,
  };
}

export default function KingGamePage({ params }: PageProps<"/kral/[slug]">) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Link
        href="/"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zpět do sbírky
      </Link>

      <Suspense fallback={<GameSkeleton />}>
        <KingGame params={params} />
      </Suspense>
    </div>
  );
}

async function KingGame({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const king = await getKingBySlug(slug);
  if (!king) notFound();

  const [questions, allSlugs] = await Promise.all([
    getKingQuestions(king.slug),
    getKingSlugs(),
  ]);
  const initial = kingInitial(king.name);
  const bio = king.shortBio.trim();

  return (
    <>
      <header className="parchment relative flex flex-col items-center gap-4 rounded-2xl p-5 text-center sm:p-6">
        <CardCorners className="m-1 size-8 text-gold-dark" />
        <div className="w-32 sm:w-36">
          <KingPortrait
            name={king.name}
            initial={initial}
            imageUrl={king.imageUrl}
            priority
            sizes="144px"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
            Hra o kartu · {CORRECT_TO_COLLECT} z 5 správně
          </p>
          <div className="my-1 h-px w-12 bg-gold/60" aria-hidden />
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {king.title}
          </p>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">{king.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[formatReign(king), king.dynasty].filter(Boolean).join(" · ")}
          </p>
          {king.isLegend && (
            <div className="mt-2 flex flex-col items-center gap-2">
              <LegendBadge />
              <p className="text-sm font-medium text-ink/80 italic">{LEGEND_NOTE}</p>
            </div>
          )}
        </div>
        <OrnamentDivider />
        {bio && (
          <p className="text-left text-ink/90">
            <IlluminatedInitial letter={bio.charAt(0)} size="md" />
            <span className="sr-only">{bio.charAt(0)}</span>
            {bio.slice(1)}
          </p>
        )}
      </header>

      <Quiz
        mode="king"
        questions={questions}
        allKingSlugs={allSlugs}
        king={{
          slug: king.slug,
          name: king.name,
          initial,
          imageUrl: king.imageUrl,
          title: king.title,
          dynasty: king.dynasty,
          isLegend: king.isLegend,
          reignFrom: king.reignFrom,
          reignTo: king.reignTo,
          chronicle: king.chronicle,
        }}
      />
    </>
  );
}

function GameSkeleton() {
  return (
    <div aria-busy="true" aria-label="Načítám hru" className="flex flex-col gap-6">
      <div className="parchment h-72 animate-pulse rounded-2xl" />
      <div className="parchment h-80 animate-pulse rounded-2xl" />
    </div>
  );
}
