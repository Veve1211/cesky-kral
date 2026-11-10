// Nicknames without registration, the server-scored daily leaderboard,
// "Dnešní vládce", moving progress with a short code and rate limits.
import { randomBytes } from "node:crypto";

import { expect, type APIRequestContext, type Page, test } from "@playwright/test";

import { dailyDateKey, dailyShareText, shiftDateKey } from "../src/lib/daily";
import { formatDuration, gapText } from "../src/lib/leaderboard";
import { checkNickname, nicknameKey } from "../src/lib/nickname";
import { containsProfanity } from "../src/lib/profanity";
import { normalizeCode } from "../src/lib/transfer-code";
import { answer, open, progress, readCollection, setCollection } from "./helpers/game";

/** A nickname nobody else in this test run has (3–16 chars). */
function uniqueNickname(prefix = "Rytíř") {
  return `${prefix} ${randomBytes(4).toString("hex")}`.slice(0, 16);
}

async function newPlayer(request: APIRequestContext): Promise<string> {
  const response = await request.post("/api/player", { data: {} });
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { ok: boolean; token: string };
  expect(body.ok).toBe(true);
  expect(body.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  return body.token;
}

async function playerToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem("cesky-kral:player");
    return raw ? (JSON.parse(raw) as { token: string }).token : null;
  });
}

async function playDaily(page: Page, plan: boolean[]) {
  for (const [i, correctly] of plan.entries()) await answer(page, i + 1, plan.length, correctly);
}

test.describe("pravidla (bez prohlížeče)", () => {
  test("přezdívka: 3–16 znaků, povolené znaky, filtr sprostých slov, vyhrazená jména", () => {
    expect(checkNickname("  Karel   IV. ")).toEqual({ ok: true, nickname: "Karel IV.", key: "kareliv" });
    expect(checkNickname("Přemysl_Oráč-1")).toMatchObject({ ok: true });
    expect(nicknameKey("Václav II")).toBe(nicknameKey("vaclav-ii"));
    for (const bad of ["ab", "x".repeat(17), "", "   ", "<script>", "a/b/c", "1234", "Rytíř 🗡️", null, 42]) {
      expect(checkNickname(bad as string).ok, String(bad)).toBe(false);
    }
    for (const rude of ["kurva", "K0K0T", "k.o.k.o.t", "Kurrrrva", "Píčus", "zmrd123", "debil", "Hitler88", "kkt", "Rytíř Kkt", "FUCK", "sračka"]) {
      expect(containsProfanity(rude), rude).toBe(true);
      expect(checkNickname(rude).ok, rude).toBe(false);
    }
    // Innocent words that only look a bit alike.
    for (const fine of ["Opice", "Hitchcock", "Knight", "Fagot", "Spice", "Epicentrum", "Masaryk", "Libuše", "Grapefruit", "Přemysl"]) {
      expect(containsProfanity(fine), fine).toBe(false);
    }
    expect(checkNickname("Admin Karel").ok).toBe(false);
    expect(checkNickname("Dnešní vládce").ok).toBe(false);
  });

  test("co chybělo na lepší místo, čas, sdílení s pořadím, kód přenosu", () => {
    expect(gapText({ rank: 1, score: 5, durationMs: 30_000, above: null })).toBeNull();
    expect(gapText({ rank: 3, score: 4, durationMs: 30_000, above: { score: 5, durationMs: 50_000 } })).toBe(
      "Na 2. místo ti chyběla 1 správná odpověď.",
    );
    expect(gapText({ rank: 4, score: 2, durationMs: 30_000, above: { score: 5, durationMs: 50_000 } })).toBe(
      "Na 3. místo ti chyběly 3 správné odpovědi.",
    );
    expect(gapText({ rank: 2, score: 5, durationMs: 41_200, above: { score: 5, durationMs: 38_000 } })).toBe(
      "Na 1. místo ti chyběly 4 sekundy.",
    );
    expect(gapText({ rank: 2, score: 5, durationMs: 40_000, above: { score: 5, durationMs: 39_500 } })).toBe(
      "Na 1. místo ti chyběla 1 sekunda.",
    );
    expect(gapText({ rank: 2, score: 5, durationMs: 40_000, above: { score: 5, durationMs: 40_000 } })).toBe(
      "Na 1. místo ti chyběl jen zlomek sekundy.",
    );
    expect(formatDuration(42_400)).toBe("42 s");
    expect(formatDuration(65_000)).toBe("1 min 05 s");
    expect(dailyShareText("2026-11-08", [true, true, true, true, false], 3, { rank: 2, total: 25 })).toBe(
      "Český král – výzva 8. 11. 4/5 👑👑👑👑⚔️ 🔥 3 dny 🏆 2. místo z 25",
    );
    expect(normalizeCode("abcd-efgh")).toBe("ABCDEFGH");
    expect(normalizeCode("ABCD EFG0")).toBeNull(); // 0 is not in the alphabet
    expect(normalizeCode("ABC")).toBeNull();
  });
});

test.describe("API", () => {
  test.skip(({ isMobile }) => isMobile, "Server rules – one project is enough.");

  test("přezdívka: server odmítne sprosté, krátké i obsazené, jen anonymní token", async ({ request }) => {
    const first = await newPlayer(request);
    const second = await newPlayer(request);
    const name = uniqueNickname("Kněžna");

    for (const [nickname, message] of [
      ["kurva", "nehodí"],
      ["ab", "aspoň 3"],
      ["<b>x</b>", "Použij jen"],
    ] as const) {
      const response = await request.post("/api/player/nickname", { data: { token: first, nickname } });
      expect(response.status()).toBe(422);
      expect(await response.text()).toContain(message);
    }
    const saved = await request.post("/api/player/nickname", { data: { token: first, nickname: name } });
    expect(await saved.json()).toEqual({ ok: true, nickname: name });

    // The same name in other letters/diacritics is taken.
    const taken = await request.post("/api/player/nickname", { data: { token: second, nickname: name.toUpperCase() } });
    expect(taken.status()).toBe(422);
    expect(await taken.text()).toContain("už někdo má");

    // Unknown or malformed tokens get nothing.
    for (const token of ["x", "a".repeat(43), null, { $ne: 1 }]) {
      const response = await request.post("/api/player/nickname", { data: { token, nickname: uniqueNickname() } });
      expect(response.status()).toBe(404);
    }
    const me = await request.post("/api/player/me", { data: { token: first } });
    expect(await me.json()).toEqual({ ok: true, nickname: name });
  });

  test("rate limit: příliš mnoho nových hráčů z jedné adresy dostane 429", async ({ request }) => {
    const ip = `198.51.100.${1 + Math.floor(Math.random() * 250)}`;
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      const response = await request.post("/api/player", { data: {}, headers: { "x-forwarded-for": ip } });
      statuses.push(response.status());
    }
    expect(statuses.slice(0, 10).every((status) => status === 200)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
    // A different address is not affected.
    const other = await request.post("/api/player", { data: {}, headers: { "x-forwarded-for": "198.51.100.251, 203.0.113.9" } });
    expect(other.status()).toBe(200);
  });

  test("neplatné požadavky: špatný formát, velké tělo, cizí den", async ({ request }) => {
    const token = await newPlayer(request);
    expect((await request.post("/api/daily/start", { data: "nope", headers: { "content-type": "text/plain" } })).status()).toBe(400);
    expect((await request.post("/api/daily/start", { data: { token, pad: "x".repeat(10_000) } })).status()).toBe(400);
    const yesterday = await request.post("/api/daily/start", { data: { token, date: shiftDateKey(dailyDateKey(), -1) } });
    expect(yesterday.status()).toBe(409);
    expect(await yesterday.text()).toContain("už skončila");
    const notStarted = await request.post("/api/daily/answer", { data: { token, date: dailyDateKey(), questionId: 1, answerId: 1 } });
    expect(notStarted.status()).toBe(409);
    // There is no way to send a score at all.
    expect((await request.post("/api/daily/finish", { data: { token, score: 5 } })).status()).toBe(404);
  });
});

test("Denní výzva: podvržené skóre server nepřijme, počítá jen ověřené odpovědi", async ({ page, request }) => {
  // Every answer request gets a forged score, marks and time added – the server must ignore them.
  await page.route("**/api/daily/answer", async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
    await route.continue({
      postData: JSON.stringify({ ...body, score: 5, marks: [true, true, true, true, true], correct: true, durationMs: 1 }),
    });
  });
  await open(page, "/vyzva");
  await expect(progress(page, 1, 5)).toBeVisible();
  const token = await playerToken(page);
  expect(token).not.toBeNull();

  // Remember the first question's ids from the real request.
  let firstRequest: Record<string, unknown> | null = null;
  page.on("request", (req) => {
    if (req.url().endsWith("/api/daily/answer") && !firstRequest) firstRequest = JSON.parse(req.postData() ?? "{}");
  });
  await playDaily(page, [false, false, true, false, false]);
  await expect(page.locator("#daily-result-score")).toHaveText("1 z 5");

  // Replaying an answer, or any answer after the end, is refused.
  const replay = await request.post("/api/daily/answer", { data: firstRequest });
  expect(replay.status()).toBe(409);
  expect(await replay.text()).toContain("už máš dohranou");

  // A nickname puts the server's result (1 of 5) into the leaderboard – not 5.
  const name = uniqueNickname("Podvodník");
  await request.post("/api/player/nickname", { data: { token, nickname: name } });
  const standing = await request.post("/api/daily/standing", { data: { token, date: dailyDateKey(), score: 5 } });
  const body = (await standing.json()) as { standing: { score: number; ranked: boolean } };
  expect(body.standing).toMatchObject({ score: 1, ranked: true });

  // A second attempt today is impossible, even with a fresh start request.
  const again = await request.post("/api/daily/start", { data: { token, date: dailyDateKey() } });
  expect(await again.json()).toMatchObject({ ok: true, state: { answered: 5, finished: true } });
});

test("Denní výzva: odpovědi jen v pořadí – přeskočit ani zopakovat nejde", async ({ page, request }) => {
  await open(page, "/vyzva");
  await expect(progress(page, 1, 5)).toBeVisible();
  const token = await playerToken(page);
  let sent: Record<string, unknown> | null = null;
  page.on("request", (req) => {
    if (req.url().endsWith("/api/daily/answer")) sent = JSON.parse(req.postData() ?? "{}");
  });
  await answer(page, 1, 5, true);
  expect(sent).not.toBeNull();
  // The same question again (double click, replay) is refused.
  const twice = await request.post("/api/daily/answer", { data: sent });
  expect(twice.status()).toBe(409);
  // A made-up question id is refused.
  const other = await request.post("/api/daily/answer", { data: { ...sent!, questionId: 2_000_000_000 } });
  expect(other.status()).toBe(409);
  const start = await request.post("/api/daily/start", { data: { token, date: dailyDateKey() } });
  expect(await start.json()).toMatchObject({ state: { answered: 1, marks: [true], finished: false } });
});

test("po dohrání: pořadí, co chybělo, zápis přezdívkou, Dnešní vládce a sdílení s pořadím", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: { text: string }) => {
        (window as unknown as { shared: string }).shared = data.text;
      },
    });
  });
  await open(page, "/vyzva");
  // The rules are explained at the top, with the countdown.
  const rules = page.getByRole("list", { name: "Pravidla výzvy" });
  await expect(rules).toContainText("Všichni dnes hrají stejné otázky.");
  await expect(rules).toContainText("Jeden pokus denně");
  await expect(rules).toContainText("Nová výzva o půlnoci (český čas).");
  await expect(page.getByText(/^Nová výzva za \d{2}:\d{2}:\d{2}$/)).toBeVisible();

  await playDaily(page, [true, true, true, true, true]);
  const standing = page.getByTestId("daily-standing");
  await expect(standing).toContainText(/Patřilo by ti \d+\. z \d+/);

  // Bad nickname first, then a good one.
  const field = standing.getByLabel("Zapiš se do žebříčku – stačí přezdívka");
  await field.fill("kokot");
  await standing.getByRole("button", { name: "Uložit" }).click();
  await expect(standing.getByRole("alert")).toContainText("nehodí");
  const name = uniqueNickname();
  await field.fill(name);
  await standing.getByRole("button", { name: "Uložit" }).click();
  await expect(standing).toContainText(/Jsi Dnešní vládce!|Tvoje pořadí: \d+\. z \d+/);
  const text = (await standing.textContent()) ?? "";
  if (!text.includes("Dnešní vládce")) expect(text).toMatch(/Na \d+\. místo ti/);

  // The leaderboard shows the player; the first place is "Dnešní vládce".
  const board = page.getByRole("region", { name: "Dnešní žebříček" });
  await expect(board.getByTestId("today-ruler")).toContainText("Dnešní vládce");
  await expect(board.getByTestId("today-ruler")).toContainText("5 z 5 správně");

  await page.getByRole("button", { name: "Sdílet" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { shared?: string }).shared))
    .toMatch(/5\/5 👑👑👑👑👑 🏆 \d+\. místo z \d+/);

  // The home page shows today's ruler too.
  await open(page, "/");
  const ruler = page.getByRole("link", { name: /^Dnešní vládce: / });
  await expect(ruler).toBeVisible();
  await expect(ruler.getByTestId("today-ruler")).toContainText("Dnešní vládce");
});

test("přenos postupu kódem: sbírka i přezdívka na druhém zařízení, kód jen jednou", async ({ page, browser }) => {
  await setCollection(page, ["karel-iv", "libuse"], ["karel-iv"]);
  await open(page, "/sbirka");
  const panel = page.getByRole("region", { name: "Přezdívka a přenos postupu" });
  const name = uniqueNickname("Písař");
  await panel.getByLabel("Tvoje přezdívka do žebříčků").fill(name);
  await panel.getByRole("button", { name: "Uložit" }).click();
  await expect(panel.getByTestId("nickname-current")).toHaveText(name);
  await panel.getByRole("button", { name: "Vytvořit kód pro přenos" }).click();
  const code = (await panel.getByTestId("transfer-code").textContent())!;
  expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);

  // Another device with its own small collection.
  const other = await (await browser.newContext()).newPage();
  await setCollection(other, ["josef-ii"]);
  await open(other, "/sbirka");
  const otherPanel = other.getByRole("region", { name: "Přezdívka a přenos postupu" });
  await otherPanel.getByLabel("Mám kód z jiného zařízení").fill(code.toLowerCase());
  await otherPanel.getByRole("button", { name: "Přenést" }).click();
  await expect(otherPanel.getByRole("status")).toContainText("Hotovo!");
  const merged = await readCollection(other);
  expect(new Set(merged?.kings)).toEqual(new Set(["josef-ii", "karel-iv", "libuse"]));
  expect(merged?.golden).toEqual(["karel-iv"]);
  expect(await playerToken(other)).toBe(await playerToken(page));
  await open(other, "/sbirka");
  await expect(otherPanel.getByTestId("nickname-current")).toHaveText(name);

  // The code works only once.
  await otherPanel.getByLabel("Mám kód z jiného zařízení").fill(code);
  await otherPanel.getByRole("button", { name: "Přenést" }).click();
  await expect(otherPanel.getByRole("status")).toContainText("Kód neplatí");
  await other.context().close();
});

test("Jak hrát vysvětluje, co se ukládá", async ({ page }) => {
  await open(page, "/jak-hrat");
  const stored = page.getByRole("region", { name: "Žebříčky a přezdívka" });
  await expect(stored).toContainText("Žádná registrace, žádný e-mail ani jméno");
  await expect(stored).toContainText("jen přezdívka, skóre (a čas) a parametry erbu");
  await expect(stored).toContainText("V tvém prohlížeči");
  await expect(stored).toContainText("Na serveru");
  await expect(stored).toContainText("Skóre počítá vždy server");
});
