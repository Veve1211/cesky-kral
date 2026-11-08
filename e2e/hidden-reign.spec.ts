// Reign years are the answers of "Kdo vládl dřív?", so the home page must
// not show them for kings the player hasn't collected yet.
import { expect, type Page, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

const ruledKings = kings.filter((king) => !king.isLegend && king.reignFrom !== null);

/** Every reign year from the seed that appears as a stand-alone number in the main content. */
async function visibleReignYears(page: Page): Promise<number[]> {
  const text = await page.locator("main").innerText();
  const found = new Set(text.match(/\d+/g)?.map(Number) ?? []);
  const years = ruledKings.flatMap((king) => [king.reignFrom, king.reignTo]);
  return [...new Set(years)].filter((year): year is number => year !== null && found.has(year)).sort();
}

test("úvodní stránka s prázdnou sbírkou neukazuje žádné roky vlády", async ({ page }) => {
  await open(page, "/");
  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  await expect(gallery.getByRole("listitem")).toHaveCount(kings.length);

  expect(await visibleReignYears(page)).toEqual([]);

  // Instead of the years each ruler shows "???? – ????"; the legend shows none.
  const reigns = gallery.getByTestId("king-card-reign");
  await expect(reigns).toHaveCount(ruledKings.length);
  for (const reign of await reigns.all()) {
    await expect(reign).toContainText("???? – ????");
  }
  const libuse = gallery.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Libuše" }) });
  await expect(libuse.getByTestId("king-card-reign")).toHaveCount(0);
});

test("po získání panovníka jsou vidět jen jeho roky vlády", async ({ page }) => {
  const rudolf = ruledKings.find((king) => king.slug === "rudolf-ii")!;
  await setCollection(page, [rudolf.slug]);
  await open(page, "/");

  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  const card = gallery
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: rudolf.name, exact: true }) });
  await expect(card.getByTestId("king-card-reign")).toHaveText(`${rudolf.reignFrom}–${rudolf.reignTo}`);
  await expect(gallery.getByText("???? – ????")).toHaveCount(ruledKings.length - 1);

  expect(await visibleReignYears(page)).toEqual([rudolf.reignFrom, rudolf.reignTo].sort());
});
