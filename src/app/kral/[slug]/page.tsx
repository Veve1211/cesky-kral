import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { GoldenHeaderFrame, GoldenRoundButton } from "@/components/golden-round-button";
import { KingBio } from "@/components/king-bio";
import { KingPortrait } from "@/components/king-portrait";
import { KingReignLine } from "@/components/king-reign-line";
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
  // Own preview for sharing a ruler's link (the image is `opengraph-image.tsx`).
  const title = `${king.name} – hra o kartu`;
  // No short bio here: it would give away answers of the round.
  const description = `Zahraj si o kartu: ${king.name}. Pět otázek, tři možnosti – čtyři správně a ${king.title} je ve tvé sbírce.`;
  return {
    title: king.name,
    description,
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      siteName: "Český král",
      title,
      description,
      url: `/kral/${king.slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function KingGamePage({ params }: PageProps<"/kral/[slug]">) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3 sm:gap-6">
      <Link
        href="/"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zpět do galerie
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
      <GoldenHeaderFrame slug={king.slug}>
        <CardCorners className="m-1 size-8 text-gold-dark" />
        {/* Portrait beside the name: compact enough to show the first question without scrolling. */}
        <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
        <div className="w-20 shrink-0 sm:w-28">
          <KingPortrait
            name={king.name}
            initial={initial}
            imageUrl={king.imageUrl}
            priority
            sizes="112px"
          />
        </div>
        <div className="flex flex-col items-start gap-0.5 text-left sm:gap-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
            Hra o kartu · {CORRECT_TO_COLLECT} z 5 správně
          </p>
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {king.title}
          </p>
          <h1 className="text-3xl leading-tight font-bold sm:text-5xl">{king.name}</h1>
          <KingReignLine slug={king.slug} reign={formatReign(king)} dynasty={king.dynasty} />
          {king.isLegend && <LegendBadge className="mt-1" />}
        </div>
        </div>
        {king.isLegend && <p className="text-sm font-medium text-ink/80 italic">{LEGEND_NOTE}</p>}
        <OrnamentDivider className="max-sm:hidden" />
        <KingBio slug={king.slug} bio={bio} />
        <GoldenRoundButton slug={king.slug} />
      </GoldenHeaderFrame>

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
