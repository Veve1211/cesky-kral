import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { Crest } from "@/components/crest";
import { Quiz } from "@/components/quiz";
import { CORRECT_TO_COLLECT } from "@/lib/game-rules";
import { getKingBySlug, kingInitial } from "@/lib/kings";
import { getKingQuestions } from "@/lib/questions";

export async function generateMetadata({
  params,
}: PageProps<"/kral/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const king = await getKingBySlug(slug);
  return { title: king ? king.name : "Král nenalezen" };
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

  const questions = await getKingQuestions(king.slug);
  const initial = kingInitial(king.name);

  return (
    <>
      <header className="flex items-start gap-4">
        <Crest initial={initial} className="w-16 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Hra o kartu · {CORRECT_TO_COLLECT} správně = karta
          </p>
          <h1 className="text-3xl font-bold leading-tight">{king.name}</h1>
          <p className="text-sm text-muted-foreground">
            {king.reignFrom}–{king.reignTo} · {king.dynasty}
          </p>
          <p className="text-sm">{king.shortBio}</p>
        </div>
      </header>

      <Quiz
        mode="king"
        questions={questions}
        king={{ slug: king.slug, name: king.name, initial }}
      />
    </>
  );
}

function GameSkeleton() {
  return (
    <div aria-busy="true" aria-label="Načítám hru" className="flex flex-col gap-6">
      <div className="h-24 animate-pulse rounded-2xl bg-card" />
      <div className="h-80 animate-pulse rounded-2xl bg-card" />
    </div>
  );
}
