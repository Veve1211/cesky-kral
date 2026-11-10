// Server-scored Rychlovka, "Kdo vládl dřív?" and "Řeka času": weekly and
// all-time leaderboards, personal record, forged scores refused.
import { randomBytes } from "node:crypto";

import { expect, type APIRequestContext, type Page, test } from "@playwright/test";

import { isChronological } from "../src/lib/games";
import { dismissAllCelebrations, open, playRound, waitForHydration } from "./helpers/game";
import { getKing } from "./helpers/seed-answers";

const reignFrom = (slug: string) => getKing(slug).reignFrom!;
const nickname = (prefix: string) => `${prefix} ${randomBytes(4).toString("hex")}`.slice(0, 16);

async function newPlayer(request: APIRequestContext, name?: string) {
  const { token } = (await (await request.post("/api/player", { data: {} })).json()) as { token: string };
  if (name) await request.post("/api/player/nickname", { data: { token, nickname: name } });
  return token;
}

async function start(request: APIRequestContext, token: string, mode: string) {
  const body = (await (await request.post("/api/game/start", { data: { token, mode } })).json()) as {
    ok: boolean;
    game: { sessionId: string; slugs: string[]; questions: { id: number }[] };
  };
  expect(body.ok).toBe(true);
  return body.game;
}

async function answer(request: APIRequestContext, data: object) {
  const response = await request.post("/api/game/answer", { data });
  return { status: response.status(), body: (await response.json()) as Record<string, unknown> & { result?: Record<string, unknown> } };
}

async function board(request: APIRequestContext, mode: string, period: "week" | "all") {
  const body = (await (await request.get(`/api/game/leaderboard?mode=${mode}&period=${period}`)).json()) as {
    entries: { nickname: string; score: number }[];
  };
  return body.entries;
}

test("pořadí v Řece času se kontroluje podle začátku vlády (shoda roků platí obojí)", () => {
  const reigns = [
    { slug: "a", from: 1000, to: null },
    { slug: "b", from: 1200, to: null },
    { slug: "c", from: 1200, to: null },
  ];
  expect(isChronological(["a", "b", "c"], reigns)).toBe(true);
  expect(isChronological(["a", "c", "b"], reigns)).toBe(true);
  expect(isChronological(["b", "a", "c"], reigns)).toBe(false);
  expect(isChronological(["a", "x", "c"], reigns)).toBe(false);
});

test.describe("API", () => {
  test.skip(({ isMobile }) => isMobile, "Server rules – one project is enough.");

  test("Kdo vládl dřív?: série počítá jen server, podvržené skóre se ignoruje", async ({ request }) => {
    const name = nickname("Dvojice");
    const token = await newPlayer(request, name);
    const game = await start(request, token, "who-first");
    expect(game.slugs).toHaveLength(2);
    const base = { token, mode: "who-first", sessionId: game.sessionId };

    // A ruler that was not offered is refused.
    const outsider = ["karel-iv", "rudolf-ii", "josef-ii"].find((slug) => !game.slugs.includes(slug))!;
    expect((await answer(request, { ...base, choice: outsider })).status).toBe(409);

    // Three right picks, each with a forged score – the server counts its own.
    let pair = game.slugs;
    for (let i = 0; i < 3; i++) {
      const earlier = reignFrom(pair[0]) <= reignFrom(pair[1]) ? pair[0] : pair[1];
      const { body } = await answer(request, { ...base, choice: earlier, score: 999, streak: 999, correct: true });
      expect(body.result).toMatchObject({ correct: true });
      pair = body.result!.next as string[];
      expect(pair).toHaveLength(2);
    }
    // A wrong pick ends the game (unless both started the same year – then pick again).
    const later = reignFrom(pair[0]) > reignFrom(pair[1]) ? pair[0] : pair[1];
    const end = await answer(request, { ...base, choice: later });
    expect(end.body.result).toMatchObject({ correct: false, next: null, finish: { score: 3, newRecord: true } });
    // Nothing more after the end, not even a replay.
    expect((await answer(request, { ...base, choice: later })).status).toBe(409);

    for (const period of ["week", "all"] as const) {
      const entries = await board(request, "who-first", period);
      // In a long-lived local test database the top ten may already be full of
      // equal or better (earlier) results – then the board is simply full.
      if (!entries.some((entry) => entry.nickname === name)) {
        expect(entries).toHaveLength(10);
        expect(entries.at(-1)!.score).toBeGreaterThanOrEqual(3);
      } else {
        expect(entries).toContainEqual(expect.objectContaining({ nickname: name, score: 3 }));
      }
    }
    // Another session of someone else can't be used.
    const stranger = await newPlayer(request);
    expect((await answer(request, { ...base, token: stranger, choice: pair[0] })).status).toBe(409);
  });

  test("Řeka času: jen nabídnutí panovníci, každý jednou; správné pořadí = +1", async ({ request }) => {
    const token = await newPlayer(request);
    const game = await start(request, token, "timeline");
    expect(game.slugs).toHaveLength(4);
    const base = { token, mode: "timeline", sessionId: game.sessionId };
    const sorted = [...game.slugs].sort((a, b) => reignFrom(a) - reignFrom(b));
    for (const bad of [sorted.slice(0, 3), [...sorted.slice(0, 3), sorted[0]], [...sorted.slice(0, 3), "libuse"], "x", null]) {
      expect((await answer(request, { ...base, order: bad })).status, JSON.stringify(bad)).toBe(409);
    }
    const right = await answer(request, { ...base, order: sorted, score: 50 });
    expect(right.body.result).toMatchObject({ correct: true });
    const next = right.body.result!.next as string[];
    const wrong = [...next].sort((a, b) => reignFrom(b) - reignFrom(a));
    const end = await answer(request, { ...base, order: wrong });
    expect(end.body.result).toMatchObject({ correct: false, finish: { score: 1 } });
    // The years come only now, in the right order.
    const reigns = end.body.result!.reigns as { slug: string; from: number }[];
    expect(reigns.map((r) => r.from)).toEqual([...reigns.map((r) => r.from)].sort((a, b) => a - b));
  });

  test("Rychlovka: otázky jen ze sezení a v pořadí, neznámá hra a cizí relace neprojdou", async ({ request }) => {
    const token = await newPlayer(request);
    const game = await start(request, token, "quick");
    expect(game.questions).toHaveLength(10);
    const base = { token, mode: "quick", sessionId: game.sessionId };
    // Skipping to the second question is refused.
    expect((await answer(request, { ...base, questionId: game.questions[1].id, answerId: 1 })).status).toBe(409);
    expect((await answer(request, { ...base, sessionId: "x".repeat(22), questionId: game.questions[0].id, answerId: 1 })).status).toBe(409);
    expect((await request.post("/api/game/start", { data: { token, mode: "chess" } })).status()).toBe(400);
    expect((await request.get("/api/game/leaderboard?mode=chess")).status()).toBe(400);
  });
});

/**
 * The player is on the board – unless the (long-lived local) test database
 * already has ten better or equal earlier results; then the board is full.
 */
async function expectOnBoard(page: Page, testId: string, name: string) {
  const board = page.getByTestId(testId);
  await expect(board).toBeVisible();
  await expect.poll(async () => {
    const text = (await board.textContent()) ?? "";
    return text.includes(name) || (await board.getByTestId("board-row").count()) === 10;
  }).toBe(true);
}

async function setNicknameInFinish(page: Page, name: string) {
  const finish = page.getByTestId("game-finish");
  await finish.getByLabel("Zapiš se do žebříčku – stačí přezdívka").fill(name);
  await finish.getByRole("button", { name: "Uložit" }).click();
  // Saved: the form is gone (the player has a nickname now).
  await expect(finish.getByLabel("Zapiš se do žebříčku – stačí přezdívka")).toHaveCount(0);
}

test("Rychlovka: osobní rekord, nový rekord a týdenní žebříček", async ({ page }) => {
  await open(page, "/rychlovka");
  await playRound(page, Array(10).fill(true));
  await dismissAllCelebrations(page);
  const finish = page.getByTestId("game-finish");
  await expect(finish).toContainText("Nový osobní rekord!");
  await expect(finish.getByTestId("personal-best")).toContainText(/Osobní rekord: 10 z 10 za/);
  const name = nickname("Blesk");
  await setNicknameInFinish(page, name);
  await expectOnBoard(page, "board-quick-week", name);
  // Switch to all time.
  await finish.getByRole("button", { name: "Celkově" }).click();
  await expect(finish.getByRole("button", { name: "Celkově" })).toHaveAttribute("aria-pressed", "true");
  await expect(finish.getByTestId("board-quick-all")).toBeVisible();

  // The next game shows the record before it starts; a worse game is no new record.
  await page.getByRole("button", { name: "Hrát znovu" }).click();
  await expect(page.getByTestId("quick-best")).toContainText("Tvůj osobní rekord: 10 z 10");
  await playRound(page, [false, ...Array(9).fill(true)]);
  await dismissAllCelebrations(page);
  await expect(page.getByTestId("game-finish")).not.toContainText("Nový osobní rekord!");
  await expect(page.getByTestId("personal-best")).toContainText("10 z 10");
});

test("Řeka času: seřadit, správné kolo, chyba = konec, zápis do žebříčku", async ({ page }) => {
  await open(page, "/reka-casu");
  const cards = page.getByRole("main").getByRole("listitem").getByRole("button");
  await expect(cards).toHaveCount(4);
  await waitForHydration(cards.first());

  async function shown() {
    return Promise.all(
      [0, 1, 2, 3].map(async (i) => {
        const name = (await cards.nth(i).locator(".font-heading").textContent()) ?? "";
        const slug = (await import("./helpers/seed-answers")).kingByName(name).slug;
        return { index: i, slug };
      }),
    );
  }

  // Round 1: the right order.
  const first = (await shown()).sort((a, b) => reignFrom(a.slug) - reignFrom(b.slug));
  // Tap, undo the last tap, tap again – numbers follow.
  await cards.nth(first[0].index).click();
  await cards.nth(first[1].index).click();
  await cards.nth(first[1].index).click();
  await expect(page.getByTestId("timeline-number")).toHaveCount(1);
  for (const item of first.slice(1)) await cards.nth(item.index).click();
  await expect(page.getByTestId("timeline-number")).toHaveCount(4);
  await page.getByRole("button", { name: "Ověřit pořadí" }).click();
  await expect(page.getByText("Správně! 🌊 1")).toBeVisible();
  await expect(page.getByTestId("timeline-score")).toHaveText("1");

  // Round 2 comes by itself; put it in the reverse order.
  await expect(page.getByRole("button", { name: "Ověřit pořadí" })).toBeVisible({ timeout: 5000 });
  const second = (await shown()).sort((a, b) => reignFrom(b.slug) - reignFrom(a.slug));
  for (const item of second) await cards.nth(item.index).click();
  await page.getByRole("button", { name: "Ověřit pořadí" }).click();
  await expect(page.getByText("Vedle! Konec hry.")).toBeVisible();
  // Years are shown now.
  await expect(cards.first()).toContainText(/\d{3,4}/);

  const name = nickname("Proud");
  await setNicknameInFinish(page, name);
  await expectOnBoard(page, "board-timeline-week", name);
  await expect(page.getByRole("complementary", { name: "Podpora hry" })).toBeVisible();
});

test("Žebříčky: stránka se všemi hrami, odkaz v hlavičce", async ({ page }) => {
  await open(page, "/");
  await page.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("link", { name: "Žebříček" }).click();
  await expect(page).toHaveURL("/zebricky");
  await expect(page.getByRole("heading", { level: 1, name: "Žebříčky" })).toBeVisible();
  for (const name of ["Kdo vládl dřív?", "Řeka času", "Rychlovka"]) {
    await expect(page.getByRole("region", { name })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Denní výzva" })).toBeVisible();
});
