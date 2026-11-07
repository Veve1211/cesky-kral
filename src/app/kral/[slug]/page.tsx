import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Crest } from "@/components/crest";
import { QuestionSkeleton } from "@/components/question-skeleton";
import { Progress } from "@/components/ui/progress";
import { demoKings, getDemoKing } from "@/lib/demo-kings";
import { CORRECT_TO_COLLECT, QUESTIONS_PER_KING } from "@/lib/game-rules";

export function generateStaticParams() {
  return demoKings.map((king) => ({ slug: king.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/kral/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const king = getDemoKing(slug);
  return { title: king ? king.name : "Král nenalezen" };
}

export default async function KingGamePage({
  params,
}: PageProps<"/kral/[slug]">) {
  const { slug } = await params;
  // Only known slugs are accepted; anything else returns 404.
  const king = getDemoKing(slug);
  if (!king) notFound();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Link
        href="/"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zpět do sbírky
      </Link>

      <header className="flex items-center gap-4">
        <Crest initial={king.initial} className="w-16 shrink-0" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Hra o kartu
          </p>
          <h1 className="text-3xl font-bold leading-tight">{king.name}</h1>
          <p className="text-sm text-muted-foreground">{king.subtitle}</p>
        </div>
      </header>

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
