"use client";

import { useId, useState, type ReactNode } from "react";
import { Download, Lock, Save } from "lucide-react";

import { CrestSvg } from "@/components/crest-svg";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { useCollectionReady } from "@/lib/collection";
import { readSavedCrest, saveCrest } from "@/lib/crest-progress";
import { downloadCrestPng } from "@/lib/crest-png";
import {
  CHARGE_NAMES,
  CHARGES,
  chargeProblem,
  cleanMotto,
  crestToQuery,
  DEFAULT_CREST,
  DIVISION_NAMES,
  DIVISIONS,
  isUnlocked,
  MOTTO_MAX,
  mottoProblem,
  RULE_TEXT,
  secondProblem,
  SHAPE_NAMES,
  SHAPES,
  TINCTURE_COLORS,
  TINCTURE_NAMES,
  TINCTURES,
  unlockText,
  UNLOCKS,
  type CrestDesign,
  type CrownCounts,
  type Tincture,
  type Unlock,
} from "@/lib/heraldry";
import { useCrestCounts } from "@/lib/crest-unlocks";
import { announceLeaderboardChange, ensurePlayer, postJson } from "@/lib/player";
import { cn } from "@/lib/utils";

/** Short lock label on an option: "3× bronz", "1× zlato", "vše zlaté". */
function shortLock(unlock: Unlock): string {
  if (unlock.kind === "free") return "";
  if (unlock.kind === "all-gold") return "vše zlaté";
  if (unlock.kind === "cards") return unlock.count === 1 ? "1 karta" : unlock.count <= 4 ? `${unlock.count} karty` : `${unlock.count} karet`;
  return `${unlock.count}× ${unlock.tier === "bronze" ? "bronz" : unlock.tier === "silver" ? "stříbro" : "zlato"}`;
}

/** Keeps a design valid after a change: locked or rule-breaking parts are replaced by the first good option. */
function fixDesign(design: CrestDesign, counts: CrownCounts): CrestDesign {
  const next = { ...design };
  const okTincture = (t: Tincture) => isUnlocked(UNLOCKS.tincture[t], counts);
  if (next.division !== "plain" && (secondProblem(next) || !okTincture(next.second))) {
    next.second = TINCTURES.find((t) => okTincture(t) && !secondProblem({ ...next, second: t })) ?? next.second;
  }
  if (next.charge !== "none" && (chargeProblem(next) || !okTincture(next.chargeTincture))) {
    next.chargeTincture = TINCTURES.find((t) => okTincture(t) && !chargeProblem({ ...next, chargeTincture: t })) ?? next.chargeTincture;
  }
  return next;
}

/**
 * "Můj erb": shield shape, division, tinctures by the rule of tincture (with
 * a hint why), a charge and a motto. Parts unlock with knowledge crowns;
 * locked ones say what is still missing.
 */
export function CrestEditor({ kingSlugs }: { kingSlugs: string[] }) {
  const ready = useCollectionReady();
  if (!ready) return <div aria-busy="true" aria-label="Načítám erb" className="parchment h-96 animate-pulse rounded-2xl" />;
  // Read once: later saves must not reset the editor.
  return <Editor kingSlugs={kingSlugs} initial={readSavedCrest() ?? DEFAULT_CREST} />;
}

function Editor({ kingSlugs, initial }: { kingSlugs: string[]; initial: CrestDesign }) {
  const counts = useCrestCounts(kingSlugs);
  const [design, setDesign] = useState<CrestDesign>(initial);
  const [motto, setMotto] = useState(initial.motto);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [savedDesign, setSavedDesign] = useState<CrestDesign | null>(readSavedCrest());
  const mottoId = useId();

  const problem = mottoProblem(motto);
  const current: CrestDesign = { ...design, motto: problem ? design.motto : cleanMotto(motto) };

  function update(change: Partial<CrestDesign>) {
    setNotice(null);
    setSaveState(null);
    setDesign((d) => fixDesign({ ...d, ...change }, counts));
  }

  /** A click on a locked or rule-breaking option explains why instead of choosing it. */
  function pick(unlock: Unlock, reason: string | null, change: Partial<CrestDesign>) {
    if (!isUnlocked(unlock, counts)) {
      setNotice(unlockText(unlock, counts));
      return;
    }
    if (reason) {
      setNotice(`${reason} ${RULE_TEXT}`);
      return;
    }
    update(change);
  }

  async function save() {
    if (problem) {
      setSaveState({ kind: "error", text: problem });
      return;
    }
    if (!saveCrest(current)) {
      setSaveState({ kind: "error", text: "Erb se nepodařilo uložit. Povol ukládání dat v prohlížeči." });
      return;
    }
    setSavedDesign(current);
    // Next to the nickname in the leaderboards – only the parameters go to the server.
    const token = await ensurePlayer();
    const result = token ? await postJson("/api/player/crest", { token, crest: current }) : null;
    announceLeaderboardChange();
    setSaveState({
      kind: "ok",
      text: result?.ok ? "Erb je uložený. Uvidí ho i ostatní v žebříčcích." : "Erb je uložený v tomto prohlížeči.",
    });
  }

  const shareUrl = savedDesign && typeof window !== "undefined" ? `${window.location.origin}/erb?${crestToQuery(savedDesign)}` : "";

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
      {/* Preview: always in view on phones while choosing below. */}
      <div className="sticky top-16 z-10 -mx-4 flex flex-col items-center gap-2 bg-parchment/90 px-4 pt-2 pb-3 backdrop-blur lg:top-20 lg:mx-0 lg:bg-transparent lg:p-0">
        <div className="w-24 drop-shadow-lg sm:w-36 lg:w-full lg:max-w-[300px]" data-testid="crest-preview">
          <CrestSvg design={current} id="crest-preview-svg" />
        </div>
        <p className="text-xs text-muted-foreground" data-testid="crown-counts">
          Karty: {counts.cards} · koruny učenosti: 🥉 {counts.bronze} · 🥈 {counts.silver} · 🥇 {counts.gold} z {counts.total}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <p role="status" aria-live="polite" className={cn("rounded-xl px-4 py-2 text-sm", notice ? "bg-navy text-parchment" : "sr-only")} data-testid="crest-notice">
          {notice}
        </p>

        <Group title="Tvar štítu">
          {SHAPES.map((shape) => (
            <Option
              key={shape}
              label={SHAPE_NAMES[shape]}
              selected={design.shape === shape}
              unlock={UNLOCKS.shape[shape]}
              counts={counts}
              onClick={() => pick(UNLOCKS.shape[shape], null, { shape })}
            >
              <span className="block w-9">
                <CrestSvg design={{ ...DEFAULT_CREST, shape, charge: "none", motto: "" }} label="" />
              </span>
            </Option>
          ))}
        </Group>

        <Group title="Dělení štítu">
          {DIVISIONS.map((division) => (
            <Option
              key={division}
              label={DIVISION_NAMES[division]}
              selected={design.division === division}
              unlock={UNLOCKS.division[division]}
              counts={counts}
              onClick={() => pick(UNLOCKS.division[division], null, { division })}
            >
              <span className="block w-9">
                <CrestSvg design={{ ...DEFAULT_CREST, division, field: "azure", second: "or", charge: "none", motto: "" }} label="" />
              </span>
            </Option>
          ))}
        </Group>

        <Group title={design.division === "plain" ? "Barva štítu" : "Barva pole"}>
          {TINCTURES.map((t) => (
            <Swatch key={t} tincture={t} selected={design.field === t} counts={counts} onClick={() => pick(UNLOCKS.tincture[t], null, { field: t })} />
          ))}
        </Group>

        {design.division !== "plain" && (
          <Group title="Druhá barva" hint={RULE_TEXT}>
            {TINCTURES.map((t) => {
              const reason = secondProblem({ ...design, second: t });
              return (
                <Swatch
                  key={t}
                  tincture={t}
                  selected={design.second === t}
                  counts={counts}
                  reason={reason}
                  onClick={() => pick(UNLOCKS.tincture[t], reason, { second: t })}
                />
              );
            })}
          </Group>
        )}

        <Group title="Figura">
          {CHARGES.map((charge) => (
            <Option
              key={charge}
              label={CHARGE_NAMES[charge]}
              selected={design.charge === charge}
              unlock={UNLOCKS.charge[charge]}
              counts={counts}
              onClick={() => pick(UNLOCKS.charge[charge], null, { charge })}
            >
              <span className="block w-9">
                <CrestSvg design={{ ...DEFAULT_CREST, shape: "heater", charge, chargeTincture: "or", field: "azure", motto: "" }} label="" />
              </span>
            </Option>
          ))}
        </Group>

        {design.charge !== "none" && (
          <Group title="Barva figury" hint={RULE_TEXT}>
            {TINCTURES.map((t) => {
              const reason = chargeProblem({ ...design, chargeTincture: t });
              return (
                <Swatch
                  key={t}
                  tincture={t}
                  selected={design.chargeTincture === t}
                  counts={counts}
                  reason={reason}
                  onClick={() => pick(UNLOCKS.tincture[t], reason, { chargeTincture: t })}
                />
              );
            })}
          </Group>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={mottoId} className="font-heading text-2xl font-bold">
            Heslo pod štítem
          </label>
          <input
            id={mottoId}
            value={motto}
            onChange={(event) => {
              setMotto(event.target.value);
              setSaveState(null);
            }}
            maxLength={MOTTO_MAX * 2}
            placeholder="Třeba: Pravda vítězí"
            autoComplete="off"
            aria-invalid={problem !== null}
            aria-describedby={`${mottoId}-error`}
            className="min-h-11 rounded-lg border border-gold-dark/50 bg-white/70 px-3 text-base outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
          />
          <p id={`${mottoId}-error`} role="alert" className="min-h-5 text-sm text-destructive">
            {problem}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button size="lg" variant="accent" onClick={save}>
            <Save aria-hidden />
            Uložit erb
          </Button>
          <p role="status" className={cn("min-h-5 text-sm", saveState?.kind === "error" ? "text-destructive" : "text-success")}>
            {saveState?.text}
          </p>
        </div>

        {savedDesign && (
          <section aria-labelledby="crest-share-heading" className="parchment flex flex-col items-center gap-3 rounded-2xl p-5 text-center">
            <h2 id="crest-share-heading" className="font-heading text-2xl font-bold">
              Pochlub se erbem
            </h2>
            <Button variant="outline" size="lg" onClick={() => void downloadCrestPng("crest-preview-svg", "muj-erb.png")}>
              <Download aria-hidden />
              Stáhnout obrázek (PNG)
            </Button>
            <ShareButton text="Můj erb v Českém králi 🛡️ Vytvoř si vlastní erb!" url={shareUrl} />
            <a href={shareUrl} className="text-sm underline decoration-gold underline-offset-4" data-testid="crest-share-link">
              Odkaz na můj erb
            </a>
          </section>
        )}
      </div>
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="font-heading text-2xl font-bold">
        {title}
      </h2>
      {hint && (
        <details className="text-sm text-ink/85">
          <summary className="cursor-pointer font-semibold text-navy underline decoration-gold underline-offset-4">Proč nejdou některé barvy?</summary>
          <p className="mt-1">{hint}</p>
        </details>
      )}
      <div role="group" aria-label={title} className="grid grid-cols-3 gap-2 min-[420px]:grid-cols-4 sm:grid-cols-5">
        {children}
      </div>
    </section>
  );
}

function Option({
  label,
  selected,
  unlock,
  counts,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  unlock: Unlock;
  counts: CrownCounts;
  onClick: () => void;
  children: ReactNode;
}) {
  const locked = !isUnlocked(unlock, counts);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-disabled={locked || undefined}
      aria-label={locked ? `${label} – zamčeno. ${unlockText(unlock, counts)}` : label}
      data-locked={locked || undefined}
      className={cn(
        "relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border border-gold-dark/30 bg-white/50 p-1.5 text-center text-xs leading-tight outline-none focus-visible:ring-4 focus-visible:ring-ring/60",
        selected && "border-2 border-navy bg-gold/20 font-semibold",
        locked && "opacity-60",
      )}
    >
      <span className={cn("flex justify-center", locked && "grayscale")}>{children}</span>
      <span>{label}</span>
      {locked && (
        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gold-dark">
          <Lock className="size-3" aria-hidden />
          {shortLock(unlock)}
        </span>
      )}
    </button>
  );
}

function Swatch({
  tincture,
  selected,
  counts,
  reason = null,
  onClick,
}: {
  tincture: Tincture;
  selected: boolean;
  counts: CrownCounts;
  reason?: string | null;
  onClick: () => void;
}) {
  const unlock = UNLOCKS.tincture[tincture];
  const locked = !isUnlocked(unlock, counts);
  const name = TINCTURE_NAMES[tincture];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-disabled={locked || reason !== null || undefined}
      aria-label={locked ? `${name} – zamčeno. ${unlockText(unlock, counts)}` : reason ? `${name} – nejde: ${reason}` : name}
      data-locked={locked || undefined}
      data-rule={reason ? "broken" : undefined}
      className={cn(
        "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-gold-dark/30 bg-white/50 p-1.5 text-xs outline-none focus-visible:ring-4 focus-visible:ring-ring/60",
        selected && "border-2 border-navy bg-gold/20 font-semibold",
        (locked || reason) && "opacity-50",
      )}
    >
      <span
        aria-hidden
        className="size-7 rounded-full ring-2 ring-ink/30"
        style={
          tincture === "ermine"
            ? { background: "radial-gradient(circle at 30% 35%, #1b1b1b 2px, transparent 3px), radial-gradient(circle at 70% 65%, #1b1b1b 2px, transparent 3px), #f4f1ea" }
            : { background: TINCTURE_COLORS[tincture] }
        }
      />
      <span>{name}</span>
      {locked ? (
        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gold-dark">
          <Lock className="size-3" aria-hidden />
          {shortLock(unlock)}
        </span>
      ) : (
        reason && <span aria-hidden className="text-[10px] font-semibold text-destructive">✗ pravidlo</span>
      )}
    </button>
  );
}
