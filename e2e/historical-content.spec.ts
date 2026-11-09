// Reviewed claims are pinned independently of the seed's answer lookup.
// Source rationale: docs/historical-content.md. No external network is needed in CI.
import { expect, test } from "@playwright/test";

import { currentQuestion, goNext, open, setCollection, settleAnswer } from "./helpers/game";
import { chronicles, getKing, kings } from "./helpers/seed-answers";

const EYE_SOURCE = "https://dvojka.rozhlas.cz/120-schuzka-soukroma-podobizna-ceskeho-krale-jana-lucemburskeho-7939911";
const CHARLES_SOURCE = "https://archiv.radio.cz/cz/static/karel-iv/vita-caroli";
const RUDOLF_SOURCE = "https://lib.cas.cz/casopis-informace/rudolf-ii/";

function chronicleText(slug: string): string {
  const chronicle = chronicles[slug];
  return [chronicle.intro, ...chronicle.sections.map((s) => s.text), ...chronicle.facts].join(" ");
}

test("historický obsah: 18 panovníků, 162 otázek a jedna správná možnost", () => {
  expect(kings).toHaveLength(18);
  expect(kings.flatMap((king) => king.questions)).toHaveLength(162);
  for (const king of kings) {
    expect(king.questions).toHaveLength(9);
    for (const level of [1, 2, 3]) {
      expect(king.questions.filter((q) => q.difficulty === level)).toHaveLength(3);
    }
    for (const question of king.questions) {
      expect(new Set([question.correct, ...question.wrong]).size).toBe(3);
    }
  }
});

test("Josef II. nevolnictví zrušil, nezavedl ho", () => {
  const explanation = getKing("marie-terezie").questions.find((q) => q.text.includes("1774"))!.explanation;
  expect(explanation).not.toMatch(/nevolnictví a toleranci zavedl/);
  expect(explanation).toMatch(/nevolnictví zrušil/i);
  const abolition = getKing("josef-ii").questions.find((q) => q.text.includes("Co zrušil"))!;
  expect(abolition.text).toContain("1. listopadu 1781");
  expect(abolition.correct).toBe("Nevolnictví");
  expect(chronicleText("josef-ii")).toMatch(/zrušil nevolnictví/);
  expect(chronicleText("josef-ii")).toMatch(/robotu.*nezrušil/);
});

test("Marie Terezie: vzdělávací povinnost 6–12 let umožňovala domácí vyučování", () => {
  const questions = getKing("marie-terezie").questions.filter((q) => q.text.includes("1774"));
  expect(questions).toHaveLength(2);
  expect(questions.find((q) => q.difficulty === 2)!.correct).toBe("Všeobecnou vzdělávací povinnost");
  expect(questions.find((q) => q.difficulty === 3)!.correct).toBe("Od 6 do 12 let věku");
  for (const q of questions) {
    expect(q.text).not.toMatch(/povinná školní docházka/);
    expect(q.explanation).toMatch(/domácí/i);
  }
  const chronicle = chronicleText("marie-terezie");
  expect(chronicle).toContain("vzdělávací povinnost");
  expect(chronicle).toContain("od 6 do 12 let");
  expect(chronicle).toMatch(/domácí/i);
  expect(chronicle).not.toContain("zavedla povinnou školní docházku");
});

test("Václav II.: manželský syn, Mikuláš Opavský byl nemanželský", () => {
  const father = getKing("vaclav-ii").questions.find((q) => q.text.includes("otcem Václava"))!;
  expect(father.correct).toBe("Přemysl Otakar II.");
  expect(father.explanation).toContain("jediným přeživším manželským synem");
  expect(father.explanation).toContain("Mikuláš Opavský");
  expect(father.explanation).toMatch(/nemanželsk/);
  expect(chronicles["vaclav-ii"].intro).toContain("jediný přeživší manželský syn");
  const sections = chronicles["vaclav-ii"].sections.map((s) => s.text).join(" ");
  expect(sections).toContain("Mikuláš Opavský");
  expect(sections).toMatch(/nemanželsk/);
});

test("Jan Lucemburský: postupná ztráta zraku bez sporného roku", () => {
  const king = getKing("jan-lucembursky");
  const text = [...king.questions.map((q) => `${q.text} ${q.explanation}`), chronicleText(king.slug)].join(" ");
  expect(text).not.toMatch(/1336|1337|1339|1340|deset let/);
  const eye = king.questions.find((q) => q.text.includes("zrak"))!;
  expect(eye.text).toContain("zhoršil zrak");
  expect(eye.correct).toBe("Na křížové výpravě v Litvě");
  expect(eye.explanation).toContain("postupně");
  expect(eye.explanation).toMatch(/později.*úplně/);
  expect(eye.sourceUrl).toBe(EYE_SOURCE);
  expect(chronicleText(king.slug)).toContain("postupně");
});

test("ověřené zdroje Karla IV. a Rudolfa II. nahrazují nefunkční odkazy", () => {
  expect(getKing("karel-iv").sourceUrl).toBe(CHARLES_SOURCE);
  expect(getKing("rudolf-ii").sourceUrl).toBe(RUDOLF_SOURCE);
  const sources = kings.flatMap((k) => [k.sourceUrl, ...k.questions.map((q) => q.sourceUrl ?? k.sourceUrl)]);
  sources.push(...Object.values(chronicles).flatMap((c) => c.sources.map((s) => s.url)));
  for (const url of sources) {
    expect(url).not.toContain("ipfs.ssi.eecc.de");
    expect(url).not.toContain("prague.eu/en/2024/03/13/charles-iv-the-greatest-czech");
  }
  expect(chronicles["karel-iv"].sources.map((s) => s.url)).toContain(CHARLES_SOURCE);
  expect(chronicles["rudolf-ii"].sources.map((s) => s.url)).toContain(RUDOLF_SOURCE);
});

test("kroniky zobrazují opravená fakta a zdroje i po načtení ze seedu do DB", async ({ page }) => {
  const claims = [
    { slug: "marie-terezie", text: /vzdělávací povinnost/, detail: /domácí/ },
    { slug: "vaclav-ii", text: /manželský syn/, detail: /Mikuláš Opavský/ },
    { slug: "jan-lucembursky", text: /postupně/, detail: /později.*úplně/ },
    { slug: "josef-ii", text: /zrušil nevolnictví/, detail: /robotu.*nezrušil/ },
    { slug: "karel-iv", source: CHARLES_SOURCE },
    { slug: "rudolf-ii", source: RUDOLF_SOURCE },
  ];
  await setCollection(page, claims.map((c) => c.slug));
  await open(page, "/sbirka");
  const owned = page.getByRole("region", { name: "Získaní panovníci" });
  for (const claim of claims) {
    const king = getKing(claim.slug);
    await owned.getByRole("button", { name: `${king.title} ${king.name} – ve sbírce, přečíst kroniku` }).click();
    const dialog = page.getByRole("dialog");
    if (claim.text) await expect(dialog).toContainText(claim.text);
    if (claim.detail) await expect(dialog).toContainText(claim.detail);
    if (claim.source) await expect(dialog.locator(`a[href="${claim.source}"]`)).toBeVisible();
    await dialog.getByRole("button", { name: "Zavřít kroniku" }).click();
    await expect(dialog).toBeHidden();
  }
});

test("Janova otázka ve zlatém kole ponechává ověřenou odpověď a vysvětluje postupnou ztrátu zraku", async ({ page }) => {
  await setCollection(page, ["jan-lucembursky"]);
  await open(page, "/kral/jan-lucembursky/zlate-kolo");
  let checkedEyeQuestion = false;
  for (let i = 0; i < 3; i++) {
    const question = await currentQuestion(page);
    await page.getByRole("button", { name: question.correct, exact: true }).click();
    await settleAnswer(page, "Správně!");
    const feedback = page.getByRole("status").filter({ hasText: "Správně!" });
    if (question.text.includes("zrak")) {
      expect(question.correct).toBe("Na křížové výpravě v Litvě");
      await expect(feedback).toContainText("postupně");
      await expect(feedback).not.toContainText(/1336|1337|1339|1340/);
      await expect(feedback.getByRole("link", { name: "Zdroj" })).toHaveAttribute("href", EYE_SOURCE);
      checkedEyeQuestion = true;
    }
    await goNext(page, i + 1, 3);
  }
  expect(checkedEyeQuestion).toBe(true);
});
