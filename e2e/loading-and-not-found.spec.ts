import { expect, test } from "@playwright/test";

import { currentQuestion, waitForHydration } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

for (const suffix of ["", "/zlate-kolo"]) {
  for (const slug of ["neznamy-panovnik", "NEPLATNY-SLUG"]) {
    test(`HTTP 404: /kral/${slug}${suffix}`, async ({ page, request }) => {
      const path = `/kral/${slug}${suffix}`;
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "Tuhle stránku kronika nezná", exact: true })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      expect(new URL(page.url()).pathname).toBe(path);

      const head = await request.head(path);
      expect(head.status()).toBe(404);
      expect((await head.body()).length).toBe(0);

      await page.getByRole("link", { name: "Zpět do galerie", exact: true }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Erbovní kniha českých panovníků");
    });
  }
}

test("všichni panovníci (18) i jejich zlatá kola vracejí HTTP 200", async ({ request }) => {
  for (const king of kings) {
    for (const suffix of ["", "/zlate-kolo"]) {
      const response = await request.get(`/kral/${king.slug}${suffix}`);
      expect(response.status(), `${king.slug}${suffix}`).toBe(200);
      expect(await response.text()).toContain(king.name);
    }
  }
});

for (const path of ["/", "/sbirka", "/kral/rudolf-ii"]) {
  test(`pozdní načtení písem neposune hotovou stránku (${path})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    let releaseFonts!: () => void;
    const fontGate = new Promise<void>((resolve) => { releaseFonts = resolve; });
    let fontRequests = 0;
    await page.route(/\.(woff2?|ttf)(\?|$)/, async (route) => {
      fontRequests++;
      await fontGate;
      await route.continue();
    });

    try {
      // The load event waits for fonts; inspect the page while they are pending.
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await waitForHydration(page.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("link").first());
      if (path.startsWith("/kral/")) await currentQuestion(page);
      else await expect(page.getByRole("heading", { name: "Řeka času", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      // Keep font downloads pending beyond the browser's short font block period.
      await page.waitForTimeout(300);
      expect(fontRequests).toBeGreaterThan(0);
      const measure = () => page.evaluate(() => {
        const targets = [document.querySelector("main h1"), document.querySelector("main"), document.querySelector('nav[aria-label="Hlavní navigace"]')];
        return targets.map((target) => {
          const { x, y, width, height } = target!.getBoundingClientRect();
          return { x, y, width, height };
        });
      });
      const before = await measure();
      releaseFonts();
      await page.waitForLoadState("networkidle");
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      const after = await measure();
      for (let i = 0; i < before.length; i++) {
        for (const dimension of ["x", "y", "width", "height"] as const) {
          expect(Math.abs(after[i][dimension] - before[i][dimension]), `target ${i}, ${dimension}`).toBeLessThanOrEqual(1);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
    } finally {
      releaseFonts();
    }
  });
}
