import { expect, test } from "@playwright/test";

import { open, playRound, readCollection, setCollection } from "./helpers/game";
import { getKing } from "./helpers/seed-answers";

const SLUG = "karel-iv";
const hardCount = getKing(SLUG).questions.filter((q) => q.difficulty === 3).length;

test("zlaté kolo je bez karty zamčené", async ({ page }) => {
  await open(page, `/kral/${SLUG}/zlate-kolo`);
  await expect(page.getByRole("heading", { name: "Zlaté kolo je zamčené" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Hrát o kartu" })).toHaveAttribute("href", `/kral/${SLUG}`);
  await expect(page.getByText(/^Otázka\s*1\s*z/)).toHaveCount(0);
});

test("zlaté kolo s kartou: všechny těžké otázky správně → zlatá karta", async ({ page }) => {
  await setCollection(page, [SLUG]);
  await open(page, `/kral/${SLUG}/zlate-kolo`);

  const asked = await playRound(page, Array<boolean>(hardCount).fill(true));
  expect(asked.every((q) => q.difficulty === 3 && q.kingSlug === SLUG)).toBe(true);
  expect(new Set(asked.map((q) => q.text)).size).toBe(hardCount);

  await expect(page.getByRole("heading", { name: "Zlatá karta je tvoje!" })).toBeVisible();
  expect((await readCollection(page))?.golden).toEqual([SLUG]);

  await open(page, "/sbirka");
  await expect(page.getByLabel("Postup sbírky")).toContainText("Zlatých: 1 z");
});

test("zlaté kolo s chybou zlatou kartu nedá", async ({ page }) => {
  await setCollection(page, [SLUG]);
  await open(page, `/kral/${SLUG}/zlate-kolo`);
  await playRound(page, [false, ...Array<boolean>(hardCount - 1).fill(true)]);
  await expect(page.getByText("Konec zlatého kola")).toBeVisible();
  const stored = await readCollection(page);
  expect(stored?.kings).toEqual([SLUG]);
  expect(stored?.golden).toEqual([]);
});
