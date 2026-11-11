import { expect, test } from "@playwright/test";

import {
  answer,
  open,
  playRound,
  progress,
  readCollection,
  shownDifficulty,
} from "./helpers/game";
import { getKing, kings } from "./helpers/seed-answers";

const SLUG = "karel-iv";

test("výhra: správné odpovědi → karta se otočí → panovník je ve sbírce a hodnost se změní", async ({ page }) => {
  await open(page, "/");
  await expect(page.getByLabel("Postup sbírky")).toContainText("Panoš");

  await open(page, `/kral/${SLUG}`);
  await expect(page.getByRole("note")).toContainText("Rytířský slib");
  const asked = await playRound(page, [true, true, true, true, true]);
  expect(asked.every((q) => q.kingSlug === SLUG)).toBe(true);

  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();
  await expect(page.getByText("Skóre 5 z 5")).toBeVisible();
  // The card turns over from the silhouette to the portrait.
  await expect(page.locator(".flip-card")).toHaveAttribute("data-flipped", "true");
  await expect(page.getByRole("button", { name: "📜 Přečíst kroniku" })).toBeVisible();

  const stored = await readCollection(page);
  expect(stored?.kings).toContain(SLUG);

  await open(page, "/");
  const status = page.getByLabel("Postup sbírky");
  await expect(status).toContainText("Rytíř");
  await expect(status).toContainText(`Ve sbírce: 1 z ${kings.length}`);
  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  // The home gallery shows the card without crowns; the bronze "koruna učenosti" is in Moje sbírka.
  await expect(gallery.getByRole("button", { name: `král ${getKing(SLUG).name} – ve sbírce, přečíst kroniku` })).toBeVisible();
  await open(page, "/sbirka");
  await expect(page.getByRole("button", { name: `král ${getKing(SLUG).name}, bronzová koruna učenosti – ve sbírce, přečíst kroniku` })).toBeVisible();
});

test("prohra: špatné odpovědi → Zkusit znovu, panovník není ve sbírce", async ({ page }) => {
  await open(page, `/kral/${SLUG}`);
  await playRound(page, [false, false, false, false, false]);

  await expect(page.getByText("Konec hry")).toBeVisible();
  await expect(page.getByRole("button", { name: "Zkusit znovu" })).toBeVisible();
  expect((await readCollection(page))?.kings ?? []).not.toContain(SLUG);

  await open(page, "/sbirka");
  const missing = page.getByRole("region", { name: "Ještě chybí" });
  await expect(missing.getByRole("link", { name: `král ${getKing(SLUG).name} – hrát o kartu` })).toBeVisible();
});

test("3 správně z 5 nestačí na kartu", async ({ page }) => {
  await open(page, `/kral/${SLUG}`);
  await playRound(page, [true, true, true, false, false]);
  await expect(page.getByRole("button", { name: "Zkusit znovu" })).toBeVisible();
  expect((await readCollection(page))?.kings ?? []).not.toContain(SLUG);
});

test("otázky v kole jdou od lehkých po těžké (korunky 1, 1, 2, 2, 3)", async ({ page }) => {
  await open(page, `/kral/${SLUG}`);
  const crowns: number[] = [];
  for (let i = 1; i <= 5; i++) {
    await expect(progress(page, i, 5)).toBeVisible();
    const shown = await shownDifficulty(page);
    const question = await answer(page, i, 5, true);
    // The badge matches the difficulty in the seed.
    expect(shown).toBe(question.difficulty);
    crowns.push(shown);
  }
  expect(crowns).toEqual([1, 1, 2, 2, 3]);
});
