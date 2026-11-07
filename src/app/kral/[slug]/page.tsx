import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { Crest } from "@/components/crest";
import { QuestionSkeleton } from "@/components/question-skeleton";
import { Progress } from "@/components/ui/progress";
import { CORRECT_TO_COLLECT, QUESTIONS_PER_KING } from "@/lib/game-rules";
import { getKingBySlug, kingInitial } from "@/lib/kings";

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

      <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-card" />}>
        <KingHeader params={params} />
      </Suspense>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>
            Otázka <strong>1</strong> z {QUESTIONS_PER_KING}
          </span>
          <span className="text-muted-foreground">
            Na kartu potřebuješ {CORRECT_TO_COLLECT} správně
          </span>
        </div>
        <Progress value={0} max={QUESTIONS_PER_KING} label="Postup ve hře" />
      </div>

      <QuestionSkeleton />
    </div>
  );
}

async function KingHeader({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const king = await getKingBySlug(slug);
  if (!king) notFound();

  return (
    <header className="flex items-start gap-4">
      <Crest initial={kingInitial(king.name)} className="w-16 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Hra o kartu
        </p>
        <h1 className="text-3xl font-bold leading-tight">{king.name}</h1>
        <p className="text-sm text-muted-foreground">
          {king.reignFrom}–{king.reignTo} · {king.dynasty}
        </p>
        <p className="text-sm">{king.shortBio}</p>
      </div>
    </header>
  );
}
