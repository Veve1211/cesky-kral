// "Nový" badge in Řeka času: marks the most recently collected king until
// the player has seen the river once.
import { expect, type Page, test } from "@playwright/test";

import { open, playRound, setCollection } from "./helpers/game";
import { getKing } from "./helpers/seed-answers";

const SEEN_KEY = "cesky-kral:timeline-seen";

const timeline = (page: Page) => page.getByRole("region", { name: "Řeka času", exact: true });

function stop(page: Page, name: string) {
  return timeline(page).getByRole("listitem").filter({ hasText: name });
}

/** Waits until the river has remembered the badge as seen. */
async function waitUntilSeen(page: Page, slug: string) {
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), SEEN_KEY))
    .toBe(JSON.stringify({ version: 1, slug }));
}

test("prázdná sbírka: žádný štítek Nový", async ({ page }) => {
  await open(page, "/");
  await expect(timeline(page).getByTestId("timeline-unknown")).toBeVisible();
  await expect(page.getByTestId("new-badge")).toHaveCount(0);
});

test("štítek Nový je jen u naposledy získaného, čtečka ho přečte a po prohlédnutí zmizí", async ({ page }) => {
  const karel = getKing("karel-iv");
  const rudolf = getKing("rudolf-ii");
  // Collection keeps the order of winning: Rudolf II. was won last.
  await setCollection(page, [karel.slug, rudolf.slug]);
  await open(page, "/");

  const badges = timeline(page).getByTestId("new-badge");
  await expect(badges).toHaveCount(1);
  await expect(stop(page, rudolf.name).getByTestId("new-badge")).toBeVisible();
  await expect(stop(page, rudolf.name).getByText("Nový")).toBeVisible();
  await expect(stop(page, karel.name).getByTestId("new-badge")).toHaveCount(0);

  // Screen readers get it from the control's name.
  await expect(stop(page, rudolf.name).locator("button, a").first()).toHaveAccessibleName(/nově získaný/);
  await expect(stop(page, karel.name).locator("button, a").first()).not.toHaveAccessibleName(/nově získaný/);

  // Seen once → gone on the next visit, on both pages with the river.
  await waitUntilSeen(page, rudolf.slug);
  await expect(badges).toHaveCount(1); // stays for the current visit
  await open(page, "/");
  await expect(stop(page, rudolf.name)).toBeVisible();
  await expect(timeline(page).getByTestId("new-badge")).toHaveCount(0);
  await open(page, "/sbirka");
  await expect(stop(page, rudolf.name)).toBeVisible();
  await expect(timeline(page).getByTestId("new-badge")).toHaveCount(0);
});

test("po výhře nového panovníka má štítek Nový on, ne ten dřív viděný", async ({ page }) => {
  const rudolf = getKing("rudolf-ii");
  const karel = getKing("karel-iv");
  await setCollection(page, [rudolf.slug]);
  await page.evaluate(
    ([key, slug]) => window.localStorage.setItem(key, JSON.stringify({ version: 1, slug })),
    [SEEN_KEY, rudolf.slug],
  );

  await open(page, "/sbirka");
  await expect(stop(page, rudolf.name)).toBeVisible();
  await expect(timeline(page).getByTestId("new-badge")).toHaveCount(0);

  await open(page, `/kral/${karel.slug}`);
  await playRound(page, [true, true, true, true, true]);
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();

  await open(page, "/sbirka");
  await expect(timeline(page).getByTestId("new-badge")).toHaveCount(1);
  await expect(stop(page, karel.name).getByTestId("new-badge")).toBeVisible();
  await expect(stop(page, rudolf.name).getByTestId("new-badge")).toHaveCount(0);
  // The river may start below the fold (e.g. under the Ko-fi card) – "seen" means scrolled to.
  await stop(page, karel.name).scrollIntoViewIfNeeded();
  await waitUntilSeen(page, karel.slug);

  await open(page, "/");
  await expect(stop(page, karel.name)).toBeVisible();
  await expect(timeline(page).getByTestId("new-badge")).toHaveCount(0);
});

test("poškozený záznam o zhlédnutí stránku neshodí, štítek se jen ukáže znovu", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const rudolf = getKing("rudolf-ii");
  await setCollection(page, [rudolf.slug]);
  for (const raw of ["{nope", '{"version":1,"slug":"<script>"}', "null", '{"version":9,"slug":"rudolf-ii"}']) {
    await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [SEEN_KEY, raw]);
    await open(page, "/");
    await expect(stop(page, rudolf.name).getByTestId("new-badge")).toBeVisible();
    // Let this visit finish saving "seen" before the next corrupted value goes in.
    await waitUntilSeen(page, rudolf.slug);
  }
  expect(errors).toEqual([]);
});
