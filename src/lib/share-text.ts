// Share texts shown after a game – Wordle style: score and one icon per
// question (👑 right, ⚔️ wrong). Never contains questions or answers.

export function shareIcons(marks: readonly boolean[]): string {
  return marks.map((ok) => (ok ? "👑" : "⚔️")).join("");
}

/** "Český král 👑 Rychlovka 7/10" + a line of icons. */
export function quickShareText(marks: readonly boolean[]): string {
  const score = marks.filter(Boolean).length;
  return `Český král 👑 Rychlovka ${score}/${marks.length}\n${shareIcons(marks)}`;
}
