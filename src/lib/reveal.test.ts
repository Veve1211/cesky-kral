import { describe, expect, it } from "vitest";

import { REVEAL_ALL_AT, REVEAL_DAILY_AT, REVEAL_SCRIPT, revealLevel } from "@/lib/reveal";

describe("progressive reveal of game modes", () => {
  it("new player: only the main game; first card: daily + crest; three cards: everything", () => {
    expect(revealLevel(0, false)).toBe(0);
    expect(revealLevel(REVEAL_DAILY_AT, false)).toBe(1);
    expect(revealLevel(REVEAL_ALL_AT - 1, false)).toBe(1);
    expect(revealLevel(REVEAL_ALL_AT, false)).toBe(2);
    expect(revealLevel(18, false)).toBe(2);
  });

  it("a player who already used a later mode keeps everything", () => {
    expect(revealLevel(0, true)).toBe(2);
  });

  it("the inline script follows the same rule", () => {
    const run = (store: Record<string, string>) => {
      const attributes: Record<string, string> = {};
      const window = { localStorage: { getItem: (key: string) => store[key] ?? null } };
      const document = { documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) } };
      new Function("window", "document", REVEAL_SCRIPT)(window, document);
      return attributes["data-reveal"];
    };
    const cards = (n: number) => JSON.stringify({ version: 2, kings: Array.from({ length: n }, (_, i) => `k${i}`), golden: [] });
    expect(run({})).toBe("0");
    expect(run({ "cesky-kral:collection": cards(1) })).toBe("1");
    expect(run({ "cesky-kral:collection": cards(3) })).toBe("2");
    expect(run({ "cesky-kral:daily": "{}" })).toBe("2");
    expect(run({ "cesky-kral:collection": "{broken" })).toBeUndefined();
  });
});
