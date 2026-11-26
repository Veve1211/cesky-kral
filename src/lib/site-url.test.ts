import { afterEach, describe, expect, it, vi } from "vitest";

import { isIndexable, PRODUCTION_DOMAIN, siteUrl } from "./site-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl / isIndexable", () => {
  it("live site on Railway is indexable", () => {
    vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", PRODUCTION_DOMAIN);
    expect(siteUrl().href).toBe(`https://${PRODUCTION_DOMAIN}/`);
    expect(isIndexable()).toBe(true);
  });

  it("staging is not indexable", () => {
    vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "cesky-kral-staging.up.railway.app");
    expect(isIndexable()).toBe(false);
  });

  it("a malformed domain is ignored", () => {
    vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "evil.example/<script>");
    vi.stubEnv("NODE_ENV", "development");
    expect(siteUrl().href).toBe("http://localhost:3000/");
    expect(isIndexable()).toBe(false);
  });

  it("local development is not indexable", () => {
    vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(isIndexable()).toBe(false);
  });
});
