"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCountdown, msUntilNextDaily } from "@/lib/daily";
import { cn } from "@/lib/utils";

// Ticks once a second; the server renders no time at all (avoids hydration mismatch).
function subscribeClock(onTick: () => void) {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
}
const nowInSeconds = () => Math.floor(Date.now() / 1000);

/** "Další výzva za 05:12:33", then (optionally) a button to load the new one. */
export function DailyCountdown({
  label = "Další výzva za",
  withReload = true,
  className,
  timeClassName = "font-semibold text-ink",
}: {
  label?: string;
  withReload?: boolean;
  className?: string;
  timeClassName?: string;
}) {
  const router = useRouter();
  const seconds = useSyncExternalStore(subscribeClock, nowInSeconds, () => null);
  if (seconds === null) return <p className={cn("min-h-6", className)} />;

  const left = msUntilNextDaily(new Date(seconds * 1000));
  if (left <= 1000 && withReload) {
    return (
      <Button onClick={() => router.refresh()} variant="default" size="lg">
        <RotateCcw aria-hidden />
        Nová výzva je tu
      </Button>
    );
  }
  return (
    <p className={cn("text-sm", className)}>
      {label}{" "}
      {/* Not a live region: a screen reader would read it every second. */}
      <time dateTime={`PT${Math.ceil(left / 1000)}S`} className={cn("tabular-nums", timeClassName)}>
        {formatCountdown(left)}
      </time>
    </p>
  );
}
