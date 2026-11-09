import Link from "next/link";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

/** On a celebration screen: which crest parts this reward unlocked. */
export function CrestUnlockText({ parts }: { parts: readonly string[] }) {
  if (parts.length === 0) return null;
  return (
    <p data-testid="crest-unlock" className="animate-tier-rise rounded-xl bg-white/10 px-4 py-2 text-sm text-parchment ring-1 ring-gold/60 [animation-delay:1s]">
      <span aria-hidden>🛡️ </span>
      {parts.length === 1 ? "Nový díl erbu odemčen: " : "Nové díly erbu odemčeny: "}
      <strong className="text-gold-light">{parts.join(", ")}</strong>
    </p>
  );
}

/** "Ozdobit erb" – shown next to "Pokračovat" when a part was unlocked. */
export function DecorateCrestButton({ parts }: { parts: readonly string[] }) {
  if (parts.length === 0) return null;
  return (
    <Button asChild variant="outline" size="lg">
      <Link href="/muj-erb">
        <Shield aria-hidden />
        Ozdobit erb
      </Link>
    </Button>
  );
}
