import { describe, expect, it } from "vitest";

import {
  DAILY_QUESTIONS,
  dailyDateKey,
  dailyShareText,
  formatCountdown,
  formatStreakDays,
  isDateKey,
  msUntilNextDaily,
  pickDailyQuestions,
  pragueDayStart,
  shiftDateKey,
  weekStartKey,
} from "@/lib/daily";
import type { Difficulty } from "@/lib/game-rules";

describe("Prague calendar day", () => {
  it("starts the new day at midnight in Prague (winter, UTC+1)", () => {
    expect(dailyDateKey(new Date("2026-11-19T22:59:59Z"))).toBe("2026-11-19");
    expect(dailyDateKey(new Date("2026-11-19T23:00:00Z"))).toBe("2026-11-20");
  });

  it("starts the new day at midnight in Prague (summer, UTC+2)", () => {
    expect(dailyDateKey(new Date("2026-07-01T21:59:59Z"))).toBe("2026-07-01");
    expect(dailyDateKey(new Date("2026-07-01T22:00:00Z"))).toBe("2026-07-02");
  });

  it("finds local midnight, also on the day the clocks change", () => {
    expect(pragueDayStart("2026-11-20").toISOString()).toBe("2026-11-19T23:00:00.000Z");
    expect(pragueDayStart("2026-07-02").toISOString()).toBe("2026-07-01T22:00:00.000Z");
    expect(pragueDayStart("2026-03-29").toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(pragueDayStart("2026-10-25").toISOString()).toBe("2026-10-24T22:00:00.000Z");
  });

  it("counts down to the next Prague midnight", () => {
    expect(msUntilNextDaily(new Date("2026-11-19T22:59:00Z"))).toBe(60_000);
    expect(msUntilNextDaily(new Date("2026-07-01T21:00:00Z"))).toBe(3_600_000);
  });

  it("validates and shifts date keys", () => {
    expect(isDateKey("2026-02-28")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("2026-2-1")).toBe(false);
    expect(isDateKey(20261120)).toBe(false);
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("weeks start on Monday", () => {
    expect(weekStartKey("2026-11-20")).toBe("2026-11-16"); // Friday
    expect(weekStartKey("2026-11-16")).toBe("2026-11-16"); // Monday
    expect(weekStartKey("2026-11-22")).toBe("2026-11-16"); // Sunday
  });
});

describe("texts", () => {
  it("formats the countdown and Czech plural of days", () => {
    expect(formatCountdown(3_723_000)).toBe("01:02:03");
    expect(formatCountdown(-5)).toBe("00:00:00");
    expect([1, 2, 4, 5, 0].map(formatStreakDays)).toEqual(["1 den", "2 dny", "4 dny", "5 dní", "0 dní"]);
  });

  it("builds the share text with streak and place", () => {
    const text = dailyShareText("2026-11-08", [true, true, false, true, true], 3, { rank: 2, total: 10 });
    expect(text).toContain("výzva 8. 11. 4/5");
    expect(text).toContain("🔥 3 dny");
    expect(text).toContain("🏆 2. místo z 10");
    expect(dailyShareText("2026-11-08", [true], 1)).not.toContain("🔥");
  });
});

describe("questions of the day", () => {
  const kings = ["a", "b", "c", "d", "e", "f"];
  const pool = kings.flatMap((kingSlug) =>
    ([1, 2, 3] as Difficulty[]).flatMap((difficulty) =>
      [1, 2, 3].map((n) => ({ kingSlug, difficulty, text: `${kingSlug}-${difficulty}-${n}` })),
    ),
  );

  it("picks 2 easy, 2 medium and 1 hard question, each from a different king", () => {
    const picked = pickDailyQuestions("2026-11-20", pool);
    expect(picked).toHaveLength(DAILY_QUESTIONS);
    expect(picked.map((q) => q.difficulty)).toEqual([1, 1, 2, 2, 3]);
    expect(new Set(picked.map((q) => q.kingSlug)).size).toBe(DAILY_QUESTIONS);
  });

  it("is the same for everyone that day, whatever the order of the pool", () => {
    const a = pickDailyQuestions("2026-11-20", pool);
    const b = pickDailyQuestions("2026-11-20", [...pool].reverse());
    expect(b.map((q) => q.text)).toEqual(a.map((q) => q.text));
  });

  it("changes from day to day", () => {
    const days = ["2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"].map((d) =>
      pickDailyQuestions(d, pool)
        .map((q) => q.text)
        .join(),
    );
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it("still fills the round when there are too few kings", () => {
    const twoKings = pool.filter((q) => q.kingSlug === "a" || q.kingSlug === "b");
    expect(pickDailyQuestions("2026-11-20", twoKings)).toHaveLength(DAILY_QUESTIONS);
  });
});

describe("dnešní král / královna", () => {
  it("a perfect challenge adds the title to the share text, one mistake does not", () => {
    expect(dailyShareText("2026-11-08", [true, true, true, true, true], 1)).toContain("dnešní král / královna 👑");
    expect(dailyShareText("2026-11-08", [true, true, true, true, false], 1)).not.toContain("dnešní král");
  });
});
