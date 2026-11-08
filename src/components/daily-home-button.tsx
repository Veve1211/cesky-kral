"use client";

import Link from "next/link";

import { useCollectionReady } from "@/lib/collection";
import { DAILY_QUESTIONS, dailyDateKey, formatStreakDays } from "@/lib/daily";
import { currentStreak, marksFor, useDailyProgress } from "@/lib/daily-progress";

/** Main call to action on the home page: today's challenge and its state. */
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
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <Link
        href="/vyzva"
        aria-describedby="daily-home-status"
        className="gilt group relative flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-navy shadow-lg ring-2 ring-gold-dark/60 transition-[background-position,translate] duration-700 outline-none hover:bg-right hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring/60"
      >
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-2xl shadow-inner ring-2 ring-gold">
          👑
        </span>
        <span className="flex flex-col items-start text-left">
          <span className="font-heading text-2xl leading-tight font-bold">Denní výzva</span>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase">{action}</span>
        </span>
      </Link>
      <p id="daily-home-status" className="min-h-5 text-center text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
