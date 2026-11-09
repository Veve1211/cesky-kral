import { expect, test, type Locator, type Page } from "@playwright/test";

import { celebration, currentQuestion, open, progress, settleAnswer, readCollection, setCollection, STORAGE_KEY, waitForHydration } from "./helpers/game";
import { findQuestion, kings } from "./helpers/seed-answers";

/** Reach a control through the actual tab order, without focusing it via script. */
async function tabTo(page: Page, control: Locator) {
  for (let i = 0; i < 20; i++) {
    if (await control.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(control).toBeFocused();
}

const modes = [
  { name: "výhra", path: "/kral/rudolf-ii", count: 5, correct: true, heading: "Král je ve tvé sbírce!" },
  { name: "prohra", path: "/kral/rudolf-ii", count: 5, correct: false, heading: "Konec hry", restart: "Zkusit znovu" },
  { name: "zlatá výhra", path: "/kral/rudolf-ii/zlate-kolo", count: 3, correct: true, heading: "Zlatá karta je tvoje!", golden: true },
  { name: "zlatá prohra", path: "/kral/rudolf-ii/zlate-kolo", count: 3, correct: false, heading: "Konec zlatého kola", golden: true },
  { name: "rychlovka", path: "/rychlovka", count: 10, correct: true, heading: "Konec rychlovky" },
];

for (const mode of modes) {
  test(`klávesnice: ${mode.name}, fokus otázky a výsledku`, async ({ page }) => {
    if (mode.golden) await setCollection(page, ["rudolf-ii"]);
    await open(page, mode.path);
    for (let i = 0; i < mode.count; i++) {
      const question = await currentQuestion(page);
      const heading = page.getByRole("heading", { level: 2, name: question.text, exact: true });
      if (i > 0) {
        await expect(heading).toBeFocused();
        await expect(heading).toHaveAccessibleDescription(new RegExp(`Otázka\\s*${i + 1}\\s*z\\s*${mode.count}`));
        // Tab from the heading proceeds to the answers, not back to the header.
        await page.keyboard.press("Tab");
        await expect(page.locator('main button[aria-pressed="false"]').first()).toBeFocused();
      }
      const choice = page.getByRole("button", { name: mode.correct ? question.correct : question.wrong[0], exact: true });
      await waitForHydration(choice);
      await tabTo(page, choice);
      await page.keyboard.press("Enter");
      const feedback = page.getByRole("status").filter({ hasText: mode.correct ? "Správně!" : "Tentokrát vedle." });
      await expect(feedback.or(celebration(page))).toBeVisible();
      // A new "koruna učenosti": its "Pokračovat" gets focus, Enter closes it.
      if (await celebration(page).isVisible()) {
        await expect(celebration(page).getByRole("button", { name: "Pokračovat" })).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(celebration(page)).toHaveCount(0);
      }
      await expect(feedback).toBeVisible();
      const next = page.getByRole("button", { name: i < mode.count - 1 ? "Další otázka" : "Zobrazit výsledek", exact: true });
      await expect(next).toBeFocused();
      await page.keyboard.press("Enter");
    }
    const result = page.getByRole("heading", { name: mode.heading, exact: true });
    await expect(result).toBeFocused();
    await expect(result).toHaveAccessibleDescription(new RegExp(`${mode.correct ? mode.count : 0}\\s*z\\s*${mode.count}`));
    if (mode.restart) {
      await tabTo(page, page.getByRole("button", { name: mode.restart, exact: true }));
      await page.keyboard.press("Enter");
      // The restart loads new random questions from the server, so the
      // heading may be swapped once more – check whichever question ends up
      // there is focused, not the one read a moment earlier.
      await expect(progress(page, 1, mode.count)).toBeVisible();
      await expect
        .poll(async () => {
          const focused = await page.evaluate(() => {
            const active = document.activeElement;
            return active?.tagName === "H2" ? (active.textContent ?? "") : null;
          });
          return focused !== null && findQuestion(focused) !== undefined;
        })
        .toBe(true);
    }
  });
}

test("myš a dotyk: další otázka i výhra zůstávají ovladatelné", async ({ page, isMobile }) => {
  await open(page, "/kral/rudolf-ii");
  for (let i = 0; i < 5; i++) {
    const question = await currentQuestion(page);
    const heading = page.getByRole("heading", { name: question.text, exact: true });
    if (i > 0) await expect(heading).toBeFocused();
    const answer = page.getByRole("button", { name: question.correct, exact: true });
    await waitForHydration(answer);
    if (isMobile) await answer.tap(); else await answer.click();
    await settleAnswer(page, "Správně!");
    const next = page.getByRole("button", { name: i < 4 ? "Další otázka" : "Zobrazit výsledek", exact: true });
    await expect(next).toBeVisible();
    if (isMobile) await next.tap(); else await next.click();
  }
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!", exact: true })).toBeFocused();
  expect((await readCollection(page))?.kings).toEqual(["rudolf-ii"]);
});

test("fokus výsledku při chybě ukládání a po úspěšném opakování", async ({ page }) => {
  await page.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    let blocked = true;
    window.addEventListener("test:unblock-save", () => { blocked = false; });
    Storage.prototype.setItem = function (storageKey, value) {
      if (this === window.localStorage && storageKey === key && blocked) {
        throw new DOMException("Storage full", "QuotaExceededError");
      }
      original.call(this, storageKey, value);
    };
  }, STORAGE_KEY);
  await open(page, "/kral/rudolf-ii");
  for (let i = 0; i < 5; i++) {
    const question = await currentQuestion(page);
    await page.getByRole("button", { name: question.correct, exact: true }).click();
    await settleAnswer(page, "Správně!");
    await page.getByRole("button", { name: i < 4 ? "Další otázka" : "Zobrazit výsledek", exact: true }).click();
  }
  const error = page.getByRole("heading", { name: "Kartu se nepodařilo uložit", exact: true });
  await expect(error).toBeFocused();
  await expect(error).toHaveAccessibleDescription(/5\s*z\s*5/);
  await page.evaluate(() => window.dispatchEvent(new Event("test:unblock-save")));
  await tabTo(page, page.getByRole("button", { name: "Zkusit uložit znovu", exact: true }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!", exact: true })).toBeFocused();
});

/**
 * Check every gradient stop against conservative bounds of the rendered backdrop.
 * Compositing each CSS background layer avoids guessing a single parchment colour
 * and catches light gradient stops that axe cannot measure in background-clipped text.
 */
async function expectHeadingContrast(heading: Locator) {
  const measurement = await heading.evaluate((element) => {
    type RGB = [number, number, number];
    type RGBA = [number, number, number, number];
    function colours(value: string): RGBA[] {
      return [...value.matchAll(/rgba?\(([^)]+)\)/g)].map((match) => {
        const parts = match[1].split(/[,\s/]+/).map(Number);
        return [parts[0], parts[1], parts[2], parts[3] ?? 1] as RGBA;
      });
    }
    function layers(value: string) {
      let depth = 0, start = 0;
      const result: string[] = [];
      for (let i = 0; i < value.length; i++) {
        if (value[i] === "(") depth++;
        if (value[i] === ")") depth--;
        if (value[i] === "," && depth === 0) { result.push(value.slice(start, i)); start = i + 1; }
      }
      result.push(value.slice(start));
      return result;
    }
    let min: RGB = [255, 255, 255], max: RGB = [255, 255, 255];
    function composite(stops: RGBA[]) {
      if (!stops.length) return;
      min = min.map((channel, i) => Math.min(...stops.map((c) => c[i] * c[3] + channel * (1 - c[3])))) as RGB;
      max = max.map((channel, i) => Math.max(...stops.map((c) => c[i] * c[3] + channel * (1 - c[3])))) as RGB;
    }
    const ancestors: Element[] = [];
    for (let parent = element.parentElement; parent; parent = parent.parentElement) ancestors.unshift(parent);
    for (const ancestor of ancestors) {
      const style = getComputedStyle(ancestor);
      composite(colours(style.backgroundColor));
      for (const layer of layers(style.backgroundImage).reverse()) composite(colours(layer));
    }
    function luminance(rgb: RGB) {
      return rgb.map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; })
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    }
    const style = getComputedStyle(element);
    const paint = style.backgroundClip.includes("text") ? colours(style.backgroundImage) : colours(style.color);
    const low = luminance(min), high = luminance(max);
    const ratios = paint.map((c) => {
      const light = luminance(c.slice(0, 3) as RGB);
      if (light >= low && light <= high) return 1;
      return Math.min(...[low, high].map((bg) => (Math.max(light, bg) + 0.05) / (Math.min(light, bg) + 0.05)));
    });
    const size = parseFloat(style.fontSize), weight = parseInt(style.fontWeight, 10);
    return { ratios, threshold: size >= 24 || (size >= 18.667 && weight >= 700) ? 3 : 4.5, background: { min, max } };
  });
  expect(measurement.ratios.length).toBeGreaterThan(0);
  for (const ratio of measurement.ratios) expect(ratio, JSON.stringify(measurement)).toBeGreaterThanOrEqual(measurement.threshold);
}

for (const path of ["/", "/sbirka"]) {
  test(`WCAG AA: zlatý nadpis na pergamenu (${path})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, path);
    await page.evaluate(() => document.fonts.ready);
    await expectHeadingContrast(page.getByRole("heading", { level: 1 }).locator("span").first());
  });
}

test("WCAG AA: nadpisy s úplnou sbírkou na pergamenu i tmavém pozadí", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setCollection(page, kings.map((king) => king.slug));
  for (const path of ["/", "/sbirka"]) {
    await open(page, path);
    await page.evaluate(() => document.fonts.ready);
    await expectHeadingContrast(page.getByRole("heading", { level: 1 }).locator("span").first());
    await expectHeadingContrast(page.getByRole("heading", { name: /Jsi Český král/ }).locator("span").last());
  }
});
