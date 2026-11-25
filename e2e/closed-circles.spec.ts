// "Tři uzavřené kruhy": Hra o kartu (easy + medium card questions), Mistrovské
// kolo (hard card questions) and Denní výzva (its own pool) never share a question.
import { expect, test } from "@playwright/test";

import { currentQuestion, open, setCollection } from "./helpers/game";
import { dailyQuestions, getKing, kings } from "./helpers/seed-answers";

const norm = (text: string) => text.replace(/\s+/g, " ").trim();

test("data: každý panovník má vlastní 3 otázky výzvy (lehká, střední, těžká) se zdrojem, nikde jinde nejsou", () => {
  const cardTexts = new Set(kings.flatMap((king) => king.questions.map((q) => norm(q.text))));
  const dailyTexts = kings.flatMap((king) => (dailyQuestions[king.slug] ?? []).map((q) => norm(q.text)));
  expect(dailyTexts).toHaveLength(54);
  expect(new Set(dailyTexts).size).toBe(54);
  for (const text of dailyTexts) expect(cardTexts.has(text), text).toBe(false);
  for (const king of kings) {
    const daily = dailyQuestions[king.slug] ?? [];
    expect(daily.map((q) => q.difficulty).sort(), king.slug).toEqual([1, 2, 3]);
    for (const q of daily) {
      expect(q.sourceUrl, q.text).toMatch(/^https:\/\//);
      expect(new Set([q.correct, ...q.wrong]).size, q.text).toBe(3);
    }
  }
});

test("hra o kartu: jen lehké a střední otázky toho panovníka, nikdy těžká ani otázka výzvy", async ({ page }) => {
  const king = getKing("karel-iv");
  const allowed = new Set(king.questions.filter((q) => q.difficulty <= 2).map((q) => norm(q.text)));
  await open(page, `/kral/${king.slug}`);
  const shown = await currentQuestion(page);
  expect(allowed.has(norm(shown.text)), shown.text).toBe(true);
});

test("mistrovské kolo: jen těžké otázky ze hry o kartu", async ({ page }) => {
  const king = getKing("karel-iv");
  await setCollection(page, [king.slug]);
  await open(page, `/kral/${king.slug}/zlate-kolo`);
  const shown = await currentQuestion(page);
  expect(shown.difficulty, shown.text).toBe(3);
  expect(king.questions.some((q) => q.text === shown.text), shown.text).toBe(true);
});

test("denní výzva: otázka je z vlastní sady výzvy a jméno panovníka je vidět", async ({ page }) => {
  await open(page, "/vyzva");
  const shown = await currentQuestion(page);
  const daily = dailyQuestions[shown.kingSlug] ?? [];
  expect(daily.some((q) => q.text === shown.text), shown.text).toBe(true);
  const ruler = page.getByTestId("question-ruler");
  await expect(ruler).toBeVisible();
  await expect(ruler).toContainText(getKing(shown.kingSlug).name);
});
