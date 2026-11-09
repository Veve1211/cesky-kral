// Shared steps for the E2E tests.
import { expect, type Locator, type Page } from "@playwright/test";

import { findQuestion, type KnownQuestion } from "./seed-answers";

export const STORAGE_KEY = "cesky-kral:collection";

export type StoredCollection = { version: number; kings: string[]; golden?: string[] };

/**
 * Waits until React has hydrated the element – before that, clicks on
 * client components do nothing.
 */
export async function waitForHydration(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__reactFiber"))),
    )
    .toBe(true);
}

/** Opens a page and waits for the hydrated header navigation. */
export async function open(page: Page, path: string) {
  await page.goto(path);
  await waitForHydration(page.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("link").first());
}

/** Writes raw text to the collection key (any value, also broken data). */
export async function setRawCollection(page: Page, raw: string) {
  // Any page of the app gives access to its localStorage.
  if (page.url() === "about:blank") await page.goto("/zdroje");
  await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [STORAGE_KEY, raw]);
}

export async function setCollection(page: Page, kings: string[], golden: string[] = []) {
  await setRawCollection(page, JSON.stringify({ version: 2, kings, golden }));
}

export async function readCollection(page: Page): Promise<StoredCollection | null> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  return raw === null ? null : (JSON.parse(raw) as StoredCollection);
}

/** Progress line "Otázka N z TOTAL". */
export function progress(page: Page, index: number, total: number) {
  return page.getByText(new RegExp(`^Otázka\\s*${index}\\s*z\\s*${total}$`));
}

/** The question shown right now, matched against the seed. */
export async function currentQuestion(page: Page): Promise<KnownQuestion> {
  const heading = page.getByRole("heading", { level: 2 }).filter({ hasText: /\S/ });
  let found: KnownQuestion | undefined;
  await expect
    .poll(async () => {
      for (const text of await heading.allTextContents()) {
        found = findQuestion(text);
        if (found) return true;
      }
      return false;
    })
    .toBe(true);
  return found!;
}

/** Difficulty of the shown question from its crown badge (1–3). */
export async function shownDifficulty(page: Page): Promise<number> {
  const label = await page
    .getByRole("img", { name: /^(Lehká|Střední|Těžká) otázka$/ })
    .getAttribute("aria-label");
  return label === "Lehká otázka" ? 1 : label === "Střední otázka" ? 2 : 3;
}

/**
 * Answers the current question right or wrong and moves on.
 * Returns the answered question.
 */
export async function answer(
  page: Page,
  index: number,
  total: number,
  correctly: boolean,
): Promise<KnownQuestion> {
  await expect(progress(page, index, total)).toBeVisible();
  const question = await currentQuestion(page);
  const text = correctly ? question.correct : question.wrong[0];
  const button = page.getByRole("button", { name: text, exact: true });
  await waitForHydration(button);
  await button.click();

  await settleAnswer(page, correctly ? "Správně!" : "Tentokrát vedle.");
  await page
    .getByRole("button", { name: index < total ? "Další otázka" : "Zobrazit výsledek" })
    .click();
  return question;
}

/** Plays a whole round; `plan[i]` says whether question i+1 is answered right. */
export async function playRound(page: Page, plan: boolean[]): Promise<KnownQuestion[]> {
  const asked: KnownQuestion[] = [];
  for (const [i, correctly] of plan.entries()) {
    asked.push(await answer(page, i + 1, plan.length, correctly));
  }
  return asked;
}

/** The "koruna učenosti" celebration, if one is open right now. */
export function celebration(page: Page) {
  return page.getByTestId("tier-celebration");
}

/** Closes the celebration with "Pokračovat" when it is open; returns its tier or null. */
export async function dismissCelebration(page: Page): Promise<string | null> {
  const dialog = celebration(page);
  if (!(await dialog.isVisible())) return null;
  const tier = await dialog.getAttribute("data-tier");
  await dialog.getByRole("button", { name: "Pokračovat" }).click();
  await expect(dialog).toHaveCount(0);
  return tier;
}

/**
 * Waits for the answer's feedback. A new "koruna učenosti" opens its
 * celebration in the same moment (as a modal, so the feedback is hidden from
 * the accessibility tree until it closes) – close it first.
 * Returns the celebrated tier, if any.
 */
export async function settleAnswer(page: Page, feedbackText: string): Promise<string | null> {
  const feedback = page.getByRole("status").filter({ hasText: feedbackText });
  await expect(feedback.or(celebration(page))).toBeVisible();
  const tier = await dismissCelebration(page);
  await expect(feedback).toBeVisible();
  return tier;
}
