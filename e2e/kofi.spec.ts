// "Hoď kronikáři groš" – hidden unless NEXT_PUBLIC_KOFI_URL holds a Ko-fi link.
import { expect, test } from "@playwright/test";

import { parseKofiUrl } from "../src/lib/kofi";
import { open } from "./helpers/game";

test("adresa Ko-fi: jen https://ko-fi.com, jinak nic", () => {
  expect(parseKofiUrl("https://ko-fi.com/kronikar")).toBe("https://ko-fi.com/kronikar");
  expect(parseKofiUrl("  https://www.ko-fi.com/kronikar  ")).toBe("https://www.ko-fi.com/kronikar");
  for (const bad of [
    undefined,
    "",
    "   ",
    "ko-fi.com/kronikar",
    "http://ko-fi.com/kronikar",
    "https://ko-fi.com.evil.example/kronikar",
    "https://evil.example/?https://ko-fi.com",
    "https://user:pass@ko-fi.com/kronikar",
    "javascript:alert(1)",
    `https://ko-fi.com/${"x".repeat(300)}`,
  ]) {
    expect(parseKofiUrl(bad)).toBeNull();
  }
});

test("bez nastavené proměnné se tlačítko vůbec nezobrazí", async ({ page }) => {
  test.skip(Boolean(process.env.NEXT_PUBLIC_KOFI_URL), "The test build runs without NEXT_PUBLIC_KOFI_URL.");
  for (const path of ["/", "/jak-hrat", "/vyzva"]) {
    await open(page, path);
    await expect(page.getByRole("link", { name: /kronikáři groš/ })).toHaveCount(0);
    await expect(page.locator('a[href*="ko-fi.com"]')).toHaveCount(0);
  }
});
