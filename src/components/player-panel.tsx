"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowDownToLine, Smartphone } from "lucide-react";

import { NicknameForm } from "@/components/nickname-form";
import { CardCorners } from "@/components/ornaments";
import { Button } from "@/components/ui/button";
import { mergeCollectionFrom } from "@/lib/collection";
import { mergeDailyFrom } from "@/lib/daily-progress";
import { mergeMasteryFrom } from "@/lib/mastery-progress";
import { ensurePlayer, postJson, readToken, writeToken } from "@/lib/player";
import { formatCode, normalizeCode, TRANSFER_KEYS, TRANSFER_MINUTES, type TransferPayload } from "@/lib/transfer-code";
import { mergeBestStreakFrom } from "@/lib/who-first-best";

/** Raw text of every storage key that travels with the code. */
function snapshot(): TransferPayload {
  const payload: TransferPayload = {};
  for (const [name, key] of Object.entries(TRANSFER_KEYS) as [keyof typeof TRANSFER_KEYS, string][]) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) payload[name] = raw;
    } catch {
      // storage blocked – nothing to send
    }
  }
  return payload;
}

/** Merges the progress from the other device – nothing on this one is lost. */
function applySnapshot(payload: TransferPayload): boolean {
  return [
    mergeCollectionFrom(payload.collection),
    mergeMasteryFrom(payload.mastery),
    mergeDailyFrom(payload.daily),
    mergeBestStreakFrom(payload.whoFirst),
  ].every(Boolean);
}

/** "Moje sbírka": nickname for the leaderboards and moving progress to another device. */
export function PlayerPanel() {
  const [nickname, setNickname] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const token = readToken();
    let cancelled = false;
    void (token ? postJson<{ nickname: string | null }>("/api/player/me", { token }) : Promise.resolve(null)).then((result) => {
      if (!cancelled) setNickname(result?.ok ? result.nickname : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="player-heading" className="parchment relative flex flex-col gap-5 rounded-2xl p-5 sm:p-6">
      <CardCorners className="m-1 size-7 text-gold-dark" />
      <div>
        <h2 id="player-heading" className="text-3xl font-bold">
          Přezdívka a přenos postupu
        </h2>
        <p className="text-sm text-muted-foreground">Bez registrace a bez osobních údajů.</p>
      </div>
      {nickname === undefined ? (
        <div className="h-24" aria-busy="true" />
      ) : (
        <NicknameForm key={nickname ?? "none"} current={nickname} onSaved={setNickname} />
      )}
      <TransferCode />
    </section>
  );
}

function TransferCode() {
  const inputId = useId();
  const [created, setCreated] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    setMessage(null);
    const token = await ensurePlayer();
    const result = token
      ? await postJson<{ code: string }>("/api/transfer", { token, payload: snapshot() })
      : ({ ok: false, error: "Povol ukládání dat v prohlížeči." } as const);
    setBusy(false);
    if (!result.ok) {
      setMessage({ kind: "error", text: result.error });
      return;
    }
    setCreated(result.code);
  }

  async function redeem(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizeCode(code);
    if (!normalized) {
      setMessage({ kind: "error", text: "Kód má 8 znaků, třeba ABCD-EFGH." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await postJson<{ token: string; payload: TransferPayload }>("/api/transfer/redeem", { code: normalized });
    setBusy(false);
    if (!result.ok) {
      setMessage({ kind: "error", text: result.error });
      return;
    }
    const saved = writeToken(result.token) && applySnapshot(result.payload);
    setCode("");
    setMessage(
      saved
        ? { kind: "ok", text: "Hotovo! Postup z druhého zařízení je tady. Nic z tohoto zařízení se neztratilo." }
        : { kind: "error", text: "Postup se nepodařilo uložit. Povol ukládání dat v prohlížeči." },
    );
  }

  return (
    <div className="flex flex-col gap-4 border-t border-gold-dark/25 pt-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-2xl font-bold">
          <Smartphone aria-hidden className="mr-1 inline size-5" />
          Hraješ i jinde?
        </h3>
        <p className="text-sm text-ink/85">
          Vytvoř si krátký kód a zadej ho na druhém zařízení. Platí {TRANSFER_MINUTES} minut a jen jednou.
          Přenese sbírku, koruny, Denní výzvu, nejlepší sérii i přezdívku.
        </p>
        {created ? (
          <p className="flex flex-col items-start gap-1">
            <span className="text-sm">Tvůj kód:</span>
            <strong data-testid="transfer-code" className="rounded-lg bg-navy px-4 py-2 font-mono text-2xl tracking-[0.2em] text-gold">
              {formatCode(created)}
            </strong>
          </p>
        ) : (
          <Button type="button" variant="outline" onClick={create} disabled={busy} className="self-start">
            Vytvořit kód pro přenos
          </Button>
        )}
      </div>

      <form onSubmit={redeem} className="flex flex-col gap-2" noValidate>
        <label htmlFor={inputId} className="text-sm font-semibold">
          Mám kód z jiného zařízení
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="ABCD-EFGH"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={20}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-gold-dark/50 bg-white/70 px-3 font-mono text-base tracking-widest uppercase outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
          />
          <Button type="submit" disabled={busy}>
            <ArrowDownToLine aria-hidden />
            Přenést
          </Button>
        </div>
      </form>
      <p role="status" className={message?.kind === "error" ? "text-sm text-destructive" : "text-sm text-success"}>
        {message?.text}
      </p>
    </div>
  );
}
