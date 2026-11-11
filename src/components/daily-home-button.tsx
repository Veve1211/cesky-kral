"use client";

import Link from "next/link";

import { useCollectionReady } from "@/lib/collection";
import { DAILY_QUESTIONS, dailyDateKey, formatStreakDays } from "@/lib/daily";
import { currentStreak, marksFor, useDailyProgress } from "@/lib/daily-progress";

/** Second choice on the home page (under "Začni hrát"): today's challenge and its state. */
export function DailyHomeButton() {
  const ready = useCollectionReady();
  const progress = useDailyProgress();

  let status = `Dnes ještě nedohráno · ${DAILY_QUESTIONS} stejných otázek pro všechny`;
  let action = "Hrát";
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
      action = "Dohrát";
    } else if (streak > 0) {
      status = `Dnes ještě nedohráno · Udrž sérii: 🔥 ${formatStreakDays(streak)}`;
    }
  }

  // A card under the main button: clearly visible, but smaller than "Začni hrát".
  return (
    <Link
      href="/vyzva"
      aria-describedby="daily-home-status"
      data-testid="daily-home-card"
      className="flex w-full max-w-sm items-center gap-3 rounded-2xl bg-navy px-3.5 py-2 text-parchment shadow-md ring-1 ring-gold/70 transition-colors outline-none hover:bg-navy/90 focus-visible:ring-4 focus-visible:ring-ring/60"
    >
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xl ring-1 ring-gold">
        👑
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className="font-heading text-lg leading-tight font-bold">Denní výzva</span>
        <span id="daily-home-status" className="text-xs leading-snug text-parchment/85">
          {status}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-navy shadow">{action}</span>
    </Link>
  );
}
