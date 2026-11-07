// Credits for images and fonts shown on /zdroje.
// Add an image ONLY after its license was verified on the Commons file page.

export type ImageCredit = {
  kingSlug: string;
  kingName: string;
  title: string;
  author: string;
  year: string;
  license: string;
  commonsUrl: string;
  localPath: string;
};

export const imageCredits: ImageCredit[] = [];

export type FontCredit = {
  name: string;
  usage: string;
  license: string;
  url: string;
};

export const fontCredits: FontCredit[] = [
  {
    name: "Grenze Gotisch",
    usage: "nadpisy",
    license: "SIL Open Font License 1.1",
    url: "https://fonts.google.com/specimen/Grenze+Gotisch",
  },
  {
    name: "Uncial Antiqua",
    usage: "ozdobné iniciály a erby",
    license: "SIL Open Font License 1.1",
    url: "https://fonts.google.com/specimen/Uncial+Antiqua",
  },
  {
    name: "Inter",
    usage: "běžný text",
    license: "SIL Open Font License 1.1",
    url: "https://fonts.google.com/specimen/Inter",
  },
];
