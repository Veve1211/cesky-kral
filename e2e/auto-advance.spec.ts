// After a right answer the game moves on by itself after about a second;
// a wrong answer in a quiz waits for "Další" (explanation can be read).
// With "reduce motion" nothing moves on by itself.
import { expect, test } from "@playwright/test";

import { currentQuestion, open, progress, settleAnswer, waitForHydration } from "./helpers/game";
import { kingByName } from "./helpers/seed-answers";

test("kvíz: po správné odpovědi další otázka naskočí sama, po chybné čeká na Další", async ({ page }) => {
  await open(page, "/kral/josef-ii");
  const first = await currentQuestion(page);
  const right = page.getByRole("button", { name: first.correct, exact: true });
  await waitForHydration(right);
  await right.click();
  await settleAnswer(page, "Správně!");
  await expect(page.getByTestId("auto-advance")).toBeVisible();
  // No click – the next question comes by itself within about a second.
  await expect(progress(page, 2, 5)).toBeVisible({ timeout: 3000 });
  await expect(page.getByRole("heading", { level: 2, name: (await currentQuestion(page)).text })).toBeFocused();

  const second = await currentQuestion(page);
  await page.getByRole("button", { name: second.wrong[0], exact: true }).click();
  await settleAnswer(page, "Tentokrát vedle.");
  await expect(page.getByTestId("auto-advance")).toHaveCount(0);
  await page.waitForTimeout(2000);
  await expect(progress(page, 2, 5)).toBeVisible();
  await page.getByRole("button", { name: "Další otázka" }).click();
  await expect(progress(page, 3, 5)).toBeVisible();
});

test("omezený pohyb v systému: nic nenaskočí samo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/kral/josef-ii");
  const first = await currentQuestion(page);
  const right = page.getByRole("button", { name: first.correct, exact: true });
  await waitForHydration(right);
  await right.click();
  await settleAnswer(page, "Správně!");
  await page.waitForTimeout(2000);
  await expect(progress(page, 1, 5)).toBeVisible();
  await expect(page.getByTestId("auto-advance")).toHaveCount(0);
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
