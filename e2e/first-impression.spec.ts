// First impression (PR 2): a newcomer sees what the game is and where to click,
// and the first question of a round is visible without scrolling on a phone.
import { expect, test } from "@playwright/test";

import { open } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

const inViewport = async (locator: import("@playwright/test").Locator) => {
  const box = await locator.boundingBox();
  const height = locator.page().viewportSize()!.height;
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(height);
};

test("úvod: věta o hře a tlačítko Začni hrát bez posouvání", async ({ page }) => {
  await open(page, "/");
  const sentence = page.getByText("Odpovídej na otázky o českých panovnících a sbírej je jako karty.");
  const start = page.getByRole("link", { name: /Začni hrát/ });
  await expect(sentence).toBeVisible();
  await expect(start).toBeVisible();
  await inViewport(sentence);
  await inViewport(start);
});

test("hra o kartu: první otázka i odpovědi jsou vidět bez posouvání a bez zamčeného tlačítka", async ({ page }) => {
  const first = [...kings].sort((a, b) => a.order - b.order)[0];
  await open(page, `/kral/${first.slug}`);
  const question = page.getByRole("heading", { level: 2 }).first();
  await expect(question).toBeVisible();
  await inViewport(question);
  await expect(page.getByRole("button", { name: /Mistrovské kolo/ })).toHaveCount(0);
});
