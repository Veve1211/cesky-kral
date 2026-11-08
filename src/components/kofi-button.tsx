import { KOFI_URL } from "@/lib/kofi";
import { cn } from "@/lib/utils";

type Variant = "header" | "hero" | "card" | "footer";

const NEW_WINDOW = " (Ko-fi, otevře se v novém okně)";

// Green "groš" coin button: parchment text on --grosh (7 : 1), gilded ring.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full bg-grosh font-semibold text-parchment shadow-md ring-2 ring-gold transition-colors outline-none hover:bg-grosh-dark focus-visible:ring-4 focus-visible:ring-gold-light";

/**
 * "🪙 Hoď kronikáři groš" – one component for every place it appears.
 * Renders nothing unless NEXT_PUBLIC_KOFI_URL is a valid Ko-fi link.
 * Always an ordinary link in a new tab: no pop-ups, never in the way of the game.
 *
 * - header: compact; text from `md`, below just the coin (name in aria-label)
 * - hero:   home page, under Denní výzva – clearly smaller than it
 * - card:   "Baví tě Český král?" card for result screens and Moje sbírka
 * - footer: medium pill in the footer
 */
export function KofiButton({
  variant,
  url = KOFI_URL,
  className,
}: {
  variant: Variant;
  url?: string | null;
  className?: string;
}) {
  if (!url) return null;

  const link = (linkClass: string, label: string = "Hoď kronikáři groš", hideLabelBelowMd = false) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={hideLabelBelowMd ? `${label}${NEW_WINDOW}` : undefined}
      data-testid={`kofi-${variant}`}
      className={cn(BASE, linkClass)}
    >
      <span aria-hidden className="leading-none">
        🪙
      </span>
      <span className={hideLabelBelowMd ? "max-md:sr-only" : undefined}>{label}</span>
      {!hideLabelBelowMd && <span className="sr-only">{NEW_WINDOW}</span>}
    </a>
  );

  if (variant === "header") {
    return link(
      cn("min-h-9 min-w-9 shrink-0 px-1.5 text-sm ring-1 md:px-3", className),
      "Hoď groš",
      true,
    );
  }
  if (variant === "hero") {
    return link(cn("w-full max-w-xs px-5 py-3 text-base", className));
  }
  if (variant === "footer") {
    return link(cn("px-5 py-2.5 text-sm", className));
  }
  return (
    <aside
      aria-label="Podpora hry"
      className={cn(
        "relative flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-grosh/30 bg-grosh/5 px-5 py-5 text-center",
        className,
      )}
    >
      <p className="font-heading text-2xl leading-tight font-bold text-grosh">Baví tě Český král?</p>
      <p className="max-w-sm text-sm text-ink/85">
        Hoď kronikáři groš na další panovníky. Je to dobrovolné, hra zůstává zdarma pro všechny.
      </p>
      {link("px-5 py-3 text-base")}
    </aside>
  );
}
