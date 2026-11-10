# Audit celé hry (10. 11. 2026)

Prošel jsem hru jako nový i vracející se hráč na mobilu (iPhone 13) i desktopu: úvod, hra o kartu,
mistrovské kolo, Denní výzva, Rychlovka, Kdo vládl dřív?, Řeka času, Žebříčky, Můj erb, Moje sbírka,
Jak hrát, Zdroje, 404. K tomu kontrola všech 162 otázek a 18 kronik proti zdrojům.
Stav: ✅ opraveno · 🔧 opravuje se v uvedeném PR · ⏳ po odevzdání · ⏸ vědomě ponecháno (s důvodem).

## Vysoká závažnost

1. ✅ (PR 1) **Fakta.** 2 nepřesnosti a 3 neověřitelné detaily v otázkách a kronikách (tabulka v
   `docs/historical-content.md`, část „Audit faktů 10. 11.“).
2. ✅ (PR 2) **Hra začíná pod okrajem obrazovky.** Hra o kartu: portrét vedle jména, menší mezery, bez
   zamčeného tlačítka – první otázka je na mobilu (iPhone 13) i desktopu vidět bez posouvání (test
   `e2e/first-impression.spec.ts`). ⏳ Po odevzdání: totéž zkontrolovat u Denní výzvy, Rychlovky,
   Kdo vládl dřív? a Řeky času.
3. ✅ (PR 2) **Přehlcený první dojem.** Pod nadpisem je jedna věta, o čem hra je, a hned pod ní
   velké „Začni hrát“ – na mobilu obojí bez posouvání (test). ⏳ Po odevzdání: postupné odhalování
   (zpočátku jen hra o kartu a galerie, erb a Denní výzva po první kartě, další režimy po několika),
   menu „Více“ na mobilu, nápověda v prvním kole – větší zásah, který se ve spěchu nedělá.

## Střední závažnost

4. ✅ (PR 2) Nezískaný panovník už neukazuje zamčené tlačítko „Mistrovské kolo“ (u získaného zůstává).
5. ⏳ Po odevzdání: Po první kartě oslava nabízí víc cest (sbírka, kronika, erb, Pokračovat); chybí jeden jasný další krok.
6. 🔧 (PR 4) Text „Kdo to byl? … popis i roky vlády se odemknou“ – u pověstí roky nejsou a u kněžny/královny
   „byl“ nesedí (hrají i holky).
7. 🔧 (PR 4) Stránka 404 říká „Tohoto krále neznáme“ i u adres, které s panovníky nesouvisí.
8. 🔧 (PR 4) Groš: nové pravidlo – jedno tlačítko na stránce, místa dle zadání, malý odkaz v patičce.
9. 🔧 (PR 4) Jak hrát musí popsat postupné odemykání režimů z PR 2.

## Nízká závažnost

10. ⏸ **Zdroje z Wikipedie.** 99 ze 162 otázek má stále zdroj Wikipedie (dřív 118). Z tohoto prostředí jsou
    dostupné jen archiv Českého rozhlasu, Národní archiv, Knihovna a Historický ústav AV ČR; weby
    rozhlas.cz, Pražský hrad, Národní památkový ústav aj. jsou blokované. Kde to šlo, je zdroj nahrazen
    Biografickým slovníkem českých zemí (AV ČR). Fakta jsou ověřena, jen zdroj by šel ještě „povýšit“.
11. ⏸ Pět původních zdrojů je odsud nedostupných (prague.eu, rozhlas Dvojka, New World Encyclopedia,
    Novinky, web Opavy). Otázky Libuše, Karla I. a Karlova mostu mají nově ověřený zdroj; Janova slepota
    (rozhlas Dvojka) byla ověřena 8. 11. a v české Wikipedii sedí s postupnou ztrátou zraku.
12. ⏸ Soukromí: postup jen v prohlížeči, na serveru přezdívka, skóre, parametry erbu a otisk tokenu.
    Kód pro přenos nese token až 30 minut (popsáno v `security_warnings.md`). Bez nálezu.
13. ⏸ Náhledy při sdílení fungují (roboti dostanou metadata v `<head>`), přístupnost kvízu a omezený pohyb
    pokrývají testy. Bez nálezu.
14. ⏸ Data v prohlížeči (roky, popisy) jsou čitelná ve zdroji stránky – vědomě, hra není ochrana proti
    podvádění; skóre do žebříčků počítá server.
