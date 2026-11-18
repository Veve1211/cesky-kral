// Home page name and copy, hidden years spacing, metadata kept out of the page text.
import { expect, test } from "@playwright/test";

import { open } from "./helpers/game";

test("úvod: stejný název hry v titulku i nadpisu a dvě věty o hře", async ({ page }) => {
  await open(page, "/");
  await expect(page).toHaveTitle("Český král – Sbírej české panovníky");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Český král Sbírej české panovníky");
  await expect(page.getByText(/Hra pro žáky a učitele dějepisu/)).toBeVisible();
  await expect(page.getByText(/Za správné odpovědi .* získáš jejich sběratelské karty\./)).toBeVisible();
});

test("text stránky: skryté roky mají mezeru a meta tagy nejsou vidět jako text", async ({ page }) => {
  for (const path of ["/", "/kral/karel-iv"]) {
    await open(page, path);
    const text = await page.locator("body").evaluate((body) => body.textContent ?? "");
    expect(text, path).not.toMatch(/\?\?\?\?roky/);
    // Browsers get streamed metadata in a hidden block: never rendered as page text.
    const shown = await page.locator("body").evaluate((body) => (body as HTMLElement).innerText);
    expect(shown, path).not.toContain("Zahraj si o kartu");
    expect(shown, path).not.toContain("| Český král");
    const visibleMeta = await page
      .locator("body meta, body title")
      .evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).display !== "none").length);
    expect(visibleMeta, path).toBe(0);
  }
});
