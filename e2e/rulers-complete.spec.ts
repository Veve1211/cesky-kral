import { existsSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";
import sharp from "sharp";

import { imageCredits } from "../src/lib/image-credits";
import { open, setCollection } from "./helpers/game";
import { chronicles, kings } from "./helpers/seed-answers";

/** Card label prefix as the gallery builds it (legends get " (pověst)"). */
function label(king: (typeof kings)[number]) {
  return `${king.title} ${king.name}${king.isLegend ? " (pověst)" : ""}`;
}

/** Every ruler – the six of batch 6 included – has a portrait and a chronicle. */
test("data: všech 18 panovníků má portrét s kreditem a kroniku se zdrojem", async () => {
  expect(kings).toHaveLength(18);
  for (const king of kings) {
    expect(king.imageUrl, king.slug).toBe(`/kings/${king.slug}.webp`);
    const file = join(process.cwd(), "public", king.imageUrl!);
    expect(existsSync(file), file).toBe(true);
    const meta = await sharp(file).metadata();
    expect(Math.max(meta.width ?? 0, meta.height ?? 0), king.slug).toBeLessThanOrEqual(800);

    const credit = imageCredits.find((c) => c.kingSlug === king.slug);
    expect(credit, `credit ${king.slug}`).toBeDefined();
    expect(credit!.localPath).toBe(king.imageUrl);
    expect(credit!.commonsUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    expect(credit!.license).toMatch(/public domain|PD/i);

    const chronicle = chronicles[king.slug];
    expect(chronicle, `chronicle ${king.slug}`).toBeDefined();
    expect(chronicle.sections.length, king.slug).toBeGreaterThanOrEqual(3);
    expect(chronicle.facts.length, king.slug).toBeGreaterThanOrEqual(4);
    expect(chronicle.sources.length, king.slug).toBeGreaterThan(0);
    for (const source of chronicle.sources) expect(source.url).toMatch(/^https:\/\//);
  }
});

test("galerie: každý nezískaný panovník má portrét a zamčenou kroniku", async ({ page }) => {
  await open(page, "/");
  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  for (const king of kings) {
    const card = gallery.getByRole("link", { name: `${label(king)} – hrát o kartu`, exact: true });
    await expect(card).toContainText("Kronika se odemkne, až panovníka získáš.");
    await expect(card.locator("img")).toHaveCount(1);
  }
});

test("galerie: každý získaný panovník otevře kroniku s portrétem", async ({ page }) => {
  await setCollection(page, kings.map((king) => king.slug));
  await open(page, "/");
  const gallery = page.getByRole("region", { name: "Galerie panovníků" });
  for (const king of kings) {
    const name = `${label(king)} – ve sbírce, přečíst kroniku`;
    const button = gallery.getByRole("button", { name, exact: true });
    const card = gallery.locator("div.group").filter({ has: page.getByRole("button", { name, exact: true }) });
    await expect(card.locator("img")).toHaveCount(1);
    await button.click();
    const dialog = page.getByRole("dialog", { name: `Kronika: ${king.name}` });
    await expect(dialog.getByRole("heading", { name: chronicles[king.slug].sections[0].heading, exact: true }).first()).toBeVisible();
    await dialog.getByRole("button", { name: "Zavřít kroniku" }).click();
    await expect(dialog).toBeHidden();
  }
});

test("Kdo vládl dřív?: obě karty mají portrét, ne jen písmeno", async ({ page }) => {
  await open(page, "/kdo-driv");
  const buttons = page.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button");
  await expect(buttons).toHaveCount(2);
  for (const button of await buttons.all()) await expect(button.locator("img")).toHaveCount(1);
});

test("Karel I.: jako český král Karel III. (popis i kronika)", async ({ page }) => {
  const karel = kings.find((king) => king.slug === "karel-i")!;
  expect(karel.shortBio).toContain("Karlem III.");
  expect(chronicles["karel-i"].sections.map((s) => s.text).join(" ")).toContain("Karlem III.");
  expect(chronicles["karel-i"].sources.map((s) => s.url)).toContain("https://cs.wikipedia.org/wiki/Karel_I.");
  // The description shows once the card is collected (before, it would give answers away).
  await setCollection(page, ["karel-i"]);
  await open(page, "/kral/karel-i");
  await expect(page.locator("p", { hasText: "Jako český král byl Karlem III." })).toBeVisible();
});
