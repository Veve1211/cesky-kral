// Quizzes never move on by themselves: after every answer the player reads the
// explanation (the fact) and clicks "Další otázka" (Veve, 25. 11.).
// Kdo vládl dřív? and Řeka času (no facts to read) move on after a right answer;
// with "reduce motion" nothing moves on by itself.
import { expect, test } from "@playwright/test";

import { currentQuestion, open, progress, settleAnswer, waitForHydration } from "./helpers/game";
import { kingByName } from "./helpers/seed-answers";

test("kvíz: ani po správné odpovědi nenaskočí další otázka sama – vysvětlení jde v klidu přečíst", async ({ page }) => {
  await open(page, "/kral/josef-ii");
  const first = await currentQuestion(page);
  const right = page.getByRole("button", { name: first.correct, exact: true });
  await waitForHydration(right);
  await right.click();
  await settleAnswer(page, "Správně!");
  await expect(page.getByText(first.explanation)).toBeVisible();
  await expect(page.getByTestId("auto-advance")).toHaveCount(0);
  await page.waitForTimeout(2500);
  await expect(progress(page, 1, 5)).toBeVisible();
  await page.getByRole("button", { name: "Další otázka" }).click();
  await expect(progress(page, 2, 5)).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: (await currentQuestion(page)).text })).toBeFocused();
});

test("Kdo vládl dřív?: po správné volbě přijde další dvojice sama", async ({ page }) => {
  await open(page, "/kdo-driv");
  const buttons = page.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button");
  await expect(buttons).toHaveCount(2);
  await waitForHydration(buttons.first());
  const names = await Promise.all([0, 1].map(async (i) => (await buttons.nth(i).locator(".font-heading").textContent()) ?? ""));
  const kings = names.map(kingByName);
  const earlier = kings[0].reignFrom! <= kings[1].reignFrom! ? 0 : 1;
  await buttons.nth(earlier).click();
  await expect(page.getByText("Správně! 🔥 1")).toBeVisible();
  await expect(page.getByTestId("auto-advance")).toBeVisible();
  // The next pair: feedback gone, buttons enabled again, streak kept.
  await expect(page.getByText("Správně! 🔥 1")).toHaveCount(0, { timeout: 3000 });
  await expect(buttons.first()).toBeEnabled();
  await expect(page.getByText(/Série:\s*1/)).toBeVisible();
});
