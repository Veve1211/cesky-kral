// "Hoď kronikáři groš" – optional Ko-fi link.
//
// NEXT_PUBLIC_* variables are inlined into the app when it is BUILT, so
// changing the value on Railway needs a new deployment to take effect.
// Without a valid value the button is not rendered at all.

const KOFI_HOSTS = new Set(["ko-fi.com", "www.ko-fi.com"]);

/** A safe https://ko-fi.com/… URL, or null for anything else (empty, other site, javascript:, …). */
export function parseKofiUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value || value.length > 200) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !KOFI_HOSTS.has(url.hostname)) return null;
    if (url.username || url.password || url.port) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const KOFI_URL = parseKofiUrl(process.env.NEXT_PUBLIC_KOFI_URL);
