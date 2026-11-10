import { expect, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

test("úvodní stránka: hodnost, galerie se všemi panovníky, Řeka času bez nadpisu a odkazy dole", async ({ page }) => {
  await open(page, "/");

  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  await expect(gallery.getByRole("listitem")).toHaveCount(kings.length);
  expect(kings).toHaveLength(18);
  for (const king of kings) {
    await expect(gallery.getByRole("heading", { name: king.name, exact: true })).toBeVisible();
  }

  const timeline = page.getByRole("region", { name: "Řeka času", exact: true });
  // No heading or game description on the home page – just the strip.
  await expect(timeline.getByRole("heading")).toHaveCount(0);
  await expect(timeline).not.toContainText("Hraj Řeku času");
  // Empty collection: no stops on the river, just the count of unknown rulers.
  await expect(timeline.getByRole("listitem")).toHaveCount(0);
  await expect(timeline.getByTestId("timeline-unknown")).toHaveText(`${kings.length} panovníků čeká na objevení`);

  // The full "Kdo vládl dřív?" game and the crest card live on their own pages.
  await expect(page.getByRole("group", { name: "Kdo začal vládnout dřív?" })).toHaveCount(0);
  await expect(page.getByTestId("crest-card")).toHaveCount(0);
  const more = page.getByRole("navigation", { name: "Další na Českém králi" });
  await expect(more.getByRole("link", { name: "Kdo vládl dřív?" })).toHaveAttribute("href", "/kdo-driv");
  await expect(more.getByRole("link", { name: "Můj erb" })).toHaveAttribute("href", "/muj-erb");
  // Order: rank → main button → river → gallery → links at the bottom.
  const y = async (l: import("@playwright/test").Locator) => (await l.boundingBox())!.y;
  const order = [
    await y(page.getByLabel("Postup sbírky")),
    await y(page.getByTestId("start-button")),
    await y(timeline),
    await y(gallery),
    await y(more),
  ];
  expect(order).toEqual([...order].sort((a, b) => a - b));

  await expect(page.getByLabel("Postup sbírky")).toContainText("Panoš");
  await expect(page.getByLabel("Postup sbírky")).toContainText(`Ve sbírce: 0 z ${kings.length}`);
});

test("úvod: jedno hlavní tlačítko – nový hráč „Začni hrát“, vracející se „Pokračuj“", async ({ page }) => {
  const ordered = [...kings].sort((a, b) => a.order - b.order);
  await setCollection(page, []);
  await open(page, "/");
  const start = page.getByTestId("start-button");
  await expect(start).toHaveText("Začni hrát");
  await expect(start).toHaveAttribute("href", `/kral/${ordered[0].slug}`);
  await expect(start).toHaveAccessibleDescription(`První karta: ${ordered[0].name}`);
  // The daily challenge is a smaller second choice under it.
  const daily = page.getByRole("link", { name: /Denní výzva/ });
  await expect(daily).toBeVisible();
  const [startBox, dailyBox] = [await start.boundingBox(), await daily.boundingBox()];
  expect(dailyBox!.y).toBeGreaterThan(startBox!.y + startBox!.height);
  expect(dailyBox!.height).toBeLessThan(startBox!.height);
  await start.click();
  await expect(page).toHaveURL(`/kral/${ordered[0].slug}`);

  // Returning player: the next ruler not collected yet.
  await setCollection(page, [ordered[0].slug, ordered[1].slug, ordered[3].slug]);
  await open(page, "/");
  await expect(start).toHaveText("Pokračuj");
  await expect(start).toHaveAttribute("href", `/kral/${ordered[2].slug}`);
  await expect(start).toHaveAccessibleDescription(`Další karta: ${ordered[2].name}`);

  // Everyone collected: on to the first card that is not golden yet.
  await setCollection(page, ordered.map((k) => k.slug), [ordered[0].slug]);
  await open(page, "/");
  await expect(start).toHaveAttribute("href", `/kral/${ordered[1].slug}/zlate-kolo`);
  await expect(start).toHaveAccessibleDescription(`Mistrovské kolo: ${ordered[1].name}`);
});

test("Řeka času na úvodu: posune se prstem a po puštění se vrátí na původní místo", async ({ page }) => {
  // 17 of 18 (no end-of-collection ceremony), the newest already seen (no auto-scroll).
  const owned = kings.slice(0, 17).map((king) => king.slug);
  await setCollection(page, owned);
  await page.evaluate((slug) => window.localStorage.setItem("cesky-kral:timeline-seen", JSON.stringify({ version: 1, slug })), owned[16]);
  await open(page, "/");
  const strip = page.getByRole("region", { name: "Řeka času, posuvný pruh" });
  await expect(strip.getByRole("listitem")).toHaveCount(owned.length);
  const start = await strip.evaluate((el) => el.scrollLeft);
  // A finger drags the strip to the side…
  await strip.evaluate((el) => {
    el.dispatchEvent(new Event("touchstart"));
    el.scrollLeft += 300;
  });
  expect(await strip.evaluate((el) => el.scrollLeft)).not.toBe(start);
  // …and lets go: the river glides back.
  await strip.evaluate((el) => el.dispatchEvent(new Event("touchend")));
  await expect.poll(() => strip.evaluate((el) => Math.round(el.scrollLeft))).toBe(Math.round(start));
});
