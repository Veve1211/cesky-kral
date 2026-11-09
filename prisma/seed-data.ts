// Seed content for Český král (kings and their questions).
// Content is provided by the project owner – do NOT change facts here
// without the owner's approval.
//
// Plain data with no side effects: imported by prisma/seed.ts and by the
// E2E tests (e2e/helpers/seed-answers.ts), which need the correct answers.

export type Difficulty = 1 | 2 | 3; // 1 easy, 2 medium, 3 hard

export type SeedQuestion = {
  difficulty: Difficulty;
  text: string;
  correct: string;
  wrong: [string, string];
  explanation: string;
  sourceUrl?: string; // falls back to the king's source
};

export type SeedKing = {
  name: string;
  slug: string;
  reignFrom: number | null; // null for legendary figures
  reignTo: number | null;
  title: "kníže" | "kněžna" | "král" | "královna";
  isLegend: boolean;
  dynasty: string;
  shortBio: string;
  order: number;
  imageUrl: string | null; // public-domain portrait (see /zdroje), null = crest
  sourceUrl: string;
  questions: SeedQuestion[];
};

export const kings: SeedKing[] = [
  {
    name: "Libuše",
    slug: "libuse",
    reignFrom: null,
    reignTo: null,
    title: "kněžna",
    isLegend: true,
    dynasty: "Pověst o Přemyslovcích",
    shortBio:
      "Pověstná kněžna a věštkyně, která předpověděla slávu Prahy.",
    order: 1,
    imageUrl: "/kings/libuse.webp",
    sourceUrl: "https://prague.eu/en/about-libuse-and-premysl/",
    questions: [
      {
        difficulty: 1,
        text: "Na kterém hradě podle pověsti Libuše sídlila?",
        correct: "Na Vyšehradě",
        wrong: ["Na Karlštejně", "Na Křivoklátě"],
        explanation:
          "Vyšehrad stojí na vysoké skále nad Vltavou.",
      },
      {
        difficulty: 1,
        text: "Koho si Libuše podle pověsti vybrala za manžela?",
        correct: "Přemysla Oráče",
        wrong: ["Kroka", "Praotce Čecha"],
        explanation:
          "Přemysl právě oral pole se dvěma voly, když pro něj poslové přišli.",
      },
      {
        difficulty: 1,
        text: "Kdo byl podle pověsti Libušin otec?",
        correct: "Krok",
        wrong: ["Praotec Čech", "Přemysl"],
        explanation:
          "Libuše byla nejmladší a nejmoudřejší ze tří Krokových dcer.",
      },
      {
        difficulty: 2,
        text: "Jak se jmenovaly Libušiny sestry?",
        correct: "Kazi a Teta",
        wrong: ["Ludmila a Drahomíra", "Eliška a Jitka"],
        explanation:
          "Libuše byla z nich nejmladší a uměla věštit budoucnost.",
      },
      {
        difficulty: 2,
        text: "Z které vesnice podle pověsti pocházel Přemysl?",
        correct: "Ze Stadic",
        wrong: ["Z Poděbrad", "Z Kutné Hory"],
        explanation:
          "Libuše poslům řekla, kde Přemysla najdou.",
      },
      {
        difficulty: 2,
        text: "Jak poslové Přemysla našli?",
        correct: "Šli za Libušiným bílým koněm",
        wrong: ["Podle mapy", "Přemysl přišel na Vyšehrad sám"],
        explanation:
          "Kůň je dovedl až k poli, kde Přemysl oral.",
      },
      {
        difficulty: 3,
        text: "Co se podle pověsti stalo s Přemyslovou lískovou holí, když ji zarazil do země?",
        correct: "Zazelenala se a vyrašily z ní tři větve",
        wrong: ["Zlomila se", "Proměnila se ve zlaté žezlo"],
        explanation:
          "Bylo to zázračné znamení, že Přemysl má vládnout.",
      },
      {
        difficulty: 3,
        text: "Kdo Libušino proroctví o Praze poprvé zapsal?",
        correct: "Kronikář Kosmas",
        wrong: ["Alois Jirásek", "Karel IV."],
        explanation:
          "Větu „Vidím město veliké, jehož sláva hvězd se dotýká“ jí vložil do úst Kosmas, inspiroval se Vergiliovou Aeneidou.",
        sourceUrl: "https://english.radio.cz/node/8091287",
      },
      {
        difficulty: 3,
        text: "Kterou operou bylo otevřeno Národní divadlo?",
        correct: "Smetanovou Libuší",
        wrong: ["Dvořákovou Rusalkou", "Smetanovou Prodanou nevěstou"],
        explanation:
          "Libuše je naše nejslavnostnější opera, její fanfáry zní při slavnostních příležitostech.",
        sourceUrl: "https://english.radio.cz/node/8091287",
      },
    ],
  },
  {
    name: "Svatý Václav",
    slug: "svaty-vaclav",
    reignFrom: 921,
    reignTo: 935,
    title: "kníže",
    isLegend: false,
    dynasty: "Přemyslovci",
    shortBio:
      "Kníže a patron české země, kterému se po smrti začalo říkat král.",
    order: 2,
    imageUrl: "/kings/svaty-vaclav.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/Wenceslaus_I,_Duke_of_Bohemia",
    questions: [
      {
        difficulty: 1,
        text: "Jaký titul svatý Václav za života skutečně měl?",
        correct: "Kníže",
        wrong: ["Císař", "Papež"],
        explanation:
          "Králem ho prohlásili až po smrti.",
      },
      {
        difficulty: 1,
        text: "Kdo podle legendy svatého Václava zavraždil?",
        correct: "Jeho bratr Boleslav",
        wrong: ["Jeho matka Drahomíra", "Císař Ota I."],
        explanation:
          "Bratrovi se proto říká Boleslav Ukrutný.",
      },
      {
        difficulty: 1,
        text: "Který státní svátek slavíme 28. září, na svátek svatého Václava?",
        correct: "Den české státnosti",
        wrong: ["Den vzniku samostatného československého státu", "Den boje za svobodu a demokracii"],
        explanation:
          "Jako státní svátek se slaví od roku 2000.",
      },
      {
        difficulty: 2,
        text: "Kdo byla Václavova babička, také uctívaná jako svatá?",
        correct: "Ludmila",
        wrong: ["Drahomíra", "Libuše"],
        explanation:
          "Ludmilu zavraždili v roce 921 na hradě Tetín u Berouna.",
      },
      {
        difficulty: 2,
        text: "Co Václav založil na Pražském hradě?",
        correct: "Rotundu svatého Víta",
        wrong: ["Zlatou uličku", "Vladislavský sál"],
        explanation:
          "Z rotundy později vyrostla katedrála svatého Víta.",
      },
      {
        difficulty: 2,
        text: "Kde byl Václav zavražděn?",
        correct: "Ve Staré Boleslavi",
        wrong: ["Na Vyšehradě", "Na Tetíně"],
        explanation:
          "Stalo se to nejspíš v roce 935, některé zdroje uvádějí 929.",
      },
      {
        difficulty: 3,
        text: "Kdo Václavovi po smrti udělil královskou hodnost?",
        correct: "Císař Ota I.",
        wrong: ["Papež", "Karel IV."],
        explanation:
          "Proto mu legendy a písně říkají král.",
      },
      {
        difficulty: 3,
        text: "Jak se jmenuje anglická vánoční koleda o Václavovi?",
        correct: "Good King Wenceslas",
        wrong: ["Silent Night", "Jingle Bells"],
        explanation:
          "Vydal ji John Mason Neale v roce 1853.",
      },
      {
        difficulty: 3,
        text: "Kdo byla Václavova matka, která po Ludmilině smrti vládla jako regentka?",
        correct: "Drahomíra",
        wrong: ["Ludmila", "Jitka"],
        explanation:
          "Vystupovala proti křesťanům, šlechta ji nakonec vyhnala.",
      },
    ],
  },
  {
    name: "Přemysl Otakar I.",
    slug: "premysl-otakar-i",
    reignFrom: 1198,
    reignTo: 1230,
    dynasty: "Přemyslovci",
    shortBio:
      "První dědičný český král, kterému dědičnost potvrdila Zlatá bula sicilská.",
    order: 4,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/premysl-otakar-i.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/Ottokar_I_of_Bohemia",
    questions: [
      {
        difficulty: 1,
        text: "Čím byl Přemysl Otakar I. výjimečný?",
        correct: "Byl prvním dědičným českým králem",
        wrong: ["Byl posledním Přemyslovcem", "Byl prvním římským císařem z Čech"],
        explanation: "Královský titul mohli po něm zdědit i jeho potomci.",
      },
      {
        difficulty: 1,
        text: "Který dokument potvrdil, že královský titul bude dědičný?",
        correct: "Zlatá bula sicilská",
        wrong: ["Zlatá bula Karla IV.", "Majestát Rudolfa II."],
        explanation: "Vydal ji Fridrich II. roku 1212.",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Bull_of_Sicily",
      },
      {
        difficulty: 1,
        text: "Která světice byla dcerou Přemysla Otakara I.?",
        correct: "Svatá Anežka Česká",
        wrong: ["Svatá Ludmila", "Svatá Zdislava"],
        explanation: "Na trůně ho vystřídal jeho syn Václav I.",
      },
      {
        difficulty: 2,
        text: "Ve kterém roce se Přemysl Otakar I. prohlásil králem?",
        correct: "1198",
        wrong: ["1212", "1230"],
        explanation: "Korunován byl v Mohuči.",
      },
      {
        difficulty: 2,
        text: "Kdo vydal Zlatou bulu sicilskou?",
        correct: "Fridrich II., tehdy sicilský král",
        wrong: ["Karel IV.", "Rudolf Habsburský"],
        explanation: "Vydal ji 26. září 1212 v Basileji.",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Bull_of_Sicily",
      },
      {
        difficulty: 2,
        text: "Kde je Zlatá bula sicilská uložena dnes?",
        correct: "V Národním archivu v Praze",
        wrong: ["Ve Vatikánu", "Na Sicílii"],
        explanation: "K 800. výročí byla v září 2012 na čtyři dny vystavena.",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Bull_of_Sicily",
      },
      {
        difficulty: 3,
        text: "Kolik rytířů musel český král podle Zlaté buly sicilské poskytnout císaři na cestu ke korunovaci do Říma?",
        correct: "300",
        wrong: ["30", "3 000"],
        explanation: "Šlo o ozbrojený doprovod císaře.",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Bull_of_Sicily",
      },
      {
        difficulty: 3,
        text: "Na které říšské sněmy musel český král podle Zlaté buly sicilské jezdit?",
        correct: "Jen na ty, které se konaly blízko českých hranic",
        wrong: ["Na všechny", "Na žádné"],
        explanation: "Byla to jedna z výsad, které bula českým králům zaručila.",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Bull_of_Sicily",
      },
      {
        difficulty: 3,
        text: "Kdo byla druhá manželka Přemysla Otakara I.?",
        correct: "Konstancie Uherská",
        wrong: ["Adléta Míšeňská", "Jitka Durynská"],
        explanation:
          "S Adlétou Míšeňskou se rozvedl roku 1199 a téhož roku se oženil s Konstancií. Jitka Durynská byla jeho matka.",
      },
    ],
  },
  {
    name: "Přemysl Otakar II.",
    slug: "premysl-otakar-ii",
    reignFrom: 1253,
    reignTo: 1278,
    dynasty: "Přemyslovci",
    shortBio:
      "Král železný a zlatý, jehož říše sahala od Krkonoš až po Jadran.",
    order: 5,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/premysl-otakar-ii.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/Ottokar_II_of_Bohemia",
    questions: [
      {
        difficulty: 1,
        text: "Jakou přezdívku Přemysl Otakar II. měl?",
        correct: "Král železný a zlatý",
        wrong: ["Otec vlasti", "Král dobrý"],
        explanation:
          "Přezdívku získal díky bohatství své říše a vojenské síle.",
      },
      {
        difficulty: 1,
        text: "Kdo byl jeho otec?",
        correct: "Václav I.",
        wrong: ["Václav II.", "Vladislav II."],
        explanation:
          "Na trůn nastoupil v roce 1253 po smrti svého otce Václava I.",
      },
      {
        difficulty: 1,
        text: "Ve které bitvě v roce 1278 padl?",
        correct: "Na Moravském poli",
        wrong: ["Na Bílé hoře", "U Kresčaku"],
        explanation:
          "Bitva na Moravském poli 26. srpna 1278 skončila jeho porážkou a smrtí.",
      },
      {
        difficulty: 2,
        text: "Kdo byl jeho protivníkem na Moravském poli?",
        correct: "Rudolf Habsburský",
        wrong: ["Fridrich II. Pruský", "Jan Lucemburský"],
        explanation:
          "Rudolf Habsburský, zvolený římský král, mu upíral rakouské země.",
      },
      {
        difficulty: 2,
        text: "Které město Přemysl Otakar II. založil roku 1265?",
        correct: "České Budějovice",
        wrong: ["Plzeň", "Kutná Hora"],
        explanation:
          "České Budějovice slavily 750 let od založení v roce 2015.",
        sourceUrl:
          "https://ct24.ceskatelevize.cz/clanek/regiony/v-ceskych-budejovicich-by-chtel-zit-kazdy-uz-750-let-135932",
      },
      {
        difficulty: 2,
        text: "S kým se Přemysl Otakar II. oženil, aby upevnil nárok na Rakousy?",
        correct: "S Markétou Babenberskou",
        wrong: ["S Kunhutou Uherskou", "S Eliškou Přemyslovnou"],
        explanation:
          "Markéta byla sestrou zesnulého rakouského vévody Fridricha II. Babenberského.",
      },
      {
        difficulty: 3,
        text: "Kolik nových měst Přemysl Otakar II. přibližně založil?",
        correct: "Asi 30",
        wrong: ["Asi 5", "Asi 100"],
        explanation:
          "Jedním z nich jsou i České Budějovice.",
      },
      {
        difficulty: 3,
        text: "Po kom Přemysl Otakar II. převzal Korutany a Kraňsko?",
        correct: "Po Oldřichu III. Sponheimském",
        wrong: ["Po Fridrichu II. Babenberském", "Po Rudolfu Habsburském"],
        explanation:
          "Jeho panství tak sahalo od Krkonoš až na území dnešního Slovinska.",
      },
      {
        difficulty: 3,
        text: "Proč se Přemysl Otakar II. v roce 1273 nestal římským králem?",
        correct: "Kurfiřti zvolili Rudolfa Habsburského",
        wrong: ["Sám odmítl kandidovat", "Zemřel ještě před volbou"],
        explanation:
          "Spor s Rudolfem pak skončil Otakarovou smrtí na Moravském poli.",
      },
    ],
  },
  {
    name: "Václav II.",
    slug: "vaclav-ii",
    reignFrom: 1278,
    reignTo: 1305,
    dynasty: "Přemyslovci",
    shortBio:
      "Král stříbra, který dal Čechám pražský groš a získal polskou korunu.",
    order: 6,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/vaclav-ii.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/Wenceslaus_II_of_Bohemia",
    questions: [
      {
        difficulty: 1,
        text: "Kdo byl otcem Václava II.?",
        correct: "Přemysl Otakar II.",
        wrong: ["Karel IV.", "Jan Lucemburský"],
        explanation:
          "Byl jediným přeživším manželským synem Přemysla Otakara II.; jeho nevlastní bratr Mikuláš Opavský byl nemanželským synem téhož krále.",
        sourceUrl: "https://www.opava-city.cz/cz/mesto-urad/o-meste/osobnosti/vladci/mikulas-vevoda-opavsky.html",
      },
      {
        difficulty: 1,
        text: "Kterou minci začal Václav II. razit?",
        correct: "Pražský groš",
        wrong: ["Tolar", "Dukát"],
        explanation:
          "Těžbu stříbra udělal královským monopolem a ze stříbra razil pražské groše.",
      },
      {
        difficulty: 1,
        text: "Kterou další královskou korunu získal Václav II. roku 1300?",
        correct: "Polskou",
        wrong: ["Uherskou", "Francouzskou"],
        explanation:
          "V roce 1300 se nechal korunovat polským králem.",
      },
      {
        difficulty: 2,
        text: "Kdo podle pramenů věznil malého Václava, když za něj vládl?",
        correct: "Ota Braniborský",
        wrong: ["Rudolf Habsburský", "Záviš z Falkenštejna"],
        explanation:
          "Po smrti Přemysla Otakara II. převzal správu země braniborský markrabě Ota V.",
      },
      {
        difficulty: 2,
        text: "Ve kterém roce se Václav II. vrátil do Čech a začal vládnout bez regenta?",
        correct: "1283",
        wrong: ["1278", "1300"],
        explanation:
          "Bylo mu tehdy teprve dvanáct let.",
      },
      {
        difficulty: 2,
        text: "Co vydal Václav II. roku 1300?",
        correct: "Horní zákoník Ius regale montanorum",
        wrong: ["Zlatou bulu", "Pragmatickou sankci"],
        explanation:
          "Nový královský horní zákoník upravoval těžbu stříbra.",
      },
      {
        difficulty: 3,
        text: "Proč dal Václav II. roku 1290 popravit Záviše z Falkenštejna?",
        correct: "Kvůli údajné zradě",
        wrong: ["Kvůli prohrané bitvě", "Kvůli nesplaceným dluhům"],
        explanation:
          "Záviš byl partnerem Václavovy matky. Po jeho popravě začal Václav vládnout samostatně.",
      },
      {
        difficulty: 3,
        text: "Kdo byla první manželka Václava II.?",
        correct: "Jitka Habsburská",
        wrong: ["Eliška Přemyslovna", "Markéta Babenberská"],
        explanation:
          "Jitka byla dcerou Rudolfa Habsburského, tedy muže, který porazil Václavova otce. Eliška Přemyslovna byla Václavova dcera.",
      },
      {
        difficulty: 3,
        text: "Kterou korunu získal Václav II. roku 1301 pro svého syna Václava III.?",
        correct: "Uherskou",
        wrong: ["Polskou", "Rakouskou"],
        explanation:
          "Václav III. byl korunován uherským králem 27. srpna 1301 v Székesfehérváru.",
      },
    ],
  },
  {
    name: "Jan Lucemburský",
    slug: "jan-lucembursky",
    reignFrom: 1310,
    reignTo: 1346,
    dynasty: "Lucemburkové",
    shortBio:
      "Rytíř a cestovatel na českém trůně, který slepý padl v bitvě u Kresčaku.",
    order: 7,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/jan-lucembursky.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/John_of_Bohemia",
    questions: [
      {
        difficulty: 1,
        text: "Ve které bitvě padl Jan Lucemburský?",
        correct: "U Kresčaku",
        wrong: ["Na Moravském poli", "Na Bílé hoře"],
        explanation:
          "Padl 26. srpna 1346 v bitvě proti anglickému vojsku.",
      },
      {
        difficulty: 1,
        text: "Jakou přezdívku Jan Lucemburský má?",
        correct: "Slepý",
        wrong: ["Železný a zlatý", "Otec vlasti"],
        explanation:
          "Zrak ztrácel postupně a v závěru života už byl zcela slepý.",
        sourceUrl: "https://dvojka.rozhlas.cz/120-schuzka-soukroma-podobizna-ceskeho-krale-jana-lucemburskeho-7939911",
      },
      {
        difficulty: 1,
        text: "Kdo byl jeho nejstarší syn a nástupce na českém trůně?",
        correct: "Karel IV.",
        wrong: ["Václav II.", "Jiří z Poděbrad"],
        explanation:
          "Karel se později stal i římským císařem.",
      },
      {
        difficulty: 2,
        text: "S kým se Jan roku 1310 oženil, a získal tak český trůn?",
        correct: "S Eliškou Přemyslovnou",
        wrong: ["S Jitkou Habsburskou", "S Markétou Babenberskou"],
        explanation:
          "Sňatek mu zařídil otec, Janovi bylo teprve 14 let.",
      },
      {
        difficulty: 2,
        text: "Kde se Jan Lucemburský narodil?",
        correct: "V Lucembursku",
        wrong: ["V Praze", "V Paříži"],
        explanation:
          "Narodil se v Lucembursku a vyrůstal v Paříži.",
      },
      {
        difficulty: 2,
        text: "Kdo byl otcem Jana Lucemburského?",
        correct: "Římský císař Jindřich VII.",
        wrong: ["Rudolf Habsburský", "Přemysl Otakar II."],
        explanation:
          "Jan byl nejstarším synem císaře Jindřicha VII.",
      },
      {
        difficulty: 3,
        text: "Proč Jana mnozí čeští šlechtici považovali za „krále cizince“?",
        correct: "Většinu času trávil mimo Čechy",
        wrong: ["Neuměl česky číst", "Pocházel z Polska"],
        explanation:
          "Správu Čech přenechal jiným a cestoval, hlavně do Lucemburska a na francouzský dvůr.",
      },
      {
        difficulty: 3,
        text: "Při které výpravě se Janovi Lucemburskému výrazně zhoršil zrak?",
        correct: "Na křížové výpravě v Litvě",
        wrong: ["V bitvě u Kresčaku", "Ve vězení v Paříži"],
        explanation:
          "Zrak ztrácel postupně. Při výpravě do Litvy se mu výrazně zhoršil a později oslepl úplně.",
        sourceUrl: "https://dvojka.rozhlas.cz/120-schuzka-soukroma-podobizna-ceskeho-krale-jana-lucemburskeho-7939911",
      },
      {
        difficulty: 3,
        text: "Kde je Jan Lucemburský dnes pohřben?",
        correct: "V katedrále Notre-Dame v Lucemburku",
        wrong: ["V katedrále sv. Víta v Praze", "Ve Zbraslavském klášteře"],
        explanation:
          "Jeho ostatky byly do lucemburské katedrály přeneseny v roce 1945.",
      },
    ],
  },
  {
    name: "Karel IV.",
    slug: "karel-iv",
    reignFrom: 1346,
    reignTo: 1378,
    dynasty: "Lucemburkové",
    shortBio: "Otec vlasti, který z Prahy udělal jedno z center Evropy.",
    order: 8,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/karel-iv.webp",
    sourceUrl: "https://archiv.radio.cz/cz/static/karel-iv/vita-caroli",
    questions: [
      {
        difficulty: 2,
        text: "Jaké jméno dostal Karel IV. původně?",
        correct: "Václav",
        wrong: ["Jan", "Ludvík"],
        explanation:
          "Pojmenovali ho po předcích z matčiny strany, jméno Karel přijal až ve Francii.",
      },
      {
        difficulty: 1,
        text: "Kdo byla jeho matka?",
        correct: "Eliška Přemyslovna",
        wrong: ["Anežka Česká", "Blanka z Valois"],
        explanation:
          "Eliška Přemyslovna byla dcerou Václava II., Blanka z Valois byla Karlova první manželka.",
      },
      {
        difficulty: 1,
        text: "Co Karel IV. založil 7. dubna 1348?",
        correct: "Univerzitu v Praze",
        wrong: ["Národní divadlo", "Pražský hrad"],
        explanation: "Pražská univerzita je nejstarší ve střední Evropě.",
        sourceUrl: "https://archiv.radio.cz/cz/static/karel-iv/praha",
      },
      {
        difficulty: 2,
        text: "Která část Prahy vznikla roku 1348?",
        correct: "Nové Město",
        wrong: ["Malá Strana", "Staré Město"],
        explanation:
          "Založení Nového Města je považováno za jeho nejvýznamnější stavební čin.",
        sourceUrl: "https://archiv.radio.cz/cz/static/karel-iv/praha",
      },
      {
        difficulty: 2,
        text: "Ve kterém roce položil základní kámen Karlova mostu?",
        correct: "1357",
        wrong: ["1415", "1620"],
        explanation:
          "Most nahradil starší Juditin most, který zničila povodeň.",
        sourceUrl:
          "https://www.novinky.cz/clanek/veda-skoly-pred-660-lety-polozil-karel-iv-zakladni-kamen-mostu-ktery-z-prahy-udelal-velemesto-40039120",
      },
      {
        difficulty: 1,
        text: "Jakou nejvyšší hodnost Karel IV. získal?",
        correct: "Římský císař",
        wrong: ["Papež", "Francouzský král"],
        explanation:
          "Na císaře byl korunován v Římě 5. dubna 1355.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
      {
        difficulty: 3,
        text: "U kterého královského dvora strávil Karel sedm let mládí?",
        correct: "U francouzského",
        wrong: ["U uherského", "U anglického"],
        explanation:
          "Jméno Karel přijal na počest francouzského krále Karla IV., u jehož dvora žil.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
      {
        difficulty: 3,
        text: "Co upravovala Zlatá bula, kterou Karel vydal roku 1356?",
        correct: "Volbu římského krále",
        wrong: ["Založení pražské univerzity", "Stavbu Karlova mostu"],
        explanation:
          "Zlatá bula stanovila pravidla, podle kterých se volil král Svaté říše římské.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
      {
        difficulty: 3,
        text: "Kdy byl Karel korunován českým králem?",
        correct: "2. září 1347",
        wrong: ["26. srpna 1346", "7. dubna 1348"],
        explanation:
          "26. srpna 1346 padl jeho otec Jan Lucemburský u Kresčaku, 7. dubna 1348 Karel založil univerzitu.",
        sourceUrl: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
    ],
  },
  {
    name: "Jiří z Poděbrad",
    slug: "jiri-z-podebrad",
    reignFrom: 1458,
    reignTo: 1471,
    title: "král",
    isLegend: false,
    dynasty: "Páni z Kunštátu a Poděbrad",
    shortBio:
      "Husitský král, kterému současníci říkali přítel míru.",
    order: 10,
    imageUrl: "/kings/jiri-z-podebrad.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/George_of_Pod%C4%9Bbrady",
    questions: [
      {
        difficulty: 1,
        text: "Ke které víře se hlásil Jiří z Poděbrad?",
        correct: "K utrakvistům (umírněným husitům)",
        wrong: ["Ke katolíkům", "K luteránům"],
        explanation:
          "Byl husitského vyznání, proto se mu říká husitský král.",
      },
      {
        difficulty: 1,
        text: "Jak Jiřímu říkali jeho současníci?",
        correct: "Přítel míru",
        wrong: ["Král železný a zlatý", "Otec vlasti"],
        explanation:
          "Říkali mu také „král dvojího lidu“.",
      },
      {
        difficulty: 1,
        text: "Kdo zvolil Jiřího roku 1458 českým králem?",
        correct: "České zemské stavy",
        wrong: ["Papež", "Římský císař"],
        explanation:
          "Stavy ho zvolily jednomyslně 2. března 1458.",
      },
      {
        difficulty: 2,
        text: "Co Jiří navrhoval evropským křesťanským vládcům?",
        correct: "Smlouvu o mírovém řešení sporů",
        wrong: ["Křížovou výpravu do Svaté země", "Společnou měnu"],
        explanation:
          "Vládci se měli společně bránit Osmanům. Někdo v tom vidí ranou představu sjednocené Evropy.",
      },
      {
        difficulty: 2,
        text: "Odkud vytáhl Jiří roku 1448 na Prahu?",
        correct: "Z Kutné Hory",
        wrong: ["Z Tábora", "Z Brna"],
        explanation:
          "S asi 9 000 muži obsadil Prahu téměř bez boje.",
      },
      {
        difficulty: 2,
        text: "Za koho Jiří od roku 1451 spravoval Čechy?",
        correct: "Za mladého Ladislava Pohrobka",
        wrong: ["Za Karla IV.", "Za Rudolfa II."],
        explanation:
          "Správu mu svěřil císař Fridrich III., Ladislavův poručník.",
      },
      {
        difficulty: 3,
        text: "Co udělal papež Pius II. roku 1462?",
        correct: "Prohlásil kompaktáta za neplatná",
        wrong: ["Korunoval Jiřího", "Svolal koncil do Prahy"],
        explanation:
          "Kompaktáta byla dohoda, která husitům zaručovala jejich víru.",
      },
      {
        difficulty: 3,
        text: "Co Jiřímu udělal papež Pavel II. v prosinci 1466?",
        correct: "Exkomunikoval ho a prohlásil za sesazeného",
        wrong: ["Korunoval ho císařem", "Svěřil mu Uhry"],
        explanation:
          "Stalo se tak 23. prosince 1466.",
      },
      {
        difficulty: 3,
        text: "Který panovník se spojil se vzbouřenou šlechtou proti Jiřímu?",
        correct: "Uherský král Matyáš Korvín",
        wrong: ["Polský král Kazimír", "Francouzský král Ludvík XI."],
        explanation:
          "Spolu s císařem Fridrichem III. podpořil vzbouřence a začala válka.",
      },
    ],
  },
  {
    name: "Rudolf II.",
    slug: "rudolf-ii",
    reignFrom: 1576,
    reignTo: 1611,
    title: "král",
    isLegend: false,
    dynasty: "Habsburkové",
    shortBio:
      "Císař, který z Prahy udělal středisko umění, vědy a alchymie.",
    order: 13,
    imageUrl: "/kings/rudolf-ii.webp",
    sourceUrl: "https://lib.cas.cz/casopis-informace/rudolf-ii/",
    questions: [
      {
        difficulty: 1,
        text: "Kam přesunul Rudolf II. roku 1583 svůj dvůr?",
        correct: "Do Prahy",
        wrong: ["Do Vídně", "Do Budína"],
        explanation:
          "Praha se tak stala sídlem habsburské monarchie.",
        sourceUrl: "https://english.radio.cz/node/8796981",
      },
      {
        difficulty: 1,
        text: "Kteří slavní astronomové působili na jeho dvoře?",
        correct: "Tycho Brahe a Johannes Kepler",
        wrong: ["Galileo Galilei a Isaac Newton", "Mikuláš Koperník a Edmond Halley"],
        explanation:
          "Oba pracovali na astronomických tabulkách.",
      },
      {
        difficulty: 1,
        text: "Čím se Rudolf II. kromě umění zabýval?",
        correct: "Alchymií a astrologií",
        wrong: ["Mořeplavbou", "Lovem velryb"],
        explanation:
          "Hledal i bájný kámen mudrců.",
      },
      {
        difficulty: 2,
        text: "Jak se jmenují astronomické tabulky, které dokončil Kepler?",
        correct: "Rudolfinské tabulky",
        wrong: ["Karlovy tabulky", "Pražské tabulky"],
        explanation:
          "Začal je Tycho Brahe, po jeho smrti je dokončil Kepler.",
        sourceUrl: "https://biography.hiu.cas.cz/wiki/BRAHE_Tycho_14.12.1546-24.10.1601",
      },
      {
        difficulty: 2,
        text: "Jak se říkalo Rudolfově slavné sbírce umění a kuriozit?",
        correct: "Kunstkomora",
        wrong: ["Klementinum", "Zlatá bula"],
        explanation:
          "Ve své době patřila k nejrozsáhlejším v Evropě.",
      },
      {
        difficulty: 2,
        text: "Ve kterém městě se Rudolf II. narodil?",
        correct: "Ve Vídni",
        wrong: ["V Praze", "V Madridu"],
        explanation:
          "Narodil se 18. července 1552, zemřel v Praze roku 1612.",
      },
      {
        difficulty: 3,
        text: "Co Rudolf II. vydal roku 1609?",
        correct: "Majestát o náboženské svobodě",
        wrong: ["Pragmatickou sankci", "Toleranční patent"],
        explanation:
          "Majestát dal českým protestantům větší náboženskou svobodu.",
      },
      {
        difficulty: 3,
        text: "Komu musel Rudolf roku 1611 přenechat českou korunu?",
        correct: "Svému bratru Matyášovi",
        wrong: ["Svému synovi", "Fridrichu Falckému"],
        explanation:
          "Matyášovo vojsko ho předtím drželo v Praze jako zajatce.",
      },
      {
        difficulty: 3,
        text: "Kterého malíře Rudolf II. podporoval?",
        correct: "Giuseppe Arcimbolda",
        wrong: ["Alfonse Muchu", "Rembrandta"],
        explanation:
          "Arcimboldo patřil k umělcům Rudolfova dvora.",
      },
    ],
  },
  {
    name: "Marie Terezie",
    slug: "marie-terezie",
    reignFrom: 1740,
    reignTo: 1780,
    dynasty: "Habsburkové",
    shortBio:
      "Jediná žena, která vládla habsburské monarchii, a velká reformátorka.",
    order: 15,
    title: "královna",
    isLegend: false,
    imageUrl: "/kings/marie-terezie.webp",
    sourceUrl:
      "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
    questions: [
      {
        difficulty: 2,
        text: "Díky kterému dokumentu mohla Marie Terezie nastoupit na trůn?",
        correct: "Pragmatické sankci",
        wrong: ["Zlaté bule sicilské", "Majestátu Rudolfa II."],
        explanation:
          "Pragmatická sankce umožnila dědit trůn i ženám, když rod vymřel po meči.",
      },
      {
        difficulty: 1,
        text: "Kdo byl jejím otcem?",
        correct: "Karel VI.",
        wrong: ["Josef II.", "Leopold II."],
        explanation:
          "Smrtí Karla VI. vymřeli Habsburkové po meči a trůn zdědila jeho dcera.",
      },
      {
        difficulty: 1,
        text: "Kdo byl jejím manželem?",
        correct: "František Štěpán Lotrinský",
        wrong: ["Fridrich II. Pruský", "Josef II."],
        explanation:
          "Josef II. byl její syn a spoluvládce, Fridrich II. její největší nepřítel.",
      },
      {
        difficulty: 2,
        text: "Kterou zemi jí hned na začátku vlády zabral pruský král Fridrich II.?",
        correct: "Slezsko",
        wrong: ["Moravu", "Uhry"],
        explanation:
          "Ztráta většiny Slezska byla největší územní ztrátou její vlády.",
      },
      {
        difficulty: 2,
        text: "Co zavedl Všeobecný školní řád Marie Terezie z roku 1774?",
        correct: "Všeobecnou vzdělávací povinnost",
        wrong: ["Zrušení nevolnictví", "Toleranční patent"],
        explanation:
          "Vzdělávací povinnost pro děti od 6 do 12 let bylo možné plnit ve škole i domácím vyučováním. Nevolnictví zrušil a toleranční patent vydal až Josef II. v roce 1781.",
      },
      {
        difficulty: 1,
        text: "Kolik dětí Marie Terezie porodila?",
        correct: "16",
        wrong: ["4", "8"],
        explanation:
          "Šestnáct dětí porodila během devatenácti let, v letech 1737–1756.",
        sourceUrl: "https://en.wikipedia.org/wiki/Maria_Theresa",
      },
      {
        difficulty: 3,
        text: "Kde byla Marie Terezie v roce 1743 korunována českou královnou?",
        correct: "V katedrále sv. Víta v Praze",
        wrong: ["Ve Svatoštěpánském dómu ve Vídni", "V katedrále sv. Petra a Pavla v Brně"],
        explanation:
          "Korunovace proběhla 12. května 1743.",
        sourceUrl: "https://en.wikipedia.org/wiki/Maria_Theresa",
      },
      {
        difficulty: 3,
        text: "Kdo se stal v roce 1765 spoluvládcem Marie Terezie?",
        correct: "Její syn Josef II.",
        wrong: ["Její manžel František Štěpán", "Fridrich II. Pruský"],
        explanation:
          "Josef vládl s matkou až do její smrti v roce 1780, pak už sám.",
        sourceUrl: "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
      },
      {
        difficulty: 3,
        text: "Pro jak staré děti platila vzdělávací povinnost podle školního řádu z roku 1774?",
        correct: "Od 6 do 12 let věku",
        wrong: ["Od 10 do 15 let věku", "Od 3 do 6 let věku"],
        explanation:
          "Vzdělávací povinnost neznamenala bezvýjimečnou docházku do školy: bylo možné zajistit i domácí vyučování, dostupné hlavně zámožným rodinám.",
        sourceUrl: "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
      },
    ],
  },
  {
    name: "Josef II.",
    slug: "josef-ii",
    reignFrom: 1780,
    reignTo: 1790,
    title: "král",
    isLegend: false,
    dynasty: "Habsbursko-Lotrinští",
    shortBio:
      "Osvícený reformátor, který zrušil nevolnictví a povolil jiné víry.",
    order: 16,
    imageUrl: "/kings/josef-ii.webp",
    sourceUrl: "https://en.wikipedia.org/wiki/Josephinism",
    questions: [
      {
        difficulty: 1,
        text: "Kdo byla matkou Josefa II.?",
        correct: "Marie Terezie",
        wrong: ["Eliška Přemyslovna", "Jitka Habsburská"],
        explanation:
          "Od roku 1765 vládl spolu s matkou.",
      },
      {
        difficulty: 1,
        text: "Co zrušil Josef II. patentem z 1. listopadu 1781?",
        correct: "Nevolnictví",
        wrong: ["Povinnou školní docházku", "Šlechtické tituly"],
        explanation:
          "Poddaní se mohli sami ženit, stěhovat se a volit si povolání.",
        sourceUrl: "https://www.nacr.cz/labyrint/labyrintem-dejin-ceskych-zemi/mezi-absolutismem-a-obcanskou-revoluci/rok-1781",
      },
      {
        difficulty: 1,
        text: "Jak dlouho vládl Josef II. sám, bez matky?",
        correct: "10 let",
        wrong: ["40 let", "2 roky"],
        explanation:
          "Sám vládl od smrti matky v roce 1780 až do své smrti v roce 1790.",
      },
      {
        difficulty: 2,
        text: "Které církve povolil toleranční patent z října 1781?",
        correct: "Luterány, kalvinisty a pravoslavné",
        wrong: ["Jen katolíky", "Jen husity"],
        explanation:
          "Patent vyšel 13. října 1781.",
        sourceUrl: "https://en.wikipedia.org/wiki/Patent_of_Toleration",
      },
      {
        difficulty: 2,
        text: "Jaké kláštery Josef II. rušil?",
        correct: "Rozjímavé, které se nevěnovaly např. péči o nemocné nebo školám",
        wrong: ["Úplně všechny", "Jen kláštery v Uhrách"],
        explanation:
          "V rakouských a slovanských zemích zrušil přes 500 z 1 188 klášterů.",
      },
      {
        difficulty: 2,
        text: "Co nesměli nekatolíci podle tolerančního patentu?",
        correct: "Stavět modlitebny, které by vypadaly jako kostely",
        wrong: ["Číst knihy", "Nosit zbraně"],
        explanation:
          "Mohli mít jen modlitebny, které se kostelům nesměly podobat.",
        sourceUrl: "https://en.wikipedia.org/wiki/Patent_of_Toleration",
      },
      {
        difficulty: 3,
        text: "Co udělal Josef II. se svatováclavskou korunou?",
        correct: "Nechal ji převézt do Vídně",
        wrong: ["Nechal ji roztavit", "Daroval ji papeži"],
        explanation:
          "Byl to symbolický krok ke sjednocení monarchie.",
      },
      {
        difficulty: 3,
        text: "Co nevolnický patent z roku 1781 NEzrušil?",
        correct: "Robotu, tedy povinnou práci pro vrchnost",
        wrong: ["Zákaz stěhování", "Zákaz sňatku bez svolení vrchnosti"],
        explanation:
          "Robotu a dávky vrchnosti patent neřešil.",
        sourceUrl: "https://en.wikipedia.org/wiki/Serfdom_Patent_(1781)",
      },
      {
        difficulty: 3,
        text: "Kdy se Josef II. stal římským císařem?",
        correct: "1765",
        wrong: ["1780", "1790"],
        explanation:
          "V habsburských zemích ale do roku 1780 vládl jen spolu s matkou.",
      },
    ],
  },
  {
    name: "Karel I.",
    slug: "karel-i",
    reignFrom: 1916,
    reignTo: 1918,
    title: "král",
    isLegend: false,
    dynasty: "Habsbursko-Lotrinští",
    shortBio:
      "Poslední český král, který vládl v době první světové války. Jako český král byl Karlem III.",
    order: 18,
    imageUrl: "/kings/karel-i.webp",
    sourceUrl: "https://www.newworldencyclopedia.org/entry/Charles_I_of_Austria",
    questions: [
      {
        difficulty: 1,
        text: "Čím je Karel I. v českých dějinách výjimečný?",
        correct: "Byl posledním českým králem",
        wrong: ["Byl prvním českým králem", "Byl prvním prezidentem"],
        explanation:
          "Vládl v letech 1916–1918.",
      },
      {
        difficulty: 1,
        text: "Na kterém ostrově Karel I. zemřel?",
        correct: "Na Madeiře",
        wrong: ["Na Korsice", "Na Elbě"],
        explanation:
          "Zemřel v chudobě v exilu roku 1922.",
      },
      {
        difficulty: 1,
        text: "Kdo byla manželka Karla I.?",
        correct: "Zita Bourbonsko-Parmská",
        wrong: ["Marie Terezie", "Eliška Přemyslovna"],
        explanation:
          "Vzali se v roce 1911.",
      },
      {
        difficulty: 2,
        text: "Po kom nastoupil Karel I. v roce 1916 na trůn?",
        correct: "Po svém prastrýci Františku Josefovi I.",
        wrong: ["Po svém otci", "Po Josefovi II."],
        explanation:
          "František Josef zemřel v roce 1916, uprostřed války.",
      },
      {
        difficulty: 2,
        text: "Proč se Karel v roce 1914 stal následníkem trůnu?",
        correct: "Jeho strýc František Ferdinand byl zavražděn v Sarajevu",
        wrong: ["Jeho otec se vzdal nároku", "Vyhrál volby"],
        explanation:
          "Atentát v Sarajevu je zároveň spojován se začátkem první světové války.",
      },
      {
        difficulty: 2,
        text: "Co Karel I. prohlásil 11. listopadu 1918?",
        correct: "Že se vzdává účasti na vládě",
        wrong: ["Že vyhlašuje válku", "Že se vrací do Prahy"],
        explanation:
          "Formálně ale ze svých trůnů neabdikoval.",
      },
      {
        difficulty: 3,
        text: "Jak se říká jeho tajným mírovým jednáním s Francií v roce 1917?",
        correct: "Sixtova aféra",
        wrong: ["Mnichovská dohoda", "Versailleská smlouva"],
        explanation:
          "Pokus o tajný mír s Francií skončil neúspěchem a skandálem.",
      },
      {
        difficulty: 3,
        text: "Kdo prohlásil Karla I. roku 2004 za blahoslaveného?",
        correct: "Papež Jan Pavel II.",
        wrong: ["Papež František", "Papež Pius XII."],
        explanation:
          "Stalo se tak 3. října 2004.",
      },
      {
        difficulty: 3,
        text: "Kolik let bylo Karlovi I., když zemřel?",
        correct: "34",
        wrong: ["54", "74"],
        explanation:
          "Narodil se 17. srpna 1887 a zemřel 1. dubna 1922.",
      },
    ],
  },
  // ---- Batch 6 (2026-11-09): six more rulers, every fact checked against the
  // linked Czech Wikipedia article (see docs/historical-content.md). ----
  {
    name: "Vratislav II.",
    slug: "vratislav-ii",
    reignFrom: 1061,
    reignTo: 1092,
    dynasty: "Přemyslovci",
    shortBio: "Přemyslovský kníže, který jako první Čech získal královskou korunu.",
    order: 3,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/vratislav-ii.webp",
    sourceUrl: "https://cs.wikipedia.org/wiki/Vratislav_II.",
    questions: [
      {
        difficulty: 1,
        text: "Čím se Vratislav II. zapsal do dějin jako první z Přemyslovců?",
        correct: "Stal se prvním českým králem",
        wrong: ["Stal se prvním římským císařem", "Založil pražskou univerzitu"],
        explanation: "Kníže Vratislav II. získal roku 1085 královskou korunu, ovšem jen pro svou osobu.",
      },
      {
        difficulty: 1,
        text: "Od koho dostal Vratislav II. královskou korunu?",
        correct: "Od císaře Jindřicha IV.",
        wrong: ["Od papeže Řehoře VII.", "Od uherského krále Ondřeje I."],
        explanation: "Jindřich IV. mu ji udělil roku 1085 v Mohuči za věrné služby.",
      },
      {
        difficulty: 1,
        text: "Jak Vratislav II. zemřel?",
        correct: "Na zranění po pádu z koně",
        wrong: ["V bitvě s Poláky", "Na mor"],
        explanation: "Zemřel v lednu 1092, jeho hrob na Vyšehradě se dosud nenašel.",
      },
      {
        difficulty: 2,
        text: "Ve kterém roce byl Vratislav II. korunován na Pražském hradě?",
        correct: "1086",
        wrong: ["1061", "1212"],
        explanation: "15. června 1086 ho korunoval trevírský arcibiskup Egilbert.",
      },
      {
        difficulty: 2,
        text: "Kterou kapitulu Vratislav II. založil, aby oslabil pražského biskupa?",
        correct: "Vyšehradskou",
        wrong: ["Olomouckou", "Svatovítskou"],
        explanation: "Vyšehradská kapitula podléhala přímo Římu, ne pražskému biskupovi.",
      },
      {
        difficulty: 2,
        text: "Které biskupství zřídil Vratislav II. roku 1063 pro Moravu?",
        correct: "Olomoucké",
        wrong: ["Brněnské", "Vyšehradské"],
        explanation: "Rozdělením české diecéze chtěl omezit vliv pražského biskupství.",
      },
      {
        difficulty: 3,
        text: "Který rukopis vznikl u příležitosti Vratislavovy korunovace?",
        correct: "Kodex vyšehradský",
        wrong: ["Codex gigas", "Dalimilova kronika"],
        explanation: "Kodex vyšehradský vznikl právě ke korunovaci prvního českého krále.",
      },
      {
        difficulty: 3,
        text: "S kterým bratrem vedl Vratislav II. dlouhý spor o pražské biskupství?",
        correct: "S Jaromírem",
        wrong: ["Se Spytihněvem II.", "S Břetislavem II."],
        explanation: "Jaromír se stal pražským biskupem a usiloval o obnovení jediné diecéze.",
      },
      {
        difficulty: 3,
        text: "Co Vratislavovi II. roku 1080 odmítl povolit papež Řehoř VII.?",
        correct: "Bohoslužby ve slovanském jazyce",
        wrong: ["Královskou korunovaci", "Založení Vyšehradu"],
        explanation: "Papež odpověděl, že žádosti o slovanskou liturgii nemůže vyhovět.",
      },
    ],
  },
  {
    name: "Václav IV.",
    slug: "vaclav-iv",
    reignFrom: 1378,
    reignTo: 1419,
    dynasty: "Lucemburkové",
    shortBio: "Syn Karla IV., za jehož dlouhé vlády sílilo hnutí české reformace.",
    order: 9,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/vaclav-iv.webp",
    sourceUrl: "https://cs.wikipedia.org/wiki/V%C3%A1clav_IV.",
    questions: [
      {
        difficulty: 1,
        text: "Kdo byl otcem Václava IV.?",
        correct: "Císař Karel IV.",
        wrong: ["Jan Lucemburský", "Zikmund Lucemburský"],
        explanation: "Václav IV. byl synem Karla IV. a Anny Svídnické.",
      },
      {
        difficulty: 1,
        text: "Ve kterém městě se Václav IV. narodil?",
        correct: "V Norimberku",
        wrong: ["V Praze", "V Paříži"],
        explanation: "Narodil se 26. února 1361 na norimberském císařském hradě během říšského sněmu.",
      },
      {
        difficulty: 1,
        text: "Co nechal Václav IV. zřídit v nové královské zahradě v Praze?",
        correct: "Lvinec",
        wrong: ["Hvězdárnu", "Divadlo"],
        explanation: "Lvinec stál na místě dnešního Obecního domu, kromě lvů v něm žily i další šelmy.",
      },
      {
        difficulty: 2,
        text: "Jak starý byl Václav, když ho otec nechal korunovat českým králem?",
        correct: "Dvouletý",
        wrong: ["Sedmnáctiletý", "Čtrnáctiletý"],
        explanation: "Korunovace proběhla 15. června 1363, samostatně vládl až od roku 1378.",
      },
      {
        difficulty: 2,
        text: "Který duchovní byl umučen roku 1393 během sporu Václava IV. s arcibiskupem?",
        correct: "Jan z Pomuku",
        wrong: ["Jan Hus", "Jan Želivský"],
        explanation: "Jan z Pomuku byl později svatořečen jako Jan Nepomucký.",
      },
      {
        difficulty: 2,
        text: "Jaký dokument vydal Václav IV. roku 1409, kdy ještě podporoval Jana Husa?",
        correct: "Dekret kutnohorský",
        wrong: ["Zlatou bulu", "Majestát"],
        explanation: "Podpora Husa vyvrcholila roku 1409 Dekretem kutnohorským.",
      },
      {
        difficulty: 3,
        text: "Kde zajala Václava IV. roku 1394 panská jednota?",
        correct: "V Králově Dvoře u Berouna",
        wrong: ["Na Karlštejně", "Na Novém hradě u Kunratic"],
        explanation: "8. května 1394 ho šlechtici zajali a odvezli až do Horních Rakous.",
      },
      {
        difficulty: 3,
        text: "Proč kurfiřti roku 1400 sesadili Václava IV. z římského trůnu?",
        correct: "Označili ho za nečinného a nedbalého krále",
        wrong: ["Prohrál válku s Francií", "Vzdal se trůnu ve prospěch syna"],
        explanation: "Prohlásili ho za krále „nepotřebného, nečinného i nedbalého“, sesazení však neuznal.",
      },
      {
        difficulty: 3,
        text: "Která zpráva vyvolala u Václava IV. krátce před smrtí těžký záchvat?",
        correct: "Zpráva o první pražské defenestraci",
        wrong: ["Zpráva o smrti bratra Zikmunda", "Zpráva o zvolení nového papeže"],
        explanation: "Zemřel 16. srpna 1419, záchvat byl snad mozková mrtvice nebo epilepsie.",
      },
    ],
  },
  {
    name: "Vladislav II. Jagellonský",
    slug: "vladislav-ii-jagellonsky",
    reignFrom: 1471,
    reignTo: 1516,
    dynasty: "Jagellonci",
    shortBio: "Mírný Jagellonec, který vládl Čechám 45 let a od roku 1490 i Uhrám.",
    order: 11,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/vladislav-ii-jagellonsky.webp",
    sourceUrl: "https://cs.wikipedia.org/wiki/Vladislav_Jagellonsk%C3%BD",
    questions: [
      {
        difficulty: 1,
        text: "Jakou přezdívku dostal Vladislav II. Jagellonský?",
        correct: "Král Bene",
        wrong: ["Král železný a zlatý", "Otec vlasti"],
        explanation: "Šlechtě prý na žádosti často odpovídal „bene“, tedy „dobře“.",
      },
      {
        difficulty: 1,
        text: "Ze kterého rodu pocházel Vladislav II.?",
        correct: "Z Jagellonců",
        wrong: ["Z Habsburků", "Z Lucemburků"],
        explanation: "Jagellonci byli polsko-litevský rod, Vladislav byl synem polského krále Kazimíra IV.",
      },
      {
        difficulty: 1,
        text: "Po kterém panovníkovi nastoupil Vladislav II. na český trůn?",
        correct: "Po Jiřím z Poděbrad",
        wrong: ["Po Karlu IV.", "Po Rudolfu II."],
        explanation: "Jiří z Poděbrad se vzdal nároků svých synů a nabídl korunu Jagelloncům.",
      },
      {
        difficulty: 2,
        text: "Kolik let bylo Vladislavovi, když ho zvolili českým králem?",
        correct: "15",
        wrong: ["7", "30"],
        explanation: "Sněm v Kutné Hoře ho potvrdil za krále 27. května 1471.",
      },
      {
        difficulty: 2,
        text: "Jak se jmenuje zákoník, který vznikl za Vladislava II. roku 1500?",
        correct: "Vladislavské zřízení zemské",
        wrong: ["Majestát", "Obnovené zřízení zemské"],
        explanation: "Zákoník sepsaly šlechtické stavy a výrazně omezil královskou moc.",
      },
      {
        difficulty: 2,
        text: "Kterou další korunu získal Vladislav II. roku 1490?",
        correct: "Uherskou",
        wrong: ["Polskou", "Římskou"],
        explanation: "Po smrti Matyáše Korvína ho zvolili uherským králem a přesídlil do Budína.",
      },
      {
        difficulty: 3,
        text: "Kdo se roku 1471 nechal také korunovat českým králem, a to v Jihlavě?",
        correct: "Matyáš Korvín",
        wrong: ["Fridrich III.", "Jan Olbracht"],
        explanation: "Uherský král Matyáš si pak až do smrti držel Moravu, Slezsko a Lužici.",
      },
      {
        difficulty: 3,
        text: "Co přinesl kutnohorský smír z roku 1485?",
        correct: "Právo zvolit si víru mezi katolíky a kališníky",
        wrong: ["Konec války s Matyášem Korvínem", "Zrušení nevolnictví"],
        explanation: "Svoboda vyznání platila i pro poddané, netýkala se však jednoty bratrské.",
      },
      {
        difficulty: 3,
        text: "Za koho se provdala Vladislavova dcera Anna?",
        correct: "Za Ferdinanda I. Habsburského",
        wrong: ["Za Matyáše Korvína", "Za Maxmiliána I."],
        explanation: "Dohoda Jagellonců a Habsburků z roku 1515 rozhodla o pozdější habsburské monarchii.",
      },
    ],
  },
  {
    name: "Ferdinand I.",
    slug: "ferdinand-i",
    reignFrom: 1526,
    reignTo: 1564,
    dynasty: "Habsburkové",
    shortBio: "Habsburk vychovaný ve Španělsku, za jehož vlády se spojily rakouské země, Čechy a Uhry.",
    order: 12,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/ferdinand-i.webp",
    sourceUrl: "https://cs.wikipedia.org/wiki/Ferdinand_I._Habsbursk%C3%BD",
    questions: [
      {
        difficulty: 1,
        text: "Ze kterého rodu pocházel Ferdinand I.?",
        correct: "Z Habsburků",
        wrong: ["Z Jagellonců", "Z Přemyslovců"],
        explanation: "Byl synem Filipa I. Sličného a mladším bratrem císaře Karla V.",
      },
      {
        difficulty: 1,
        text: "Ve které zemi prožil Ferdinand I. dětství?",
        correct: "Ve Španělsku",
        wrong: ["V Čechách", "V Polsku"],
        explanation: "Narodil se roku 1503 v Alcalá de Henares nedaleko Madridu.",
      },
      {
        difficulty: 1,
        text: "Kdo byla manželkou Ferdinanda I.?",
        correct: "Anna Jagellonská",
        wrong: ["Marie Terezie", "Eliška Přemyslovna"],
        explanation: "Anna byla dcerou Vladislava II., měli spolu patnáct dětí.",
      },
      {
        difficulty: 2,
        text: "Po které bitvě se uprázdnil český trůn a Ferdinand o něj začal usilovat?",
        correct: "Po bitvě u Moháče",
        wrong: ["Po bitvě na Bílé hoře", "Po bitvě u Lipan"],
        explanation: "Roku 1526 u Moháče padl Annin bratr, král Ludvík Jagellonský, bez potomka.",
      },
      {
        difficulty: 2,
        text: "Koho pozval Ferdinand I. roku 1556 do Čech?",
        correct: "Jezuity",
        wrong: ["Templáře", "Husity"],
        explanation: "Jezuité měli zemi rekatolizovat.",
      },
      {
        difficulty: 2,
        text: "Jak Ferdinanda přijali ve Vídni, když tam roku 1521 přijel?",
        correct: "Jako cizince, který neuměl německy",
        wrong: ["Jako osvoboditele od Turků", "Jako papežova vyslance"],
        explanation: "Vyrůstal ve Španělsku, a tak ho zpočátku vnímali jako Španěla.",
      },
      {
        difficulty: 3,
        text: "Kdy byl Ferdinand I. zvolen českým králem?",
        correct: "23. října 1526",
        wrong: ["24. února 1527", "25. července 1564"],
        explanation: "Korunován byl až 24. února 1527 ve svatovítské katedrále.",
      },
      {
        difficulty: 3,
        text: "Kdo byl Ferdinandovým soupeřem o uherský trůn?",
        correct: "Jan Zápolský",
        wrong: ["Matyáš Korvín", "Jiří z Poděbrad"],
        explanation: "Většina uherských stavů zvolila v listopadu 1526 králem sedmihradského vévodu Zápolského.",
      },
      {
        difficulty: 3,
        text: "Jak Ferdinand I. potrestal česká města po povstání v letech 1546–1547?",
        correct: "Odebral jim politická práva a zbraně",
        wrong: ["Udělil jim nová privilegia", "Osvobodil je od daní"],
        explanation: "Města musela odevzdat všechny střelné zbraně i pozemkový majetek.",
      },
    ],
  },
  {
    name: "Fridrich Falcký",
    slug: "fridrich-falcky",
    reignFrom: 1619,
    reignTo: 1620,
    dynasty: "Wittelsbachové",
    shortBio: "Falcký kurfiřt, kterého si zvolili vzbouření stavové a který vládl jen jednu zimu.",
    order: 14,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/fridrich-falcky.webp",
    sourceUrl: "https://cs.wikipedia.org/wiki/Fridrich_Falck%C3%BD",
    questions: [
      {
        difficulty: 1,
        text: "Jakou přezdívku dostal Fridrich Falcký?",
        correct: "Zimní král",
        wrong: ["Král Bene", "Král železný a zlatý"],
        explanation: "Kvůli tomu, že vládl jen zhruba jeden rok.",
      },
      {
        difficulty: 1,
        text: "Po které bitvě musel Fridrich Falcký opustit Pražský hrad?",
        correct: "Po bitvě na Bílé hoře",
        wrong: ["Po bitvě u Moháče", "Po bitvě u Kresčaku"],
        explanation: "Bitva proběhla 8. listopadu 1620, rok a čtyři dny po jeho korunovaci.",
      },
      {
        difficulty: 1,
        text: "Ke které víře se Fridrich Falcký hlásil?",
        correct: "Ke kalvinismu",
        wrong: ["Ke katolictví", "K pravoslaví"],
        explanation: "Kalvinismus se poněkud lišil od českého kališnictví.",
      },
      {
        difficulty: 2,
        text: "Čí dcera byla Fridrichova manželka Alžběta?",
        correct: "Anglického krále Jakuba I.",
        wrong: ["Císaře Ferdinanda II.", "Francouzského krále Ludvíka XIII."],
        explanation: "Stavové proto doufali v pomoc Anglie, ta ale nepřišla.",
      },
      {
        difficulty: 2,
        text: "Kterého krále čeští stavové sesadili, než zvolili Fridricha?",
        correct: "Ferdinanda II. Štýrského",
        wrong: ["Rudolfa II.", "Matyáše Habsburského"],
        explanation: "Generální sněm prohlásil Ferdinanda 19. srpna 1619 za sesazeného.",
      },
      {
        difficulty: 2,
        text: "Kam odjel Fridrich Falcký po bitvě na Bílé hoře?",
        correct: "Do Vratislavi",
        wrong: ["Do Vídně", "Do Madridu"],
        explanation: "Později si díky příbuzným vybudoval dvůr v Haagu.",
      },
      {
        difficulty: 3,
        text: "Kdy byl Fridrich Falcký korunován českým králem?",
        correct: "4. listopadu 1619",
        wrong: ["8. listopadu 1620", "23. května 1618"],
        explanation: "O tři dny později byla korunována i jeho manželka Alžběta.",
      },
      {
        difficulty: 3,
        text: "Co dal koncem roku 1619 odstranit z katedrály sv. Víta Fridrichův dvorní kazatel?",
        correct: "Obrazy a relikvie",
        wrong: ["Korunovační klenoty", "Hrob svatého Václava"],
        explanation: "Kazatel Abraham Scultetus nechal zničit i mariánský oltář s malbami Lucase Cranacha mladšího.",
      },
      {
        difficulty: 3,
        text: "Komu udělil císař roku 1623 Fridrichovu Falc i s hodností kurfiřta?",
        correct: "Maxmiliánu Bavorskému",
        wrong: ["Janu Jiřímu Saskému", "Karlu Emanuelovi Savojskému"],
        explanation: "Fridrich přišel o všechna léna a byl uvržen do říšské klatby.",
      },
    ],
  },
  {
    name: "František Josef I.",
    slug: "frantisek-josef-i",
    reignFrom: 1848,
    reignTo: 1916,
    dynasty: "Habsbursko-Lotrinští",
    shortBio: "Rakouský císař a nekorunovaný český král, který vládl téměř 68 let.",
    order: 17,
    title: "král",
    isLegend: false,
    imageUrl: "/kings/frantisek-josef-i.webp",
    sourceUrl: "https://cs.wikipedia.org/wiki/Franti%C5%A1ek_Josef_I.",
    questions: [
      {
        difficulty: 1,
        text: "Pod jakým jménem je známá manželka Františka Josefa I., Alžběta Bavorská?",
        correct: "Sisi",
        wrong: ["Mimi", "Lili"],
        explanation: "Vzali se roku 1854, byla to jeho sestřenice.",
      },
      {
        difficulty: 1,
        text: "Kolik let bylo Františku Josefovi, když se stal císařem?",
        correct: "18",
        wrong: ["8", "40"],
        explanation: "Na trůn nastoupil 2. prosince 1848 po abdikaci svého strýce Ferdinanda.",
      },
      {
        difficulty: 1,
        text: "Ve kterém městě nastoupil František Josef I. na trůn?",
        correct: "V Olomouci",
        wrong: ["V Praze", "V Brně"],
        explanation: "Stalo se tak 2. prosince 1848, v roce revoluce.",
      },
      {
        difficulty: 2,
        text: "Kterou korunovaci František Josef I. opakovaně slíbil, ale nikdy nesplnil?",
        correct: "Na českého krále",
        wrong: ["Na uherského krále", "Na římského císaře"],
        explanation: "Uherským králem se nechal korunovat roku 1867, českým nikdy.",
      },
      {
        difficulty: 2,
        text: "Jak dlouho vládl František Josef I.?",
        correct: "Téměř 68 let",
        wrong: ["Téměř 41 let", "Přesně 20 let"],
        explanation: "Patří k nejdéle vládnoucím panovníkům světových dějin.",
      },
      {
        difficulty: 2,
        text: "Kterého českého novináře nechal roku 1851 deportovat do Brixenu?",
        correct: "Karla Havlíčka Borovského",
        wrong: ["Jana Nerudu", "Josefa Kajetána Tyla"],
        explanation: "Stalo se tak bez jakéhokoli soudního řízení.",
      },
      {
        difficulty: 3,
        text: "Ve které bitvě roku 1859 osobně velel rakouské armádě a prohrál?",
        correct: "U Solferina",
        wrong: ["U Hradce Králové", "U Slavkova"],
        explanation: "Po porážce od francouzsko-sardinských vojsk ztratilo Rakousko Lombardii.",
      },
      {
        difficulty: 3,
        text: "Na kterém zámku v Čechách jednal roku 1876 s ruským carem Alexandrem II.?",
        correct: "V Zákupech",
        wrong: ["Na Konopišti", "V Lánech"],
        explanation: "Obě říše si tam tajně rozdělily sféry vlivu na Balkáně.",
      },
      {
        difficulty: 3,
        text: "Co pomohl František Josef I. roku 1907 prosadit v Předlitavsku?",
        correct: "Všeobecné volební právo pro muže",
        wrong: ["Volební právo pro ženy", "Zrušení nevolnictví"],
        explanation: "V národnostní otázce byl konzervativní, tady se ale dokázal době přizpůsobit.",
      },
    ],
  },
];
