import { expect, test } from "@playwright/test";

import { answer, open, progress } from "./helpers/game";
import { getKing } from "./helpers/seed-answers";

test("Moje sbírka: tlačítko v hlavičce vede na /sbirka a je označené jako aktivní", async ({ page }) => {
  await open(page, "/");
  const nav = page.getByRole("navigation", { name: "Hlavní navigace" });
  const link = nav.getByRole("link", { name: "Moje sbírka" });
  await expect(link).not.toHaveAttribute("aria-current", "page");

  await link.click();
  await expect(page).toHaveURL("/sbirka");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Moje sbírka");
  await expect(link).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Rychlovka" })).not.toHaveAttribute("aria-current", "page");
});

test("rychlovka má 10 otázek seřazených od lehkých po těžké", async ({ page }) => {
  await open(page, "/rychlovka");
  await expect(progress(page, 1, 10)).toBeVisible();

  const difficulties: number[] = [];
  for (let i = 1; i <= 10; i++) {
    difficulties.push((await answer(page, i, 10, true)).difficulty);
  }
  expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
  await expect(page.getByText("Konec rychlovky")).toBeVisible();
  await expect(page.getByText("Bez jediné chyby, klobouk dolů!")).toBeVisible();
});

test("Libuše: štítek Pověst a žádné roky", async ({ page }) => {
  const libuse = getKing("libuse");
  expect(libuse.isLegend).toBe(true);

  await open(page, "/");
  const card = page
    .getByRole("region", { name: "Galerie panovníků" })
    .getByRole("link", { name: "kněžna Libuše (pověst) – hrát o kartu" });
  await expect(card).toContainText("Pověst");
  await expect(card).not.toContainText(/\d{3,4}/);

  await open(page, "/kral/libuse");
  const header = page.getByRole("heading", { level: 1, name: "Libuše" }).locator("..");
  await expect(header.getByText("Pověst", { exact: true })).toBeVisible();
  await expect(header).toContainText("Otázky jsou o pověsti, ne o doložené historii.");
  await expect(header).not.toContainText(/\d{3,4}/);
});

test("/zdroje se načte a obsahuje licence", async ({ page }) => {
  const response = await page.goto("/zdroje");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Zdroje" })).toBeVisible();
  await expect(page.getByText("Licence").first()).toBeVisible();
  await expect(page.getByText(/public domain/i).first()).toBeVisible();
  await expect(page.getByText(/OFL|Open Font License/).first()).toBeVisible();
});
