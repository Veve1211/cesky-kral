import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Tohoto krále neznáme</h1>
      <p className="text-muted-foreground">
        Stránka neexistuje. Vrať se do sbírky a vyber si jiného panovníka.
      </p>
      <Button asChild>
        <Link href="/">Zpět do sbírky</Link>
      </Button>
    </div>
  );
}
