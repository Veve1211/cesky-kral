import { indexNowKey } from "../src/lib/indexnow";
import { PRODUCTION_DOMAIN } from "../src/lib/site-url";

async function submit(paths: string[]) {
  const key = indexNowKey();
  if (!key) throw new Error("Set INDEXNOW_KEY to the valid key deployed in production.");
  if (paths.length === 0 || paths.length > 10_000) {
    throw new Error("Pass 1 to 10,000 changed or removed production paths.");
  }

  const origin = `https://${PRODUCTION_DOMAIN}`;
  const urlList = [...new Set(paths.map((path) => {
    const url = new URL(path, origin);
    if (
      !path.startsWith("/") ||
      url.origin !== origin ||
      url.pathname !== path ||
      url.search ||
      url.hash
    ) throw new Error("Use canonical root-relative paths without a query or fragment.");
    return url.href;
  }))];

  const keyLocation = `${origin}/${key}.txt`;
  const verification = await fetch(keyLocation, {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (
    !verification.ok ||
    !verification.headers.get("content-type")?.startsWith("text/plain") ||
    (await verification.text()).trim() !== key
  ) {
    throw new Error("The configured IndexNow key could not be verified on production.");
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: PRODUCTION_DOMAIN, key, keyLocation, urlList }),
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow rejected the submission (HTTP ${response.status}).`);
  }
  console.log(`IndexNow accepted ${urlList.length} URL(s) (HTTP ${response.status}).`);
}

submit(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "IndexNow submission failed.");
  process.exitCode = 1;
});
