// /jak-hrat – rules page, reachable from the header menu.
import { expect, test } from "@playwright/test";

import { CORRECT_TO_COLLECT, QUICK_ROUND_QUESTIONS, RANKS } from "../src/lib/game-rules";
import { DAILY_QUESTIONS } from "../src/lib/daily";
import { open } from "./helpers/game";

test("Jak hrát: odkaz v menu, pět kroků, časté otázky a tlačítko Hrát", async ({ page }) => {
  await open(page, "/");
  const nav = page.getByRole("navigation", { name: "Hlavní navigace" });
  const link = nav.getByRole("link", { name: "Jak hrát" });
  await expect(link).toBeVisible();
  // The label is shown as text, not only as an icon.
  await expect(link.getByText("Jak hrát", { exact: true })).toBeVisible();
  await link.click();
  await expect(page).toHaveURL("/jak-hrat");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jak hrát");
  await expect(link).toHaveAttribute("aria-current", "page");

  // Numbered steps.
  const steps = page.locator("main ol").first().locator(":scope > li");
  await expect(steps).toHaveCount(5);
  for (const [i, title] of ["Cíl hry", "Jak získáš panovníka", "Herní režimy", "Moje sbírka a kronika", "Odkud jsou fakta"].entries()) {
    await expect(page.getByRole("heading", { level: 2, name: `Krok ${i + 1}: ${title}` })).toBeVisible();
  }

  // The numbers come from the game rules.
  const main = page.locator("main");
  await expect(main).toContainText(`${CORRECT_TO_COLLECT} z 5`);
  await expect(main).toContainText(`${QUICK_ROUND_QUESTIONS} náhodných otázek`);
  await expect(main).toContainText(`${DAILY_QUESTIONS} otázek, každý den stejných`);
  for (const rank of RANKS) await expect(main).toContainText(rank);

  // Every mode links to its page.
  for (const [name, href] of [["Denní výzva", "/vyzva"], ["Rychlovka", "/rychlovka"], ["Kdo vládl dřív?", "/kdo-driv"], ["Zlaté kolo", "/sbirka"]]) {
    await expect(main.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }

  // FAQ: closed at first, opens from the keyboard.
  const faq = page.getByRole("region", { name: "Časté otázky" });
  const items = faq.locator("details");
  await expect(items).toHaveCount(5);
  const first = items.first();
  const answer = first.locator("p");
  await expect(answer).toBeHidden();
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(answer).toBeVisible();
  await expect(answer).toContainText("v tvém prohlížeči");

  await page.getByRole("link", { name: "Hrát", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("patička odkazuje na Jak hrát", async ({ page }) => {
  await open(page, "/zdroje");
  await page.getByRole("contentinfo").getByRole("link", { name: "Jak hrát" }).click();
  await expect(page).toHaveURL("/jak-hrat");
});
