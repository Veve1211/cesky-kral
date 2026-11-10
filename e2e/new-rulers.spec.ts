// Batch 6: six more rulers (18 in total). Data rules, every page, the game,
// "Kdo vládl dřív?" data and "Koruny učenosti" (#33) must work for them too.
import { expect, test } from "@playwright/test";

import { questionKey } from "../src/lib/mastery";
import { celebration, currentQuestion, open, playRound } from "./helpers/game";
import { getKing, kings } from "./helpers/seed-answers";

const NEW_RULERS = [
  { slug: "vratislav-ii", name: "Vratislav II.", from: 1061, to: 1092 },
  { slug: "vaclav-iv", name: "Václav IV.", from: 1378, to: 1419 },
  { slug: "vladislav-ii-jagellonsky", name: "Vladislav II. Jagellonský", from: 1471, to: 1516 },
  { slug: "ferdinand-i", name: "Ferdinand I.", from: 1526, to: 1564 },
  { slug: "fridrich-falcky", name: "Fridrich Falcký", from: 1619, to: 1620 },
  { slug: "frantisek-josef-i", name: "František Josef I.", from: 1848, to: 1916 },
];

test("data: roky vlády, 9 otázek 3/3/3, ověřitelný zdroj u každé otázky, portrét s ověřeným kreditem", () => {
  for (const ruler of NEW_RULERS) {
    const king = getKing(ruler.slug);
    expect(king.name).toBe(ruler.name);
    expect([king.reignFrom, king.reignTo]).toEqual([ruler.from, ruler.to]);
    expect(king.isLegend).toBe(false);
    expect(king.imageUrl).toBe(`/kings/${king.slug}.webp`); // public-domain portrait, credit checked in rulers-complete.spec.ts
    expect(king.questions).toHaveLength(9);
    for (const level of [1, 2, 3]) expect(king.questions.filter((q) => q.difficulty === level)).toHaveLength(3);
    for (const q of king.questions) {
      const source = q.sourceUrl ?? king.sourceUrl;
      // Czech Wikipedia, or the Biographical Dictionary of the Czech Lands (Czech Academy of Sciences).
      expect(source).toMatch(/^https:\/\/(cs\.wikipedia\.org\/wiki\/|biography\.hiu\.cas\.cz\/pageid\/\d+$)/);
      expect(q.explanation.trim().length).toBeGreaterThan(10);
      expect(new Set([q.correct, ...q.wrong]).size).toBe(3);
    }
  }
});

test("žádná otázka se neopakuje napříč všemi 18 panovníky", () => {
  const texts = kings.flatMap((k) => k.questions.map((q) => q.text.trim().toLowerCase()));
  expect(new Set(texts).size).toBe(texts.length);
});

test("pořadí podle doby vlády (1–18), bez shody roku začátku vlády", () => {
  const ordered = [...kings].sort((a, b) => a.order - b.order);
  expect(ordered.map((k) => k.order)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
  const starts = ordered.filter((k) => !k.isLegend).map((k) => k.reignFrom!);
  expect(starts).toEqual([...starts].sort((a, b) => a - b));
  expect(new Set(starts).size).toBe(starts.length);
});

test("noví panovníci jsou v galerii, mají stránku i zlaté kolo", async ({ page, request }) => {
  await open(page, "/");
  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  for (const ruler of NEW_RULERS) {
    await expect(gallery.getByRole("heading", { name: ruler.name, exact: true })).toBeVisible();
    for (const suffix of ["", "/zlate-kolo"]) {
      const response = await request.get(`/kral/${ruler.slug}${suffix}`);
      expect(response.status()).toBe(200);
    }
  }
});

test("hra o kartu s novým panovníkem: výhra, sbírka a bronzová koruna učenosti", async ({ page }) => {
  const ruler = getKing("ferdinand-i");
  await open(page, `/kral/${ruler.slug}`);
  const asked = await playRound(page, [true, true, true, true, true]);
  expect(asked.every((q) => q.kingSlug === ruler.slug)).toBe(true);
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();

  // Five distinct correct answers of nine → bronze; the keys match the server's.
  const mastery = await page.evaluate(() => JSON.parse(window.localStorage.getItem("cesky-kral:mastery") ?? "null"));
  expect(mastery.kings[ruler.slug].tier).toBe(1);
  expect(new Set(mastery.kings[ruler.slug].known)).toEqual(new Set(asked.map((q) => questionKey(ruler.slug, q.text))));

  await open(page, "/sbirka");
  const card = page.getByRole("main").getByRole("listitem").filter({ has: page.getByRole("heading", { name: ruler.name, exact: true }) });
  await expect(card.getByRole("img", { name: "bronzová koruna" })).toBeVisible();
});

test("zlatá koruna učenosti funguje i u nového panovníka", async ({ page }) => {
  const ruler = getKing("vratislav-ii");
  const known = ruler.questions.filter((q) => q.difficulty !== 3).map((q) => questionKey(ruler.slug, q.text));
  await page.goto("/zdroje");
  await page.evaluate(
    ([slug, keys]) => {
      window.localStorage.setItem("cesky-kral:collection", JSON.stringify({ version: 2, kings: [slug], golden: [] }));
      window.localStorage.setItem("cesky-kral:mastery", JSON.stringify({ version: 1, kings: { [slug]: { known: keys, tier: 2 } } }));
    },
    [ruler.slug, known] as const,
  );
  await open(page, `/kral/${ruler.slug}/zlate-kolo`);
  for (let i = 0; i < 3; i++) {
    const q = await currentQuestion(page);
    await page.getByRole("button", { name: q.correct, exact: true }).click();
    const feedback = page.getByRole("status").filter({ hasText: "Správně!" });
    await expect(feedback.or(celebration(page))).toBeVisible();
    if (i < 2) {
      await expect(celebration(page)).toHaveCount(0);
      await page.locator("#quiz-next").click();
    }
  }
  await expect(celebration(page)).toHaveAttribute("data-tier", "gold");
  await expect(celebration(page).getByRole("heading")).toContainText(ruler.name);
});

test("Kdo vládl dřív? hraje i s novými panovníky", async ({ page, request }) => {
  // The page hands all historical rulers (no legends) to the game.
  const html = await (await request.get("/kdo-driv")).text();
  for (const ruler of NEW_RULERS) expect(html).toContain(ruler.slug);
  expect(kings.filter((k) => !k.isLegend && k.reignFrom !== null)).toHaveLength(17);
  await open(page, "/kdo-driv");
  await expect(page.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button")).toHaveCount(2);
});
