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
  "vaclav-ii": {
    intro:
      "Narodil se roku 1271 jako jediný přeživší syn Přemysla Otakara II. Když otec padl na Moravském poli, bylo mu sedm let a zemi spravoval braniborský markrabě Ota, který ho podle pramenů věznil. Do Čech se vrátil v roce 1283 a od roku 1290 vládl samostatně. Zemřel 21. června 1305, bylo mu teprve 33 let.",
    facts: [
      "těžbu stříbra udělal královským monopolem a začal razit pražský groš?",
      "v roce 1300 vydal horní zákoník Ius regale montanorum?",
      "v roce 1300 se nechal korunovat i polským králem a jeho syn Václav III. se o rok později stal uherským králem?",
      "jeho první manželkou byla Jitka, dcera Rudolfa Habsburského, tedy muže, který porazil jeho otce?",
      "plánoval založit první univerzitu ve střední Evropě, a to dlouho před Karlem IV.?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Wenceslaus_II_of_Bohemia" },
    ],
  },
  "jan-lucembursky": {
    intro:
      "Narodil se roku 1296 v Lucembursku jako nejstarší syn císaře Jindřicha VII. a vyrůstal v Paříži. Ve čtrnácti letech se oženil s Eliškou Přemyslovnou a v únoru 1311 byl s ní korunován. Mnozí šlechtici ho brali jako krále cizince, protože správu Čech přenechával jiným a sám cestoval po Evropě. Padl 26. srpna 1346 v bitvě u Kresčaku.",
    facts: [
      "oslepl kolem roku 1336 na křížové výpravě v Litvě a posledních zhruba deset let života neviděl?",
      "i slepý se postavil do čela vojska v bitvě u Kresčaku proti Angličanům?",
      "k českému království připojil Chebsko a oblasti Budyšína a Zhořelce?",
      "jeho ostatky jsou od roku 1945 uložené v katedrále Notre-Dame v Lucemburku?",
      "jeho nejstarší syn Karel se stal nejslavnějším českým panovníkem?",
    ],
    sources: [{ label: "Wikipedie", url: "https://en.wikipedia.org/wiki/John_of_Bohemia" }],
  },
  "karel-iv": {
    intro:
      "Narodil se jako Václav, syn Jana Lucemburského a Elišky Přemyslovny. Sedm let vyrůstal u francouzského dvora a jméno Karel přijal na počest francouzského krále. Českým králem byl korunován v roce 1347, o osm let později v Římě císařem. Z Prahy udělal jedno z center Evropy a zemřel 29. listopadu 1378 ve věku 62 let.",
    facts: [
      "v jediném roce 1348 založil univerzitu i celé Nové Město pražské?",
      "jeho Zlatá bula z roku 1356 určovala pravidla volby římského krále?",
      "po celý život sbíral ostatky svatých?",
      "základní kámen Karlova mostu položil v roce 1357?",
      "na císaře ho v Římě korunovali 5. dubna 1355?",
    ],
    sources: [
      {
        label: "Wikipedie",
        url: "https://en.wikipedia.org/wiki/Charles_IV,_Holy_Roman_Emperor",
      },
      { label: "Prague.eu", url: "https://prague.eu/en/2024/03/13/charles-iv-the-greatest-czech" },
      {
        label: "Novinky",
        url: "https://www.novinky.cz/clanek/veda-skoly-pred-660-lety-polozil-karel-iv-zakladni-kamen-mostu-ktery-z-prahy-udelal-velemesto-40039120",
      },
    ],
  },
  "jiri-z-podebrad": {
    intro:
      "Narodil se 23. dubna 1420 nejspíš na hradě Poděbrady. V roce 1448 obsadil Prahu, od roku 1451 spravoval zemi za mladého Ladislava Pohrobka a 2. března 1458 ho stavy jednomyslně zvolily králem. Jako husita se dostal do sporu s papežem, který ho exkomunikoval. Zemřel 22. března 1471 v Praze.",
    facts: [
      "současníci mu říkali „přítel míru“ a „král dvojího lidu“?",
      "navrhoval evropským vládcům smlouvu o mírovém řešení sporů, ve které někteří vidí ranou představu sjednocené Evropy?",
      "Prahu obsadil s asi 9 000 muži téměř bez boje?",
      "papež Pius II. v roce 1462 prohlásil za neplatná kompaktáta, která husitům zaručovala jejich víru?",
      "proti němu se spojil uherský král Matyáš Korvín se vzbouřenou šlechtou?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/George_of_Pod%C4%9Bbrady" },
    ],
  },
  "rudolf-ii": {
    intro:
      "Narodil se 18. července 1552 ve Vídni a českým králem se stal v roce 1576. V roce 1583 přesunul svůj dvůr do Prahy, která se tak stala sídlem habsburské monarchie. Na Pražský hrad zval umělce, vědce i alchymisty. Kvůli sporům s bratrem Matyášem musel v roce 1611 českou korunu přenechat jemu a o rok později v Praze zemřel.",
    facts: [
      "na jeho dvoře působili slavní astronomové Tycho Brahe a Johannes Kepler?",
      "astronomické tabulky, které Kepler dokončil, nesou jeho jméno: Rudolfinské tabulky?",
      "jeho sbírka umění a kuriozit, Kunstkomora, patřila k nejrozsáhlejším v Evropě?",
      "v roce 1609 vydal Majestát, který českým protestantům dal větší náboženskou svobodu?",
      "zajímal se o alchymii a hledal bájný kámen mudrců?",
    ],
    sources: [
      {
        label: "Wikipedie",
        url: "https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Rudolf_II%2C_Holy_Roman_Emperor",
      },
      { label: "Radio Prague", url: "https://english.radio.cz/node/8796981" },
    ],
  },
  "marie-terezie": {
    intro:
      "Dcera císaře Karla VI. nastoupila na trůn v roce 1740 díky pragmatické sankci, která umožnila dědit trůn i ženám. Hned na začátku vlády jí pruský král Fridrich II. zabral většinu Slezska. Českou královnou byla korunována v Praze 12. května 1743 a vládla čtyřicet let, až do své smrti v roce 1780.",
    facts: [
      "během devatenácti let porodila šestnáct dětí?",
      "jejím manželem byl František Štěpán Lotrinský?",
      "v roce 1774 zavedla povinnou školní docházku pro děti od 6 do 12 let?",
      "povinnost šlo splnit i soukromým vyučováním, které si mohly dovolit hlavně bohatší rodiny?",
      "od roku 1765 s ní vládl její syn Josef II.?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Maria_Theresa" },
      {
        label: "ČT24",
        url: "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
      },
    ],
  },
  "josef-ii": {
    intro:
      "Nejstarší syn Marie Terezie se stal římským císařem v roce 1765. Do roku 1780 vládl spolu s matkou, pak sám až do své smrti v roce 1790. Jako osvícený panovník chtěl stát modernizovat reformami: zrušil nevolnictví, povolil další církve a rušil kláštery.",
    facts: [
      "nevolnický patent z 1. listopadu 1781 dovolil poddaným svobodně se ženit, stěhovat a volit si povolání, ale robotu nezrušil?",
      "toleranční patent z 13. října 1781 povolil luterány, kalvinisty a pravoslavné?",
      "nekatolické modlitebny se nesměly podobat kostelům?",
      "zrušil přes 500 z 1 188 klášterů?",
      "nechal svatováclavskou korunu převézt do Vídně?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Josephinism" },
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Serfdom_Patent_(1781)" },
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Patent_of_Toleration" },
    ],
  },
  "karel-i": {
    intro:
      "Narodil se 17. srpna 1887. Následníkem trůnu se stal v roce 1914 po atentátu na svého strýce Františka Ferdinanda v Sarajevu a v listopadu 1916, po smrti Františka Josefa I., nastoupil na trůn uprostřed první světové války. 11. listopadu 1918 se vzdal účasti na vládě, formálně ale neabdikoval. Zemřel v exilu na Madeiře 1. dubna 1922, bylo mu 34 let.",
    facts: [
      "byl posledním českým králem?",
      "v roce 1917 se pokusil o tajný mír s Francií, dnes se tomu říká Sixtova aféra?",
      "jeho manželkou byla Zita Bourbonsko-Parmská, vzali se v roce 1911?",
      "papež Jan Pavel II. ho 3. října 2004 prohlásil za blahoslaveného?",
      "zemřel v exilu v chudobě?",
    ],
    sources: [
      {
        label: "New World Encyclopedia",
        url: "https://www.newworldencyclopedia.org/entry/Charles_I_of_Austria",
      },
    ],
  },
};
