import { expect, test } from "@playwright/test";

import { open } from "./helpers/game";

test("Soukromí: odkaz v patičce vede na stránku s přehledem ukládaných údajů", async ({ page }) => {
  await open(page, "/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Soukromí" }).click();
  await expect(page).toHaveURL("/soukromi");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Soukromí");
  await expect(page.getByRole("heading", { name: "Co neukládáme" })).toBeVisible();
  await expect(page.getByRole("link", { name: "paukrtovavera@seznam.cz" })).toHaveAttribute(
    "href",
    "mailto:paukrtovavera@seznam.cz",
  );
});
