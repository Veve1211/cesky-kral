export function indexNowKey(): string | undefined {
  const key = process.env.INDEXNOW_KEY;
  return key && /^[a-z0-9-]{8,128}$/i.test(key) ? key : undefined;
}
