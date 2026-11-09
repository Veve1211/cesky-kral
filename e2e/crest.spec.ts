// "Můj erb": editor, rule of tincture, unlocking by knowledge crowns, saving,
// sharing (PNG + link) and the crest next to the nickname in leaderboards.
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";

import { expect, type Page, test } from "@playwright/test";

import {
  chargeProblem,
  contrasts,
  crestFromQuery,
  crestToQuery,
  crownCounts,
  DEFAULT_CREST,
  isUnlocked,
  parseCrest,
  secondProblem,
  unlockText,
  UNLOCKS,
  type CrestDesign,
} from "../src/lib/heraldry";
import { open, setCollection } from "./helpers/game";
import { getKing, kings } from "./helpers/seed-answers";

async function setMastery(page: Page, tiers: Record<string, number>) {
  if (page.url() === "about:blank") await page.goto("/zdroje");
  const data = { version: 1, kings: Object.fromEntries(Object.entries(tiers).map(([slug, tier]) => [slug, { known: [], tier }])) };
  await page.evaluate((raw) => window.localStorage.setItem("cesky-kral:mastery", raw), JSON.stringify(data));
}

const group = (page: Page, name: string) => page.getByRole("group", { name, exact: true });
const preview = (page: Page) => page.getByTestId("crest-preview").getByRole("img");

test.describe("pravidla erbu (bez prohlížeče)", () => {
  test("pravidlo tinktur, odemykání a sdílený odkaz", () => {
    expect(contrasts("or", "azure")).toBe(true);
    expect(contrasts("gules", "azure")).toBe(false);
    expect(contrasts("or", "argent")).toBe(false);
    expect(contrasts("ermine", "gules")).toBe(true);
    // Chief on the field follows the rule; a partition may join any two.
    expect(secondProblem({ division: "chief", field: "azure", second: "gules" })).toContain("Barva na barvě");
    expect(secondProblem({ division: "per-pale", field: "azure", second: "gules" })).toBeNull();
    expect(secondProblem({ division: "per-pale", field: "azure", second: "azure" })).toContain("stejnou");
    const charged = { ...DEFAULT_CREST, field: "argent" as const, chargeTincture: "or" as const };
    expect(chargeProblem(charged)).toContain("Kov na kovu");
    // Over a partition of metal and colour any charge tincture is fine.
    expect(chargeProblem({ ...charged, division: "per-pale", second: "gules" })).toBeNull();

    const none = crownCounts([0, 0, 0], 3);
    const some = crownCounts([3, 2, 1], 3, 2);
    expect(some).toEqual({ cards: 2, bronze: 3, silver: 2, gold: 1, total: 3 });
    expect(isUnlocked(UNLOCKS.charge.key, none)).toBe(false);
    expect(isUnlocked(UNLOCKS.charge.key, some)).toBe(true);
    expect(unlockText(UNLOCKS.shape.round, none)).toBe("Odemkne se za 3 karty panovníků ve sbírce (máš 0).");
    expect(isUnlocked(UNLOCKS.charge.star, none)).toBe(true);
    expect(isUnlocked(UNLOCKS.charge.lion, none)).toBe(false);
    expect(isUnlocked(UNLOCKS.charge.eagle, some)).toBe(true);
    expect(isUnlocked(UNLOCKS.tincture.ermine, some)).toBe(false);
    expect(isUnlocked(UNLOCKS.tincture.ermine, crownCounts([3, 3, 3], 3))).toBe(true);
    expect(unlockText(UNLOCKS.charge.lion, none)).toBe("Odemkne se za 3 zlaté koruny učenosti (máš 0).");
    expect(unlockText(UNLOCKS.division.chief, none)).toBe("Odemkne se za bronzovou korunu učenosti (máš 0).");
    expect(unlockText(UNLOCKS.charge.moon, none)).toBe("Odemkne se za 5 bronzových korun učenosti (máš 0).");
    expect(unlockText(UNLOCKS.shape.royal, some)).toContain("u všech panovníků (máš 1 z 3)");

    const design: CrestDesign = { ...DEFAULT_CREST, division: "per-fess", field: "gules", second: "argent", charge: "lion", chargeTincture: "or", motto: "Pravda vítězí" };
    expect(crestFromQuery(Object.fromEntries(new URLSearchParams(crestToQuery(design))))).toEqual(design);
    for (const bad of [
      { ...design, shape: "triangle" },
      { ...design, motto: "kurva" },
      { ...design, motto: "<script>" },
      { ...design, field: "azure", second: "azure" },
      { ...design, division: "plain", field: "azure", chargeTincture: "gules" },
      null,
      "x",
    ]) {
      expect(parseCrest(bad), JSON.stringify(bad)).toBeNull();
    }
  });
});

test("editor: složení erbu ze základních dílů, uložení a po obnovení stejný", async ({ page }) => {
  // Three cards unlock the round shield.
  await setCollection(page, ["libuse", "karel-iv", "josef-ii"]);
  await open(page, "/muj-erb");
  await expect(page.getByTestId("crown-counts")).toContainText("🥉 0 · 🥈 0 · 🥇 0 z 18");
  await group(page, "Tvar štítu").getByRole("button", { name: "Zaoblený štít", exact: true }).click();
  await group(page, "Dělení štítu").getByRole("button", { name: "Polcený (svisle)", exact: true }).click();
  await group(page, "Barva pole").getByRole("button", { name: "Červená", exact: true }).click();
  await group(page, "Druhá barva").getByRole("button", { name: "Stříbro", exact: true }).click();
  await group(page, "Figura").getByRole("button", { name: "Kříž", exact: true }).click();
  await group(page, "Barva figury").getByRole("button", { name: "Zlato", exact: true }).click();
  await page.getByLabel("Heslo pod štítem").fill("Pravda vítězí");
  const expected = "Erb: Zaoblený štít, polcený (svisle), červená, a stříbro, kříž (zlato), heslo „Pravda vítězí“";
  await expect(preview(page)).toHaveAccessibleName(expected);

  await page.getByRole("button", { name: "Uložit erb" }).click();
  await expect(page.getByText(/Erb je uložený/)).toBeVisible();
  await open(page, "/muj-erb");
  await expect(preview(page)).toHaveAccessibleName(expected);
  // Moje sbírka shows it too.
  await open(page, "/sbirka");
  await expect(page.getByTestId("crest-card").getByRole("img")).toHaveAccessibleName(expected);
  await expect(page.getByRole("link", { name: "Upravit erb" })).toHaveAttribute("href", "/muj-erb");
});

test("pravidlo tinktur: barva na barvě nejde a editor vysvětlí proč", async ({ page }) => {
  await open(page, "/muj-erb");
  // Default: blue field, golden star. Red on blue breaks the rule.
  const red = group(page, "Barva figury").getByRole("button", { name: /^Červená – nejde:/ });
  await expect(red).toHaveAttribute("aria-disabled", "true");
  await red.click({ force: true }); // aria-disabled: a tap explains why
  await expect(page.getByTestId("crest-notice")).toContainText("Barva na barvě");
  await expect(page.getByTestId("crest-notice")).toContainText("Pravidlo tinktur");
  await expect(preview(page)).toHaveAccessibleName(/hvězda \(zlato\)/);
  // Changing the field to silver makes the golden star impossible – it is fixed automatically.
  await group(page, "Barva štítu").getByRole("button", { name: "Stříbro", exact: true }).click();
  await expect(preview(page)).toHaveAccessibleName(/hvězda \((červená|modrá)\)/);
});

test("zámky: zamčené díly řeknou, za co se odemknou; koruny učenosti je odemknou", async ({ page }) => {
  await open(page, "/muj-erb");
  const lion = group(page, "Figura").getByRole("button", { name: /^Lev – zamčeno/ });
  await expect(lion).toHaveAttribute("aria-disabled", "true");
  await expect(lion).toContainText("3× zlato");
  await lion.click({ force: true });
  await expect(page.getByTestId("crest-notice")).toHaveText("Odemkne se za 3 zlaté koruny učenosti (máš 0).");
  await expect(preview(page)).toHaveAccessibleName(/hvězda/);
  const royal = group(page, "Tvar štítu").getByRole("button", { name: /^Královský štít s korunou – zamčeno/ });
  await royal.click({ force: true });
  await expect(page.getByTestId("crest-notice")).toContainText("zlatou korunu učenosti u všech panovníků (máš 0 z 18)");

  // Three golden crowns: the lion is free; the rarest parts still wait for all rulers.
  await setMastery(page, { "karel-iv": 3, "rudolf-ii": 3, "josef-ii": 3 });
  await open(page, "/muj-erb");
  await group(page, "Figura").getByRole("button", { name: "Lev", exact: true }).click();
  await expect(preview(page)).toHaveAccessibleName(/lev \(zlato\)/);
  await expect(group(page, "Barva štítu").getByRole("button", { name: /^Hermelín – zamčeno/ })).toBeVisible();

  // Gold for every ruler: ermine and the royal shield.
  await setMastery(page, Object.fromEntries(kings.map((king) => [king.slug, 3])));
  await open(page, "/muj-erb");
  await group(page, "Tvar štítu").getByRole("button", { name: "Královský štít s korunou", exact: true }).click();
  await group(page, "Barva štítu").getByRole("button", { name: "Hermelín", exact: true }).click();
  await expect(preview(page)).toHaveAccessibleName(/Královský štít s korunou, celý štít, hermelín/);
  await expect(page.getByTestId("crest-preview").locator('[data-part="royal-crown"]')).toHaveCount(1);
});

test("heslo: filtr sprostých slov", async ({ page }) => {
  await open(page, "/muj-erb");
  await page.getByLabel("Heslo pod štítem").fill("Kurva práce");
  await expect(page.getByRole("alert").filter({ hasText: "nehodilo" })).toBeVisible();
  await page.getByRole("button", { name: "Uložit erb" }).click();
  await expect(page.getByText(/Erb je uložený/)).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("cesky-kral:crest"))).toBeNull();
});

test("sdílení: stažení PNG a odkaz, který erb ukáže ostatním", async ({ page, browser }) => {
  await open(page, "/muj-erb");
  await page.getByLabel("Heslo pod štítem").fill("Věrně");
  await page.getByRole("button", { name: "Uložit erb" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Stáhnout obrázek (PNG)" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("muj-erb.png");
  const png = await readFile((await download.path())!);
  expect([...png.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);

  const href = (await page.getByTestId("crest-share-link").getAttribute("href"))!;
  expect(href).toContain("/erb?");
  // Someone else opens the link: the crest and the invitation.
  const other = await (await browser.newContext()).newPage();
  await other.goto(href);
  await expect(other.getByTestId("shared-crest").getByRole("img")).toHaveAccessibleName(/hvězda \(zlato\), heslo „Věrně“/);
  await other.getByRole("link", { name: "Vytvoř si vlastní erb" }).click();
  await expect(other).toHaveURL("/muj-erb");
  await other.context().close();

  // A broken link is a 404, not an error.
  const response = await page.request.get("/erb?s=triangle&d=plain&t=or.or&c=none.or");
  expect(response.status()).toBe(404);
});

test("erb vedle přezdívky v žebříčku; server přijme jen platné parametry", async ({ page, request, isMobile }) => {
  test.skip(isMobile, "Server side – one project is enough.");
  await open(page, "/muj-erb");
  await group(page, "Barva štítu").getByRole("button", { name: "Červená", exact: true }).click();
  await page.getByRole("button", { name: "Uložit erb" }).click();
  await expect(page.getByText("Erb je uložený. Uvidí ho i ostatní v žebříčcích.")).toBeVisible();
  const token = await page.evaluate(() => (JSON.parse(window.localStorage.getItem("cesky-kral:player")!) as { token: string }).token);

  for (const crest of [
    { ...DEFAULT_CREST, field: "azure", chargeTincture: "gules" },
    { ...DEFAULT_CREST, motto: "zmrd" },
    { ...DEFAULT_CREST, charge: "dragon" },
    { ...DEFAULT_CREST, motto: "<img src=x onerror=alert(1)>" },
  ]) {
    expect((await request.post("/api/player/crest", { data: { token, crest } })).status()).toBe(422);
  }

  const name = `Erbovník ${randomBytes(3).toString("hex")}`;
  await request.post("/api/player/nickname", { data: { token, nickname: name } });
  // One short game of "Kdo vládl dřív?" via the API puts the player in the board.
  const start = (await (await request.post("/api/game/start", { data: { token, mode: "who-first" } })).json()) as { game: { sessionId: string; slugs: string[] } };
  const [a, b] = start.game.slugs;
  const earlier = getKing(a).reignFrom! <= getKing(b).reignFrom! ? a : b;
  const base = { token, mode: "who-first", sessionId: start.game.sessionId };
  const first = (await (await request.post("/api/game/answer", { data: { ...base, choice: earlier } })).json()) as { result: { next: string[] } };
  const [c, d] = first.result.next;
  await request.post("/api/game/answer", { data: { ...base, choice: getKing(c).reignFrom! > getKing(d).reignFrom! ? c : d } });

  const board = (await (await request.get("/api/game/leaderboard?mode=who-first&period=week")).json()) as {
    entries: { nickname: string; crest: CrestDesign | null }[];
  };
  expect(board.entries.find((entry) => entry.nickname === name)?.crest).toMatchObject({ field: "gules", charge: "star" });

  await open(page, "/zebricky");
  const row = page.getByRole("region", { name: "Kdo vládl dřív?" }).getByTestId("board-row").filter({ hasText: name });
  await expect(row.getByTestId("board-crest").getByRole("img")).toHaveAccessibleName(`Erb hráče ${name}`);
});

test("editor je na mobilu bez vodorovného posouvání a náhled zůstává vidět", async ({ page }) => {
  await open(page, "/muj-erb");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.getByLabel("Heslo pod štítem").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("crest-preview")).toBeInViewport();
});
