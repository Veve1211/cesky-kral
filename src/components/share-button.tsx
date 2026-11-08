"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Status = "idle" | "shared" | "copied" | "manual";

/**
 * "Sdílet": the system share sheet where available (phones), otherwise the
 * text is copied to the clipboard; if even that fails, it is shown to copy
 * by hand. The result is announced to screen readers.
 */
export function ShareButton({ text, url }: { text: string; url: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const message = `${text}\n${url}`;

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
