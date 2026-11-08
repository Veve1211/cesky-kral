"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircleQuestionMark, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

// Emoji icon for "Kdo vládl dřív?" – same box as the lucide icons.
function Hourglass({ className }: { className?: string; "aria-hidden"?: boolean }) {
  return (
    <span className={cn("flex items-center justify-center text-base leading-none", className)} aria-hidden>
      ⏳
    </span>
  );
}

// `labelClass` hides the visible label where the header is too narrow; the
// label stays for screen readers, so every link keeps its name. "Jak hrát"
// always keeps its text. When logo and menu don't fit on one line, the header
// wraps the menu onto a second line (see SiteHeader) instead of cutting the logo.
const ITEMS = [
  { href: "/sbirka", label: "Moje sbírka", Icon: BookOpen, className: "", labelClass: "max-[479px]:sr-only" },
  { href: "/kdo-driv", label: "Kdo vládl dřív?", Icon: Hourglass, className: "", labelClass: "sr-only" },
  { href: "/rychlovka", label: "Rychlovka", Icon: Zap, className: "text-gold", labelClass: "max-sm:sr-only" },
  { href: "/jak-hrat", label: "Jak hrát", Icon: CircleQuestionMark, className: "", labelClass: "" },
] as const;

/** Header navigation; the current page is marked with aria-current="page". */
export function SiteNav() {
  return <SiteNavLinks pathname={usePathname()} />;
}

/** Links without the active state – used as the Suspense fallback while the path is unknown. */
export function SiteNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Hlavní navigace" className="flex shrink-0 items-center gap-0.5 text-sm font-medium min-[390px]:gap-1">
      {ITEMS.map(({ href, label, Icon, className, labelClass }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={cn(
              "relative flex min-h-10 items-center gap-1 rounded-lg px-2 py-2 min-[390px]:px-2.5 whitespace-nowrap transition-colors hover:bg-white/10",
              className,
              // Tighter padding on small phones, so logo and menu share one line.
              "max-[389px]:px-1.5",
              // Active page: lighter background and a gilded underline.
              "aria-[current=page]:bg-white/15 aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-gold",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className={labelClass}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
