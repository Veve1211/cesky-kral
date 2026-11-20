import { describe, expect, it } from "vitest";

import { QUESTION_KEY_PATTERN, questionKey, tierFor, tierThresholds } from "@/lib/mastery";

describe("knowledge crowns", () => {
  it("needs 3, 6 and 9 correct questions out of nine", () => {
    expect(tierThresholds(9)).toEqual([3, 6, 9]);
  });

  it.each([
    [0, 0],
    [2, 0],
    [3, 1],
    [5, 1],
    [6, 2],
    [8, 2],
    [9, 3],
    [12, 3],
  ])("%i of 9 known → tier %i", (known, tier) => {
    expect(tierFor(known, 9)).toBe(tier);
  });

  it("scales with a different number of questions", () => {
    expect(tierThresholds(4)).toEqual([2, 3, 4]);
    expect(tierFor(4, 4)).toBe(3);
  });

  it("gives no crown without questions", () => {
    expect(tierFor(5, 0)).toBe(0);
    expect(tierFor(5, Number.NaN)).toBe(0);
  });
});

describe("question key", () => {
  it("is stable, short and ignores surrounding spaces", () => {
    const key = questionKey("karel-iv", "Kdo založil Univerzitu Karlovu?");
    expect(key).toBe(questionKey("karel-iv", "  Kdo založil Univerzitu Karlovu?  "));
    expect(key).toMatch(QUESTION_KEY_PATTERN);
  });

  it("differs between rulers and questions", () => {
    const a = questionKey("karel-iv", "Otázka");
    expect(questionKey("vaclav-ii", "Otázka")).not.toBe(a);
    expect(questionKey("karel-iv", "Jiná otázka")).not.toBe(a);
  });
});
