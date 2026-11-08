"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/sbirka", label: "Sbírka", Icon: BookOpen, className: "" },
  { href: "/rychlovka", label: "Rychlovka", Icon: Zap, className: "text-gold" },
] as const;

/** Header navigation; the current page is marked with aria-current="page". */
export function SiteNav() {
  return <SiteNavLinks pathname={usePathname()} />;
}

/** Links without the active state – used as the Suspense fallback while the path is unknown. */
export function SiteNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Hlavní navigace" className="flex shrink-0 items-center gap-1 text-sm font-medium">
      {ITEMS.map(({ href, label, Icon, className }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-1 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/10",
              className,
              // Active page: lighter background and a gilded underline.
              "aria-[current=page]:bg-white/15 aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2.5 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-gold",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
