// "Denní výzva": same questions for everybody, once a day, streak and sharing.
import { expect, type Page, test } from "@playwright/test";

import {
  DAILY_QUESTIONS,
  dailyDateKey,
  dailyShareText,
  formatCountdown,
  formatDailyDate,
  formatStreakDays,
  msUntilNextDaily,
  pickDailyQuestions,
  shiftDateKey,
} from "../src/lib/daily";
import { answer, currentQuestion, open, progress } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

const DAILY_KEY = "cesky-kral:daily";

// --- pure logic --------------------------------------------------------------

const pool = kings.flatMap((king) =>
  king.questions.map((q) => ({ kingSlug: king.slug, text: q.text, difficulty: q.difficulty as 1 | 2 | 3 })),
);

test.describe("logika výzvy", () => {
  test("den podle českého času, mění se o půlnoci (zimní i letní čas)", () => {
    // November: CET = UTC+1.
    expect(dailyDateKey(new Date("2026-11-08T22:59:59Z"))).toBe("2026-11-08");
    expect(dailyDateKey(new Date("2026-11-08T23:00:00Z"))).toBe("2026-11-09");
    // July: CEST = UTC+2.
    expect(dailyDateKey(new Date("2026-07-01T21:59:59Z"))).toBe("2026-07-01");
    expect(dailyDateKey(new Date("2026-07-01T22:00:00Z"))).toBe("2026-07-02");
    expect(msUntilNextDaily(new Date("2026-11-08T22:00:00Z"))).toBe(60 * 60 * 1000);
    expect(msUntilNextDaily(new Date("2026-07-01T21:59:59Z"))).toBe(1000);
    expect(formatCountdown(3_723_000)).toBe("01:02:03");
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(formatDailyDate("2026-11-08")).toBe("8. 11.");
  });

  test("výběr otázek: stejný pro stejný den, 2 lehké, 2 střední, 1 těžká, každá od jiného panovníka", () => {
    const today = pickDailyQuestions("2026-11-08", pool);
    expect(pickDailyQuestions("2026-11-08", [...pool].reverse())).toEqual(today);
    expect(today.map((q) => q.difficulty)).toEqual([1, 1, 2, 2, 3]);
    expect(new Set(today.map((q) => q.kingSlug)).size).toBe(DAILY_QUESTIONS);

    // Different days give different sets (checked over a month).
    const sets = new Set(
      Array.from({ length: 30 }, (_, i) =>
        pickDailyQuestions(shiftDateKey("2026-11-01", i), pool).map((q) => q.text).join("|"),
      ),
    );
    expect(sets.size).toBe(30);
  });

  test("text ke sdílení", () => {
    expect(dailyShareText("2026-11-08", [true, true, true, true, false], 1)).toBe(
      "Český král – výzva 8. 11. 4/5 👑👑👑👑⚔️",
    );
    expect(dailyShareText("2026-11-08", [true, false, true, true, true], 3)).toBe(
      "Český král – výzva 8. 11. 4/5 👑⚔️👑👑👑 🔥 3 dny",
    );
    expect([1, 2, 4, 5].map(formatStreakDays)).toEqual(["1 den", "2 dny", "4 dny", "5 dní"]);
  });
});

// --- in the browser ----------------------------------------------------------

async function setDaily(page: Page, value: unknown) {
  if (page.url() === "about:blank") await page.goto("/zdroje");
  await page.evaluate(
    ([key, raw]) => window.localStorage.setItem(key, raw),
    [DAILY_KEY, typeof value === "string" ? value : JSON.stringify(value)],
  );
}

/** Answers the remaining questions by `plan` (index = question number - 1). */
async function play(page: Page, plan: boolean[], from = 1) {
  const asked: string[] = [];
  for (let n = from; n <= plan.length; n++) {
    asked.push((await answer(page, n, plan.length, plan[n - 1])).text);
  }
  return asked;
}

/** Share sheet stub: remembers what was shared. */
async function stubShare(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: { text: string }) => {
        (window as unknown as { shared: string }).shared = data.text;
      },
    });
  });
}

test("na úvodní stránce je výzva malým odkazem hned pod hlavním tlačítkem", async ({ page }) => {
  await open(page, "/");
  const link = page.getByRole("link", { name: /Denní výzva/ });
  await expect(link).toBeVisible();
  // Above the first section of the page content (Řeka času).
  const linkBox = await link.boundingBox();
  const riverBox = await page.getByRole("region", { name: "Řeka času", exact: true }).boundingBox();
  expect(linkBox!.y).toBeLessThan(riverBox!.y);
  await link.click();
  await expect(page).toHaveURL(/\/vyzva$/);
  await expect(page.getByRole("heading", { level: 1, name: "Denní výzva" })).toBeVisible();
});

test("všichni dostanou stejné otázky – ty dnešní podle data", async ({ page, browser }) => {
  const expected = pickDailyQuestions(dailyDateKey(), pool).map((q) => q.text);

  await open(page, "/vyzva");
  await expect(progress(page, 1, DAILY_QUESTIONS)).toBeVisible();
  expect((await currentQuestion(page)).text).toBe(expected[0]);

  // Another player (fresh browser, no shared storage) sees the same first question.
  const other = await browser.newPage();
  await open(other, "/vyzva");
  expect((await currentQuestion(other)).text).toBe(expected[0]);
  await other.close();

  // …and the whole set matches.
  expect(await play(page, [true, true, true, true, true])).toEqual(expected);
});

test("dohraná výzva: výsledek, odpočet, sdílení a znovu se hrát nedá", async ({ page }) => {
  await stubShare(page);
  await open(page, "/vyzva");
  await expect(page.getByText("Rytířský slib")).toBeVisible();
  await play(page, [true, true, false, true, true]);

  const date = formatDailyDate(dailyDateKey());
  const heading = page.getByRole("heading", { name: `Výzva ${date} splněna` });
  await expect(heading).toBeFocused();
  await expect(page.locator("#daily-result-score")).toHaveText("4 z 5");
  const marks = page.getByRole("list", { name: "Tvoje odpovědi" }).getByRole("listitem");
  await expect(marks).toHaveCount(5);
  await expect(marks.nth(2)).toContainText("3. otázka špatně");
  await expect(page.getByText("Série: 1 den v řadě")).toBeVisible();
  await expect(page.getByText(/^Další výzva za \d{2}:\d{2}:\d{2}$/)).toBeVisible();

  await page.getByRole("button", { name: "Sdílet" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Díky za sdílení" })).toBeVisible();
  const shared = await page.evaluate(() => (window as unknown as { shared: string }).shared);
  expect(shared).toBe(`Český král – výzva ${date} 4/5 👑👑⚔️👑👑\n${new URL(page.url()).origin}/vyzva`);

  // Reload: straight to the result, no second attempt.
  await open(page, "/vyzva");
  await expect(page.getByRole("heading", { name: `Výzva ${date} splněna` })).toBeVisible();
  await expect(page.locator("#daily-result-score")).toHaveText("4 z 5");
  await expect(progress(page, 1, DAILY_QUESTIONS)).toHaveCount(0);

  // The home page button knows too.
  await open(page, "/");
  await expect(page.getByText("Dnes splněno: 4 z 5 · 🔥 1 den")).toBeVisible();
  await expect(page.getByRole("link", { name: /Denní výzva/ })).toContainText("Zobrazit výsledek");
});

test("bez systémového sdílení se text zkopíruje do schránky", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    });
  });
  await open(page, "/vyzva");
  await play(page, [true, true, true, true, true]);
  await page.getByRole("button", { name: "Sdílet" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Zkopírováno do schránky" })).toBeVisible();
  const copied = await page.evaluate(() => (window as unknown as { copied: string }).copied);
  expect(copied).toContain(`výzva ${formatDailyDate(dailyDateKey())} 5/5 👑👑👑👑👑`);
});

test("rozehraná výzva po obnovení pokračuje, odpovědi nejdou zopakovat", async ({ page }) => {
  await open(page, "/vyzva");
  await answer(page, 1, 5, true);
  await answer(page, 2, 5, false);
  await open(page, "/vyzva");
  await expect(page.getByText("Pokračuješ v rozehrané výzvě")).toBeVisible();
  await expect(progress(page, 3, DAILY_QUESTIONS)).toBeVisible();
  await expect(page.getByText(/^Správně:\s*1$/)).toBeVisible();

  await answer(page, 3, 5, true);
  await answer(page, 4, 5, true);
  await answer(page, 5, 5, false);
  await expect(page.locator("#daily-result-score")).toHaveText("3 z 5");
});

test("série dní: včera dohraná výzva se dnes prodlouží, starší série začne znovu", async ({ page }) => {
  await stubShare(page);
  const today = dailyDateKey();
  const yesterday = shiftDateKey(today, -1);
  await setDaily(page, { version: 1, date: yesterday, marks: [true, true, true, true, true], streak: 2, lastCompleted: yesterday });

  await open(page, "/");
  await expect(page.getByText("Udrž sérii: 🔥 2 dny")).toBeVisible();

  await open(page, "/vyzva");
  await play(page, [true, true, true, true, true]);
  await expect(page.getByText("Série: 3 dny v řadě")).toBeVisible();
  await page.getByRole("button", { name: "Sdílet" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { shared?: string }).shared))
    .toContain("5/5 👑👑👑👑👑 🔥 3 dny");
});

test("přerušená série se počítá od jedné", async ({ page }) => {
  const old = shiftDateKey(dailyDateKey(), -3);
  await setDaily(page, { version: 1, date: old, marks: [true, true, true, true, true], streak: 7, lastCompleted: old });
  await open(page, "/");
  await expect(page.getByText("Udrž sérii")).toHaveCount(0);
  await open(page, "/vyzva");
  await play(page, [true, true, true, true, true]);
  await expect(page.getByText("Série: 1 den v řadě")).toBeVisible();
});

test("poškozená data výzvy stránku neshodí", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const raw of [
    "{nope",
    "null",
    JSON.stringify({ version: 1, date: "2026-13-45", marks: "x", streak: -1, lastCompleted: "<script>" }),
    JSON.stringify({ version: 1, date: dailyDateKey(), marks: [true, "x"], streak: 1e12, lastCompleted: null }),
  ]) {
    await setDaily(page, raw);
    await open(page, "/vyzva");
    await expect(progress(page, 1, DAILY_QUESTIONS)).toBeVisible();
    await open(page, "/");
    await expect(page.getByRole("link", { name: /Denní výzva/ })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("stránka výzvy neposílá do prohlížeče, která odpověď je správná", async ({ request }) => {
  const html = await (await request.get("/vyzva")).text();
  expect(html).not.toContain("isCorrect");
  expect(html).not.toContain("explanation");
});
