// Only local, pre-processed portraits are allowed (public/kings/*.webp).
const IMAGE_PATTERN = /^\/kings\/[a-z0-9-]+\.webp$/;

export function safeKingImage(url: string | null | undefined): string | null {
  return typeof url === "string" && IMAGE_PATTERN.test(url) ? url : null;
}
