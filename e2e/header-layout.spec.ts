// Header on every width: the logo stays whole and nothing overflows.
// The test build includes the Ko-fi coin in the header (see helpers/kofi.ts).
// "Jak hrát" is icon-only below 640 px (`sm`, with an aria-label) and shows
// its text from 640 px. Everything shares one line from 320 px; with larger
// text the menu may wrap onto a second line instead of cutting anything.
import { expect, type Page, test } from "@playwright/test";

import { open } from "./helpers/game";

const WIDTHS = [320, 340, 360, 375, 390, 414, 430, 460, 480, 640, 768, 1280];

async function headerState(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const header = document.querySelector("body > header")!;
    const logo = header.querySelector('a[href="/"] span')!;
    const nav = header.querySelector('nav[aria-label="Hlavní navigace"]')!;
    const howTo = [...nav.querySelectorAll("a")].find((a) => a.getAttribute("href") === "/jak-hrat")!;
    const howToLabel = [...howTo.querySelectorAll("span")].find((s) => s.textContent === "Jak hrát")!;
    const inside = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= width + 0.5 && r.width > 0;
    };
    const label = getComputedStyle(howToLabel);
    return {
      logoWhole: logo.scrollWidth <= logo.clientWidth + 0.5 && inside(logo),
      linksInside: [...nav.querySelectorAll("a")].every(inside),
      howToTextVisible: inside(howToLabel) && howToLabel.getBoundingClientRect().width > 30 && label.position !== "absolute",
      howToIconOnly: howToLabel.getBoundingClientRect().width <= 1 && howTo.getAttribute("aria-label") === "Jak hrát",
      howToIconInside: inside(howTo.querySelector("svg")!),
      noPageScroll: document.documentElement.scrollWidth <= width,
      headerHeight: header.getBoundingClientRect().height,
    };
  });
}

test.describe("hlavička na úzkých displejích", () => {
  test.skip(({ isMobile }) => isMobile, "Viewports are set per test; one project is enough.");

  // Fonts use `display: optional`: on a slow connection (or a busy CI machine)
  // the page keeps the wider fallback fonts, so check both cases.
  for (const fonts of ["webová písma", "náhradní písma"] as const) {
    for (const width of WIDTHS) {
      const wide = width >= 640;
      test(`${width} px, ${fonts}: logo celé, „Jak hrát“ ${wide ? "s textem" : "jen ikona"}, jeden řádek`, async ({ page }) => {
        if (fonts === "náhradní písma") await page.route(/\.(woff2?|ttf)(\?|$)/, (route) => route.abort());
        await page.setViewportSize({ width, height: 700 });
        await open(page, "/jak-hrat");
        if (fonts === "webová písma") {
          // Make sure the web fonts are really in use (cached → applied at once).
          await page.evaluate(() => document.fonts.ready);
          await open(page, "/jak-hrat");
        }
        const state = await headerState(page);
        expect(state).toMatchObject({
          logoWhole: true,
          linksInside: true,
          noPageScroll: true,
          howToIconInside: true,
          howToTextVisible: wide,
          howToIconOnly: !wide,
        });
        await expect(page.getByTestId("kofi-header")).toBeVisible();
        // Normal text size: logo and menu share one line (56 px bar + 3 px gilded rule).
        expect(state.headerHeight).toBeLessThanOrEqual(60);
      });
    }
  }

  for (const width of [320, 375]) {
    test(`${width} px s větším písmem: nic se neusekne ani nepřeteče`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await open(page, "/jak-hrat");
      await page.addStyleTag({ content: "html { font-size: 20px !important; }" });
      const state = await headerState(page);
      expect(state).toMatchObject({ logoWhole: true, linksInside: true, noPageScroll: true, howToIconInside: true });
    });
  }
});
