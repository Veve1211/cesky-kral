// Locked game modes (src/lib/reveal.ts): a new player sees every mode, the later ones
// with a 🔒 leading to the first card round; the first card unlocks everything.
import { expect, type Page, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

const nav = (page: Page) => page.getByRole("navigation", { name: "Hlavní navigace" });
const LOCKED = ["Rychlovka", "Kdo vládl dřív?", "Žebříček", "Můj erb"];
const first = [...kings].sort((a, b) => a.order - b.order)[0];

test("nový hráč: všechny režimy vidí, zamčené vedou na první kartu", async ({ page }) => {
  await open(page, "/");
  for (const label of LOCKED) {
    const link = nav(page).getByRole("link", { name: `${label} – odemkne se po první kartě` });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", `/kral/${first.slug}`);
  }
  for (const label of ["Moje sbírka", "Jak hrát"]) {
    await expect(nav(page).getByRole("link", { name: label, exact: true })).toBeVisible();
  }
  await expect(page.getByTestId("daily-home-card")).toBeHidden();
  await expect(page.getByTestId("daily-home-locked")).toBeVisible();
  await expect(page.getByTestId("daily-home-locked")).toContainText("Odemkne se po první kartě");
  await expect(page.getByTestId("home-locked")).toHaveCount(2);
  await expect(page.getByTestId("reveal-hint")).toBeVisible();

  await page.getByTestId("daily-home-locked").click();
  await expect(page).toHaveURL(new RegExp(`/kral/${first.slug}$`));
});

test("po první kartě je vše odemčené a zámky zmizí", async ({ page }) => {
  await setCollection(page, [first.slug]);
  await open(page, "/");
  for (const label of LOCKED) {
    await expect(nav(page).getByRole("link", { name: label, exact: true })).toBeVisible();
  }
  await expect(nav(page).getByTestId("nav-locked").first()).toBeHidden();
  await expect(page.getByTestId("daily-home-card")).toBeVisible();
  await expect(page.getByTestId("daily-home-locked")).toBeHidden();
  await expect(page.getByTestId("home-crest-link")).toBeVisible();
  await expect(page.getByTestId("reveal-hint")).toBeHidden();
});

test("zamčené režimy fungují přes přímý odkaz i pro nového hráče", async ({ page }) => {
  await open(page, "/rychlovka");
  await expect(page.getByRole("heading", { level: 1, name: /Rychlovka/ })).toBeVisible();
});
