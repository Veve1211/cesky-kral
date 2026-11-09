// Reign years (and the order of reigns) are the answers of "Kdo vládl dřív?",
// so no page may show them for kings the player hasn't collected yet.
import { expect, type Page, test } from "@playwright/test";

import { open, playRound, setCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

const ruledKings = kings.filter((king) => !king.isLegend && king.reignFrom !== null);
const rudolf = ruledKings.find((king) => king.slug === "rudolf-ii")!;
const rudolfReign = `${rudolf.reignFrom}–${rudolf.reignTo}`;

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
  await setCollection(page, [rudolf.slug]);
  await open(page, "/");

  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  const card = gallery
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: rudolf.name, exact: true }) });
  await expect(card.getByTestId("king-card-reign")).toHaveText(rudolfReign);
  await expect(gallery.getByText("???? – ????")).toHaveCount(ruledKings.length - 1);

  expect(await visibleReignYears(page)).toEqual([rudolf.reignFrom, rudolf.reignTo].sort());
});

test("stránka panovníka skrývá roky do získání a po výhře je ukáže", async ({ page }) => {
  await open(page, `/kral/${rudolf.slug}`);
  const reign = page.getByTestId("king-reign");
  await expect(reign).toContainText("???? – ????");
  await expect(reign).toContainText(rudolf.dynasty);
  await expect(reign).not.toContainText(String(rudolf.reignFrom));
  await expect(reign).not.toContainText(String(rudolf.reignTo));

  await playRound(page, [true, true, true, true, true]);
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();
  // The header updates right after the win…
  await expect(reign).toContainText(rudolfReign);

  // …and stays revealed after a reload.
  await open(page, `/kral/${rudolf.slug}`);
  await expect(page.getByTestId("king-reign")).toHaveText(`${rudolfReign} · ${rudolf.dynasty}`);
});

test("stránka panovníka: získaný panovník roky ukáže, ostatní ne", async ({ page }) => {
  await setCollection(page, [rudolf.slug]);
  await open(page, `/kral/${rudolf.slug}`);
  await expect(page.getByTestId("king-reign")).toHaveText(`${rudolfReign} · ${rudolf.dynasty}`);

  const other = ruledKings.find((king) => king.slug === "karel-iv")!;
  await open(page, `/kral/${other.slug}`);
  await expect(page.getByTestId("king-reign")).toContainText("???? – ????");
  await expect(page.getByTestId("king-reign")).not.toContainText(String(other.reignFrom));
});

/** Both timelines: the strip on the home page and the full one on /sbirka. */
for (const path of ["/", "/sbirka"]) {
  test.describe(`Řeka času (${path})`, () => {
    const timeline = (page: Page) => page.getByRole("region", { name: "Řeka času", exact: true });

    test("s prázdnou sbírkou neukazuje žádné jméno ani odkaz na panovníka", async ({ page }) => {
      await open(page, path);
      const river = timeline(page);
      await expect(river.getByTestId("timeline-unknown")).toHaveText(`a ještě ${kings.length} neznámých panovníků`);
      await expect(river.getByRole("link")).toHaveCount(0);
      await expect(river.getByRole("button")).toHaveCount(0);
      await expect(river.getByRole("listitem")).toHaveCount(0);
      const text = await river.innerText();
      for (const king of kings) expect(text).not.toContain(king.name);
      // Nothing points at a king page, not even hidden links or labels.
      await expect(river.locator("a[href], [aria-label*='král'], [aria-label*='kníže']")).toHaveCount(0);
    });

    test("po získání Rudolfa II. ukazuje jen jeho", async ({ page }) => {
      await setCollection(page, [rudolf.slug]);
      await open(page, path);
      const river = timeline(page);
      await expect(river.getByRole("listitem")).toHaveCount(1);
      await expect(river.getByRole("listitem")).toContainText(rudolf.name);
      await expect(river.getByRole("listitem")).toContainText(rudolfReign);
      await expect(river.getByTestId("timeline-unknown")).toHaveText(
        `a ještě ${kings.length - 1} neznámých panovníků`,
      );
      const text = await river.innerText();
      for (const king of kings.filter((k) => k.slug !== rudolf.slug)) {
        expect(text).not.toContain(king.name);
      }
      const hrefs = await river.locator("a[href]").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
      expect(hrefs.every((href) => href === `/kral/${rudolf.slug}`)).toBe(true);
    });
  });
}
