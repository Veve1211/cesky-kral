# Ověření historického obsahu

Ověřeno 8. listopadu 2026 při opravě historických nedostatků z auditu.
Obsah zůstává v `prisma/seed-data.ts` (108 otázek) a `prisma/chronicles.ts`;
`prisma/seed.ts` obě sady při seedování zapisuje do databáze.

| Téma | Ověřený závěr | Zdroje |
| --- | --- | --- |
| Josef II. | Patentem z 1. listopadu 1781 zrušil nevolnictví. Nezaměňovat se zrušením roboty. | [Národní archiv – patent](https://www.nacr.cz/labyrint/labyrintem-dejin-ceskych-zemi/mezi-absolutismem-a-obcanskou-revoluci/rok-1781), [dosavadní přehled nevolnického patentu](https://en.wikipedia.org/wiki/Serfdom_Patent_(1781)) |
| Marie Terezie | Všeobecný školní řád z roku 1774 stanovil všeobecnou vzdělávací (vyučovací) povinnost pro děti od 6 do 12 let. Bylo možné plnit ji i domácím vyučováním; nešlo o bezvýjimečnou docházku do školy. | [Národní pedagogické muzeum a knihovna J. A. Komenského](https://npmk.gov.cz/novinky/muzeum-npmk/skolni-rad-po-250-letech), [ČT – Historie.cs, rozhovor s historiky](https://ct24.ceskatelevize.cz/clanek/archiv/macecha-a-reformator-221103) |
| Václav II. | Jediný přeživší **manželský** syn Přemysla Otakara II. Mikuláš Opavský byl nemanželský syn téhož panovníka a Václavův nevlastní bratr. | [Statutární město Opava – Mikuláš I.](https://www.opava-city.cz/cz/mesto-urad/o-meste/osobnosti/vladci/mikulas-vevoda-opavsky.html) |
| Jan Lucemburský | Zrak ztrácel postupně; při výpravě do Litvy se mu zhoršil a později oslepl úplně. Otázka nyní rozlišuje zhoršení zraku při výpravě od pozdější úplné slepoty. | [Český rozhlas – Soukromá podobizna krále Jana](https://dvojka.rozhlas.cz/120-schuzka-soukroma-podobizna-ceskeho-krale-jana-lucemburskeho-7939911) |
| Karel IV. | Nefunkční odkaz Prague.eu nahrazuje životopis Českého rozhlasu; otázky na založení univerzity a Nového Města mají konkrétní zdroj o Karlově Praze. | [Český rozhlas – životopis](https://archiv.radio.cz/cz/static/karel-iv/vita-caroli), [Karlova Praha](https://archiv.radio.cz/cz/static/karel-iv/praha) |
| Rudolf II. | Nefunkční zrcadlo Wikipedie nahrazuje český životopis Knihovny AV ČR. Otázka na Rudolfinské tabulky dostává vlastní zdroj o práci Braha a Keplera. | [Knihovna AV ČR – Rudolf II.](https://lib.cas.cz/casopis-informace/rudolf-ii/), [Historický ústav AV ČR – Tycho Brahe](https://biography.hiu.cas.cz/wiki/BRAHE_Tycho_14.12.1546-24.10.1601) |

## Janova ztráta zraku

Dosavadní [anglická Wikipedie](https://en.wikipedia.org/wiki/John_of_Bohemia)
uvádí ztrátu zraku roku 1336, [archiv Českého rozhlasu](https://archiv.radio.cz/cz/static/lucemburkove/jan-lucembursky)
uvádí oslepnutí roku 1339. Podrobný pořad Českého rozhlasu popisuje postupné
zhoršování zraku a pozdější úplné oslepnutí během léčení ve Francii.
Proto otázky, vysvětlení i kronika nepřipisují úplné oslepnutí výpravě do Litvy,
neuvádějí sporný rok ani pevný počet let slepoty. Přesná diagnóza se netvrdí.

## Rozsah změn a testů

- Zůstává 12 panovníků a všech 108 otázek, po 3 lehkých, středních a těžkých na panovníka.
- Jediná změna správné odpovědi: u školního řádu z roku 1774 je přesnější
  „Všeobecnou vzdělávací povinnost“ místo „Povinnou školní docházku“; opírá se o muzeum a rozhovor historiků v ČT.
- Odpověď na věk dětí 6–12 let i odpověď na Janovu výpravu do Litvy zůstávají stejné;
  zpřesněno je znění otázek a vysvětlení. Ostatní správné odpovědi se nemění.
- `e2e/historical-content.spec.ts` kontroluje ověřené výroky, počet a strukturu
  otázek, odstranění nefunkčních URL, zobrazení kronik z testovací DB a Janovu
  otázku ve zlatém kole na desktopu i mobilu.
- Regresní testy běží bez externí sítě. Odkazy byly při této revizi zkontrolovány
  samostatně; testy nezaručují jejich budoucí dostupnost ani nenahrazují historickou revizi.

## Dávka 6: šest nových panovníků (9. 11. 2026)

Přidáno na výslovný pokyn majitele projektu (úkol 2). Každý fakt v otázce,
odpovědi i vysvětlení byl ověřen v uvedeném článku české Wikipedie (staženo
9. 11. 2026); co v článku nebylo, do otázek nešlo. Špatné odpovědi jsou
zvolené tak, aby byly podle zdroje jednoznačně nesprávné. Obrázky zatím nejsou
(erb s iniciálou), dokud se neověří volné dílo na Commons.

| Panovník | Roky vlády (Čechy) | Otázky | Zdroj |
| --- | --- | --- | --- |
| Vratislav II. | 1061–1092 (kníže, od 1085 král) | 9 (3/3/3) | https://cs.wikipedia.org/wiki/Vratislav_II. |
| Václav IV. | 1378–1419 | 9 (3/3/3) | https://cs.wikipedia.org/wiki/V%C3%A1clav_IV. |
| Vladislav II. Jagellonský | 1471–1516 | 9 (3/3/3) | https://cs.wikipedia.org/wiki/Vladislav_Jagellonsk%C3%BD |
| Ferdinand I. | 1526–1564 | 9 (3/3/3) | https://cs.wikipedia.org/wiki/Ferdinand_I._Habsbursk%C3%BD |
| Fridrich Falcký | 1619–1620 | 9 (3/3/3) | https://cs.wikipedia.org/wiki/Fridrich_Falck%C3%BD |
| František Josef I. | 1848–1916 | 9 (3/3/3) | https://cs.wikipedia.org/wiki/Franti%C5%A1ek_Josef_I. |

Celkem 18 panovníků a 162 otázek. Regrese `e2e/new-rulers.spec.ts` hlídá
roky, strukturu, zdroje, duplicity napříč všemi otázkami a pořadí podle doby.
