// "Přidat na plochu": web app manifest with the crown icons, iPhone meta tags.
import { expect, test } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "Static files – one project is enough.");

test("manifest: název, celá obrazovka, barvy hry a ikony s korunou", async ({ request, page }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.short_name).toBe("Český král");
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.theme_color).toBe("#14213d");
  const icons: { src: string; sizes: string; purpose: string }[] = manifest.icons;
  expect(icons.map((icon) => `${icon.sizes} ${icon.purpose}`)).toEqual(["192x192 any", "512x512 any", "512x512 maskable"]);
  for (const icon of icons) {
    const file = await request.get(icon.src);
    expect(file.ok(), icon.src).toBe(true);
    expect(file.headers()["content-type"]).toBe("image/png");
  }

  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute("content", "yes");
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute("content", "Český král");
});
