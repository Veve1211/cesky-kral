// Placeholder data for the app skeleton.
// These are NOT real historical facts. Real kings, questions and answers
// will come from prisma/seed.ts once the database is connected.

export type DemoKing = {
  slug: string;
  name: string;
  initial: string;
  subtitle: string;
  collected: boolean;
};

export const demoKings: DemoKing[] = [
  {
    slug: "ukazka-1",
    name: "Ukázkový král I.",
    initial: "A",
    subtitle: "Data doplníme ze seedu",
    collected: true,
  },
  {
    slug: "ukazka-2",
    name: "Ukázkový král II.",
    initial: "B",
    subtitle: "Data doplníme ze seedu",
    collected: false,
  },
  {
    slug: "ukazka-3",
    name: "Ukázkový král III.",
    initial: "C",
    subtitle: "Data doplníme ze seedu",
    collected: false,
  },
];

export function getDemoKing(slug: string): DemoKing | undefined {
  return demoKings.find((king) => king.slug === slug);
}
