import { expect, test, type Page } from "@playwright/test";

import { dismissAllCelebrations, open, playRound, readCollection, setCollection, STORAGE_KEY } from "./helpers/game";
import { kings } from "./helpers/seed-answers";

const SLUG = "rudolf-ii";
const RETRY = "Zkusit uložit znovu";
const SAVE_ERROR = "Kartu se nepodařilo uložit";
const RESTORE_STORAGE = "test:restore-collection-storage";

/** Fail only collection storage; a browser event restores it without reloading the quiz. */
async function blockStorage(page: Page, failure: "quota" | "blocked" = "quota") {
  await page.addInitScript(({ key, eventName, failure }) => {
    const storage = window.localStorage;
    const originalSetItem = Storage.prototype.setItem;
    let blocked = true;
    window.addEventListener(eventName, () => { blocked = false; });

    if (failure === "blocked") {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          if (blocked) throw new DOMException("Storage blocked", "SecurityError");
          return storage;
        },
      });
    } else {
      Storage.prototype.setItem = function (storageKey, value) {
        if (this === storage && storageKey === key && blocked) {
          throw new DOMException("Storage full", "QuotaExceededError");
        }
        return originalSetItem.call(this, storageKey, value);
      };
    }
  }, { key: STORAGE_KEY, eventName: RESTORE_STORAGE, failure });
}

async function restoreStorage(page: Page) {
  await page.evaluate((eventName) => window.dispatchEvent(new Event(eventName)), RESTORE_STORAGE);
}

async function expectSaveFailure(page: Page, score: number) {
  await expect(page.getByRole("alert").filter({ hasText: SAVE_ERROR })).toBeVisible();
  await expect(page.getByText(`Skóre ${score} z 5`, { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toHaveCount(0);
  await expect(page.locator(".flip-card")).toHaveCount(0);
  await expect(page.getByTestId("king-reign")).toContainText("???? – ????");
  await expect(page.getByRole("button", { name: RETRY })).toBeVisible();
}

for (const failure of ["quota", "blocked"] as const) {
  test(`uložení karty: ${failure} → chyba → opakování bez dalšího kvízu`, async ({ page }) => {
    // Existing cards and their gold must survive the failed and repeated saves.
    await setCollection(page, ["karel-iv"], ["karel-iv"]);
    await blockStorage(page, failure);
    let answerChecks = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.headers()["next-action"]) answerChecks++;
    });
    await open(page, `/kral/${SLUG}`);
    await playRound(page, [true, true, true, true, false]);
    await expectSaveFailure(page, 4);

    // Still blocked: another save must neither claim success nor restart the quiz.
    await page.getByRole("button", { name: RETRY }).click();
    await expectSaveFailure(page, 4);
    await restoreStorage(page);
    expect(await readCollection(page)).toEqual({ version: 2, kings: ["karel-iv"], golden: ["karel-iv"] });
    await page.getByRole("button", { name: RETRY }).click();
    // Saved now: the new card is celebrated first.
    expect(await dismissAllCelebrations(page)).toEqual([{ kind: "card", firstTime: true }]);

    await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();
    await expect(page.getByText("Skóre 4 z 5", { exact: true })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: SAVE_ERROR })).toHaveCount(0);
    expect(await readCollection(page)).toEqual({
      version: 2, kings: ["karel-iv", SLUG], golden: ["karel-iv"],
    });
    expect(answerChecks).toBe(5);
    // A fresh tab reads the persisted card without re-arming this tab's storage mock.
    const freshTab = await page.context().newPage();
    await open(freshTab, `/kral/${SLUG}`);
    await expect(freshTab.getByTestId("king-reign")).toHaveText("1576–1611 · Habsburkové");
    expect((await readCollection(freshTab))?.kings.filter((slug) => slug === SLUG)).toHaveLength(1);
    await freshTab.close();
  });
}

test("opakování uložení neduplikuje kartu získanou mezitím v jiné záložce", async ({ page, context }) => {
  await blockStorage(page);
  await open(page, `/kral/${SLUG}`);
  await playRound(page, [true, true, true, true, true]);
  await expectSaveFailure(page, 5);

  const otherTab = await context.newPage();
  await setCollection(otherTab, [SLUG], [SLUG]);
  await otherTab.close();
  // Writes in the quiz tab are still blocked, but the card is already persisted.
  await page.getByRole("button", { name: RETRY }).click();
  // Won in the other tab already – only the small "won again" celebration.
  expect(await dismissAllCelebrations(page)).toEqual([{ kind: "card", firstTime: false }]);
  await expect(page.getByRole("heading", { name: "Král je ve tvé sbírce!" })).toBeVisible();
  expect(await readCollection(page)).toEqual({ version: 2, kings: [SLUG], golden: [SLUG] });
});

test("poslední panovník dokončí sbírku až po úspěšném opakování uložení", async ({ page }) => {
  const owned = kings.filter((king) => king.slug !== SLUG).map((king) => king.slug);
  await setCollection(page, owned);
  await blockStorage(page);
  await open(page, `/kral/${SLUG}`);
  await playRound(page, [true, true, true, true, false]);
  await expectSaveFailure(page, 4);
  const celebration = page.getByRole("region", { name: /Jsi Pán \/ Paní erbovní knihy/ });
  await expect(celebration).toHaveCount(0);
  expect((await readCollection(page))?.kings).toEqual(owned);

  await restoreStorage(page);
  await page.getByRole("button", { name: RETRY }).click();
  await dismissAllCelebrations(page);
  await expect(celebration).toBeVisible();
  await expect(celebration).toContainText(`Všech ${kings.length} panovníků ve sbírce`);
  expect((await readCollection(page))?.kings).toEqual([...owned, SLUG]);
});
