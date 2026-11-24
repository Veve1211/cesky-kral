// Audit 10. 11., point 5: after a won card there is one clear next step –
// play for the next missing ruler (in game order); the collection is a quieter link.
import { expect, test } from "@playwright/test";

import { dismissAllCelebrations, open, playRound, setCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

test.use({ reducedMotion: "reduce" });

const ordered = [...kings].sort((a, b) => a.order - b.order);

test("po výhře karty vede hlavní tlačítko na dalšího chybějícího panovníka", async ({ page }) => {
  const [first, second, third] = ordered;
  // The second ruler is already collected, so the next missing one is the third.
  await setCollection(page, [second.slug]);
  await open(page, `/kral/${first.slug}`);
  await playRound(page, [true, true, true, true, true]);
  await dismissAllCelebrations(page);

  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Hrát o další kartu" })).toHaveAttribute("href", `/kral/${third.slug}`);
  await expect(page.getByRole("link", { name: "Do sbírky" })).toHaveAttribute("href", "/sbirka");
});
