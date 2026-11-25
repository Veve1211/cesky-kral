// Progressive reveal of game modes (src/lib/reveal.ts): a new player starts with
// the main game only; the first card adds Denní výzva + Můj erb, three cards the rest.
import { expect, type Page, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

const nav = (page: Page) => page.getByRole("navigation", { name: "Hlavní navigace" });
const slugs = (n: number) => kings.slice(0, n).map((king) => king.slug);

test("nový hráč: jen hra o kartu, sbírka a nápověda; ostatní se odemkne kartami", async ({ page }) => {
  await open(page, "/");
  await expect(page.getByRole("link", { name: /Začni hrát/ })).toBeVisible();
  await expect(page.getByTestId("daily-home-card")).toBeHidden();
  await expect(page.getByTestId("home-crest-link")).toBeHidden();
  for (const label of ["Rychlovka", "Kdo vládl dřív?", "Žebříček", "Můj erb"]) {
    await expect(nav(page).getByRole("link", { name: label })).toBeHidden();
  }
  for (const label of ["Moje sbírka", "Jak hrát"]) {
    await expect(nav(page).getByRole("link", { name: label })).toBeVisible();
  }
  await expect(page.getByTestId("reveal-hint").filter({ hasText: "Po první kartě" })).toBeVisible();
});

test("po první kartě: Denní výzva a Můj erb, ostatní hry až po třech kartách", async ({ page }) => {
  await setCollection(page, slugs(1));
  await open(page, "/");
  await expect(page.getByTestId("daily-home-card")).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Můj erb" })).toBeVisible();
  await expect(nav(page).getByRole("link", { name: "Rychlovka" })).toBeHidden();
  await expect(page.getByTestId("reveal-hint").filter({ hasText: "Po třech kartách se ti" })).toBeVisible();
});

test("po třech kartách je vidět všechno a nápověda zmizí", async ({ page }) => {
  await setCollection(page, slugs(3));
  await open(page, "/");
  for (const label of ["Rychlovka", "Kdo vládl dřív?", "Žebříček", "Můj erb"]) {
    await expect(nav(page).getByRole("link", { name: label })).toBeVisible();
  }
  await expect(page.getByTestId("daily-home-card")).toBeVisible();
  await expect(page.getByTestId("reveal-hint")).toHaveCount(2);
  for (const hint of await page.getByTestId("reveal-hint").all()) await expect(hint).toBeHidden();
});

test("skryté režimy fungují přes přímý odkaz i pro nového hráče", async ({ page }) => {
  await open(page, "/rychlovka");
  await expect(page.getByRole("heading", { level: 1, name: /Rychlovka/ })).toBeVisible();
});
