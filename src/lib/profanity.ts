// Filter of vulgar and offensive words (Czech first, common English too) for
// nicknames and other short texts players type. Pure – shared by server,
// client and tests. The server always checks again; the client only gives
// faster feedback.
//
// How it works: the text is normalized (lowercase, no diacritics, leetspeak
// digits to letters, only a–z left, repeated letters collapsed), so
// "K0KÔŤ", "k.o.k.o.t" and "kokoooot" all become "kokot". Then it must not
// contain any of the stems below (also normalized the same way). Stems are
// chosen long and specific enough to keep false positives rare.

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  $: "s",
  "!": "i",
  "€": "e",
};

/** Lowercase a–z only, no diacritics, leetspeak decoded. */
function plainForFilter(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[0-9@$!€]/g, (char) => LEET[char] ?? char)
    .replace(/[^a-z]/g, "");
}

/** Like plainForFilter, plus repeated letters collapsed ("kokoooot" → "kokot"). */
export function normalizeForFilter(text: string): string {
  return plainForFilter(text).replace(/(.)\1+/g, "$1");
}

// Substring stems (normalized). Vulgarities, insults, slurs and hate symbols.
// Not here (too many innocent words contain them): "pice" (opice), "cock"
// (Hitchcock), "fag" (fagot), "rape" (grapefruit), "nig" (knight).
const STEMS = [
  // Czech vulgarities and insults
  "kurv", "kurev", "kokot", "curak", "cural", "pica", "picus", "picovi", "picovin",
  "kunda", "mrdat", "mrdk", "mrdal", "mrdni", "zmrd", "jebat", "jebal", "jebn", "jebk", "vyjeb", "pojeb", "rozjeb",
  "sukat", "sukal", "hovno", "hovna", "hovad", "sracka", "sracky", "srat", "sral", "posra", "vysra", "prdel", "prdl",
  "chcat", "chcan", "chcip", "hajzl", "hajzel", "kreten", "debil", "idiot", "blbec", "blbka",
  "magor", "dement", "retard", "svine", "svinak", "zasran", "devka", "stetka",
  "penis", "vagin", "porno", "prcat", "prcal", "onanov",
  // slurs and hate
  "buzna", "buzik", "buzerant", "teplous", "negr", "niga", "nigr", "niger", "cigos", "cikan", "zidak",
  "hitler", "nacist", "fasist", "heil", "hakenkreuz",
  // English
  "fuck", "shit", "bitch", "cunt", "pusy", "whore", "slut", "porn", "sex", "nazi", "asshole", "bastard",
];

// Short words that are offensive on their own but too short to search inside other words.
const EXACT = new Set(["kkt", "pic", "bzn", "kkk", "ass", "wtf", "dick", "fag", "fuk", "cock", "rape"]);

const NORMALIZED_STEMS = [...new Set(STEMS.map(normalizeForFilter))];

/** True when the text contains a vulgar or offensive word. */
export function containsProfanity(text: string): boolean {
  const normalized = normalizeForFilter(text);
  if (NORMALIZED_STEMS.some((stem) => normalized.includes(stem))) return true;
  // Whole words only for the short ones (and the whole text without separators).
  const words = text.split(/[\s._-]+/).map(plainForFilter).filter(Boolean);
  return [...words, plainForFilter(text)].some((word) => EXACT.has(word));
}
