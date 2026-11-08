import { expect, test } from "@playwright/test";

import { open } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

test("úvodní stránka: galerie se všemi panovníky, Řeka času a Kdo vládl dřív?", async ({ page }) => {
  await open(page, "/");

  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  await expect(gallery.getByRole("listitem")).toHaveCount(kings.length);
  expect(kings).toHaveLength(12);
  for (const king of kings) {
    await expect(gallery.getByRole("heading", { name: king.name, exact: true })).toBeVisible();
  }

  const timeline = page.getByRole("region", { name: "Řeka času", exact: true });
  await expect(timeline.getByRole("heading", { name: "Řeka času" })).toBeVisible();
  await expect(timeline.getByRole("listitem")).toHaveCount(kings.length);

  const whoFirst = page.getByRole("region", { name: "Kdo vládl dřív?" });
  await expect(whoFirst.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button")).toHaveCount(2);

  await expect(page.getByLabel("Postup sbírky")).toContainText("Panoš");
  await expect(page.getByLabel("Postup sbírky")).toContainText(`Ve sbírce: 0 z ${kings.length}`);
});
