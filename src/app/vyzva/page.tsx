import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { DailyChallenge } from "@/components/daily-challenge";
import { DailyCountdown } from "@/components/daily-countdown";
import { DailyLeaderboard } from "@/components/daily-leaderboard";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { DAILY_QUESTIONS, dailyDateKey, formatDailyDate } from "@/lib/daily";
import { getDailyLeaderboard } from "@/lib/daily-server";
import { getDailyQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Denní výzva",
  description: `Každý den ${DAILY_QUESTIONS} otázek o českých panovnících, pro všechny stejných. Kolik dáš ty?`,
};

const RULES = [
  { icon: "👥", text: "Všichni dnes hrají stejné otázky." },
  { icon: "☝️", text: "Jeden pokus denně – odpověď už nejde vzít zpět." },
  { icon: "🕛", text: "Nová výzva o půlnoci (český čas)." },
];

export default function DailyPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-navy px-6 py-8 text-center text-parchment shadow-xl ring-2 ring-gold">
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/50" />
        <CardCorners className="m-1 size-9 text-gold" />
        <span aria-hidden className="gilt flex size-12 items-center justify-center rounded-full text-2xl shadow-md">
          👑
        </span>
        <h1 className="text-5xl font-bold">Denní výzva</h1>
        <Suspense fallback={<p className="h-5" />}>
          <DailyDate />
        </Suspense>
        <OrnamentDivider />
        <ul aria-label="Pravidla výzvy" className="flex flex-col gap-1.5 text-left text-parchment/90">
          {RULES.map((rule) => (
            <li key={rule.text} className="flex gap-2">
              <span aria-hidden>{rule.icon}</span>
              {rule.text}
            </li>
          ))}
        </ul>
        <DailyCountdown
          label="Nová výzva za"
          withReload={false}
          className="rounded-full bg-white/10 px-4 py-1.5 text-parchment"
          timeClassName="font-semibold text-gold"
        />
      </header>

      <Suspense fallback={<div className="parchment h-80 animate-pulse rounded-2xl" />}>
        <DailyContent />
      </Suspense>
    </div>
  );
}

async function DailyDate() {
  await connection();
  return (
    <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
      {formatDailyDate(dailyDateKey())}
    </p>
  );
}

async function DailyContent() {
  // The day is decided on the server (Czech time), on every request.
  await connection();
  const dateKey = dailyDateKey();
  const [questions, board] = await Promise.all([getDailyQuestions(dateKey), getDailyLeaderboard(dateKey)]);
  // `key`: a new day starts a fresh round (e.g. after "Nová výzva je tu").
  return (
    <>
      <DailyChallenge key={dateKey} dateKey={dateKey} questions={questions} />
      <DailyLeaderboard key={`board-${dateKey}`} initial={board} />
    </>
  );
}
