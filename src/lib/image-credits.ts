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

export const imageCredits: ImageCredit[] = [
  {
    kingSlug: "premysl-otakar-ii",
    kingName: "Přemysl Otakar II.",
    title:
      "Jezdecká pečeť (1273), kresba z díla Die Siegel der österreichischen Regenten",
    author: "Karl von Sava",
    year: "1864",
    license: "Volné dílo (public domain, PD-old)",
    commonsUrl: "https://commons.wikimedia.org/wiki/File:PO2_1273.jpg",
    localPath: "/kings/premysl-otakar-ii.webp",
  },
  {
    kingSlug: "karel-iv",
    kingName: "Karel IV.",
    title:
      "Karel IV. klečící před Madonou – výřez z votivního obrazu arcibiskupa Jana Očka z Vlašimi",
    author: "Okruh Mistra Theodorika",
    year: "kolem 1370",
    license: "Volné dílo (public domain, PD-Art / PD-old-100)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Charles_IV_kneeling_before_Madonna-Votive_picture_of_archbishop_Jan_Ocko.jpg",
    localPath: "/kings/karel-iv.webp",
  },
  {
    kingSlug: "marie-terezie",
    kingName: "Marie Terezie",
    title: "Mladá císařovna Marie Terezie (kresba)",
    author: "Martin van Meytens",
    year: "kolem 1741",
    license: "Volné dílo (public domain, PD-Art / PD-old)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Meytens-Young_Empress_Maria_Theresia.jpg",
    localPath: "/kings/marie-terezie.webp",
  },
];

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
