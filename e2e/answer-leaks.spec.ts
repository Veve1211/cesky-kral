// The game must not give answers away: the right answer of a question must
// not be readable from the ruler's name (always visible), and the short
// description and dynasty (which often contain answers) stay hidden until
// the card is won.
import { expect, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { getKing, kings } from "./helpers/seed-answers";

const norm = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
/** Word stems (first 5 letters of words with 4+ letters) – enough to catch "Jagellonský" ~ "Jagellonců". */
const stems = (text: string) =>
  norm(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4)
    .map((word) => word.slice(0, 5));

test("žádná správná odpověď není vidět ve jméně panovníka", () => {
  const leaks: string[] = [];
  for (const king of kings) {
    const name = new Set(stems(king.name));
    for (const question of king.questions) {
      const answer = stems(question.correct);
      const wrong = question.wrong.flatMap(stems);
      // A hint only counts when the wrong answers don't share it.
      const hint = answer.filter((stem) => name.has(stem) && !wrong.includes(stem));
      if (hint.length > 0) leaks.push(`${king.slug}: ${question.text} → ${question.correct}`);
    }
  }
  expect(leaks).toEqual([]);
});

test("přepsané otázky, které dřív prozrazovalo jméno", () => {
  const texts = kings.flatMap((king) => king.questions.map((q) => q.text));
  for (const old of [
    "Ze kterého rodu pocházel Vladislav II.?",
    "Kde se Jan Lucemburský narodil?",
    "Jak se jmenují astronomické tabulky, které dokončil Kepler?",
    "Kterou operou bylo otevřeno Národní divadlo?",
    "Kde je Jan Lucemburský dnes pohřben?",
    "Jak se jmenuje zákoník, který vznikl za Vladislava II. roku 1500?",
  ]) {
    expect(texts).not.toContain(old);
  }
  // Still nine questions per ruler, three of each difficulty.
  for (const king of kings) {
    expect([1, 2, 3].map((d) => king.questions.filter((q) => q.difficulty === d).length), king.slug).toEqual([3, 3, 3]);
  }
});

test("popis a dynastie nezískaného panovníka nejsou během hry vidět, po výhře ano", async ({ page }) => {
  const karel = getKing("karel-i");
  await setCollection(page, []);
  await open(page, `/kral/${karel.slug}`);
  // "Poslední český král" would answer "Čím je Karel I. výjimečný?".
  await expect(page.getByTestId("king-bio-locked")).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText(karel.shortBio);
  await expect(page.getByTestId("king-reign")).not.toContainText(karel.dynasty);

  await setCollection(page, [karel.slug]);
  await open(page, `/kral/${karel.slug}`);
  await expect(page.getByTestId("king-bio")).toBeVisible();
  await expect(page.getByTestId("king-reign")).toContainText(karel.dynasty);
});
