// Header on narrow screens: the logo stays whole and "Jak hrát" stays readable.
// With larger text the menu wraps onto a second line instead of cutting anything.
import { expect, type Page, test } from "@playwright/test";

import { open } from "./helpers/game";

const WIDTHS = [320, 360, 375, 390, 414, 480, 768, 1280];

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
      noPageScroll: document.documentElement.scrollWidth <= width,
      headerHeight: header.getBoundingClientRect().height,
    };
  });
}

test.describe("hlavička na úzkých displejích", () => {
  test.skip(({ isMobile }) => isMobile, "Viewports are set per test; one project is enough.");

  for (const width of WIDTHS) {
    test(`${width} px: logo celé, „Jak hrát“ čitelné, jeden řádek`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await open(page, "/jak-hrat");
      const state = await headerState(page);
      expect(state).toMatchObject({ logoWhole: true, linksInside: true, howToTextVisible: true, noPageScroll: true });
      // Normal text size: logo and menu share one line (56 px bar + 3 px gilded rule).
      expect(state.headerHeight).toBeLessThanOrEqual(60);
    });
  }

  for (const width of [320, 375]) {
    test(`${width} px s větším písmem: menu přejde na druhý řádek, nic se neusekne`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await open(page, "/jak-hrat");
      await page.addStyleTag({ content: "html { font-size: 20px !important; }" });
      const state = await headerState(page);
      expect(state).toMatchObject({ logoWhole: true, linksInside: true, howToTextVisible: true, noPageScroll: true });
      expect(state.headerHeight).toBeGreaterThan(60); // wrapped
    });
  }
});
