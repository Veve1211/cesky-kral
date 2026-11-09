import { cn } from "@/lib/utils";

/**
 * Decorative manuscript initial: gold letter on a navy field
 * with a gilded frame and vine flourishes.
 *
 * The letter is drawn with CSS generated content (`::before`), so it is not
 * part of the DOM text: search engines and screen readers read the word that
 * follows exactly once (callers keep the whole word in the text, the first
 * letter visually hidden with `sr-only`).
 */
export function IlluminatedInitial({
  letter,
  size = "lg",
  className,
}: {
  letter: string;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      data-testid="illuminated-initial"
      className={cn(
        "gilt relative float-left mt-1 mr-3 mb-0.5 inline-flex shrink-0 items-center justify-center rounded-md p-[3px] shadow-md",
        size === "lg" ? "size-16 sm:size-[4.5rem]" : "size-14",
        className,
      )}
    >
      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-[5px] bg-navy">
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 size-full text-gold/45"
          aria-hidden
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <path d="M4 60 C14 50 8 38 18 32 C10 30 6 20 12 12" />
            <path d="M60 4 C50 14 56 26 46 32 C54 34 58 44 52 52" />
          </g>
          <g fill="currentColor">
            <circle cx="12" cy="12" r="2" />
            <circle cx="52" cy="52" r="2" />
            <path d="M18 32 l3 -3 l3 3 l-3 3z" />
            <path d="M46 32 l3 -3 l3 3 l-3 3z" />
          </g>
        </svg>
        <span
          data-letter={letter}
          className={cn(
            "gilt-text relative font-initial leading-none before:content-[attr(data-letter)]",
            size === "lg" ? "text-5xl sm:text-6xl" : "text-[2.6rem]",
          )}
        />
      </span>
    </span>
  );
}
