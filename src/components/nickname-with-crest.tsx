import { CrestSvg } from "@/components/crest-svg";
import type { BoardEntry } from "@/lib/leaderboard";

/** Nickname in a leaderboard row, with the player's small coat of arms when they have one. */
export function NicknameWithCrest({ entry }: { entry: BoardEntry }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2 font-semibold">
      {entry.crest ? (
        <span className="w-6 shrink-0" data-testid="board-crest">
          <CrestSvg design={entry.crest} withMotto={false} label={`Erb hráče ${entry.nickname}`} />
        </span>
      ) : (
        <span aria-hidden className="w-6 shrink-0" />
      )}
      <span className="truncate">{entry.nickname}</span>
    </span>
  );
}
