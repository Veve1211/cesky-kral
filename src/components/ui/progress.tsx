import * as React from "react";

import { cn } from "@/lib/utils";

// Simple accessible progress bar (no client JS needed).
function Progress({
  value,
  max = 100,
  label,
  className,
}: {
  value: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={value}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-navy/10 ring-1 ring-gold/40", className)}
    >
      <div
        className="gilt h-full rounded-full transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export { Progress };
