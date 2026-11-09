import { expect, test } from "@playwright/test";

import { open } from "./helpers/game";
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
  await expect(timeline.getByTestId("timeline-unknown")).toHaveText(`a ještě ${kings.length} neznámých panovníků`);

  const whoFirst = page.getByRole("region", { name: "Kdo vládl dřív?" });
  await expect(whoFirst.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button")).toHaveCount(2);

  await expect(page.getByLabel("Postup sbírky")).toContainText("Panoš");
  await expect(page.getByLabel("Postup sbírky")).toContainText(`Ve sbírce: 0 z ${kings.length}`);
});
