"use client";

import Link from "next/link";
import { Swords } from "lucide-react";

import { useCollection, useCollectionReady } from "@/lib/collection";
import { nextStep, type StepKing } from "@/lib/next-step";
import { cn } from "@/lib/utils";

const BUTTON =
  "gilt group relative flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-navy shadow-lg ring-2 ring-gold-dark/60 transition-[background-position,translate] duration-700 outline-none hover:bg-right hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/60";

/**
 * The one main call to action on the home page. A new player goes straight
 * into the round for the first ruler ("Začni hrát"); a returning player sees
 * "Pokračuj" with the next ruler still missing. The collection lives in
 * localStorage, so the server (and the first paint) always shows "Začni hrát".
 */
export function StartButton({ kings }: { kings: StepKing[] }) {
  const ready = useCollectionReady();
  const { kings: collected, golden } = useCollection();
  const step = nextStep(kings, ready ? collected : [], ready ? golden : []);
  if (!step) return null;

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <Link
        href={step.href}
        data-testid="start-button"
        data-kind={step.kind}
        aria-describedby="start-button-detail"
        className={cn(BUTTON)}
      >
        <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy text-gold shadow-inner ring-2 ring-gold">
          <Swords className="size-6" />
        </span>
        <span className="font-heading text-3xl leading-tight font-bold">{step.label}</span>
      </Link>
      <p id="start-button-detail" className="min-h-5 text-center text-sm text-muted-foreground">
        {step.detail}
      </p>
    </div>
  );
}

export function StartButtonSkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2" aria-hidden>
      <div className="gilt h-20 w-full animate-pulse rounded-2xl opacity-70" />
      <p className="min-h-5" />
    </div>
  );
}
