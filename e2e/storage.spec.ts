import { expect, test } from "@playwright/test";

import { open, readCollection, setRawCollection } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

test("stará sbírka verze 1 se převede na verzi 2 a nic se neztratí", async ({ page }) => {
  const owned = ["libuse", "karel-iv", "marie-terezie"];
  await setRawCollection(page, JSON.stringify({ version: 1, kings: owned }));

  await open(page, "/");
  await expect(page.getByLabel("Postup sbírky")).toContainText(`Ve sbírce: ${owned.length} z ${kings.length}`);
  await expect.poll(() => readCollection(page)).toEqual({ version: 2, kings: owned, golden: [] });
});

const BROKEN = [
  "{not json",
  "null",
  "[1, 2, 3]",
  '"karel-iv"',
  JSON.stringify({ version: 2, kings: "karel-iv" }),
  JSON.stringify({ version: 99, kings: ["karel-iv"] }),
  JSON.stringify({ version: 2, kings: ["<script>alert(1)</script>", 42, null], golden: {} }),
];

for (const [i, raw] of BROKEN.entries()) {
  test(`poškozená data v localStorage stránku neshodí (${i + 1})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => {
      errors.push(`unexpected dialog: ${dialog.message()}`);
      void dialog.dismiss();
    });

    await setRawCollection(page, raw);
    for (const path of ["/", "/sbirka"]) {
      await open(page, path);
      await expect(page.getByLabel("Postup sbírky")).toContainText(`Ve sbírce: 0 z ${kings.length}`);
      await expect(page.getByText("Něco se pokazilo")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}
