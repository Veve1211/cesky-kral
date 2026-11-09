// "🪙 Hoď kronikáři groš": only after a finished game and on /jak-hrat, only with NEXT_PUBLIC_KOFI_URL.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, type Locator, type Page, test } from "@playwright/test";

import { KofiButton } from "../src/components/kofi-button";
import { parseKofiUrl } from "../src/lib/kofi";
import { dailyDateKey } from "../src/lib/daily";
import { open, playRound, setCollection, waitForHydration } from "./helpers/game";
import { TEST_KOFI_URL } from "./helpers/kofi";

const NEW_WINDOW = "(Ko-fi, otevře se v novém okně)";

test("adresa Ko-fi: jen https://ko-fi.com, jinak nic", () => {
  expect(parseKofiUrl("https://ko-fi.com/kronikar")).toBe("https://ko-fi.com/kronikar");
  expect(parseKofiUrl("  https://www.ko-fi.com/kronikar  ")).toBe("https://www.ko-fi.com/kronikar");
  for (const bad of [
    undefined,
    "",
    "   ",
    "ko-fi.com/kronikar",
    "http://ko-fi.com/kronikar",
    "https://ko-fi.com.evil.example/kronikar",
    "https://evil.example/?https://ko-fi.com",
    "https://user:pass@ko-fi.com/kronikar",
    "javascript:alert(1)",
    `https://ko-fi.com/${"x".repeat(300)}`,
  ]) {
    expect(parseKofiUrl(bad)).toBeNull();
  }
});

test("bez adresy se nevykreslí vůbec nic", () => {
  expect(renderToStaticMarkup(createElement(KofiButton, { url: null }))).toBe("");
  expect(renderToStaticMarkup(createElement(KofiButton, { url: TEST_KOFI_URL }))).toContain(`href="${TEST_KOFI_URL}"`);
});

const FULL_NAME = new RegExp(`^Hoď kronikáři groš ${NEW_WINDOW.replace(/[()]/g, "\\$&")}$`);

/** The groš card: short explanation and a plain link to Ko-fi in a new tab – no pop-up. */
async function expectKofiCard(page: Page) {
  const card = page.getByRole("complementary", { name: "Podpora hry" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("Baví tě hra?");
  await expect(card).toContainText("Hoď kronikáři groš a pomůžeš mu psát další kapitoly.");
  const link = card.getByRole("link");
  await expect(link).toHaveAttribute("href", TEST_KOFI_URL);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(link).toHaveAccessibleName(FULL_NAME);
  // WCAG AA for normal text.
  expect(await contrast(link)).toBeGreaterThanOrEqual(4.5);
  return card;
}

function contrast(locator: Locator) {
  return locator.evaluate((el) => {
    const rgb = (value: string) => value.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const style = getComputedStyle(el);
    const [a, b] = [lum(rgb(style.color)), lum(rgb(style.backgroundColor))].sort((x, y) => y - x);
    return (a + 0.05) / (b + 0.05);
  });
}

test("jinde groš není: hlavička, patička, úvod, sbírka, Denní výzva během hry", async ({ page }) => {
  for (const path of ["/", "/sbirka", "/rychlovka", "/kdo-driv", "/zdroje", "/kral/karel-iv", "/vyzva"]) {
    await open(page, path);
    await expect(page.getByRole("banner").getByRole("link", { name: /groš/ })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: /groš/ })).toHaveCount(0);
    await expect(page.getByTestId("kofi-card")).toHaveCount(0);
  }
});

test("Jak hrát: groš s vysvětlením", async ({ page }) => {
  await open(page, "/jak-hrat");
  await expectKofiCard(page);
});

test("po dohrání Rychlovky: groš pod hlavními tlačítky", async ({ page }) => {
  await open(page, "/rychlovka");
  await playRound(page, Array(10).fill(true));
  const card = await expectKofiCard(page);
  const again = await page.getByRole("button", { name: "Hrát znovu" }).boundingBox();
  expect((await card.boundingBox())!.y).toBeGreaterThan(again!.y);
});

test("po dohrání Denní výzvy: groš pod hlavními tlačítky", async ({ page }) => {
  await setCollection(page, []);
  await page.evaluate(
    (date) => window.localStorage.setItem("cesky-kral:daily", JSON.stringify({ version: 1, date, marks: [true, true, true, true, false], streak: 1, lastCompleted: date })),
    dailyDateKey(),
  );
  await open(page, "/vyzva");
  const card = await expectKofiCard(page);
  const gallery = await page.getByRole("link", { name: "Galerie", exact: true }).boundingBox();
  expect((await card.boundingBox())!.y).toBeGreaterThan(gallery!.y);
});

test("hra o kartu: během kola ne, po dohrání (výhra i prohra) ano, bez vyskakovacích oken", async ({ page }) => {
  page.on("dialog", () => {
    throw new Error("no pop-ups allowed");
  });
  await open(page, "/kral/karel-iv");
  await expect(page.getByTestId("kofi-card")).toHaveCount(0);
  await playRound(page, [true, true, true, true, true]);
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();
  await expectKofiCard(page);

  await open(page, "/kral/josef-ii");
  await playRound(page, [false, false, false, false, false]);
  await expect(page.getByRole("heading", { name: "Konec hry" })).toBeVisible();
  await expectKofiCard(page);
});

test("Kdo vládl dřív?: groš až po konci hry", async ({ page }) => {
  // No automatic next pair, so the loop below stays simple.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/kdo-driv");
  await expect(page.getByTestId("kofi-card")).toHaveCount(0);
  const group = page.getByRole("group", { name: "Kdo začal vládnout dřív?" });
  // Keep answering until a wrong pick ends the game (bounded).
  for (let i = 0; i < 40; i++) {
    const option = group.getByRole("button").first();
    await waitForHydration(option);
    await option.click();
    const over = page.getByText("Vedle! Konec hry.");
    const next = page.getByRole("button", { name: "Další" });
    await expect(over.or(next)).toBeVisible();
    if (await over.isVisible()) break;
    await next.click();
  }
  await expectKofiCard(page);
});
