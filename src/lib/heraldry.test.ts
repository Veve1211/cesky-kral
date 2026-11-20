import { describe, expect, it } from "vitest";

import {
  DEFAULT_CREST,
  MOTTO_MAX,
  contrasts,
  crestFromQuery,
  crestToQuery,
  parseCrest,
  type CrestDesign,
} from "@/lib/heraldry";

describe("rule of tincture", () => {
  it("allows metal on colour and forbids metal on metal or colour on colour", () => {
    expect(contrasts("or", "gules")).toBe(true); // gold on red
    expect(contrasts("or", "argent")).toBe(false); // gold on silver
    expect(contrasts("azure", "gules")).toBe(false); // blue on red
  });

  it("lets furs sit next to anything except themselves", () => {
    expect(contrasts("ermine", "or")).toBe(true);
    expect(contrasts("ermine", "azure")).toBe(true);
    expect(contrasts("ermine", "ermine")).toBe(false);
  });
});

describe("saving a crest", () => {
  it("accepts the default crest", () => {
    expect(parseCrest(DEFAULT_CREST)).toEqual(DEFAULT_CREST);
  });

  it("rejects anything that is not a valid design", () => {
    expect(parseCrest(null)).toBeNull();
    expect(parseCrest([])).toBeNull();
    expect(parseCrest("crest")).toBeNull();
    expect(parseCrest({ ...DEFAULT_CREST, shape: "triangle" })).toBeNull();
    expect(parseCrest({ ...DEFAULT_CREST, charge: "<script>" })).toBeNull();
    expect(parseCrest({ ...DEFAULT_CREST, motto: 42 })).toBeNull();
    expect(parseCrest({ ...DEFAULT_CREST, motto: "x".repeat(MOTTO_MAX * 4 + 1) })).toBeNull();
  });

  it("normalises spaces in the motto", () => {
    expect(parseCrest({ ...DEFAULT_CREST, motto: "  Pravda   vítězí " })?.motto).toBe("Pravda vítězí");
  });
});

describe("sharing a crest in a link", () => {
  it("survives the round trip through the URL", () => {
    const design: CrestDesign = { ...DEFAULT_CREST, motto: "Pravda vítězí" };
    const params = Object.fromEntries(new URLSearchParams(crestToQuery(design)));
    expect(crestFromQuery(params)).toEqual(design);
  });

  it("returns null for a broken link", () => {
    expect(crestFromQuery({})).toBeNull();
    expect(crestFromQuery({ s: "heater", d: "plain", t: "or", c: "none" })).toBeNull();
  });
});
