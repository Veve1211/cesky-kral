import { KOFI_URL } from "@/lib/kofi";

/** Small gilded "tip jar" link to Ko-fi; renders nothing unless NEXT_PUBLIC_KOFI_URL is set. */
export function KofiButton({ url = KOFI_URL }: { url?: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="gilt inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-navy shadow-md ring-1 ring-gold-dark/50 transition-[background-position] duration-700 outline-none hover:bg-right focus-visible:ring-4 focus-visible:ring-ring/60"
    >
      <span aria-hidden>🪙</span>
      Hoď kronikáři groš
      <span className="sr-only"> (Ko-fi, otevře se v novém okně)</span>
    </a>
  );
}
