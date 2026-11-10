// The crest is visible where it tempts: next to the rank on the home page,
// at the top of Moje sbírka, in the header, on celebrations that unlock a
// part ("Ozdobit erb"), in shared results – and "Jak hrát" explains it.
import { randomBytes } from "node:crypto";

import { expect, type Page, test } from "@playwright/test";

import { DEFAULT_CREST } from "../src/lib/heraldry";
import { RANKS } from "../src/lib/game-rules";
import { dismissAllCelebrations, open, playRound, setCollection, settleAnswer, goNext, currentQuestion, waitForHydration } from "./helpers/game";

const CREST = { ...DEFAULT_CREST, field: "gules", charge: "star", chargeTincture: "or" };

async function saveCrest(page: Page) {
  if (page.url() === "about:blank") await page.goto("/zdroje");
  await page.evaluate((design) => window.localStorage.setItem("cesky-kral:crest", JSON.stringify({ version: 1, design })), CREST);
}

test("úvod: karta erbu hned u hodnosti – bez erbu výzva, s erbem erb, přezdívka a díly", async ({ page, request }) => {
  await setCollection(page, []);
  await open(page, "/");
  const card = page.getByTestId("crest-card");
  await expect(card).toHaveAttribute("data-has-crest", "false");
  await expect(card.getByRole("heading", { name: "Vytvoř si vlastní erb" })).toBeVisible();
  await expect(card.getByRole("img", { name: "Ukázkový erb" })).toBeVisible();
  await expect(card.getByTestId("crest-parts")).toHaveText("Odemčeno 9 z 33 dílů erbu");
  // Right after the rank panel, before the gallery.
  const rank = await page.getByLabel("Postup sbírky").boundingBox();
  const cardBox = await card.boundingBox();
  const gallery = await page.getByRole("heading", { name: "Galerie panovníků" }).boundingBox();
  expect(cardBox!.y).toBeGreaterThan(rank!.y);
  expect(cardBox!.y).toBeLessThan(gallery!.y);
  await card.getByRole("link", { name: "Vytvořit erb" }).click();
  await expect(page).toHaveURL("/muj-erb");

  // With a crest, a nickname and one card.
  await saveCrest(page);
  await setCollection(page, ["libuse"]);
  const token = (await (await request.post("/api/player", { data: {} })).json()).token as string;
  const name = `Heraldik ${randomBytes(3).toString("hex")}`;
  await request.post("/api/player/nickname", { data: { token, nickname: name } });
  await page.evaluate((t) => window.localStorage.setItem("cesky-kral:player", JSON.stringify({ version: 1, token: t })), token);
  await open(page, "/");
  await expect(card).toHaveAttribute("data-has-crest", "true");
  await expect(card.getByRole("heading", { name: `Erb hráče ${name}` })).toBeVisible();
  await expect(card.getByRole("img")).toHaveAccessibleName(/červená, hvězda \(zlato\)/);
  await expect(card.getByTestId("crest-parts")).toHaveText("Odemčeno 10 z 33 dílů erbu"); // + the key
  await expect(card.getByRole("link", { name: "Upravit erb" })).toHaveAttribute("href", "/muj-erb");
});

test("hlavička a Moje sbírka vedou k erbu", async ({ page }) => {
  await open(page, "/sbirka");
  // At the top of Moje sbírka, above the rank.
  const card = page.getByTestId("crest-card");
  expect((await card.boundingBox())!.y).toBeLessThan((await page.getByLabel("Postup sbírky").boundingBox())!.y);
  const link = page.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("link", { name: "Můj erb" });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL("/muj-erb");
  await expect(link).toHaveAttribute("aria-current", "page");
});

test("oslava karty i koruny ukáže nový díl erbu a tlačítko Ozdobit erb", async ({ page }) => {
  await setCollection(page, []);
  await open(page, "/kral/karel-iv");
  // Five right answers: the first card (unlocks the key), then the bronze crown.
  for (let i = 1; i <= 5; i++) {
    const question = await currentQuestion(page);
    const button = page.getByRole("button", { name: question.correct, exact: true });
    await waitForHydration(button);
    await button.click();
    await settleAnswer(page, "Správně!");
    await goNext(page, i, 5);
  }
  const card = page.getByTestId("card-celebration");
  await expect(card.getByTestId("crest-unlock")).toHaveText("🛡️ Nový díl erbu odemčen: figura Klíč");
  await expect(card.getByRole("link", { name: "Ozdobit erb" })).toHaveAttribute("href", "/muj-erb");
  await card.getByRole("button", { name: "Pokračovat" }).click();
  const crown = page.getByTestId("tier-celebration");
  await expect(crown.getByTestId("crest-unlock")).toContainText("Nové díly erbu odemčeny:");
  await expect(crown.getByTestId("crest-unlock")).toContainText("figura Věž");
  await crown.getByRole("link", { name: "Ozdobit erb" }).click();
  await expect(page).toHaveURL("/muj-erb");
  // The key is free in the editor now.
  await expect(page.getByRole("group", { name: "Figura", exact: true }).getByRole("button", { name: "Klíč", exact: true })).toBeVisible();
});

test("bez nového dílu oslava Ozdobit erb nenabízí", async ({ page }) => {
  // The card is already owned and the bronze crown too: winning again unlocks nothing.
  await setCollection(page, ["karel-iv"]);
  await page.evaluate(() =>
    window.localStorage.setItem("cesky-kral:mastery", JSON.stringify({ version: 1, kings: { "karel-iv": { known: [], tier: 1 } } })),
  );
  await open(page, "/kral/karel-iv");
  for (let i = 1; i <= 5; i++) {
    const question = await currentQuestion(page);
    const button = page.getByRole("button", { name: i < 5 ? question.correct : question.wrong[0], exact: true });
    await waitForHydration(button);
    await button.click();
    await settleAnswer(page, i < 5 ? "Správně!" : "Tentokrát vedle.");
    await goNext(page, i, 5, i < 5);
  }
  const card = page.getByTestId("card-celebration");
  await expect(card).toContainText("Karta znovu obhájena");
  await expect(card.getByTestId("crest-unlock")).toHaveCount(0);
  await expect(card.getByRole("link", { name: "Ozdobit erb" })).toHaveCount(0);
  await dismissAllCelebrations(page);
});

test("sdílení výsledku Rychlovky může přidat odkaz na erb", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: { text: string }) => {
        (window as unknown as { shared: string }).shared = data.text;
      },
    });
  });
  await saveCrest(page);
  await open(page, "/rychlovka");
  await playRound(page, Array(10).fill(false));
  await page.getByLabel("Sdílet i můj erb").check();
  await page.getByRole("button", { name: "Sdílet" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { shared?: string }).shared))
    .toMatch(/Rychlovka 0\/10[\s\S]*\/rychlovka\n🛡️ Můj erb: .*\/erb\?s=heater&d=plain&t=gules\.argent&c=star\.or/);
});

test("Jak hrát odpovídá dnešní hře", async ({ page }) => {
  await open(page, "/jak-hrat");
  const main = page.getByRole("main");
  await expect(main).toContainText(RANKS[3]);
  expect(RANKS[3]).toBe("Pán / Paní erbovní knihy");
  await expect(main).not.toContainText("Česká královna");
  const rewards = page.getByRole("region", { name: "Přehled odměn" });
  for (const name of ["Karta panovníka", "Zlatá karta", "Koruna učenosti", "Hodnost", "Dnešní vládce", "Díly erbu"]) {
    await expect(rewards.getByRole("heading", { level: 3, name, exact: true })).toBeVisible();
  }
  await expect(rewards).toContainText("dřív říkalo zlaté kolo");
  const crest = page.getByRole("region", { name: "Tvůj erb" });
  await expect(crest).toContainText("pravidlem tinktur");
  await expect(crest.getByTestId("crest-unlock-table")).toContainText("Za první kartu panovníka");
  await expect(crest.getByTestId("crest-unlock-table")).toContainText("Za zlatou korunu učenosti u všech panovníků");
  await expect(crest.getByRole("link", { name: "heraldické dílně" })).toHaveAttribute("href", "/muj-erb");
  const boards = page.getByRole("region", { name: "Žebříčky a přezdívka" });
  await expect(boards).toContainText("Skóre počítá vždy server");
  // FAQ about storage tells the truth (transfer code).
  await expect(page.getByRole("region", { name: "Časté otázky" })).toContainText("krátkým kódem");
  // Same header as everywhere (with Žebříčky, no groš); the groš stays at the end of the page.
  const nav = page.getByRole("navigation", { name: "Hlavní navigace" });
  await expect(nav.getByRole("link", { name: "Žebříčky" })).toBeVisible();
  await expect(page.getByRole("banner").getByRole("link", { name: /groš/ })).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Podpora hry" })).toBeVisible();
});
