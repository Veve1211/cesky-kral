// Question rotation: a new king round prefers questions the player has not seen yet
// (localStorage `cesky-kral:seen`, no cookie). With 3 questions per difficulty and
// 2 easy ones in a round, the next round always starts with the unseen easy one.
import { expect, test } from "@playwright/test";

import { currentQuestion, open, playRound } from "./helpers/game";

test.use({ reducedMotion: "reduce" });

const SEEN_KEY = "cesky-kral:seen";
const SLUG = "karel-iv";

test("po Zkusit znovu začíná 2. kolo otázkou, která v 1. kole nebyla", async ({ page }) => {
  await open(page, `/kral/${SLUG}`);
  const first = await playRound(page, [false, false, false, false, false]);
  const firstTexts = new Set(first.map((q) => q.text));
  expect(firstTexts.size).toBe(5);

  await page.getByRole("button", { name: "Zkusit znovu" }).click();
  const second = await currentQuestion(page);
  expect(firstTexts.has(second.text)).toBe(false);

  // 5 seen + 3 new (1 easy, 1 medium, 1 hard were still unseen; the rest repeats the oldest).
  const seen = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), SEEN_KEY);
  expect(seen.version).toBe(1);
  expect(seen.ids).toHaveLength(8);
});

test("nové načtení stránky je nové kolo a začíná jinou otázkou", async ({ page }) => {
  await open(page, `/kral/${SLUG}`);
  const before = await currentQuestion(page);
  await page.reload();
  const after = await currentQuestion(page);
  expect(after.text).not.toBe(before.text);
});

test("poškozený záznam viděných otázek hru neshodí", async ({ page }) => {
  await open(page, "/zdroje");
  await page.evaluate((key) => window.localStorage.setItem(key, "{nonsense"), SEEN_KEY);
  await open(page, `/kral/${SLUG}`);
  await expect(page.getByText(/^Otázka\s*1\s*z\s*5$/)).toBeVisible();
});
