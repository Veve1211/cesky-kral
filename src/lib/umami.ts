import { isIndexable } from "@/lib/site-url";

export function umamiConfig() {
  const websiteId = process.env.UMAMI_WEBSITE_ID;
  const scriptUrl = URL.parse(process.env.UMAMI_SCRIPT_URL ?? "");
  if (
    !isIndexable() ||
    !websiteId ||
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(websiteId) ||
    scriptUrl?.protocol !== "https:" ||
    scriptUrl.username ||
    scriptUrl.password ||
    scriptUrl.search ||
    scriptUrl.hash
  ) {
    return undefined;
  }

  return { websiteId, scriptUrl: scriptUrl.href };
}
