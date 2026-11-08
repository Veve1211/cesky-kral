"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

// Emoji icon for "Kdo vládl dřív?" – same box as the lucide icons.
function Hourglass({ className }: { className?: string; "aria-hidden"?: boolean }) {
  return (
    <span className={cn("flex items-center justify-center text-base leading-none", className)} aria-hidden>
      ⏳
    </span>
  );
}

// `iconOnly`: always just the icon; `iconOnlyOnMobile`: label hidden below `sm`.
// Both keep the label for screen readers, so the nav fits next to the logo.
const ITEMS = [
  { href: "/sbirka", label: "Moje sbírka", Icon: BookOpen, className: "", iconOnly: false, iconOnlyOnMobile: false },
  { href: "/kdo-driv", label: "Kdo vládl dřív?", Icon: Hourglass, className: "", iconOnly: true, iconOnlyOnMobile: true },
  { href: "/rychlovka", label: "Rychlovka", Icon: Zap, className: "text-gold", iconOnly: false, iconOnlyOnMobile: true },
] as const;

/** Header navigation; the current page is marked with aria-current="page". */
export function SiteNav() {
  return <SiteNavLinks pathname={usePathname()} />;
}

/** Links without the active state – used as the Suspense fallback while the path is unknown. */
export function SiteNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Hlavní navigace" className="flex shrink-0 items-center gap-0.5 text-sm font-medium min-[360px]:gap-1">
      {ITEMS.map(({ href, label, Icon, className, iconOnly, iconOnlyOnMobile }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={iconOnlyOnMobile ? label : undefined}
            className={cn(
              "relative flex min-h-10 items-center gap-1 rounded-lg px-2 py-2 min-[360px]:px-2.5 whitespace-nowrap transition-colors hover:bg-white/10",
              className,
              // Icon-only links get tighter padding on the narrowest phones.
              iconOnlyOnMobile && "max-[359px]:px-1.5",
              // Active page: lighter background and a gilded underline.
              "aria-[current=page]:bg-white/15 aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-gold",
            )}
          >
            {/* Below 360 px the text label alone is enough – saves room for the logo. */}
            <Icon className={cn("size-4 shrink-0", !iconOnlyOnMobile && "max-[359px]:hidden")} aria-hidden />
            <span className={iconOnly ? "sr-only" : iconOnlyOnMobile ? "max-sm:sr-only" : undefined}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
