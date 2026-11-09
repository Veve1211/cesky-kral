// Chronicle content ("Kronika panovníka"), keyed by king slug.
// Content is provided by the project owner – do NOT change facts or wording
// without the owner's approval.
//
// Sections are shown in order; the intro is used only when there are none.
// Each fact continues the heading "Věděli jste, že…".
// A slug that is not (yet) in the seed's king list is skipped by the seed.

export type SeedChronicle = {
  /** Short intro – fallback when there are no sections. */
  intro: string;
  /** Longer chronicle split into headed sections (shown instead of the intro). */
  sections: { heading: string; text: string }[];
  facts: string[];
  sources: { label: string; url: string }[];
};

export const chronicles: Record<string, SeedChronicle> = {
  libuse: {
    intro:
      "Podle pověsti byla nejmladší a nejmoudřejší ze tří dcer vládce Kroka a uměla věštit budoucnost. Sídlila na Vyšehradě, na skále nad Vltavou. Když jí jeden muž ve sporu vyčetl, že je hanba, aby nad muži vládla žena, oznámila, že si vezme za manžela oráče Přemysla, a z jejich rodu vzešli Přemyslovci.",
    sections: [
      {
        heading: "Pověst",
        text: "Podle pověsti byla nejmladší ze tří dcer vládce Kroka. Její sestry Kazi a Teta byly také moudré, ale Libuše uměla věštit budoucnost, a proto po otci převzala vládu. Sídlila na Vyšehradě, na skále nad Vltavou.",
      },
      {
        heading: "Volba Přemysla",
        text: "Když jí jeden muž ve sporu vyčetl, že je hanba, aby nad muži vládla žena, rozhodla se vzít si manžela. Poslala posly za svým bílým koněm, který je dovedl do Stadic k oráči Přemyslovi. Jeho lísková hůl zaražená do země se zazelenala a vyrašily z ní tři větve, což bylo znamení, že má vládnout. Z jejich rodu pak podle pověsti vzešli Přemyslovci.",
      },
      {
        heading: "Odkaz pověsti",
        text: "Podle pověsti předpověděla slávu Prahy. Příběh poprvé zapsal kronikář Kosmas a díky Starým pověstem českým Aloise Jiráska z roku 1894 ho zná skoro každý. Smetanovou operou Libuše bylo otevřeno Národní divadlo.",
      },
    ],
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
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se kolem roku 907 v rodu Přemyslovců. Vychovávala ho babička Ludmila, kterou v roce 921 dali zavraždit na hradě Tetín. Zemi pak jako regentka spravovala Václavova matka Drahomíra, která byla nakonec ze země vyhnána.",
      },
      {
        heading: "Vláda",
        text: "Jako kníže podporoval křesťanství. Na Pražském hradě založil rotundu svatého Víta, ze které později vyrostla katedrála svatého Víta.",
      },
      {
        heading: "Smrt a odkaz",
        text: "Byl zavražděn ve Staré Boleslavi nejspíš roku 935, podle legendy na popud svého bratra Boleslava. Brzy po smrti začal být uctíván jako světec a patron české země a císař Ota I. mu přiznal královskou hodnost. Jeho svátek 28. září slavíme od roku 2000 jako Den české státnosti.",
      },
    ],
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
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se kolem roku 1155 jako syn knížete Vladislava II. a Jitky Durynské. Na trůn se nedostal snadno: krátce vládl v letech 1192–1193 a o vládu pak musel znovu usilovat.",
      },
      {
        heading: "Vláda",
        text: "V roce 1197 donutil svého bratra, aby se vzdal Čech a spokojil se s Moravou, a v roce 1198 se prohlásil králem. Korunován byl v Mohuči. V roce 1212 mu sicilský král Fridrich II. vydal Zlatou bulu sicilskou, která potvrdila, že královský titul budou dědit i jeho potomci.",
      },
      {
        heading: "Konec a odkaz",
        text: "Zemřel 15. prosince 1230 v Praze jako první dědičný český král. Jeho dcerou byla svatá Anežka Česká a na trůně ho vystřídal syn Václav I.",
      },
    ],
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
    sections: [
      {
        heading: "Mládí",
        text: "Byl synem krále Václava I. a na český trůn nastoupil v roce 1253. Sňatkem s Markétou Babenberskou upevnil nárok na Rakousy.",
      },
      {
        heading: "Vláda",
        text: "Později získal i Korutany a Kraňsko, takže jeho panství sahalo od Krkonoš až na území dnešního Slovinska. Pro bohatství a vojenskou sílu mu říkali král železný a zlatý. Založil asi 30 nových měst, mezi nimi České Budějovice. Když ale kurfiřti v roce 1273 zvolili římským králem Rudolfa Habsburského, začal spor, který skončil válkou.",
      },
      {
        heading: "Konec a odkaz",
        text: "Padl 26. srpna 1278 v bitvě na Moravském poli u Dürnkrutu. Trůn zdědil jeho teprve sedmiletý syn Václav II.",
      },
    ],
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
      "Narodil se roku 1271 jako jediný přeživší manželský syn Přemysla Otakara II. Když otec padl na Moravském poli, bylo mu sedm let a zemi spravoval braniborský markrabě Ota, který ho podle pramenů věznil. Do Čech se vrátil v roce 1283 a od roku 1290 vládl samostatně. Zemřel 21. června 1305, bylo mu teprve 33 let.",
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se roku 1271. Byl jediný přeživší manželský syn Přemysla Otakara II.; jeho nevlastní bratr Mikuláš Opavský byl nemanželským synem téhož krále. Po otcově smrti spravoval zemi braniborský markrabě Ota, který malého Václava podle pramenů věznil. Do Čech se vrátil v roce 1283 a velký vliv na něj měl Záviš z Falkenštejna, partner jeho matky. V roce 1290 dal Záviše kvůli údajné zradě popravit a začal vládnout samostatně.",
      },
      {
        heading: "Vláda",
        text: "Těžbu stříbra udělal královským monopolem, v roce 1300 vydal horní zákoník Ius regale montanorum a začal razit pražský groš. Téhož roku se nechal korunovat polským králem a v roce 1301 získal pro svého syna Václava III. uherskou korunu.",
      },
      {
        heading: "Konec a odkaz",
        text: "Zemřel 21. června 1305, bylo mu teprve 33 let. Plánoval založit univerzitu, to se ale podařilo až jeho vnukovi Karlu IV.",
      },
    ],
    facts: [
      "těžbu stříbra udělal královským monopolem a začal razit pražský groš?",
      "v roce 1300 vydal horní zákoník Ius regale montanorum?",
      "v roce 1300 se nechal korunovat i polským králem a jeho syn Václav III. se o rok později stal uherským králem?",
      "jeho první manželkou byla Jitka, dcera Rudolfa Habsburského, tedy muže, který porazil jeho otce?",
      "plánoval založit první univerzitu ve střední Evropě, a to dlouho před Karlem IV.?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Wenceslaus_II_of_Bohemia" },
      { label: "Statutární město Opava – Mikuláš I.", url: "https://www.opava-city.cz/cz/mesto-urad/o-meste/osobnosti/vladci/mikulas-vevoda-opavsky.html" },
    ],
  },
  "jan-lucembursky": {
    intro:
      "Narodil se roku 1296 v Lucembursku jako nejstarší syn císaře Jindřicha VII. a vyrůstal v Paříži. Ve čtrnácti letech se oženil s Eliškou Přemyslovnou a v únoru 1311 byl s ní korunován. Mnozí šlechtici ho brali jako krále cizince, protože správu Čech přenechával jiným a sám cestoval po Evropě. Padl 26. srpna 1346 v bitvě u Kresčaku.",
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se roku 1296 v Lucembursku jako nejstarší syn císaře Jindřicha VII. a vyrůstal v Paříži. Ve čtrnácti letech si vzal Elišku Přemyslovnu, dceru Václava II., a v únoru 1311 byli korunováni.",
      },
      {
        heading: "Vláda",
        text: "Často cestoval a správu Čech přenechával jiným, proto ho mnozí šlechtici považovali za krále cizince. Přesto k českému království připojil Chebsko a oblasti Budyšína a Zhořelce. Zrak ztrácel postupně: při výpravě do Litvy se mu výrazně zhoršil a později oslepl úplně.",
      },
      {
        heading: "Konec a odkaz",
        text: "I slepý se postavil do čela vojska v bitvě u Kresčaku, kde 26. srpna 1346 padl. Jeho ostatky jsou od roku 1945 uložené v katedrále Notre-Dame v Lucemburku. Jeho nejstarší syn Karel se stal nejslavnějším českým panovníkem.",
      },
    ],
    facts: [
      "zrak ztrácel postupně a v bitvě u Kresčaku už bojoval zcela slepý?",
      "i slepý se postavil do čela vojska v bitvě u Kresčaku proti Angličanům?",
      "k českému království připojil Chebsko a oblasti Budyšína a Zhořelce?",
      "jeho ostatky jsou od roku 1945 uložené v katedrále Notre-Dame v Lucemburku?",
      "jeho nejstarší syn Karel se stal nejslavnějším českým panovníkem?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/John_of_Bohemia" },
      { label: "Český rozhlas – Janova ztráta zraku", url: "https://dvojka.rozhlas.cz/120-schuzka-soukroma-podobizna-ceskeho-krale-jana-lucemburskeho-7939911" },
    ],
  },
  "karel-iv": {
    intro:
      "Narodil se jako Václav, syn Jana Lucemburského a Elišky Přemyslovny. Sedm let vyrůstal u francouzského dvora a jméno Karel přijal na počest francouzského krále. Českým králem byl korunován v roce 1347, o osm let později v Římě císařem. Z Prahy udělal jedno z center Evropy a zemřel 29. listopadu 1378 ve věku 62 let.",
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se jako Václav, syn Jana Lucemburského a Elišky Přemyslovny. Jako dítě ho poslali k francouzskému dvoru, kde strávil sedm let. Tam přijal jméno Karel na počest francouzského krále a oženil se s Blankou z Valois.",
      },
      {
        heading: "Vláda",
        text: "Když jeho otec v roce 1346 padl u Kresčaku, stal se Karel českým králem a korunovali ho 2. září 1347. V roce 1348 založil univerzitu i Nové Město pražské a z Prahy udělal jedno z center Evropy. V roce 1355 byl v Římě korunován císařem a o rok později vydal Zlatou bulu, která určovala pravidla volby římského krále. V roce 1357 položil základní kámen mostu, který dnes nese jeho jméno.",
      },
      {
        heading: "Konec a odkaz",
        text: "Zemřel 29. listopadu 1378 ve věku 62 let. Po celý život sbíral ostatky svatých a dbal na slávu svého království. Dodnes ho mnozí považují za největšího Čecha.",
      },
    ],
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
      { label: "Český rozhlas – život Karla IV.", url: "https://archiv.radio.cz/cz/static/karel-iv/vita-caroli" },
      { label: "Český rozhlas – Karlova Praha", url: "https://archiv.radio.cz/cz/static/karel-iv/praha" },
      {
        label: "Novinky",
        url: "https://www.novinky.cz/clanek/veda-skoly-pred-660-lety-polozil-karel-iv-zakladni-kamen-mostu-ktery-z-prahy-udelal-velemesto-40039120",
      },
    ],
  },
  "jiri-z-podebrad": {
    intro:
      "Narodil se 23. dubna 1420 nejspíš na hradě Poděbrady. V roce 1448 obsadil Prahu, od roku 1451 spravoval zemi za mladého Ladislava Pohrobka a 2. března 1458 ho stavy jednomyslně zvolily králem. Jako husita se dostal do sporu s papežem, který ho exkomunikoval. Zemřel 22. března 1471 v Praze.",
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se 23. dubna 1420 nejspíš na hradě Poděbrady a hlásil se k umírněným husitům. V roce 1448 vytáhl z Kutné Hory s asi 9 000 muži a téměř bez boje obsadil Prahu.",
      },
      {
        heading: "Vláda",
        text: "Od roku 1451 spravoval zemi za mladého krále Ladislava Pohrobka a 2. března 1458 ho stavy jednomyslně zvolily králem. Navrhoval evropským vládcům smlouvu o mírovém řešení sporů, ve které někteří vidí ranou představu sjednocené Evropy.",
      },
      {
        heading: "Konec a odkaz",
        text: "Papež Pius II. v roce 1462 prohlásil za neplatná kompaktáta, která husitům zaručovala jejich víru, a papež Pavel II. Jiřího v roce 1466 exkomunikoval. Proti němu se spojil uherský král Matyáš Korvín se vzbouřenou šlechtou. Jiří zemřel 22. března 1471 v Praze. Současníci mu říkali „přítel míru“ a „král dvojího lidu“.",
      },
    ],
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
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se 18. července 1552 ve Vídni jako příslušník rodu Habsburků. Českým králem se stal v roce 1576.",
      },
      {
        heading: "Vláda",
        text: "V roce 1583 přesunul svůj dvůr do Prahy, která se tak stala sídlem habsburské monarchie. Na Pražský hrad zval umělce, vědce i alchymisty: působili tu astronomové Tycho Brahe a Johannes Kepler a malíř Giuseppe Arcimboldo. Jeho sbírka umění a kuriozit, Kunstkomora, patřila k nejrozsáhlejším v Evropě. V roce 1609 vydal Majestát, který českým protestantům dal větší náboženskou svobodu.",
      },
      {
        heading: "Konec a odkaz",
        text: "Kvůli sporům s bratrem Matyášem musel v roce 1611 přenechat českou korunu jemu a o rok později v Praze zemřel. Astronomické tabulky, které dokončil Kepler, nesou jeho jméno: Rudolfinské tabulky.",
      },
    ],
    facts: [
      "na jeho dvoře působili slavní astronomové Tycho Brahe a Johannes Kepler?",
      "astronomické tabulky, které Kepler dokončil, nesou jeho jméno: Rudolfinské tabulky?",
      "jeho sbírka umění a kuriozit, Kunstkomora, patřila k nejrozsáhlejším v Evropě?",
      "v roce 1609 vydal Majestát, který českým protestantům dal větší náboženskou svobodu?",
      "zajímal se o alchymii a hledal bájný kámen mudrců?",
    ],
    sources: [
      {
        label: "Knihovna Akademie věd ČR – Rudolf II.",
        url: "https://lib.cas.cz/casopis-informace/rudolf-ii/",
      },
      { label: "Radio Prague", url: "https://english.radio.cz/node/8796981" },
      { label: "Historický ústav AV ČR – Tycho Brahe a Rudolfinské tabulky", url: "https://biography.hiu.cas.cz/wiki/BRAHE_Tycho_14.12.1546-24.10.1601" },
    ],
  },
  "marie-terezie": {
    intro:
      "Dcera císaře Karla VI. nastoupila na trůn v roce 1740 díky pragmatické sankci, která umožnila dědit trůn i ženám. Hned na začátku vlády jí pruský král Fridrich II. zabral většinu Slezska. Českou královnou byla korunována v Praze 12. května 1743 a vládla čtyřicet let, až do své smrti v roce 1780.",
    sections: [
      {
        heading: "Mládí",
        text: "Byla dcerou císaře Karla VI. Protože neměl syna, umožnila jí nástup na trůn pragmatická sankce. Jejím manželem byl František Štěpán Lotrinský.",
      },
      {
        heading: "Vláda",
        text: "Na trůn nastoupila v roce 1740 a hned na začátku jí pruský král Fridrich II. zabral většinu Slezska. Českou královnou byla korunována 12. května 1743 v katedrále svatého Víta v Praze. Prosadila řadu reforem a Všeobecným školním řádem z roku 1774 zavedla vzdělávací povinnost pro děti od 6 do 12 let. Nešlo o bezvýjimečnou docházku do školy: povinnost bylo možné plnit i domácím vyučováním, dostupným hlavně zámožným rodinám. Od roku 1765 s ní vládl její syn Josef II.",
      },
      {
        heading: "Konec a odkaz",
        text: "Zemřela v roce 1780 po čtyřiceti letech vlády. Během devatenácti let porodila šestnáct dětí.",
      },
    ],
    facts: [
      "během devatenácti let porodila šestnáct dětí?",
      "jejím manželem byl František Štěpán Lotrinský?",
      "Všeobecný školní řád z roku 1774 stanovil vzdělávací povinnost pro děti od 6 do 12 let?",
      "vzdělávací povinnost šlo splnit i domácím vyučováním, které si mohly dovolit hlavně zámožné rodiny?",
      "od roku 1765 s ní vládl její syn Josef II.?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Maria_Theresa" },
      { label: "Národní pedagogické muzeum – školní řád z roku 1774", url: "https://npmk.gov.cz/novinky/muzeum-npmk/skolni-rad-po-250-letech" },
      {
        label: "ČT24",
        url: "https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103",
      },
    ],
  },
  "josef-ii": {
    intro:
      "Nejstarší syn Marie Terezie se stal římským císařem v roce 1765. Do roku 1780 vládl spolu s matkou, pak sám až do své smrti v roce 1790. Jako osvícený panovník chtěl stát modernizovat reformami: zrušil nevolnictví, povolil další církve a rušil kláštery.",
    sections: [
      {
        heading: "Mládí",
        text: "Byl nejstarším synem Marie Terezie a Františka Štěpána Lotrinského. Po otcově smrti se v roce 1765 stal římským císařem a v habsburských zemích vládl spolu s matkou.",
      },
      {
        heading: "Vláda",
        text: "Po matčině smrti v roce 1780 vládl sám a jako osvícený panovník prosazoval rychlé reformy. Tolerančním patentem z 13. října 1781 povolil luterány, kalvinisty a pravoslavné a patentem z 1. listopadu 1781 zrušil nevolnictví. Poddaní se mohli svobodně ženit, stěhovat a volit si povolání. Zrušil přes 500 z 1 188 klášterů a svatováclavskou korunu nechal převézt do Vídně.",
      },
      {
        heading: "Konec a odkaz",
        text: "Zemřel v roce 1790. Robotu, tedy povinnou práci pro vrchnost, jeho reformy nezrušily.",
      },
    ],
    facts: [
      "Josef II. patentem z 1. listopadu 1781 zrušil nevolnictví a poddaným dovolil svobodně se ženit, stěhovat a volit si povolání, ale robotu nezrušil?",
      "toleranční patent z 13. října 1781 povolil luterány, kalvinisty a pravoslavné?",
      "nekatolické modlitebny se nesměly podobat kostelům?",
      "zrušil přes 500 z 1 188 klášterů?",
      "nechal svatováclavskou korunu převézt do Vídně?",
    ],
    sources: [
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Josephinism" },
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Serfdom_Patent_(1781)" },
      { label: "Národní archiv – patent o zrušení nevolnictví", url: "https://www.nacr.cz/labyrint/labyrintem-dejin-ceskych-zemi/mezi-absolutismem-a-obcanskou-revoluci/rok-1781" },
      { label: "Wikipedie", url: "https://en.wikipedia.org/wiki/Patent_of_Toleration" },
    ],
  },
  "karel-i": {
    intro:
      "Narodil se 17. srpna 1887. Následníkem trůnu se stal v roce 1914 po atentátu na svého strýce Františka Ferdinanda v Sarajevu a v listopadu 1916, po smrti Františka Josefa I., nastoupil na trůn uprostřed první světové války. 11. listopadu 1918 se vzdal účasti na vládě, formálně ale neabdikoval. Zemřel v exilu na Madeiře 1. dubna 1922, bylo mu 34 let.",
    sections: [
      {
        heading: "Mládí",
        text: "Narodil se 17. srpna 1887. V roce 1911 si vzal Zitu Bourbonsko-Parmskou. Následníkem trůnu se stal v roce 1914 po atentátu na svého strýce Františka Ferdinanda v Sarajevu.",
      },
      {
        heading: "Vláda",
        text: "Na trůn nastoupil v listopadu 1916 po smrti svého prastrýce Františka Josefa I., uprostřed první světové války. V roce 1917 se pokusil o tajný mír s Francií, ale tato jednání, dnes nazývaná Sixtova aféra, skončila neúspěchem.",
      },
      {
        heading: "Konec a odkaz",
        text: "11. listopadu 1918 se vzdal účasti na vládě, formálně ale neabdikoval. Zemřel v chudobě v exilu na Madeiře 1. dubna 1922 ve věku 34 let. Papež Jan Pavel II. ho v roce 2004 prohlásil za blahoslaveného. Byl posledním českým králem. Jako český král byl třetím Karlem (po Karlu IV. a Karlu VI.), tedy Karlem III., toto označení se ale v Čechách nevžilo a za první republiky se mu říkalo „Karel Poslední“.",
      },
    ],
    facts: [
      "byl posledním českým králem?",
      "jako český král byl Karlem III., i když se mu tak v Čechách neříkalo?",
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
      { label: "Wikipedie – Karel I.", url: "https://cs.wikipedia.org/wiki/Karel_I." },
    ],
  },

  // Batch 6 chronicles: every fact comes from the Czech Wikipedia article
  // listed in `sources` (the same article that backs the ruler's questions).
  "vratislav-ii": {
    intro:
      "Narodil se okolo roku 1033 jako druhorozený syn knížete Břetislava I. Českým knížetem se stal v roce 1061 a v roce 1085 získal od císaře Jindřicha IV. královskou korunu jako první český král z rodu Přemyslovců. Zemřel 14. ledna 1092 na zranění po pádu z koně.",
    sections: [
      {
        heading: "Kníže",
        text: "Narodil se okolo roku 1033 jako druhorozený syn knížete Břetislava I. a Jitky ze Svinibrodu. Po otci zdědil olomoucký úděl a v roce 1061, po smrti staršího bratra Spytihněva II., se stal českým knížetem. V roce 1063 rozdělil českou diecézi na dvě a v Olomouci zřídil biskupství pro Moravu.",
      },
      {
        heading: "Královská koruna",
        text: "Byl věrným spojencem císaře Jindřicha IV. Za své služby od něj v dubnu 1085 na sjezdu v Mohuči dostal královskou korunu, ale jen pro svou osobu, ne dědičnou. 15. června 1086 ho na Pražském hradě korunoval králem trevírský arcibiskup Egilbert. U příležitosti korunovace vznikl Kodex vyšehradský.",
      },
      {
        heading: "Poslední léta",
        text: "Konec jeho vlády provázely spory v přemyslovském rodě. Při obléhání Brna v roce 1091 se proti němu vzbouřil jeho vlastní syn Břetislav. Zemřel v polovině ledna 1092 na zranění po pádu z koně a byl pohřben ve vyšehradském klášteře, jeho hrob se ale dosud nepodařilo najít.",
      },
    ],
    facts: [
      "jako kníže byl Vratislavem II., ale jako král Vratislavem I.?",
      "založil vyšehradskou kapitulu, která podléhala přímo Římu?",
      "u příležitosti jeho korunovace vznikl Kodex vyšehradský?",
      "byl třikrát ženatý a jeho druhou manželkou byla uherská princezna Adléta?",
      "jeho hrob ve vyšehradském klášteře se dosud nepodařilo najít?",
    ],
    sources: [{ label: "Wikipedie", url: "https://cs.wikipedia.org/wiki/Vratislav_II." }],
  },
  "vaclav-iv": {
    intro:
      "Narodil se 26. února 1361 v Norimberku jako syn císaře Karla IV. Českým králem byl korunován už jako dvouletý a po otcově smrti v roce 1378 vládl 41 let. Za jeho vlády se rozvinulo hnutí české reformace. Zemřel 16. srpna 1419 na Novém hradě u Kunratic.",
    sections: [
      {
        heading: "Syn císaře",
        text: "Narodil se 26. února 1361 v Norimberku jako syn císaře Karla IV. a Anny Svídnické. Otec ho nechal 15. června 1363 korunovat českým králem, když mu byly teprve dva roky. Jako patnáctiletý byl v roce 1376 zvolen také římským králem.",
      },
      {
        heading: "Král a šlechta",
        text: "Na trůn nastoupil jako sedmnáctiletý v roce 1378 po smrti Karla IV. Dostal se do sporu s vyšší šlechtou i s pražským arcibiskupem a v roce 1393 byl umučen Jan z Pomuku, později svatořečený Jan Nepomucký. V roce 1394 ho šlechta zajala a v roce 1400 ho kurfiřti sesadili z římského trůnu.",
      },
      {
        heading: "Hus a konec vlády",
        text: "Zpočátku podporoval Jana Husa, což vyvrcholilo v roce 1409 Dekretem kutnohorským. Zprávu o první pražské defenestraci se dozvěděl v ústraní a zemřel 16. srpna 1419 na Novém hradě u Kunratic. Zemřel bezdětný a jeho nástupcem se stal bratr Zikmund Lucemburský.",
      },
    ],
    facts: [
      "vládl 41 let, do té doby nejdéle ze všech českých králů?",
      "jako sedmiletý napsal otci latinský dopis plný chyb, takže ho psal opravdu sám?",
      "byl velkým milovníkem zvířat a v královské zahradě na místě dnešního Obecního domu měl lvinec?",
      "kurfiřti ho v roce 1400 sesadili jako krále „nepotřebného, nečinného i nedbalého“?",
      "husité v roce 1420 vyplenili Zbraslavský klášter a jeho tělo vytáhli z hrobu?",
    ],
    sources: [{ label: "Wikipedie", url: "https://cs.wikipedia.org/wiki/V%C3%A1clav_IV." }],
  },
  "vladislav-ii-jagellonsky": {
    intro:
      "Narodil se 1. března 1456 v Krakově v polsko-litevském rodu Jagellonců. Českým králem byl zvolen v roce 1471 jako patnáctiletý a od roku 1490 byl i králem uherským. Pro svou smířlivou povahu dostal přezdívku „král Bene“. Zemřel 13. března 1516 v Budíně.",
    sections: [
      {
        heading: "Volba krále",
        text: "Narodil se 1. března 1456 v Krakově jako syn polského krále Kazimíra IV. Jiří z Poděbrad se vzdal nároků svých synů a nabídl českou korunu Jagelloncům. Po Jiřího smrti zvolil sněm v Kutné Hoře 27. května 1471 patnáctiletého Vladislava českým králem.",
      },
      {
        heading: "Dva čeští králové",
        text: "Českým králem se nechal korunovat i uherský král Matyáš Korvín a mezi oběma vypukla válka. Olomouckými úmluvami v roce 1479 se dohodli, že titul českého krále budou užívat oba: Vladislav vládl v Čechách a Matyáš na Moravě, ve Slezsku a v Lužici. Po Matyášově smrti byl Vladislav v roce 1490 zvolen i uherským králem a přesídlil do Budína.",
      },
      {
        heading: "„Král Bene“",
        text: "Byl mírné, až flegmatické povahy a spory se snažil řešit smírně, a tak se mezi panstvem vžila jeho přezdívka „král Bene“, tedy „král Dobře“. Šlechta toho využila: Vladislavské zřízení zemské z roku 1500 výrazně omezilo královskou moc. Zemřel 13. března 1516 v Budíně.",
      },
    ],
    facts: [
      "jeho matce se říkalo „matka králů“, protože se čtyři její synové stali králi?",
      "mezi panstvem se vžila jeho přezdívka „král Bene“, tedy „král Dobře“?",
      "jako král jednu dobu sdílel titul českého krále s Matyášem Korvínem?",
      "měl značný smysl pro humor a rád pořádal rytířské turnaje?",
    ],
    sources: [{ label: "Wikipedie", url: "https://cs.wikipedia.org/wiki/Vladislav_Jagellonsk%C3%BD" }],
  },
  "ferdinand-i": {
    intro:
      "Narodil se 10. března 1503 ve španělském Alcalá de Henares. Díky sňatku s Annou Jagellonskou byl v roce 1526 zvolen českým králem. Od roku 1556 byl také římským císařem. Zemřel 25. července 1564 ve Vídni.",
    sections: [
      {
        heading: "Mládí ve Španělsku",
        text: "Narodil se 10. března 1503 na zámku Alcalá de Henares nedaleko Madridu jako syn Filipa I. Sličného a Jany Šílené. Dětství prožil ve Španělsku. Když v roce 1521 přišel do Vídně, byl vnímán jako cizinec a neuměl německy.",
      },
      {
        heading: "Cesta na český trůn",
        text: "26. května 1521 se oženil s Annou Jagellonskou, sestrou českého a uherského krále Ludvíka. Když Ludvík v roce 1526 padl v bitvě u Moháče bez potomků, zvolil český sněm 23. října 1526 Ferdinanda českým králem. Korunován byl 24. února 1527 v katedrále sv. Víta.",
      },
      {
        heading: "Vláda a odkaz",
        text: "Byl zastáncem absolutismu, a proto se dostal do sporu s českými stavy. Povstání z let 1546–1547 potlačil a městům vzal politická práva. V roce 1556 pozval do Čech jezuity. Zemřel 25. července 1564 ve Vídni a podle svého přání byl pohřben v chrámu sv. Víta vedle manželky Anny.",
      },
    ],
    facts: [
      "se svým starším bratrem, pozdějším císařem Karlem V., se poprvé v životě setkal až v roce 1517?",
      "s manželkou Annou Jagellonskou měl patnáct dětí?",
      "před volbou slíbil, že uhradí polovinu dluhu české státní pokladny?",
      "v roce 1556 pozval do Čech jezuity?",
    ],
    sources: [{ label: "Wikipedie", url: "https://cs.wikipedia.org/wiki/Ferdinand_I._Habsbursk%C3%BD" }],
  },
  "fridrich-falcky": {
    intro:
      "Narodil se 26. srpna 1596 a byl falckým kurfiřtem. Čeští stavové ho v roce 1619 zvolili králem místo sesazeného Ferdinanda II. Po prohrané bitvě na Bílé hoře 8. listopadu 1620 z Prahy uprchl. Kvůli tak krátké vládě se mu říká „zimní král“. Zemřel 29. listopadu 1632 v Mohuči.",
    sections: [
      {
        heading: "Kurfiřt z Falce",
        text: "Narodil se 26. srpna 1596 v rodu falckých Wittelsbachů. Byl kalvinista a stál v čele Protestantské unie. V roce 1613 se oženil s Alžbětou, dcerou anglického a skotského krále Jakuba I.",
      },
      {
        heading: "Zvolený král",
        text: "Po pražské defenestraci v roce 1618 vypuklo české stavovské povstání a v srpnu 1619 sněm prohlásil Ferdinanda II. za sesazeného. Fridrich po váhání nabídku koruny přijal a 4. listopadu 1619 byl korunován českým králem. Jeho dvorní kazatel krátce nato nechal z katedrály sv. Víta odvézt nebo zničit vzácná díla náboženského umění, což lid velmi pobouřilo.",
      },
      {
        heading: "Zimní král",
        text: "Slibovaná pomoc anglického krále a protestantských spojenců nepřišla. Po bitvě na Bílé hoře 8. listopadu 1620 opustil Pražský hrad, rok a čtyři dny po své korunovaci. Přišel o všechny své země a zemřel 29. listopadu 1632 v Mohuči. Dodnes není známo, kde leží jeho tělo.",
      },
    ],
    facts: [
      "už v roce 1619 ho skeptici nazývali „zimním králem“?",
      "Prahu opustil přesně rok a čtyři dny po své korunovaci?",
      "s manželkou Alžbětou měl třináct dětí?",
      "jeho dcera Žofie byla matkou Jiřího I., prvního anglického krále z hannoverského rodu?",
      "jeho jediný pomník v Čechách stojí od roku 2010 v Pyšelích?",
    ],
    sources: [{ label: "Wikipedie", url: "https://cs.wikipedia.org/wiki/Fridrich_Falck%C3%BD" }],
  },
  "frantisek-josef-i": {
    intro:
      "Narodil se 18. srpna 1830 na zámku Schönbrunn ve Vídni. Císařem se stal v osmnácti letech v roce 1848 a vládl téměř 68 let. Českým králem byl, ale nikdy se nenechal korunovat. Zemřel 21. listopadu 1916 uprostřed první světové války.",
    sections: [
      {
        heading: "Mladý císař",
        text: "Narodil se 18. srpna 1830 na zámku Schönbrunn ve Vídni. Jako dítě se učil několik cizích jazyků, mimo jiné i češtinu. Na trůn nastoupil v osmnácti letech 2. prosince 1848 v Olomouci, po abdikaci svého strýce Ferdinanda Dobrotivého.",
      },
      {
        heading: "Rakousko-Uhersko",
        text: "Zpočátku vládl absolutisticky, ale po prohraných válkách v letech 1859 a 1866 postupně přešel ke konstituční vládě. V roce 1867 vzniklo rakousko-uherské vyrovnání a František Josef byl korunován uherským králem. Českým králem nebyl nikdy korunován.",
      },
      {
        heading: "Rodina a konec",
        text: "V roce 1854 se oženil se sestřenicí Alžbětou Bavorskou, známou jako Sisi. Jeho život poznamenala řada tragédií: syn Rudolf zemřel v roce 1889 a manželku Alžbětu v roce 1898 zavraždil anarchista. Zemřel 21. listopadu 1916 ve Vídni uprostřed první světové války a na trůn po něm nastoupil Karel I.",
      },
    ],
    facts: [
      "vládl téměř 68 let, což ho řadí mezi nejdéle vládnoucí panovníky světové historie?",
      "jako malému mu přezdívali „solný princ“?",
      "byl českým králem, ale nikdy se nenechal korunovat?",
      "jeho manželkou byla Alžběta Bavorská, známá jako Sisi?",
    ],
    sources: [{ label: "Wikipedie", url: "https://cs.wikipedia.org/wiki/Franti%C5%A1ek_Josef_I." }],
  },
};
