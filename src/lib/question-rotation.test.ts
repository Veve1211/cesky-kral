import { describe, expect, it } from "vitest";

import { pickRound } from "@/lib/question-rotation";
import { addSeen, parseSeen, SEEN_LIMIT } from "@/lib/seen-questions";
import type { QuizQuestion } from "@/lib/quiz-types";

// A ruler's pool: ids 1–3 easy, 4–6 medium, 7–9 hard.
const pool: QuizQuestion[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  text: `Q${i + 1}`,
  difficulty: (Math.floor(i / 3) + 1) as 1 | 2 | 3,
  kingName: "Karel IV.",
  isLegend: false,
  answers: [],
}));
const ids = (round: QuizQuestion[]) => round.map((q) => q.id);

describe("pickRound", () => {
  it("keeps the round plan: 2 easy, 2 medium, 1 hard, from easy to hard", () => {
    const round = pickRound(pool, []);
    expect(round.map((q) => q.difficulty)).toEqual([1, 1, 2, 2, 3]);
  });

  it("prefers questions the player has not seen yet", () => {
    const round = pickRound(pool, [1, 2, 4, 5, 7], () => 0.5);
    expect(ids(round).sort((a, b) => a - b)).toContain(3);
    expect(ids(round)).toContain(6);
    expect(ids(round)).toContain(8);
    expect(ids(round)).not.toContain(7);
  });

  it("when everything was seen, takes the ones seen longest ago", () => {
    const seen = [1, 4, 7, 2, 5, 8, 3, 6, 9]; // oldest first
    expect(ids(pickRound(pool, seen, () => 0.5))).toEqual([1, 2, 4, 5, 7]);
  });

  it("is random among unseen questions", () => {
    let up = 0;
    let down = 1;
    const rising = () => (up += 0.01);
    const falling = () => (down -= 0.01);
    expect(ids(pickRound(pool, [], rising)).slice(0, 2)).toEqual([1, 2]);
    expect(ids(pickRound(pool, [], falling)).slice(0, 2)).toEqual([3, 2]);
  });
});

describe("seen questions storage", () => {
  it("parses only the expected shape", () => {
    expect(parseSeen(JSON.stringify({ version: 1, ids: [3, 1, 3, -2, "x", 1.5] }))).toEqual([3, 1]);
    expect(parseSeen("{broken")).toEqual([]);
    expect(parseSeen(JSON.stringify({ version: 2, ids: [1] }))).toEqual([]);
    expect(parseSeen(null)).toEqual([]);
  });

  it("moves shown ids to the newest end and keeps the limit", () => {
    expect(addSeen([1, 2, 3], [2, 4])).toEqual([1, 3, 2, 4]);
    const many = Array.from({ length: SEEN_LIMIT }, (_, i) => i + 1);
    const next = addSeen(many, [999]);
    expect(next).toHaveLength(SEEN_LIMIT);
    expect(next[0]).toBe(2);
    expect(next.at(-1)).toBe(999);
  });
});
