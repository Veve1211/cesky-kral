// Question rotation: a new king round (a new visit of the page) prefers questions
// the player has not seen yet (localStorage `cesky-kral:seen`, no cookie).
// "Zkusit znovu" repeats the same questions in a new order, so the player learns them.
import { expect, test } from "@playwright/test";

import { currentQuestion, open, playRound } from "./helpers/game";

test.use({ reducedMotion: "reduce" });

const SEEN_KEY = "cesky-kral:seen";
const SLUG = "karel-iv";

test("Zkusit znovu: stejné otázky jako v prohraném kole (jen v jiném pořadí)", async ({ page }) => {
  await open(page, `/kral/${SLUG}`);
  const first = await playRound(page, [false, false, false, false, false]);
  const firstTexts = first.map((q) => q.text).sort();
  expect(new Set(firstTexts).size).toBe(5);

  await page.getByRole("button", { name: "Zkusit znovu" }).click();
  const second = await playRound(page, [false, false, false, false, false]);
  expect(second.map((q) => q.text).sort()).toEqual(firstTexts);

  const seen = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), SEEN_KEY);
  expect(seen.version).toBe(1);
  expect(seen.ids).toHaveLength(5);
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
