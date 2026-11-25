import { describe, expect, it } from "vitest";

import { REVEAL_SCRIPT, UNLOCK_AT, revealLevel } from "@/lib/reveal";

describe("locked game modes for new players", () => {
  it("new player: locked; the first card unlocks everything", () => {
    expect(revealLevel(0, false)).toBe(0);
    expect(revealLevel(UNLOCK_AT, false)).toBe(1);
    expect(revealLevel(18, false)).toBe(1);
  });

  it("a player who already used a later mode keeps everything open", () => {
    expect(revealLevel(0, true)).toBe(1);
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
    expect(run({ "cesky-kral:daily": "{}" })).toBe("1");
    expect(run({ "cesky-kral:collection": "{broken" })).toBeUndefined();
  });
});
