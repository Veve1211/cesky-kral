// Server actions must refuse invalid input even when someone calls them
// directly (e.g. from the browser console), bypassing the UI.
import { expect, test, type Page, type Request } from "@playwright/test";

import { currentQuestion, open, progress, waitForHydration } from "./helpers/game";

type CapturedAction = { url: string; headers: Record<string, string> };

/**
 * Lets the first server action call of the page through with a replaced
 * body and remembers its request, so more payloads can be sent directly.
 */
async function interceptFirstAction(page: Page, path: string, tamperedBody: string) {
  let captured: CapturedAction | null = null;
  await page.route(`**${path}`, async (route, request: Request) => {
    const headers = await request.allHeaders();
    if (request.method() !== "POST" || !headers["next-action"]) return route.continue();
    captured = { url: request.url(), headers };
    await route.continue({ postData: tamperedBody });
  });
  return () => captured;
}

/** Calls the same server action again with any JSON arguments. */
async function callAction(page: Page, action: CapturedAction, args: unknown[]) {
  const headers = { ...action.headers };
  delete headers["content-length"];
  const response = await page.request.post(action.url, {
    headers,
    data: JSON.stringify(args),
  });
  return { status: response.status(), body: await response.text() };
}

test("checkAnswer odmítne neplatné vstupy", async ({ page }) => {
  const getAction = await interceptFirstAction(page, "/kral/karel-iv", JSON.stringify(["1", "1"]));
  await open(page, "/kral/karel-iv");
  await expect(progress(page, 1, 5)).toBeVisible();

  const question = await currentQuestion(page);
  const firstAnswer = page.getByRole("button", { name: question.correct, exact: true });
  await waitForHydration(firstAnswer);
  await firstAnswer.click();

  // The tampered call shows the error and nothing is revealed.
  await expect(page.getByRole("alert").filter({ hasText: "Neplatná odpověď." })).toBeVisible();
  await expect(page.getByText("Správně!")).toHaveCount(0);
  await expect(page.getByText("Tentokrát vedle.")).toHaveCount(0);

  const action = getAction();
  expect(action).not.toBeNull();
  const invalid: unknown[][] = [
    [],
    [null, null],
    [-1, 1],
    [1.5, 2],
    [0, 0],
    [2 ** 31, 1],
    [{ id: 1 }, [1]],
    ["1; DROP TABLE \"Question\"", "1"],
  ];
  for (const args of invalid) {
    const { status, body } = await callAction(page, action!, args);
    expect(status, JSON.stringify(args)).toBe(200);
    expect(body, JSON.stringify(args)).toContain('"ok":false');
    expect(body).not.toContain("correctAnswerId");
  }
  // Well-formed ids that do not exist.
  const missing = await callAction(page, action!, [2_000_000_000, 2_000_000_000]);
  expect(missing.body).toContain("Otázka neexistuje.");
});

test("checkWhoFirst odmítne neplatné vstupy", async ({ page }) => {
  const getAction = await interceptFirstAction(
    page,
    "/kdo-driv",
    JSON.stringify(["karel-iv", "karel-iv", "karel-iv"]),
  );
  await open(page, "/kdo-driv");
  const option = page.getByRole("group", { name: "Kdo začal vládnout dřív?" }).getByRole("button").first();
  await waitForHydration(option);
  await option.click();

  await expect(page.getByRole("alert").filter({ hasText: "Neplatná odpověď." })).toBeVisible();
  await expect(page.getByText(/^Správně!/)).toHaveCount(0);

  const action = getAction();
  expect(action).not.toBeNull();
  const invalid: unknown[][] = [
    [],
    [null, null, null],
    ["karel-iv", "josef-ii", "rudolf-ii"], // chosen is not one of the pair
    ["Karel-IV", "josef-ii", "Karel-IV"], // not a valid slug
    ["../admin", "josef-ii", "../admin"],
    ["<script>", "josef-ii", "<script>"],
    [["karel-iv"], "josef-ii", "josef-ii"],
    ["x".repeat(10_000), "josef-ii", "josef-ii"],
  ];
  for (const args of invalid) {
    const { status, body } = await callAction(page, action!, args);
    expect(status, JSON.stringify(args).slice(0, 80)).toBe(200);
    expect(body, JSON.stringify(args).slice(0, 80)).toContain('"ok":false');
    expect(body).not.toContain("reigns");
  }
  // Legends have no years, so they are not allowed in this game.
  const legend = await callAction(page, action!, ["libuse", "karel-iv", "libuse"]);
  expect(legend.body).toContain("Panovník neexistuje.");
  // A valid pair still works, so the checks above really hit the action.
  const valid = await callAction(page, action!, ["karel-iv", "josef-ii", "karel-iv"]);
  expect(valid.body).toContain('"ok":true');
  expect(valid.body).toContain('"correct":true');
});
