"use client";

import Link from "next/link";

import { useCollectionReady } from "@/lib/collection";
import { DAILY_QUESTIONS, dailyDateKey, formatStreakDays } from "@/lib/daily";
import { currentStreak, marksFor, useDailyProgress } from "@/lib/daily-progress";

/** Second choice on the home page (under "Začni hrát"): today's challenge and its state. */
export function DailyHomeButton() {
  const ready = useCollectionReady();
  const progress = useDailyProgress();

  let status = `${DAILY_QUESTIONS} otázek, pro všechny stejných. Nová každý den o půlnoci.`;
  let action = "Hrát dnešní výzvu";
  if (ready) {
    const today = dailyDateKey();
    const marks = marksFor(progress, today);
    const streak = currentStreak(progress, today);
    const streakText = streak > 0 ? ` · 🔥 ${formatStreakDays(streak)}` : "";
    if (marks.length >= DAILY_QUESTIONS) {
      status = `Dnes splněno: ${marks.filter(Boolean).length} z ${marks.length}${streakText}`;
      action = "Zobrazit výsledek";
    } else if (marks.length > 0) {
      status = `Rozehráno: ${marks.length} z ${DAILY_QUESTIONS} otázek${streakText}`;
      action = "Dohrát výzvu";
    } else if (streak > 0) {
      status = `Udrž sérii: 🔥 ${formatStreakDays(streak)}`;
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-1.5">
      <Link
        href="/vyzva"
        aria-describedby="daily-home-status"
        className="flex w-full items-center gap-3 rounded-2xl bg-navy px-4 py-2.5 text-parchment shadow-md ring-1 ring-gold/70 transition-colors outline-none hover:bg-navy/90 focus-visible:ring-4 focus-visible:ring-ring/60"
      >
        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xl ring-1 ring-gold">
          👑
        </span>
        <span className="flex flex-1 flex-col items-start text-left">
          <span className="font-heading text-xl leading-tight font-bold">Denní výzva</span>
          <span className="text-[11px] font-semibold tracking-[0.15em] text-gold uppercase">{action}</span>
        </span>
      </Link>
      <p id="daily-home-status" className="min-h-5 text-center text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
