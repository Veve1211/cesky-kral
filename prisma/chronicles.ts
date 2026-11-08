// Chronicle content ("Kronika panovníka"), keyed by king slug.
// Content is provided by the project owner – do NOT change facts or wording
// without the owner's approval.
//
// Each fact continues the heading "Věděli jste, že…".
// A slug that is not (yet) in the seed's king list is skipped by the seed.

export type SeedChronicle = {
  intro: string;
  facts: string[];
  sources: { label: string; url: string }[];
};

export const chronicles: Record<string, SeedChronicle> = {
  libuse: {
    intro:
      "Podle pověsti byla nejmladší a nejmoudřejší ze tří dcer vládce Kroka a uměla věštit budoucnost. Sídlila na Vyšehradě, na skále nad Vltavou. Když jí jeden muž ve sporu vyčetl, že je hanba, aby nad muži vládla žena, oznámila, že si vezme za manžela oráče Přemysla, a z jejich rodu vzešli Přemyslovci.",
    facts: [
      "poslové našli Přemysla tak, že šli za Libušiným bílým koněm až na pole ve Stadicích?",
      "Přemyslova lísková hůl zaražená do země se podle pověsti zazelenala a vyrašily z ní tři větve?",
      "slavnou větu „Vidím město veliké, jehož sláva hvězd se dotýká“ jí vložil do úst kronikář Kosmas a vypůjčil si ji z Vergiliovy Aeneidy?",
      "Národní divadlo bylo otevřeno Smetanovou operou Libuše?",
      "pověst zná většina Čechů ze Starých pověstí českých, které Alois Jirásek napsal v roce 1894?",
    ],
    sources: [
      { label: "Prague.eu", url: "https://prague.eu/en/about-libuse-and-premysl/" },
      { label: "Radio Prague", url: "https://english.radio.cz/node/8091287" },
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Ancient_Bohemian_Legends" },
    ],
  },
  "svaty-vaclav": {
    intro:
      "Narodil se kolem roku 907 a od roku 921 vládl jako český kníže. Vychovávala ho babička Ludmila, kterou dali zavraždit na hradě Tetín. Václav byl zavražděn ve Staré Boleslavi nejspíš roku 935 a podle legendy za tím stál jeho bratr Boleslav. Brzy po smrti začal být uctíván jako světec a patron české země.",
    facts: [
      "za života nebyl králem? Královskou hodnost mu udělil až po smrti císař Ota I.",
      "na Pražském hradě založil rotundu svatého Víta, ze které později vyrostla katedrála?",
      "jeho matka Drahomíra vládla jako regentka, ale šlechta ji nakonec vyhnala?",
      "Angličané o něm zpívají vánoční koledu Good King Wenceslas z roku 1853?",
      "jeho svátek 28. září slavíme od roku 2000 jako Den české státnosti?",
    ],
    sources: [
      {
        label: "Wikipedie",
        url: "https://en.wikipedia.org/wiki/Wenceslaus_I,_Duke_of_Bohemia",
      },
    ],
  },
  "premysl-otakar-i": {
    intro:
      "Narodil se kolem roku 1155 jako syn knížete Vladislava II. Roku 1197 donutil svého bratra, aby se vzdal Čech a spokojil se s Moravou, a o rok později se prohlásil králem. Jeho největším úspěchem byla Zlatá bula sicilská, která udělala z českého královského titulu dědičný. Zemřel 15. prosince 1230 v Praze.",
    facts: [
      "byl prvním dědičným českým králem, takže korunu po něm mohli zdědit i jeho potomci?",
      "Zlatou bulu sicilskou vydal 26. září 1212 v Basileji Fridrich II., tehdy sicilský král?",
      "český král musel podle buly poskytnout císaři na cestu ke korunovaci do Říma doprovod 300 rytířů?",
      "bula je uložena v Národním archivu v Praze a k 800. výročí byla vystavena jen na čtyři dny?",
      "jeho dcerou byla svatá Anežka Česká?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Ottokar_I_of_Bohemia" },
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Golden_Bull_of_Sicily" },
    ],
  },
  "premysl-otakar-ii": {
    intro:
      "Syn krále Václava I. nastoupil na český trůn v roce 1253. Sňatkem s Markétou Babenberskou upevnil nárok na Rakousy a později získal i Korutany a Kraňsko, takže jeho panství sahalo od Krkonoš až na území dnešního Slovinska. Pro bohatství a vojenskou sílu mu říkali král železný a zlatý. Padl 26. srpna 1278 v bitvě na Moravském poli.",
    facts: [
      "založil asi 30 nových měst, mezi nimi i České Budějovice?",
      "v roce 1273 kurfiřti místo něj zvolili římským králem „malého hraběte“ Rudolfa Habsburského?",
      "právě s Rudolfem pak svedl osudnou bitvu na Moravském poli u Dürnkrutu v dnešním Rakousku?",
      "jeho synovi a nástupci Václavu II. bylo v době otcovy smrti teprve sedm let?",
      "jeho jezdecká pečeť z roku 1273 je i obrázkem jeho karty v této hře?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Ottokar_II_of_Bohemia" },
      {
        label: "ČT24",
        url: "https://ct24.ceskatelevize.cz/clanek/regiony/v-ceskych-budejovicich-by-chtel-zit-kazdy-uz-750-let-135932",
      },
    ],
  },
};
