import { expect, test } from "@playwright/test";

import { kings } from "./helpers/seed-answers";

/**
 * Every ruler's page has its own sharing preview (Open Graph + Twitter):
 * title and description with the ruler's name and a 1200×630 PNG image.
 * The years of reign stay out of the preview ("Kdo vládl dřív?").
 */
test("náhled pro sdílení: vlastní titulek, popis a obrázek u všech 18 panovníků", async ({ page, request }) => {
  expect(kings).toHaveLength(18);
  for (const king of kings) {
    const response = await request.get(`/kral/${king.slug}`);
    expect(response.status()).toBe(200);
    await page.setContent(await response.text());
    const meta = (property: string) =>
      page.locator(`meta[property="${property}"], meta[name="${property}"]`).first().getAttribute("content");

    expect(await meta("og:title")).toBe(`${king.name} – hra o kartu`);
    expect(await meta("og:description")).toContain(king.name);
    // No short bio: it would give away answers of the round.
    expect(await meta("og:description")).not.toContain(king.shortBio);
    expect(await meta("og:description")).toContain("Pět otázek");
    expect(await meta("twitter:card")).toBe("summary_large_image");
    expect(await meta("twitter:title")).toBe(`${king.name} – hra o kartu`);
    expect(await meta("og:url")).toMatch(new RegExp(`/kral/${king.slug}$`));

    const imageUrl = await meta("og:image");
    expect(imageUrl).toContain(`/kral/${king.slug}/opengraph-image`);
    expect(await meta("og:image:width")).toBe("1200");
    expect(await meta("og:image:height")).toBe("630");
    const image = await request.get(new URL(imageUrl!).pathname + new URL(imageUrl!).search);
    expect(image.status(), king.slug).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");
    expect((await image.body()).length).toBeGreaterThan(20_000);
  }
});

test("náhled pro sdílení: obrázek panovníka se vykreslí", async ({ page, request }) => {
  const response = await request.get("/kral/karel-iv");
  await page.setContent(await response.text());
  const imageUrl = await page.locator('meta[property="og:image"]').getAttribute("content");
  const path = new URL(imageUrl!).pathname + new URL(imageUrl!).search;
  await page.goto(path);
  const size = await page.locator("img").evaluate((img: HTMLImageElement) => ({ w: img.naturalWidth, h: img.naturalHeight }));
  expect(size).toEqual({ w: 1200, h: 630 });
});

test("sociální sítě dostanou popis přímo v hlavičce stránky", async ({ request }) => {
  // Link previews (Facebook, X, Slack…) read only the <head>; Next.js sends
  // them the metadata there. Browsers get it streamed with the page.
  for (const agent of ["facebookexternalhit/1.1", "Twitterbot/1.0", "Slackbot-LinkExpanding 1.0"]) {
    const html = await (await request.get("/kral/karel-iv", { headers: { "user-agent": agent } })).text();
    const head = html.split("</head>")[0];
    expect(head, agent).toContain('name="description"');
    expect(head, agent).toContain("Zahraj si o kartu: Karel IV.");
    expect(head, agent).toContain('property="og:image"');
  }
});
