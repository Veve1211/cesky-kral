import { describe, expect, it } from "vitest";

import { nextStep } from "@/lib/next-step";
import { pickPair, type WhoFirstPair } from "@/lib/who-first";

const kings = [
  { slug: "libuse", name: "Libuše" },
  { slug: "svaty-vaclav", name: "Svatý Václav" },
  { slug: "karel-iv", name: "Karel IV." },
];

describe("main home button", () => {
  it("starts with the first ruler for a new player", () => {
    expect(nextStep(kings, [], [])).toMatchObject({ kind: "start", href: "/kral/libuse" });
  });

  it("continues with the first ruler not collected yet", () => {
    expect(nextStep(kings, ["libuse", "karel-iv"], [])).toMatchObject({ href: "/kral/svaty-vaclav" });
  });

  it("offers the golden round once everything is collected", () => {
    const all = kings.map((k) => k.slug);
    expect(nextStep(kings, all, ["libuse"])).toMatchObject({ href: "/kral/svaty-vaclav/zlate-kolo" });
  });

  it("ends in Rychlovka when everything is golden, and handles no rulers", () => {
    const all = kings.map((k) => k.slug);
    expect(nextStep(kings, all, all)).toMatchObject({ href: "/rychlovka" });
    expect(nextStep([], [], [])).toBeNull();
  });
});

describe("Kdo vládl dřív? pairs", () => {
  it("needs at least two rulers", () => {
    expect(pickPair(0)).toBeNull();
    expect(pickPair(1)).toBeNull();
  });

  it("swaps the sides when there are only two rulers", () => {
    expect(pickPair(2)).toEqual([0, 1]);
    expect(pickPair(2, [0, 1])).toEqual([1, 0]);
  });

  it("always picks two different rulers and never repeats the last pair", () => {
    let previous: WhoFirstPair | null = null;
    for (let i = 0; i < 500; i++) {
      const pair: WhoFirstPair | null = pickPair(5, previous);
      expect(pair).not.toBeNull();
      const [a, b] = pair!;
      expect(a).not.toBe(b);
      expect(a >= 0 && a < 5 && b >= 0 && b < 5).toBe(true);
      if (previous) expect(new Set([a, b])).not.toEqual(new Set(previous));
      previous = pair;
    }
  });
});
