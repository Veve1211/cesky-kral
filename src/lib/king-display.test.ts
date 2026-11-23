import { describe, expect, it } from "vitest";
import { endSentence } from "./king-display";

describe("endSentence", () => {
  it("does not double the period of a regnal number", () => {
    expect(endSentence("Karel IV.")).toBe("Karel IV.");
  });

  it("adds a period after a plain name", () => {
    expect(endSentence("Libuše")).toBe("Libuše.");
  });
});
