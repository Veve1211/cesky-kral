import { afterEach, describe, expect, it, vi } from "vitest";

import { jsonLdString, SITE_NAME, websiteJsonLd } from "./structured-data";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("structured data", () => {
  it("WebSite uses the site URL and name", () => {
    vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "cesky-kral.up.railway.app");
    const data = websiteJsonLd();
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe(SITE_NAME);
    expect(data.url).toBe("https://cesky-kral.up.railway.app/");
  });

  it("escapes < so the script tag cannot be closed", () => {
    const out = jsonLdString({ text: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).text).toBe("</script><script>alert(1)</script>");
  });
});
