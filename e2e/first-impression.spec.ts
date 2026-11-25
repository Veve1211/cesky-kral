// First impression (PR 2): a newcomer sees what the game is and where to click,
// and the first question of a round is visible without scrolling on a phone.
import { expect, test } from "@playwright/test";

import { open } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

// Measure the final layout, not the card mid-way through its entrance animation.
test.use({ reducedMotion: "reduce" });

const inViewport = async (locator: import("@playwright/test").Locator) => {
  const box = await locator.boundingBox();
  const height = locator.page().viewportSize()!.height;
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(height);
};

test("úvod: věta o hře a tlačítko Začni hrát bez posouvání", async ({ page }) => {
  await open(page, "/");
  const sentence = page.getByText(/Hra pro žáky a učitele dějepisu/);
  const start = page.getByRole("link", { name: /Získej českého panovníka/ });
  await expect(sentence).toBeVisible();
  await expect(start).toBeVisible();
  await inViewport(sentence);
  await inViewport(start);
});

test("hra o kartu: první otázka i odpovědi jsou vidět bez posouvání a bez zamčeného tlačítka", async ({ page }) => {
  const first = [...kings].sort((a, b) => a.order - b.order)[0];
  await open(page, `/kral/${first.slug}`);
  const question = page.getByRole("heading", { level: 2 }).first();
  await expect(question).toBeVisible();
  await inViewport(question);
  await expect(page.getByRole("button", { name: /Mistrovské kolo/ })).toHaveCount(0);
});

// Audit 10. 11., point 2: the other modes start without scrolling too (compact ModeHeader).
for (const path of ["/vyzva", "/rychlovka"]) {
  test(`${path}: první otázka je vidět bez posouvání`, async ({ page }) => {
    await open(page, path);
    // The question heading (not "Dnešní žebříček", which can render first).
    const question = page.locator('h2[aria-describedby="quiz-question-progress"]');
    await expect(question).toBeVisible();
    await inViewport(question);
  });
}

test("Kdo vládl dřív?: obě karty panovníků jsou vidět bez posouvání (aspoň ze 3/4)", async ({ page }) => {
  await open(page, "/kdo-driv");
  const buttons = page.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button");
  await expect(buttons).toHaveCount(2);
  // On a phone both cards fit whole; on a computer they sit side by side and their
  // bottom edge can touch the fold, so at least three quarters of each must show.
  await expect(buttons.nth(0)).toBeInViewport({ ratio: 0.75 });
  await expect(buttons.nth(1)).toBeInViewport({ ratio: 0.75 });
});
