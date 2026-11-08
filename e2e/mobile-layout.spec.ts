import { expect, test } from "@playwright/test";

import { open, setCollection } from "./helpers/game";

const PAGES = ["/", "/sbirka", "/kral/karel-iv", "/kral/libuse", "/kral/karel-iv/zlate-kolo", "/rychlovka", "/kdo-driv", "/zdroje"];

test.describe("mobil 375 px", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const withCards of [false, true]) {
    test(`žádné vodorovné posouvání stránky (${withCards ? "se sbírkou" : "prázdná sbírka"})`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "Only for the mobile project.");
      if (withCards) await setCollection(page, ["libuse", "karel-iv", "karel-i"], ["karel-iv"]);

      for (const path of PAGES) {
        await open(page, path);
        await page.waitForLoadState("networkidle");
        // <body> has overflow-x: hidden, which can hide overflow from
        // scrollWidth (and iOS Safari may still scroll), so also look for
        // any element that sticks out past the right edge of the screen.
        const overflow = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          const clips = (el: Element) => {
            const style = getComputedStyle(el);
            return style.overflowX !== "visible" || style.clip !== "auto" || style.clipPath !== "none";
          };
          const offenders: string[] = [];
          for (const el of document.body.querySelectorAll("*")) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || rect.right <= width + 1) continue;
            // Content inside its own scroll box (e.g. the timeline strip) is fine.
            let parent = el.parentElement;
            let clipped = false;
            while (parent && parent !== document.body) {
              if (clips(parent) && parent.getBoundingClientRect().right <= width + 1) {
                clipped = true;
                break;
              }
              parent = parent.parentElement;
            }
            if (!clipped) {
              offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → ${Math.round(rect.right)}px`);
            }
          }
          return {
            scrollWidth: document.documentElement.scrollWidth,
            width,
            offenders: offenders.slice(0, 5),
          };
        });
        expect(overflow.scrollWidth, `${path} is wider than the screen`).toBeLessThanOrEqual(overflow.width);
        expect(overflow.offenders, `${path}: elements past the right edge`).toEqual([]);
      }
    });
  }
});
