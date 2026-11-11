import { KOFI_URL } from "@/lib/kofi";
import { cn } from "@/lib/utils";

const NEW_WINDOW = " (Ko-fi, otevře se v novém okně)";

/**
 * "🪙 Hoď kronikáři groš" – at most one per page: once low on the home page,
 * after every finished game, on the card and crown celebrations (`subtle`,
 * under "Pokračovat") and at the end of "Jak hrát"; never in the header or
 * during a question. While a celebration is open, the page's own card hides
 * (`.kofi-page`, globals.css), so only the celebration's link is visible.
 * Renders nothing unless NEXT_PUBLIC_KOFI_URL is a valid Ko-fi link.
 * Always an ordinary link in a new tab: no pop-ups.
 */
export function KofiButton({
  url = KOFI_URL,
  className,
  variant = "card",
}: {
  url?: string | null;
  className?: string;
  /** `subtle`: one small line for the celebration screens. */
  variant?: "card" | "subtle";
}) {
  if (!url) return null;
  if (variant === "subtle") {
    return (
      <aside aria-label="Podpora hry" data-testid="kofi-card" className={cn("text-center text-sm text-current/80", className)}>
        <p>
          Baví tě hra?{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="kofi-link"
            className="font-semibold underline decoration-gold underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span aria-hidden>🪙 </span>Hoď kronikáři groš
            <span className="sr-only">{NEW_WINDOW}</span>
          </a>{" "}
          a pomůžeš mu psát další kapitoly.
        </p>
      </aside>
    );
  }
  return (
    <aside
      aria-label="Podpora hry"
      data-testid="kofi-card"
      className={cn(
        "kofi-page relative flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-grosh/30 bg-grosh/5 px-5 py-5 text-center",
        className,
      )}
    >
      <p className="font-heading text-2xl leading-tight font-bold text-grosh">Baví tě hra?</p>
      <p className="max-w-sm text-sm text-ink/85">
        Hoď kronikáři groš a pomůžeš mu psát další kapitoly.
      </p>
      {/* Green "groš" coin button: parchment text on --grosh (7 : 1), gilded ring. */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="kofi-link"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-grosh px-5 py-3 text-base font-semibold text-parchment shadow-md ring-2 ring-gold transition-colors outline-none hover:bg-grosh-dark focus-visible:ring-4 focus-visible:ring-gold-light"
      >
        {/* Fixed box: the coin emoji is as wide as the system's emoji font makes it. */}
        <span aria-hidden className="inline-flex size-5 shrink-0 items-center justify-center overflow-hidden leading-none">
          🪙
        </span>
        <span>Hoď kronikáři groš</span>
        <span className="sr-only">{NEW_WINDOW}</span>
      </a>
    </aside>
  );
}
