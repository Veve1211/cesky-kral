// Header on every width: the logo stays whole and nothing overflows.
// Every menu item is icon-only below 768 px (`md`, with an aria-label) and
// shows icon + text from 768 px. Everything shares one line from 320 px; with
// larger text the menu may wrap onto a second line instead of cutting anything.
// No Ko-fi button in the header.
import { expect, type Page, test } from "@playwright/test";

import { open } from "./helpers/game";

const WIDTHS = [320, 340, 360, 375, 390, 414, 430, 460, 480, 640, 767, 768, 1024, 1280];

async function headerState(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const header = document.querySelector("body > header")!;
    const logo = header.querySelector('a[href="/"] span')!;
    const nav = header.querySelector('nav[aria-label="Hlavní navigace"]')!;
    const links = [...nav.querySelectorAll("a")];
    const inside = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= width + 0.5 && r.width > 0;
    };
    const items = links.map((a) => {
      const label = a.querySelector("span:not([aria-hidden])")!;
      const r = label.getBoundingClientRect();
      return {
        named: !!a.getAttribute("aria-label") && a.getAttribute("aria-label") === label.textContent,
        textVisible: inside(label) && r.width > 30 && getComputedStyle(label).position !== "absolute",
        iconOnly: r.width <= 1,
        iconInside: inside(a.querySelector("svg, span[aria-hidden]")!),
      };
    });
    return {
      logoWhole: logo.scrollWidth <= logo.clientWidth + 0.5 && inside(logo),
      linksInside: links.every(inside),
      linkCount: links.length,
      allNamed: items.every((i) => i.named),
      allTextVisible: items.every((i) => i.textVisible),
      allIconOnly: items.every((i) => i.iconOnly),
      iconsInside: items.every((i) => i.iconInside),
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
      const wide = width >= 768;
      test(`${width} px, ${fonts}: logo celé, menu ${wide ? "ikona + text" : "jen ikony"}, jeden řádek`, async ({ page }) => {
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
          linkCount: 4,
          allNamed: true,
          iconsInside: true,
          allTextVisible: wide,
          allIconOnly: !wide,
        });
        await expect(page.getByRole("banner").getByRole("link", { name: /groš/ })).toHaveCount(0);
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
      expect(state).toMatchObject({ logoWhole: true, linksInside: true, noPageScroll: true, iconsInside: true });
    });
  }
});
