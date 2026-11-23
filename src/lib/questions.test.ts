import { beforeEach, describe, expect, it, vi } from "vitest";

import { DAILY_QUESTIONS, pickDailyQuestions } from "./daily";

// A fake question pool: 6 kings × 9 questions (3 per difficulty), like the seed.
const pool = Array.from({ length: 6 }, (_, k) =>
  Array.from({ length: 9 }, (_, q) => ({
    id: k * 9 + q + 1,
    text: `Otázka ${q} krále ${k}`,
    difficulty: Math.floor(q / 3) + 1,
    king: { slug: `kral-${k}`, name: `Král ${k}`, isLegend: false },
    answers: [1, 2, 3].map((a) => ({ id: (k * 9 + q) * 3 + a, text: `Odpověď ${a}` })),
  })),
).flat();

type Args = { where?: { id?: { in: number[] } } };
const findMany = vi.fn(async (args: Args = {}) =>
  args.where?.id ? pool.filter((row) => args.where!.id!.in.includes(row.id)) : pool,
);

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => ({ question: { findMany } }) }));

// Fresh module (and so an empty per-day cache) for every test.
async function load() {
  vi.resetModules();
  return import("./questions");
}

const expectedIds = (dateKey: string) =>
  pickDailyQuestions(
    dateKey,
    pool.map((row) => ({ id: row.id, kingSlug: row.king.slug, text: row.text, difficulty: row.difficulty as 1 | 2 | 3 })),
  ).map(({ id }) => id);

describe("getDailyQuestionIds", () => {
  beforeEach(() => findMany.mockClear());

  it("returns the same ids as the pure daily pick", async () => {
    const { getDailyQuestionIds } = await load();
    const ids = await getDailyQuestionIds("2026-11-23");
    expect(ids).toHaveLength(DAILY_QUESTIONS);
    expect(ids).toEqual(expectedIds("2026-11-23"));
  });

  it("reads the question pool only once per day", async () => {
    const { getDailyQuestionIds } = await load();
    const first = await getDailyQuestionIds("2026-11-23");
    for (let i = 0; i < 5; i++) expect(await getDailyQuestionIds("2026-11-23")).toEqual(first);
    expect(findMany).toHaveBeenCalledTimes(1);

    await getDailyQuestionIds("2026-11-24");
    expect(findMany).toHaveBeenCalledTimes(2);
  });

  it("does not remember an empty pool", async () => {
    const { getDailyQuestionIds } = await load();
    findMany.mockResolvedValueOnce([]);
    expect(await getDailyQuestionIds("2026-11-23")).toEqual([]);
    expect(await getDailyQuestionIds("2026-11-23")).toEqual(expectedIds("2026-11-23"));
  });
});

describe("getDailyQuestions", () => {
  it("returns full questions in the daily order, without the correct answer", async () => {
    const { getDailyQuestions } = await load();
    const questions = await getDailyQuestions("2026-11-23");
    expect(questions.map((q) => q.id)).toEqual(expectedIds("2026-11-23"));
    for (const question of questions) {
      expect(question.answers).toHaveLength(3);
      expect(Object.keys(question.answers[0]).sort()).toEqual(["id", "text"]);
    }
  });
});
