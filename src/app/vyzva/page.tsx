import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { DailyChallenge } from "@/components/daily-challenge";
import { CardCorners, OrnamentDivider } from "@/components/ornaments";
import { DAILY_QUESTIONS, dailyDateKey, formatDailyDate } from "@/lib/daily";
import { getDailyQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Denní výzva",
  description: `Každý den ${DAILY_QUESTIONS} otázek o českých panovnících, pro všechny stejných. Kolik dáš ty?`,
};

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
        <p className="max-w-sm text-parchment/85">
          {DAILY_QUESTIONS} otázek, pro všechny hráče stejných. Hraje se jednou denně, nová výzva
          přijde o půlnoci. Kolik jich dáš?
        </p>
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
  const questions = await getDailyQuestions(dateKey);
  // `key`: a new day starts a fresh round (e.g. after "Nová výzva je tu").
  return <DailyChallenge key={dateKey} dateKey={dateKey} questions={questions} />;
}
