// "🪙 Hoď kronikáři groš": one component, five places, only with NEXT_PUBLIC_KOFI_URL.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, type Locator, type Page, test } from "@playwright/test";

import { KofiButton } from "../src/components/kofi-button";
import { parseKofiUrl } from "../src/lib/kofi";
import { dailyDateKey } from "../src/lib/daily";
import { open, playRound, setCollection } from "./helpers/game";
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

test("bez adresy se nevykreslí vůbec nic – na žádném místě", () => {
  for (const variant of ["header", "hero", "card", "footer"] as const) {
    expect(renderToStaticMarkup(createElement(KofiButton, { variant, url: null }))).toBe("");
    expect(renderToStaticMarkup(createElement(KofiButton, { variant, url: TEST_KOFI_URL }))).toContain(
      `href="${TEST_KOFI_URL}"`,
    );
  }
});

/** A plain link to Ko-fi in a new tab – no pop-up, nothing in front of the game. */
async function expectKofiLink(link: Locator, name: RegExp) {
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", TEST_KOFI_URL);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(link).toHaveAccessibleName(name);
}

const FULL_NAME = new RegExp(`^Hoď kronikáři groš ${NEW_WINDOW.replace(/[()]/g, "\\$&")}$`);

function contrast(page: Page, locator: Locator) {
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

test("úvod: pod Denní výzvou, menší než ona, čitelná zelená", async ({ page }) => {
  await open(page, "/");
  const hero = page.getByTestId("kofi-hero");
  await expectKofiLink(hero, FULL_NAME);
  const daily = page.getByRole("link", { name: /Denní výzva/ });
  const [heroBox, dailyBox] = [await hero.boundingBox(), await daily.boundingBox()];
  expect(heroBox!.y).toBeGreaterThan(dailyBox!.y + dailyBox!.height);
  expect(heroBox!.width * heroBox!.height).toBeLessThan(dailyBox!.width * dailyBox!.height);
  // WCAG AA for normal text.
  expect(await contrast(page, hero)).toBeGreaterThanOrEqual(4.5);
});

test("hlavička: na každé stránce, na úzkém mobilu jen groš s celým jménem", async ({ page }) => {
  for (const path of ["/", "/sbirka", "/rychlovka", "/kdo-driv", "/jak-hrat", "/zdroje", "/kral/karel-iv"]) {
    await open(page, path);
    await expectKofiLink(page.getByTestId("kofi-header"), /^Hoď groš \(Ko-fi, otevře se v novém okně\)$/);
  }
  // Screen-reader-only text is 1 px wide, which Playwright still calls "visible" – measure it.
  const header = page.getByTestId("kofi-header");
  const labelWidth = () => header.getByText("Hoď groš", { exact: true }).evaluate((el) => el.getBoundingClientRect().width);
  await page.setViewportSize({ width: 375, height: 700 });
  await expect.poll(labelWidth).toBeLessThanOrEqual(1);
  await expect(header).toHaveAccessibleName(/^Hoď groš/);
  await page.setViewportSize({ width: 1024, height: 700 });
  await expect.poll(labelWidth).toBeGreaterThan(40);
});

test("výsledek Rychlovky: kartička pod hlavními tlačítky", async ({ page }) => {
  await open(page, "/rychlovka");
  await expect(page.getByTestId("kofi-card")).toHaveCount(0); // never during the game
  await playRound(page, Array(10).fill(true));
  const card = page.getByRole("complementary", { name: "Podpora hry" });
  await expect(card).toContainText("Baví tě Český král?");
  await expect(card).toContainText("Hoď kronikáři groš na další panovníky.");
  await expectKofiLink(card.getByRole("link"), FULL_NAME);
  const again = await page.getByRole("button", { name: "Hrát znovu" }).boundingBox();
  expect((await card.boundingBox())!.y).toBeGreaterThan(again!.y);
});

test("výsledek Denní výzvy: kartička pod hlavními tlačítky", async ({ page }) => {
  await setCollection(page, []);
  await page.evaluate(
    (date) => window.localStorage.setItem("cesky-kral:daily", JSON.stringify({ version: 1, date, marks: [true, true, true, true, false], streak: 1, lastCompleted: date })),
    dailyDateKey(),
  );
  await open(page, "/vyzva");
  const card = page.getByRole("complementary", { name: "Podpora hry" });
  await expect(card).toContainText("Baví tě Český král?");
  await expectKofiLink(card.getByRole("link"), FULL_NAME);
  const gallery = await page.getByRole("link", { name: "Galerie", exact: true }).boundingBox();
  expect((await card.boundingBox())!.y).toBeGreaterThan(gallery!.y);
});

test("Moje sbírka: kartička u přehledu sbírky; patička výraznější", async ({ page }) => {
  await open(page, "/sbirka");
  const card = page.getByRole("complementary", { name: "Podpora hry" });
  await expectKofiLink(card.getByRole("link"), FULL_NAME);
  const status = await page.getByLabel("Postup sbírky").boundingBox();
  expect((await card.boundingBox())!.y).toBeGreaterThan(status!.y);

  const footer = page.getByRole("contentinfo").getByTestId("kofi-footer");
  await expectKofiLink(footer, FULL_NAME);
  expect(await contrast(page, footer)).toBeGreaterThanOrEqual(4.5);
});

test("hra o kartu tlačítko neruší: během kola ani ve výsledku žádná kartička", async ({ page }) => {
  page.on("dialog", () => {
    throw new Error("no pop-ups allowed");
  });
  await open(page, "/kral/karel-iv");
  await playRound(page, [true, true, true, true, true]);
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();
  await expect(page.getByTestId("kofi-card")).toHaveCount(0);
});
