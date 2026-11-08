import { expect, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";
import { chronicles, getKing } from "./helpers/seed-answers";

const SLUG = "karel-iv";

test("kronika: u získaného panovníka se otevře s oddíly a zdroji", async ({ page }) => {
  await setCollection(page, [SLUG]);
  await open(page, "/");
  const king = getKing(SLUG);
  const chronicle = chronicles[SLUG];
  expect(chronicle.sections.length).toBeGreaterThan(0);

  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  await gallery.getByRole("button", { name: `král ${king.name} – ve sbírce, přečíst kroniku` }).click();

  const dialog = page.getByRole("dialog", { name: `Kronika: ${king.name}` });
  await expect(dialog).toBeVisible();
  for (const section of chronicle.sections) {
    await expect(dialog.getByRole("heading", { name: section.heading })).toBeVisible();
  }
  await expect(dialog.getByRole("heading", { name: "Zdroje" })).toBeAttached();
  for (const source of chronicle.sources) {
    const link = dialog.getByRole("link", { name: source.label });
    await expect(link).toHaveAttribute("href", source.url);
    await expect(link).toHaveAttribute("rel", /noopener/);
  }

  await dialog.getByRole("button", { name: "Zavřít kroniku" }).click();
  await expect(dialog).toBeHidden();
});

test("kronika: u nezískaného panovníka je zamčená", async ({ page }) => {
  await open(page, "/");
  const king = getKing(SLUG);
  const gallery = page.getByRole("region", { name: "Galerie panovníků" });

  const card = gallery.getByRole("link", { name: `král ${king.name} – hrát o kartu` });
  await expect(card).toContainText("Kronika se odemkne, až panovníka získáš.");
  await expect(gallery.getByRole("button", { name: /přečíst kroniku/ })).toHaveCount(0);

  await card.click();
  await expect(page).toHaveURL(`/kral/${SLUG}`);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
