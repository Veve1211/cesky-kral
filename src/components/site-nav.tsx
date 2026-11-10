"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircleQuestionMark, Coins, Shield, Trophy, Zap } from "lucide-react";

import { KOFI_URL } from "@/lib/kofi";

import { cn } from "@/lib/utils";

// Emoji icon for "Kdo vládl dřív?" – same box as the lucide icons.
function Hourglass({ className }: { className?: string; "aria-hidden"?: boolean }) {
  return (
    <span className={cn("flex items-center justify-center text-base leading-none", className)} aria-hidden>
      ⏳
    </span>
  );
}

// Below `lg` (1024 px: phones and tablets) every link is an icon only;
// the label stays for screen readers and every link has an aria-label. From
// `lg` every link shows its icon and text (seven labels need the room). If logo and menu still don't fit on
// one line (larger text), the header wraps the menu onto a second line (see
// SiteHeader) instead of cutting the logo.
// Order: games first (Rychlovka, Kdo vládl dřív?), then the boards, the
// player's own things (erb, sbírka), help, and the groš page last. Any new
// item goes after these.
const ITEMS = [
  { href: "/rychlovka", label: "Rychlovka", Icon: Zap, className: "text-gold" },
  { href: "/kdo-driv", label: "Kdo vládl dřív?", Icon: Hourglass, className: "" },
  { href: "/zebricky", label: "Žebříček", Icon: Trophy, className: "" },
  { href: "/muj-erb", label: "Můj erb", Icon: Shield, className: "" },
  { href: "/sbirka", label: "Moje sbírka", Icon: BookOpen, className: "" },
  { href: "/jak-hrat", label: "Jak hrát", Icon: CircleQuestionMark, className: "" },
  { href: "/hod-gros", label: "Hoď groš", Icon: Coins, className: "" },
] as const;

/** Header navigation; the current page is marked with aria-current="page". */
export function SiteNav() {
  return <SiteNavLinks pathname={usePathname()} />;
}

/** Links without the active state – used as the Suspense fallback while the path is unknown. */
export function SiteNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Hlavní navigace" className="flex shrink-0 items-center gap-0.5 text-sm font-medium max-[359px]:gap-0 min-[480px]:gap-1">
      {/* The groš page only makes sense with a Ko-fi address. */}
      {ITEMS.filter((item) => item.href !== "/hod-gros" || KOFI_URL).map(({ href, label, Icon, className }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={cn(
              "relative flex min-h-10 items-center gap-1 rounded-lg px-2 py-2 min-[480px]:px-2.5 whitespace-nowrap transition-colors hover:bg-white/10",
              className,
              // Tighter padding on phones, so logo and menu share one line even
              // before the web fonts load (fallback fonts are wider).
              "max-[479px]:px-1.5 max-[359px]:px-1",
              // Active page: lighter background and a gilded underline.
              "aria-[current=page]:bg-white/15 aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-gold",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="max-lg:sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
