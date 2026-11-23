import { expect, test } from "@playwright/test";

test("health check answers 200 with the database up and is never cached", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toEqual({ status: "ok", db: "ok" });
});
