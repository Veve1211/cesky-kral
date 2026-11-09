"use client";

import { useId, useState } from "react";
import { Copy, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSavedCrest } from "@/lib/crest-progress";
import { crestToQuery } from "@/lib/heraldry";

type Status = "idle" | "shared" | "copied" | "manual";

/**
 * "Sdílet": the system share sheet where available (phones), otherwise the
 * text is copied to the clipboard; if even that fails, it is shown to copy
 * by hand. The result is announced to screen readers.
 */
export function ShareButton({ text, url, withCrest = false }: { text: string; url: string; withCrest?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  // Optionally the player's own crest goes along (a link that shows it to others).
  const crest = useSavedCrest();
  const [addCrest, setAddCrest] = useState(false);
  const crestId = useId();
  const crestUrl =
    withCrest && crest && addCrest && typeof window !== "undefined" ? `${window.location.origin}/erb?${crestToQuery(crest)}` : null;
  const message = `${text}\n${url}${crestUrl ? `\n🛡️ Můj erb: ${crestUrl}` : ""}`;

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: message });
        setStatus("shared");
        return;
      } catch (error) {
        // The player closed the share sheet – nothing to do.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button onClick={share} variant="accent" size="lg">
        {status === "copied" ? <Copy aria-hidden /> : <Share2 aria-hidden />}
        Sdílet
      </Button>
      {withCrest && crest && (
        <label htmlFor={crestId} className="flex items-center gap-2 text-sm">
          <input
            id={crestId}
            type="checkbox"
            checked={addCrest}
            onChange={(event) => {
              setAddCrest(event.target.checked);
              setStatus("idle");
            }}
            className="size-5 accent-navy"
          />
          Sdílet i můj erb
        </label>
      )}
      <p role="status" className="min-h-5 text-sm text-muted-foreground">
        {status === "shared" && "Odesláno. Díky za sdílení!"}
        {status === "copied" && "Zkopírováno do schránky, stačí vložit."}
        {status === "manual" && "Zkopíruj si text níže:"}
      </p>
      {status === "manual" && (
        <textarea
          readOnly
          value={message}
          aria-label="Text ke sdílení"
          rows={3}
          className="w-full max-w-sm rounded-lg border border-gold/50 bg-white/60 p-2 text-sm"
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
