import { describe, expect, it } from "vitest";

import { CORRECT_TO_COLLECT, QUESTIONS_PER_KING, RANKS, ROUND_PLAN, getRank, toDifficulty } from "@/lib/game-rules";
import { formatReign, toKingTitle } from "@/lib/king-display";

describe("round plan", () => {
  it("has 5 questions: 2 easy, 2 medium, 1 hard, in this order", () => {
    expect(ROUND_PLAN.map((s) => [s.difficulty, s.count])).toEqual([
      [1, 2],
      [2, 2],
      [3, 1],
    ]);
    expect(ROUND_PLAN.reduce((sum, s) => sum + s.count, 0)).toBe(QUESTIONS_PER_KING);
  });

  it("needs 4 of 5 correct answers for a card", () => {
    expect(CORRECT_TO_COLLECT).toBe(4);
    expect(CORRECT_TO_COLLECT).toBeLessThanOrEqual(QUESTIONS_PER_KING);
  });

  it("maps unknown difficulties to easy", () => {
    expect([1, 2, 3, 0, 7, -1].map(toDifficulty)).toEqual([1, 2, 3, 1, 1, 1]);
  });
});

describe("rank by share of collected kings", () => {
  it.each([
    [0, 18, RANKS[0]],
    [1, 18, RANKS[1]],
    [8, 18, RANKS[1]],
    [9, 18, RANKS[2]],
    [17, 18, RANKS[2]],
    [18, 18, RANKS[3]],
    [20, 18, RANKS[3]],
    [3, 0, RANKS[0]],
  ])("%i of %i → %s", (collected, total, rank) => {
    expect(getRank(collected, total)).toBe(rank);
  });
});

describe("king display", () => {
  it("hides years of legends and unknown reigns", () => {
    expect(formatReign({ isLegend: false, reignFrom: 1346, reignTo: 1378 })).toBe("1346–1378");
    expect(formatReign({ isLegend: true, reignFrom: 700, reignTo: 720 })).toBeNull();
    expect(formatReign({ isLegend: false, reignFrom: 1346, reignTo: null })).toBeNull();
  });

  it("falls back to 'král' for an unknown title", () => {
    expect(toKingTitle("královna")).toBe("královna");
    expect(toKingTitle("císař")).toBe("král");
  });
});
