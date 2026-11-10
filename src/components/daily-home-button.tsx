"use client";

import Link from "next/link";

import { useCollectionReady } from "@/lib/collection";
import { DAILY_QUESTIONS, dailyDateKey, formatStreakDays } from "@/lib/daily";
import { currentStreak, marksFor, useDailyProgress } from "@/lib/daily-progress";

/** Small second choice on the home page (under "Začni hrát"): today's challenge and its state. */
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

  // A small text link: the main game button above stays the one big choice.
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <Link
        href="/vyzva"
        aria-describedby="daily-home-status"
        className="text-sm font-semibold text-navy underline decoration-gold underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-4 focus-visible:ring-ring/60"
      >
        <span aria-hidden>👑 </span>Denní výzva · {action}
      </Link>
      <p id="daily-home-status" className="min-h-4 text-xs text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
