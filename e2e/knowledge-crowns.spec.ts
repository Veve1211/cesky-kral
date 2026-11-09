// "Koruny učenosti": bronze / silver / gold crown per ruler after 1/3, 2/3 and
// all of the ruler's questions answered correctly – celebration + crowns.
import { expect, type Page, test } from "@playwright/test";

import { dailyDateKey, pickDailyQuestions } from "../src/lib/daily";
import { questionKey, tierThresholds } from "../src/lib/mastery";
import { celebration, currentQuestion, open, setCollection } from "./helpers/game";
import { getKing, kings, type SeedKing } from "./helpers/seed-answers";

const MASTERY_KEY = "cesky-kral:mastery";

const keysOf = (king: SeedKing, difficulties: number[]) =>
  king.questions.filter((q) => difficulties.includes(q.difficulty)).map((q) => questionKey(king.slug, q.text));

async function setMastery(page: Page, kingsState: Record<string, { known: string[]; tier: number }>) {
  if (page.url() === "about:blank") await page.goto("/zdroje");
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key, value),
    [MASTERY_KEY, JSON.stringify({ version: 1, kings: kingsState })],
  );
}

async function readMastery(page: Page) {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), MASTERY_KEY);
  return raw ? (JSON.parse(raw) as { version: number; kings: Record<string, { known: string[]; tier: number }> }) : null;
}

/**
 * Answers `count` questions correctly; returns the celebrated tier after each
 * answer (null = no celebration). Checks the celebration screen on the way.
 */
async function playCorrect(page: Page, count: number, rulerName: string): Promise<(string | null)[]> {
  const tiers: (string | null)[] = [];
  for (let i = 0; i < count; i++) {
    const question = await currentQuestion(page);
    await page.getByRole("button", { name: question.correct, exact: true }).click();
    const feedback = page.getByRole("status").filter({ hasText: "Správně!" });
    await expect(feedback.or(celebration(page))).toBeVisible();
    const dialog = celebration(page);
    if (await dialog.isVisible()) {
      const tier = await dialog.getAttribute("data-tier");
      tiers.push(tier);
      // Name, tier, chronicle line, the crown on the card, focus on "Pokračovat".
      await expect(dialog.getByRole("heading")).toContainText(rulerName);
      const tierName = { bronze: "Bronzová", silver: "Stříbrná", gold: "Zlatá" }[tier!];
      await expect(dialog.getByRole("heading")).toContainText(`${tierName} koruna učenosti`);
      await expect(dialog.getByTestId(`tier-crown-${tier}`)).toBeVisible();
      // Fireworks – more bursts for a higher tier.
      const fireworks = dialog.getByTestId("fireworks");
      await expect(fireworks).toBeVisible();
      const bursts: Record<string, string> = { bronze: "4", silver: "6", gold: "8" };
      await expect(fireworks).toHaveAttribute("data-bursts", bursts[tier!]);
      await expect(dialog.getByRole("button", { name: "Pokračovat" })).toBeFocused();
      await dialog.getByRole("button", { name: "Pokračovat" }).click();
      await expect(dialog).toHaveCount(0);
      // Back in the game: feedback visible, focus on the next step.
      await expect(feedback).toBeVisible();
      await expect(page.locator("#quiz-next")).toBeFocused();
    } else {
      tiers.push(null);
    }
    await page.locator("#quiz-next").click();
  }
  return tiers;
}

test("prahy: 1/3, 2/3 a všechny otázky (9 otázek = 3, 6, 9), funguje pro libovolný počet", () => {
  expect(tierThresholds(9)).toEqual([3, 6, 9]);
  expect(tierThresholds(12)).toEqual([4, 8, 12]);
  expect(tierThresholds(10)).toEqual([4, 7, 10]);
  for (const king of kings) expect(king.questions).toHaveLength(9);
});

test("bronz: třetí správná odpověď ve hře o kartu ukáže oslavu, další ne", async ({ page }) => {
  const karel = getKing("karel-iv");
  await open(page, `/kral/${karel.slug}`);
  expect(await playCorrect(page, 5, karel.name)).toEqual([null, null, "bronze", null, null]);
  const stored = await readMastery(page);
  expect(stored?.kings[karel.slug]).toMatchObject({ tier: 1 });
  expect(stored?.kings[karel.slug].known).toHaveLength(5);
});

test("oslava stupně podruhé už nepřijde", async ({ page }) => {
  const karel = getKing("karel-iv");
  // Bronze already celebrated; answers below would reach bronze again.
  await setMastery(page, { [karel.slug]: { known: [], tier: 1 } });
  await open(page, `/kral/${karel.slug}`);
  expect(await playCorrect(page, 5, karel.name)).toEqual([null, null, null, null, null]);
});

test("stříbro: šestá různá správně zodpovězená otázka", async ({ page }) => {
  const karel = getKing("karel-iv");
  // The three hard questions are known (bronze). A round has 2 easy, 2 medium,
  // 1 hard: the first three answers are new → the third one makes six.
  await setMastery(page, { [karel.slug]: { known: keysOf(karel, [3]), tier: 1 } });
  await open(page, `/kral/${karel.slug}`);
  expect(await playCorrect(page, 5, karel.name)).toEqual([null, null, "silver", null, null]);
});

test("zlato: poslední otázka ve zlatém kole", async ({ page }) => {
  const karel = getKing("karel-iv");
  await setCollection(page, [karel.slug]);
  await setMastery(page, { [karel.slug]: { known: keysOf(karel, [1, 2]), tier: 2 } });
  await open(page, `/kral/${karel.slug}/zlate-kolo`);
  expect(await playCorrect(page, 3, karel.name)).toEqual([null, null, "gold"]);
  expect((await readMastery(page))?.kings[karel.slug].tier).toBe(3);
});

test("počítá se i v Denní výzvě", async ({ page }) => {
  const first = pickDailyQuestions(
    dailyDateKey(),
    kings.flatMap((k) => k.questions.map((q) => ({ kingSlug: k.slug, text: q.text, difficulty: q.difficulty as 1 | 2 | 3 }))),
  )[0];
  const king = getKing(first.kingSlug);
  const others = king.questions.filter((q) => q.text !== first.text).slice(0, 2).map((q) => questionKey(king.slug, q.text));
  await setMastery(page, { [king.slug]: { known: others, tier: 0 } });
  await open(page, "/vyzva");
  expect(await playCorrect(page, 1, king.name)).toEqual(["bronze"]);
});

test("počítá se i v Rychlovce", async ({ page }) => {
  // Two hard questions known for every ruler; Rychlovka starts with an easy one,
  // so the first correct answer is always the third → bronze.
  await setMastery(page, Object.fromEntries(kings.map((k) => [k.slug, { known: keysOf(k, [3]).slice(0, 2), tier: 0 }])));
  await open(page, "/rychlovka");
  const question = await currentQuestion(page);
  expect(await playCorrect(page, 1, getKing(question.kingSlug).name)).toEqual(["bronze"]);
});

test("Moje sbírka a kronika: koruna v barvě stupně, bez stupně bez koruny", async ({ page }) => {
  await setCollection(page, ["karel-iv", "rudolf-ii", "libuse", "josef-ii"]);
  await setMastery(page, {
    "karel-iv": { known: [], tier: 3 },
    "rudolf-ii": { known: [], tier: 2 },
    libuse: { known: [], tier: 1 },
  });
  await open(page, "/sbirka");
  const card = (name: string) => page.getByRole("main").getByRole("listitem").filter({ has: page.getByRole("heading", { name, exact: true }) });
  await expect(card("Karel IV.").getByRole("img", { name: "zlatá koruna" })).toBeVisible();
  await expect(card("Rudolf II.").getByRole("img", { name: "stříbrná koruna" })).toBeVisible();
  await expect(card("Libuše").getByRole("img", { name: "bronzová koruna" })).toBeVisible();
  await expect(card("Josef II.").locator('[data-testid^="tier-crown-"]')).toHaveCount(0);

  // The chronicle shows the same crown.
  await card("Karel IV.").getByRole("button", { name: /přečíst kroniku/ }).click();
  const chronicle = page.getByRole("dialog", { name: /Kronika: Karel IV\./ });
  await expect(chronicle.getByRole("img", { name: "zlatá koruna" })).toBeVisible();
  await expect(chronicle).toContainText("Zlatá koruna učenosti");
  await chronicle.getByRole("button", { name: "Zavřít kroniku" }).click();

  await card("Josef II.").getByRole("button", { name: /přečíst kroniku/ }).click();
  const josef = page.getByRole("dialog", { name: /Kronika: Josef II\./ });
  await expect(josef.locator('[data-testid^="tier-crown-"]')).toHaveCount(0);
});

test("oslava na mobilu i s omezeným pohybem: vše vidět, koruna hned na hlavě", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const karel = getKing("karel-iv");
  await setMastery(page, { [karel.slug]: { known: keysOf(karel, [3]).slice(0, 2), tier: 0 } });
  await open(page, `/kral/${karel.slug}`);
  const question = await currentQuestion(page);
  await page.getByRole("button", { name: question.correct, exact: true }).click();
  const dialog = celebration(page);
  await expect(dialog).toBeVisible();
  // No horizontal overflow; "Pokračovat" reachable.
  expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await dialog.getByRole("button", { name: "Pokračovat" }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole("button", { name: "Pokračovat" })).toBeInViewport();
  // Reduced motion: no fireworks at all, the descending crown is cut to almost nothing.
  await expect(dialog.getByTestId("fireworks")).toBeHidden();
  const duration = await dialog.getByTestId("tier-crown-bronze").evaluate((el) => parseFloat(getComputedStyle(el).animationDuration));
  expect(duration).toBeLessThan(0.01);
});

test("poškozená data korun stránky neshodí", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const raw of [
    "{nope",
    "null",
    JSON.stringify({ version: 1, kings: { "karel-iv": { known: "x", tier: 7 }, "<script>": { known: [], tier: 3 } } }),
    JSON.stringify({ version: 1, kings: [1, 2] }),
  ]) {
    await page.goto("/zdroje");
    await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [MASTERY_KEY, raw]);
    await setCollection(page, ["karel-iv"]);
    await open(page, "/sbirka");
    await expect(page.locator('[data-testid^="tier-crown-"]')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
