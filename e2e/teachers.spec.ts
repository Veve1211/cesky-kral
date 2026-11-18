// Page for history teachers: reachable from the footer, how to use the game in class, privacy, feedback e-mail.
import { expect, test } from "@playwright/test";

import { open } from "./helpers/game";

test("pro učitele: odkaz v patičce vede na stránku s návodem a kontaktem", async ({ page }) => {
  await open(page, "/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Pro učitele" }).click();
  await expect(page).toHaveURL(/\/pro-ucitele$/);
  await expect(page).toHaveTitle("Pro učitele | Český král");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pro učitele");

  for (const heading of ["Co ve hře je", "Jak ji použít v hodině", "Bez osobních údajů", "Napište mi, jak to šlo"]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  await expect(page.getByRole("main").getByRole("link", { name: "Denní výzva" })).toHaveAttribute("href", "/vyzva");
  await expect(page.getByRole("link", { name: "paukrtovavera@seznam.cz" })).toHaveAttribute("href", /^mailto:/);
});
