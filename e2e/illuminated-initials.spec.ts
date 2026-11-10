import { expect, test, type Locator } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { chronicles, getKing, kings } from "./helpers/seed-answers";

/**
 * The decorative initial is drawn by CSS (`::before`), so the DOM text – what
 * search engines and screen readers get – holds the first letter only once:
 * "Vyber", never "VVyber".
 */
async function domText(locator: Locator) {
  return ((await locator.textContent()) ?? "").replace(/\s+/g, " ").trim();
}

async function expectSingleInitial(paragraph: Locator, expected: string) {
  const initial = paragraph.getByTestId("illuminated-initial");
  await expect(initial).toBeVisible();
  // the ornament carries no text of its own …
  expect(await initial.textContent()).toBe("");
  // … but still paints the letter
  const painted = await initial.locator("[data-letter]").evaluate((element) => getComputedStyle(element, "::before").content);
  expect(painted).toBe(`"${expected.charAt(0)}"`);
  const text = await domText(paragraph);
  expect(text.startsWith(expected.replace(/\s+/g, " ").trim().slice(0, 30))).toBe(true);
  expect(text.charAt(0)).not.toBe(text.charAt(1));
}

test("úvod: dlouhý úvodní odstavec s iniciálou nahradila jedna věta", async ({ page }) => {
  await open(page, "/");
  await expect(page.getByText("Odpovídej na otázky o českých panovnících a sbírej je jako karty.")).toBeVisible();
  await expect(page.locator("p", { hasText: "yber si panovníka a odpověz" })).toHaveCount(0);
});

test("stránky panovníků: popis začíná jedním písmenem (všech 18)", async ({ page }) => {
  expect(kings.length).toBe(18);
  // The description is shown once the card is collected (it would give answers away before).
  await setCollection(page, kings.map((king) => king.slug));
  for (const king of kings) {
    await open(page, `/kral/${king.slug}`);
    const bio = page.locator("p", { has: page.getByTestId("illuminated-initial") });
    await expectSingleInitial(bio, king.shortBio);
    expect(await domText(bio)).toBe(king.shortBio.replace(/\s+/g, " ").trim());
  }
});

test("kronika: první oddíl začíná jedním písmenem", async ({ page }) => {
  const slug = "vaclav-iv";
  await setCollection(page, [slug]);
  await open(page, "/");
  const king = getKing(slug);
  await page
    .getByRole("region", { name: "Galerie panovníků" })
    .getByRole("button", { name: `${king.title} ${king.name} – ve sbírce, přečíst kroniku` })
    .click();
  const dialog = page.getByRole("dialog", { name: `Kronika: ${king.name}` });
  const first = dialog.locator("p", { has: page.getByTestId("illuminated-initial") });
  await expectSingleInitial(first, chronicles[slug].sections[0].text);
  expect(await domText(first)).toBe(chronicles[slug].sections[0].text);
});
