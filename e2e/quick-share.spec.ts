// Sharing the Rychlovka result – Wordle style, without giving answers away.
import { expect, type Page, test } from "@playwright/test";

import { quickShareText } from "../src/lib/share-text";
import { open, playRound } from "./helpers/game";

const PLAN = [true, true, false, true, true, true, false, true, true, true];

async function stubShareSheet(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: { text: string }) => {
        (window as unknown as { shared: string }).shared = data.text;
      },
    });
  });
}

test("text ke sdílení: skóre a řádek korunek a mečů", () => {
  expect(quickShareText([true, true, false, true, true])).toBe("Český král 👑 Rychlovka 4/5\n👑👑⚔️👑👑");
});

test("po Rychlovce jde výsledek sdílet a neprozradí otázky ani odpovědi", async ({ page }) => {
  await stubShareSheet(page);
  await open(page, "/rychlovka");
  const asked = await playRound(page, PLAN);
  await expect(page.getByText("Konec rychlovky")).toBeVisible();

  await page.getByRole("button", { name: "Sdílet" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Díky za sdílení" })).toBeVisible();
  const shared = await page.evaluate(() => (window as unknown as { shared: string }).shared);
  const origin = new URL(page.url()).origin;
  expect(shared).toBe(`Český král 👑 Rychlovka 8/10\n👑👑⚔️👑👑👑⚔️👑👑👑\n${origin}/rychlovka`);
  // The exact match above already rules out any extra text; this states the
  // intent. Very short answers (e.g. a lone number like "8") are skipped –
  // they can appear in the score itself.
  for (const question of asked) {
    for (const text of [question.text, question.correct, ...question.wrong].filter((t) => t.length >= 4)) {
      expect(shared).not.toContain(text);
    }
  }
});

test("bez systémového sdílení se výsledek zkopíruje a ukáže „Zkopírováno“", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    });
  });
  await open(page, "/rychlovka");
  await playRound(page, Array(10).fill(true));
  await page.getByRole("button", { name: "Sdílet" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Zkopírováno" })).toBeVisible();
  const copied = await page.evaluate(() => (window as unknown as { copied: string }).copied);
  expect(copied.startsWith("Český král 👑 Rychlovka 10/10\n👑👑👑👑👑👑👑👑👑👑\n")).toBe(true);
});

test("hra o kartu tlačítko Sdílet nemá", async ({ page }) => {
  await open(page, "/kral/karel-iv");
  await playRound(page, [false, false, false, false, false]);
  await expect(page.getByText("Konec hry")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sdílet" })).toHaveCount(0);
});
