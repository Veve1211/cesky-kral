// After a card is won for the first time, the ruler drops into "Řeka času"
// among the rulers already collected (only collected ones are shown).
import { expect, test } from "@playwright/test";

import { answer, currentQuestion, open, setCollection, settleAnswer, waitForHydration } from "./helpers/game";
import { getKing } from "./helpers/seed-answers";

test("výhra karty: panovník se zařadí do Řeky času mezi získané", async ({ page }, testInfo) => {
  const karel = getKing("karel-iv");
  await setCollection(page, ["libuse", "rudolf-ii"]);
  await open(page, `/kral/${karel.slug}`);
  for (let i = 1; i <= 4; i++) await answer(page, i, 5, true);
  const last = await currentQuestion(page);
  const right = page.getByRole("button", { name: last.correct, exact: true });
  await waitForHydration(right);
  await right.click();
  await settleAnswer(page, "Správně!").catch(() => null);
  const result = page.getByRole("button", { name: "Zobrazit výsledek" });
  if (await result.isVisible().catch(() => false)) await result.click();

  const river = page.getByTestId("card-celebration").getByTestId("timeline-placement");
  await expect(river).toBeVisible();
  // Libuše, Karel IV., Rudolf II. – in the order of reign; nobody else.
  await expect(river.locator("li")).toHaveCount(3);
  await expect(river.locator("li").nth(1)).toHaveAttribute("data-new", "true");
  await expect(river.locator("li").nth(1)).toContainText(karel.name);
  await expect(river).toContainText(`${karel.name} zaujímá své místo v Řece času.`);
  if (testInfo.project.name === "mobile") {
    await page.waitForTimeout(3200);
    await river.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("river.png") });
  }
});
