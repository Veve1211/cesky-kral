import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ANSWERS_PER_QUESTION } from "@/lib/game-rules";

// Static preview of the question layout. Real questions come from the DB later.
export function QuestionSkeleton() {
  return (
    <Card className="animate-card-reveal">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Otázka
        </p>
        <h2 className="text-xl font-bold leading-snug sm:text-2xl">
          Tady se objeví otázka ze seed souboru.
        </h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: ANSWERS_PER_QUESTION }, (_, i) => (
          <Button
            key={i}
            variant="outline"
            size="lg"
            disabled
            className="h-auto justify-start py-4 text-left whitespace-normal"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-sm text-gold">
              {String.fromCharCode(65 + i)}
            </span>
            Odpověď {i + 1}
          </Button>
        ))}
        <p className="pt-1 text-center text-xs text-muted-foreground">
          Po odpovědi hned uvidíš, jestli to bylo správně, a krátké vysvětlení.
        </p>
      </CardContent>
    </Card>
  );
}
