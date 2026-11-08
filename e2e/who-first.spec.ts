import { expect, test, type Page } from "@playwright/test";

import { open, waitForHydration } from "./helpers/game";
import { kingByName } from "./helpers/seed-answers";

/** The two offered kings, the one who reigned first comes back first. */
async function pairByReign(page: Page) {
  const buttons = page.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button");
  await expect(buttons).toHaveCount(2);
  await expect(buttons.first()).toBeEnabled();
  const options = await Promise.all(
    [0, 1].map(async (i) => {
      const button = buttons.nth(i);
      const name = await button.locator(".font-heading").textContent();
      return { button, king: kingByName(name ?? "") };
    }),
  );
  return options.sort((a, b) => a.king.reignFrom! - b.king.reignFrom!);
}

test("Kdo vládl dřív?: správná volba zvýší sérii, špatná ukončí hru", async ({ page }) => {
  await open(page, "/kdo-driv");
  await expect(page.getByText(/Série:\s*0/)).toBeVisible();

  let [earlier, later] = await pairByReign(page);
  // Legends have no years and never appear in this game.
  expect(earlier.king.isLegend || later.king.isLegend).toBe(false);
  await waitForHydration(earlier.button);
  await earlier.button.click();
  await expect(page.getByText("Správně! 🔥 1")).toBeVisible();
  await expect(page.getByText(/Série:\s*1/)).toBeVisible();
  // The years are revealed after the answer.
  await expect(earlier.button).toContainText(String(earlier.king.reignFrom));

  await page.getByRole("button", { name: "Další" }).click();
  [earlier, later] = await pairByReign(page);
  await later.button.click();
  await expect(page.getByText("Vedle! Konec hry.")).toBeVisible();
  await expect(page.getByText(/Nejlepší série:\s*1/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Hrát znovu" })).toBeVisible();
  // No more picks after the game is over.
  await expect(earlier.button).toBeDisabled();
});
