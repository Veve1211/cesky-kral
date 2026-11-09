import { expect, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

test("úvodní stránka: galerie se všemi panovníky, Řeka času a Kdo vládl dřív?", async ({ page }) => {
  await open(page, "/");

  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  await expect(gallery.getByRole("listitem")).toHaveCount(kings.length);
  expect(kings).toHaveLength(18);
  for (const king of kings) {
    await expect(gallery.getByRole("heading", { name: king.name, exact: true })).toBeVisible();
  }

  const timeline = page.getByRole("region", { name: "Řeka času", exact: true });
  await expect(timeline.getByRole("heading", { name: "Řeka času" })).toBeVisible();
  // Empty collection: no stops on the river, just the count of unknown rulers.
  await expect(timeline.getByRole("listitem")).toHaveCount(0);
  await expect(timeline.getByTestId("timeline-unknown")).toHaveText(`${kings.length} panovníků čeká na objevení`);

  const whoFirst = page.getByRole("region", { name: "Kdo vládl dřív?" });
  await expect(whoFirst.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button")).toHaveCount(2);

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
