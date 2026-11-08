"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Něco se pokazilo</h1>
      <p className="text-muted-foreground">
        Nepodařilo se načíst data. Zkus to prosím za chvíli znovu.
      </p>
      <Button onClick={reset}>Zkusit znovu</Button>
    </div>
  );
}
