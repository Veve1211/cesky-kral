"use client";

import { useId, useState, type FormEvent } from "react";
import { Check, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { checkNickname, NICKNAME_MAX, NICKNAME_MIN } from "@/lib/nickname";
import { announceLeaderboardChange, ensurePlayer, postJson } from "@/lib/player";
import { cn } from "@/lib/utils";

/**
 * Nickname for the leaderboards – no registration, no personal data.
 * The browser checks the rules for quick feedback; the server checks again
 * (rules, vulgar words, uniqueness) and has the last word.
 */
export function NicknameForm({
  current,
  onSaved,
  className,
  label = "Tvoje přezdívka do žebříčků",
}: {
  current: string | null;
  onSaved?: (nickname: string) => void;
  className?: string;
  label?: string;
}) {
  const id = useId();
  const [editing, setEditing] = useState(current === null);
  const [value, setValue] = useState(current ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(current);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const check = checkNickname(value);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setSaving(true);
    setError(null);
    const token = await ensurePlayer();
    const result = token
      ? await postJson<{ nickname: string }>("/api/player/nickname", { token, nickname: check.nickname })
      : ({ ok: false, error: "Přezdívku teď nejde uložit. Povol ukládání dat v prohlížeči." } as const);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(result.nickname);
    setEditing(false);
    onSaved?.(result.nickname);
    announceLeaderboardChange();
  }

  if (!editing && saved) {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-2 text-sm", className)}>
        <span>
          Přezdívka: <strong data-testid="nickname-current">{saved}</strong>
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil aria-hidden />
          Změnit
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("flex w-full max-w-sm flex-col gap-2 text-left", className)} noValidate>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="nickname"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          minLength={NICKNAME_MIN}
          maxLength={NICKNAME_MAX * 2}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={`${id}-hint ${id}-error`}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-gold-dark/50 bg-white/70 px-3 text-base outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
        />
        <Button type="submit" disabled={saving} size="lg">
          <Check aria-hidden />
          Uložit
        </Button>
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        {NICKNAME_MIN}–{NICKNAME_MAX} znaků. Žádné jméno ani e-mail – stačí vymyšlená přezdívka.
      </p>
      <p id={`${id}-error`} role="alert" className="min-h-4 text-sm text-destructive">
        {error}
      </p>
    </form>
  );
}
