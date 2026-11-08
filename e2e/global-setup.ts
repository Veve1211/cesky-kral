// Prepares the TEST database: applies migrations and loads the seed.
import { execSync } from "node:child_process";

export default function globalSetup() {
  const url = process.env.E2E_DATABASE_URL;
  if (!url) {
    throw new Error(
      "E2E_DATABASE_URL is not set – point it to a separate test database (see README).",
    );
  }

  // Safety net: never run the tests against the real (production) database.
  let databaseName = "";
  try {
    databaseName = new URL(url).pathname.replace(/^\//, "");
  } catch {
    throw new Error("E2E_DATABASE_URL is not a valid URL.");
  }
  if (!/test/i.test(databaseName)) {
    throw new Error('The test database name must contain "test" (e.g. cesky_kral_test).');
  }

  const env = { ...process.env, DATABASE_URL: url };
  execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
  execSync("npx prisma db seed", { env, stdio: "inherit" });
}
