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
    kingSlug: "libuse",
    kingName: "Libuše",
    title:
      "Libuše – obraz, výřez",
    author: "Karel Vítězslav Mašek",
    year: "1893",
    license: "Volné dílo (public domain, PD-old)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%9B%D0%B8%D0%B1%D1%83%D1%88%D0%B5.jpg",
    localPath: "/kings/libuse.webp",
  },
  {
    kingSlug: "svaty-vaclav",
    kingName: "Svatý Václav",
    title:
      "Iluminace z Gumpoldovy legendy o sv. Václavu – Wolfenbüttelský kodex (Herzog August Bibliothek, Cod. Guelf. 11.2 Aug. 4°), fol. 18v, výřez",
    author: "Neznámý autor",
    year: "před rokem 1006",
    license: "Volné dílo (public domain, PD-old)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Wolfenb%C3%BCttelsk%C3%BD_kodex_%E2%80%93_Gumpoldova_legenda_%E2%80%93_18v_cr.jpg",
    localPath: "/kings/svaty-vaclav.webp",
  },
  {
    kingSlug: "premysl-otakar-i",
    kingName: "Přemysl Otakar I.",
    title: "Jezdecká pečeť (1192–1193), avers – kresba",
    author: "August Sedláček",
    year: "19.–20. století",
    license: "Volné dílo (public domain, PD-old)",
    commonsUrl: "https://commons.wikimedia.org/wiki/File:PO1_jezdecka.jpg",
    localPath: "/kings/premysl-otakar-i.webp",
  },
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
    kingSlug: "vaclav-ii",
    kingName: "Václav II.",
    title:
      "König Wenzel von Böhmen – miniatura z Codexu Manesse (Cod. Pal. germ. 848, fol. 10r), výřez",
    author: "Mistr Codexu Manesse (Nachtragsmaler I)",
    year: "1305–1340",
    license: "Volné dílo (public domain, PD-old-100)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Codex_Manesse_Wenzel_II._von_B%C3%B6hmen.jpg",
    localPath: "/kings/vaclav-ii.webp",
  },
  {
    kingSlug: "jan-lucembursky",
    kingName: "Jan Lucemburský",
    title:
      "Jezdecká pečeť – fotografie z díla Die Siegel der deutschen Kaiser und Könige",
    author: "Otto Posse",
    year: "1909",
    license: "Volné dílo (public domain, PD-old)",
    commonsUrl: "https://commons.wikimedia.org/wiki/File:HonzikLucpecetjezdec.jpg",
    localPath: "/kings/jan-lucembursky.webp",
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
    kingSlug: "jiri-z-podebrad",
    kingName: "Jiří z Poděbrad",
    title:
      "Dřevořez z Kroniky o založení země české",
    author: "Martin Kuthen ze Šprinsberku",
    year: "1539",
    license: "Volné dílo (public domain, PD-old-100)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Martin_Kuthen-George_of_Podebrady.jpg",
    localPath: "/kings/jiri-z-podebrad.webp",
  },
  {
    kingSlug: "rudolf-ii",
    kingName: "Rudolf II.",
    title:
      "Portrét císaře Rudolfa II., výřez",
    author: "Hans von Aachen",
    year: "1606–1608",
    license: "Volné dílo (public domain, PD-Art / PD-old-100)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Hans_von_Aachen_-_Portrait_of_Emperor_Rudolf_II.jpg",
    localPath: "/kings/rudolf-ii.webp",
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
  {
    kingSlug: "josef-ii",
    kingName: "Josef II.",
    title:
      "Portrét císaře Josefa II., výřez",
    author: "Anton von Maron",
    year: "60. léta 18. století",
    license: "Volné dílo (public domain, PD-Art / PD-old)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Anton_von_Maron_-_Portrait_of_Emperor_Joseph_II_-_WGA14128.jpg",
    localPath: "/kings/josef-ii.webp",
  },
  {
    kingSlug: "karel-i",
    kingName: "Karel I.",
    title:
      "Portrétní fotografie (George Grantham Bain Collection, Library of Congress)",
    author: "Ernst Förster",
    year: "1917",
    license: "Volné dílo (public domain, PD-Bain / PD-old)",
    commonsUrl:
      "https://commons.wikimedia.org/wiki/File:Karl_of_Austria_LCCN2014711078.jpg",
    localPath: "/kings/karel-i.webp",
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
