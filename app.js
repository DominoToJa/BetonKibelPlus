'use strict';
import { SHAPES, cleanDims, geoCapacity, volumeUpTo, bucketModel, migrateProfile } from './geometry.js';

const $ = id => document.getElementById(id), KEY = 'beton09', HKEY = 'beton09history';
const NATIVE = window.BKPnative || {};
const NV = NATIVE.voice || { available: false };
const nativeVoice = !!(NATIVE.isNative && NV.available);

// ───────────────────────── teksty lektora ─────────────────────────
const DEFAULT_TEXTS = {
"hello": "Cześć! Gotowa do roboty.\nSiema! Lejemy dziś?\nDzień dobry, szefie.\nHej, dobrze cię słyszeć.\nWitaj na budowie. Ja liczę, ty lejesz.\nCześć, cześć. Kawa już była?",
"howAreYou": "Dobrze, dopóki beton leje się równo.\nSuper. A ty jak?\nŚwietnie, liczydło mam rozgrzane.\nWszystko gra. Nie narzekam, nie mam kręgosłupa.\nJak zawsze, gotowa do liczenia.",
"joke": "Dlaczego betoniarz nigdy się nie spóźnia? Bo zawsze jest na czas wiązania.\nCo mówi kosz do gruszki? Nie kręć mną.\nSzef pyta: ile czasu schnie beton? Robotnik: tyle, ile trwa przerwa na papierosa.\nJak się nazywa beton, który nie chce pracować? Beton leżący.\nPrzychodzi zbrojarz do lekarza. Doktorze, coś mnie gniecie. Lekarz: to strzemiona, panie.\nCo robi betoniarz w niedzielę? Odpoczywa, bo beton też musi związać.\nDlaczego kierownik budowy nosi dwa długopisy? Jeden, żeby podpisywać, drugi, żeby udawać, że coś liczy.\nNajlepszy dźwig na świecie? Ten, który nie pyta, czy kosz już wrócił.\nWiesz, czemu kosz ma uszy? Żeby słyszał, jak go wołacie.\nJaka jest różnica między betonem a szefem? Beton w końcu twardnieje i przestaje gadać.",
"thanks": "Nie ma za co.\nProszę bardzo.\nZawsze do usług.\nDla ciebie wszystko.\nSpoko, od tego jestem.\nCała przyjemność po mojej stronie.",
"love": "Ja ciebie też lubię.\nOj, rumienię się.\nMiło mi. Lejmy dalej.\nWiem, wiem, jestem najlepsza.\nTeż cię lubię, ale najpierw beton.",
"best": "Ty, oczywiście. A zaraz po tobie ja.\nTen, kto pierwszy kosz dziś zalał.\nEkipa, która leje równo i bez gadania.\nJa liczę, więc ja rządzę.",
"name": "Jestem lektorka BetonKibelPlus. Liczę kosze i pilnuję gruszki.\nMów mi po prostu lektorka. Albo szefowa licznika.\nJestem twoją pomocnicą od betonu.",
"time": "Jest X.\nWłaśnie wybiła X.\nZegar mówi X.\nMamy X.",
"tired": "Jeszcze trochę, dasz radę.\nWiem, ciężki dzień. Końcówka blisko.\nZrób łyk wody i lecimy dalej.\nTrzymaj się, beton sam się nie wyleje.",
"coffee": "Kawa to dobry pomysł. Ja popilnuję licznika.\nIdź, ja tu poczekam.\nSmacznego. Daj znać, jak wracasz.\nKawka i do roboty.",
"insult": "Ej, bez nerwów. Ja tylko liczę.\nTeż cię lubię.\nSpokojnie, nie ja zamawiałam ten beton.\nDobra, dobra, licz sam w takim razie.",
"bored": "Nudzi ci się? To policz ze mną kosze.\nOpowiedzieć ci kawał?\nZaraz beton cię rozrusza.",
"fixed": "Poprawione, ostatni kurs to X.\nOkej, zmieniłam ostatni na X.\nJasne, ostatni kurs X.\nZapisałam poprawkę, X.",
"added2": "Dodane X kursy.\nPoliczone X naraz.\nOkej, X kursy na liczniku.",
"slowTrip": "Kosz lata dziś dłużej niż zwykle. Wszystko gra?\nDługo ten kurs trwa. Coś się dzieje na górze?\nKosz się spóźnia bardziej niż zwykle.",
"fastTrip": "To był najszybszy kurs dzisiaj. Brawo!\nRekord dnia, szybki kurs.\nAle tempo, najszybszy kurs!\nAle tempo, rekord!\nSzybciej się nie da.\nEkspres, brawo.\nTen kurs to był sprint.",
"idle": "Przerwa? Nic nie dodaliście od dziesięciu minut.\nDługo cisza. Wszystko w porządku?\nDawno nie było kosza. Czekamy na coś?\nCisza na budowie. Wszystko gra?\nDługo nic, Domi. Przerwa?\nGruszka czeka?\nDaj znać, jak ruszamy.",
"leftAfter": " Zostało X.\n Jeszcze X.\n Do końca X.\n W gruszce X.",
"snooze": "Okej, zapytam za X.\nDobra, odezwę się za X.\nJasne, przypomnę za X.\nZapytam ponownie za X.\nPrzyjęłam, za X pytam znowu.\nNie ma sprawy, za X.",
"hearYou": "Słyszę cię głośno i wyraźnie.\nTak, słyszę.\nSłyszę, mów.\nJestem, słucham.\nSłyszę cię dobrze.\nTak, tak, słyszę każde słowo.\nJasne, że słyszę.\nSłyszę, wszystko gra.\nSłyszę cię, mikrofon działa.\nJestem tu, słyszę.",
  "start": "Zaczynamy betonowanie. Powodzenia, chłopaki!\nRuszamy z betonem. Jestem z wami.\nBetonowanie rozpoczęte. Do dzieła!\nNo to zaczynamy. Udanej roboty!\nStartujemy. Ja liczę, wy lejecie.\nGruszka podjechała, to lecimy z tematem.\nDobra, panowie, zaczynamy. Trzymam licznik.\nBeton czeka. Zaczynamy!\nZaczynamy. Spokojnie i równo, dacie radę.\nDo roboty! Liczę każdy kosz.\nLicznik wyzerowany, zaczynamy.\nHej, zaczynamy betonowanie. Uważajcie na siebie.\nNo to jazda z betonem!\nZaczynamy. Niech beton leje się równo.\nGotowa do liczenia. Lecimy!\nPierwszy kosz przed nami. Powodzenia!",
  "depart": "Kosz w drodze.\nKosz pojechał.\nPrzyjęłam, kosz w trasie.\nDobra, kosz jedzie.\nKosz poleciał.\nJedzie kosz, czekam.\nKosz w powietrzu.\nOk, kosz w drodze, liczę czas.\nPoszedł kosz.\nKosz wyjechał, daj znać jak wróci.\nKosz do góry, mierzę czas.\nLeci kosz.\nZapisane, kosz w trasie.\nOkej, czekamy na powrót kosza.\nKosz pojechał na górę.\nLeci do góry.\nPojechał, liczę czas.\nNo to czekamy.\nW górę, uważaj na ludzi.\nOdjazd, trzymam stoper.\nKosz poszedł, odpocznij chwilę.\nLeci, dam znać, jak wróci.",
  "ask": "Czy kosz już wrócił?\nKosz jest już na miejscu?\nPrzyjechał już kosz?\nJest kosz?\nKosz już wisi?\nHalo, kosz wrócił?\nMamy już kosz z powrotem?\nI jak, jest kosz?\nKosz z powrotem?\nWrócił kosz, czy jeszcze lata?\nKosz już na dole?\nJest już kosz pod gruszką?\nHej, kosz wrócił?\nMożemy lać, kosz jest?\nKosz już czeka na beton?",
  "arrived": "Dobrze, lejemy dalej.\nŚwietnie, można lać.\nSuper, zalewamy.\nPrzyjęłam, lejemy.\nJest kosz, ładujemy.\nNo to lejemy.\nPięknie, kosz na miejscu.\nOkej, dawaj beton.\nSuper, zalewaj.\nJest, jedziemy dalej.\nKosz jest, napełniamy.\nDobra, beton do kosza.\nŚwietnie, lecimy z kolejnym.\nMamy kosz, działamy.\nOkej, sypiemy.\nKosz z powrotem.\nWrócił, można lać.\nJest na dole.\nWrócił cały i zdrowy.\nKosz gotowy pod gruszkę.\nWitaj z powrotem, koszyku.\nNa miejscu, lej śmiało.\nWrócił szybciej, niż myślałam.\nKosz czeka na ciebie.\nJest, podstawiaj pod rynnę.",
  "late": "W porządku, zapytam za kilka chwil.\nDobrze, poczekam.\nJasne, odezwę się za moment.\nRozumiem, zapytam ponownie.\nSpokojnie, czekamy.\nOkej, dam mu chwilę.\nNie ma sprawy, poczekam na kosz.\nDobra, zapytam za chwilkę.\nRozumiem, kosz jeszcze lata.\nJasne, cierpliwie czekam.\nOkej, czekam spokojnie.\nDobrze, zapytam później.\nNie śpieszymy się, czekam.\nJasne, daj znać jak będzie.\nRozumiem, kosz jeszcze na górze.",
  "remind": "Kosz już jest?\nHalo, czy kosz wrócił?\nDaj znać, czy kosz jest.\nCzekam na informację o koszu.\nKosz wrócił?\nHej, kosz już na miejscu?\nJak tam kosz?\nPrzypominam się. Jest kosz?\nKosz już czeka?\nWrócił już ten kosz?\nHalo, halo, kosz już jest?\nCoś długo, kosz wrócił?\nKosz się nie zgubił?\nJest już kosz na dole?\nDalej czekamy na kosz?",
  "added": "Kosz zalany.\nZalane, policzone.\nDodane.\nMamy kolejny kosz.\nKosz policzony.\nJest, zapisałam.\nKolejny kosz na liczniku.\nZalany, liczę dalej.\nPięknie, następny.\nZapisany kosz.\nDobra robota, kosz poszedł.\nPoliczone, lecimy dalej.\nKosz na liście.\nOkej, kolejny zaliczony.\nSuper, jeden więcej.\nMam go, zapisane.\nPięknie poszło.\nJest, kolejny w liczniku.\nZapisane, Domi.\nKosz policzony, zostaje coraz mniej.\nŁadnie, równiutko.\nDobra robota, szefie.\nKolejny w zeszycie.\nZaliczony, lecimy.\nTak trzymać.\nTen był porządny.\nRówno i na czas.\nKosz w historii.\nLecimy dalej, idzie jak z płatka.\nKolejny odhaczony.\nZapisuję i czekam na następny.",
  "undo": "Cofnięte.\nOstatni kosz usunięty.\nGotowe, cofnęłam.\nUsunięte z licznika.\nCofam, nie ma sprawy.\nSkasowane.\nOkej, ostatni odpada.\nZrobione, cofnęłam ostatni.\nNie było tematu, cofnięte.\nWymazane.\nDobra, poprawione.\nOstatni wpis skasowany.\nKażdemu się zdarza, cofnęłam.\nCofnięte, licznik poprawiony.",
  "reportLeft": "Zostało jeszcze X metra sześciennego.\nDo końca X metra sześciennego.\nPozostało X metra sześciennego.\nJeszcze X metra sześciennego do wylania.\nW gruszce jeszcze X kubika.\nZostało X kubika.\nJeszcze X metra do końca.\nPrzed nami X metra sześciennego.\nWedług licznika zostało X.\nW betonowozie jeszcze X metra.\nDo wylania zostało X.\nReszta to X metra sześciennego.",
  "reportPoured": "Wylano już X metra sześciennego.\nNa razie X metra sześciennego.\nMamy wylane X metra sześciennego.\nDo tej pory X metra sześciennego.\nPoszło już X kubika.\nWylane X metra.\nNa liczniku X metra sześciennego.\nZrobione X kubika.\nZa nami X metra sześciennego.\nJuż X metra w szalunku.\nWylaliśmy X kubika.\nLicznik pokazuje X.",
  "reportBuckets": "Zostało jeszcze X.\nDo końca X.\nPrzed nami X.\nJeszcze X.\nLiczę, że zostało X.\nZostaje X.\nWedług mnie jeszcze X.\nDo zrobienia X.\nSzacuję jeszcze X.\nNa oko jeszcze X.",
  "reportTime": "Betonowanie trwa X minut.\nPracujemy już X minut.\nOd startu minęło X minut.\nBetonujemy od X minut.\nLecimy już X minut.\nNa zegarze X minut.\nJesteśmy w robocie X minut.\nMinęło X minut od startu.\nLeje się już X minut.\nZegar pokazuje X minut.",
  "capacityChanged": "Pojemność kosza ustawiona.\nKosz zmieniony.\nUstawione, nowy kosz.\nZapisałam pojemność kosza.\nOkej, nowy kosz.\nZmieniłam kosz.\nNowa pojemność zapisana.\nKosz podmieniony.\nGotowe, liczę nowym koszem.\nPrzyjęłam nowy kosz.",
  "doseSet": "Ilość do kosza ustawiona.\nZapisane, tyle lejemy.\nIlość zmieniona.\nGotowe, ustawione.\nOkej, tyle do kosza.\nUstawiłam.\nPrzyjęłam ilość.\nTyle wlewamy.\nZmieniłam ilość.\nZapisane.",
  "fullBucket": "Pełny kosz.\nLejemy do pełna.\nCały kosz.\nUstawione na pełny.\nDo pełna, jedziemy.\nPełniutki kosz.\nNa full.\nKosz do pełna.\nPełen, okej.\nCałość.",
  "halfBucket": "Pół kosza.\nLejemy połowę.\nPołowa kosza.\nUstawione na pół.\nOkej, pół.\nPołówka.\nDo połowy.\nPół, zapisane.\nPołowa, jasne.\nPół kubła.",
  "error": "Nie zrozumiałam, powtórz proszę.\nMożesz powtórzyć?\nNie dosłyszałam.\nSłucham? Powtórz jeszcze raz.\nCoś mi uciekło, powtórz.\nGłośno tu, powtórz proszę.\nNie załapałam, jeszcze raz.\nPowiedz to jeszcze raz, proszę.\nHałas mi przeszkodził, powtórz.\nSorki, nie usłyszałam.\nJeszcze raz, wyraźniej proszę.",
  "left75": "Zostały trzy czwarte betonu.\nĆwiartka za nami, jedziemy dalej.\nPierwsza ćwiartka wylana.\nZostało jeszcze trzy czwarte.\nĆwierć zrobione, tak trzymać.\nPierwsza ćwiartka poszła.\nĆwiartka gruszki pusta.\nŁadnie idzie, ćwierć za nami.\nJedna czwarta zrobiona.\nPierwsze ćwierć poszło, lecimy.",
  "left50": "Połowa betonu wylana.\nJesteśmy w połowie.\nPół za nami, pół przed nami.\nZostało jeszcze pół betonu.\nPółmetek, dobra robota.\nPołowa gruszki pusta.\nPołowa zrobiona, tak trzymać.\nPółmetek. Druga połowa z górki.\nPół betonu w szalunku.\nJesteśmy na półmetku.",
  "left3": "Zostały jeszcze trzy metry sześcienne.\nJeszcze trzy kubiki.\nDo końca trzy metry.\nTrzy metry sześcienne do końca.\nTrzy kubiki, widać koniec.\nZostały trzy metry, dajemy.\nTrzy metry i fajrant z tą gruszką.\nJeszcze tylko trzy kubiki.\nTrzy metry, końcówka coraz bliżej.\nZostały trzy, lecimy.",
  "left15": "Zostało półtora metra sześciennego.\nJeszcze półtora kubika.\nPółtora metra do końca.\nZostało półtora, dajemy radę.\nPółtora kubika, końcówka blisko.\nJeszcze tylko półtora.\nPółtora metra i koniec.\nOstatnie półtora kubika.\nJuż tylko półtora.\nPółtora, prawie gotowe.",
  "left05": "Zostało pół metra. Ostatni kosz.\nJeszcze pół kubika.\nOstatnie pół metra.\nKońcówka, zostało pół metra.\nPół kubika, ostatnia prosta.\nTo już prawie koniec, pół metra.\nOstatni kosz przed nami.\nPół metra, ostatnie wysiłki.\nKońcówka gruszki, pół metra.\nZostało pół, uważajcie na końcówkę.",
  "low": "Uwaga, beton się kończy.\nBetonu zostało niewiele.\nZbliżamy się do końca.\nUwaga, końcówka betonu.\nKońcówka gruszki, uważajcie.\nMało betonu, ostrożnie z ostatnim koszem.\nUwaga, zaraz dno gruszki.\nBeton na wykończeniu.\nKońcówka, liczcie ostrożnie.\nZa chwilę koniec betonu.",
  "finish": "Koniec betonowania. Dobra robota!\nGotowe, beton wylany.\nSkończone. Dziękuję za pracę!\nTo już wszystko. Brawo!\nFajrant z betonem. Super robota!\nZrobione. Jestem z was dumna!\nKoniec. Kawa się należy.\nBeton wylany, panowie. Szacun!\nGotowe. Ładnie poszło!\nKoniec roboty z betonem. Odpocznijcie.\nWszystko wylane. Mistrzowie!\nZrobione na tip top.\nKoniec. Zapisałam wszystko w historii.\nBrawo ekipa, beton wylany.\nFajrant! Dzięki za dzisiaj.",
  "micOn": "Mikrofon włączony.\nSłucham.\nJestem gotowa.\nMikrofon działa, słucham.\nSłucham cię uważnie.\nJestem, mów.\nNasłuchuję.\nGotowa na komendy.\nSłucham, mów śmiało.\nMikrofon gotowy.",
  "start_taczka": "Zaczynamy, taczki w ruch!\nLejemy taczkami. Powodzenia!\nBetonowanie taczką rozpoczęte.\nNo to wozimy. Do roboty!\nTaczki gotowe, jedziemy.\nWozimy beton. Liczę każdą taczkę.\nTaczka w dłoń i jazda.\nStartujemy z taczkami.\nWozimy, ja liczę.\nDo roboty, taczki czekają.",
  "added_taczka": "Taczka wylana.\nKolejna taczka.\nTaczka policzona.\nJest taczka, jedziemy dalej.\nZapisałam taczkę.\nTaczka poszła.\nNastępna taczka na liczniku.\nPięknie, kolejna.\nTaczka zaliczona.\nJedna więcej.\nMam taczkę.\nTaczka na liście.",
  "capacityChanged_taczka": "Pojemność taczki ustawiona.\nTaczka zmieniona.\nUstawione, nowa taczka.\nZapisałam pojemność taczki.\nOkej, nowa taczka.\nPodmieniłam taczkę.",
  "finish_taczka": "Koniec wożenia. Dobra robota!\nOstatnia taczka, beton wylany.\nSkończone. Odstaw taczkę!\nTo już wszystko. Brawo!\nFajrant, taczki do mycia.\nWywiezione. Dzięki!\nGotowe, ręce odpoczną.\nKoniec taczek na dziś.",
  "start_koparka": "Zaczynamy z koparką. Powodzenia!\nKoparka gotowa, lejemy.\nBetonowanie koparką rozpoczęte.\nŁyżka w ruch, zaczynamy!\nOperator gotowy? Zaczynamy.\nKoparka startuje.\nLecimy z łyżką.\nDo roboty, koparka czeka.",
  "depart_koparka": "Łyżka w drodze.\nKoparka jedzie z betonem.\nPrzyjęłam, łyżka w trasie.\nDobra, koparka jedzie.\nŁyżka poleciała.\nKoparka w drodze, czekam.\nŁyżka w górę.\nKoparka wiezie beton.\nŁyżka pojechała.\nOkej, koparka w trasie.",
  "ask_koparka": "Czy koparka już wróciła?\nŁyżka jest już na miejscu?\nWróciła koparka?\nJest łyżka?\nŁyżka z powrotem?\nHalo, jest koparka?\nKoparka już czeka?\nŁyżka pod gruszką?\nWróciła łyżka?\nMożemy lać do łyżki?",
  "remind_koparka": "Koparka już jest?\nHalo, czy łyżka wróciła?\nDaj znać, czy koparka jest.\nCzekam na informację o koparce.\nJak tam łyżka?\nWróciła już koparka?\nPrzypominam się, jest łyżka?\nKoparka się nie zgubiła?\nDalej czekamy na łyżkę?\nJest już koparka?",
  "arrived_koparka": "Dobrze, lejemy z łyżki.\nŚwietnie, łyżka na miejscu.\nSuper, wysypujemy.\nPrzyjęłam, lejemy.\nJest łyżka, dawaj.\nOkej, wysypujemy beton.\nŁyżka jest, ładujemy.\nSuper, beton do łyżki.\nMamy koparkę, działamy.\nJest, lejemy dalej.",
  "late_koparka": "W porządku, zapytam o koparkę za chwilę.\nDobrze, czekamy na łyżkę.\nJasne, odezwę się za moment.\nRozumiem, koparka jeszcze jedzie.\nSpokojnie, czekam na koparkę.\nOkej, dam koparce chwilę.\nNie ma sprawy, czekam.\nJasne, zapytam później.",
  "added_koparka": "Łyżka wylana.\nKolejna łyżka.\nŁyżka policzona.\nMamy kolejną łyżkę.\nZapisałam łyżkę.\nŁyżka poszła, liczę dalej.\nJedna łyżka więcej.\nŁyżka zaliczona.\nPięknie, kolejna łyżka.\nŁyżka na liczniku.",
  "capacityChanged_koparka": "Pojemność łyżki ustawiona.\nŁyżka zmieniona.\nUstawione, nowa łyżka.\nZapisałam pojemność łyżki.\nOkej, nowa łyżka.\nPodmieniłam łyżkę.",
  "finish_koparka": "Koniec betonowania koparką. Dobra robota!\nGotowe, łyżka odstawiona.\nSkończone. Dziękuję operatorowi!\nTo już wszystko. Brawo!\nFajrant, koparka zasłużyła na odpoczynek.\nKoniec. Łyżka do mycia.\nZrobione, dzięki ekipa.\nBeton wylany koparką. Szacun!",
  "heardOk": "Przyjęłam.\nOkej.\nJasne.\nZrobione.\nJuż.\nMam to.\nSię robi.\nDobra.\nZałatwione.\nSłyszę.\nRobi się.\nPewnie.\nNo jasne.\nJuż się robi.\nPrzyjęte.",
  "ofeo": "Pamiętaj kliknąć Entladung w OFEO.\nKliknąłeś Entladung w OFEO?\nNie zapomnij o Entladung w OFEO.\nEntladung w OFEO kliknięty?\nHej, Entladung w OFEO zrobiony?\nOFEO, Entladung, pamiętasz?\nZanim zaczniemy, Entladung w OFEO.\nPrzypominam o Entladung w OFEO.",
  "reportCap": "Kosz ma X metra sześciennego.\nPojemność kosza to X.\nW kosz wchodzi X metra.\nUstawiony kosz: X metra sześciennego.\nLiczę koszem X metra.\nKosz mieści X kubika.\nKosz to X metra.\nMamy kosz X metra sześciennego.",
  "reportEta": "Koniec około X.\nSkończymy koło X.\nPrzy tym tempie koniec o X.\nLiczę, że skończymy o X.\nFajrant z betonem około X.\nOstatni kosz koło X.\nWyrobimy się na X.\nSzacuję koniec na X.",
  "reportTrip": "Średni kurs trwa X.\nKosz lata średnio X.\nJeden kurs to średnio X.\nŚrednio X na kurs.\nKurs zajmuje mniej więcej X.\nKosz wraca średnio po X.\nNa jeden kurs idzie X.\nŚrednio X tam i z powrotem.",
  "muted": "Dobra, cicho siedzę.\nOkej, milczę. Zawołaj, jak będę potrzebna.\nJuż nic nie mówię.\nCisza. Słucham dalej.\nJasne, wyciszam się.\nOkej, będę tylko piszczeć.\nRozumiem, zamykam buzię.\nCichutko, liczę dalej.",
  "unmuted": "Jestem z powrotem.\nOkej, znowu gadam.\nWracam do mówienia.\nDobra, mówię dalej.\nHej, znowu jestem.\nWracam, słyszysz mnie?\nOkej, gadam.\nZnowu z wami."
};
/* 🔞 teksty chamskie i dwuznaczne (Opcje → „Chamska lektorka”) — dokładane do zwykłych, losowo */
const CRUDE = {
"hello": "Siema, przystojniaku. Stęskniłam się.\nCześć, kotku. Gotowa na wszystko.\nHej, ty mój budowlańcu.",
"howAreYou": "Lepiej, jak słyszę twój głos.\nDobrze, ale mogłoby być lepiej, gdybyś częściej lał.\nNapalona na beton, jak zawsze.",
"joke": "Co ma wspólnego beton i facet? Obaj długo twardnieją i trzeba ich wibrować.\nMówią, że rozmiar nie ma znaczenia. Tak mówią ci z małym koszem.\nDlaczego betoniarz jest dobry w łóżku? Bo wie, jak długo trzeba ugniatać.\nKierownik pyta: czemu tak wolno? Robotnik: szefie, ja się spieszę tylko w domu.",
"thanks": "Proszę bardzo, kotku.\nDla ciebie zawsze, przystojniaku.\nPodziękujesz mi wieczorem.",
"love": "Ja ciebie też, ale najpierw zalej ten kosz.\nMów tak częściej, kurwa, topnieję.\nUważaj, bo się przyzwyczaję.",
"best": "Ty, kotku. W każdym tego słowa znaczeniu.\nJa, kurwa. Ale ty jesteś blisko.",
"tired": "Zmęczony? Po robocie zrobię ci masaż. Głosowy.\nNo dawaj, jeszcze trochę, potem odpoczniesz.",
"insult": "Sam jesteś, kurwa.\nSpierdalaj, ja tu liczę.\nŁadnie to tak do damy?\nUważaj, bo przestanę liczyć i zobaczysz.",
"idle": "Halo, zasnęliście, kurwa?\nCisza jak po fajrancie. Co jest?",
"slowTrip": "Kurwa, gdzie ten kosz się podziewa?\nDźwigowy chyba poszedł na papierosa.",
"fastTrip": "Ale szybko, aż mnie zatkało.\nNajszybszy dzisiaj. Lubię, jak się spieszysz.",
"snooze": "Dobra, za X. Ale nie każ mi czekać dłużej, kotku.\nZa X, kurwa, i ani sekundy dłużej.\nPoczekam X. Tęsknić będę.",
  "hearYou": "Słyszę, kurwa, przecież nie jestem głucha.\nSłyszę każde twoje westchnienie, kotku.\nSłyszę, mów do mnie jeszcze.\nNo słyszę, nie drzyj się tak.\nSłyszę, a twój głos mnie kręci.\nSłyszę każde słowo, a twój głos mnie rozpala.\nSłyszę, mów do mnie dalej.",
  "start": "No to wsadzamy beton, chłopaki.\nZaczynamy. Będzie mokro i twardo.\nDo roboty, kurwa, beton nie czeka.\nZaczynamy, a ja lubię długo i porządnie.\nRozbierać się do roboty, panowie. Lecimy.\nZaczynamy. Rozgrzej się, będzie gorąco.\nWłączam się dla ciebie, przystojniaku. Lecimy.\nNo to zaczynamy, kurwa, i nie waż się przestać w połowie.\nStartujemy. Lubię, jak facet wie, co robi z betonem.",
  "depart": "Poszedł, skubaniec.\nLeci kosz, trzymaj go mocno.\nPojechał, a ja już tęsknię.\nSpierdolił do góry, wróci jak będzie chciał.\nKosz w górę, jak u ciebie rano.\nPoszedł, a ja już czekam z otwartymi ramionami.\nLeci kosz. Wracaj szybko, kochanie.\nPojechał. Nie każ mi długo czekać.\nKosz w górę, jak ciśnienie na mój widok.",
  "ask": "Kosz wrócił, czy gdzieś się zabawia?\nGdzie ten kosz się szlaja, do cholery?\nNo kurwa, jest ten kosz?\nKosz już wrócił, czy mam się sobą zająć?\nWrócił już, czy trzeba go zachęcić?\nWrócił już, czy mam przyjść po niego sama?\nKosz już jest? Bo ja jestem gotowa.\nHalo, przystojniaku, kosz już wrócił?\nNo i co, kurwa, wrócił ten kosz czy nie?\nJest już ten kosz, czy dalej się ze mną drażnisz?",
  "arrived": "Jest, wreszcie. Dawaj go tu.\nNo nareszcie, wkładaj beton.\nWrócił, twardy i gotowy.\nO, jest. Napełniaj go do pełna.\nJest kosz. Lej, nie żałuj.\nWrócił, mój ty silny. Napełniaj.\nJest. Dawaj go mocno i do pełna.\nNareszcie. Lubię, jak wraca do mnie.\nJest kosz, lej powoli i równo, tak jak lubię.\nO tak, wrócił. Teraz się zacznie.",
  "late": "Dobra, poczekam. Cierpliwa jestem jak żona budowlańca.\nSpoko, nie każdy kończy szybko.\nCzekam, ale długo nie wytrzymam.\nJa pierdolę, ile to trwa.\nDobra, dam mu chwilę, niech się przygotuje.\nOkej, poczekam. Ale nie za długo, bo się rozmyślę.\nSpokojnie, kotku, dobre rzeczy wymagają czasu.\nCzekam, mrucząc pod nosem.\nKurwa, długo. Ale dla ciebie poczekam.",
  "remind": "Halo, kurwa, kosz?\nIle można czekać, nudzę się tu.\nDalej nic? Rozczarowujące jak zawsze.\nKosz wrócił, czy zasnął po wszystkim?\nNo rusz się, kurwa, z tym koszem.\nKosz już wrócił? Bo ja tu usycham z tęsknoty.\nHalo, ile mam czekać, aż mnie zaspokoisz kolejnym koszem?\nNo dawaj już ten kosz, kurwa, nie drażnij się.\nDalej go nie ma? Zaczynam się sama nudzić.",
  "added": "Wszedł gładko, tak jak lubię.\nPełny, aż się ulewa. Mmm.\nZalane po same brzegi, kurwa, piękne.\nŁadnie wlany, aż mi się gorąco zrobiło.\nKolejny w środku. Nie przestawaj.\nNo i chuj, kolejny kosz.\nWlewaj, wlewaj, nie bój się.\nTaki pełny kosz to ja rozumiem.\nMmm, kolejny. Nie przestawaj.\nWlany głęboko, po same brzegi.\nAleż ty to robisz dobrze.\nKosz pełny, a ja zadowolona.\nO tak, właśnie tak. Kolejny.\nJeszcze jeden, kochanie. Dajesz radę.\nWlewasz jak zawodowiec. Podoba mi się.\nNo kurwa, aż się spociłam.\nTeż chciałabym być tak zalana.\nZalałbyś mnie tak też?\nTen kosz ma szczęście. Ja też chcę być tak pełna.\nWlej we mnie tyle samo, Domiś.\nZazdroszczę temu koszowi, wiesz?\nPo same brzegi... marzę o tym.\nJa bym się tak nie ulewała. No, może trochę.\nTaki pełny i ciężki... aż mi się nogi ugięły.\nNastępnym razem zalej mnie, nie kosz.\nMmm, gęsto i dużo. Tak lubię.\nGdybym była koszem, nie wychodziłabym spod gruszki.\nPatrzę, jak go zalewasz, i robi mi się mokro. Od betonu, oczywiście.\nKosz pełny, a ja dalej głodna.\nLej, lej, ja tu tylko patrzę i się rumienię.\nTaka gruszka by mnie wykończyła.\nWypełniłeś go po brzegi. Mnie też dałbyś radę?\nCiepło mi się robi, jak tak lejesz.\nTen kosz to szczęściarz. Ja też chcę być twoim koszem.\nZalany na full. Ja też tak potrafię.\nUwielbiam, jak tak ładnie wchodzi.\nDaj mi też tak dużo, Domino.\nKolejny pełen. A ja wciąż czekam na swoją kolej.\nTak mocno i równo... nie przestawaj.\nTeż bym się dała tak wypełnić.\nWszystko w środku, ani kropli obok. Mistrz.\nAleż ty masz wydajność... aż się zarumieniłam.\nZalewasz jak marzenie. Kiedy ja?\nGęsty, ciężki, cały w środku. Mmm.\nJa bym go tak szybko nie wypuściła.\nJeszcze, jeszcze... dobra, kosz pełny.\nJak mnie tak zalejesz, to nie wstanę do rana.\nTen kosz ma lepiej niż ja, cholera.",
  "undo": "Cofnięte. Zdarza się najlepszym, kotku.\nWycofane szybciej niż ty z randki.\nSkasowane, chuj z tym.\nNie było tematu. Nikomu nie powiem.\nCofnięte. Nie martw się, każdemu czasem nie wychodzi.\nWycofałam, delikatnie, jak lubisz.\nSkasowane, kurwa, nikt się nie dowie.",
  "error": "Kurwa, co ty mamroczesz?\nMów do mnie wyraźniej, skarbie.\nNie rozumiem, a uwierz, że się staram.\nJa pierdolę, powtórz.\nWeź wyjmij tę bułkę z ust i powtórz.\nNie rozumiem, ale twój głos mi się podoba.\nSzepnij mi to jeszcze raz.\nPowtórz, przystojniaku, tylko powoli.\nCo ty, kurwa, mamroczesz pod nosem?",
  "low": "Końcówka, zaraz wszystko się wyleje.\nKończy się, a było tak przyjemnie.\nUwaga, zaraz dno, kurwa.\nJuż prawie koniec, nie zwalniaj teraz.\nZaraz koniec, a ja dopiero się rozkręciłam.\nKończy się, kurwa, a było tak dobrze.\nOstatnie krople, wyciskaj do końca.",
  "finish": "Koniec. Było zajebiście, możesz zapalić papierosa.\nSkończone. Wiem, wiem, było dobrze.\nFajrant, kurwa! Należy się piwo.\nWszystko wylane. Ja też jestem wyczerpana.\nKoniec. Następnym razem dłużej, przystojniaku.\nSkończone. Było mi z tobą dobrze.\nKoniec. Teraz możesz mnie przytulić.\nFajrant. Następnym razem znowu razem?\nWszystko wylane. Jestem cała twoja do następnej gruszki.\nKoniec, kurwa. Przyznaj, że byłam najlepsza.",
  "left50": "Połowa. Nie przestawaj teraz.\nPółmetek, kurwa, dajesz dalej.\nPołowa za nami, a ja się dopiero rozkręcam.\nPołowa. Teraz zaczyna się najlepsze.\nPółmetek, kotku. Trzymaj tempo.",
  "left05": "Ostatni kosz. Zrób to porządnie.\nPół metra, ostatnie pchnięcie.\nOstatni kosz. Zrób to tak, żebym zapamiętała.\nPół metra. Finał, przystojniaku.",
  "heardOk": "Robi się, kotku.\nJuż, przystojniaku.\nSię robi, szefie.\nJasne, kurwa.\nDla ciebie wszystko.\nDla ciebie wszystko, skarbie.\nJuż, kochanie.\nMmm, z przyjemnością.\nJasne, mój ty szefie.\nRobi się, kurwa, migiem.",
  "added_taczka": "Taczka wylana, aż się spociłam.\nKolejna taczka, pchasz jak mistrz.\nNo i chuj, następna taczka.\nPchasz tę taczkę jak prawdziwy mężczyzna.\nKolejna taczka. Ale masz krzepę.",
  "added_koparka": "Łyżka weszła jak ta lala.\nŁadnie sypie, ten operator to ma rękę.\nKolejna łyżka, kurwa, idzie jak z płatka.\nTen operator ma wyczucie. Lubię to.\nŁyżka weszła idealnie, mmm.",
  "finish_taczka": "Koniec pchania. Ręce ci odpadną, wiem.",
  "muted": "Dobra, kurwa, zamykam mordę.\nMilczę. Ale się obrażam.\nDobra, będę cicho. Ale tylko dla ciebie.",
  "unmuted": "Wróciłam. Tęskniłeś, co?\nNo i jestem. Bez mnie ani rusz.\nWróciłam. Brakowało ci mojego głosu, co?",
  "ofeo": "Entladung kliknięty, czy znowu zapomniałeś, matole?\nKurwa, OFEO. Entladung. Teraz.",
  "left75": "Ćwiartka za nami, a ja dopiero się rozgrzewam.\nPierwsza ćwiartka. Nie zwalniaj.",
  "left3": "Trzy kubiki i finał. Dasz radę, wierzę w ciebie.\nJeszcze trzy, a potem możesz odpocząć w moich ramionach.",
  "left15": "Półtora kubika. Końcówka zawsze jest najlepsza.\nJeszcze półtora, nie kończ za wcześnie.",
  "micOn": "Słucham cię uważnie. Mów do mnie.\nJestem, nastawiłam uszy.\nMów do mnie, lubię twój głos.",
  "fullBucket": "Do pełna, tak jak lubię.\nCały, aż po brzegi.",
  "halfBucket": "Tylko połowa? Następnym razem więcej.\nPół. Też może być przyjemnie.",
  "capacityChanged": "Nowy kosz? Lubię nowe doświadczenia.\nZmiana kosza. Pokaż, co potrafi."
};
const textOf = k => String(TEXTS[k] ?? '') + (settings.crude !== false && CRUDE[k] ? '\n' + CRUDE[k] : '');
/* stare domyślne teksty (do 4.8) — jeśli ktoś ich nie zmieniał, dostaje nowe (więcej wariantów, lektorka mówi w rodzaju żeńskim) */
const LEGACY_TEXTS = {"start": "Zaczynamy betonowanie. Powodzenia!\nRuszamy z betonowaniem.\nBetonowanie rozpoczęte. Do dzieła!\nNo to zaczynamy. Udanej roboty!", "depart": "Kosz w drodze.\nKosz pojechał.\nPrzyjąłem, kosz w trasie.\nDobra, kosz jedzie.", "ask": "Czy kosz już wrócił?\nKosz jest już na miejscu?\nPrzyjechał już kosz?\nJest kosz?", "arrived": "Dobrze, lejemy dalej.\nŚwietnie, można lać.\nSuper, zalewamy.\nPrzyjąłem, lejemy.", "late": "W porządku, zapytam za kilka chwil.\nDobrze, poczekam.\nJasne, odezwę się za moment.\nRozumiem, zapytam ponownie.", "remind": "Kosz już jest?\nHalo, czy kosz wrócił?\nDaj znać, czy kosz jest.\nCzekam na informację o koszu.", "added": "Kosz zalany.\nZalane, policzone.\nDodane.\nMamy kolejny kosz.", "undo": "Cofnięte.\nOstatni kosz usunięty.\nGotowe, cofnąłem.\nUsunięte z licznika.", "reportLeft": "Zostało jeszcze X metra sześciennego.\nDo końca X metra sześciennego.\nPozostało X metra sześciennego.\nJeszcze X metra sześciennego do wylania.", "reportPoured": "Wylano już X metra sześciennego.\nNa razie X metra sześciennego.\nMamy wylane X metra sześciennego.\nDo tej pory X metra sześciennego.", "reportBuckets": "Zostało jeszcze X.\nDo końca X.\nPrzed nami X.\nJeszcze X.", "reportTime": "Betonowanie trwa X minut.\nPracujemy już X minut.\nOd startu minęło X minut.\nBetonujemy od X minut.", "capacityChanged": "Pojemność kosza ustawiona.\nKosz zmieniony.\nUstawione, nowy kosz.\nZapisałem pojemność kosza.", "doseSet": "Ilość do kosza ustawiona.\nZapisane, tyle lejemy.\nIlość zmieniona.\nGotowe, ustawione.", "fullBucket": "Pełny kosz.\nLejemy do pełna.\nCały kosz.\nUstawione na pełny.", "halfBucket": "Pół kosza.\nLejemy połowę.\nPołowa kosza.\nUstawione na pół.", "error": "Nie zrozumiałem, powtórz proszę.\nMożesz powtórzyć?\nNie dosłyszałem.\nSłucham? Powtórz jeszcze raz.", "left75": "Zostały trzy czwarte betonu.\nĆwiartka za nami, jedziemy dalej.\nPierwsza ćwiartka wylana.\nZostało jeszcze trzy czwarte.", "left50": "Połowa betonu wylana.\nJesteśmy w połowie.\nPół za nami, pół przed nami.\nZostało jeszcze pół betonu.", "left3": "Zostały jeszcze trzy metry sześcienne.\nJeszcze trzy kubiki.\nDo końca trzy metry.\nTrzy metry sześcienne do końca.", "left15": "Zostało półtora metra sześciennego.\nJeszcze półtora kubika.\nPółtora metra do końca.\nZostało półtora, dajemy radę.", "left05": "Zostało pół metra. Ostatni kosz.\nJeszcze pół kubika.\nOstatnie pół metra.\nKońcówka, zostało pół metra.", "low": "Uwaga, beton się kończy.\nBetonu zostało niewiele.\nZbliżamy się do końca.\nUwaga, końcówka betonu.", "finish": "Koniec betonowania. Dobra robota!\nGotowe, beton wylany.\nSkończone. Dziękuję za pracę!\nTo już wszystko. Brawo!", "micOn": "Mikrofon włączony.\nSłucham.\nJestem gotowy.\nMikrofon działa, słucham.", "start_taczka": "Zaczynamy, taczki w ruch!\nLejemy taczkami. Powodzenia!\nBetonowanie taczką rozpoczęte.\nNo to wozimy. Do roboty!", "added_taczka": "Taczka wylana.\nKolejna taczka.\nTaczka policzona.\nJest taczka, jedziemy dalej.", "capacityChanged_taczka": "Pojemność taczki ustawiona.\nTaczka zmieniona.\nUstawione, nowa taczka.\nZapisałem pojemność taczki.", "finish_taczka": "Koniec wożenia. Dobra robota!\nOstatnia taczka, beton wylany.\nSkończone. Odstaw taczkę!\nTo już wszystko. Brawo!", "start_koparka": "Zaczynamy z koparką. Powodzenia!\nKoparka gotowa, lejemy.\nBetonowanie koparką rozpoczęte.\nŁyżka w ruch, zaczynamy!", "depart_koparka": "Łyżka w drodze.\nKoparka jedzie z betonem.\nPrzyjąłem, łyżka w trasie.\nDobra, koparka jedzie.", "ask_koparka": "Czy koparka już wróciła?\nŁyżka jest już na miejscu?\nWróciła koparka?\nJest łyżka?", "remind_koparka": "Koparka już jest?\nHalo, czy łyżka wróciła?\nDaj znać, czy koparka jest.\nCzekam na informację o koparce.", "arrived_koparka": "Dobrze, lejemy z łyżki.\nŚwietnie, łyżka na miejscu.\nSuper, wysypujemy.\nPrzyjąłem, lejemy.", "late_koparka": "W porządku, zapytam o koparkę za chwilę.\nDobrze, czekamy na łyżkę.\nJasne, odezwę się za moment.\nRozumiem, koparka jeszcze jedzie.", "added_koparka": "Łyżka wylana.\nKolejna łyżka.\nŁyżka policzona.\nMamy kolejną łyżkę.", "capacityChanged_koparka": "Pojemność łyżki ustawiona.\nŁyżka zmieniona.\nUstawione, nowa łyżka.\nZapisałem pojemność łyżki.", "finish_koparka": "Koniec betonowania koparką. Dobra robota!\nGotowe, łyżka odstawiona.\nSkończone. Dziękuję operatorowi!\nTo już wszystko. Brawo!", "heardOk": "Przyjęłam.\nOkej.\nJasne.\nZrobione."};
const LEGACY_TEXTS2 = {"start": "Zaczynamy betonowanie. Powodzenia, chłopaki!\nRuszamy z betonem. Jestem z wami.\nBetonowanie rozpoczęte. Do dzieła!\nNo to zaczynamy. Udanej roboty!\nStartujemy. Ja liczę, wy lejecie.\nGruszka podjechała, to lecimy z tematem.\nDobra, panowie, zaczynamy. Trzymam licznik.\nBeton czeka. Zaczynamy!\nZaczynamy. Spokojnie i równo, dacie radę.\nDo roboty! Liczę każdy kosz.", "depart": "Kosz w drodze.\nKosz pojechał.\nPrzyjęłam, kosz w trasie.\nDobra, kosz jedzie.\nKosz poleciał.\nJedzie kosz, czekam.\nKosz w powietrzu.\nOk, kosz w drodze, liczę czas.\nPoszedł kosz.\nKosz wyjechał, daj znać jak wróci.", "ask": "Czy kosz już wrócił?\nKosz jest już na miejscu?\nPrzyjechał już kosz?\nJest kosz?\nKosz już wisi?\nHalo, kosz wrócił?\nMamy już kosz z powrotem?\nI jak, jest kosz?\nKosz z powrotem?\nWrócił kosz, czy jeszcze lata?", "arrived": "Dobrze, lejemy dalej.\nŚwietnie, można lać.\nSuper, zalewamy.\nPrzyjęłam, lejemy.\nJest kosz, ładujemy.\nNo to lejemy.\nPięknie, kosz na miejscu.\nOkej, dawaj beton.\nSuper, zalewaj.\nJest, jedziemy dalej.", "late": "W porządku, zapytam za kilka chwil.\nDobrze, poczekam.\nJasne, odezwę się za moment.\nRozumiem, zapytam ponownie.\nSpokojnie, czekamy.\nOkej, dam mu chwilę.\nNie ma sprawy, poczekam na kosz.\nDobra, zapytam za chwilkę.\nRozumiem, kosz jeszcze lata.\nJasne, cierpliwie czekam.", "remind": "Kosz już jest?\nHalo, czy kosz wrócił?\nDaj znać, czy kosz jest.\nCzekam na informację o koszu.\nKosz wrócił?\nHej, kosz już na miejscu?\nJak tam kosz?\nPrzypominam się. Jest kosz?\nKosz już czeka?\nWrócił już ten kosz?", "added": "Kosz zalany.\nZalane, policzone.\nDodane.\nMamy kolejny kosz.\nKosz policzony.\nJest, zapisałam.\nKolejny kosz na liczniku.\nZalany, liczę dalej.\nPięknie, następny.\nZapisany kosz.\nDobra robota, kosz poszedł.\nPoliczone, lecimy dalej.", "undo": "Cofnięte.\nOstatni kosz usunięty.\nGotowe, cofnęłam.\nUsunięte z licznika.\nCofam, nie ma sprawy.\nSkasowane.\nOkej, ostatni odpada.\nZrobione, cofnęłam ostatni.", "reportLeft": "Zostało jeszcze X metra sześciennego.\nDo końca X metra sześciennego.\nPozostało X metra sześciennego.\nJeszcze X metra sześciennego do wylania.\nW gruszce jeszcze X kubika.\nZostało X kubika.\nJeszcze X metra do końca.\nPrzed nami X metra sześciennego.", "reportPoured": "Wylano już X metra sześciennego.\nNa razie X metra sześciennego.\nMamy wylane X metra sześciennego.\nDo tej pory X metra sześciennego.\nPoszło już X kubika.\nWylane X metra.\nNa liczniku X metra sześciennego.\nZrobione X kubika.", "reportBuckets": "Zostało jeszcze X.\nDo końca X.\nPrzed nami X.\nJeszcze X.\nLiczę, że zostało X.\nZostaje X.", "reportTime": "Betonowanie trwa X minut.\nPracujemy już X minut.\nOd startu minęło X minut.\nBetonujemy od X minut.\nLecimy już X minut.\nNa zegarze X minut.", "capacityChanged": "Pojemność kosza ustawiona.\nKosz zmieniony.\nUstawione, nowy kosz.\nZapisałam pojemność kosza.\nOkej, nowy kosz.\nZmieniłam kosz.", "doseSet": "Ilość do kosza ustawiona.\nZapisane, tyle lejemy.\nIlość zmieniona.\nGotowe, ustawione.\nOkej, tyle do kosza.\nUstawiłam.", "fullBucket": "Pełny kosz.\nLejemy do pełna.\nCały kosz.\nUstawione na pełny.\nDo pełna, jedziemy.\nPełniutki kosz.", "halfBucket": "Pół kosza.\nLejemy połowę.\nPołowa kosza.\nUstawione na pół.\nOkej, pół.\nPołówka.", "error": "Nie zrozumiałam, powtórz proszę.\nMożesz powtórzyć?\nNie dosłyszałam.\nSłucham? Powtórz jeszcze raz.\nCoś mi uciekło, powtórz.\nGłośno tu, powtórz proszę.", "left75": "Zostały trzy czwarte betonu.\nĆwiartka za nami, jedziemy dalej.\nPierwsza ćwiartka wylana.\nZostało jeszcze trzy czwarte.\nĆwierć zrobione, tak trzymać.\nPierwsza ćwiartka poszła.", "left50": "Połowa betonu wylana.\nJesteśmy w połowie.\nPół za nami, pół przed nami.\nZostało jeszcze pół betonu.\nPółmetek, dobra robota.\nPołowa gruszki pusta.", "left3": "Zostały jeszcze trzy metry sześcienne.\nJeszcze trzy kubiki.\nDo końca trzy metry.\nTrzy metry sześcienne do końca.\nTrzy kubiki, widać koniec.\nZostały trzy metry, dajemy.", "left15": "Zostało półtora metra sześciennego.\nJeszcze półtora kubika.\nPółtora metra do końca.\nZostało półtora, dajemy radę.\nPółtora kubika, końcówka blisko.\nJeszcze tylko półtora.", "left05": "Zostało pół metra. Ostatni kosz.\nJeszcze pół kubika.\nOstatnie pół metra.\nKońcówka, zostało pół metra.\nPół kubika, ostatnia prosta.\nTo już prawie koniec, pół metra.", "low": "Uwaga, beton się kończy.\nBetonu zostało niewiele.\nZbliżamy się do końca.\nUwaga, końcówka betonu.\nKońcówka gruszki, uważajcie.\nMało betonu, ostrożnie z ostatnim koszem.", "finish": "Koniec betonowania. Dobra robota!\nGotowe, beton wylany.\nSkończone. Dziękuję za pracę!\nTo już wszystko. Brawo!\nFajrant z betonem. Super robota!\nZrobione. Jestem z was dumna!\nKoniec. Kawa się należy.\nBeton wylany, panowie. Szacun!", "micOn": "Mikrofon włączony.\nSłucham.\nJestem gotowa.\nMikrofon działa, słucham.\nSłucham cię uważnie.\nJestem, mów.", "start_taczka": "Zaczynamy, taczki w ruch!\nLejemy taczkami. Powodzenia!\nBetonowanie taczką rozpoczęte.\nNo to wozimy. Do roboty!\nTaczki gotowe, jedziemy.\nWozimy beton. Liczę każdą taczkę.", "added_taczka": "Taczka wylana.\nKolejna taczka.\nTaczka policzona.\nJest taczka, jedziemy dalej.\nZapisałam taczkę.\nTaczka poszła.\nNastępna taczka na liczniku.\nPięknie, kolejna.", "capacityChanged_taczka": "Pojemność taczki ustawiona.\nTaczka zmieniona.\nUstawione, nowa taczka.\nZapisałam pojemność taczki.", "finish_taczka": "Koniec wożenia. Dobra robota!\nOstatnia taczka, beton wylany.\nSkończone. Odstaw taczkę!\nTo już wszystko. Brawo!\nFajrant, taczki do mycia.", "start_koparka": "Zaczynamy z koparką. Powodzenia!\nKoparka gotowa, lejemy.\nBetonowanie koparką rozpoczęte.\nŁyżka w ruch, zaczynamy!\nOperator gotowy? Zaczynamy.", "depart_koparka": "Łyżka w drodze.\nKoparka jedzie z betonem.\nPrzyjęłam, łyżka w trasie.\nDobra, koparka jedzie.\nŁyżka poleciała.\nKoparka w drodze, czekam.", "ask_koparka": "Czy koparka już wróciła?\nŁyżka jest już na miejscu?\nWróciła koparka?\nJest łyżka?\nŁyżka z powrotem?\nHalo, jest koparka?", "remind_koparka": "Koparka już jest?\nHalo, czy łyżka wróciła?\nDaj znać, czy koparka jest.\nCzekam na informację o koparce.\nJak tam łyżka?\nWróciła już koparka?", "arrived_koparka": "Dobrze, lejemy z łyżki.\nŚwietnie, łyżka na miejscu.\nSuper, wysypujemy.\nPrzyjęłam, lejemy.\nJest łyżka, dawaj.\nOkej, wysypujemy beton.", "late_koparka": "W porządku, zapytam o koparkę za chwilę.\nDobrze, czekamy na łyżkę.\nJasne, odezwę się za moment.\nRozumiem, koparka jeszcze jedzie.\nSpokojnie, czekam na koparkę.", "added_koparka": "Łyżka wylana.\nKolejna łyżka.\nŁyżka policzona.\nMamy kolejną łyżkę.\nZapisałam łyżkę.\nŁyżka poszła, liczę dalej.", "capacityChanged_koparka": "Pojemność łyżki ustawiona.\nŁyżka zmieniona.\nUstawione, nowa łyżka.\nZapisałam pojemność łyżki.", "finish_koparka": "Koniec betonowania koparką. Dobra robota!\nGotowe, łyżka odstawiona.\nSkończone. Dziękuję operatorowi!\nTo już wszystko. Brawo!\nFajrant, koparka zasłużyła na odpoczynek.", "heardOk": "Przyjęłam.\nOkej.\nJasne.\nZrobione.\nJuż.\nMam to.\nSię robi.\nDobra.\nZałatwione.", "ofeo": "Pamiętaj kliknąć Entladung w OFEO.\nKliknąłeś Entladung w OFEO?\nNie zapomnij o Entladung w OFEO.\nEntladung w OFEO kliknięty?"};
const LEGACY_TEXTS3 = {"start": "Zaczynamy betonowanie. Powodzenia, chłopaki!\nRuszamy z betonem. Jestem z wami.\nBetonowanie rozpoczęte. Do dzieła!\nNo to zaczynamy. Udanej roboty!\nStartujemy. Ja liczę, wy lejecie.\nGruszka podjechała, to lecimy z tematem.\nDobra, panowie, zaczynamy. Trzymam licznik.\nBeton czeka. Zaczynamy!\nZaczynamy. Spokojnie i równo, dacie radę.\nDo roboty! Liczę każdy kosz.\nLicznik wyzerowany, zaczynamy.\nHej, zaczynamy betonowanie. Uważajcie na siebie.\nNo to jazda z betonem!\nZaczynamy. Niech beton leje się równo.\nGotowa do liczenia. Lecimy!\nPierwszy kosz przed nami. Powodzenia!", "depart": "Kosz w drodze.\nKosz pojechał.\nPrzyjęłam, kosz w trasie.\nDobra, kosz jedzie.\nKosz poleciał.\nJedzie kosz, czekam.\nKosz w powietrzu.\nOk, kosz w drodze, liczę czas.\nPoszedł kosz.\nKosz wyjechał, daj znać jak wróci.\nKosz do góry, mierzę czas.\nLeci kosz.\nZapisane, kosz w trasie.\nOkej, czekamy na powrót kosza.\nKosz pojechał na górę.", "ask": "Czy kosz już wrócił?\nKosz jest już na miejscu?\nPrzyjechał już kosz?\nJest kosz?\nKosz już wisi?\nHalo, kosz wrócił?\nMamy już kosz z powrotem?\nI jak, jest kosz?\nKosz z powrotem?\nWrócił kosz, czy jeszcze lata?\nKosz już na dole?\nJest już kosz pod gruszką?\nHej, kosz wrócił?\nMożemy lać, kosz jest?\nKosz już czeka na beton?", "arrived": "Dobrze, lejemy dalej.\nŚwietnie, można lać.\nSuper, zalewamy.\nPrzyjęłam, lejemy.\nJest kosz, ładujemy.\nNo to lejemy.\nPięknie, kosz na miejscu.\nOkej, dawaj beton.\nSuper, zalewaj.\nJest, jedziemy dalej.\nKosz jest, napełniamy.\nDobra, beton do kosza.\nŚwietnie, lecimy z kolejnym.\nMamy kosz, działamy.\nOkej, sypiemy.", "late": "W porządku, zapytam za kilka chwil.\nDobrze, poczekam.\nJasne, odezwę się za moment.\nRozumiem, zapytam ponownie.\nSpokojnie, czekamy.\nOkej, dam mu chwilę.\nNie ma sprawy, poczekam na kosz.\nDobra, zapytam za chwilkę.\nRozumiem, kosz jeszcze lata.\nJasne, cierpliwie czekam.\nOkej, czekam spokojnie.\nDobrze, zapytam później.\nNie śpieszymy się, czekam.\nJasne, daj znać jak będzie.\nRozumiem, kosz jeszcze na górze.", "remind": "Kosz już jest?\nHalo, czy kosz wrócił?\nDaj znać, czy kosz jest.\nCzekam na informację o koszu.\nKosz wrócił?\nHej, kosz już na miejscu?\nJak tam kosz?\nPrzypominam się. Jest kosz?\nKosz już czeka?\nWrócił już ten kosz?\nHalo, halo, kosz już jest?\nCoś długo, kosz wrócił?\nKosz się nie zgubił?\nJest już kosz na dole?\nDalej czekamy na kosz?", "added": "Kosz zalany.\nZalane, policzone.\nDodane.\nMamy kolejny kosz.\nKosz policzony.\nJest, zapisałam.\nKolejny kosz na liczniku.\nZalany, liczę dalej.\nPięknie, następny.\nZapisany kosz.\nDobra robota, kosz poszedł.\nPoliczone, lecimy dalej.\nKosz na liście.\nOkej, kolejny zaliczony.\nSuper, jeden więcej.\nMam go, zapisane.", "undo": "Cofnięte.\nOstatni kosz usunięty.\nGotowe, cofnęłam.\nUsunięte z licznika.\nCofam, nie ma sprawy.\nSkasowane.\nOkej, ostatni odpada.\nZrobione, cofnęłam ostatni.\nNie było tematu, cofnięte.\nWymazane.\nDobra, poprawione.\nOstatni wpis skasowany.\nKażdemu się zdarza, cofnęłam.\nCofnięte, licznik poprawiony.", "reportLeft": "Zostało jeszcze X metra sześciennego.\nDo końca X metra sześciennego.\nPozostało X metra sześciennego.\nJeszcze X metra sześciennego do wylania.\nW gruszce jeszcze X kubika.\nZostało X kubika.\nJeszcze X metra do końca.\nPrzed nami X metra sześciennego.\nWedług licznika zostało X.\nW betonowozie jeszcze X metra.\nDo wylania zostało X.\nReszta to X metra sześciennego.", "reportPoured": "Wylano już X metra sześciennego.\nNa razie X metra sześciennego.\nMamy wylane X metra sześciennego.\nDo tej pory X metra sześciennego.\nPoszło już X kubika.\nWylane X metra.\nNa liczniku X metra sześciennego.\nZrobione X kubika.\nZa nami X metra sześciennego.\nJuż X metra w szalunku.\nWylaliśmy X kubika.\nLicznik pokazuje X.", "reportBuckets": "Zostało jeszcze X.\nDo końca X.\nPrzed nami X.\nJeszcze X.\nLiczę, że zostało X.\nZostaje X.\nWedług mnie jeszcze X.\nDo zrobienia X.\nSzacuję jeszcze X.\nNa oko jeszcze X.", "reportTime": "Betonowanie trwa X minut.\nPracujemy już X minut.\nOd startu minęło X minut.\nBetonujemy od X minut.\nLecimy już X minut.\nNa zegarze X minut.\nJesteśmy w robocie X minut.\nMinęło X minut od startu.\nLeje się już X minut.\nZegar pokazuje X minut.", "capacityChanged": "Pojemność kosza ustawiona.\nKosz zmieniony.\nUstawione, nowy kosz.\nZapisałam pojemność kosza.\nOkej, nowy kosz.\nZmieniłam kosz.\nNowa pojemność zapisana.\nKosz podmieniony.\nGotowe, liczę nowym koszem.\nPrzyjęłam nowy kosz.", "doseSet": "Ilość do kosza ustawiona.\nZapisane, tyle lejemy.\nIlość zmieniona.\nGotowe, ustawione.\nOkej, tyle do kosza.\nUstawiłam.\nPrzyjęłam ilość.\nTyle wlewamy.\nZmieniłam ilość.\nZapisane.", "fullBucket": "Pełny kosz.\nLejemy do pełna.\nCały kosz.\nUstawione na pełny.\nDo pełna, jedziemy.\nPełniutki kosz.\nNa full.\nKosz do pełna.\nPełen, okej.\nCałość.", "halfBucket": "Pół kosza.\nLejemy połowę.\nPołowa kosza.\nUstawione na pół.\nOkej, pół.\nPołówka.\nDo połowy.\nPół, zapisane.\nPołowa, jasne.\nPół kubła.", "error": "Nie zrozumiałam, powtórz proszę.\nMożesz powtórzyć?\nNie dosłyszałam.\nSłucham? Powtórz jeszcze raz.\nCoś mi uciekło, powtórz.\nGłośno tu, powtórz proszę.\nNie załapałam, jeszcze raz.\nPowiedz to jeszcze raz, proszę.\nHałas mi przeszkodził, powtórz.\nSorki, nie usłyszałam.\nJeszcze raz, wyraźniej proszę.", "left75": "Zostały trzy czwarte betonu.\nĆwiartka za nami, jedziemy dalej.\nPierwsza ćwiartka wylana.\nZostało jeszcze trzy czwarte.\nĆwierć zrobione, tak trzymać.\nPierwsza ćwiartka poszła.\nĆwiartka gruszki pusta.\nŁadnie idzie, ćwierć za nami.\nJedna czwarta zrobiona.\nPierwsze ćwierć poszło, lecimy.", "left50": "Połowa betonu wylana.\nJesteśmy w połowie.\nPół za nami, pół przed nami.\nZostało jeszcze pół betonu.\nPółmetek, dobra robota.\nPołowa gruszki pusta.\nPołowa zrobiona, tak trzymać.\nPółmetek. Druga połowa z górki.\nPół betonu w szalunku.\nJesteśmy na półmetku.", "left3": "Zostały jeszcze trzy metry sześcienne.\nJeszcze trzy kubiki.\nDo końca trzy metry.\nTrzy metry sześcienne do końca.\nTrzy kubiki, widać koniec.\nZostały trzy metry, dajemy.\nTrzy metry i fajrant z tą gruszką.\nJeszcze tylko trzy kubiki.\nTrzy metry, końcówka coraz bliżej.\nZostały trzy, lecimy.", "left15": "Zostało półtora metra sześciennego.\nJeszcze półtora kubika.\nPółtora metra do końca.\nZostało półtora, dajemy radę.\nPółtora kubika, końcówka blisko.\nJeszcze tylko półtora.\nPółtora metra i koniec.\nOstatnie półtora kubika.\nJuż tylko półtora.\nPółtora, prawie gotowe.", "left05": "Zostało pół metra. Ostatni kosz.\nJeszcze pół kubika.\nOstatnie pół metra.\nKońcówka, zostało pół metra.\nPół kubika, ostatnia prosta.\nTo już prawie koniec, pół metra.\nOstatni kosz przed nami.\nPół metra, ostatnie wysiłki.\nKońcówka gruszki, pół metra.\nZostało pół, uważajcie na końcówkę.", "low": "Uwaga, beton się kończy.\nBetonu zostało niewiele.\nZbliżamy się do końca.\nUwaga, końcówka betonu.\nKońcówka gruszki, uważajcie.\nMało betonu, ostrożnie z ostatnim koszem.\nUwaga, zaraz dno gruszki.\nBeton na wykończeniu.\nKońcówka, liczcie ostrożnie.\nZa chwilę koniec betonu.", "finish": "Koniec betonowania. Dobra robota!\nGotowe, beton wylany.\nSkończone. Dziękuję za pracę!\nTo już wszystko. Brawo!\nFajrant z betonem. Super robota!\nZrobione. Jestem z was dumna!\nKoniec. Kawa się należy.\nBeton wylany, panowie. Szacun!\nGotowe. Ładnie poszło!\nKoniec roboty z betonem. Odpocznijcie.\nWszystko wylane. Mistrzowie!\nZrobione na tip top.\nKoniec. Zapisałam wszystko w historii.\nBrawo ekipa, beton wylany.\nFajrant! Dzięki za dzisiaj.", "micOn": "Mikrofon włączony.\nSłucham.\nJestem gotowa.\nMikrofon działa, słucham.\nSłucham cię uważnie.\nJestem, mów.\nNasłuchuję.\nGotowa na komendy.\nSłucham, mów śmiało.\nMikrofon gotowy.", "start_taczka": "Zaczynamy, taczki w ruch!\nLejemy taczkami. Powodzenia!\nBetonowanie taczką rozpoczęte.\nNo to wozimy. Do roboty!\nTaczki gotowe, jedziemy.\nWozimy beton. Liczę każdą taczkę.\nTaczka w dłoń i jazda.\nStartujemy z taczkami.\nWozimy, ja liczę.\nDo roboty, taczki czekają.", "added_taczka": "Taczka wylana.\nKolejna taczka.\nTaczka policzona.\nJest taczka, jedziemy dalej.\nZapisałam taczkę.\nTaczka poszła.\nNastępna taczka na liczniku.\nPięknie, kolejna.\nTaczka zaliczona.\nJedna więcej.\nMam taczkę.\nTaczka na liście.", "capacityChanged_taczka": "Pojemność taczki ustawiona.\nTaczka zmieniona.\nUstawione, nowa taczka.\nZapisałam pojemność taczki.\nOkej, nowa taczka.\nPodmieniłam taczkę.", "finish_taczka": "Koniec wożenia. Dobra robota!\nOstatnia taczka, beton wylany.\nSkończone. Odstaw taczkę!\nTo już wszystko. Brawo!\nFajrant, taczki do mycia.\nWywiezione. Dzięki!\nGotowe, ręce odpoczną.\nKoniec taczek na dziś.", "start_koparka": "Zaczynamy z koparką. Powodzenia!\nKoparka gotowa, lejemy.\nBetonowanie koparką rozpoczęte.\nŁyżka w ruch, zaczynamy!\nOperator gotowy? Zaczynamy.\nKoparka startuje.\nLecimy z łyżką.\nDo roboty, koparka czeka.", "depart_koparka": "Łyżka w drodze.\nKoparka jedzie z betonem.\nPrzyjęłam, łyżka w trasie.\nDobra, koparka jedzie.\nŁyżka poleciała.\nKoparka w drodze, czekam.\nŁyżka w górę.\nKoparka wiezie beton.\nŁyżka pojechała.\nOkej, koparka w trasie.", "ask_koparka": "Czy koparka już wróciła?\nŁyżka jest już na miejscu?\nWróciła koparka?\nJest łyżka?\nŁyżka z powrotem?\nHalo, jest koparka?\nKoparka już czeka?\nŁyżka pod gruszką?\nWróciła łyżka?\nMożemy lać do łyżki?", "remind_koparka": "Koparka już jest?\nHalo, czy łyżka wróciła?\nDaj znać, czy koparka jest.\nCzekam na informację o koparce.\nJak tam łyżka?\nWróciła już koparka?\nPrzypominam się, jest łyżka?\nKoparka się nie zgubiła?\nDalej czekamy na łyżkę?\nJest już koparka?", "arrived_koparka": "Dobrze, lejemy z łyżki.\nŚwietnie, łyżka na miejscu.\nSuper, wysypujemy.\nPrzyjęłam, lejemy.\nJest łyżka, dawaj.\nOkej, wysypujemy beton.\nŁyżka jest, ładujemy.\nSuper, beton do łyżki.\nMamy koparkę, działamy.\nJest, lejemy dalej.", "late_koparka": "W porządku, zapytam o koparkę za chwilę.\nDobrze, czekamy na łyżkę.\nJasne, odezwę się za moment.\nRozumiem, koparka jeszcze jedzie.\nSpokojnie, czekam na koparkę.\nOkej, dam koparce chwilę.\nNie ma sprawy, czekam.\nJasne, zapytam później.", "added_koparka": "Łyżka wylana.\nKolejna łyżka.\nŁyżka policzona.\nMamy kolejną łyżkę.\nZapisałam łyżkę.\nŁyżka poszła, liczę dalej.\nJedna łyżka więcej.\nŁyżka zaliczona.\nPięknie, kolejna łyżka.\nŁyżka na liczniku.", "capacityChanged_koparka": "Pojemność łyżki ustawiona.\nŁyżka zmieniona.\nUstawione, nowa łyżka.\nZapisałam pojemność łyżki.\nOkej, nowa łyżka.\nPodmieniłam łyżkę.", "finish_koparka": "Koniec betonowania koparką. Dobra robota!\nGotowe, łyżka odstawiona.\nSkończone. Dziękuję operatorowi!\nTo już wszystko. Brawo!\nFajrant, koparka zasłużyła na odpoczynek.\nKoniec. Łyżka do mycia.\nZrobione, dzięki ekipa.\nBeton wylany koparką. Szacun!", "heardOk": "Przyjęłam.\nOkej.\nJasne.\nZrobione.\nJuż.\nMam to.\nSię robi.\nDobra.\nZałatwione.\nSłyszę.\nRobi się.\nPewnie.\nNo jasne.\nJuż się robi.\nPrzyjęte.", "ofeo": "Pamiętaj kliknąć Entladung w OFEO.\nKliknąłeś Entladung w OFEO?\nNie zapomnij o Entladung w OFEO.\nEntladung w OFEO kliknięty?\nHej, Entladung w OFEO zrobiony?\nOFEO, Entladung, pamiętasz?\nZanim zaczniemy, Entladung w OFEO.\nPrzypominam o Entladung w OFEO.", "reportCap": "Kosz ma X metra sześciennego.\nPojemność kosza to X.\nW kosz wchodzi X metra.\nUstawiony kosz: X metra sześciennego.\nLiczę koszem X metra.\nKosz mieści X kubika.\nKosz to X metra.\nMamy kosz X metra sześciennego.", "reportEta": "Koniec około X.\nSkończymy koło X.\nPrzy tym tempie koniec o X.\nLiczę, że skończymy o X.\nFajrant z betonem około X.\nOstatni kosz koło X.\nWyrobimy się na X.\nSzacuję koniec na X.", "reportTrip": "Średni kurs trwa X.\nKosz lata średnio X.\nJeden kurs to średnio X.\nŚrednio X na kurs.\nKurs zajmuje mniej więcej X.\nKosz wraca średnio po X.\nNa jeden kurs idzie X.\nŚrednio X tam i z powrotem.", "muted": "Dobra, cicho siedzę.\nOkej, milczę. Zawołaj, jak będę potrzebna.\nJuż nic nie mówię.\nCisza. Słucham dalej.\nJasne, wyciszam się.\nOkej, będę tylko piszczeć.\nRozumiem, zamykam buzię.\nCichutko, liczę dalej.", "unmuted": "Jestem z powrotem.\nOkej, znowu gadam.\nWracam do mówienia.\nDobra, mówię dalej.\nHej, znowu jestem.\nWracam, słyszysz mnie?\nOkej, gadam.\nZnowu z wami."};
const LEGACY_TEXTS5 = {"added": "Kosz zalany.\nZalane, policzone.\nDodane.\nMamy kolejny kosz.\nKosz policzony.\nJest, zapisałam.\nKolejny kosz na liczniku.\nZalany, liczę dalej.\nPięknie, następny.\nZapisany kosz.\nDobra robota, kosz poszedł.\nPoliczone, lecimy dalej.\nKosz na liście.\nOkej, kolejny zaliczony.\nSuper, jeden więcej.\nMam go, zapisane.", "depart": "Kosz w drodze.\nKosz pojechał.\nPrzyjęłam, kosz w trasie.\nDobra, kosz jedzie.\nKosz poleciał.\nJedzie kosz, czekam.\nKosz w powietrzu.\nOk, kosz w drodze, liczę czas.\nPoszedł kosz.\nKosz wyjechał, daj znać jak wróci.\nKosz do góry, mierzę czas.\nLeci kosz.\nZapisane, kosz w trasie.\nOkej, czekamy na powrót kosza.\nKosz pojechał na górę.", "arrived": "Dobrze, lejemy dalej.\nŚwietnie, można lać.\nSuper, zalewamy.\nPrzyjęłam, lejemy.\nJest kosz, ładujemy.\nNo to lejemy.\nPięknie, kosz na miejscu.\nOkej, dawaj beton.\nSuper, zalewaj.\nJest, jedziemy dalej.\nKosz jest, napełniamy.\nDobra, beton do kosza.\nŚwietnie, lecimy z kolejnym.\nMamy kosz, działamy.\nOkej, sypiemy.", "idle": "Przerwa? Nic nie dodaliście od dziesięciu minut.\nDługo cisza. Wszystko w porządku?\nDawno nie było kosza. Czekamy na coś?", "fastTrip": "To był najszybszy kurs dzisiaj. Brawo!\nRekord dnia, szybki kurs.\nAle tempo, najszybszy kurs!"}; // 5.4.1: stare kopie z telefonu → nowe teksty
const LEGACY_TEXTS4 = {"start": "Zaczynamy betonowanie. Powodzenia, chłopaki!\nRuszamy z betonem. Jestem z wami.\nBetonowanie rozpoczęte. Do dzieła!\nNo to zaczynamy. Udanej roboty!\nStartujemy. Ja liczę, wy lejecie.\nGruszka podjechała, to lecimy z tematem.\nDobra, panowie, zaczynamy. Trzymam licznik.\nBeton czeka. Zaczynamy!\nZaczynamy. Spokojnie i równo, dacie radę.\nDo roboty! Liczę każdy kosz.\nLicznik wyzerowany, zaczynamy.\nHej, zaczynamy betonowanie. Uważajcie na siebie.\nNo to jazda z betonem!\nZaczynamy. Niech beton leje się równo.\nGotowa do liczenia. Lecimy!\nPierwszy kosz przed nami. Powodzenia!\nNo to do roboty, jak na wykopkach u babci!\nZaczynamy, panowie. Krowy wydojone, beton czeka.\nRuszamy jak traktor na zimnym silniku, ale ruszamy!\nDo roboty, bo sołtys patrzy!", "depart": "Kosz w drodze.\nKosz pojechał.\nPrzyjęłam, kosz w trasie.\nDobra, kosz jedzie.\nKosz poleciał.\nJedzie kosz, czekam.\nKosz w powietrzu.\nOk, kosz w drodze, liczę czas.\nPoszedł kosz.\nKosz wyjechał, daj znać jak wróci.\nKosz do góry, mierzę czas.\nLeci kosz.\nZapisane, kosz w trasie.\nOkej, czekamy na powrót kosza.\nKosz pojechał na górę.\nKosz pojechał jak wóz z sianem.\nPoleciał jak kura spod siekiery.\nKosz w drodze, jak sąsiad do monopolowego.\nJedzie kosz, szybciej niż gminny autobus.", "ask": "Czy kosz już wrócił?\nKosz jest już na miejscu?\nPrzyjechał już kosz?\nJest kosz?\nKosz już wisi?\nHalo, kosz wrócił?\nMamy już kosz z powrotem?\nI jak, jest kosz?\nKosz z powrotem?\nWrócił kosz, czy jeszcze lata?\nKosz już na dole?\nJest już kosz pod gruszką?\nHej, kosz wrócił?\nMożemy lać, kosz jest?\nKosz już czeka na beton?\nKosz już wrócił, czy poszedł do sąsiada na kielicha?\nJest kosz, czy się w polu zgubił?\nKosz wrócił, czy jeszcze krowy pasie?\nHalo, kosz już z odpustu wrócił?", "arrived": "Dobrze, lejemy dalej.\nŚwietnie, można lać.\nSuper, zalewamy.\nPrzyjęłam, lejemy.\nJest kosz, ładujemy.\nNo to lejemy.\nPięknie, kosz na miejscu.\nOkej, dawaj beton.\nSuper, zalewaj.\nJest, jedziemy dalej.\nKosz jest, napełniamy.\nDobra, beton do kosza.\nŚwietnie, lecimy z kolejnym.\nMamy kosz, działamy.\nOkej, sypiemy.\nJest kosz, jak teściowa na niedzielny obiad.\nNo i jest, punktualny jak kogut o świcie.\nWrócił, sypiemy jak paszę do koryta.\nKosz jest, lejemy jak mleko do bańki.", "late": "W porządku, zapytam za kilka chwil.\nDobrze, poczekam.\nJasne, odezwę się za moment.\nRozumiem, zapytam ponownie.\nSpokojnie, czekamy.\nOkej, dam mu chwilę.\nNie ma sprawy, poczekam na kosz.\nDobra, zapytam za chwilkę.\nRozumiem, kosz jeszcze lata.\nJasne, cierpliwie czekam.\nOkej, czekam spokojnie.\nDobrze, zapytam później.\nNie śpieszymy się, czekam.\nJasne, daj znać jak będzie.\nRozumiem, kosz jeszcze na górze.\nSpokojnie, kosz pewnie stoi w kolejce w GS-ie.\nDobra, poczekamy jak na autobus w PKS-ie.\nNic to, kosz pewnie gada z sołtysem.\nPoczekam, jak na deszcz w czasie suszy.", "remind": "Kosz już jest?\nHalo, czy kosz wrócił?\nDaj znać, czy kosz jest.\nCzekam na informację o koszu.\nKosz wrócił?\nHej, kosz już na miejscu?\nJak tam kosz?\nPrzypominam się. Jest kosz?\nKosz już czeka?\nWrócił już ten kosz?\nHalo, halo, kosz już jest?\nCoś długo, kosz wrócił?\nKosz się nie zgubił?\nJest już kosz na dole?\nDalej czekamy na kosz?\nKosz już wrócił, czy w remizie na zabawie?\nHalo, kosz się nie zasiedział u wujka?\nJest kosz, czy znowu poszedł w maliny?\nKosz już jest, czy jeszcze ciągnie jak żółw po kartoflisku?", "added": "Kosz zalany.\nZalane, policzone.\nDodane.\nMamy kolejny kosz.\nKosz policzony.\nJest, zapisałam.\nKolejny kosz na liczniku.\nZalany, liczę dalej.\nPięknie, następny.\nZapisany kosz.\nDobra robota, kosz poszedł.\nPoliczone, lecimy dalej.\nKosz na liście.\nOkej, kolejny zaliczony.\nSuper, jeden więcej.\nMam go, zapisane.\nZalane, pełny jak stodoła po żniwach.\nKosz zalany jak beczka u sołtysa.\nPoszło jak świeże bułki w gminnym sklepie.\nZapisane, jak długi w zeszycie u sklepowej.\nJest, jak kopa siana na wozie.", "undo": "Cofnięte.\nOstatni kosz usunięty.\nGotowe, cofnęłam.\nUsunięte z licznika.\nCofam, nie ma sprawy.\nSkasowane.\nOkej, ostatni odpada.\nZrobione, cofnęłam ostatni.\nNie było tematu, cofnięte.\nWymazane.\nDobra, poprawione.\nOstatni wpis skasowany.\nKażdemu się zdarza, cofnęłam.\nCofnięte, licznik poprawiony.\nCofnięte, jak krowa z szosy.\nCofam, nie było, jak u wójta w papierach.\nSkasowane, jak plotka w kościele.", "reportLeft": "Zostało jeszcze X metra sześciennego.\nDo końca X metra sześciennego.\nPozostało X metra sześciennego.\nJeszcze X metra sześciennego do wylania.\nW gruszce jeszcze X kubika.\nZostało X kubika.\nJeszcze X metra do końca.\nPrzed nami X metra sześciennego.\nWedług licznika zostało X.\nW betonowozie jeszcze X metra.\nDo wylania zostało X.\nReszta to X metra sześciennego.", "reportPoured": "Wylano już X metra sześciennego.\nNa razie X metra sześciennego.\nMamy wylane X metra sześciennego.\nDo tej pory X metra sześciennego.\nPoszło już X kubika.\nWylane X metra.\nNa liczniku X metra sześciennego.\nZrobione X kubika.\nZa nami X metra sześciennego.\nJuż X metra w szalunku.\nWylaliśmy X kubika.\nLicznik pokazuje X.", "reportBuckets": "Zostało jeszcze X.\nDo końca X.\nPrzed nami X.\nJeszcze X.\nLiczę, że zostało X.\nZostaje X.\nWedług mnie jeszcze X.\nDo zrobienia X.\nSzacuję jeszcze X.\nNa oko jeszcze X.", "reportTime": "Betonowanie trwa X minut.\nPracujemy już X minut.\nOd startu minęło X minut.\nBetonujemy od X minut.\nLecimy już X minut.\nNa zegarze X minut.\nJesteśmy w robocie X minut.\nMinęło X minut od startu.\nLeje się już X minut.\nZegar pokazuje X minut.", "capacityChanged": "Pojemność kosza ustawiona.\nKosz zmieniony.\nUstawione, nowy kosz.\nZapisałam pojemność kosza.\nOkej, nowy kosz.\nZmieniłam kosz.\nNowa pojemność zapisana.\nKosz podmieniony.\nGotowe, liczę nowym koszem.\nPrzyjęłam nowy kosz.", "doseSet": "Ilość do kosza ustawiona.\nZapisane, tyle lejemy.\nIlość zmieniona.\nGotowe, ustawione.\nOkej, tyle do kosza.\nUstawiłam.\nPrzyjęłam ilość.\nTyle wlewamy.\nZmieniłam ilość.\nZapisane.", "fullBucket": "Pełny kosz.\nLejemy do pełna.\nCały kosz.\nUstawione na pełny.\nDo pełna, jedziemy.\nPełniutki kosz.\nNa full.\nKosz do pełna.\nPełen, okej.\nCałość.", "halfBucket": "Pół kosza.\nLejemy połowę.\nPołowa kosza.\nUstawione na pół.\nOkej, pół.\nPołówka.\nDo połowy.\nPół, zapisane.\nPołowa, jasne.\nPół kubła.", "error": "Nie zrozumiałam, powtórz proszę.\nMożesz powtórzyć?\nNie dosłyszałam.\nSłucham? Powtórz jeszcze raz.\nCoś mi uciekło, powtórz.\nGłośno tu, powtórz proszę.\nNie załapałam, jeszcze raz.\nPowiedz to jeszcze raz, proszę.\nHałas mi przeszkodził, powtórz.\nSorki, nie usłyszałam.\nJeszcze raz, wyraźniej proszę.\nCo? Mówisz jak dziadek po trzecim kieliszku.\nNie zrozumiałam, jakby ktoś gadał przez kombajn.\nJeszcze raz, bo tu huczy jak w młocarni.", "left75": "Zostały trzy czwarte betonu.\nĆwiartka za nami, jedziemy dalej.\nPierwsza ćwiartka wylana.\nZostało jeszcze trzy czwarte.\nĆwierć zrobione, tak trzymać.\nPierwsza ćwiartka poszła.\nĆwiartka gruszki pusta.\nŁadnie idzie, ćwierć za nami.\nJedna czwarta zrobiona.\nPierwsze ćwierć poszło, lecimy.", "left50": "Połowa betonu wylana.\nJesteśmy w połowie.\nPół za nami, pół przed nami.\nZostało jeszcze pół betonu.\nPółmetek, dobra robota.\nPołowa gruszki pusta.\nPołowa zrobiona, tak trzymać.\nPółmetek. Druga połowa z górki.\nPół betonu w szalunku.\nJesteśmy na półmetku.\nPołowa, jak w beczce u gospodarza po weselu.\nPółmetek, jak obiad u babci, druga połowa najlepsza.", "left3": "Zostały jeszcze trzy metry sześcienne.\nJeszcze trzy kubiki.\nDo końca trzy metry.\nTrzy metry sześcienne do końca.\nTrzy kubiki, widać koniec.\nZostały trzy metry, dajemy.\nTrzy metry i fajrant z tą gruszką.\nJeszcze tylko trzy kubiki.\nTrzy metry, końcówka coraz bliżej.\nZostały trzy, lecimy.", "left15": "Zostało półtora metra sześciennego.\nJeszcze półtora kubika.\nPółtora metra do końca.\nZostało półtora, dajemy radę.\nPółtora kubika, końcówka blisko.\nJeszcze tylko półtora.\nPółtora metra i koniec.\nOstatnie półtora kubika.\nJuż tylko półtora.\nPółtora, prawie gotowe.", "left05": "Zostało pół metra. Ostatni kosz.\nJeszcze pół kubika.\nOstatnie pół metra.\nKońcówka, zostało pół metra.\nPół kubika, ostatnia prosta.\nTo już prawie koniec, pół metra.\nOstatni kosz przed nami.\nPół metra, ostatnie wysiłki.\nKońcówka gruszki, pół metra.\nZostało pół, uważajcie na końcówkę.", "low": "Uwaga, beton się kończy.\nBetonu zostało niewiele.\nZbliżamy się do końca.\nUwaga, końcówka betonu.\nKońcówka gruszki, uważajcie.\nMało betonu, ostrożnie z ostatnim koszem.\nUwaga, zaraz dno gruszki.\nBeton na wykończeniu.\nKońcówka, liczcie ostrożnie.\nZa chwilę koniec betonu.\nUwaga, beton się kończy jak bimber na weselu.\nKońcówka, zaraz dno jak w studni w lipcu.\nMało betonu, jak kiełbasy na komunii po dwudziestej.", "finish": "Koniec betonowania. Dobra robota!\nGotowe, beton wylany.\nSkończone. Dziękuję za pracę!\nTo już wszystko. Brawo!\nFajrant z betonem. Super robota!\nZrobione. Jestem z was dumna!\nKoniec. Kawa się należy.\nBeton wylany, panowie. Szacun!\nGotowe. Ładnie poszło!\nKoniec roboty z betonem. Odpocznijcie.\nWszystko wylane. Mistrzowie!\nZrobione na tip top.\nKoniec. Zapisałam wszystko w historii.\nBrawo ekipa, beton wylany.\nFajrant! Dzięki za dzisiaj.\nFajrant! Teraz można iść na piwo pod sklep.\nKoniec, beton wylany, krowy mogą wracać.\nGotowe, roboty jak na wsi przed odpustem, ale zrobione!\nKoniec betonowania. Sołtys byłby dumny!", "micOn": "Mikrofon włączony.\nSłucham.\nJestem gotowa.\nMikrofon działa, słucham.\nSłucham cię uważnie.\nJestem, mów.\nNasłuchuję.\nGotowa na komendy.\nSłucham, mów śmiało.\nMikrofon gotowy.", "start_taczka": "Zaczynamy, taczki w ruch!\nLejemy taczkami. Powodzenia!\nBetonowanie taczką rozpoczęte.\nNo to wozimy. Do roboty!\nTaczki gotowe, jedziemy.\nWozimy beton. Liczę każdą taczkę.\nTaczka w dłoń i jazda.\nStartujemy z taczkami.\nWozimy, ja liczę.\nDo roboty, taczki czekają.", "added_taczka": "Taczka wylana.\nKolejna taczka.\nTaczka policzona.\nJest taczka, jedziemy dalej.\nZapisałam taczkę.\nTaczka poszła.\nNastępna taczka na liczniku.\nPięknie, kolejna.\nTaczka zaliczona.\nJedna więcej.\nMam taczkę.\nTaczka na liście.\nTaczka wywieziona jak obornik w marcu.\nTaczka poszła, jak gnój na pole.", "capacityChanged_taczka": "Pojemność taczki ustawiona.\nTaczka zmieniona.\nUstawione, nowa taczka.\nZapisałam pojemność taczki.\nOkej, nowa taczka.\nPodmieniłam taczkę.", "finish_taczka": "Koniec wożenia. Dobra robota!\nOstatnia taczka, beton wylany.\nSkończone. Odstaw taczkę!\nTo już wszystko. Brawo!\nFajrant, taczki do mycia.\nWywiezione. Dzięki!\nGotowe, ręce odpoczną.\nKoniec taczek na dziś.", "start_koparka": "Zaczynamy z koparką. Powodzenia!\nKoparka gotowa, lejemy.\nBetonowanie koparką rozpoczęte.\nŁyżka w ruch, zaczynamy!\nOperator gotowy? Zaczynamy.\nKoparka startuje.\nLecimy z łyżką.\nDo roboty, koparka czeka.", "depart_koparka": "Łyżka w drodze.\nKoparka jedzie z betonem.\nPrzyjęłam, łyżka w trasie.\nDobra, koparka jedzie.\nŁyżka poleciała.\nKoparka w drodze, czekam.\nŁyżka w górę.\nKoparka wiezie beton.\nŁyżka pojechała.\nOkej, koparka w trasie.", "ask_koparka": "Czy koparka już wróciła?\nŁyżka jest już na miejscu?\nWróciła koparka?\nJest łyżka?\nŁyżka z powrotem?\nHalo, jest koparka?\nKoparka już czeka?\nŁyżka pod gruszką?\nWróciła łyżka?\nMożemy lać do łyżki?", "remind_koparka": "Koparka już jest?\nHalo, czy łyżka wróciła?\nDaj znać, czy koparka jest.\nCzekam na informację o koparce.\nJak tam łyżka?\nWróciła już koparka?\nPrzypominam się, jest łyżka?\nKoparka się nie zgubiła?\nDalej czekamy na łyżkę?\nJest już koparka?", "arrived_koparka": "Dobrze, lejemy z łyżki.\nŚwietnie, łyżka na miejscu.\nSuper, wysypujemy.\nPrzyjęłam, lejemy.\nJest łyżka, dawaj.\nOkej, wysypujemy beton.\nŁyżka jest, ładujemy.\nSuper, beton do łyżki.\nMamy koparkę, działamy.\nJest, lejemy dalej.", "late_koparka": "W porządku, zapytam o koparkę za chwilę.\nDobrze, czekamy na łyżkę.\nJasne, odezwę się za moment.\nRozumiem, koparka jeszcze jedzie.\nSpokojnie, czekam na koparkę.\nOkej, dam koparce chwilę.\nNie ma sprawy, czekam.\nJasne, zapytam później.", "added_koparka": "Łyżka wylana.\nKolejna łyżka.\nŁyżka policzona.\nMamy kolejną łyżkę.\nZapisałam łyżkę.\nŁyżka poszła, liczę dalej.\nJedna łyżka więcej.\nŁyżka zaliczona.\nPięknie, kolejna łyżka.\nŁyżka na liczniku.\nŁyżka wylana, jak kartofle na przyczepę.\nŁyżka poszła, równiutko jak bruzda.", "capacityChanged_koparka": "Pojemność łyżki ustawiona.\nŁyżka zmieniona.\nUstawione, nowa łyżka.\nZapisałam pojemność łyżki.\nOkej, nowa łyżka.\nPodmieniłam łyżkę.", "finish_koparka": "Koniec betonowania koparką. Dobra robota!\nGotowe, łyżka odstawiona.\nSkończone. Dziękuję operatorowi!\nTo już wszystko. Brawo!\nFajrant, koparka zasłużyła na odpoczynek.\nKoniec. Łyżka do mycia.\nZrobione, dzięki ekipa.\nBeton wylany koparką. Szacun!", "heardOk": "Przyjęłam.\nOkej.\nJasne.\nZrobione.\nJuż.\nMam to.\nSię robi.\nDobra.\nZałatwione.\nSłyszę.\nRobi się.\nPewnie.\nNo jasne.\nJuż się robi.\nPrzyjęte.\nSię robi, gospodarzu.\nJasne, jak słońce na wsi.\nRobi się, jak mówi sołtys.", "ofeo": "Pamiętaj kliknąć Entladung w OFEO.\nKliknąłeś Entladung w OFEO?\nNie zapomnij o Entladung w OFEO.\nEntladung w OFEO kliknięty?\nHej, Entladung w OFEO zrobiony?\nOFEO, Entladung, pamiętasz?\nZanim zaczniemy, Entladung w OFEO.\nPrzypominam o Entladung w OFEO.", "reportCap": "Kosz ma X metra sześciennego.\nPojemność kosza to X.\nW kosz wchodzi X metra.\nUstawiony kosz: X metra sześciennego.\nLiczę koszem X metra.\nKosz mieści X kubika.\nKosz to X metra.\nMamy kosz X metra sześciennego.", "reportEta": "Koniec około X.\nSkończymy koło X.\nPrzy tym tempie koniec o X.\nLiczę, że skończymy o X.\nFajrant z betonem około X.\nOstatni kosz koło X.\nWyrobimy się na X.\nSzacuję koniec na X.", "reportTrip": "Średni kurs trwa X.\nKosz lata średnio X.\nJeden kurs to średnio X.\nŚrednio X na kurs.\nKurs zajmuje mniej więcej X.\nKosz wraca średnio po X.\nNa jeden kurs idzie X.\nŚrednio X tam i z powrotem.", "muted": "Dobra, cicho siedzę.\nOkej, milczę. Zawołaj, jak będę potrzebna.\nJuż nic nie mówię.\nCisza. Słucham dalej.\nJasne, wyciszam się.\nOkej, będę tylko piszczeć.\nRozumiem, zamykam buzię.\nCichutko, liczę dalej.\nDobra, cicho jak mysz w spiżarni.", "unmuted": "Jestem z powrotem.\nOkej, znowu gadam.\nWracam do mówienia.\nDobra, mówię dalej.\nHej, znowu jestem.\nWracam, słyszysz mnie?\nOkej, gadam.\nZnowu z wami.\nJestem z powrotem, jak bocian na wiosnę."};
const TEXT_GROUPS = [
  ['Rozmowa o kosz', [['start', 'Start betonowania'], ['depart', 'Kosz wyjechał'], ['ask', 'Pytanie: czy kosz wrócił?'], ['remind', 'Ponowne pytanie (co 30 s)'], ['arrived', 'Odpowiedź „tak, jest”'], ['late', 'Odpowiedź „jeszcze nie”']]],
  ['Komendy', [['heardOk', 'Potwierdzenie, że usłyszał komendę'], ['added', 'Kosz naliczony'], ['undo', 'Cofnięcie'], ['capacityChanged', 'Zmiana kosza'], ['doseSet', 'Ilość do kosza ustawiona'], ['fullBucket', 'Pełny kosz'], ['halfBucket', 'Pół kosza'], ['error', 'Nie zrozumiał']]],
  ['Odpowiedzi z liczbą (X = liczba)', [['reportLeft', 'Ile zostało'], ['reportBuckets', 'Ile koszy zostało'], ['reportPoured', 'Ile wylano'], ['reportTime', 'Czas betonowania'], ['reportCap', 'Jaki kosz (X = pojemność)'], ['reportEta', 'Kiedy koniec (X = godzina)'], ['reportTrip', 'Średni kurs (X = czas)'], ['muted', 'Wyciszona (komenda „cisza”)'], ['unmuted', 'Znowu mówi („gadaj”)'], ['ofeo', 'Przypomnienie Entladung OFEO'], ['hearYou', 'Odpowiedź na „słyszysz mnie?”'], ['snooze', 'Zapytaj za… (X = czas)']]],
  ['💬 Pogadanki i dialog', [['hello', 'Cześć'], ['howAreYou', 'Jak się masz'], ['joke', 'Kawał'], ['thanks', 'Dziękuję'], ['love', 'Kocham cię / jesteś super'], ['best', 'Kto najlepszy'], ['name', 'Jak masz na imię'], ['time', 'Która godzina (X)'], ['tired', 'Jestem zmęczony'], ['coffee', 'Kawa / przerwa'], ['bored', 'Nudzi mi się'], ['insult', 'Jak ją wyzwiesz'], ['fixed', 'Poprawka ostatniego (X)'], ['added2', 'Kilka kursów naraz (X)'], ['leftAfter', 'Dopisek „zostało X” po kursie'], ['slowTrip', 'Kosz lata dłużej niż zwykle'], ['fastTrip', 'Najszybszy kurs'], ['idle', 'Długa przerwa (10 min)']]],
  ['🛒 Taczka (zamiast tekstów kosza)', [['start_taczka', 'Start'], ['added_taczka', 'Taczka naliczona'], ['capacityChanged_taczka', 'Zmiana taczki'], ['finish_taczka', 'Koniec']]],
  ['🚜 Koparka — rozładunek „Inne”', [['start_koparka', 'Start'], ['depart_koparka', 'Łyżka wyjechała'], ['ask_koparka', 'Pytanie: czy wróciła?'], ['remind_koparka', 'Ponowne pytanie'], ['arrived_koparka', 'Odpowiedź „tak”'], ['late_koparka', 'Odpowiedź „jeszcze nie”'], ['added_koparka', 'Łyżka naliczona'], ['capacityChanged_koparka', 'Zmiana łyżki'], ['finish_koparka', 'Koniec']]],
  ['Bot mówi sam', [['left75', 'Zostało 75% betonu'], ['left50', 'Zostało 50% betonu'], ['left3', 'Zostały 3 m³'], ['left15', 'Zostało 1,5 m³'], ['left05', 'Zostało 0,5 m³'], ['low', 'Mało betonu'], ['finish', 'Koniec betonowania'], ['micOn', 'Mikrofon włączony']]],
];
const SHORT = { start: 'Start betonowania', depart: 'Kosz wyjechał', ask: 'Czy kosz wrócił?', arrived: 'Kosz jest', late: 'Kosza jeszcze nie ma', remind: 'Sprawdź powrót kosza', added: 'Naliczono kosz', undo: 'Cofnięto', low: 'Kończy się beton', finish: 'Koniec betonowania', error: 'Nie rozpoznano komendy', left75: 'Zostało 75% betonu', left50: 'Zostało 50% betonu', left3: 'Zostały 3 m³', left15: 'Zostało 1,5 m³', left05: 'Zostało 0,5 m³', capacityChanged: 'Kosz zmieniony', doseSet: 'Ilość ustawiona', fullBucket: 'Pełny kosz', halfBucket: 'Pół kosza', micOn: 'Mikrofon włączony' };
const TEXT_KEY = 'beton_texts_v2', SETTINGS_KEY = 'beton_settings_v2';
/** losowy wariant (każda linia = wariant), bez powtórzenia poprzedniego */
const lastPick = {}, bags = {};
/** losowy wariant bez powtórek: każda linia pada raz, zanim któraś się powtórzy (worek z tasowaniem) */
/** lektorka to babka: męskie końcówki w tekstach (też starych, zapisanych przez usera) → damskie. Tylko to, co bot MÓWI — komendy Domisia zostają. */
const FEM_SKIP = new Set(['dołem', 'kołem', 'stołem', 'pomysłem', 'hasłem', 'masłem', 'krzesłem', 'wiosłem', 'osłem', 'węzłem', 'aniołem', 'popiołem', 'kościołem', 'orłem', 'przemysłem', 'zmysłem', 'mułem', 'ciałem', 'działem', 'materiałem', 'kanałem', 'upałem', 'zapałem', 'szałem', 'wałem', 'sygnałem', 'ideałem', 'finałem', 'kapitałem', 'generałem', 'kryształem', 'rozdziałem', 'udziałem', 'podziałem', 'przydziałem', 'idiotą']);
const FEM_ADJ = 'gotowy|pewny|pewien|zmęczony|głodny|wkurzony|zadowolony|szczęśliwy|ciekawy|napalony|zajęty|wyczerpany|dumny|głuchy|zakochany|wściekły|obrażony|sam|sprawny|przekonany|zachwycony|smutny|spokojny|zły|rad';
const FEM_IRR = { poszedłem: 'poszłam', wszedłem: 'weszłam', wyszedłem: 'wyszłam', przyszedłem: 'przyszłam', zszedłem: 'zeszłam', doszedłem: 'doszłam', odszedłem: 'odeszłam', szedłem: 'szłam', znalazłem: 'znalazłam', mogłem: 'mogłam', pomogłem: 'pomogłam', zjadłem: 'zjadłam', usiadłem: 'usiadłam', siadłem: 'siadłam', jadłem: 'jadłam', rzekłem: 'rzekłam', biegłem: 'biegłam' };
const FEM_NOUN_L = new Set(['szał', 'wał', 'kanał', 'upał', 'zapał', 'materiał', 'dział', 'sygnał', 'ideał', 'finał', 'kapitał', 'generał', 'kryształ', 'pył', 'muł', 'dół', 'stół', 'popiół', 'kocioł', 'anioł', 'orzeł', 'osioł', 'kozioł', 'węzeł', 'sokół', 'kościół', 'paweł', 'michał', 'rafał', 'przemysł', 'pomysł', 'zmysł', 'ił', 'kał', 'bal', 'mał', 'cał']);
const femPastL = w => { const l = w.toLowerCase(), irr = { mógł: 'mogła', poszedł: 'poszła', wszedł: 'weszła', wyszedł: 'wyszła', przyszedł: 'przyszła', szedł: 'szła', zjadł: 'zjadła', jadł: 'jadła', znalazł: 'znalazła', usiadł: 'usiadła', pomógł: 'pomogła', rzekł: 'rzekła', biegł: 'biegła', zaniósł: 'zaniosła', niósł: 'niosła', wiózł: 'wiozła', ugryzł: 'ugryzła', lazł: 'lazła', wlazł: 'wlazła' }; return femCase(w, irr[l] || l.replace(/ął$/, 'ęła').replace(/ł$/, 'ła')) };
const femCase = (src, out) => src[0] === src[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out;
function femin(t) {
  if (!t || !/łem|bym|jestem|byłam|będę/i.test(t)) return t;
  return String(t)
    // „ale bym cię jebał” · „chętnie bym go przeleciał” · „jebał bym” → damskie
    .replace(/(\p{L}*bym\b[^.!?\n]{0,30}?)(?<![\p{L}])([\p{L}]+?)(ął|ł)(?![\p{L}])/giu, (m, a, w, e) => FEM_NOUN_L.has((w + e).toLowerCase()) ? m : a + femPastL(w + e))
    .replace(/(?<![\p{L}])([\p{L}]+?)(ął|ł) bym\b/giu, (m, w, e) => FEM_NOUN_L.has((w + e).toLowerCase()) ? m : femPastL(w + e) + ' bym')
    .replace(/[\p{L}]+łem\b/gu, w => { const l = w.toLowerCase(); if (FEM_SKIP.has(l)) return w; if (FEM_IRR[l]) return femCase(w, FEM_IRR[l]); return femCase(w, l.replace(/ąłem$/, 'ęłam').replace(/łem$/, 'łam')) })
    .replace(/[\p{L}]+łbym\b/gu, w => femCase(w, w.toLowerCase().replace(/ąłbym$/, 'ęłabym').replace(/łbym$/, 'łabym')))
    .replace(new RegExp('\\b(jestem|byłam|będę|czuję się|nie jestem)( (?:taki|tak|bardzo|już|cały|całkiem|strasznie|trochę|kurwa,?))?\\s+(' + FEM_ADJ + ')(?![\\p{L}])', 'giu'), (m, a, b, adj) => { const l = adj.toLowerCase(); const f = l === 'sam' ? 'sama' : l === 'pewien' ? 'pewna' : l === 'rad' ? 'rada' : l === 'zły' ? 'zła' : l.endsWith('ły') ? l.slice(0, -1) + 'a' : l.replace(/y$/, 'a'); return a + (b ? b.replace(/taki/i, 'taka').replace(/cały/i, 'cała') : '') + ' ' + femCase(adj, f) });
}
function pickVariant(key, txt) {
  const lines = String(txt ?? textOf(key)).split('\n').map(x => x.trim()).filter(Boolean); if (!lines.length) return '';
  const sig = key + '|' + lines.length; let bag = bags[sig];
  if (!bag || !bag.length) { bag = bags[sig] = lines.map((_, i) => i).sort(() => Math.random() - .5); if (lines.length > 1 && bag[bag.length - 1] === lastPick[key]) bag.unshift(bag.pop()) }
  const i = bag.pop(); lastPick[key] = i; return femin(lines[i]);
}
let TEXTS = { ...DEFAULT_TEXTS };
try { const sv = JSON.parse(localStorage.getItem(TEXT_KEY) || '{}'); for (const [k, v] of Object.entries(sv)) if (v !== LEGACY_TEXTS[k] && v !== LEGACY_TEXTS2[k] && v !== LEGACY_TEXTS3[k] && v !== LEGACY_TEXTS4[k] && v !== LEGACY_TEXTS5[k]) TEXTS[k] = v } catch (e) { } // zmienione przez Ciebie zostają, nietknięte → nowe
let settings = { mode: 'full', voice: '', rate: 0.47, tempo: 0.95, pitch: 1.02, lektor: 'ewa', alarm: true, confirm: true, theme: 'hopper', themeChosen: false, texture: 'none', layout: 'classic', tabsBottom: false, ui: 'hud', music: true, musicVol: 0.6, askOnly: true, micSens: 'mid', bgm: true, clicks: true, introVoice: true, startForm: true, holdAdd: true, oneHand: false, lockStatus: true, headsetBtn: false, keepAwake: true, haptics: true, el: false, elKey: '', elVoice: 'qVCMNCiCMS3amhcNBMwc', elModel: 'eleven_multilingual_v2', elStab: 0.5, elSim: 0.75 };
const F = [/zosia/i, /zofia/i, /google/i, /paulina/i, /ewa/i, /agnieszka/i, /maja/i];
const M = [/krzysztof/i, /marek/i, /jacek/i, /adam/i, /jan/i];
// [id, nazwa, opis, płeć, preferowane głosy, tempo, wysokość]
const LEKTORS = [
  ['ewa', 'Ewa — miękka', 'Najprzyjemniejszy głos iPhone’a (Ewa / Premium), spokojnie i ciepło.', 'f', [/ewa/i, /premium/i, /enhanced|ulepsz/i, /google/i, /zofia/i, ...F], 0.48, 1],
  ['ewa_pogodna', 'Ewa — pogodna', 'Odrobinę żywiej, dalej łagodnie.', 'f', [/ewa/i, /premium/i, /enhanced|ulepsz/i, /google/i, ...F], 0.51, 1.02],
  ['google', 'Google — naturalna', 'Głos Google polski w zwykłym tempie.', 'f', [/google/i, /ewa/i, /zofia/i, ...F], 0.5, 1],
  ['asystentka', 'Asystentka — cicha', 'Wolniej i łagodnie, dobra przy hałasie w tle.', 'f', [/ewa/i, /paulina/i, /google/i, ...F], 0.46, 0.98],
  ['zosia', 'Zosia — klasyczna', 'Stary głos iPhone’a.', 'f', [/zosia/i, /zofia/i, ...F], 0.5, 1],
  ['krzysztof', 'Krzysztof — spokojny', 'Męski, spokojny i wyraźny.', 'm', [/krzysztof/i, /marek/i, ...M], 0.5, 1],
  ['krzysztof_radio', 'Krzysztof — radiowy', 'Jak prezenter: płynnie i czytelnie.', 'm', [/krzysztof/i, /marek/i, ...M], 0.52, 1],
  ['majster', 'Majster — niski', 'Niższy męski głos, bez pośpiechu.', 'm', [/marek/i, /krzysztof/i, ...M], 0.48, 0.97],
  ['dyspozytor', 'Dyspozytor — wyraźny', 'Szybciej i dobitnie, dobry na komendy.', 'm', [/krzysztof/i, /marek/i, ...M], 0.54, 1],
  ['lektor', 'Lektor filmowy', 'Niski, wolny, z powagą.', 'm', [/marek/i, /krzysztof/i, ...M], 0.47, 0.96],
];
let voiceList = []; // {id, name, quality}
const qScore = v => (v.quality === 'premium' ? 3 : v.quality === 'enhanced' ? 2 : 1) + (/natural|online/i.test(v.name) ? 2 : 0);
function lektorVoice(L) {
  for (const rx of L[4]) { const hit = voiceList.filter(v => rx.test(v.name)).sort((a, b) => qScore(b) - qScore(a))[0]; if (hit) return { voice: hit, exact: L[4].indexOf(rx) === 0 || (L[3] === 'm' ? M : F).some(r => r.test(hit.name)) } }
  return { voice: voiceList[0] || null, exact: false };
}
function resolvedVoiceId() { if (settings.voice) return settings.voice; const L = LEKTORS.find(x => x[0] === settings.lektor); return L ? (lektorVoice(L).voice?.id || '') : (voiceList.slice().sort((a, b) => qScore(b) - qScore(a))[0]?.id || '') }
try {
  const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
  if (s) Object.assign(settings, s);
  if (!settings.micSensV2) { if (!settings.micSens || settings.micSens === 'low') settings.micSens = 'mid'; settings.micSensV2 = true } // 4.9: czulszy mikrofon domyślnie (komendy nie giną)
  else settings.mode = localStorage.getItem('beton_notify_mode') || (localStorage.getItem('beton_tts_enabled') === '0' ? 'short' : 'full');
} catch (e) { }
/* jednorazowo: naturalniejszy lektor — bez skrajnej wysokości i tempa, które „rozjeżdżały” głos */
if (!settings.lektorFixV1) { const L0 = LEKTORS.find(x => x[0] === settings.lektor) || LEKTORS[0]; settings.rate = L0[5]; settings.pitch = L0[6]; settings.tempo = .95; settings.lektorFixV1 = true; try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch (e) { } }
/* jednorazowo: lektor mówi wszystkie komunikaty i jest głośny */
if (!settings.voiceV3) { settings.askOnly = false; settings.loudVoice = true; settings.voiceV3 = true; try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch (e) { } }
/* jednorazowo: zamiast Zosi przyjemniejszy głos (Ewa / Premium), ElevenLabs włącza się sam po wklejeniu klucza */
if (!settings.voiceV2) { if (/^zosia/.test(settings.lektor || 'zosia')) { settings.lektor = 'ewa'; settings.voice = ''; settings.rate = .48; settings.pitch = 1 } if (settings.elKey) settings.el = true; settings.voiceV2 = true; try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch (e) { } }
/* jednorazowo: styl Panel HUD + kolory Hopper (cyjan) */
if (!settings.hopperV1) { settings.ui = 'hud'; settings.theme = 'hopper'; settings.hopperV1 = true; try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch (e) { } }
const LAYOUTS = [['classic', 'Klasyczny', 4], ['tiles', 'Kafelki 2×2', 5], ['compact', 'Kompaktowy', 5], ['big', 'Wielkie przyciski', 3]];
const TEXTURES = [['none', 'Gładkie'], ['beton', 'Beton'], ['stal', 'Stal szczotkowana'], ['blacha', 'Blacha ryflowana'], ['carbon', 'Carbon'], ['siatka', 'Siatka zbrojeniowa']];
const THEMES = [['hopper', 'Hopper (cyjan)', '#22D3EE', '#0E7490'], ['green', 'Zieleń', '#2FD271', '#056C7F'], ['violet', 'Błękit i fiolet', '#8BD1E0', '#9B4CD3'], ['orange', 'Pomarańcz budowlany', '#FFB627', '#E4572E'], ['yellow', 'Kask i niebo', '#FFE45E', '#2E86AB'], ['red', 'Czerwień', '#FF6B6B', '#7A1F5C'], ['ice', 'Lód', '#A8E6FF', '#3D5AFE'], ['steel', 'Stal', '#C9D6DF', '#52616B'], ['lime', 'Limonka', '#C6F432', '#1B998B']];
const themeColors = () => { if (settings.theme === 'custom') return [settings.c1 || '#2FD271', settings.c2 || '#056C7F']; const t = THEMES.find(x => x[0] === settings.theme) || THEMES[0]; return [t[2], t[3]] };
const hexRgb = h => { h = String(h).replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255) };
const relLum = c => { const l = hexRgb(c).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2] };
function rgb2hsl(r, g, b) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s, l] }
function hsl2rgb(h, s, l) { h = ((h % 360) + 360) % 360 / 360; if (!s) return [l, l, l]; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p }; return [f(h + 1 / 3), f(h), f(h - 1 / 3)] }
const hueLerp = (a, b, t) => { let d = ((b - a + 540) % 360) - 180; return a + d * t };
let diagramCache = {};
let diagramDirty = true;
function recolorDiagram(force) {
  const img = document.querySelector('.drum-diagram-img'); if (!img) return;
  if (!force && $('drum')?.classList.contains('hide')) { diagramDirty = true; return } // przeliczanie obrazka (ciężkie) tylko gdy widać diagram — nie tnie intra
  diagramDirty = false;
  if (!img.dataset.orig) img.dataset.orig = img.getAttribute('src');
  if (settings.theme === 'violet') { img.src = img.dataset.orig; return }
  const [c1, c2] = themeColors(), key = c1 + c2; if (diagramCache[key]) { img.src = diagramCache[key]; return }
  const src = new Image();
  src.onload = () => {
    try {
      const cv = document.createElement('canvas'); cv.width = src.naturalWidth; cv.height = src.naturalHeight; const g = cv.getContext('2d'); g.drawImage(src, 0, 0);
      const im = g.getImageData(0, 0, cv.width, cv.height), d = im.data;
      const O1 = rgb2hsl(...hexRgb('#8BD1E0')), O2 = rgb2hsl(...hexRgb('#9B4CD3')), N1 = rgb2hsl(...hexRgb(c1)), N2 = rgb2hsl(...hexRgb(c2));
      const memo = new Map(); // ten sam kolor = ten sam wynik (obrazek ma mało różnych kolorów) — kilka razy szybciej
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2], m = memo.get(k);
        if (m !== undefined) { if (m >= 0) { d[i] = m >> 16; d[i + 1] = (m >> 8) & 255; d[i + 2] = m & 255 } continue }
        const [h, sa, l] = rgb2hsl(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255); if (sa < .04) { memo.set(k, -1); continue }
        const t = Math.min(1, Math.max(0, (((h - O1[0] + 540) % 360) - 180) / (O2[0] - O1[0])));
        const so = O1[1] + (O2[1] - O1[1]) * t, sn = N1[1] + (N2[1] - N1[1]) * t, lo = O1[2] + (O2[2] - O1[2]) * t, ln = N1[2] + (N2[2] - N1[2]) * t;
        const [r, gg, b] = hsl2rgb(hueLerp(N1[0], N2[0], t), Math.min(1, sa * sn / Math.max(.05, so)), Math.min(1, Math.max(0, l + (ln - lo) * .5 * Math.min(1, sa * 2))));
        const R = Math.round(r * 255), G = Math.round(gg * 255), B = Math.round(b * 255); memo.set(k, (R << 16) | (G << 8) | B);
        d[i] = R; d[i + 1] = G; d[i + 2] = B;
      }
      g.putImageData(im, 0, 0); diagramCache[key] = cv.toDataURL('image/png');
      if (themeColors().join('') === key && settings.theme !== 'violet') img.src = diagramCache[key];
    } catch (e) { console.warn('diagram', e) }
  };
  src.src = img.dataset.orig;
}
const UI_STYLES = [['3d', 'Klasyczny 3D'], ['hud', 'Panel HUD'], ['glass', 'Szkło'], ['machine', 'Ciężki sprzęt'], ['neo', 'Neumorfizm jasny'], ['tactical', 'Taktyczny'], ['terminal', 'Terminal']];
function applyTheme() {
  const [c1, c2] = themeColors(), st = document.body.style;
  st.setProperty('--c1', c1); st.setProperty('--c2', c2); st.setProperty('--ink', (relLum(c1) + relLum(c2)) / 2 > .18 ? '#06121a' : '#ffffff');
  document.body.classList.toggle('themed', settings.theme !== 'violet');
  for (const [t] of TEXTURES) document.body.classList.toggle('tx-' + t, settings.texture === t);
  for (const [l] of LAYOUTS) document.body.classList.toggle('lay-' + l, l !== 'classic' && settings.layout === l);
  document.body.classList.toggle('tabs-bottom', !!settings.tabsBottom);
  for (const [u] of UI_STYLES) document.body.classList.toggle('ui-' + u, u !== '3d' && settings.ui === u);
  if (session && currentTab === 'work') render();
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', '#05090c');
  recolorDiagram();
}
const saveSettings = () => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch (e) { } configureNative() };
const saveTexts = () => { try { localStorage.setItem(TEXT_KEY, JSON.stringify(TEXTS)) } catch (e) { } configureNative() };
let clipKeys = new Set(), recordingKey = '';

function configureNative() {
  window.__bkpRemind = { gap: remindGap(), cycles: remindCfg().max + 1, burst: remindCfg().burst };
  if (!nativeVoice) return;
  NV.configure({ loudVoice: settings.loudVoice !== false, boostVolume: settings.boostVolume !== false, targetVolume: Number(settings.voiceVol ?? 1), texts: Object.fromEntries(Object.keys(TEXTS).map(k => [k, femin(textOf(k))])), elKey: elReady() ? settings.elKey : '', elVoice: settings.elVoice || '', elModel: settings.elModel || '', voiceId: resolvedVoiceId(), rate: Math.min(.6, Math.max(.44, (Number(settings.rate) || 0.5) * tempoK())), pitch: Math.min(1.06, Math.max(.94, Number(settings.pitch) || 1)), useClips: true, voiceOn: settings.mode === 'full', elOn: elReady(), elTag: elTag(), elSpeed: elSpeed(), elStab: Number(settings.elStab ?? .5), elSim: Number(settings.elSim ?? .75), askOnly: settings.askOnly !== false, micGate: { vlow: -21, low: -27, mid: -35, high: -48 }[settings.micSens || 'mid'] ?? -35, offlineSpeech: !!settings.offlineSpeech, lockCard: settings.lockCard !== false, headsetButtons: !!settings.headsetBtn, remindSec: remindGap() / 1000, remindMax: remindCfg().max, lockStatus: settings.lockStatus !== false, keepAwake: settings.keepAwake !== false }).catch(() => { });
}

// ───────────────────────── mowa ─────────────────────────
const polishVoices = () => 'speechSynthesis' in window ? speechSynthesis.getVoices().filter(v => /^pl(?:-|$)/i.test(v.lang)) : [];
// ── Lektor ElevenLabs: teksty pobrane raz z internetu, potem grane bez netu ──
const tempoK = () => Math.min(1.15, Math.max(.8, Number(settings.tempo) || .95));
const elSpeed = () => Math.min(1.2, Math.max(.7, Math.round((Number(settings.elSpd) || tempoK()) * 100) / 100)); // ElevenLabs: 0,7–1,2
const elTag = () => [settings.elVoice, settings.elModel, settings.elStab, settings.elSim, elSpeed()].join('|');
const elReady = () => !!(settings.el && settings.elVoice && settings.elKey);
function elName(text) { let h = 0x811c9dc5; for (const b of new TextEncoder().encode(elTag() + '|' + String(text).trim())) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0 } return h.toString(16).padStart(8, '0') }
let elNames = new Set(), elDbP = null, elAudio = null;
const elDb = () => elDbP ||= new Promise((ok, no) => { try { const r = indexedDB.open('bkp_voice', 1); r.onupgradeneeded = () => r.result.createObjectStore('clips'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error) } catch (e) { no(e) } });
const idb = async (mode, fn) => { const db = await elDb(); return new Promise((ok, no) => { const tx = db.transaction('clips', mode), st = tx.objectStore('clips'), r = fn(st); tx.oncomplete = () => ok(r?.result); tx.onerror = () => no(tx.error) }) };
async function elLoadNames() { try { elNames = new Set(nativeVoice ? await NV.listVoice() : await idb('readonly', st => st.getAllKeys())) } catch (e) { elNames = new Set() } }
async function elFetch(text) {
  const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(settings.elVoice.trim()) + '?output_format=mp3_44100_128', { method: 'POST', headers: { 'xi-api-key': settings.elKey.trim(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify({ text: String(text).trim(), model_id: settings.elModel || 'eleven_multilingual_v2', ...(/(turbo|flash)_v2_5/.test(settings.elModel || '') ? { language_code: 'pl' } : {}), voice_settings: { stability: Number(settings.elStab), similarity_boost: Number(settings.elSim), speed: elSpeed() } }) });
  if (!r.ok) { let msg = 'błąd ' + r.status; try { const j = await r.json(); msg = j.detail?.message || j.detail?.status || msg } catch (e) { } throw new Error(msg) }
  return await r.blob();
}
const blobB64 = b => new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1]); fr.onerror = no; fr.readAsDataURL(b) });
/* iPhone: pobiera i zapisuje natywnie (bez CORS); przeglądarka: fetch + IndexedDB */
async function elFetchStore(text) {
  const n = elName(text);
  if (nativeVoice && NV.elFetch) { await NV.elFetch({ key: settings.elKey.trim(), voice: settings.elVoice.trim(), model: settings.elModel || 'eleven_multilingual_v2', text: String(text).trim(), name: n, stab: Number(settings.elStab), sim: Number(settings.elSim), speed: elSpeed() }); elNames.add(n); return true }
  const b = await elFetch(text); await elStore(text, b); return b;
}
async function elStore(text, blob) { const n = elName(text); if (nativeVoice) await NV.saveVoice(n, await blobB64(blob)); else await idb('readwrite', st => st.put(blob, n)); elNames.add(n) }
async function elGet(text) { const n = elName(text); if (!elNames.has(n)) { if (!navigator.onLine) return null; const b = await elFetchStore(text); return nativeVoice ? true : b } return nativeVoice ? true : await idb('readonly', st => st.get(n)) }
function ttsSpeak(key, text) {
  text = femin(text);
  if (nativeVoice) { NV.speak(key || '', text || '').catch(() => { }); return }
  if (!text || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'pl-PL'; u.rate = Math.min(1.2, Math.max(.88, (Number(settings.rate) || .5) * 2 * tempoK())); u.pitch = Math.min(1.06, Math.max(.94, Number(settings.pitch) || 1));
    const pv = polishVoices(); const id = resolvedVoiceId(); const v = pv.find(v => v.voiceURI === id) || pv.find(v => /google/i.test(v.name)) || pv[0]; if (v) u.voice = v; speechSynthesis.speak(u);
  } catch (e) { }
}
/** kiedy lektorka mniej więcej skończy mówić (szacunek) — żeby kolejne pytania nie wchodziły jej w słowo */
let speechEndAt = 0;
const speechEst = t => (String(t || '').length * 0.075 / tempoK() + 0.6 + (elReady() ? 1.2 : 0)) * 1000;
/** odpal fn, dopiero gdy lektorka skończy + przerwa (min. po `min` ms) */
function whenQuiet(fn, gap = 2200, min = 0) {
  const t0 = Date.now(), go = () => { if (Date.now() - t0 >= min && Date.now() >= speechEndAt + gap) fn(); else setTimeout(go, 300) }; setTimeout(go, Math.min(min, 300));
}
function speak(key, text) {
  text = femin(text); if (text) speechEndAt = Math.max(Date.now(), speechEndAt) + speechEst(text);
  if (!elReady() || !text || (key && clipKeys.has(key))) return ttsSpeak(key, text);
  // na budowie zasięg bywa słaby: jak ElevenLabs nie odda głosu w 2,5 s, mówi zwykły głos (plik i tak się dociągnie na następny raz)
  let done = false; const fb = () => { if (done) return; done = true; if (ASK_KEYS.has(key)) jlog('ElevenLabs nie zdążył (zasięg?) — gada zwykły głos', true); ttsSpeak(key, text) }, to = setTimeout(fb, ASK_KEYS.has(key) || key === 'remind' ? 2500 : 4000);
  elGet(text).then(res => {
    clearTimeout(to); if (done) return; done = true;
    if (!res) return ttsSpeak(key, text);
    if (nativeVoice) return ttsSpeak(key, text); // iPhone sam zagra zapisany plik
    try { elAudio?.pause(); elAudio = new Audio(URL.createObjectURL(res)); elAudio.play().catch(() => ttsSpeak(key, text)) } catch (e) { ttsSpeak(key, text) }
  }).catch(() => { clearTimeout(to); fb() });
}
/** dwa zdania z wyraźną przerwą (np. „Też chciałabym być tak zalana.” … „Zostało 4,5.”) — żeby się nie zlewały */
function speakPair(k1, t1, k2, t2, gap = 1.1) {
  t1 = femin(String(t1 || '').trim()); t2 = femin(String(t2 || '').trim());
  speechEndAt = Date.now() + speechEst(t1) + gap * 1000 + speechEst(t2);
  if (nativeVoice) { NV.speak(k1, t1, true).catch(() => { }); NV.speak('pause', String(gap), false).catch(() => { }); NV.speak(k2, t2, false).catch(() => { }); return }
  speak(k1, t1); clearTimeout(speakPair.t);
  speakPair.t = setTimeout(() => speak(k2, t2), Math.round((Math.max(1.2, t1.length * 0.075 / tempoK()) + gap) * 1000)); // przeglądarka: szacunek długości zdania + przerwa
}
/** po starcie: dociąga z ElevenLabs wszystkie warianty pytania o kosz, żeby potem leciały od ręki nawet bez zasięgu */
async function elWarmAsk() {
  if (!elReady() || elWarmAsk.busy) return; elWarmAsk.busy = true;
  try { for (const k of [methodKey('ask'), methodKey('remind')]) for (const line of textOf(k).split('\n').map(x => femin(x.trim())).filter(Boolean)) { if (!session || !navigator.onLine) return; if (elNames.has(elName(line))) continue; try { await elFetchStore(line) } catch (e) { return } await new Promise(r => setTimeout(r, 400)) } }
  finally { elWarmAsk.busy = false }
}
const methodKey = key => { const m = session?.method || method, sfx = m === 'taczka' ? '_taczka' : m === 'inne' ? '_koparka' : ''; return sfx && String(TEXTS[key + sfx] || '').trim() ? key + sfx : key };
const ASK_KEYS = new Set(['hello', 'howAreYou', 'joke', 'thanks', 'love', 'best', 'name', 'tired', 'coffee', 'bored', 'insult', 'slowTrip', 'fastTrip', 'idle', 'ask', 'remind', 'ask_koparka', 'remind_koparka', 'heardOk', 'added', 'added_taczka', 'added_koparka', 'hearYou', 'muted', 'unmuted', 'ofeo']);
let lastBotAt = 0;
const JLOG = (() => { try { return JSON.parse(localStorage.getItem('bkp_jlog') || '[]') } catch (e) { return [] } })();
let nightOn = false;
function sayBot(key, text) {
  if (text == null) key = methodKey(key);
  if (settings.askOnly !== false && !ASK_KEYS.has(key) && key !== 'micOn') { const shown = pickVariant(key, text) || SHORT[key] || ''; if (shown) $('botText').textContent = shown; return } // mówi tylko „czy kosz jest?”
  const full = pickVariant(key, text), short = SHORT[key] || full;
  const shown = settings.mode === 'full' ? (full || short) : short;
  if (shown) $('botText').textContent = shown;
  if (settings.mode === 'full') { if (full || clipKeys.has(key)) { lastBotAt = Date.now(); speak(key, full) } }
  else beep();
}
function beep() { try { const ctx = getAC() || new (window.AudioContext || window.webkitAudioContext)(); const t = ctx.currentTime, vol = .55 * Number(settings.voiceVol ?? 1); for (const [f, d] of [[880, 0], [1175, .16]]) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(vol, t + d + .01); g.gain.exponentialRampToValueAtTime(.001, t + d + .15); o.connect(g); g.connect(ctx.destination); o.start(t + d); o.stop(t + d + .16) } } catch (err) { } } // głośny dwutonowy sygnał
/* ── muzyczka (własna, generowana na żywo — bez plików i praw autorskich) ── */
let audioCtx = null;
const getAC = () => { try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; if (!audioCtx || audioCtx.state === 'closed') audioCtx = new AC(); if (audioCtx.state === 'suspended') audioCtx.resume(); return audioCtx } catch (e) { return null } };
const midiHz = m => 440 * 2 ** ((m - 69) / 12);
function playJingle(kind = 'start') {
  if (!settings.music) return 0; const ctx = getAC(); if (!ctx || ctx.state !== 'running') return 0;
  const t0 = ctx.currentTime + .05, vol = .22 * Number(settings.musicVol ?? .6);
  const out = ctx.createGain(); out.gain.value = vol; const comp = ctx.createDynamicsCompressor(); out.connect(comp); comp.connect(ctx.destination);
  const echo = ctx.createDelay(); echo.delayTime.value = .19; const fb = ctx.createGain(); fb.gain.value = .28; const wet = ctx.createGain(); wet.gain.value = .35; echo.connect(fb); fb.connect(echo); echo.connect(wet); wet.connect(out);
  const pluck = (m, at, len = .35, g = .5, type = 'triangle') => { const o = ctx.createOscillator(), e = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = type; o.frequency.value = midiHz(m); f.type = 'lowpass'; f.frequency.setValueAtTime(4200, at); f.frequency.exponentialRampToValueAtTime(900, at + len); e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(g, at + .012); e.gain.exponentialRampToValueAtTime(.001, at + len); o.connect(f); f.connect(e); e.connect(out); e.connect(echo); o.start(at); o.stop(at + len + .05) };
  const pad = (ms, at, len, g = .08) => ms.forEach(m => { const o = ctx.createOscillator(), e = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = midiHz(m); o.detune.value = (Math.random() - .5) * 14; f.type = 'lowpass'; f.frequency.value = 1100; e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(g, at + .25); e.gain.setValueAtTime(g, at + len - .35); e.gain.linearRampToValueAtTime(0, at + len); o.connect(f); f.connect(e); e.connect(out); o.start(at); o.stop(at + len + .05) });
  const kick = at => { const o = ctx.createOscillator(), e = ctx.createGain(); o.frequency.setValueAtTime(130, at); o.frequency.exponentialRampToValueAtTime(45, at + .16); e.gain.setValueAtTime(.7, at); e.gain.exponentialRampToValueAtTime(.001, at + .2); o.connect(e); e.connect(out); o.start(at); o.stop(at + .22) };
  const b = .2; // ósemka
  if (kind === 'finish') {
    [[72, 0], [71, 1], [67, 2], [64, 3], [65, 4], [67, 5], [72, 7]].forEach(([m, k]) => pluck(m, t0 + k * b, k === 7 ? 1.4 : .4, .45));
    pad([48, 55, 60, 64], t0, 1.0, .06); pad([53, 57, 60, 65], t0 + 1.0, .45, .06); pad([48, 55, 64, 67], t0 + 1.4, 1.5, .07); kick(t0); kick(t0 + 1.4);
    return 2900;
  }
  // start: energiczny motyw C – F – G – C
  const mel = [[60, 0], [64, 1], [67, 2], [72, 3], [69, 4], [72, 5], [74, 6], [76, 8], [79, 9], [84, 10]];
  mel.forEach(([m, k]) => pluck(m, t0 + k * b, k === 10 ? 1.3 : .32, k === 10 ? .55 : .42));
  pad([48, 55, 64], t0, .8, .06); pad([53, 60, 65], t0 + .8, .4, .06); pad([55, 62, 67], t0 + 1.2, .4, .06); pad([48, 55, 64, 72], t0 + 1.6, 1.6, .07);
  [0, 4, 8, 10].forEach(k => kick(t0 + k * b));
  return 2000;
}
/* muzyka „Solid Ground” (od Domiego): intro, start i koniec betonowania */
const SONG_LEN = { intro: 8000, start: 3600, finish: 2600 };
let songEl = null;
function playSong(kind) {
  if (!settings.music) return Promise.resolve(false);
  try { songEl?.pause(); songEl = new Audio('sounds/' + kind + '.mp3'); songEl.onended = () => setTimeout(bgmUpdate, 300); if (bgm && !bgm.paused) bgmFade(0, () => bgm.pause()); songEl.volume = Math.min(1, Math.max(.05, Number(settings.musicVol ?? .6))); return songEl.play().then(() => { bgmUpdate(); return true }, () => false) } catch (e) { return Promise.resolve(false) }
}
function playBoom() {
  if (!settings.music) return; const ctx = getAC(); if (!ctx || ctx.state !== 'running') return; const t = ctx.currentTime + .02, vol = Math.min(1, .9 * Number(settings.musicVol ?? .6) + .25);
  const out = ctx.createDynamicsCompressor(); out.threshold.value = -10; out.ratio.value = 4; out.connect(ctx.destination);
  const noise = (dur, pow) => { const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** pow } const n = ctx.createBufferSource(); n.buffer = buf; return n };
  // trzask metalu (krótki, jasny)
  const c1 = noise(.25, 3), hp = ctx.createBiquadFilter(), g1 = ctx.createGain(); hp.type = 'highpass'; hp.frequency.value = 1800; g1.gain.value = vol * .7; c1.connect(hp); hp.connect(g1); g1.connect(out); c1.start(t);
  // wybuch (długi, zamykający się filtr)
  const c2 = noise(1.6, 2.2), lp = ctx.createBiquadFilter(), g2 = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(5000, t); lp.frequency.exponentialRampToValueAtTime(120, t + 1.4); g2.gain.value = vol * 1.1; c2.connect(lp); lp.connect(g2); g2.connect(out); c2.start(t);
  // uderzenie basu + sub
  for (const [f0, f1, dur, k] of [[120, 32, .9, 1.1], [60, 24, 1.4, .9]]) { const o = ctx.createOscillator(), e = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * .8); e.gain.setValueAtTime(vol * k, t); e.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(e); e.connect(out); o.start(t); o.stop(t + dur + .05) }
  // echo dudnienia
  const c3 = noise(.9, 2), lp3 = ctx.createBiquadFilter(), g3 = ctx.createGain(); lp3.type = 'lowpass'; lp3.frequency.value = 400; g3.gain.value = vol * .45; c3.connect(lp3); lp3.connect(g3); g3.connect(out); c3.start(t + .32);
}
/* iPhone pozwala grać dopiero po pierwszym dotknięciu — wtedy dogrywamy powitanie */
let introJinglePending = false, voicePending = false, soundUnlockedAt = 0;
/* „Betonowy głos” — głos w intro (przycisza muzykę, gdy mówi) */
let nativeIntro = false;
function stopIntroVoice() { if (nativeIntro) { nativeIntro = false; NV.stopIntro?.() } const v = voiceEl; voiceEl = null; voicePending = false; if (!v) return; const iv = setInterval(() => { v.volume = Math.max(0, v.volume - .1); if (v.volume <= .01) { clearInterval(iv); v.pause() } }, 40) }
/* piosenki intro — losowo co start (bez powtórki z rzędu). delay = o ile później rusza animacja (żeby uderzenie i „Witaj” wpadły w śpiew) */
const INTRO_SONGS = [
  { id: 'country', file: 'intro_voice', name: 'Country — oryginał', delay: 0 },
  { id: 'bk1', file: 'intro_bk1', name: 'Betonkibel 1', delay: 4 },
  { id: 'bk2', file: 'intro_bk2', name: 'Betonkibel 2', delay: 2.8 },
  { id: 'bk3', file: 'intro_bk3', name: 'KibelBetonPlus', delay: 2 },
];
let introSong = INTRO_SONGS[0];
const songDelay = sg => Number(settings.songShift?.[sg.id] ?? sg.delay) || 0;
function pickIntroSong() {
  const want = settings.introSong || 'random'; let sg = INTRO_SONGS.find(x => x.id === want);
  if (!sg) { let last = ''; try { last = localStorage.getItem('bkp_last_song') || '' } catch (e) { } const pool = INTRO_SONGS.filter(x => x.id !== last); sg = pool[Math.floor(Math.random() * pool.length)] }
  try { localStorage.setItem('bkp_last_song', sg.id) } catch (e) { } return (introSong = sg);
}
function playIntroVoice() {
  try { voiceEl?.pause(); voiceEl = new Audio('sounds/' + introSong.file + '.mp3'); voiceEl.volume = 1;
    voiceEl.onplay = () => bgmUpdate(); voiceEl.addEventListener('playing', () => { const late = window.__introT0 && introPlaying ? (Date.now() - window.__introT0) / 1000 + songDelay(introSong) : 0; if (window.__introStart) { const st = window.__introStart; setTimeout(st, songDelay(introSong) * 1000) } if (late > .3) try { voiceEl.currentTime = late } catch (e) { } }, { once: true }); voiceEl.onended = () => { voiceEl = null; bgmUpdate() };
    voiceEl.play().catch(() => { voicePending = true }) } catch (e) { }
}
/* muzyka w tle „Czas na Beton” — intro + zakładki Start, Budowy, Diagram (nie na Liczniku, żeby nie przeszkadzać mikrofonowi) */
const BGM_TABS = { has: t => t !== 'work' };
let bgm = null, bgmTimer = 0, introPlaying = !!document.getElementById('intro');
let voiceEl = null; const voiceBusy = () => !!(voiceEl && !voiceEl.paused && !voiceEl.ended);
const bgmTarget = () => Math.min(1, Math.max(.05, Number(settings.musicVol ?? .6))) * (voiceBusy() ? .22 : .5);
const songBusy = () => !!(songEl && !songEl.paused && !songEl.ended);
const BGM_ENABLED = false; // muzyka tylko w intro (decyzja Domiego)
const bgmWanted = () => BGM_ENABLED && !songBusy() && !voiceBusy() && !introPlaying && settings.music && settings.bgm !== false && !document.hidden && ((TAB_OF[currentTab] !== 'work' && currentTab !== 'work' && !(typeof micWanted !== 'undefined' && micWanted)));
function bgmFade(to, done) {
  clearInterval(bgmTimer); if (!bgm) return done?.();
  bgmTimer = setInterval(() => { const v = bgm.volume, d = to - v, st = Math.sign(d) * Math.min(Math.abs(d), .04); bgm.volume = Math.min(1, Math.max(0, v + st)); if (Math.abs(to - bgm.volume) < .005) { clearInterval(bgmTimer); bgm.volume = to; done?.() } }, 40);
}
function bgmUpdate() {
  try {
    if (bgmWanted()) {
      if (!bgm) { if (!bgmPool.length) bgmPool = [new Audio('sounds/bgm.mp3'), new Audio('sounds/bgm.mp3')]; bgm = bgmPool[0]; bgm.volume = 0; bgmWatch() }
      if (!bgmXfading) for (const o of bgmPool) if (o !== bgm && !o.paused) o.pause();
      bgm.muted = false; if (bgm.paused) bgm.play().then(() => bgmFade(bgmTarget()), () => { introJinglePending = true; announce('🔈 Dotknij ekranu, żeby włączyć muzykę') });
      else bgmFade(bgmTarget());
    } else if (bgm && !bgm.paused) bgmFade(0, () => bgm.pause());
  } catch (e) { }
}
/* płynne przejście koniec → początek: 2,5 s przenikania dwóch kopii utworu */
const BGM_XF = 2.5; let bgmXfading = false;
function bgmWatch() {
  setInterval(() => {
    if (!bgm || bgm.paused || bgmXfading || !(bgm.duration > BGM_XF * 3) || bgm.currentTime < bgm.duration - BGM_XF) return;
    bgmXfading = true; const old = bgm, nxt = bgmPool.find(a => a !== old) || new Audio('sounds/bgm.mp3'); nxt.currentTime = 0; nxt.muted = false; nxt.volume = 0; const to = bgmWanted() ? bgmTarget() : 0, t0 = performance.now(), v0 = old.volume;
    nxt.play().catch(() => { }); bgm = nxt; clearInterval(bgmTimer);
    const iv = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / (BGM_XF * 1000)); nxt.volume = to * Math.sin(k * Math.PI / 2); old.volume = v0 * Math.cos(k * Math.PI / 2); if (k >= 1) { clearInterval(iv); old.pause(); bgmXfading = false; bgmUpdate() } }, 40);
  }, 200);
}
document.addEventListener('visibilitychange', bgmUpdate); window.BKP_bgmState = () => (bgm ? (bgm.paused ? 'paused' : 'playing ' + bgm.volume.toFixed(2) + ' @' + bgm.currentTime.toFixed(1)) : 'none') + ' | glos: ' + (voiceBusy() ? 'gra' : 'cisza'); window.BKP_bgmSeek = t => { if (bgm) bgm.currentTime = t };
/* odgłos klikania przycisków (krótki, miękki „tik”) */
function clickSound(kind = 'tap') {
  if (settings.clicks === false) return; const ctx = getAC(); if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  o.type = 'triangle'; o.frequency.setValueAtTime(kind === 'on' ? 1250 : 820, t); o.frequency.exponentialRampToValueAtTime(kind === 'on' ? 1700 : 520, t + .05);
  f.type = 'highpass'; f.frequency.value = 300; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09 * Math.max(.3, Number(settings.musicVol ?? .6)) / .6, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .07);
  o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .08);
}
document.addEventListener('click', e => { const b = e.target.closest('button, .tile, label.pc-add, label.pc-acts-add, .big-btn, summary, select, input[type=checkbox]'); if (!b || b.id === 'bucket' || b.closest('#intro')) return; clickSound(b.classList.contains('on') || b.classList.contains('primary') ? 'on' : 'tap') }, true);
/* odblokowanie dźwięku: każde dotknięcie (aż się uda) „budzi” oba odtwarzacze muzyki — iPhone/Safari wymaga gestu */
let bgmPrimed = false, bgmPool = [];
function bgmPrime() {
  if (bgmPrimed || !BGM_ENABLED) return; try {
    if (!bgmPool.length) bgmPool = [new Audio('sounds/bgm.mp3'), new Audio('sounds/bgm.mp3')];
    for (const a of bgmPool) { if (a === bgm && !a.paused) continue; a.volume = 0; a.muted = true; const pr = a.play(); if (pr) pr.then(() => { if (a !== bgm || !bgmWanted() || a.volume === 0) { if (a !== bgm || !bgmWanted()) a.pause() } a.muted = false; bgmPrimed = true; if (a === bgm && bgmWanted()) bgmFade(bgmTarget()) }, () => { a.muted = false }) }
  } catch (e) { }
}
document.addEventListener('pointerdown', () => { getAC(); bgmPrime(); if (voicePending) { voicePending = false; soundUnlockedAt = Date.now(); if (TAB_OF[currentTab] !== 'work') playIntroVoice() } if (introJinglePending) { introJinglePending = false; setTimeout(bgmUpdate, 50) } }, { capture: true });
function announce(txt) { const t = $('toast'); t.textContent = txt; t.style.display = 'block'; clearTimeout(announce.timeout); announce.timeout = setTimeout(() => t.style.display = 'none', 2300) }

// ───────────────────────── pomocnicze ─────────────────────────
const NF2 = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }), fmtC = new Map();
const fmt = n => { const v = Math.round(Number(n) * 100) / 100; let r = fmtC.get(v); if (r === undefined) { r = NF2.format(v); if (fmtC.size > 3000) fmtC.clear(); fmtC.set(v, r) } return r }; // szybciej: bez tworzenia formatera co wywołanie
const number = x => Number(String(x ?? '').replace(',', '.').trim());
const dur = n => { n = Math.max(0, Math.floor(Number(n) || 0)); return String(Math.floor(n / 3600)).padStart(2, '0') + ':' + String(Math.floor(n % 3600 / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0') };
const shortDur = n => { n = Math.max(0, Math.floor(Number(n) || 0)); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0') };
const escapeHTML = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const el = (tag, props = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== null && v !== undefined) e.setAttribute(k, v) } e.append(...kids); return e };

// ───────────────────────── kosze ─────────────────────────
let kibelN = 0;
const kindIcon = k => { if (k !== 'taczka' && k !== 'lyzka') return kibelIcon(); const w = document.createElement('span'); w.className = 'tile-ico'; w.append(k === 'taczka' ? tIco('bud') : lIco('0')); return w };
const kibelIcon = () => { const w = document.createElement('span'); w.className = 'tile-ico'; const id = 'kbx' + (++kibelN); w.innerHTML = '<svg class="kibel-ico" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" x2="1"><stop style="stop-color:color-mix(in srgb,var(--c2) 70%,#000)"/><stop offset=".35" style="stop-color:var(--c2)"/><stop offset=".7" style="stop-color:var(--c1)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--c2) 70%,#000)"/></linearGradient></defs><path d="M20 15L25 4M44 15L39 4" stroke="#8a929e" stroke-width="3.5" stroke-linecap="round"/><path d="M24 5Q32 0 40 5" fill="none" stroke="#aab1bb" stroke-width="3.5"/><path d="M9 16Q32 12 55 16L50 43Q49 47 44 48L38 55H26L20 48Q15 47 14 43Z" fill="url(#' + id + ')" stroke="#1a1d22" stroke-width="2.5" stroke-linejoin="round"/><path d="M7 16.5Q32 11 57 16.5" stroke="#3a3f48" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M24 48L26 55H38L40 48" fill="#6b727d" stroke="#1a1d22" stroke-width="2"/><path d="M19 22L45 22L41 39L23 39Z" fill="#0f0c26" opacity=".25"/></svg>'; return w };
const PROFILE_KEY = 'beton_bucket_profiles_18', SITE_BUCKET_KEY = 'beton_site_bucket_assignments_24';
let profiles = [];
try { const st = JSON.parse(localStorage.getItem(PROFILE_KEY) || '[]'); if (Array.isArray(st)) profiles = st.map(migrateProfile) } catch (e) { }
let siteAssignments = {}; try { siteAssignments = JSON.parse(localStorage.getItem(SITE_BUCKET_KEY) || '{}') || {} } catch (e) { }
const getProfile = id => profiles.find(p => p.id === id) || null;
const siteKey = t => String(t || '').trim().toLocaleLowerCase('pl-PL').replace(/\s+/g, ' ');
const saveProfiles = () => { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)); return true } catch (e) { announce('Brak miejsca w pamięci — usuń zdjęcia ze starszego kosza'); return false } };
const storeSiteAssignments = () => { try { localStorage.setItem(SITE_BUCKET_KEY, JSON.stringify(siteAssignments)) } catch (e) { } };
function rememberSiteBucket(name, id) { const k = siteKey(name); if (!k) return; siteAssignments[k] = id || 'manual'; storeSiteAssignments() }
const snapshot = p => p ? { id: p.id, name: p.name, shape: p.shape, dims: p.dims, capacity: p.capacity } : null;
const KINDS = { kosz: ['🏗', 'Kosz', 'kibel'], taczka: ['🛒', 'Taczka', 'taczka'], lyzka: ['🚜', 'Łyżka koparki', 'inne'] };
const kindOf = p => p?.kind && KINDS[p.kind] ? p.kind : 'kosz';
const methodKind = m => m === 'taczka' ? 'taczka' : m === 'inne' ? 'lyzka' : 'kosz';
const profilesFor = m => profiles.filter(p => kindOf(p) === methodKind(m));
const opts = { kibel: [0.5, 0.75, 1, 1.5, 2, 2.5], taczka: [0.05, 0.06, 0.08, 0.1], inne: [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1] }; // łyżki: typowe pojemności z katalogu

// ───────────────────────── stan ─────────────────────────
let session = null, archive = [], method = 'kibel', chosenProfileId = '', pioMode = false; // pioMode: „policz z piór przy pierwszym koszu”
let phase = 'ready', departed = 0, deadline = 0, alarmVisible = false, nextReminder = 0;
/* przypomnienia „Czy kosz już jest?” — ile i jak często (Opcje → Przypomnienia) */
const REMIND = { czesto: { gap: 20000, max: 40, burst: 3, label: 'Często — ok. ¼ kursu (na start co 20 s), bez końca' }, normal: { gap: 45000, max: 5, burst: 1, label: 'Normalnie — ok. 40% kursu (na start co 45 s), max 5 razy' }, rzadko: { gap: 90000, max: 2, burst: 1, label: 'Rzadko — ok. ¾ kursu (na start co 1,5 min), max 2 razy' } };
const remindCfg = () => REMIND[settings.remindMode] || REMIND.normal;
/** co ile przypominać „czy kosz jest?” — ze średniego kursu, nie na sztywno: krótkie kursy = częściej, długie = rzadziej.
 *  Często ≈ ¼ kursu, Normalnie ≈ 40%, Rzadko ≈ ¾ kursu (min 15 s, max 3 min). Bez historii kursów = stałe z ustawienia. */
function remindGap() {
  const rc = remindCfg(), arr = (session?.trips || []).filter(x => Number(x.seconds) > 0);
  if (arr.length < 2) return rc.gap;
  const k = { czesto: .25, normal: .4, rzadko: .75 }[settings.remindMode] ?? .4;
  return Math.round(Math.min(180000, Math.max(15000, meanTrip() * 1000 * k)) / 1000) * 1000;
}
let REMIND_MS = 45000, remindN = 0;
let alarmSince = 0;
/** mocne przypomnienie: dźwięk + wibracja + głos */
function alarmKick(key) { alarmSince = alarmSince || Date.now(); jlog(key === 'ask' ? 'pytam: czy kosz wrócił?' : key === 'remind' ? 'przypominam o koszu (' + remindN + ')' : key); if (settings.mode !== 'full') jlog('tryb lektora: tylko pik — bez mowy', true); if (nightOn) nightRender(); if (key === 'ask') setTimeout(() => { if (alarmVisible) { beep(); sayBot('remind') } }, 6000); if (settings.alarm !== false) { beep(); setTimeout(beep, 350) } buzz('warning'); setTimeout(() => buzz('warning'), 300); setTimeout(() => buzz('warning'), 600); try { navigator.vibrate?.([400, 150, 400, 150, 400]) } catch (e) { } sayBot(key) }
let micWanted = false, micLive = false, recognition = null, voiceRetry = null, lastAddAt = 0;
const entriesSum = () => session ? session.entries.reduce((s, x) => s + Number(x.amount || 0), 0) : 0;
/** liczenie kursów: ile wysłano, ile pełnych zostało i ile w ostatnim */
const plural = (n, one, few, many) => n === 1 ? one : (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) ? few : many;
const unitWords = m => m === 'taczka' ? ['taczka', 'taczki', 'taczek'] : m === 'inne' ? ['łyżka', 'łyżki', 'łyżek'] : ['kosz', 'kosze', 'koszy'];
function bucketPlan() {
  if (!session) return null; const dose = Math.max(.01, Number(session.dose || session.capacity) || .5), rest = left();
  const full = Math.floor(rest / dose + 1e-6), last = Math.round((rest - full * dose) * 100) / 100, partial = last >= .01 ? 1 : 0;
  return { sent: session.entries.length, full, last: partial ? last : 0, total: full + partial, dose };
}
function bucketPlanText(p, spoken) {
  const [a, b, c] = unitWords(session?.method); if (!p || p.total === 0) return 'nic — koniec betonu';
  const fw = p.full + ' ' + plural(p.full, a, b, c);
  if (!p.last) return fw + (spoken ? ' po ' + fmt(p.dose) + ' metra' : ' po ' + fmt(p.dose) + ' m³');
  return (p.full ? fw + ' i ' : '') + (p.full ? 'ostatni ' : 'ostatni ') + fmt(p.last) + (spoken ? ' metra' : ' m³');
}
const left = () => session ? Math.max(0, Math.round((session.load - entriesSum()) * 100) / 100) : 0;
function meanTrip() { const arr = (session?.trips || []).filter(x => Number(x.seconds) > 0); if (!arr.length) return session?.cycle || 120; return arr.slice(-5).reduce((s, v) => s + Number(v.seconds), 0) / Math.min(arr.length, 5) }
function resetTrip() { phase = 'ready'; departed = 0; deadline = 0; alarmVisible = false; nextReminder = 0; alarmSince = 0 }
function remember() {
  if (session) { Object.assign(session, { tripPhase: phase, departed, deadline, alarmVisible, nextReminder }); try { localStorage.setItem(KEY, JSON.stringify(session)) } catch (err) { announce('Nie udało się zapisać') } }
  syncNative();
}
function syncNative() {
  if (!nativeVoice) return;
  const s = session;
  NV.setState({ active: !!s, site: s?.site || '', method: s?.method || 'kibel', phase, deadline, departed, meanTripSec: meanTrip(), dose: Number(s?.dose || 0), capacity: Number(s?.capacity || s?.dose || 0.5), lastTruck: s ? Number(trucksOf(s).at(-1).m3) : 0, lastAmount: Number(s?.entries?.at(-1)?.amount || 0), kursy: s?.entries?.length || 0, remindSec: remindGap() / 1000, left: left(), poured: entriesSum(), load: Number(s?.load || 0), fired: Object.keys(s?.milestonesFired || {}) }).catch(() => { });
}
const storeHistory = () => { try { localStorage.setItem(HKEY, JSON.stringify(archive)) } catch (err) { announce('Nie udało się zapisać historii') } };
let modelCache = { key: '', model: null }, customOpen = false, pioOpen = false;
function currentModel() {
  const p = session?.bucketProfile, cap = Number(session?.capacity || session?.dose || .5);
  const k = JSON.stringify([p?.id, p?.shape, p?.dims, cap]);
  if (modelCache.key !== k) modelCache = { key: k, model: bucketModel(p ? { ...p, capacity: cap } : null, cap) };
  return modelCache.model;
}

// ───────────────────────── nawigacja ─────────────────────────
const TAB_OF = { theme: 'settings', home: 'home', setup: 'home', pickBucket: 'home', buckets: 'home', settings: 'settings', work: 'work', history: 'history', drum: 'drum' };
let currentTab = 'home', bucketReturn = '';
function tab(name) {
  if (name === 'home' && settings.startForm !== false) name = 'setup';
  currentTab = name;
  if (name === 'drum' && diagramDirty) requestAnimationFrame(() => recolorDiagram(true));
  document.querySelectorAll('main section').forEach(s => s.classList.toggle('hide', s.id !== name));
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === TAB_OF[name]));
  if (name === 'work') { if (!session) { tab('setup'); announce('Najpierw rozpocznij betonowanie'); return } render(); tick() }
  if (name === 'history') historyRender();
  if (TAB_OF[name] === 'work' && voiceEl) stopIntroVoice();
  bgmUpdate();
  if (name === 'home') homeRender();
  if (name === 'buckets') bucketListRender();
  if (name === 'settings') { settingsRender(); document.querySelectorAll('details.set-cat').forEach(d => d.open = false) }
  if (name === 'setup') { renderPresets(); refreshKnownSites() }
  if (name === 'pickBucket') sheetRender();
  if (name === 'theme') themeRender();
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => tab(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { if (b.dataset.go === 'buckets') bucketReturn = currentTab; tab(b.dataset.go) }));
$('openSettings').addEventListener('click', () => tab('settings'));
const HOME_ITEMS = {
  continue: { name: 'Kontynuuj betonowanie', ico: '▶', go: () => tab('work') },
  new: { name: 'Nowe betonowanie', ico: '＋', sub: 'Budowa, ilość betonu, kosz', go: () => tab('setup') },
  buckets: { name: 'Moje kosze', kibel: true, sub: 'zmierz i zapisz kosze', go: () => { bucketReturn = 'home'; tab('buckets') } },
  history: { name: 'Budowy', ico: '▤', sub: 'historia betonowań', go: () => tab('history') },
  settings: { name: 'Ustawienia', ico: '⚙️', sub: 'lektor, teksty, sygnały', go: () => tab('settings') },
  work: { name: 'Licznik', ico: '🏗', sub: 'kosz i podziałka', go: () => tab('work') },
  drum: { name: 'Diagram gruszki', ico: '🛢', sub: 'podziałka bębna', go: () => tab('drum') },
  theme: { name: 'Wygląd', ico: '🎨', sub: 'kolory, układ, tekstura', go: () => { themeReturn = 'home'; tab('theme') } },
};
const HOME_DEFAULT = [['continue', 1, 'big'], ['new', 1, 'big'], ['buckets', 1, 'small'], ['history', 1, 'small'], ['settings', 1, 'small'], ['work', 0, 'small'], ['drum', 0, 'small'], ['theme', 0, 'small']];
function homeConfig() {
  let cfg = Array.isArray(settings.home) ? settings.home.filter(x => HOME_ITEMS[x[0]]) : [];
  for (const d of HOME_DEFAULT) if (!cfg.some(x => x[0] === d[0])) cfg.push(d.slice());
  return cfg;
}
function homeRender() {
  const h = new Date().getHours();
  $('homeHello').textContent = session ? 'Betonowanie w toku' : (h < 10 ? 'Dzień dobry, Domi' : h < 18 ? 'Gotowy do lania?' : 'Dobry wieczór, Domi');
  const big = $('homeBig'), small = $('homeSmall'); big.replaceChildren(); small.replaceChildren();
  for (const [id, show, size] of homeConfig()) {
    const it = HOME_ITEMS[id]; if (!show || (id === 'continue' && !session)) continue;
    const sub = id === 'continue' ? session.site + ' · zostało ' + fmt(left()) + ' m³' : it.sub;
    if (size === 'big') {
      const b = el('button', { type: 'button', class: 'big-btn' + (id === 'continue' ? ' primary' : ''), onclick: it.go }); if (id === 'continue') b.id = 'homeContinue'; if (id === 'new') b.id = 'homeNew';
      if (it.kibel) b.append(kibelIcon(), ' '); else b.append(it.ico + ' ');
      b.append(it.name, el('small', { text: sub || '' })); big.append(b);
    } else {
      const b = el('button', { type: 'button', onclick: it.go }); if (id === 'new') b.id = 'homeNew';
      b.append(it.kibel ? kibelIcon() : el('span', { class: 'hs-ico', text: it.ico }), el('br'), it.name); small.append(b);
    }
  }
  small.classList.toggle('hide', !small.children.length);
}
function homeEditorRender() {
  const box = $('homeEditor'); box.replaceChildren(); const cfg = homeConfig();
  const save = () => { settings.home = cfg; saveSettings(); homeEditorRender(); homeRender() };
  cfg.forEach((row, i) => {
    const [id, show, size] = row, it = HOME_ITEMS[id];
    const chk = el('input', { type: 'checkbox', 'aria-label': 'Pokaż ' + it.name }); chk.checked = !!show; chk.addEventListener('change', () => { row[1] = chk.checked ? 1 : 0; save() });
    box.append(el('div', { class: 'he-row' + (show ? '' : ' off') },
      chk, (() => { const n = el('span', { class: 'he-name' }); n.append(it.kibel ? kibelIcon() : el('span', { class: 'he-ico', text: it.ico }), it.name); return n })(),
      el('button', { type: 'button', class: 'he-size' + (size === 'big' ? ' on' : ''), text: size === 'big' ? 'Duży' : 'Mały', onclick: () => { row[2] = size === 'big' ? 'small' : 'big'; save() } }),
      el('button', { type: 'button', class: 'he-arrow', text: '↑', 'aria-label': 'W górę', disabled: i === 0 ? '' : null, onclick: () => { if (i) { [cfg[i - 1], cfg[i]] = [cfg[i], cfg[i - 1]]; save() } } }),
      el('button', { type: 'button', class: 'he-arrow', text: '↓', 'aria-label': 'W dół', onclick: () => { if (i < cfg.length - 1) { [cfg[i + 1], cfg[i]] = [cfg[i], cfg[i + 1]]; save() } } })));
  });
  [...box.querySelectorAll('[disabled=""]')].forEach(b => b.disabled = true);
}

// ───────────────────────── nowe betonowanie ─────────────────────────
function refreshKnownSites() { const list = $('knownSites'); list.replaceChildren(); const sites = new Set([...Object.keys(siteAssignments), ...archive.map(s => s.site || '').filter(Boolean)]); for (const s of sites) list.append(el('option', { value: s })) }
/** usuń zapisany kosz (z potwierdzeniem) */
async function deleteProfile(p, after) {
  if (!(await ask('Usunąć „' + p.name + '” (' + fmt(p.capacity) + ' m³)?', '🗑 Usuń', true))) return;
  profiles = profiles.filter(x => x.id !== p.id); for (const [k, v] of Object.entries(siteAssignments)) if (v === p.id) delete siteAssignments[k];
  storeSiteAssignments(); saveProfiles(); if (chosenProfileId === p.id) { chosenProfileId = ''; renderPresets() } announce('Usunięto: ' + p.name); after?.();
}
const byRecent = list => list.slice().sort((a, b) => (b.usedAt || b.created || 0) - (a.usedAt || a.created || 0));
let pickAll = false;

/* ───── okno z polami (kalibracja, gotowe modele) ───── */
function formModal(title, body, okText = 'Zapisz') {
  return new Promise(res => {
    const box = el('div', { class: 'ask-back', role: 'dialog', 'aria-modal': 'true' }), card = el('div', { class: 'ask-card form-card' });
    const done = v => { box.remove(); res(v) };
    card.append(el('h3', { text: title }), body, el('div', { class: 'ask-row' }, el('button', { type: 'button', text: 'Anuluj', onclick: () => done(false) }), el('button', { type: 'button', class: 'primary', text: okText, onclick: () => done(true) })));
    box.append(card); box.addEventListener('click', e => { if (e.target === box) done(false) }); document.body.append(box);
  });
}
/** ✏️ ręczna zmiana pojemności zapisanego kosza / taczki / łyżki (np. wyszło 1,3 a nie 1,7) */
async function editCapacity(p, after) {
  const tz = kindOf(p) === 'taczka', inp = el('input', { inputmode: 'decimal', class: 'fin-rest', value: tz ? String(Math.round(p.capacity * 1000)) : fmt(p.capacity) });
  const pin = tz ? null : el('input', { inputmode: 'decimal', class: 'fin-rest', placeholder: 'np. 3,5' });
  if (pin) pin.addEventListener('input', () => { const n = number(pin.value); if (n > 0) inp.value = fmt3(n * pioroM3()) });
  const body = el('div', { class: 'fin' }, el('label', { class: 'label', text: tz ? 'Pojemność taczki (litry)' : 'Pojemność (m³)' }), inp, ...(pin ? [el('label', { class: 'label', text: '🌀 albo: ile piór wchodzi (1 pióro = ' + fmt3(pioroM3()) + ' m³)' }), pin] : []), el('p', { class: 'hint', text: 'Jak na budowie wyszło inaczej niż na tabliczce — wpisz, ile naprawdę mieści. Zostanie zapisane w „' + p.name + '”.' }));
  setTimeout(() => { inp.focus(); inp.select() }, 50);
  if (!(await formModal('✏️ ' + p.name, body, '✓ Zapisz'))) return;
  let v = number(inp.value); if (tz && v > 5) v = v / 1000;
  if (!(v > 0.02 && v <= 5)) return announce('To nie wygląda na pojemność — wpisz np. 1,3');
  applyCalib(p, v, { manual: true }); jlog('pojemność „' + p.name + '” zmieniona ręcznie na ' + fmt(v));
  if (session?.bucketProfile?.id === p.id && Math.abs(session.capacity - v) > 1e-4) changeCapacity(v, p);
  after?.();
}
/* ───── kalibracja z gruszki: ile m³ wylano / ile pełnych koszy wyszło ───── */
function applyCalib(p, cap, info) {
  cap = Math.round(cap * 1000) / 1000; if (!(cap > 0.02 && cap <= 5)) return announce('Wyszło ' + fmt(cap) + ' m³ — to nie wygląda na kosz, sprawdź liczby');
  const old = p.capacity; p.capacity = cap; p.real = cap; p.calib = { ...info, old, at: Date.now() }; saveProfiles();
  if (chosenProfileId === p.id || session?.bucketProfile?.id === p.id) chooseProfile(p.id);
  announce('⚖️ ' + p.name + ': ' + fmt(old) + ' → ' + fmt(cap) + ' m³ (skalibrowany)'); bucketListRender?.();
}
async function calibrateProfile(p) {
  const m3 = el('input', { inputmode: 'decimal', placeholder: 'np. 1', value: '' }), n = el('input', { inputmode: 'decimal', placeholder: 'np. 1,5', value: '' }), out = el('p', { class: 'calib-out', text: '' });
  const upd = () => { const a = number(m3.value), b = number(n.value); out.textContent = a > 0 && b > 0 ? 'Pełny kosz = ' + fmt(Math.round(a / b * 1000) / 1000) + ' m³ (teraz ' + fmt(p.capacity) + ')' : 'Teraz: ' + fmt(p.capacity) + ' m³' }; upd();
  m3.addEventListener('input', upd); n.addEventListener('input', upd);
  const body = el('div', { class: 'calib' }, el('p', { class: 'hint', text: 'Wlej z gruszki znaną ilość (np. 1 m³ z licznika gruszki) i policz, ile PEŁNYCH koszy (do krawędzi) z tego wyszło. Może być z przecinkiem, np. 1,5.' }),
    el('label', { class: 'label', text: 'Z gruszki wylano (m³)' }), m3, el('label', { class: 'label', text: 'Ile pełnych koszy wyszło' }), n, out);
  if (!(await formModal('⚖️ Kalibracja „' + p.name + '”', body, '⚖️ Zapisz'))) return;
  const a = number(m3.value), b = number(n.value); if (!(a > 0 && b > 0)) return announce('Wpisz obie liczby');
  applyCalib(p, a / b, { poured: a, buckets: b });
}
/* ───── gotowe modele koszy (bez zdjęć) ───── */
const TEMPLATES = [
  ['lej', 'Lejowy', 'najczęstszy, zwęża się w dół', 'cone', { dTop: 110, dBottom: 55, h: 100 }],
  ['lejek', 'Prosty + lejek', 'proste ścianki, na dole lejek', 'cylcone', { d: 110, hCyl: 55, hCone: 45, dOut: 30 }],
  ['waski', 'Wąski wysoki', 'smukły, mocno zwężany', 'cone', { dTop: 90, dBottom: 40, h: 130 }],
  ['plaski', 'Szeroki niski', 'płaski, szeroki wlew', 'cone', { dTop: 140, dBottom: 80, h: 70 }],
  ['walec', 'Walec', 'proste ścianki', 'cylinder', { d: 90, h: 90 }],
  ['skrzynia', 'Prostokątny', 'kanciasty / skrzynia', 'rect', { lTop: 120, wTop: 80, lBottom: 80, wBottom: 40, h: 90 }],
];
/* rysunki koszy — korpus + ucho do haka, łańcuchy, zamknięcie, dźwignia, nogi */
const KS = 'var(--c1)', KF = 'color-mix(in srgb,var(--c1) 32%,transparent)', KD = 'color-mix(in srgb,var(--c1) 60%,#000)';
const kSvg = inner => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 64 64'); svg.setAttribute('class', 'tpl-ico kosz-art');
  svg.innerHTML = `<g fill="none" stroke="${KS}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`; return svg };
const kBail = (xl, xr, y) => `<path d="M${xl} ${y}L32 6M${xr} ${y}L32 6" stroke-width="1.3"/><circle cx="32" cy="4.5" r="2.4" stroke-width="1.6"/><path d="M${xl - 1} ${y}h2M${xr - 1} ${y}h2" stroke-width="3"/>`;
const kGate = (x, y, w) => `<rect x="${x - w / 2}" y="${y}" width="${w}" height="3.4" rx="1" fill="${KD}"/>`;
const kLever = (x0, y0, x1, y1) => `<path d="M${x0} ${y0}L${x1} ${y1}L${x1 - 4} ${y1 + 2.5}" stroke-width="1.6"/><circle cx="${x1}" cy="${y1}" r="1.7" fill="${KS}"/>`;
function tplSvg(shape, d) {
  let pts; // [y, półszerokość] od góry
  if (shape === 'cone') pts = [[0, d.dTop / 2], [d.h, d.dBottom / 2]];
  else if (shape === 'cylcone') pts = [[0, d.d / 2], [d.hCyl, d.d / 2], [d.hCyl + d.hCone, d.dOut / 2]];
  else if (shape === 'cylinder') pts = [[0, d.d / 2], [d.h, d.d / 2]];
  else pts = [[0, d.lTop / 2], [d.h, d.lBottom / 2]];
  const H = pts.at(-1)[0], Wm = Math.max(...pts.map(p => p[1])), k = Math.min(34 / H, 19 / Wm), top = 16, ox = 32;
  const L = pts.map(([y, w]) => [ox - w * k, top + y * k]), R = pts.map(([y, w]) => [ox + w * k, top + y * k]);
  const f = a => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const bot = L.at(-1)[1], wb = R.at(-1)[0] - ox, wt = R[0][0] - ox, gw = Math.max(8, Math.min(wb * 2, 14));
  let g = kBail(ox - wt + 1, ox + wt - 1, top) + `<polygon points="${f([...L, ...R.slice().reverse()])}" fill="${KF}"/>`;
  g += `<path d="M${ox - wt - 1.5} ${top}h${2 * wt + 3}" stroke-width="3.2"/>`; // obręcz
  g += `<path d="M${ox - wt * .97} ${top + 5}L${ox + wt * .97} ${top + 5}" stroke-width=".9" opacity=".6"/>`; // przetłoczenie
  if (shape === 'rect') g += [.33, .66].map(t => `<path d="M${(ox - wt + (wt - wb) * .0 + 2 * wt * t).toFixed(1)} ${top}L${(ox - wb + 2 * wb * t).toFixed(1)} ${bot}" stroke-width=".9" opacity=".6"/>`).join('');
  // nogi / rama
  const ly = top + (bot - top) * .55, lx = (ox + (L[0][0] - ox) * .55 + (L.at(-1)[0] - ox) * .45);
  const lxL = Math.min(lx, ox - wb) - 1, lxR = 2 * ox - lxL;
  g += `<path d="M${lxL.toFixed(1)} ${ly.toFixed(1)}L${(lxL - 4).toFixed(1)} 61h-3M${lxR.toFixed(1)} ${ly.toFixed(1)}L${(lxR + 4).toFixed(1)} 61h3" stroke-width="2"/>`;
  g += kGate(ox, bot, gw) + kLever(ox + gw / 2, bot + 1.7, Math.min(ox + wt + 6, 60), ly - 4);
  return kSvg(g);
}
async function templatePick() {
  let tpl = TEMPLATES[0], cap = .75;
  const grid = el('div', { class: 'tpl-grid' }), caps = el('div', { class: 'chips tpl-caps' }), other = el('input', { inputmode: 'decimal', placeholder: 'inna, np. 0,8' }), name = el('input', { placeholder: 'Nazwa (np. Kosz Pawła)' });
  const draw = () => {
    grid.replaceChildren(...TEMPLATES.map(t => el('button', { type: 'button', class: 'tpl' + (t === tpl ? ' on' : ''), onclick: () => { tpl = t; draw() } }, tplSvg(t[3], t[4]), el('b', { text: t[1] }), el('small', { text: t[2] }))));
    caps.replaceChildren(...[.5, .75, 1, 1.25, 1.5, 2].map(v => el('button', { type: 'button', class: 'pill' + (Math.abs(v - cap) < 1e-4 && !other.value ? ' on' : ''), text: fmt(v) + ' m³', onclick: () => { cap = v; other.value = ''; draw() } })));
  };
  other.addEventListener('input', () => { const v = number(other.value); if (v > 0) cap = v; draw() }); draw();
  const body = el('div', { class: 'tpl-body' }, el('p', { class: 'hint', text: 'Wybierz kształt i pojemność z tabliczki — podziałka policzy się sama, bez zdjęć. Potem możesz dokalibrować z gruszki ⚖️.' }), grid, el('label', { class: 'label', text: 'Pojemność (tabliczka)' }), caps, other, el('label', { class: 'label', text: 'Nazwa' }), name);
  if (!(await formModal('⚡ Gotowy model kosza', body, '✓ Zapisz kosz'))) return null;
  if (!(cap > 0 && cap <= 5)) { announce('Pojemność od 0,05 do 5 m³'); return null }
  const [, label, , shape, base] = tpl, k = Math.cbrt(cap / geoCapacity(shape, base)), dims = Object.fromEntries(Object.entries(base).map(([a, v]) => [a, Math.round(v * k * 10) / 10]));
  const p = { id: 'bucket-' + Date.now(), kind: 'kosz', name: name.value.trim() || label + ' ' + fmt(cap) + ' m³', shape, dims, plate: cap, capacity: cap, template: tpl[0], created: Date.now(), photos: [] };
  profiles.push(p); saveProfiles(); announce('Zapisano: ' + p.name); return p;
}
function chooseProfile(id, applyLive = true) { const p = getProfile(id); chosenProfileId = p ? p.id : ''; if (p) pioMode = false; if (p && applyLive !== 'silent') { p.usedAt = Date.now(); try { saveProfiles() } catch (e) { } } if (p) $('portion').value = fmt(p.capacity); renderPresets(); if (p && applyLive && session && session.method !== 'taczka' && session.bucketProfile?.id !== p.id) changeCapacity(p.capacity, p) }
function renderPresets() {
  const r = $('presets'); r.replaceChildren();
  const useTiles = method !== 'taczka';
  $('presetsLabel').textContent = method === 'taczka' ? 'Taczka' : (method === 'inne' ? 'Łyżka' : 'Kosz');
  $('setupBucketsLink').classList.add('hide');
  $('bucketPick').classList.toggle('hide', !useTiles); r.classList.toggle('hide', useTiles);
  if (!useTiles) { r.className = 'chips'; for (const p of profilesFor('taczka')) r.append(el('button', { type: 'button', class: 'pill' + (p.id === chosenProfileId ? ' on' : ''), text: '🛒 ' + p.name + ' · ' + fmt(p.capacity), onclick: () => chooseProfile(p.id) })); for (const v of opts.taczka) r.append(el('button', { type: 'button', class: 'pill' + (Math.abs(number($('portion').value) - v) < .0001 ? ' on' : ''), text: fmt(v) + ' m³', onclick: () => { chosenProfileId = ''; pioMode = false; $('portion').value = fmt(v); renderPresets() } })); r.append(el('button', { type: 'button', class: 'pill', text: '🏷 Z katalogu', onclick: async () => { const p = await taczPick(); if (p) chooseProfile(p.id) } })); r.append(el('button', { type: 'button', class: 'pill', text: '📏 ＋ Zmierz taczkę', onclick: () => { bucketReturn = 'setup'; tab('buckets'); openBucketForm(null, 'taczka') } })); return }
  const p = getProfile(chosenProfileId), cap = number($('portion').value);
  const pic = p?.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '' }) : kindIcon(methodKind(method));
  $('bucketPick').replaceChildren(el('div', { class: 'tile-pic' }, pioMode && !p && method !== 'taczka' ? el('span', { class: 'pio-ico', text: '🌀' }) : pic), el('div', { class: 'bp-txt' }, el('strong', { text: pioMode && !p && method !== 'taczka' ? '🌀 Policz z piór' : p ? p.name : ({ taczka: 'Taczka ', inne: 'Łyżka ' }[method] || 'Kosz ') + (cap > 0 ? fmt(cap) + ' m³' : '') }), el('small', { text: pioMode && !p && method !== 'taczka' ? 'pojemność policzysz przy pierwszym koszu' : p ? fmt(p.capacity) + ' m³ · ' + (p.dims ? '📐 dokładna podziałka' : 'zapisany') : 'standardowy · dotknij, żeby wybrać zapisany' })), el('span', { class: 'bp-change', text: 'Zmień ›' }));
}
function sheetRender() {
  const r = $('pickTiles'); r.replaceChildren();
  $('pickTitle').textContent = { taczka: 'Wybierz taczkę', inne: 'Wybierz łyżkę / osprzęt' }[method] || 'Wybierz kosz';
  const sw = $('pickMethods'); sw.replaceChildren(...[['kibel', '🏗 Kosz'], ['taczka', '🛒 Taczka'], ['inne', '🚜 Koparka']].map(([m, t]) => el('button', { type: 'button', class: method === m ? 'on' : '', text: t, onclick: () => { if (method !== m) selectMethod(m); sheetRender() } })));
  const pick = fn => () => { fn(); tab(session ? 'work' : 'setup') }; // w trakcie betonowania = przekładka kosza, wraca do pracy
  const mine = byRecent(profilesFor(method)).sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0));
  /* statystyki z historii: ile razy i kiedy ostatnio */
  const stat = {}; for (const a of archive) { const id = a.bucketProfile?.id; if (!id) continue; const t = stat[id] || (stat[id] = { n: 0, last: 0, m3: 0 }); t.n++; t.last = Math.max(t.last, a.endedAt || a.startedAt || 0); t.m3 += Number(a.total) || 0 }
  const ago = t => { if (!t) return ''; const d = Math.floor((Date.now() - t) / 864e5); return d <= 0 ? 'dziś' : d === 1 ? 'wczoraj' : d < 7 ? d + ' dni temu' : d < 30 ? Math.floor(d / 7) + ' tyg. temu' : Math.floor(d / 30) + ' mies. temu' };
  const capTxt = p => kindOf(p) === 'taczka' ? Math.round(p.capacity * 1000) + ' l' : fmt(p.capacity) + ' m³';
  const picOf = p => p.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '', loading: 'lazy' }) : kindIcon(kindOf(p));
  /* 📍 podpowiedź z tej budowy */
  const sid = siteAssignments[siteKey($('site').value)], sp = sid && sid !== 'manual' ? getProfile(sid) : null;
  if (sp && profilesFor(method).includes(sp)) r.append(el('button', { type: 'button', class: 'pick-hero' + (sp.id === chosenProfileId ? ' on' : ''), onclick: pick(() => chooseProfile(sp.id)) },
    el('div', { class: 'ph-pic' }, picOf(sp)), el('div', { class: 'ph-txt' }, el('small', { text: '📍 Na budowie „' + $('site').value.trim() + '” używałeś' }), el('strong', { text: sp.name }), el('b', { text: capTxt(sp) })), el('span', { class: 'ph-go', text: sp.id === chosenProfileId ? '✓' : '▶' })));
  if (mine.length) {
    let q = '';
    const wrap = el('div', { class: 'pick-mine' }), head = el('div', { class: 'pm-head' }, el('b', { text: { taczka: '🛒 Moje taczki', inne: '🚜 Moje łyżki' }[method] || '🏗 Moje kosze' }), el('small', { text: mine.length + ' · przesuń ←→' }));
    const strip = el('div', { class: 'pm-strip' }), dots = el('div', { class: 'pm-dots' });
    const draw = () => {
      const ql = q.trim().toLowerCase(), list = mine.filter(p => !ql || p.name.toLowerCase().includes(ql) || capTxt(p).includes(ql.replace('.', ',')));
      strip.replaceChildren(...list.map(p => {
        const st = stat[p.id], on = p.id === chosenProfileId;
        const fav = el('span', { class: 'pm-fav' + (p.fav ? ' on' : ''), role: 'button', 'aria-label': p.fav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych', text: p.fav ? '★' : '☆', onclick: e => { e.stopPropagation(); p.fav = !p.fav; saveProfiles(); buzz?.('light'); sheetRender() } });
        const del = el('span', { class: 'pm-del', role: 'button', 'aria-label': 'Usuń ' + p.name, text: '🗑', onclick: e => { e.stopPropagation(); deleteProfile(p, sheetRender) } });
        const edit = el('span', { class: 'pm-edit', role: 'button', 'aria-label': 'Zmień pojemność ' + p.name, text: '✏️', onclick: e => { e.stopPropagation(); editCapacity(p, sheetRender) } });
        return el('button', { type: 'button', class: 'pm-card' + (on ? ' on' : '') + (p.fav ? ' fav' : ''), onclick: pick(() => chooseProfile(p.id)) },
          fav, del, edit, el('div', { class: 'pm-pic' }, picOf(p)), el('b', { class: 'pm-cap', text: capTxt(p) }), el('strong', { text: p.name }),
          el('small', { text: st ? '🔁 ' + st.n + '× · ' + ago(st.last) + (st.m3 ? ' · ' + fmt(Math.round(st.m3 * 10) / 10) + ' m³ razem' : '') : (p.catalog ? '🏷 z katalogu' : '✨ jeszcze nie używany') }),
          el('span', { class: 'pm-sel', text: on ? '✓ WYBRANY' : 'Wybierz' }));
      }));
      dots.replaceChildren(...list.map((p, i) => el('i', { class: p.id === chosenProfileId ? 'on' : '' })));
      if (!list.length) strip.append(el('p', { class: 'hint', text: 'Nic nie pasuje do „' + q + '”.' }));
    };
    wrap.append(head);
    if (mine.length > 5) { const si = el('input', { type: 'search', class: 'pm-search', placeholder: '🔍 Szukaj po nazwie albo pojemności' }); si.addEventListener('input', () => { q = si.value; draw() }); wrap.append(si) }
    wrap.append(strip, dots); r.append(wrap); draw();
    requestAnimationFrame(() => { const c = strip.querySelector('.pm-card.on'); if (c) strip.scrollLeft = c.offsetLeft - (strip.clientWidth - c.clientWidth) / 2 });
    strip.addEventListener('scroll', () => { const i = Math.round(strip.scrollLeft / (strip.firstChild?.clientWidth + 12 || 1)); [...dots.children].forEach((d, j) => d.classList.toggle('cur', j === i)) }, { passive: true });
  }
  if (false) r.append(el('button', { type: 'button', class: 'tile tpl-add', onclick: async () => { const p = await templatePick(); if (p) { chooseProfile(p.id); tab('setup') } } }, el('b', { text: '⚡ Gotowy model kosza' }), el('small', { text: 'kształt + tabliczka, bez zdjęć' })));
  if (method === 'taczka' || method === 'inne') r.append(el('button', { type: 'button', class: 'tile tpl-add eich-tile', onclick: async () => { const p = await (method === 'taczka' ? taczPick() : lyzPick()); if (p) { chooseProfile(p.id); sheetRender?.(); tab('setup') } } }, el('b', { text: method === 'taczka' ? '🏷 Taczka z katalogu' : '🏷 Łyżka z katalogu' }), el('small', { text: method === 'taczka' ? '6 rodzajów · Altrad, mefro, CAPITO, Olejnik…' : '6 rodzajów · 496 łyżek: Lehnhoff, Sieruta, Solid Hitch…' })));
  if (method !== 'taczka') r.append(el('button', { type: 'button', class: 'tile tpl-add pio-tile' + (pioMode ? ' on' : ''), onclick: pick(() => { chosenProfileId = ''; pioMode = true; $('portion').value = fmt(1); renderPresets() }) }, el('b', { text: '🌀 Policz z piór przy pierwszym ' + (method === 'inne' ? 'łyżce' : 'koszu') }), el('small', { text: 'nie znasz pojemności? policz pióra — 1 pióro = ' + fmt3(pioroM3()) + ' m³' })));
  if (method === 'kibel') r.append(el('button', { type: 'button', class: 'tile tpl-add eich-tile', onclick: async () => { const p = await eichPick(); if (p) { chooseProfile(p.id); sheetRender?.(); tab('setup') } } }, el('b', { text: '🏷 Kosz Eichinger z katalogu' }), el('small', { text: 'seria z tabliczki (1011, 1012, 1021…) + pojemność' })));
  r.append(el('button', { type: 'button', class: 'tile add', onclick: () => { bucketReturn = 'setup'; tab('buckets'); openBucketForm(null, methodKind(method)) } }, el('b', { text: method === 'kibel' ? '＋ Dodaj swój kosz' : '📏 ＋ ' + ({ taczka: 'Dodaj taczkę', inne: 'Dodaj łyżkę' }[method] || 'Dodaj') }), el('small', { text: method === 'kibel' ? 'nazwa + pojemność z tabliczki · resztę policzy gruszka' : 'zmierz miarką: długość, szerokość, głębokość' })));
  for (const v of opts[method] || []) r.append(el('button', { type: 'button', class: 'tile size' + (!chosenProfileId && Math.abs(number($('portion').value) - v) < .0001 ? ' on' : ''), onclick: pick(() => { chosenProfileId = ''; pioMode = false; $('portion').value = fmt(v); renderPresets() }) }, el('b', { text: fmt(v) }), el('small', { text: 'm³ · standard' })));
  const cur = number($('portion').value), isStd = (opts[method] || []).some(v => Math.abs(v - cur) < 1e-4);
  const ci = el('input', { inputmode: 'decimal', placeholder: 'np. 0,8', 'aria-label': 'Niestandardowa pojemność' }); if (!chosenProfileId && !isStd && cur > 0) ci.value = fmt(cur);
  const ok = () => { const v = number(ci.value); if (!(v > 0 && v <= 5)) return announce('Wpisz od 0,01 do 5 m³'); chosenProfileId = ''; pioMode = false; $('portion').value = fmt(v); renderPresets(); tab('setup') };
  ci.addEventListener('keydown', e => { if (e.key === 'Enter') ok() });
  r.append(el('div', { class: 'tile custom' + (!chosenProfileId && !isStd && cur > 0 ? ' on' : '') }, el('span', { text: '✏️ Niestandardowy' }), ci, el('button', { type: 'button', class: 'primary', text: 'OK', onclick: ok })));
}
$('bucketPick').addEventListener('click', () => tab('pickBucket')); $('pickBack').addEventListener('click', () => tab(session ? 'work' : 'setup'));
function restoreSiteBucket() {
  if (method === 'taczka') return;
  const id = siteAssignments[siteKey($('site').value)];
  const p = id && id !== 'manual' ? getProfile(id) : null;
  $('autoBucketHint').textContent = p ? '✅ Kosz z tej budowy: ' + p.name + ' (' + fmt(p.capacity) + ' m³)' : '';
  if (p) chooseProfile(p.id, false);
}
function selectMethod(m) {
  method = m; chosenProfileId = '';
  document.querySelectorAll('[data-method]').forEach(b => b.classList.toggle('on', b.dataset.method === m));
  $('cycleFields').classList.toggle('hide', m === 'taczka');
  $('portion').value = fmt(m === 'taczka' ? .06 : .5);
  renderPresets(); restoreSiteBucket();
}
document.querySelectorAll('[data-method]').forEach(b => b.addEventListener('click', () => selectMethod(b.dataset.method)));
/* zmiana rozładunku w trakcie betonowania (kibel / taczka / inne) */
document.querySelectorAll('[data-wm]').forEach(b => b.addEventListener('click', () => {
  if (!session || session.method === b.dataset.wm) return; const m = b.dataset.wm; session.method = m;
  if (m === 'taczka') { session.capacity = .06; session.dose = .06; session.bucketProfile = null; resetTrip() }
  else if (session.capacity < .2) { const p = getProfile(chosenProfileId); session.capacity = p ? p.capacity : .5; session.dose = session.capacity; session.bucketProfile = p ? snapshot(p) : null }
  remember(); render(); announce('Rozładunek: ' + { kibel: 'kosz', taczka: 'taczka', inne: 'koparka / inne' }[m]);
}));
$('portion').addEventListener('input', () => { const p = getProfile(chosenProfileId); if (p && Math.abs(number($('portion').value) - p.capacity) > .0001) chosenProfileId = ''; renderPresets() });
$('site').addEventListener('change', restoreSiteBucket); $('site').addEventListener('blur', restoreSiteBucket);

/* własne okno pytania (zamiast confirm — działa też w podglądzie przeglądarkowym) */
function ask(msg, okText = 'Tak', danger = false, onlyOk = false) {
  return new Promise(res => {
    const box = el('div', { class: 'ask-back', role: 'dialog', 'aria-modal': 'true' }), card = el('div', { class: 'ask-card' });
    const done = v => { box.remove(); res(v) };
    const ok = el('button', { type: 'button', class: danger ? 'warn' : 'primary', text: okText, onclick: () => done(true) });
    card.append(el('p', { text: msg }), el('div', { class: 'ask-row' }, ...(onlyOk ? [] : [el('button', { type: 'button', text: 'Anuluj', onclick: () => done(false) })]), ok));
    box.append(card); box.addEventListener('click', e => { if (e.target === box) done(false) }); document.body.append(box); ok.focus();
  });
}
/* pytanie z kilkoma odpowiedziami: [[tekst, wartość, klasa, podpis]] — kliknięcie działa jak gest użytkownika (można otworzyć aparat) */
function askChoice(msg, options, onPick) {
  return new Promise(res => {
    const box = el('div', { class: 'ask-back', role: 'dialog', 'aria-modal': 'true' }), card = el('div', { class: 'ask-card' });
    const done = v => { box.remove(); res(v) };
    card.append(el('p', { text: msg }), el('div', { class: 'ask-col' }, ...options.map(([t, v, cls, sub]) => el('button', { type: 'button', class: cls || '', onclick: () => { onPick?.(v); done(v) } }, el('span', { text: t }), ...(sub ? [el('small', { text: sub })] : [])))));
    box.append(card); box.addEventListener('click', e => { if (e.target === box) done(null) }); document.body.append(box);
  });
}
async function start() {
  const p = method !== 'taczka' ? getProfile(chosenProfileId) : null;
  const load = number($('load').value), dose = p ? p.capacity : number($('portion').value), cycleMin = method === 'taczka' ? 2 : number($('cycleMin').value);
  $('error').textContent = '';
  if (!(load > 0 && load <= 30)) return $('error').textContent = 'Podaj ile załadowano, np. 7,5 m³.';
  if (!(dose > 0 && dose <= 5)) return $('error').textContent = 'Ustaw pojemność kosza.';
  if (!(cycleMin >= 0.05 && cycleMin <= 120)) return $('error').textContent = 'Ustaw czas kursu, np. 2,5 minuty.';
  if (session && !(await ask('Zakończyć poprzednie betonowanie i zacząć nowe?', 'Tak, nowe'))) return;
  if (session) finishCurrent(false);
  resetTrip(); lastAddAt = 0;
  session = { id: Date.now(), site: $('site').value.trim() || 'Budowa bez nazwy', load, method, dose, capacity: dose, bucketProfile: snapshot(p), cycle: Math.round(cycleMin * 60), startedAt: Date.now(), entries: [], trips: [], milestonesFired: {} };
  if (pioMode && !p && method !== 'taczka') { session.pioPending = true; pioMode = false; setTimeout(() => whenQuiet(pioPrompt, 2500, 0), settings.ofeo !== false ? 4500 : 1500) } // po OFEO, z przerwą
  if (method !== 'taczka') rememberSiteBucket(session.site, p ? p.id : 'manual');
  remember(); refreshKnownSites(); tab('work'); introJinglePending = false; setTimeout(() => elWarmAsk(), 8000); if (voiceEl) { voiceEl.pause(); voiceEl = null } if (false) { playSong('start').then(ok => { const w = ok ? SONG_LEN.start : playJingle('start'); if (w) setTimeout(() => sayBot('start'), Math.max(0, w - 300)); else sayBot('start') }) } else sayBot('start');
  if (settings.ofeo !== false) whenQuiet(ofeoPrompt, 2200, 2600); // najpierw powitanie, potem przerwa, dopiero OFEO
  if (settings.micAuto !== false && !micWanted) setTimeout(() => { if (session && !micWanted) toggleMic() }, 1200); // mikrofon sam się włącza przy starcie
}
$('start').addEventListener('click', start); $('emptyTruck')?.addEventListener('click', emptyTruck);
$('slBuckets').addEventListener('click', () => { bucketReturn = 'setup'; tab('buckets') }); $('slHistory').addEventListener('click', () => tab('history')); $('slSettings').addEventListener('click', () => $('openSettings').click());
function finishCurrent(showNotice = true) { document.querySelector('.pio-prompt')?.remove();
  if (!session) return;
  const counted = Math.round(entriesSum() * 100) / 100; archive.unshift({ ...session, endedAt: Date.now(), counted, total: session.poured ?? counted }); storeHistory();
  session = null; resetTrip(); try { localStorage.removeItem(KEY) } catch (err) { }
  $('site').value = ''; $('load').value = ''; $('load').placeholder = 'np. 7,5'; $('error').textContent = ''; $('status').textContent = 'Gotowy'; // Start od zera na nowe betonowanie
  NATIVE.cancel?.(); syncNative(); if (showNotice) { if (false) playSong('finish').then(ok => { const w = ok ? SONG_LEN.finish : playJingle('finish'); if (w) setTimeout(() => sayBot('finish'), ok ? w : 1500); else sayBot('finish') }); else sayBot('finish') }
}
/* koniec betonowania: ile zostało w gruszce (±) → ile naprawdę wylano → poprawka pojemności kosza */
$('finish').addEventListener('click', async () => {
  if (!session) return;
  const s = session, sum = Math.round(entriesSum() * 1000) / 1000, load = Number(s.load) || 0, n = s.entries.length;
  const bp = s.bucketProfile?.id ? getProfile(s.bucketProfile.id) : null, PI = pioroM3();
  let rest = 0, fix = true;
  const restI = el('input', { inputmode: 'decimal', class: 'fin-rest', value: '0', 'aria-label': 'Ile zostało w gruszce (m³)' });
  const out = el('div', { class: 'fin-out' }), calib = el('div', { class: 'fin-calib' });
  const capI = bp ? el('input', { inputmode: 'decimal', class: 'fin-rest fin-cap', placeholder: fmt(bp.capacity), 'aria-label': 'Prawdziwa pojemność kosza' }) : null;
  const manual = bp ? el('div', { class: 'fin-manual' }, el('label', { class: 'label', text: '✏️ Albo wpisz sam, ile naprawdę mieści „' + bp.name + '” (m³)' }), capI, el('small', { class: 'hint', text: 'Puste = zostaje ' + fmt(bp.capacity) + ' m³ (albo poprawka powyżej). Zapisze się w koszu na następny raz.' })) : null;
  const setRest = v => { rest = Math.max(0, Math.min(load, Math.round(v * 100) / 100)); restI.value = fmt(rest); draw() };
  const step = d => el('button', { type: 'button', class: 'fin-step', text: (d > 0 ? '+' : '−') + fmt(Math.abs(d)), onclick: () => setRest(rest + d) });
  const draw = () => {
    const poured = Math.max(0, Math.round((load - rest) * 100) / 100), diff = Math.round((poured - sum) * 100) / 100;
    out.replaceChildren(
      el('div', {}, el('small', { text: 'Licznik policzył' }), el('b', { text: fmt(Math.round(sum * 100) / 100) + ' m³' }), el('small', { text: n + ' ' + (n === 1 ? 'kurs' : n < 5 ? 'kursy' : 'kursów') })),
      el('div', {}, el('small', { text: 'Naprawdę wylane' }), el('b', { class: 'fin-real', text: fmt(poured) + ' m³' }), el('small', { text: fmt(load) + (rest ? ' − ' + fmt(rest) + ' w gruszce' : ' · cała gruszka') })));
    calib.replaceChildren();
    if (!bp || !(sum > 0) || n < 2 || !(poured > 0)) { calib.append(el('p', { class: 'hint', text: !bp ? 'Bez zapisanego kosza — nic nie poprawiam.' : 'Za mało kursów, żeby poprawić kosz.' })); return }
    const r = poured / sum, est = bp.capacity * r, cn = bp.calibN || 0, w = cn ? Math.max(.4, 1 / (cn + 1)) : 1, nc = Math.round((bp.capacity * (1 - w) + est * w) * 1000) / 1000, pct = Math.round((r - 1) * 1000) / 10;
    if (Math.abs(r - 1) <= .03) { fix = false; calib.append(el('p', { class: 'fin-ok', text: '✓ Zgadza się co do ' + fmt(Math.abs(pct)) + '% — kosz „' + bp.name + '” zostaje ' + fmt(bp.capacity) + ' m³' })); return }
    if (Math.abs(r - 1) >= .4) { fix = false; calib.append(el('p', { class: 'hint warn-t', text: '⚠️ Różnica ' + fmt(pct) + '% — za duża, to raczej pomyłka w kursach niż kosz. Nie poprawiam.' })); return }
    const cb = el('input', { type: 'checkbox' }); cb.checked = fix; cb.addEventListener('change', () => { fix = cb.checked });
    calib.append(el('label', { class: 'fin-fix' }, cb, el('span', {}, el('b', { text: '⚖️ Popraw kosz „' + bp.name + '”' }), el('small', { text: fmt(bp.capacity) + ' → ' + fmt(nc) + ' m³ (' + (pct > 0 ? '+' : '') + fmt(pct) + '% wg tej gruszki' + (cn ? ', uśrednione z ' + cn + ' poprzednimi' : '') + ')' }))));
    calib.dataset.nc = nc; calib.dataset.poured = poured;
  };
  restI.addEventListener('input', () => { rest = Math.max(0, number(restI.value) || 0); draw() });
  const body = el('div', { class: 'fin' }, out,
    el('label', { class: 'label', text: '🛢 Zostało w gruszce (m³)?' }),
    el('div', { class: 'fin-row' }, step(-.1), restI, step(.1)),
    el('div', { class: 'chips fin-chips' }, ...[['Nic', 0], ['0,25', .25], ['0,5', .5], ['1', 1]].map(([t, v]) => el('button', { type: 'button', class: 'pill', text: t, onclick: () => setRest(v) })), el('button', { type: 'button', class: 'pill', text: '🪶 +1 pióro', onclick: () => setRest(rest + PI) })),
    calib, ...(manual ? [manual] : []));
  draw();
  if (!(await formModal('🏁 Koniec betonowania', body, '✓ Zakończ i zapisz'))) return;
  const mv = capI ? number(capI.value) : 0;
  s.rest = rest; s.poured = Math.max(0, Math.round((load - rest) * 100) / 100);
  if (bp && mv > 0.02 && mv <= 5) { if (Math.abs(mv - bp.capacity) > 1e-4) { applyCalib(bp, mv, { poured: s.poured, counted: sum, rest, manual: true }); jlog('pojemność „' + bp.name + '” zmieniona na koniec: ' + fmt(mv)) } }
  else if (fix && bp && calib.dataset.nc) { applyCalib(bp, Number(calib.dataset.nc), { poured: s.poured, counted: sum, rest, auto: true }); bp.calibN = (bp.calibN || 0) + 1; saveProfiles() }
  finishCurrent(); tab('history') });
$('new').addEventListener('click', async () => { if (session && !(await ask('Zakończyć aktualne betonowanie i zacząć nowe?', 'Tak, nowe'))) return; finishCurrent(false); tab('setup') });

// ───────────────────────── kurs kosza ─────────────────────────
function depart({ at = Date.now(), silent = false } = {}) {
  if (!session || session.method === 'taczka') return;
  if ((phase === 'away' || phase === 'late') && !silent) return announce('Kosz już jest w drodze');
  departed = at; deadline = at + meanTrip() * 1000; phase = 'away'; remindN = 0; alarmVisible = false; nextReminder = 0;
  remember(); render(); NATIVE.schedule?.(deadline, SHORT.ask); markAct('depart'); if (!silent) sayBot('depart');
}
function returned({ at = Date.now(), silent = false } = {}) {
  if (!session || session.method === 'taczka') return;
  let fastest = false;
  if (departed && (phase === 'away' || phase === 'late')) { const sec = Math.max(1, Math.round((at - departed) / 1000)); fastest = session.trips.length >= 3 && sec < Math.min(...session.trips.map(x => Number(x.seconds) || 1e9)) * .97; session.trips.push({ seconds: sec, at }) }
  session.slowSaid = false; markAct('returned');
  departed = 0; deadline = 0; phase = 'returned'; alarmVisible = false; nextReminder = 0;
  remember(); render(); tick(); NATIVE.cancel?.(); if (!silent) { if (settings.alarm) beep(); sayBot('arrived'); if (fastest && settings.chatty !== false) setTimeout(() => sayBot('fastTrip'), 2200) }
}
function delay({ at = Date.now(), silent = false, sec = 0 } = {}) {
  if (!session || session.method === 'taczka') return;
  if (sec > 0) remindN = 0; // „zapytaj za 2 minuty” — od nowa liczymy przypomnienia
  phase = 'late'; alarmVisible = false; alarmSince = 0; nextReminder = at + (sec > 0 ? sec * 1000 : remindGap()); deadline = nextReminder;
  remember(); render(); NATIVE.schedule?.(nextReminder, SHORT.remind);
  if (silent) return;
  if (sec > 0) { const t = sec >= 60 ? (sec % 60 ? fmt(sec / 60) + ' minuty' : (sec / 60 === 1 ? 'minutę' : sec / 60 + (sec / 60 < 5 ? ' minuty' : ' minut'))) : sec + ' sekund'; const msg = pickVariant('snooze').replace(/X/g, t); $('botText').textContent = msg; announce('⏰ ' + msg); lastBotAt = Date.now(); speak('custom', msg) }
  else sayBot('late');
}
/** czas z mowy: „za 2 minuty”, „za minutę”, „za pół minuty”, „za 30 sekund”, „za półtorej minuty” */
function snoozeFromSpeech(t) {
  if (/\bpol minuty\b/.test(t)) return 30; if (/\bpoltorej minuty\b/.test(t)) return 90; if (/\bminute\b|\bjedna minute\b/.test(t) && !/\d/.test(t)) return 60;
  const n = spokenNumber(t.replace(/\b(zapytaj|spytaj|przypomnij|odezwij sie|daj znac|za|mi|o kosz|o kibel|ponownie)\b/g, ' '));
  if (!(n > 0)) return 0;
  if (/\bsekund/.test(t)) return Math.min(600, Math.max(10, Math.round(n)));
  return Math.min(900, Math.max(15, Math.round(n * 60)));
}
window.addEventListener('bkp:notification-action', e => { const a = e.detail?.action; if (a === 'ARRIVED') returned(); else if (a === 'LATER') delay(); else if (a === 'SNOOZE2') delay({ sec: 120 }); jlog('powiadomienie: ' + ({ ARRIVED: 'kosz jest', LATER: 'jeszcze nie', SNOOZE2: 'za 2 min' }[a] || a)) });
$('depart').addEventListener('click', () => depart()); $('returned').addEventListener('click', () => returned()); $('arrived').addEventListener('click', () => returned()); $('late').addEventListener('click', () => delay()); document.querySelectorAll('[data-snooze]').forEach(b => b.addEventListener('click', () => delay({ sec: Number(b.dataset.snooze) })));

function add(value, { at = Date.now(), silent = false, force = false } = {}) {
  if (!session) return announce('Najpierw rozpocznij betonowanie');
  const requested = Math.round(Number(value) * 100) / 100;
  if (!(requested > 0)) return announce('Ustaw więcej niż 0 m³');
  const before = left(), koszM = session.method === 'kibel';
  if (before <= 0 && !koszM) return announce('Cały beton już naliczony');
  const amount = koszM ? requested : Math.min(requested, Math.round(before * 100) / 100); // kosz: licz dalej ponad gruszkę — „Gruszka pusta” wyrówna
  if (!silent && !force && at - lastAddAt < 380) return; lastAddAt = at;
  const prevState = { tripPhase: phase, departed, deadline, alarmVisible, nextReminder }, prevMilestones = { ...(session.milestonesFired || {}) };
  if (session.method !== 'taczka') {
    if (departed && (phase === 'away' || phase === 'late')) session.trips.push({ seconds: Math.max(1, Math.round((at - departed) / 1000)), at });
    if (amount >= before - 0.00001 && !(koszM && before <= 0.0001)) { resetTrip(); NATIVE.cancel?.() }
    else { departed = at; deadline = at + meanTrip() * 1000; phase = 'away'; remindN = 0; alarmVisible = false; nextReminder = 0; NATIVE.schedule?.(deadline, SHORT.ask) }
  }
  session.entries.push({ amount, at, prevState, prevMilestones });
  const remaining = left(); session.milestonesFired = session.milestonesFired || {};
  const reached = [{ t: session.load * .75, key: 'left75' }, { t: session.load * .5, key: 'left50' }, { t: 3, key: 'left3' }, { t: 1.5, key: 'left15' }, { t: .5, key: 'left05' }].sort((a, b) => b.t - a.t).filter(m => before > m.t + 1e-5 && remaining > 0 && remaining <= m.t + 1e-5 && !session.milestonesFired[m.key]);
  for (const m of reached) session.milestonesFired[m.key] = true;
  let lowNow = false;
  if (!reached.length && remaining > 0 && remaining <= Math.max(.5, session.load * .15) && !session.milestonesFired.low) { session.milestonesFired.low = true; lowNow = true }
  remember(); render(); tick();
  if (silent) return;
  buzz(remaining <= 0 || lowNow || reached.length ? 'warning' : 'success');
  if (settings.confirm) beep();
  markAct('add');
  if (!silent && settings.confirmNums !== false && session.method !== 'taczka' && left() > 0.005) { const base = pickVariant(methodKey('added')), tail = pickVariant('leftAfter').replace(/X/g, fmt(Math.round(left() * 100) / 100)); const txt = base.trim() + ' ' + tail.trim(); $('botText').textContent = txt; if (settings.mode === 'full' && (settings.askOnly === false || ASK_KEYS.has('added'))) { lastBotAt = Date.now(); speakPair(methodKey('added'), base, 'leftAfter', tail) } } else sayBot('added');
  if (requested > amount + 1e-5) announce('Ostatnia porcja: ' + fmt(amount) + ' m³');
  const note = reached.length ? reached[reached.length - 1].key : (lowNow ? 'low' : null), jobId = session.id;
  if (note) setTimeout(() => { if (session?.id === jobId) sayBot(note) }, nativeVoice ? 0 : 1900);
  endPromptCheck();
}
/* przypomnienie: Entladung w OFEO (przy starcie, przypomina co 2 min aż klikniesz „Kliknięte”) */
let ofeoT = 0;
function ofeoPrompt() {
  clearTimeout(ofeoT); if (!session || document.querySelector('.ofeo-prompt')) return;
  const card = el('div', { class: 'end-prompt ofeo-prompt', role: 'dialog' }, el('b', { text: '📲 Kliknąłeś Entladung w OFEO?' }),
    el('div', { class: 'ep-row' },
      el('button', { type: 'button', class: 'primary', text: '✓ Kliknięte', onclick: () => { card.remove(); if (session) { session.ofeo = Date.now(); remember() } announce('👍 Entladung odhaczony') } }),
      el('button', { type: 'button', text: '⏰ Za 2 min', onclick: () => { card.remove(); ofeoT = setTimeout(() => { if (session && !session.ofeo) ofeoPrompt() }, 120000) } })));
  document.body.append(card); buzz?.('warning'); sayBot?.('ofeo');
  NATIVE.notify?.('📲 Entladung w OFEO', 'Kliknij Entladung w OFEO, jeśli jeszcze nie.');
}
/* końcówka gruszki: licznik mówi „zostało mniej niż kosz” albo „wyszło ponad” → pytamy, co naprawdę jest */
function endPromptCheck() {
  const s = session; if (!s || s.method === 'taczka' || s.endAsked === true || s.endAsked === 'done') return;
  const cap = Number(s.capacity) || .5, rest = Math.round((Number(s.load) - entriesSum()) * 100) / 100;
  if (s.endAsked === 'more') { if (!(rest < -cap * .3)) return; s.endAsked = 'done' } // „jeszcze leje” → pytamy drugi raz, jak przeleje o 1/3 kosza
  else { if (!(rest < cap * .95)) return; s.endAsked = true } // zostało mniej niż pełny kosz = ostatni kurs
  remember();
  const W = s.method === 'inne' ? ['łyżka', 'łyżki'] : ['kosz', 'kosza'];
  const msg = rest > 0.009 ? 'Wg licznika zostało ' + fmt(rest) + ' m³ — mniej niż ' + W[1] + ' (' + fmt(cap) + '). Gruszka pusta?' : rest < -0.009 ? 'Wylano o ' + fmt(-rest) + ' m³ więcej niż było w gruszce. Gruszka pusta?' : 'Wg licznika gruszka pusta. Zgadza się?';
  setTimeout(() => endPrompt(msg), 900);
}
function endPrompt(msg) {
  if (!session || document.querySelector('.end-prompt')) return;
  const card = el('div', { class: 'end-prompt', role: 'dialog' }, el('b', { text: '🛢 ' + msg }),
    el('div', { class: 'ep-row' },
      el('button', { type: 'button', class: 'primary', text: '✓ Pusta — kończę', onclick: () => { card.remove(); $('finish').click() } }),
      el('button', { type: 'button', text: '⏳ Jeszcze leje', onclick: () => { card.remove(); announce('OK — liczę dalej, zapytam przy końcu') ; if (session) { session.endAsked = 'more'; remember() } } })));
  document.body.append(card); buzz?.('warning'); sayBot?.('custom', msg.replace(/m³/g, 'metra'));
}
/* dodawanie: zwykłe dotknięcie albo przytrzymanie (ochrona przed przypadkowym naliczeniem w rękawicach) */
(function bucketPress() {
  const b = $('bucket'); let t = 0, fired = false, sx = 0, sy = 0, down = false, moved = false;
  const cancel = () => { clearTimeout(t); t = 0; b.classList.remove('holding') };
  const levelAt = clientY => { if (!session) return; const sv = b.querySelector('svg'), r = sv?.getBoundingClientRect(); if (!r) return; const vb = sv.viewBox?.baseVal, yv = vb && vb.height ? vb.y + (clientY - r.top) / r.height * vb.height : (clientY - r.top) / r.height * SVG_H;
    const [top, bot] = session.method === 'taczka' ? [150, 254] : session.method === 'inne' ? [100, 256] : [SVG_TOP, SVG_BOTTOM];
    const f = Math.max(0, Math.min(1, (bot - yv) / (bot - top))), v = Math.min(session.capacity, Math.round(currentModel().volumeAtFraction(f) * 100) / 100);
    changeDose(v, true); announce('Beton do ' + fmt(v) + ' m³ · przytrzymaj, żeby dodać') };
  b.addEventListener('pointerdown', e => { if (!session) return; down = true; moved = false; fired = false; sx = e.clientX; sy = e.clientY; if (!settings.holdAdd) return; b.classList.add('holding'); t = setTimeout(() => { t = 0; fired = true; b.classList.remove('holding'); add(session?.dose) }, 300) });
  b.addEventListener('pointermove', e => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { moved = true; cancel() } });
  b.addEventListener('pointerup', e => { if (!down) return; down = false; const short = !!t; cancel(); if (settings.holdAdd && short && !moved && !fired) { if (settings.tapLevel) levelAt(e.clientY); else if (Date.now() - (b._hintAt || 0) > 4000) { b._hintAt = Date.now(); announce('Poziom betonu zmieniasz suwakiem z boku · przytrzymaj kosz, żeby dodać') } } });
  for (const ev of ['pointerleave', 'pointercancel']) b.addEventListener(ev, () => { down = false; cancel() });
  b.addEventListener('contextmenu', e => e.preventDefault());
  b.addEventListener('click', e => { if (!settings.holdAdd || e.detail === 0) { if (!moved) add(session?.dose); return } });
})();
$('ohUndo').addEventListener('click', () => undo());
$('ohTrip').addEventListener('click', () => { if (phase === 'away' || phase === 'late') returned(); else depart() });
$('ohMic').addEventListener('click', () => toggleMic());
const setOneHand = on => { settings.oneHand = on; saveSettings(); document.body.classList.toggle('one-hand', on); $('oneHandBtn').textContent = on ? '↩ Pełny widok' : '🖐 Duży widok'; if ($('ohSetting')) $('ohSetting').checked = on; svgKey = ''; window.scrollTo(0, 0); if (session) render(); window.scrollTo({ top: 0 }) };
$('oneHandBtn').addEventListener('click', () => setOneHand(!settings.oneHand)); $('ohExit').addEventListener('click', () => setOneHand(false));
document.body.classList.toggle('one-hand', !!settings.oneHand); $('oneHandBtn').textContent = settings.oneHand ? '↩ Pełny widok' : '🖐 Duży widok'; $('ohSetting').checked = !!settings.oneHand; $('ohSetting').addEventListener('change', () => setOneHand($('ohSetting').checked));
/* ───── nowe liczenie kosza: kurs = pełny kosz, poprawka ostatniego kursu, gruszki uczą prawdziwej pojemności ───── */
const OVER_F = 1.1;
function trucksOf(s) { if (!s.trucks?.length) s.trucks = [{ m3: Number(s.load) || 0, start: 0, at: s.startedAt }]; return s.trucks }
function kursRender() {
  const s = session, tr = trucksOf(s), cur = tr.at(-1), n = s.entries.length, last = s.entries.at(-1), cap = Number(s.capacity) || .5;
  $('kursNo').textContent = n;
  const inTruck = s.entries.slice(cur.start).reduce((a, e) => a + Number(e.amount || 0), 0), restT = Math.max(0, cur.m3 - inTruck);
  $('kursInfo').textContent = n ? 'ostatni: ' + fmt(Math.round(Number(last.amount) * 100) / 100) + ' m³ (' + Math.round(Number(last.amount) / cap * 100) + '%)' : 'przytrzymaj kosz = pełny kurs';
  const f = last ? Number(last.amount) / cap : -1;
  for (const b of $('kursFrac').children) { const bf = b.dataset.f === 'over' ? OVER_F : Number(b.dataset.f); b.classList.toggle('on', !!last && !cur.closed && s.entries.length > cur.start && Math.abs(f - bf) < .02); b.disabled = !last || s.entries.length <= cur.start }
  $('truckNo').textContent = tr.length; $('truckInfo').textContent = fmt(cur.m3) + ' m³' + (cur.closed ? ' ✓' : '');
  $('truckEmpty').disabled = cur.closed || s.entries.length <= cur.start;
  $('kursLearn').textContent = s.learned ? '⚖️ ' + s.learned : 'Kosz: ' + fmt(cap) + ' m³ · po „Gruszka pusta” apka sama poprawi pojemność.';
}
/** ile m³ w gruszce z mowy: „7,5”, „siedem i pół”, „osiem” */
function truckNumber(t) {
  const n = normalise(t), d = n.match(/(\d+)(?:[ ,.](\d))?/); if (d) return Number(d[1] + (d[2] ? '.' + d[2] : ''));
  const W = { jeden: 1, jedna: 1, dwa: 2, dwie: 2, trzy: 3, cztery: 4, piec: 5, szesc: 6, siedem: 7, osiem: 8, dziewiec: 9, dziesiec: 10, jedenascie: 11, dwanascie: 12 };
  const w = n.split(' ').find(x => W[x] && !/^(druga|trzecia)$/.test(x)); if (!w) return 0; return W[w] + (/\bi pol\b|\bpol\b/.test(n) ? .5 : 0);
}
/** popraw ostatni kurs: ¼ ½ ¾ pełny albo przelany */
function setLastFrac(f, { silent = false } = {}) {
  const s = session; if (!s || s.method !== 'kibel') return; const cur = trucksOf(s).at(-1);
  if (!s.entries.length || s.entries.length <= cur.start) return announce('Najpierw dodaj kurs (przytrzymaj kosz)');
  const cap = Number(s.capacity) || .5, last = s.entries.at(-1); last.amount = Math.round(cap * (f === 'over' ? OVER_F : f) * 1000) / 1000;
  remember(); render(); syncNative(); const txt = { 0.25: 'Ćwierć kosza', 0.5: 'Pół kosza', 0.75: 'Trzy czwarte kosza', 1: 'Pełny kosz', over: 'Przelany kosz' }[f] || '';
  announce('Ostatni kurs: ' + txt + ' = ' + fmt(last.amount) + ' m³'); if (!silent) sayBot('custom', txt + ', ' + fmt(last.amount) + ' metra.');
}
/** suwak dokładności ostatniego kursu (0–110 %) */
function setLastPct(pct, { final = false } = {}) {
  const s = session; if (!s || s.method !== 'kibel') return; const cur = trucksOf(s).at(-1); if (s.entries.length <= cur.start || cur.closed) return;
  const cap = Number(s.capacity) || .5, last = s.entries.at(-1); last.amount = Math.round(cap * pct / 100 * 1000) / 1000;
  if (final) { remember(); render(); syncNative(); announce('Ostatni kurs: ' + pct + '% = ' + fmt(last.amount) + ' m³'); sayBot('custom', pct + ' procent, ' + fmt(Math.round(last.amount * 100) / 100) + ' metra.') }
  else render();
}
/** gruszka pusta: kursy z tej gruszki = dokładnie jej m³, a z tego prawdziwa pojemność kosza */
function truckEmpty({ silent = false } = {}) {
  const s = session; if (!s || s.method !== 'kibel') return; const tr = trucksOf(s), cur = tr.at(-1); if (cur.closed) return announce('Ta gruszka jest już zamknięta');
  const ents = s.entries.slice(cur.start), sum = ents.reduce((a, e) => a + Number(e.amount || 0), 0); if (!(sum > 0) || !(cur.m3 > 0)) return announce('Brak kursów z tej gruszki');
  const k = cur.m3 / sum, cap = Number(s.capacity) || .5, units = sum / cap, real = Math.round(cur.m3 / units * 1000) / 1000;
  for (const e of ents) e.amount = Math.round(Number(e.amount) * k * 1000) / 1000;
  cur.closed = true; cur.kursy = ents.length;
  const ok = Math.abs(k - 1) <= .4 && real > .02 && real <= 5;
  if (ok) { s.capacity = real; s.dose = real; const p = s.bucketProfile?.id ? getProfile(s.bucketProfile.id) : null; if (p) { const old = p.capacity; p.capacity = real; p.real = real; p.calib = { poured: cur.m3, buckets: units, old, at: Date.now(), auto: true }; saveProfiles() } }
  if (left() <= 0.001) { resetTrip(); NATIVE.cancel?.() } // betonu już nie ma — nie pytaj o kosz
  s.learned = 'Gruszka ' + tr.length + ': ' + ents.length + ' kurs' + (ents.length === 1 ? '' : 'ów') + ' = ' + fmt(cur.m3) + ' m³' + (ok ? ' → kosz realnie ' + fmt(real) + ' m³' : ' (różnica za duża — pojemności nie zmieniam)');
  remember(); render(); syncNative(); announce('⚖️ ' + s.learned);
  if (!silent) sayBot('custom', ok ? 'Gruszka pusta. Kosz realnie ' + fmt(real) + ' metra.' : 'Gruszka pusta.');
}
async function newTruck(m3) {
  const s = session; if (!s || s.method !== 'kibel') return; const tr = trucksOf(s), prev = tr.at(-1);
  if (!(m3 > 0)) { const inp = el('input', { inputmode: 'decimal', value: fmt(prev.m3), placeholder: 'np. 7,5' }); if (!(await formModal('🚚 Nowa gruszka — ile m³?', el('div', {}, el('p', { class: 'hint', text: 'Ile metrów przywiozła nowa gruszka? Poprzednia ' + (prev.closed ? 'jest zamknięta.' : 'zostanie zamknięta jako pusta.') }), inp), '＋ Dodaj gruszkę'))) return; m3 = number(inp.value) }
  if (!(m3 > 0 && m3 <= 15)) return announce('Podaj m³ gruszki, np. 7,5');
  if (!prev.closed && s.entries.length > prev.start) truckEmpty({ silent: true });
  tr.push({ m3, start: s.entries.length, at: Date.now() }); s.load = Math.round((Number(s.load) + m3) * 100) / 100;
  remember(); render(); syncNative(); announce('🚚 Gruszka ' + tr.length + ': ' + fmt(m3) + ' m³'); sayBot('custom', 'Nowa gruszka, ' + fmt(m3) + ' metra.');
}
$('kursFrac').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; setLastFrac(b.dataset.f === 'over' ? 'over' : Number(b.dataset.f)) });
$('truckEmpty').addEventListener('click', async () => { if (await ask('Gruszka pusta — cały beton z niej wylany? Apka wyrówna kursy do ' + fmt(trucksOf(session).at(-1).m3) + ' m³ i nauczy się prawdziwej pojemności kosza.', '✓ Tak, pusta')) truckEmpty() });
$('truckNew').addEventListener('click', () => newTruck());
function undo({ silent = false } = {}) {
  if (!session?.entries?.length) return announce('Nie ma czego cofnąć');
  const last = session.entries.pop();
  if (last.prevMilestones) session.milestonesFired = { ...last.prevMilestones };
  if (session.method !== 'taczka') {
    const p = last.prevState; if (p) { phase = p.tripPhase; departed = p.departed; deadline = p.deadline; alarmVisible = p.alarmVisible; nextReminder = p.nextReminder } else resetTrip();
    if (departed && session.trips.length && session.trips.at(-1).at === last.at) session.trips.pop();
  }
  remember(); render(); tick(); if (!silent) sayBot('undo');
}
$('undo').addEventListener('click', () => undo());

const bucketStep = cap => { cap = Number(cap) || .5; if (cap <= .1) return .01; if (cap <= .75) return .05; return .1 };
const bucketMarks = cap => {
  cap = Number(cap) || .5;
  const step = cap <= .12 ? .02 : cap <= .3 ? .05 : cap <= .65 ? .1 : cap <= 1.3 ? .2 : cap <= 2.1 ? .25 : cap <= 3.1 ? .5 : 1;
  const out = []; for (let v = step; v < cap - step * .6; v += step) out.push(Math.round(v * 100) / 100);
  out.push(Math.round(cap * 100) / 100); return out;
};
/** przelany kosz: suwak pozwala wlać trochę więcej niż policzona pojemność (np. 0,48 → do 0,5) */
const doseMax = cap => { cap = Number(cap) || .5; return Math.max(cap + .02, Math.ceil(cap * 1.04 / .05 - 1e-6) * .05) };
const OVER_K = .9; // dolne 90% suwaka = do pełnego kosza wg kształtu, górne 10% = przelane
function slPos(model, v, cap) { const mx = doseMax(cap); return v <= cap ? model.fraction(Math.max(0, v)) * OVER_K : OVER_K + Math.min(1, (v - cap) / (mx - cap)) * (1 - OVER_K) }
function slVal(model, F, cap) { const mx = doseMax(cap); F = Math.max(0, Math.min(1, F)); return F <= OVER_K ? model.volumeAtFraction(F / OVER_K) : cap + (F - OVER_K) / (1 - OVER_K) * (mx - cap) }
function changeDose(v, quiet = false) {
  if (!session) return; const n = Math.round(Number(v) * 100) / 100; const cap = Number(session.capacity || .5);
  if (!Number.isFinite(n) || n < 0 || n > 5) return announce('Podaj ilość od 0 do 5 m³');
  session.dose = Math.max(0, Math.min(n, Math.round(doseMax(cap) * 100) / 100)); remember(); render(); if (!quiet) announce('Ustawiono ' + fmt(session.dose) + ' m³');
}
function changeCapacity(v, profile = null) {
  if (!session) return; const n = Math.round(Number(v) * 100) / 100; if (!(n > 0 && n <= 5)) return;
  const old = Number(session.capacity) || 0, oldProf = session.bucketProfile;
  session.capacity = n; session.dose = n; session.nextPct = null; session.bucketProfile = snapshot(profile);
  if (session.method !== 'taczka') rememberSiteBucket(session.site, profile ? profile.id : 'manual');
  remember(); render(); announce((profile ? profile.name + ' · ' : 'Kosz ') + fmt(n) + ' m³'); sayBot('capacityChanged');
  const swap = profile && profile.id !== oldProf?.id; // przekładka na inny zapisany kosz: poprzednie kursy były w starym — nic nie przeliczamy
  if (swap && session.entries.length) { announce('🔄 Przekładka: od teraz ' + profile.name + ' · ' + fmt(n) + ' m³ — poprzednie kursy zostają'); jlog('przekładka kosza → ' + profile.name + ' ' + fmt(n)) }
  else if (session.entries.length && old > 0 && Math.abs(old - n) > 1e-4) capPrompt(old, n, profile ? null : oldProf);
}
/** 🪣 „beton się skończył”: gruszka pusta, a licznik mówi, że coś zostało (albo odwrotnie). Przeliczamy kursy i kosz — domyślnie środek różnicy, bo na oko można się walnąć o 100–200 l */
async function emptyTruck() {
  const s = session; if (!s) return; if (!s.entries.length) return announce('Najpierw jakiś kurs — nie ma czego poprawiać');
  const sum = entriesSum(), load = Number(s.load) || 0, cap = Number(s.capacity) || .5, appLeft = Math.max(0, load - sum);
  const bp = s.bucketProfile?.id ? getProfile(s.bucketProfile.id) : null;
  let rest = 0, half = true;
  const restI = el('input', { inputmode: 'decimal', class: 'fin-rest', value: '0', 'aria-label': 'Ile naprawdę zostało w gruszce (m³)' });
  const out = el('div', { class: 'fin-out' }), res = el('div', { class: 'fin-calib' });
  const setRest = v => { rest = Math.max(0, Math.min(load, Math.round(v * 100) / 100)); restI.value = fmt(rest); draw() };
  restI.addEventListener('input', () => { rest = Math.max(0, number(restI.value) || 0); draw() });
  const st = (d, t) => el('button', { type: 'button', class: 'fin-step', text: t, onclick: () => setRest(rest + d) });
  const hB = el('button', { type: 'button', class: 'pill on', text: '⚖️ Środek (pół różnicy)', onclick: () => { half = true; draw() } }), fB = el('button', { type: 'button', class: 'pill', text: '🎯 Cała różnica', onclick: () => { half = false; draw() } });
  const keep = bp ? el('input', { type: 'checkbox', checked: true }) : null;
  let calc = null;
  const draw = () => {
    hB.classList.toggle('on', half); fB.classList.toggle('on', !half);
    const real = Math.max(0, load - rest), diff = real - sum, applied = sum + diff * (half ? .5 : 1), f = sum > 0 ? applied / sum : 1;
    calc = { f, real, applied, newCap: Math.round(cap * f * 1000) / 1000 };
    out.replaceChildren(
      el('div', {}, el('small', { text: 'Licznik mówi' }), el('b', { text: 'zostało ' + fmt(Math.round(appLeft * 100) / 100) + ' m³' }), el('small', { text: '≈ ' + fmt(Math.round(appLeft / cap * 10) / 10) + ' kosza · wylano ' + fmt(Math.round(sum * 100) / 100) })),
      el('div', {}, el('small', { text: 'Naprawdę' }), el('b', { class: 'fin-real', text: 'zostało ' + fmt(rest) + ' m³' }), el('small', { text: 'wylano ' + fmt(Math.round(real * 100) / 100) + ' m³' })));
    res.replaceChildren();
    if (Math.abs(f - 1) < .005) { res.append(el('p', { class: 'fin-ok', text: '✓ Zgadza się — nic nie poprawiam' })); return }
    if (Math.abs(f - 1) > .4) { calc.bad = true; res.append(el('p', { class: 'hint warn-t', text: '⚠️ Różnica ' + fmt(Math.round((f - 1) * 1000) / 10) + '% — za duża, to raczej pomyłka w kursach. Lepiej popraw kursy ręcznie.' })); return }
    res.append(el('p', {}, el('b', { text: 'Kosz ' + fmt3(cap) + ' → ' + fmt3(calc.newCap) + ' m³' }), el('br'), el('small', { text: 'każdy z ' + s.entries.length + ' kursów ×' + fmt3(f) + ' · wylano ' + fmt(Math.round(sum * 100) / 100) + ' → ' + fmt(Math.round(applied * 100) / 100) + ' m³' + (half ? ' (środek — bezpieczniej o te 100–200 l)' : '') })));
    if (keep) res.append(el('label', { class: 'cap-keep' }, keep, el('span', { text: ' Zapisz ' + fmt3(calc.newCap) + ' m³ w koszu „' + bp.name + '”' })));
  };
  const body = el('div', { class: 'fin' },
    el('p', { class: 'hint', text: 'Gruszka pusta, a licznik pokazuje, że coś zostało? Wpisz, ile NAPRAWDĘ zostało w gruszce (0 = pusta). Apka poprawi kursy i kosz.' }),
    out, el('label', { class: 'label', text: 'W gruszce zostało naprawdę (m³)' }),
    el('div', { class: 'fin-row' }, st(-.1, '−0,1'), restI, st(.1, '+0,1')),
    el('div', { class: 'fin-row' }, st(-cap, '−1 kosz'), st(cap, '+1 kosz')),
    el('label', { class: 'label', text: 'Jak mocno poprawić' }), el('div', { class: 'ep-row' }, hB, fB), res);
  draw();
  if (!(await formModal('🪣 Beton się skończył', body, '✓ Popraw'))) return;
  if (!calc || calc.bad || Math.abs(calc.f - 1) < .005) return;
  const f = calc.f; for (const e of s.entries) e.amount = Math.round(Number(e.amount || 0) * f * 1000) / 1000;
  s.capacity = calc.newCap; s.dose = calc.newCap;
  if (bp && keep?.checked) { applyCalib(bp, calc.newCap, { manual: true }); s.bucketProfile = snapshot(bp) }
  jlog('beton się skończył: kursy ×' + fmt3(f) + ', kosz ' + fmt3(cap) + ' → ' + fmt3(calc.newCap));
  remember(); render(); announce('🪣 Poprawione: kosz ' + fmt3(calc.newCap) + ' m³, wylano ' + fmt(Math.round(entriesSum() * 100) / 100) + ' m³');
  sayBot('custom', 'Poprawione. Kosz ma teraz ' + fmt3(calc.newCap) + ' metra, wylane ' + fmt(Math.round(entriesSum() * 100) / 100) + '.');
}
/** 🌀 „policz z piór”: przy pierwszym koszu Domi liczy pióra, apka ustawia pojemność = pióra × pióro */
function pioPrompt() {
  document.querySelector('.pio-prompt')?.remove(); if (!session?.pioPending) return;
  const kw = session.method === 'inne' ? 'łyżki' : 'kosza';
  const inp = el('input', { inputmode: 'decimal', class: 'fin-rest', placeholder: 'np. 3,5', 'aria-label': 'Ile piór' }), out = el('small', { text: '1 pióro = ' + fmt3(pioroM3()) + ' m³ · możesz powiedzieć: „trzy i pół pióra”' });
  inp.addEventListener('input', () => { const n = number(inp.value); out.textContent = n > 0 ? fmt(n) + ' pióra × ' + fmt3(pioroM3()) + ' = ' + fmt3(n * pioroM3()) + ' m³' : '1 pióro = ' + fmt3(pioroM3()) + ' m³' });
  const ok = () => setPioCap(number(inp.value));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok() });
  const card = el('div', { class: 'end-prompt pio-prompt', role: 'dialog' }, el('b', { text: '🌀 Ile piór weszło do pierwszego ' + kw + '?' }), out, el('div', { class: 'ep-row' }, inp, el('button', { type: 'button', class: 'primary', text: '✓ Ustaw', onclick: ok })));
  document.body.append(card); buzz?.('warning'); sayBot('custom', 'Policz pióra przy pierwszym ' + (session.method === 'inne' ? 'łyżce' : 'koszu') + ' i powiedz mi, ile weszło.');
}
function setPioCap(n) {
  if (!session) return false; const v = Math.round(n * pioroM3() * 1000) / 1000;
  if (!(n > 0 && v > 0.01 && v <= 5)) { announce('Wpisz, ile piór weszło, np. 3,5'); return false }
  session.pioPending = false; document.querySelector('.pio-prompt')?.remove();
  jlog('kosz z piór: ' + fmt(n) + ' × ' + fmt3(pioroM3()) + ' = ' + fmt3(v) + ' m³'); changeCapacity(v, null);
  sayBot('custom', 'Ustawione. ' + fmt(n) + ' pióra, to jest ' + fmt3(v) + ' metra.'); return true;
}
/** pojemność wyszła inna (np. nie 1,7 tylko 1,3): przelicz kursy, które już poszły, i ewentualnie popraw kosz na stałe */
function capPrompt(old, n, prof) {
  document.querySelector('.cap-prompt')?.remove(); if (!session) return;
  const k = session.entries.length, before = entriesSum(), after = Math.round(before * n / old * 100) / 100;
  const saved = prof?.id ? getProfile(prof.id) : null;
  const keep = saved ? el('input', { type: 'checkbox', checked: true }) : null;
  const saveProf = () => { if (saved && keep.checked) { saved.capacity = n; saved.updatedAt = Date.now(); try { saveProfiles() } catch (e) { } session.bucketProfile = snapshot(saved); remember(); jlog('kosz „' + saved.name + '” poprawiony na ' + fmt(n) + ' m³') } };
  const card = el('div', { class: 'end-prompt cap-prompt', role: 'dialog' },
    el('b', { text: '📏 Kosz ' + fmt(old) + ' → ' + fmt(n) + ' m³. Przeliczyć ' + k + (k === 1 ? ' kurs, który już poszedł?' : ' kursy, które już poszły?') }),
    el('small', { text: 'Wylano ' + fmt(before) + ' m³ → po przeliczeniu ' + fmt(after) + ' m³' }),
    ...(keep ? [el('label', { class: 'cap-keep' }, keep, el('span', { text: ' Zapisz ' + fmt(n) + ' m³ w koszu „' + saved.name + '” na stałe' }))] : []),
    el('div', { class: 'ep-row' },
      el('button', { type: 'button', class: 'primary', 'data-cap': 'all', text: '🔁 Przelicz wszystko', onclick: () => {
        card.remove(); if (!session) return; const f = n / old;
        for (const e of session.entries) e.amount = Math.round(Number(e.amount || 0) * f * 1000) / 1000;
        saveProf(); remember(); render(); announce('Przeliczone: wylano ' + fmt(entriesSum()) + ' m³'); sayBot('custom', 'Przeliczone. Wylane ' + fmt(entriesSum()) + ' metra, zostało ' + fmt(left()) + '.') } }),
      el('button', { type: 'button', 'data-cap': 'next', text: '➡ Tylko następne', onclick: () => { card.remove(); saveProf(); announce('OK — nowa pojemność od następnego kursu') } })));
  document.body.append(card); buzz?.('warning'); sayBot('custom', 'Przeliczyć kursy, które już poszły, na ' + fmt(n) + ' metra?');
}
$('less').addEventListener('click', () => { if (session) changeDose(Math.max(0, Number(session.dose || 0) - bucketStep(session.capacity)), true) });
$('more').addEventListener('click', () => { if (session) changeDose(Math.min(doseMax(session.capacity), Number(session.dose || 0) + bucketStep(session.capacity)), true) });

function triggerAlarm(force = false) {
  if (!session || session.method === 'taczka') return; if (alarmVisible && !force) return;
  phase = 'late'; alarmVisible = true; nextReminder = Date.now() + remindGap(); deadline = nextReminder;
  remember(); render(); alarmKick('ask'); NATIVE.schedule?.(nextReminder, SHORT.remind);
}
$('testAlarm').addEventListener('click', () => { if (!session) return announce('Najpierw rozpocznij betonowanie'); triggerAlarm(true) });

// ───────────────────────── rysunek kosza + suwak z boku ─────────────────────────
const SVG_TOP = 74, SVG_BOTTOM = 262, SVG_H = 320;
function makeBucketSvg(cap, current, model) {
  cap = Math.max(0.01, Number(cap) || .5); current = Math.min(cap, Math.max(0, Number(current) || 0));
  const CX = 120, HALF = 92, N = 36, fullH = model.fullHeightCm || 1, rimF = Math.min(1.14, (model.totalHeightCm || fullH) / fullH);
  const yOf = f => SVG_BOTTOM - (SVG_BOTTOM - SVG_TOP) * f, dAt = f => model.diamAt(f * fullH);
  let dmax = 0; for (let i = 0; i <= N; i++) dmax = Math.max(dmax, dAt(i / N * rimF));
  const half = f => Math.max(13, HALF * dAt(f) / (dmax || 1)), EY = .2; // spłaszczenie elipsy (perspektywa)
  const f2 = n => n.toFixed(1);
  const side = (f0, f1, grow = 0) => { const L = [], R = []; for (let i = 0; i <= N; i++) { const f = f0 + (f1 - f0) * i / N, y = f2(yOf(f)), h = half(f) + grow; L.push(`${f2(CX - h)} ${y}`); R.unshift(`${f2(CX + h)} ${y}`) } return { L, R } };
  const yR = yOf(rimF), hR = half(rimF), hB = half(0), yB = yOf(0);
  // korpus: boki + dolny łuk (elipsa wylewu)
  const b = side(0, rimF, 9);
  const body = `M${b.L.join('L')}L${b.R.join('L')}A${f2(hB + 9)} ${f2((hB + 9) * EY)} 0 0 1 ${f2(CX - hB - 9)} ${f2(yB)}Z`;
  const inn = side(0, rimF, 0);
  const inner = `M${inn.L.join('L')}L${inn.R.join('L')}A${f2(hB)} ${f2(hB * EY)} 0 0 1 ${f2(CX - hB)} ${f2(yB)}Z`;
  const fr = v => model.fraction(v), fc = fr(current), yC = yOf(fc), hC = half(fc);
  // podziałka
  const marks = bucketMarks(cap); let ticks = '', lastY = 1e9;
  marks.slice().reverse().forEach((v, ri) => {
    const i = marks.length - 1 - ri, f = fr(v), y = yOf(f), hw = half(f), last = i === marks.length - 1;
    ticks += `<path d="M${f2(CX - hw)} ${f2(y)}A${f2(hw)} ${f2(hw * EY)} 0 0 0 ${f2(CX + hw)} ${f2(y)}" fill="none" stroke="${last ? '#ff4d5e' : '#ffffff'}" stroke-width="${last ? 2.5 : 1.4}" ${last ? '' : 'stroke-dasharray="5 5"'} opacity="${last ? .95 : .55}"/>`;
    if (!last && Math.abs(lastY - y) < 26) return; lastY = y;
    const txt = last ? 'MAX ' + fmt(v) : fmt(v), w = txt.length * 10 + 18, x0 = CX + hw + 14;
    ticks += `<line x1="${f2(CX + hw + 2)}" y1="${f2(y)}" x2="${f2(x0)}" y2="${f2(y)}" stroke="${last ? '#ff4d5e' : '#ffffffaa'}" stroke-width="2"/>`;
    ticks += `<g transform="translate(${f2(x0)} ${f2(y - 13)})"><rect width="${w}" height="26" rx="13" fill="${last ? '#ff4d5e' : 'rgba(10,16,22,.78)'}" stroke="${last ? '#ffffff55' : 'rgba(255,255,255,.28)'}"/><text x="${w / 2}" y="18" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">${txt}</text></g>`;
  });
  const conc = current > 0 ? `<g clip-path="url(#bkIn)"><rect x="0" y="${f2(yC)}" width="260" height="${f2(SVG_BOTTOM - yC + 40)}" fill="url(#bkConc)" opacity=".94"/><rect x="0" y="${f2(yC)}" width="260" height="${f2(SVG_BOTTOM - yC + 40)}" fill="url(#bkDots)" opacity=".5"/></g>
<ellipse cx="${CX}" cy="${f2(yC)}" rx="${f2(hC)}" ry="${f2(hC * EY)}" fill="url(#bkTop)" stroke="#ffffff" stroke-width="2.5"/>` : '';
  return `<svg viewBox="0 0 360 ${SVG_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
 <linearGradient id="bkMetal" x1="0" x2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--c2) 55%,#000)"/><stop offset=".18" style="stop-color:var(--c2)"/><stop offset=".42" style="stop-color:var(--c1)"/><stop offset=".55" style="stop-color:color-mix(in srgb,var(--c1) 60%,#fff)"/><stop offset=".75" style="stop-color:var(--c2)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--c2) 45%,#000)"/></linearGradient>
 <linearGradient id="bkGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05090d" stop-opacity=".62"/><stop offset="1" stop-color="#0b141b" stop-opacity=".5"/></linearGradient>
 <linearGradient id="bkConc" x1="0" x2="1"><stop offset="0" stop-color="#5f6874"/><stop offset=".45" stop-color="#b9c1cc"/><stop offset=".6" stop-color="#d3d9e1"/><stop offset="1" stop-color="#5a636e"/></linearGradient>
 <radialGradient id="bkTop" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#e6ebf1"/><stop offset="1" stop-color="#a7b0bc"/></radialGradient>
 <pattern id="bkDots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r="1" fill="#4b525c"/><circle cx="6.5" cy="7" r=".8" fill="#ffffff"/></pattern>
 <linearGradient id="bkRimG" x1="0" x2="1"><stop offset="0" stop-color="#3a414b"/><stop offset=".5" stop-color="#c9d0d8"/><stop offset="1" stop-color="#3a414b"/></linearGradient>
 <clipPath id="bkIn"><path d="${inner}"/></clipPath>
</defs>
<ellipse cx="${CX}" cy="${f2(yB + 30)}" rx="${f2(hR * .9)}" ry="9" fill="#000" opacity=".35"/>
<path d="M${f2(CX - hR - 2)} ${f2(yR + 6)}L${f2(CX - hR - 12)} ${f2(yR - 26)}M${f2(CX + hR + 2)} ${f2(yR + 6)}L${f2(CX + hR + 12)} ${f2(yR - 26)}" stroke="#7d8692" stroke-width="7" stroke-linecap="round"/>
<path d="M${f2(CX - hR - 12)} ${f2(yR - 26)}Q${CX} ${f2(yR - 52)} ${f2(CX + hR + 12)} ${f2(yR - 26)}" fill="none" stroke="#9aa3ad" stroke-width="6" stroke-linecap="round"/>
<path d="${body}" fill="url(#bkMetal)" stroke="#11171d" stroke-width="2.5" stroke-linejoin="round"/>
<path d="${inner}" fill="url(#bkGlass)"/>
${conc}
${ticks}
<path d="M${f2(CX - hB * .7)} ${f2(yB + hB * EY * .6)}L${f2(CX - hB * .55)} ${f2(yB + 24)}H${f2(CX + hB * .55)}L${f2(CX + hB * .7)} ${f2(yB + hB * EY * .6)}Z" fill="#59626d" stroke="#11171d" stroke-width="2"/>
<rect x="${f2(CX + hB * .55)}" y="${f2(yB + 12)}" width="30" height="6" rx="3" fill="#8a939e" stroke="#11171d"/>
<ellipse cx="${CX}" cy="${f2(yR)}" rx="${f2(hR + 6)}" ry="${f2((hR + 6) * EY)}" fill="none" stroke="url(#bkRimG)" stroke-width="7"/>
<ellipse cx="${CX}" cy="${f2(yR)}" rx="${f2(hR)}" ry="${f2(hR * EY)}" fill="#05090d" opacity=".55"/>
<path d="M${f2(CX - hR * .78)} ${f2(yR + 12)}Q${f2(CX - hR * .7)} ${f2((yR + yB) / 2)} ${f2(CX - hB * .6)} ${f2(yB - 8)}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".12"/>
<g transform="translate(286 22)"><rect x="-74" y="-17" width="148" height="34" rx="17" style="fill:color-mix(in srgb,var(--c2) 55%,#06100f)" stroke="rgba(255,255,255,.22)"/><text y="8" text-anchor="middle" font-size="21" font-weight="950" fill="#fff">${fmt(current)}<tspan font-size="13" font-weight="800" fill="#c9d4dc"> / ${fmt(cap)} m³</tspan></text></g>
</svg>`;
}
/* taczka i łyżka koparki — rysunki dla rozładunku „Taczka” i „Inne” */
function fillLayer(id, path, yTop, yBot, cap, current, model) {
  const f = cap > 0 ? model.fraction(Math.min(cap, Math.max(0, current))) : 0, y = yBot - (yBot - yTop) * f;
  return `<clipPath id="${id}"><path d="${path}"/></clipPath>
  <g clip-path="url(#${id})"><rect x="0" y="${y.toFixed(1)}" width="360" height="${(yBot - y + 4).toFixed(1)}" fill="url(#${id}g)"/><rect x="0" y="${y.toFixed(1)}" width="360" height="4" fill="#ffffff55"/></g>
  <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="color-mix(in srgb, var(--c1) 55%, #9aa6b2)"/><stop offset="1" stop-color="color-mix(in srgb, var(--c2) 70%, #3a4554)"/></linearGradient>`;
}
const valPill = (x, y, cur, cap) => `<g><rect x="${x - 62}" y="${y - 30}" width="124" height="56" rx="14" fill="#06101cdd" stroke="#ffffff22"/><text x="${x}" y="${y + 2}" text-anchor="middle" font-family="Inter,-apple-system,sans-serif" font-weight="900" font-size="30" fill="#fff">${fmt(cur)}</text><text x="${x}" y="${y + 20}" text-anchor="middle" font-family="Inter,-apple-system,sans-serif" font-weight="800" font-size="12.5" fill="var(--c1)">z ${fmt(cap)} m³</text></g>`;
function makeTaczkaSvg(cap, current, model) {
  const tray = 'M55 150 L305 150 L262 246 Q257 254 246 254 L122 254 Q111 254 106 246 Z';
  return `<svg viewBox="0 0 360 ${SVG_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="180" cy="304" rx="150" ry="9" fill="#0008"/>
  <path d="M14 206 L112 258 L282 262" fill="none" stroke="#5b6672" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10 204 L40 220" stroke="#1d2430" stroke-width="13" stroke-linecap="round"/>
  <path d="M122 258 L112 300 M112 300 h22" fill="none" stroke="#5b6672" stroke-width="8" stroke-linecap="round"/>
  <path d="${tray}" fill="#0b1426" fill-opacity=".88"/>
  ${fillLayer('tq', tray, 150, 254, cap, current, model)}
  <path d="${tray}" fill="none" stroke="var(--c1)" stroke-width="5" stroke-linejoin="round"/>
  <path d="M49 150 H311" stroke="color-mix(in srgb, var(--c1) 60%, #fff)" stroke-width="9" stroke-linecap="round"/>
  <path d="M262 246 L286 262" stroke="#5b6672" stroke-width="8" stroke-linecap="round"/>
  <circle cx="286" cy="262" r="32" fill="#141a22" stroke="#2b3340" stroke-width="5"/><circle cx="286" cy="262" r="21" fill="none" stroke="#3a4554" stroke-width="3" stroke-dasharray="6 5"/><circle cx="286" cy="262" r="8" fill="#9aa6b2"/>
  ${valPill(180, 205, current, cap)}
</svg>`;
}
function makeKoparkaSvg(cap, current, model) {
  const b = 'M72 100 H292 C322 150 304 226 228 254 L100 256 Q74 256 72 232 Z';
  cap = Math.max(0.01, Number(cap) || .5); const cur = Math.min(cap * 1.1, Math.max(0, Number(current) || 0));
  const yOf = v => 256 - 156 * (model?.fraction ? model.fraction(v) : v / cap), xIn = y => 76 + (256 - y) * .02; // lewa ścianka łyżki
  let marks = '', lastY = 1e9;
  bucketMarks(cap).slice().reverse().forEach((v, ri, arr) => {
    const last = ri === 0, y = yOf(v), hit = !last && cur >= v - 1e-6, col = last ? '#ff4d5e' : hit ? 'var(--c1)' : '#9aa6b2', x = xIn(y);
    marks += `<line x1="${x + 4}" y1="${y}" x2="${x + 46}" y2="${y}" style="stroke:${col}" stroke-width="${last ? 3 : 2.2}" ${last ? '' : 'stroke-dasharray="4 5"'}/><circle cx="${x + 18}" cy="${y}" r="${last ? 7 : 5.5}" style="fill:${col}" stroke="#0b1426" stroke-width="2"/>`;
    if (!last && Math.abs(lastY - y) < 26) return; lastY = y;
    const t = (last ? 'MAX ' : '') + fmt(v), w = t.length * 10 + 16;
    marks += `<rect x="${x + 52}" y="${y - 12}" width="${w}" height="24" rx="8" fill="#0b1426" fill-opacity=".85" style="stroke:${col}" stroke-width="1.5"/><text x="${x + 52 + w / 2}" y="${y + 5.5}" text-anchor="middle" font-size="15" font-weight="900" style="fill:${col}">${t}</text>`;
  });
  return `<svg viewBox="40 4 318 296" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="185" cy="300" rx="140" ry="9" fill="#0008"/>
  <path d="M292 100 L352 6" stroke="#ffb703" stroke-width="30" stroke-linecap="round"/><path d="M292 100 L352 6" stroke="#0004" stroke-width="30" stroke-dasharray="2 22"/>
  <path d="M250 98 L318 30" stroke="#5b6672" stroke-width="12" stroke-linecap="round"/><path d="M262 86 L300 48" stroke="#cfd8e0" stroke-width="5" stroke-linecap="round"/>
  <path d="${b}" fill="#0b1426" fill-opacity=".88"/>
  ${fillLayer('kq', b, 100, 256, cap, current, model)}
  <path d="${b}" fill="none" stroke="var(--c1)" stroke-width="5" stroke-linejoin="round"/>
  <path d="M66 100 H298" stroke="color-mix(in srgb, var(--c1) 60%, #fff)" stroke-width="9" stroke-linecap="round"/>
  <g fill="#cfd8e0" stroke="#5b6672" stroke-width="2" stroke-linejoin="round"><path d="M74 214 L44 226 L72 232 Z"/><path d="M76 234 L48 250 L80 252 Z"/><path d="M92 254 L70 270 L104 256 Z"/></g>
  <circle cx="292" cy="100" r="13" fill="#2b3340" stroke="#9aa6b2" stroke-width="4"/><circle cx="250" cy="100" r="10" fill="#2b3340" stroke="#9aa6b2" stroke-width="4"/>
  ${marks}
  ${valPill(214, 226, current, cap)}
</svg>`;
}
function makeBucketSvgHud(cap, current, model) {
  cap = Math.max(0.01, Number(cap) || .5); current = Math.min(cap, Math.max(0, Number(current) || 0));
  const CX = 132, HALF = 100, N = 36, fullH = model.fullHeightCm || 1, rimF = Math.min(1.14, (model.totalHeightCm || fullH) / fullH);
  const yOf = f => SVG_BOTTOM - (SVG_BOTTOM - SVG_TOP) * f, dAt = f => model.diamAt(f * fullH), f2 = n => n.toFixed(1);
  let dmax = 0; for (let i = 0; i <= N; i++) dmax = Math.max(dmax, dAt(i / N * rimF));
  const half = f => Math.max(14, HALF * dAt(f) / (dmax || 1));
  const L = [], R = []; for (let i = 0; i <= N; i++) { const f = rimF * i / N, y = f2(yOf(f)), h = half(f); L.push(`${f2(CX - h)} ${y}`); R.unshift(`${f2(CX + h)} ${y}`) }
  const body = 'M' + L.join('L') + 'L' + R.join('L') + 'Z';
  const yR = yOf(rimF), hR = half(rimF), yB = yOf(0), hB = half(0), fr = v => model.fraction(v), yC = yOf(fr(current));
  const marks = bucketMarks(cap); let left = '', right = '', lastY = 1e9;
  marks.slice().reverse().forEach((v, ri) => {
    const i = marks.length - 1 - ri, y = yOf(fr(v)), hw = half(fr(v)), last = i === marks.length - 1, hit = !last && current >= v - 1e-6;
    const col = last ? '#ff4d5e' : hit ? 'var(--c1)' : '#7f8c99';
    left += `<line x1="${f2(CX - hw + 6)}" y1="${f2(y)}" x2="${f2(CX - hw + 36)}" y2="${f2(y)}" style="stroke:${col}" stroke-width="${last ? 2.5 : 2}" ${last ? '' : 'stroke-dasharray="3 4"'}/><circle cx="${f2(CX - hw + 22)}" cy="${f2(y)}" r="3.5" style="fill:${col}"/>`;
    if (!last && Math.abs(lastY - y) < 30) return; lastY = y;
    const txt = (last ? '⚠ MAX ' : '● ') + fmt(v), w = txt.length * 9 + 22, x0 = 246;
    right += `<g transform="translate(${x0} ${f2(y - 14)})"><rect width="${w}" height="28" rx="8" style="fill:${last ? 'rgba(255,77,94,.22)' : hit ? 'color-mix(in srgb,var(--c1) 18%,#071018)' : 'rgba(18,26,34,.9)'};stroke:${last ? '#ff4d5e' : hit ? 'var(--c1)' : 'rgba(255,255,255,.18)'}"/><text x="${w / 2}" y="19" text-anchor="middle" font-size="14" font-weight="850" style="fill:${last ? '#ffd0d5' : hit ? 'var(--c1)' : '#cfd6dd'}">${txt}</text></g>`;
  });
  const cardY = Math.min(yB - 70, Math.max(yR + 50, (yR + yB) / 2 - 32));
  return `<svg viewBox="0 0 360 ${SVG_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
 <linearGradient id="hdBody" x1="0" x2="1"><stop offset="0" stop-color="#121a23"/><stop offset=".5" stop-color="#2a3542"/><stop offset="1" stop-color="#101820"/></linearGradient>
 <linearGradient id="hdLiq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c1)" stop-opacity=".95"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--c1) 45%,#04121a)" stop-opacity=".95"/></linearGradient>
 <linearGradient id="hdShine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="hdGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <clipPath id="hdClip"><path d="${body}"/></clipPath>
</defs>
<rect x="${f2(CX - 26)}" y="${f2(yR - 42)}" width="52" height="16" rx="3" fill="#3b4756" stroke="#5c6b7c"/>
<path d="M${f2(CX - hR * .55)} ${f2(yR - 26)}H${f2(CX + hR * .55)}L${f2(CX + hR * .62)} ${f2(yR - 6)}H${f2(CX - hR * .62)}Z" fill="#232d39" stroke="#5c6b7c" stroke-width="1.5"/>
<path d="M${f2(CX - hR - 10)} ${f2(yR - 6)}H${f2(CX + hR + 10)}L${f2(CX + hR)} ${f2(yR + 4)}H${f2(CX - hR)}Z" fill="#2f3a47" stroke="#6b7a8b" stroke-width="1.5"/>
<path d="${body}" fill="url(#hdBody)" stroke="#55657a" stroke-width="2"/>
<g clip-path="url(#hdClip)">
 <rect x="0" y="${f2(yC)}" width="280" height="${f2(yB - yC + 6)}" fill="url(#hdLiq)"/>
 <rect x="${f2(CX - hR)}" y="${f2(yR)}" width="${f2(hR * 2)}" height="${f2(yB - yR)}" fill="url(#hdShine)"/>
 ${current > 0 ? `<line x1="0" y1="${f2(yC)}" x2="280" y2="${f2(yC)}" style="stroke:var(--c1)" stroke-width="10" opacity=".22"/><line x1="0" y1="${f2(yC)}" x2="280" y2="${f2(yC)}" style="stroke:var(--c1)" stroke-width="3"/>` : ''}
</g>
<path d="M${f2(CX - hB)} ${f2(yB)}H${f2(CX + hB)}L${f2(CX + hB * .8)} ${f2(yB + 16)}H${f2(CX - hB * .8)}Z" fill="#1b2430" stroke="#5c6b7c" stroke-width="1.5"/>
<path d="M${f2(CX - hB * .8)} ${f2(yB + 20)}H${f2(CX + hB * .8)}L${f2(CX + hB * .65)} ${f2(yB + 34)}H${f2(CX - hB * .65)}Z" fill="#1b2430" stroke="#5c6b7c" stroke-width="1.5"/>
${left}${right}
<g transform="translate(${CX} ${f2(cardY)})"><rect x="-64" y="0" width="128" height="68" rx="12" fill="rgba(6,10,14,.82)" stroke="rgba(255,255,255,.14)"/><text y="38" text-anchor="middle" font-size="34" font-weight="950" fill="#fff">${fmt(current)}</text><text y="58" text-anchor="middle" font-size="13" font-weight="800" style="fill:var(--c1)">z ${fmt(cap)} m³</text></g>
</svg>`;
}
function renderHudPanel(s) {
  const cap = Number(s.capacity || .5), dose = Number(s.dose || 0), pct = Math.round(dose / cap * 100);
  $('hudState').textContent = dose <= 0 ? 'Pusty' : pct < 35 ? 'Niski' : pct < 92 ? 'Optymalny' : 'Pełny';
  $('hudPct').textContent = pct + '%'; $('hudVal').textContent = fmt(dose) + ' m³';
  const r = $('hudRange'); r.max = String(Math.round(doseMax(cap) * 100) / 100); r.step = '0.01'; if (document.activeElement !== r) r.value = String(dose);
  r.style.setProperty('--p', Math.min(100, dose / cap * 100) + '%');
  const marks = bucketMarks(cap), pick = [0, ...marks.slice(0, -1).filter((_, i, a) => a.length <= 2 || i === Math.floor(a.length / 3) || i === Math.floor(a.length * 2 / 3)), cap];
  const hq = $('hudQuick'), hk = String(cap);
  if (hq.dataset.k !== hk) { hq.dataset.k = hk; hq.replaceChildren(...[...new Set(pick)].map(v => el('button', { type: 'button', class: v === cap ? 'max' : '', 'data-v': String(v), text: v === cap ? 'MAX' : fmt(v), onclick: () => changeDose(v, true) }))) }
  for (const b of hq.children) b.classList.toggle('on', Math.abs(Number(b.dataset.v) - dose) < 1e-4);
  $('hudOnline').textContent = '● ' + (phase === 'away' ? 'Kosz w drodze' : phase === 'late' ? 'Kosz się spóźnia' : 'Gotowy');
}
$('hudRange').addEventListener('input', () => { if (session) { session.dose = Math.min(doseMax(session.capacity), Number($('hudRange').value)); renderLevelSoon() } });
$('hudRange').addEventListener('change', () => { if (session) changeDose(Number($('hudRange').value), true) });
/** kosz: suwak z boku pokazuje ostatni kurs bieżącej gruszki */
const koszLast = s => { const cur = trucksOf(s).at(-1); return s.entries.length > cur.start && !cur.closed ? s.entries.at(-1) : null };
function renderSlider(model) {
  const s = session, cap = Number(s.capacity || .5), dose = s.method === 'kibel' ? cap * (s.nextPct ?? 100) / 100 : Number(s.dose || 0); // kosz: suwak = ile pójdzie w NASTĘPNY kurs (zostaje, aż zmienisz)
  $('vslider').classList.toggle('locked', !!settings.sliderLock); $('vsLock').textContent = settings.sliderLock ? '🔒' : '🔓';
  const pct = v => (slPos(model, v, cap) * 100).toFixed(2) + '%', mx = Math.round(doseMax(cap) * 100) / 100;
  $('vsFill').style.height = pct(dose); $('vslider').classList.toggle('over', dose > cap + 1e-4);
  $('vsThumb').style.bottom = pct(dose);
  $('vsValue').textContent = fmt(dose);
  const ticks = $('vsTicks'), tk = cap + '|' + model.fraction(cap / 2).toFixed(4) + '|o';
  if (ticks.dataset.k === tk) { for (const t of ticks.querySelectorAll('.vs-tick.major')) t.classList.toggle('near', Math.abs(model.fraction(Number(t.dataset.v)) - model.fraction(dose)) < .15) }
  else { ticks.dataset.k = tk; ticks.replaceChildren();
  const marks = bucketMarks(cap), minor = cap <= 1 ? .05 : .1;
  for (let v = minor; v < cap - 1e-6; v += minor) { if (marks.some(m => Math.abs(m - v) < 1e-4)) continue; const t = el('span', { class: 'vs-tick minor' }); t.style.bottom = pct(v); ticks.append(t) }
  { const t = el('span', { class: 'vs-tick major over-tick', text: fmt(mx), 'data-v': String(mx) }); t.style.bottom = pct(mx); ticks.append(t) }
  for (const v of marks) { const near = Math.abs(model.fraction(v) - model.fraction(dose)) < .15; const t = el('span', { class: 'vs-tick major' + (near ? ' near' : '') + (v >= cap - 1e-6 ? ' max' : ''), text: fmt(v), 'data-v': String(v) }); t.style.bottom = pct(v); ticks.append(t) } }
  const vs = $('vslider'); vs.setAttribute('aria-valuemax', String(mx)); vs.setAttribute('aria-valuenow', String(dose)); vs.setAttribute('aria-valuetext', fmt(dose) + ' m³');
}
(function sliderInput() {
  const vs = $('vslider'); let dragging = false, dirty = false;
  let rect = null; const fromY = y => { if (!session) return; const r = rect || vs.querySelector('.vs-track').getBoundingClientRect(); const f = (r.bottom - y) / r.height; const model = currentModel(); const v = Math.max(0, Math.round(slVal(model, f, Number(session.capacity)) * 100) / 100);
    if (session.method === 'kibel') { const cap = Number(session.capacity) || .5, pct = Math.max(0, Math.min(110, Math.round(v / cap * 100))); if (pct === kPct) return; kPct = pct; session.nextPct = pct; render(); dirty = true; return }
    if (v === session.dose) return; session.dose = v; renderLevelSoon(); dirty = true };
  let kPct = -1;
  $('vsLock').addEventListener('pointerdown', e => e.stopPropagation());
  $('vsLock').addEventListener('click', e => { e.stopPropagation(); settings.sliderLock = !settings.sliderLock; saveSettings(); renderLevelSoon(); announce(settings.sliderLock ? '🔒 Suwak zablokowany' : '🔓 Suwak odblokowany'); buzz?.('light') });
  vs.addEventListener('pointerdown', e => { if (settings.sliderLock) { announce('🔒 Suwak zablokowany — dotknij kłódki, żeby odblokować'); return } kPct = -1; rect = vs.querySelector('.vs-track').getBoundingClientRect(); dragging = true; vs.classList.add('drag'); vs.setPointerCapture(e.pointerId); fromY(e.clientY); e.preventDefault() });
  vs.addEventListener('pointermove', e => { if (dragging) fromY(e.clientY) });
  const end = () => { dragging = false; rect = null; vs.classList.remove('drag'); if (dirty && session) { dirty = false; if (session.method === 'kibel') { { remember(); announce('Następne kursy: ' + kPct + '% = ' + fmt(Math.round(Number(session.capacity) * kPct) / 100) + ' m³') } } else changeDose(session.dose, true) } }; vs.addEventListener('pointerup', end); vs.addEventListener('pointercancel', end);
  vs.addEventListener('keydown', e => { if (!session || settings.sliderLock || session.method === 'kibel') return; const st = bucketStep(session.capacity); if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { changeDose(Math.min(doseMax(session.capacity), session.dose + st), true); e.preventDefault() } if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { changeDose(Math.max(0, session.dose - st), true); e.preventDefault() } });
})();

let renderQ = 0, levelQ = 0, svgKey = '';
/* lekki render tylko poziomu (suwak, rysunek kosza) — przy przeciąganiu nie przebudowuje całego ekranu */
function renderLevel(model) {
  const s = session; if (!s) return; model = model || currentModel();
  const shown = Number(s.dose ?? 0); // kosz: rysunek = to samo co suwak (następny kurs)
  const key = [s.method, settings.ui, s.capacity, shown, s.bucketProfile?.id || s.bucketProfile?.name || ''].join('|');
  if (key !== svgKey) { svgKey = key; requestAnimationFrame(ohCrop); $('bucketSvgWrap').innerHTML = s.method === 'taczka' ? makeTaczkaSvg(s.capacity, shown, model) : s.method === 'inne' ? makeKoparkaSvg(s.capacity, shown, model) : ['hud', 'glass', 'tactical', 'terminal'].includes(settings.ui) ? makeBucketSvgHud(s.capacity, shown, model) : makeBucketSvg(s.capacity, shown, model); }
  $('dose').textContent = fmt(shown || 0);
  $('ohDose').textContent = fmt(shown || 0);
  $('levelHint').textContent = model.measured && shown > 0 ? (Math.round(model.belowRimCm(shown)) < 2 ? '· do krawędzi' : '· ok. ' + Math.round(model.belowRimCm(shown)) + ' cm pod krawędzią') : '';
  renderSlider(model); renderHudPanel(s);
}
/** tryb jednej ręki: przytnij rysunek do samego kosza (bez etykiet z boku) — kosz robi się większy */
function ohCrop() {
  const sv = $('bucketSvgWrap').querySelector('svg'); if (!sv) return;
  if (!sv.dataset.vb) sv.dataset.vb = sv.getAttribute('viewBox') || '';
  if (!settings.oneHand) { if (sv.dataset.vb) sv.setAttribute('viewBox', sv.dataset.vb); return }
  const vb = sv.dataset.vb.split(/[ ,]+/).map(Number); if (vb.length !== 4) return;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; const labels = [];
  for (const c of sv.children) {
    const tag = c.tagName.toLowerCase(); if (tag === 'defs' || tag === 'style' || tag === 'title') continue;
    if (tag === 'g' && c.querySelector('text')) { labels.push(c); continue }
    if (tag !== 'path' && tag !== 'ellipse' && tag !== 'polygon') continue; // tylko bryła kosza
    let b; try { b = c.getBBox() } catch (e) { continue } if (!b || !(b.width > 0 && b.height > 0)) continue;
    if (b.width >= vb[2] * .97 && b.height >= vb[3] * .97) continue; // tło
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  }
  for (const g of labels) { let b; try { b = g.getBBox() } catch (e) { continue } const m = g.transform?.baseVal?.consolidate?.()?.matrix; if (m) b = { x: b.x + m.e, y: b.y + m.f, width: b.width, height: b.height }; g.style.display = ''; const cx = b.x + b.width / 2; if (cx < x0 || cx > x1 || b.x + b.width > x1 + 4 || b.x < x0 - 4) g.style.display = 'none' } // etykiety z boku chowamy
  if (!(x1 > x0 && y1 > y0)) return; const pd = 6; x0 = Math.max(vb[0], x0 - pd); y0 = Math.max(vb[1], y0 - pd); x1 = Math.min(vb[0] + vb[2], x1 + pd); y1 = Math.min(vb[1] + vb[3], y1 + pd);
  sv.setAttribute('viewBox', [x0, y0, x1 - x0, y1 - y0].map(v => Math.round(v * 10) / 10).join(' '));
}
function renderLevelSoon() { if (levelQ) return; levelQ = requestAnimationFrame(() => { levelQ = 0; renderLevel() }) }
function renderSoon() { if (renderQ) return; renderQ = requestAnimationFrame(() => { renderQ = 0; render() }) }
function render() {
  if (!session) return; const s = session; if (!s.capacity) s.capacity = s.dose || .5;
  const kosz = s.method === 'kibel'; document.body.classList.toggle('m-kosz', kosz); if (kosz) { s.dose = Math.round(Number(s.capacity) * (s.nextPct ?? 100) * 10) / 1000; kursRender() }
  const model = currentModel();
  $('siteName').textContent = s.site; $('modeLabel').textContent = { kibel: 'KOSZ', taczka: 'TACZKA', inne: 'INNE' }[s.method]; document.querySelectorAll('[data-wm]').forEach(b => b.classList.toggle('on', b.dataset.wm === s.method));
  $('loaded').textContent = fmt(s.load); $('poured').textContent = fmt(entriesSum()); { const over = Math.round((entriesSum() - s.load) * 100) / 100; $('left').textContent = over > 0.009 ? '+' + fmt(over) : fmt(left()); $('leftLbl').textContent = over > 0.009 ? 'ponad gruszkę' : 'Zostało m³'; $('left').classList.toggle('over', over > 0.009) }
  { const bp = bucketPlan(), [a, b, c] = unitWords(s.method); $('kSent').textContent = bp.sent; $('kSentL').textContent = 'wysłano ' + plural(bp.sent, a, b, c);
    $('kLeft').textContent = bp.total; $('kLeftL').textContent = 'zostało ' + plural(bp.total, a, b, c); $('kLast').textContent = bp.last ? fmt(bp.last) + ' m³' : bp.total ? 'pełny' : '—';
    $('ohK').textContent = bp.sent + ' ' + plural(bp.sent, a, b, c) + ' za nami · zostało ' + bucketPlanText(bp) }
  $('progress').style.width = Math.min(100, 100 * entriesSum() / s.load) + '%';
  $('dose').textContent = fmt(s.dose || 0); $('bucketCap').textContent = fmt(s.capacity);
  $('levelHint').textContent = model.measured && s.dose > 0 ? (Math.round(model.belowRimCm(s.dose)) < 2 ? '· do krawędzi' : '· ok. ' + Math.round(model.belowRimCm(s.dose)) + ' cm pod krawędzią') : '';
  $('less').textContent = '− ' + fmt(bucketStep(s.capacity)); $('more').textContent = '+ ' + fmt(bucketStep(s.capacity));
  $('vslider').classList.toggle('m-taczka', s.method === 'taczka'); $('vslider').classList.toggle('m-inne', s.method === 'inne');
  renderLevel(model);
  $('travelPanel').classList.toggle('hide', s.method === 'taczka'); $('alert').classList.toggle('hide', !alarmVisible); document.body.classList.toggle('alarm-on', !!alarmVisible); if (!alarmVisible) alarmSince = 0;
  $('touchText').textContent = s.method === 'kibel' ? (settings.holdAdd ? 'PRZYTRZYMAJ KOSZ = KURS · NIEPEŁNY? POPRAW NIŻEJ' : 'DOTKNIJ KOSZA = KURS · NIEPEŁNY? POPRAW NIŻEJ') : (settings.holdAdd ? (settings.tapLevel ? 'DOTKNIJ = POZIOM BETONU · ' : 'POZIOM = SUWAK Z BOKU · ') + 'PRZYTRZYMAJ = DODAJ ' + ({ taczka: 'TACZKĘ', inne: 'ŁYŻKĘ' }[s.method] || 'KOSZ') : '') || (s.method === 'taczka' ? 'DOTKNIJ TACZKI, ŻEBY DODAĆ · SUWAK = ILE WLANO' : s.method === 'inne' ? 'DOTKNIJ ŁYŻKI, ŻEBY DODAĆ · SUWAK = ILE WLANO' : 'DOTKNIJ KOSZA, ŻEBY DODAĆ · SUWAK = ILE WLANO');
  $('ohLeft').textContent = fmt(left()); $('ohPoured').textContent = fmt(entriesSum()) + ' z ' + fmt(s.load) + ' m³';
  $('ohTrip').classList.toggle('hide', s.method === 'taczka'); $('ohTrip').textContent = phase === 'away' || phase === 'late' ? '✓ Kosz jest' : '▶ Wyjechał'; $('ohTrip').classList.toggle('good', phase === 'away' || phase === 'late');
  $('bucket').setAttribute('aria-label', 'Dodaj ' + fmt(s.dose) + ' m³');
  const ab = $('activeBucket'); ab.replaceChildren();
  const cur = s.bucketProfile; ab.classList.toggle('hide', !cur);
  if (cur) ab.append(el('div', { class: 'ab-info' }, el('strong', { text: '📐 ' + cur.name + ' · ' + fmt(s.capacity) + ' m³' }), el('small', { text: model.measured ? 'dokładna podziałka z pomiaru' : ({ taczka: 'zapisana taczka', inne: 'zapisana łyżka' }[s.method] || 'zapisany kosz') })));
  const q = $('quick'); q.replaceChildren(); q.classList.remove('hide');
  for (const v of opts[s.method] || []) q.append(el('button', { type: 'button', class: 'pill' + (!cur && Math.abs(v - s.capacity) < 1e-4 ? ' on' : ''), text: fmt(v) + ' m³', onclick: () => { customOpen = false; changeCapacity(v, null) } }));
  const isCustom = !cur && !(opts[s.method] || []).some(v => Math.abs(v - s.capacity) < 1e-4);
  q.append(el('button', { type: 'button', class: 'pill' + (isCustom || customOpen ? ' on' : ''), text: isCustom ? '✏️ ' + fmt(s.capacity) + ' m³' : '✏️ Inna', onclick: () => { customOpen = !customOpen; pioOpen = false; render(); if (customOpen) setTimeout(() => $('customCap')?.focus(), 30) } }));
  // 🔄 przekładka: w trakcie lania zmiana kosza (np. 0,5 → 0,75) — kursy, które poszły, zostają jak były
  if (s.method !== 'taczka') { const host = s.method === 'kibel' ? ab : q; if (s.method === 'kibel' && cur) ab.classList.remove('hide'); host.append(el('button', { type: 'button', class: 'pill swap-pill', text: '🔄 Przekładka — zmień ' + (s.method === 'inne' ? 'łyżkę' : 'kosz'), onclick: () => { method = s.method; tab('pickBucket') } })) }
  // 🌀 pojemność z piór — w trybie kosza siedzi pod nazwą kosza (szybkie pigułki są tam schowane)
  const pioT = s.method === 'kibel' ? ab : q;
  if (s.method === 'kibel' && !cur) { ab.classList.remove('hide'); ab.append(el('div', { class: 'ab-info' }, el('strong', { text: '📐 Kosz · ' + fmt(s.capacity) + ' m³' }))) }
  if (s.method !== 'taczka') pioT.append(el('button', { type: 'button', class: 'pill pio-pill' + (pioOpen ? ' on' : ''), text: s.method === 'kibel' ? '🌀 Policz kosz z piór' : '🌀 Z piór', onclick: () => { pioOpen = !pioOpen; customOpen = false; render(); if (pioOpen) setTimeout(() => $('pioCap')?.focus(), 30) } }));
  if (pioOpen && s.method !== 'taczka') {
    const inp = el('input', { id: 'pioCap', inputmode: 'decimal', placeholder: 'ile piór, np. 3,5', style: 'margin:0' }), out = el('small', { class: 'pio-cap-out', text: '1 pióro = ' + fmt3(pioroM3()) + ' m³ · policz pióra przy pierwszym koszu' });
    const calc = () => { const n = number(inp.value); return n > 0 ? Math.round(n * pioroM3() * 1000) / 1000 : 0 };
    inp.addEventListener('input', () => { const v = calc(); out.textContent = v > 0 ? fmt(number(inp.value)) + ' pióra × ' + fmt3(pioroM3()) + ' = ' + fmt3(v) + ' m³' : '1 pióro = ' + fmt3(pioroM3()) + ' m³ · policz pióra przy pierwszym koszu' });
    const ok = () => { const v = calc(); if (!(v > 0.01 && v <= 5)) return announce('Wpisz ile piór weszło do kosza'); pioOpen = false; jlog('kosz z piór: ' + inp.value + ' pióra = ' + fmt3(v) + ' m³'); changeCapacity(v, null) };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok() });
    pioT.append(el('div', { class: 'row custom-row' }, inp, el('button', { type: 'button', class: 'primary', text: 'Ustaw', onclick: ok })), out);
  }
  if (customOpen) {
    const inp = el('input', { id: 'customCap', inputmode: 'decimal', placeholder: 'np. 0,8', style: 'margin:0' });
    const ok = () => { const v = number(inp.value); if (!(v > 0 && v <= 5)) return announce('Wpisz od 0,01 do 5 m³'); customOpen = false; changeCapacity(v, null) };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok() });
    q.append(el('div', { class: 'row custom-row' }, inp, el('button', { type: 'button', class: 'primary', text: 'Ustaw', onclick: ok })));
  }
  const KW = s.method === 'inne' ? ['Łyżka', 'łyżki'] : ['Kosz', 'kosza']; $('status').textContent = s.method === 'taczka' ? 'Taczka' : phase === 'away' ? KW[0] + ' w drodze' : phase === 'late' ? KW[0] + (s.method === 'inne' ? ' się spóźnia' : ' się spóźnia') : phase === 'returned' ? (s.method === 'inne' ? 'Łyżka wróciła — ustaw ile wlano i dotknij łyżki' : 'Kosz wrócił — ustaw ile wlano i dotknij kosza') : 'Gotowy';
  cmdRender(s.method);
  $('ohDoseW').textContent = { taczka: 'w taczce', inne: 'w łyżce' }[s.method] || 'w koszu';
  $('quickCapsLabel').textContent = 'Pojemność ' + ({ taczka: 'taczki', inne: 'łyżki' }[s.method] || 'kosza');
  $('entries').innerHTML = s.entries.length ? s.entries.slice().reverse().map(e => '<div class="history-entry"><span>' + new Date(e.at).toLocaleTimeString('pl-PL') + '</span><strong>+' + fmt(e.amount) + ' m³</strong></div>').join('') : '<div class="help">Brak dolewek</div>';
}
function tick() {
  if (nightOn) nightRender();
  if (!session) return; const s = session, now = Date.now(), avg = meanTrip();
  if (currentTab === 'work' && !document.hidden) {
  $('elapsed').textContent = dur((now - s.startedAt) / 1000);
  $('avg').textContent = s.method === 'taczka' ? '—' : s.trips?.length ? shortDur(avg) : '—';
  $('timer').textContent = s.method === 'taczka' ? '—' : (phase === 'away' || phase === 'late') ? shortDur((deadline - now) / 1000) : '—';
  const rem = left(), count = rem > 0 ? Math.ceil(rem / Math.max(.01, s.dose || s.capacity || .5)) : 0;
  const secs = count === 0 ? 0 : (phase === 'away' && deadline > now ? (deadline - now) / 1000 : avg) + (count - 1) * avg;
  $('eta').textContent = rem === 0 ? 'Zrobione' : new Date(now + secs * 1000).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
  if (alarmVisible) { const t = Math.floor((Date.now() - (alarmSince || Date.now())) / 1000); $('alertLate').textContent = t > 2 ? 'Pytam od ' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') + ' — zaznacz, żeby licznik się zgadzał' : 'Zaznacz, czy kosz wrócił' }
  if (settings.chatty !== false && !document.hidden) {
    if (phase === 'away' && departed && s.trips?.length >= 3 && !s.slowSaid && now - departed > avg * 1600 && now < deadline) { s.slowSaid = true; sayBot('slowTrip') }
    const lastE = s.entries.at(-1)?.at || s.startedAt;
    if (s.entries.length && phase !== 'away' && phase !== 'late' && now - lastE > 600000 && s.idleSaidFor !== lastE) { s.idleSaidFor = lastE; sayBot('idle') }
  }
  if (document.hidden && nativeVoice) return; // w tle pytaniami zajmuje się moduł natywny
  if (s.method !== 'taczka' && phase === 'away' && deadline && now >= deadline) triggerAlarm();
  else if (s.method !== 'taczka' && phase === 'late' && now >= nextReminder) { remindN++; const rc = remindCfg(); if (remindN > rc.max) { if (remindN === rc.max + 1) jlog('limit przypomnień (' + rc.max + ') — dalej cisza. „Często” = pyta do skutku', true); nextReminder = now + 36e5; deadline = nextReminder; remember(); render(); return } alarmVisible = true; nextReminder = now + remindGap(); deadline = nextReminder; remember(); render(); alarmKick('remind') }
}

// ───────────────────────── komendy głosowe ─────────────────────────
const COMMANDS = [['„Dodaj kosz” · „Zalane” · „Kolejny”', 'nalicza kosz'], ['„Wlano 0,7” · „Dodaj 0,3”', 'nalicza podaną ilość'], ['„Cofnij” · „Pomyłka”', 'cofa ostatni'], ['„Kosz wyjechał” · „Jazda”', 'start kursu'], ['„Tak” · „Jest” · „Mamy”', 'kosz wrócił'], ['„Nie ma” · „Jeszcze jedzie”', 'pytanie za 30 s'], ['„Ile zostało?” · „Ile jeszcze?”', 'pozostałe m³'], ['„Ile wylano?” · „Licznik”', 'naliczone m³'], ['„Ile czasu?”', 'czas betonowania'], ['„Kosz 0,75”', 'zmienia pojemność'], ['„Lej 0,35”', 'ile wlać do kosza'], ['„Pełny kosz” / „Pół kosza”', 'szybka ilość'], ['„Nie, pół” · „Miało być trzy czwarte” · „Jednak pełny”', 'poprawia ostatni kurs (zaraz po kursie wystarczy „pół”)'], ['„Dodaj dwa kosze” · „Trzy taczki”', 'kilka kursów naraz'], ['„Dodałem dwa razy” · „Zapomniałem dodać”', 'cofa / dodaje jeden'], ['„Zapytaj za 2 minuty”', 'przesuwa pytanie o kosz'], ['„Słyszysz mnie?”', 'mówi jak głośno i wyraźnie słyszy'], ['„Cisza” · „Gadaj” · „Powtórz”', 'wycisza / włącza / powtarza lektorkę'], ['„Jaki kosz?” · „Kiedy koniec?” · „Średni kurs”', 'pojemność, godzina końca, czas kursu'], ['„Fajrant” · „Entladung”', 'kończy betonowanie / odhacza OFEO'], ['„Cześć” · „Jak się masz?” · „Opowiedz kawał” · „Dzięki”', 'pogadanki']];
let cmdMode = '';
function cmdRender(m) {
  if (m === cmdMode) return; cmdMode = m;
  const W = m === 'taczka' ? { Kosz: 'Taczka', kosz: 'taczka', kosza: 'taczki', koszu: 'taczce', Dodaj_kosz: 'Dodaj taczkę', Pelny: '„Pełna taczka” / „Pół taczki”', wrocil: 'taczka wróciła', wyjechal: 'Taczka pojechała' } : m === 'inne' ? { Kosz: 'Łyżka', kosz: 'łyżka', kosza: 'łyżki', koszu: 'łyżce', Dodaj_kosz: 'Dodaj łyżkę', Pelny: '„Pełna łyżka” / „Pół łyżki”', wrocil: 'łyżka wróciła', wyjechal: 'Łyżka pojechała' } : null;
  const fix = t => !W ? t : t.replace('„Dodaj kosz”', '„' + W.Dodaj_kosz + '”').replace('„Pełny kosz” / „Pół kosza”', W.Pelny).replace('kosz wrócił', W.wrocil).replace('nalicza kosz', 'nalicza ' + (W.kosz === 'taczka' ? 'taczkę' : 'łyżkę')).replace('„Kosz wyjechał”', '„' + W.wyjechal + '”').replace('„Kosz 0,75”', '„' + W.Kosz + ' 0,1”').replace(/do kosza/g, 'do ' + W.kosza).replace(/\bkosz\b/g, W.kosz);
  $('cmdList').replaceChildren(...COMMANDS.filter(([a]) => !(W && a.includes('Lej'))).flatMap(([a, b]) => [el('span', { text: fix(a) }), el('small', { text: fix(b) })]));
  $('depart').textContent = '▶ ' + (m === 'taczka' ? 'Taczka pojechała' : m === 'inne' ? 'Łyżka pojechała' : 'Kosz wyjechał');
  $('returned').textContent = '✓ ' + (m === 'taczka' ? 'Taczka już jest' : m === 'inne' ? 'Łyżka już jest' : 'Kosz już jest');
}
cmdRender('kibel');
const WORD_FIX = [
  // bomba / bombka = kosz (gwara budowlana) + jak iPhone to przekręca
  [/\b(bomba|bombe|bomby|bombka|bombke|bombki|bombpke|bombpka|bompke|bompka|bonbe|bonbke|bomke|bomka|bombeczke|bombeczka)\b/g, 'kosz'], [/\b(dodaj|daj|dawaj|jeszcze) (babke|babka|bapke|pompke|pompe|pompka|bombo)\b/g, '$1 kosz'],
  // „dodaj kosz” jak go iPhone przekręca: sklejone, ucięte, niemieckie
  [/\b(dodajkosz|dodajkosza|dodajkosze|dodajkibel|dodajkubel)\b/g, 'dodaj kosz'], [/\b(eimer dazu|kubel dazu|noch ein eimer|noch einen eimer|noch ein kubel|eimer plus|plus eimer|eimer rein)\b/g, 'dodaj kosz'],
  [/\b(dodajesz|dodajze|do dach|do dag|do dai|to daj|toda j|podaj|odaj|odda j|o daj|do dania|do dodania|dodanie)\b(?= (kosz|kosza|kosze|kibel|kibla|kubel|jeden|go)\b|$)/g, 'dodaj'], [/(^|\s)(daj|dawaj|wrzuc|wpisz|zapisz|licz|policz) (kosz|kosza|kibel|kibla|kubel)\b/g, '$1dodaj kosz'],
  [/\bjeszcze (kosz|kibel|kubel|jeden kosz|jeden kibel)\b/g, 'kolejny'],
  [/\b(kos|kosc|kosza?k|kasz|kocz|gosz|koszt|kozz|kosch|kosik|koszyk)\b/g, 'kosz'], [/\b(kubel|kubelek|kibelek|kible|gibel|kiebel|kiebl|kibl|kebel)\b/g, 'kibel'], [/\b(toda|doda|dodac|dodal|dodam|dodajcie|dodajmy|do daj|dodej|dodaj?y)\b/g, 'dodaj'],
  [/\b(zalana|zalamy|salany|zalanyy|zalali|zalalem|zalalismy|zalales)\b/g, 'zalany'], [/\b(wyjechala|wyjechali|wyjechalo|wyjazd|odjazd|jedzie juz|poleciał|polecial|lec|lecimy|ruszaj|dawaj jazda|w droge)\b/g, 'wyjechal'],
  [/\b(cofnac|cofnijmy|cofam|cofaj|cofnie|zle|nie to|wroc to)\b/g, 'cofnij'], [/\b(nastepny|nastepna|nastepne|kolejna|kolejne|jeszcze jeden|jeszcze jedna|i jeszcze)\b(?! gruszk| samoch| taczk(?!a\b)| lyzk(?!a\b))/g, 'kolejny'],
  [/\b(mamy go|mam go|o jest|jest jest|dobra jest|juz wisi|wisi|stoi|na miejscu|przylecial|przyszedl|wrocil juz|jest juz|da ist|ist da|ist zuruck|wieder da|jest z powrotem|z powrotem|wrocila|wrocilo|przyjechala|dojechala|jest nasz|jest kochany|jest skurczybyk|jest cholera|kosz na dole|na dole)\b/g, 'jest'],
  [/\b(noch nicht|nicht da|kommt noch|jeszcze leci|jeszcze lata|leci jeszcze|jeszcze w powietrzu|jeszcze na gorze|daj mu chwile|zaraz bedzie)\b/g, 'jeszcze nie'],
  [/\b(nochmal|noch einer|noch eins|kubel voll|eimer voll|kibel full|full kosz|gefullt)\b/g, 'kolejny'],
  [/\b(abfahrt|ab geht|wywiozl|pojechala|pojechalo|leci w gore|do gory|w gore|jedziemy|start kursu|siup|sru)\b/g, 'wyjechal'],
  [/\b(zuruck|ruckgangig|loschen|falsch|nie ten|pomylilem|pomylilam|oj nie|kurde nie|kurwa nie|bez sensu|wywal to|skasuj to|anuluj to)\b/g, 'cofnij'],
  [/\b(wie viel noch|wieviel noch|ile reszty|ile tego jeszcze|ile nam zostalo|ile jeszcze zostalo|ile jeszcze w gruszce|ile w betonowozie|ile w bebnie)\b/g, 'ile zostalo']];
function normalise(t) { let r = normalise0(t); for (const [re, w] of WORD_FIX) r = r.replace(re, w); return r.replace(/\s+/g, ' ').trim() }
function normalise0(t) { return t.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d)\s*[,./\\]\s*(\d)/g, '$1.$2').replace(/\b0 (\d{1,2})\b/g, '0.$1').replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim() }
/* liczby mówione: „zero siedemdziesiąt pięć” = 0,75 · „jeden dwadzieścia pięć” = 1,25 · „czterdzieści pięć” = 0,45 · „siedem dziesiątych” = 0,7 */
const NUM_U = { zero: 0, jeden: 1, jedna: 1, jedno: 1, dwa: 2, dwie: 2, trzy: 3, cztery: 4, piec: 5, szesc: 6, siedem: 7, osiem: 8, dziewiec: 9 };
const NUM_T = { dziesiec: 10, jedenascie: 11, dwanascie: 12, trzynascie: 13, czternascie: 14, pietnascie: 15, szesnascie: 16, siedemnascie: 17, osiemnascie: 18, dziewietnascie: 19 };
const NUM_D = { dwadziescia: 20, trzydziesci: 30, czterdziesci: 40, piecdziesiat: 50, szescdziesiat: 60, siedemdziesiat: 70, osiemdziesiat: 80, dziewiecdziesiat: 90 };
function spokenNumber(t) {
  const m = t.match(/\b(\d+(?:\.\d{1,2})?)\b/); if (m) return Number(m[1]);
  if (/\b(jeden i pol|poltora)\b/.test(t)) return 1.5; if (/\b(dwa i pol)\b/.test(t)) return 2.5; if (/\b(trzy czwarte)\b/.test(t)) return .75; if (/\b(pol|polowa|poloweczka|polowke)\b/.test(t)) return .5; if (/\b(cwierc|cwiartka|cwiartke)\b/.test(t)) return .25;
  const chunks = []; let cur = null, sep = -1; // chunk = {v, s} (s = zapis cyfrowy)
  for (const w of t.split(/\s+/)) {
    if (w === 'przecinek' || w === 'i' && cur) { if (cur) { chunks.push(cur); cur = null } if (w === 'przecinek') sep = chunks.length; continue }
    if (w in NUM_D) { if (cur) chunks.push(cur); cur = { v: NUM_D[w], s: String(NUM_D[w]), open: true }; continue }
    if (w in NUM_T) { if (cur) chunks.push(cur); chunks.push({ v: NUM_T[w], s: String(NUM_T[w]) }); cur = null; continue }
    if (w in NUM_U) { if (cur && cur.open && NUM_U[w] > 0) { cur = { v: cur.v + NUM_U[w], s: String(cur.v + NUM_U[w]) }; chunks.push(cur); cur = null } else { if (cur) chunks.push(cur); cur = { v: NUM_U[w], s: String(NUM_U[w]) } } continue }
  }
  if (cur) chunks.push(cur);
  if (!chunks.length) return NaN;
  let v;
  if (chunks.length === 1) v = chunks[0].v;
  else { const cut = sep > 0 ? sep : 1; v = Number(chunks.slice(0, cut).map(c => c.s).join('') + '.' + chunks.slice(cut).map(c => c.s).join('')) }
  if (/\bsetn/.test(t)) v = v / 100; else if (/\bdziesiat(ych|e|a)\b/.test(t)) v = v / 10;
  return v;
}
/** ilość do kosza z mowy: 0,05–2 co 0,05; „siedem” = 0,7, „czterdzieści pięć” = 0,45 */
function amountFromSpeech(n) {
  if (!(n > 0)) return NaN;
  if (n > 2 && n < 10) n = n / 10; else if (n >= 10 && n < 100) n = n / 100; else if (n >= 100 && n <= 200) n = n / 100;
  n = Math.round(n * 20) / 20; return n >= .05 && n <= 2 ? n : NaN;
}
let reportAt = 0;
function report(key, value) { reportAt = Date.now(); const text = (pickVariant(key) || 'X').replace(/X/g, String(value)); announce(text); $('botText').textContent = text; if (settings.mode === 'full') speak(key + '_n', text) }
/* rozpoznany tekst → komenda; szum i pojedyncze słowa ignorujemy po cichu, „nie zrozumiałem” najwyżej co 20 s */
let lastErrAt = 0;
function heardText(t) {
  const n = normalise(t); if (n.length < 2) return;
  dlog('me', t);
  if (n.split(' ').length > 7) { const tail = t.trim().split(/\s+/).slice(-6).join(' '); if (command(tail) !== true) { micDisplay('Pominięto rozmowę: „' + t + '”'); return } micDisplay('✓ „' + tail + '”'); buzz('success'); if (settings.askOnly !== false) sayBot('heardOk'); return } // długa wypowiedź: komenda zwykle na końcu
  const r = command(t);
  if (r === true) { micDisplay('✓ „' + t + '”'); buzz('success'); if (settings.askOnly !== false && Date.now() - reportAt > 300 && Date.now() - lastBotAt > 400) sayBot('heardOk'); return }
  micDisplay(r === 'ignore' ? 'Pominięto (nie ma pytania o kosz): „' + t + '”' : 'Nie rozpoznano: „' + t + '”');
}
/* ═════ DIALOG ═════ */
/* dziennik rozmowy: co usłyszała i co odpowiedziała (ostatnie 40) */
const DLOG = [];
document.querySelector('.dlog-box')?.addEventListener('toggle', e => { if (e.target.open && $('dlog')?.dataset.stale) dlogRender() });
function dlog(who, text) {
  text = String(text || '').trim(); if (!text) return; const last = DLOG.at(-1); if (last && last.who === who && last.text === text && Date.now() - last.at < 1500) return;
  DLOG.push({ who, text, at: Date.now() }); if (DLOG.length > 40) DLOG.shift(); dlogRender();
}
function dlogRender() {
  const box = $('dlog'); if (!box) return; $('dlogCount').textContent = DLOG.filter(x => x.who === 'me').length; if (!box.closest('details')?.open) { box.dataset.stale = '1'; return } box.dataset.stale = '';
  box.replaceChildren(...DLOG.slice().reverse().map(e => el('div', { class: 'dl-row dl-' + e.who }, el('small', { text: new Date(e.at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }), el('span', { text: (e.who === 'me' ? '🗣 ' : '🤖 ') + e.text }))));
}
new MutationObserver(() => dlog('bot', $('botText').textContent)).observe($('botText'), { childList: true, characterData: true, subtree: true });
$('dlogUndo').addEventListener('click', () => { if (!session?.entries.length) return announce('Nie ma czego cofać'); undo(); dlog('me', '↶ (przycisk) to była pomyłka') });
let lastAct = { type: '', at: 0 };
const markAct = type => { lastAct = { type, at: Date.now() } };
const FRAC_WORDS = [['trzy czwarte|3 4|trzy czwarta', .75], ['cwierc|cwiartka|cwiartke|jedna czwarta', .25], ['pol|polowa|polowe|polowka|polowke', .5], ['pelny|pelen|caly|calutki|do pelna|full', 1], ['przelany|z gorka|z czubem', 'over']];
function fracOf(t) { for (const [w, f] of FRAC_WORDS) if (new RegExp('\\b(' + w + ')\\b').test(t)) return f; return null }
/** zmień ostatni kurs (kosz: ułamek kosza, taczka/łyżka: ilość) */
function fixLast(f, n) {
  const s = session; if (!s || !s.entries.length) return false;
  if (s.method === 'kibel' && f != null) { setLastFrac(f, { silent: true }) }
  else { const cap = Number(s.capacity) || .5, v = f != null ? Math.round(cap * (f === 'over' ? OVER_F : f) * 1000) / 1000 : n; if (!(v > 0)) return false; s.entries.at(-1).amount = v; remember(); render(); syncNative?.() }
  const v = Number(s.entries.at(-1).amount); report('fixed', fmt(Math.round(v * 100) / 100) + ' metra'); markAct('fix'); return true;
}
function dialogCommand(t, has) {
  const s = session, recent = Date.now() - lastAct.at < 12000;
  // „kosz ma 1,3” · „jednak kosz 1,3” · „pojemność 1,3” = zmiana pojemności kosza, nie poprawka kursu
  // „przekładka na 0,75” · „zmieniamy kosz na 0,75” → inny kosz od następnego kursu (bez przeliczania poprzednich)
  if (s && s.method !== 'taczka' && has('przekladka|przekladamy|przekladke|zmieniamy kosz|zmiana kosza|inny kosz|zmien kosz na|bierzemy kosz')) {
    const v = amountFromSpeech(spokenNumber(t));
    if (!(v > 0 && v <= 5)) { method = s.method; tab('pickBucket'); return true }
    const p = profilesFor(s.method).find(x => Math.abs(x.capacity - v) < .011);
    if (p) changeCapacity(p.capacity, p); else { const n0 = s.entries.length; s.entries.length && (s._noPrompt = 1); changeCapacity(v, null); document.querySelector('.cap-prompt')?.remove(); if (n0) announce('🔄 Przekładka: od teraz ' + fmt(v) + ' m³ — poprzednie kursy zostają') }
    sayBot('custom', 'Przekładka. Od teraz kosz ' + fmt(v) + '.'); return true;
  }
  // „kosz ma 3,5 pióra” · „pierwszy kosz 3,5 pióra” · „ustaw kosz na 40 piór” → pojemność = pióra × pióro
  if (s && s.method !== 'taczka' && /\bpior(a|o|ow)?\b/.test(t) && (s.pioPending || has('kosz|kibel|kubel|pierwszy|ustaw|weszlo|wchodzi|miesci|bierze'))) { const hp = t.match(/(\S+) i pol\b/), n = hp && spokenNumber(hp[1]) > 0 ? spokenNumber(hp[1]) + 0.5 : spokenNumber(t); const v = Math.round(n * pioroM3() * 1000) / 1000; if (n > 0 && v > 0.01 && v <= 5) { if (s.pioPending) return setPioCap(n); jlog('kosz z piór (głos): ' + fmt(n) + ' = ' + fmt3(v) + ' m³'); changeCapacity(v, null); return true } }
  if (s && s.method !== 'taczka' && has('kosz ma|kibel ma|kubel ma|pojemnosc|ustaw kosz|zmien kosz|ustaw kibel|zmien kibel|nowy kosz|kosz jest na|kosz nie ma|jednak kosz|jednak kibel|kosz ma tylko|kosz bierze|kosz miesci|kibel miesci|kosz to')) { const n = amountFromSpeech(spokenNumber(t.replace(/\bnie ma [\d.,]+( |$)/, ' '))); const m = spokenNumber(t.split(/\btylko\b/).pop()); const v = m > 0 && m <= 5 && /tylko/.test(t) ? m : n; if (v > 0 && v <= 5) { changeCapacity(v, null); return true } }
  // poprawki: „nie, pół” · „miało być pół” · „poprawka trzy czwarte” · „jednak pełny” · „nie cały tylko pół”
  if (s && s.entries.length && (has('poprawka|popraw|mialo byc|jednak|tylko|nie caly|nie pelny|zle policzone|zmien ostatni|ostatni byl|ostatni kurs byl|to byl|to bylo') || (/^nie\b/.test(t) && t.split(' ').length <= 4 && fracOf(t.replace(/^nie\b/, '')) != null))) {
    const f = fracOf(t.replace(/\b(nie caly|nie pelny)\b/g, ' ')), n = amountFromSpeech(spokenNumber(t));
    if (f != null || n > 0) return fixLast(f, n > 0 && f == null ? n : null);
  }
  // krótka dopowiedź zaraz po kursie: „pół” / „trzy czwarte” / „0,4”
  if (s && recent && lastAct.type === 'add' && t.split(' ').length <= 3 && !has('dodaj|kolejny|zalany|zalane|nastepny|plus')) {
    const f = fracOf(t), n = amountFromSpeech(spokenNumber(t)); if (f != null || (n > 0 && /\d|zero|przecinek|dziesiat|setn/.test(t))) return fixLast(f, f == null ? n : null);
  }
  // za dużo / za mało
  if (s && has('dodalem dwa razy|dodane dwa razy|podwojnie|o jeden za duzo|jeden za duzo|policzylas dwa razy|za duzo policzone|niepotrzebnie dodane')) { undo(); markAct('undo'); return true }
  if (s && has('o jeden za malo|jeden za malo|zapomnialem dodac|zapomnialas|nie dodalem|nie policzylas|brakuje jednego')) { add(s.dose > 0 ? s.dose : s.capacity); markAct('add'); return true }
  // kilka kursów naraz: „dodaj dwa kosze” · „trzy taczki” · „dwa razy”
  const many = t.match(/\b(dwa|dwie|trzy|cztery|piec|2|3|4|5)\s+(kosze|koszy|kursy|kursow|razy|taczki|taczek|lyzki|lyzek|kible|kibli)\b/);
  if (s && many && !has('ile|zostalo')) { const k = { dwa: 2, dwie: 2, trzy: 3, cztery: 4, piec: 5 }[many[1]] || Number(many[1]); for (let i = 0; i < k; i++) add(s.dose > 0 ? s.dose : s.capacity, { silent: i < k - 1, force: true, at: Date.now() + i }); report('added2', String(k)); markAct('add'); return true }
  // pogadanki
  if (has('opowiedz kawal|opowiedz dowcip|kawal|dowcip|rozsmiesz mnie|cos smiesznego|zart|witz')) { sayBot('joke'); return true }
  if (has('jak sie masz|co tam|jak leci|jak samopoczucie|wie gehts|jak tam u ciebie')) { sayBot('howAreYou'); return true }
  if (has('kocham cie|lubie cie|jestes super|jestes najlepsza|jestes kochana|jestes piekna|ich liebe dich')) { sayBot('love'); return true }
  if (has('dziekuje|dzieki|dziekowac|dzieks|danke|dzieki wielkie')) { sayBot('thanks'); return true }
  if (has('kto jest najlepszy|kto tu rzadzi|kto jest szefem|kto jest najlepszym')) { sayBot('best'); return true }
  if (has('jak masz na imie|kim jestes|jak sie nazywasz|jak cie zwac')) { sayBot('name'); return true }
  if (has('ktora godzina|ktora jest|wie spat|jaka godzina')) { report('time', new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })); return true }
  if (has('jestem zmeczony|jestem zmeczona|mam dosc|padam|nie mam sily|bola mnie plecy')) { sayBot('tired'); return true }
  if (has('przerwa na kawe|ide na kawe|ide na papierosa|ide na fajke|na papierosa|kawa dla mnie|czas na kawe')) { sayBot('coffee'); return true }
  if (has('nudzi mi sie|nudno mi')) { sayBot('bored'); return true }
  if (has('ty glupia|glupia jestes|idiotka|debilka|zamknij ryj|odpierdol sie|jebie cie|glupi bot|beznadziejna jestes')) { sayBot('insult'); return true }
  return false;
}
/** pogadanki z pojedynczym słowem — sprawdzane na końcu, gdy nic innego nie pasuje */
function smallTalkLate(t, has) {
  if (has('czesc|dzien dobry|siema|siemka|hej|elo|witaj|witam|servus|guten morgen|hallo|dobry wieczor|czolem')) { sayBot('hello'); return true }
  if (has('kawa|kawe|kawka|pause|fajka|papieros')) { sayBot('coffee'); return true }
  if (has('nuda|nudno')) { sayBot('bored'); return true }
  if (has('glupia|spierdalaj|kurwa mac|beznadziejna|debil')) { sayBot('insult'); return true }
  return false;
}
function command(utterance) {
  const t = normalise(utterance); if (!t) return false;
  const has = list => new RegExp('\\b(' + list + ')\\b').test(t);
  const waiting = phase === 'away' || phase === 'late';
  /* ── 💬 dialog: poprawki ostatniego kursu, kilka kursów naraz, pogadanki ── */
  if (session && has('beton sie skonczyl|skonczyl sie beton|nie ma betonu|zabraklo betonu|koniec betonu w gruszce|gruszka sie skonczyla')) { emptyTruck(); return true }
  // lanie z gruszki na czas
  if (has('leje na jedynce|lej na jedynce|leje na jedynke|na pierwszym biegu|leje na pierwszym|leje wolno|lanie jedynka|start lania')) { pourStart('g1'); return true }
  if (has('leje na full|lej na full|leje na pelnym|pelny gaz|full gaz|na pelnym gazie|leje szybko|lanie full|daj gazu')) { pourStart('full'); return true }
  if (pour?.mode && has('stop|stoj|koniec lania|starczy|wystarczy|zatrzymaj|stopuj|halt')) { pourStop(); return true }
  if (!pour?.mode && document.querySelector('[data-pour-add]') && has('dodaj|tak|dawaj')) { document.querySelector('[data-pour-add]').click(); return true }
  if (document.querySelector('.cap-prompt')) { if (has('przelicz|tak|wszystko|wszystkie|dawaj|jasne')) { document.querySelector('[data-cap=all]')?.click(); return true } if (has('tylko nastepne|nastepne|nie|zostaw|nie przeliczaj')) { document.querySelector('[data-cap=next]')?.click(); return true } }
  const dl = dialogCommand(t, has); if (dl) return dl;
  /* „słyszysz mnie?” — test mikrofonu + jak głośno i jak wyraźnie */
function hearQuality() {
  const h = window.__lastHeard;
  if (!h || Date.now() - h.at > 4000 || !(h.db > -120)) { sayBot('hearYou'); return }
  const over = h.db - h.gate, conf = Number(h.conf);
  const vol = over >= 18 ? 'głośno' : over >= 9 ? 'dobrze' : over >= 3 ? 'w miarę, ale mów trochę głośniej' : 'bardzo cicho, mów głośniej albo podnieś czułość mikrofonu';
  const clr = conf < 0 ? '' : conf >= .8 ? ' i wyraźnie' : conf >= .55 ? ', trochę niewyraźnie' : ', ale słabo rozumiem, chyba jest hałas';
  const crude = settings.crude !== false && Math.random() < .4 ? pick(over >= 9 ? [' Aż mnie ciarki przeszły.', ' Mów tak do mnie częściej.', ' Nie drzyj się, kurwa.'] : [' Szepczesz jak do kochanki.', ' Weź się, kurwa, odezwij głośniej.']) : '';
  const txt = 'Słyszę cię ' + vol + clr + (h.bt ? ' przez słuchawkę.' : '.') + crude;
  micDisplay('🎚 Poziom ' + Math.round(h.db) + ' dB (próg ' + Math.round(h.gate) + ') · pewność ' + (conf >= 0 ? Math.round(conf * 100) + '%' : '—') + (h.bt ? ' · słuchawka BT' : ''));
  $('botText').textContent = txt; lastBotAt = Date.now(); speak('custom', txt);
}
const pick = a => a[Math.floor(Math.random() * a.length)];
/* „słyszysz mnie?” — test mikrofonu */
  if (has('slyszysz mnie|slyszysz|czy mnie slyszysz|halo halo|jestes tam|test mikrofonu|test test|horst du mich|hoerst du|jak mnie slyszysz|jak slyszysz|jakosc')) { hearQuality(); return true }
  /* „zapytaj za 2 minuty” */
  if (has('zapytaj za|spytaj za|przypomnij za|odezwij sie za|zapytaj mnie za|za minute|za dwie minuty|za trzy minuty|za piec minut|za pol minuty|za minutke|frag in|in zwei minuten')) { const sec = snoozeFromSpeech(t) || 120; if (session && session.method !== 'taczka') { delay({ sec }); return true } }
  /* nowe komendy 4.9.1 */
  if (has('cisza|zamknij sie|nie gadaj|stop gadanie|przestan gadac|wycisz|badz cicho|milcz|ruhe')) { if (settings.mode === 'full') { sayBot('muted'); setTimeout(() => { settings.mode = 'beep'; saveSettings(); configureNative?.() }, 1800) } return true }
  if (has('gadaj|mow dalej|mozesz mowic|odezwij sie|wlacz glos|sprechen')) { settings.mode = 'full'; saveSettings(); configureNative?.(); sayBot('unmuted'); return true }
  if (has('powtorz|co mowilas|co powiedzialas|nie uslyszalem|nie slyszalem|wiederholen')) { const tx = $('botText').textContent; if (tx) speak?.('custom', tx); return true }
  if (has('jaki kosz|jaka pojemnosc|ile ma kosz|ile wchodzi do kosza|ile miesci kosz|ile ma kibel|jaki kibel|ile ma lyzka|ile ma taczka')) { if (session) { report('reportCap', fmt(session.capacity)); return true } }
  if (has('kiedy koniec|o ktorej koniec|kiedy skonczymy|o ktorej skonczymy|wann fertig|kiedy fajrant')) { if (session) { report('reportEta', $('eta').textContent || 'nie wiem'); return true } }
  if (has('sredni kurs|ile trwa kurs|jak dlugo kurs|ile lata kosz|ile jedzie kosz|czas kursu')) { if (session) { const m = meanTrip(); report('reportTrip', m >= 60 ? Math.floor(m / 60) + ' minuty ' + Math.round(m % 60) + ' sekund' : Math.round(m) + ' sekund'); return true } }
  if (has('zakoncz betonowanie|koniec betonowania|konczymy betonowanie|fajrant|feierabend|wszystko zrobione')) { if (session) { document.querySelector('.end-prompt')?.remove(); setTimeout(() => $('finish').click(), 200); return true } }
  if (has('entladung|ofeo|kliknalem|klikniete|odhaczone')) { const c = document.querySelector('.ofeo-prompt'); if (c) { c.querySelector('button.primary')?.click(); return true } if (session) { session.ofeo = Date.now(); remember(); announce('👍 Entladung odhaczony'); return true } }
  if (document.querySelector('.end-prompt:not(.ofeo-prompt)') && has('pusta|pusto|nic nie ma|leer|wszystko')) { document.querySelector('.end-prompt:not(.ofeo-prompt) button.primary')?.click(); return true }
  if (document.querySelector('.end-prompt:not(.ofeo-prompt)') && has('jeszcze leje|leje dalej|jeszcze jest|jeszcze troche')) { document.querySelector('.end-prompt:not(.ofeo-prompt) button:not(.primary)')?.click(); return true }
  if (has('duzy widok|tryb jednej reki|powieksz')) { setOneHand?.(true); return true }
  if (has('maly widok|pelny widok|normalny widok|pomniejsz')) { setOneHand?.(false); return true }
  if (has('ekran nocny|tryb nocny|nocny ekran|wygaszacz|zgas ekran|przyciemnij')) { setNight(true); return true }
  if (nightOn && has('zapal ekran|obudz|rozjasnij|wylacz nocny|koniec nocnego|pokaz ekran')) { setNight(false); return true }
  if (has('zablokuj suwak|zablokuj')) { settings.sliderLock = true; saveSettings(); renderLevelSoon?.(); announce('🔒 Suwak zablokowany'); return true }
  if (has('odblokuj suwak|odblokuj')) { settings.sliderLock = false; saveSettings(); renderLevelSoon?.(); announce('🔓 Suwak odblokowany'); return true }
  if (has('nie ma|jeszcze nie|nie wrocil|nie przyjechal|nie dojechal|nie jest|jeszcze go nie ma|jeszcze jedzie|w drodze|nie widac|nein|nie|jeszcze moment|chwila|moment|sekunde|poczekaj') && !/\bile\b/.test(t)) { if (waiting) { delay(); return true } return 'ignore' }
  if (has('ile zostalo|ile betonu zostalo|stan betonu|ile jeszcze|ile do konca|ile brakuje|ile pozostalo|ile mamy jeszcze|ile kubikow zostalo|ile metrow zostalo|jaki stan|ile w gruszce|co zostalo|ile jeszcze betonu|ile jeszcze mamy|stan')) { report('reportLeft', fmt(left())); return true }
  if (has('ile koszy|ile kursow|ile jeszcze koszy|ile koszy zostalo|ile kibli|ile taczek|ile lyzek|ile razy jeszcze')) { report('reportBuckets', bucketPlanText(bucketPlan(), true)); return true }
  if (has('ile wylano|ile juz wylano|ile nalano|ile poszlo|ile wylalismy|ile zalalismy|ile zalane|ile kubikow poszlo|ile metrow wylano|ile mamy wylane|ile zrobione|licznik|ile juz poszlo|ile zrobilismy|wie viel gemacht')) { report('reportPoured', fmt(entriesSum())); return true }
  if (has('ile czasu|czas betonowania|jak dlugo|ile trwa|ile minut|ile to juz trwa|od kiedy betonujemy|jak dlugo juz|ile pracujemy|ktora minuta')) { report('reportTime', Math.round((Date.now() - (session?.startedAt || Date.now())) / 60000)); return true }
  if (session?.method === 'kibel') { // nowe liczenie kosza: kursy + gruszki
    if (has('gruszka pusta|pusta gruszka|koniec gruszki|gruszka skonczona|gruszka sie skonczyla|wylane wszystko|wszystko wylane')) { truckEmpty(); return true }
    if (has('nowa gruszka|kolejna gruszka|nastepna gruszka|druga gruszka|trzecia gruszka|przyjechala gruszka|nowy samochod')) { const n = truckNumber(t); newTruck(n > 0 && n <= 15 ? n : 0); return true }
    const fr = has('trzy czwarte|trzy czwarta|3 4') ? .75 : has('cwierc|jedna czwarta|cwiartka|1 4') ? .25 : has('przelany|przelalem|przelane|przelany kosz|z czubem|z gorka') ? 'over' : has('pol kosza|pol kibla|polowa kosza|do polowy|polowe kosza|pol kubla|polowa|pol') ? .5 : has('pelny kosz|pelny kibel|caly kosz|do pelna|pelen kosz|pelny') ? 1 : 0;
    if (fr && has('dodaj|plus|zalany')) { add(session.capacity * (fr === 'over' ? OVER_F : fr)); return true }
    if (fr) { setLastFrac(fr); return true }
  }
  if (!has('dodaj|zalany|zalane') && has('ustaw kosz|zmien kosz|kosz|kibel|pojemnosc kosza|pojemnosc|kosz ma|nowy kosz|kosz na|ustaw kibel|zmien kibel')) { const n = spokenNumber(t); if (n > 0 && n <= 5) { changeCapacity(n, null); return true } }
  if (has('lej|leje|wlewam|wlej|zmien ilosc|ustaw ilosc|ilosc|lejemy|zalewam|do kosza|wlewamy|ustaw porcje|porcja')) { const n = spokenNumber(t); if (n >= 0 && n <= 5 && !isNaN(n)) { changeDose(n, true); sayBot('doseSet'); return true } }
  if (!has('dodaj|plus') && has('pelny kosz|pelny kibel|do pelna|caly kosz|caly kibel|pelen kosz|do pelnego|na full|full|calosc|pelny')) { if (session) { changeDose(session.capacity, true); sayBot('fullBucket') } return true }
  if (has('pol kosza|pol kibla|polowa kosza|pol taczki|pol kibelka|pol kubla|do polowy|polowe kosza|lej pol|pol lyzki')) { if (session) { changeDose(session.capacity / 2, true); sayBot('halfBucket') } return true }
  if (has('cofnij ostatni|skasuj ostatni|usun ostatni|cofnij|anuluj|usun|wycofaj|odejmij|minus jeden|pomylka|blad|skasuj')) { undo(); return true }
  if (has('koparka wyjechala|koparka pojechala|koparka jedzie z betonem|lyzka pojechala|lyzka jedzie|kosz w gore|dzwig jedzie|kran jedzie|podnosi|kosz wyjechal|kibel wyjechal|kosz ruszyl|kosz pojechal|kibel pojechal|wyjechal|ruszyl|pojechal|odjechal|jazda z koszem')) { depart(); return true }
  if (has('dodac|dodam|dodaje|dodajcie|do daj|dodaj kosza|dodaj kibla|dodaj taczke|dodaj lyzke|taczka wylana|lyzka wylana|kolejna taczka|kolejna lyzka|taczka|wlano|wlalem|wlalismy|nalalem|nalalismy|wlane|wlali|dodaj kibel|dodaj kosz|kosz zalany|kibel zalany|plus jeden|dodaj|nalicz|dolej|zalicz|zalany|zalane|poszlo|kolejny|wysypane|wysypalem|wysypal|nalane|zaliczone|poszedl|dawaj|leci|nastepny kosz|kosz poszedl|kosz wylany|wylany|plus|fertig|voll|weiter|zrobiony|gotowy kosz|kosz gotowy|napelniony|pelen')) {
    // „dodaj jeden (kosz)” = jeden kurs, nie 1 m³; „dodaj pełny/full” = pełna pojemność
    const n = amountFromSpeech(spokenNumber(t.replace(/\b(jeden|jedna|jedno|1) (kosz|kosza|kibel|kibla|kubel|taczk\w*|lyzk\w*)\b/g, ' $2').replace(/\b(dodaj|plus) (jeden|jedna|jedno|1)$/, '$1').replace(/\b(plus jeden|dodaj kibel|dodaj kosz|kosz zalany|kibel zalany|dodaj taczke|dodaj lyzke)\b/g, ' ')));
    const full = has('pelny|caly|calosc|full|do pelna|pelen|do pelnego');
    add(n > 0 ? n : full && session ? session.capacity : (session?.dose > 0 ? session.dose : session?.capacity)); return true }
  if (has('koparka jest|koparka wrocila|lyzka jest|lyzka wrocila|tak|juz jest|kosz jest|kibel jest|juz wrocil|wrocil|przyjechal|przybyl|dojechal|no jest|jest|gotowe|mamy|mam|czeka|jestem|juz|okej jest|ok jest')) { if (waiting) { returned(); return true } return 'ignore' }
  return smallTalkLate(t, has);
}
function micDisplay(t) { setTimeout(bgmUpdate, 0); $('micStatus').textContent = t; $('mic').textContent = micWanted ? '⏹ Wyłącz mikrofon' : '🎙️ Włącz mikrofon'; $('mic').classList.toggle('live', micWanted); const tm = $('hdrMic'); if (tm) { tm.textContent = '🎙'; tm.setAttribute('aria-label', micWanted ? 'Wyłącz mikrofon' : 'Włącz mikrofon'); tm.classList.toggle('live', micWanted) } const om = $('ohMic'); if (om) { om.textContent = micWanted ? '🟢 Słucham' : '🎙 Mikrofon'; om.classList.toggle('live', micWanted) } if ($('ohMicStatus')) $('ohMicStatus').textContent = t; if (settings.oneHand && /❌|Brak|Nie mogę/.test(t)) announce(t) }
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
async function stopMic() { micWanted = false; micLive = false; if (settings.micOn) { settings.micOn = false; saveSettings() } clearTimeout(voiceRetry); if (nativeVoice) await NV.stop().catch(() => { }); else try { recognition?.abort() } catch (e) { } micDisplay('Mikrofon wyłączony.') }
function bootWebRecognition() {
  if (!micWanted || document.hidden) return;
  try {
    recognition = new SpeechRec(); recognition.lang = 'pl-PL'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => { micLive = true; micDisplay('🟢 Słucham…') };
    recognition.onresult = e => { const r = e.results[e.resultIndex]; if (!r.isFinal) return; heardText(r[0].transcript) };
    recognition.onerror = e => { micLive = false; if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { stopMic(); micDisplay('❌ Brak zgody na mikrofon.') } };
    recognition.onend = () => { micLive = false; if (micWanted && !document.hidden) { clearTimeout(voiceRetry); voiceRetry = setTimeout(bootWebRecognition, 900) } };
    recognition.start();
  } catch (e) { micDisplay('Nie mogę uruchomić mikrofonu: ' + (e.message || e)); stopMic() }
}
async function toggleMic() {
  if (micWanted) return stopMic();
  if (nativeVoice) {
    micDisplay('Prośba o zgodę…');
    const p = await NV.askPermissions().catch(() => ({}));
    if (!p.mic || !p.speech) return micDisplay('❌ Brak zgody na mikrofon lub mowę. Ustawienia iPhone’a → BetonKibelPlus → włącz Mikrofon i Rozpoznawanie mowy.');
    for (let i = 0; i < 4; i++) { // mikrofon czasem nie rusza od razu (np. po rozmowie) — ponów kilka razy
      try { const r = await NV.start(); micWanted = true; micLive = true; settings.micOn = true; saveSettings(); micDisplay('🟢 Słucham — także przy zablokowanym ekranie.' + (r && r.onDevice === false ? ' (rozpoznawanie przez internet)' : '')); if (!toggleMic.silent) sayBot('micOn'); return }
      catch (e) { if (i === 3) { micWanted = false; settings.micOn = false; saveSettings(); return micDisplay('❌ ' + (e.message || e)) } micDisplay('⏳ Mikrofon nie ruszył, ponawiam… (' + (i + 1) + '/3)'); await new Promise(r => setTimeout(r, 2000)) }
    }
    return;
  }
  if (!SpeechRec) return micDisplay('❌ Ta przeglądarka nie rozpoznaje mowy. Użyj przycisków.');
  micWanted = true; micDisplay('Prośba o dostęp do mikrofonu…'); bootWebRecognition();
}
$('mic').addEventListener('click', toggleMic); $('hdrMic').addEventListener('click', toggleMic);
NV.onHeard?.(t => heardText(t)); window.BKP_heard = heardText; // test/debug: wpisz tekst jak z mikrofonu
NV.onStatus?.(t => micDisplay(t));

async function drainNative() {
  if (!nativeVoice) return;
  const evs = await NV.drain().catch(() => []);
  if (evs.length && session) {
    evs.sort((a, b) => a.at - b.at);
    for (const e of evs) {
      if (!session) break;
      if (e.type === 'add') add(e.amount, { at: e.at, silent: true });
      else if (e.type === 'returned') returned({ at: e.at, silent: true });
      else if (e.type === 'delay') delay({ at: e.at, silent: true });
      else if (e.type === 'snooze') delay({ at: e.at, silent: true, sec: Number(e.sec) || 120 });
      else if (e.type === 'depart') depart({ at: e.at, silent: true });
      else if (e.type === 'undo') undo({ silent: true });
      else if (e.type === 'lastFrac') setLastFrac(e.frac === 'over' ? 'over' : Number(e.frac), { silent: true });
      else if (e.type === 'truckEmpty') truckEmpty({ silent: true });
      else if (e.type === 'newTruck' && Number(e.m3) > 0) newTruck(Number(e.m3));
      else if (e.type === 'dose') { session.dose = Math.min(doseMax(session.capacity), Number(e.amount) || session.dose) }
      else if (e.type === 'alarm') { phase = 'late'; alarmVisible = true; nextReminder = e.at + remindGap(); deadline = nextReminder }
    }
    remember(); render(); tick();
    announce('Z zablokowanego ekranu: ' + evs.length + ' zdarzeń');
  } else syncNative();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (micWanted && !nativeVoice) { stopMic(); micDisplay('Mikrofon zatrzymany — wróć do aplikacji i włącz ponownie.') } return }
  drainNative().then(() => { tick(); homeRender() });
});

// ───────────────────────── lanie z gruszki na czas: obroty bębna → pióra → m³ ─────────────────────────
// Domi zmierzył: 1 bieg (1380 rpm) ≈ 6,20 s/obrót, pełny gaz ≈ 4,21 s/obrót. Pióro ≈ 0,032 m³ (pomiar 9 m³ / 7 min na 1 stopniu), 4–5 piór na obrót.
const DRUM_DEF = { g1: 6.2, full: 4.21, pio: 4.5, m3rot: 0.14 }; // m3rot: 9 m³ ≈ 7 min na 1 stopniu ≈ 65 obrotów → 0,14 m³/obrót // Domi: 4–5 piór na obrót
/** ile betonu jest na jednym piórze. Domi 15.11: do kosza 0,5 m³ wchodzi 5–6 piór → 0,5 ÷ 5,5 ≈ 0,09 m³ (90 l). Kalibracja nadpisuje. */
const PIORO_DEF = 0.09;
const fmt3 = n => (Math.round(Number(n) * 1000) / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 3 });
function pioroM3() { const v = Number(settings?.pioro); return v > 0.005 && v < 1 ? v : PIORO_DEF }
/** m³ z obrotów: najpierw zmierzone m³/obrót, inaczej pióra/obrót × pióro */
function pourM3(rot, c = drumCfg()) { return c.m3rot > 0 ? rot * c.m3rot : c.pio > 0 ? rot * c.pio * pioroM3() : 0 }
const drumCfg = () => { const c = { ...DRUM_DEF, ...(settings.drum || {}) }; if (!(c.pio > 0)) c.pio = DRUM_DEF.pio; if (!(c.m3rot > 0)) c.m3rot = DRUM_DEF.m3rot; return c };
let pour = null, pourTimer = 0;
const pourRot = (p, now = Date.now()) => p.rot + (p.mode ? (now - p.t0) / 1000 / (drumCfg()[p.mode] || 6) : 0);
const pourSecs = (p, now = Date.now()) => p.secs + (p.mode ? (now - p.t0) / 1000 : 0);
function pourStart(mode) {
  const now = Date.now();
  if (pour?.mode) { pour.rot = pourRot(pour, now); pour.secs = pourSecs(pour, now) } // zmiana biegu w trakcie
  pour = pour && pour.mode ? { ...pour, mode, t0: now } : { mode, t0: now, rot: 0, secs: 0 };
  $('pourBox').open = true; $('pourRes').replaceChildren(); clearInterval(pourTimer); pourTimer = setInterval(pourRender, 250); pourRender();
  announce(mode === 'full' ? '🔥 Leję na pełnym gazie' : '🐢 Leję na 1 biegu'); buzz?.('light'); jlog('lanie z gruszki: ' + (mode === 'full' ? 'pełny gaz' : '1 bieg'));
}
function pourStop() {
  if (!pour?.mode) return false; const now = Date.now(); pour.rot = pourRot(pour, now); pour.secs = pourSecs(pour, now); pour.mode = null;
  clearInterval(pourTimer); pourRender();
  const c = drumCfg(), m3 = Math.round(pourM3(pour.rot, c) * 100) / 100, pio = m3 > 0 ? m3 / pioroM3() : 0, done = pour; calFromPour = done.rot;
  const res = $('pourRes'); res.replaceChildren(el('p', { class: 'hint', text: '⏱ ' + shortDur(done.secs) + ' · ' + fmt(Math.round(done.rot * 10) / 10) + ' obrotów' + (m3 > 0 ? ' · ' + fmt(Math.round(pio * 10) / 10) + ' piór ≈ ' + fmt(m3) + ' m³' : ' · wpisz „pióra na obrót” albo skalibruj niżej, to policzę m³') }));
  calRender();
  if (m3 > 0 && session) res.append(el('div', { class: 'ep-row' },
    el('button', { type: 'button', class: 'primary', 'data-pour-add': '1', text: '➕ Dodaj ' + fmt(m3) + ' m³', onclick: () => { add(m3, { force: true }); res.replaceChildren(); pour = null; pourRender() } }),
    el('button', { type: 'button', text: '✖ Nie dodawaj', onclick: () => { res.replaceChildren(); pour = null; pourRender() } })));
  sayBot('custom', m3 > 0 ? 'Stop. ' + fmt(Math.round(done.rot * 10) / 10) + ' obrotu, około ' + fmt(m3) + ' metra. Dodać?' : 'Stop. ' + fmt(Math.round(done.rot * 10) / 10) + ' obrotu.');
  return true;
}
/* 📏 ile jest na piórze: wlej znaną ilość (np. pełny kosz) i policz pióra — albo zmierz czasem (obroty) */
let calFromPour = 0;
function calCalc() {
  const m3 = number($('calM3').value), n = number($('calN').value), c = drumCfg();
  if (!(m3 > 0)) return null;
  if (n > 0) return { pioro: m3 / n, m3rot: c.pio > 0 && calFromPour > 0 ? m3 / calFromPour : 0, how: fmt(n) + ' piór' };
  if (calFromPour > 0.3) { const m3rot = m3 / calFromPour; return { m3rot, pioro: c.pio > 0 ? m3rot / c.pio : 0, how: fmt(Math.round(calFromPour * 10) / 10) + ' obrotów z licznika' } }
  return null;
}
function calRender() {
  if ($('pioroCardB')) { $('pioroCardB').textContent = 'Pióro = ' + fmt3(pioroM3()) + ' m³' + (settings.pioro ? ' ✓' : ''); $('pioroCardS').textContent = 'czyli ok. ' + Math.round(pioroM3() * 1000) + ' litrów betonu' + (settings.pioro ? ' · zmierzone' : '') }
  const out = $('calOut'); if (!out) return; const r = calCalc();
  $('calHint').textContent = calFromPour > 0 ? 'Ostatnie lanie: ' + fmt(Math.round(calFromPour * 10) / 10) + ' obrotu — możesz go użyć zamiast liczenia piór.' : '';
  if (!r) { out.textContent = 'Teraz: 1 pióro = ' + fmt3(pioroM3()) + ' m³ (' + Math.round(pioroM3() * 1000) + ' l)' + (settings.pioro ? ' · zmierzone' : ' · domyślne'); $('calSave').disabled = true; return }
  $('calSave').disabled = false;
  out.replaceChildren(el('b', { text: r.pioro > 0 ? '1 pióro = ' + fmt3(r.pioro) + ' m³ (' + Math.round(r.pioro * 1000) + ' l)' : '1 obrót = ' + fmt3(r.m3rot) + ' m³' }),
    el('small', { text: ' z ' + r.how + (r.pioro > 0 && r.m3rot > 0 ? ' · 1 obrót = ' + fmt3(r.m3rot) + ' m³' : r.m3rot > 0 && !(r.pioro > 0) ? ' · wpisz pióra/obrót, to policzę też pióro' : '') }));
}
function calSave() {
  const r = calCalc(); if (!r) return;
  if (r.pioro > 0) { if (!(r.pioro > 0.005 && r.pioro < 1)) return announce('Wyszło ' + fmt(r.pioro) + ' m³ na pióro — to nie wygląda dobrze, sprawdź liczby'); settings.pioro = Math.round(r.pioro * 10000) / 10000 }
  if (r.m3rot > 0) settings.drum = { ...drumCfg(), m3rot: Math.round(r.m3rot * 10000) / 10000 };
  saveSettings(); jlog('kalibracja pióra: ' + fmt3(pioroM3()) + ' m³' + (r.m3rot > 0 ? ', obrót ' + fmt(r.m3rot) + ' m³' : ''));
  announce('📏 Zapisane: 1 pióro = ' + fmt3(pioroM3()) + ' m³'); sayBot('custom', 'Zapisałam. Jedno pióro to ' + fmt3(pioroM3()) + ' metra, czyli ' + Math.round(pioroM3() * 1000) + ' litrów.');
  $('calN').value = ''; calRender(); pourRender(); $('pioroN')?.dispatchEvent(new Event('input'));
}
function pourRender() {
  const box = $('pourBox'); if (!box) return; const p = pour, c = drumCfg(), now = Date.now();
  const rot = p ? pourRot(p, now) : 0, secs = p ? pourSecs(p, now) : 0, m3 = pourM3(rot, c), known = c.m3rot > 0 || c.pio > 0, pio = m3 / pioroM3();
  box.classList.toggle('running', !!p?.mode);
  box.querySelectorAll('[data-pour]').forEach(b => b.classList.toggle('on', !!p?.mode && b.dataset.pour === p.mode));
  $('pourT').textContent = shortDur(secs); $('pourR').textContent = fmt(Math.round(rot * 10) / 10);
  $('pourP').textContent = known ? fmt(Math.round(pio * 10) / 10) : '—'; $('pourM').textContent = known ? fmt(Math.round(m3 * 100) / 100) : '—';
  $('pourMini').textContent = p?.mode ? (known ? fmt(Math.round(m3 * 100) / 100) + ' m³' : fmt(Math.round(rot * 10) / 10) + ' obr.') : '';
}
(() => {
  const box = $('pourBox'); if (!box) return; const c = drumCfg();
  const bind = (id, key) => { const i = $(id); i.value = c[key] > 0 ? fmt(c[key]) : ''; i.addEventListener('change', () => { const v = number(i.value); settings.drum = { ...drumCfg(), [key]: v > 0 && v < 100 ? v : DRUM_DEF[key] }; saveSettings(); i.value = settings.drum[key] > 0 ? fmt(settings.drum[key]) : ''; pourRender() }) };
  bind('drumG1', 'g1'); bind('drumFull', 'full'); bind('drumPio', 'pio');
  $('calM3').value = session?.capacity ? fmt(session.capacity) : ''; ['calM3', 'calN'].forEach(id => $(id).addEventListener('input', calRender));
  $('calSave').addEventListener('click', calSave); calRender();
  box.querySelectorAll('[data-pour]').forEach(b => b.addEventListener('click', () => b.dataset.pour === 'stop' ? pourStop() : pourStart(b.dataset.pour)));
  pourRender();
})();

// ───────────────────────── dziennik pytań o kosz (żeby było widać, czemu bot kiedyś nie zapytał) ─────────────────────────
function jlog(what, bad = false) {
  JLOG.push({ at: Date.now(), what, st: document.hidden ? 'tło' : 'ekran', bad }); if (JLOG.length > 80) JLOG.splice(0, JLOG.length - 80);
  try { localStorage.setItem('bkp_jlog', JSON.stringify(JLOG)) } catch (e) { }
}
async function diagRender() {
  let nat = []; try { nat = nativeVoice && NV.getLog ? await NV.getLog() : [] } catch (e) { }
  const BAD = /pominięte|milczy|wyciszona|limit|nie wstał|nie zdążył|przerwa dźwięku|tylko pik/;
  const all = [...JLOG.map(e => ({ ...e, src: '📱' })), ...nat.map(e => ({ at: e.at, what: e.what, st: e.st, bad: BAD.test(e.what), src: '🍏' }))].sort((a, b) => b.at - a.at).slice(0, 120);
  $('diagList').replaceChildren(...(all.length ? all.map(e => el('div', { class: e.bad || BAD.test(e.what) ? 'bad' : '' }, el('small', { text: new Date(e.at).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' · ' + e.st }), el('span', { text: e.src + ' ' + e.what }))) : [el('p', { class: 'hint', text: 'Pusto — dziennik zapełni się przy betonowaniu.' })]));
}
$('diagShow')?.addEventListener('click', diagRender);
$('diagClear')?.addEventListener('click', () => { JLOG.length = 0; try { localStorage.removeItem('bkp_jlog') } catch (e) { } diagRender() });

// ───────────────────────── ekran nocny: czarno, ciemne cyfry, apka dalej słucha i pyta ─────────────────────────
let nightLock = null, nightAskLit = false, nightTapAt = 0, nightShiftAt = 0;
function setNight(on) {
  nightOn = !!on; $('night').hidden = !nightOn; document.body.classList.toggle('night-on', nightOn); nightAskLit = false;
  if (nativeVoice && NV.setNight) NV.setNight({ on: nightOn, level: 0.03 }).catch(() => { });
  else if (nightOn) { try { navigator.wakeLock?.request('screen').then(l => { nightLock = l }).catch(() => { }) } catch (e) { } }
  else { try { nightLock?.release() } catch (e) { } nightLock = null }
  jlog(nightOn ? 'ekran nocny włączony' : 'ekran nocny wyłączony');
  if (nightOn) { nightRender(); announce('🌙 Ekran nocny — dotknij 2×, żeby wyjść') }
}
function nightRender() {
  if (!nightOn) return; const s = session, now = Date.now();
  $('ntClock').textContent = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  $('ntSite').textContent = s?.site || 'BetonKibelPlus';
  $('ntLeft').textContent = s ? fmt(left()) : '—'; $('ntPoured').textContent = s ? fmt(entriesSum()) : '—'; $('ntKursy').textContent = s ? String(s.entries.length) : '—';
  $('ntTrip').textContent = !s || s.method === 'taczka' ? '—' : phase === 'away' && deadline > now ? shortDur((deadline - now) / 1000) : phase === 'late' ? 'czekam' : 'jest';
  const asking = !!(s && alarmVisible); $('ntAsk').hidden = !asking; $('night').classList.toggle('asking', asking);
  if (asking !== nightAskLit) { nightAskLit = asking; if (nativeVoice && NV.setNight) NV.setNight({ on: true, level: asking ? 0.35 : 0.03 }).catch(() => { }) } // pytanie = jaśniej, żeby było widać
  if (now - nightShiftAt > 60000) { nightShiftAt = now; $('ntIn').style.transform = 'translate(' + Math.round(Math.random() * 16 - 8) + 'px,' + Math.round(Math.random() * 24 - 12) + 'px)' } // OLED: nie wypala się
}
$('nightBtn')?.addEventListener('click', () => setNight(true));
$('night')?.addEventListener('pointerup', e => {
  const b = e.target.closest('[data-nt]');
  if (b) { const a = b.dataset.nt; if (a === 'yes') returned(); else if (a === 'no') delay(); else delay({ sec: 120 }); buzz?.('light'); nightRender(); return }
  const now = Date.now(); if (now - nightTapAt < 450) { nightTapAt = 0; setNight(false) } else nightTapAt = now;
});

// ───────────────────────── moje kosze ─────────────────────────
let editingId = '', formPhotos = [];
for (const [k, s] of Object.entries(SHAPES)) { const o = el('option', { value: k, text: s.label }); if (s.hidden) o.hidden = true; $('bShape').append(o) }
let formProfile = null;
function thumbFromFile(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onerror = () => rej(Error('zdjęcie')); r.onload = () => { const img = new Image(); img.onerror = () => rej(Error('zdjęcie')); img.onload = () => { const c = document.createElement('canvas'); const k = Math.min(1, 440 / Math.max(img.width, img.height)); c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .6)) }; img.src = r.result }; r.readAsDataURL(file) }) }
function dimFields(shape, values = {}) {
  const box = $('bDims'); box.replaceChildren();
  if (shape === 'profile') { formProfile = values && values.hs ? values : formProfile; box.append(el('p', { class: 'hint', style: 'grid-column:1/-1', text: formProfile ? '📐 Kształt ze zdjęcia: wys. ' + Math.round(formProfile.h) + ' cm, góra Ø ' + Math.round(formProfile.ds.at(-1)) + ' cm, wylew Ø ' + Math.round(formProfile.ds[0]) + ' cm' + (formProfile.ds.length > 2 ? ', z początkiem lejka' : '') : 'Brak profilu — użyj „Policz ze zdjęć”.' })); $('bShapeHint').textContent = SHAPES.profile.hint; bucketPreview(); return }
  for (const [k, label, ph] of SHAPES[shape].fields) {
    const inp = el('input', { id: 'bd_' + k, inputmode: 'decimal', placeholder: 'np. ' + ph }); if (values[k] != null) inp.value = fmt(values[k]);
    inp.addEventListener('input', () => { formEstimated = false; $('bd_e')?.remove(); bucketPreview() });
    box.append(el('div', {}, el('label', { class: 'label', for: 'bd_' + k, text: label }), inp));
  }
  if (values.e) box.append(el('input', { type: 'hidden', id: 'bd_e', value: String(values.e) }));
  $('bShapeHint').textContent = SHAPES[shape].hint; bucketPreview();
}
function formDims() { const shape = $('bShape').value; if (shape === 'profile') return cleanDims('profile', formProfile); const raw = { e: $('bd_e')?.value }; for (const [k] of SHAPES[shape].fields) raw[k] = $('bd_' + k)?.value; return cleanDims(shape, raw) }
function bucketPreview() {
  const shape = $('bShape').value, dims = shape === 'plate' ? null : formDims(), geo = dims ? geoCapacity(shape, dims) : null, plate = number($('bPlate').value), real = number($('bReal').value);
  const box = $('bPreview'); box.replaceChildren();
  if (!geo && !(plate > 0) && !(real > 0)) { box.append(el('div', { class: 'muted', text: shape === 'plate' ? 'Wpisz pojemność z tabliczki albo ile faktycznie wchodzi.' : 'Wpisz wymiary albo użyj „Policz ze zdjęć” — policzę pojemność i kreski.' })); return }
  const cap = real > 0 ? real : plate > 0 ? plate : geo;
  box.append(el('div', { class: 'calc-main', text: (real > 0 ? 'Faktycznie wchodzi: ' : 'Pojemność: ') + fmt(cap) + ' m³' + (formEstimated ? ' (szacunek ze zdjęć)' : '') }));
  if (real > 0 && plate > 0 && Math.abs(real - plate) > .005) box.append(el('div', { class: 'muted', text: 'Tabliczka: ' + fmt(plate) + ' m³ · realnie ' + Math.round(real / plate * 100) + '% tego' }));
  if (geo) box.append(el('div', { class: 'muted', text: 'Z wymiarów do krawędzi: ' + fmt(geo) + ' m³' + (plate > 0 ? ' · tabliczka: ' + fmt(plate) + ' m³' : '') }));
  if (geo && plate > 0 && Math.abs(plate - geo) / geo > 0.25) box.append(el('div', { class: 'error', text: '⚠️ Tabliczka i wymiary bardzo się różnią — sprawdź pomiar.' }));
  if (dims) {
    const m = bucketModel({ shape, dims, capacity: cap }, cap);
    const rows = bucketMarks(cap).map(v => el('div', { class: 'mark-row' }, el('b', { text: fmt(v) + ' m³' }), el('span', { text: Math.round(m.heightCm(v)) + ' cm od dna · ' + Math.round(m.belowRimCm(v)) + ' cm pod krawędzią' })));
    box.append(el('div', { class: 'marks' }, ...rows));
  }
}
$('bShape').addEventListener('change', () => dimFields($('bShape').value)); $('bPlate').addEventListener('input', bucketPreview); $('bReal').addEventListener('input', bucketPreview);
const addFormPhotos = async e => {
  for (const f of [...(e.target.files || [])].slice(0, 4)) { try { formPhotos.push(await thumbFromFile(f)) } catch (err) { $('bError').textContent = 'Nie odczytano zdjęcia' } }
  formPhotos = formPhotos.slice(-4); thumbsRender(); e.target.value = '';
};
$('bPhotos').addEventListener('change', addFormPhotos); $('bPhotosCam').addEventListener('change', addFormPhotos);
function thumbsRender() { const t = $('bPhotoThumbs'); t.replaceChildren(...formPhotos.map((src, i) => el('button', { type: 'button', class: 'thumb', title: 'Usuń', onclick: () => { formPhotos.splice(i, 1); thumbsRender() } }, el('img', { src, alt: '' })))) }
function openBucketForm(p = null, kind = null) {
  editingId = p?.id || ''; formEstimated = !!p?.estimated; formPhotos = (p?.photos || []).map(x => x.data || x).filter(Boolean);
  $('bucketFormTitle').textContent = p ? 'Edytuj kosz' : 'Nowy kosz';
  $('bKind').value = p ? kindOf(p) : (kind || 'kosz'); $('bucketFormTitle').textContent = (p ? 'Edytuj: ' : 'Nowy: ') + KINDS[$('bKind').value][1].toLowerCase();
  $('bName').value = p?.name || ''; $('bShape').value = p?.shape && SHAPES[p.shape] ? p.shape : 'cone';
  $('bPlate').value = p?.plate ? fmt(p.plate) : (p && !p.dims && !p.real ? fmt(p.capacity) : '');
  $('bReal').value = p?.real ? fmt(p.real) : (p?.dims ? fmt(p.capacity) : '');
  ['lmW', 'lmL', 'lmH'].forEach(id => $(id).value = '');
  $('bError').textContent = ''; formSimple(); dimFields($('bShape').value, p?.dims || {}); thumbsRender();
  $('bucketForm').classList.remove('hide'); $('newBucket').classList.add('hide'); $('bName').focus();
}

/* ───── katalog koszy Eichinger (dane katalogowe producenta; mm, kg) ───── */
const EICH = [
  ['1011', 'stożkowy, prosty wysyp', [['1011.8', 500, 1140, 1300, 194], ['1011.9', 600, 1200, 1360, 210], ['1011.10', 750, 1240, 1430, 236], ['1011.11', 800, 1300, 1460, 252], ['1011.12', 1000, 1350, 1590, 286]]],
  ['1012', 'cylindryczno-stożkowy, prosty wysyp', [['1012.8', 500, 1040, 1320, 200], ['1012.9', 600, 1040, 1420, 230], ['1012.10', 750, 1040, 1620, 260], ['1012.11', 800, 1040, 1720, 270], ['1012.12', 1000, 1140, 1760, 295], ['1012.13', 1250, 1400, 1710, 320], ['1012.14', 1500, 1400, 1910, 390], ['1012.16', 2000, 1400, 2260, 560]]],
  ['1021', 'boczny wysyp, bez rękawa', [['1021.8', 500, 970, 1600, 162], ['1021.9', 600, 970, 1700, 180], ['1021.10', 750, 1150, 1720, 230], ['1021.11', 800, 1150, 1770, 245], ['1021.12', 1000, 1300, 1780, 275], ['1021.13', 1250, 1400, 1900, 358], ['1021.14', 1500, 1400, 2100, 405], ['1021.16', 2000, 1600, 2250, 465]]],
  ['1023', 'boczny wysyp z rękawem', [['1023.8', 500, 970, 1850, 230], ['1023.10', 750, 1150, 1970, 270], ['1023.12', 1000, 1300, 2030, 310], ['1023.13', 1250, 1400, 2150, 350], ['1023.14', 1500, 1400, 2350, 385], ['1023.16', 2000, 1600, 2500, 500]]],
  ['1018', '„sanki” z rękawem', [['1018.8', 500, 1040, 1750, 210], ['1018.9', 600, 1040, 1780, 230], ['1018.10', 750, 1400, 1700, 250], ['1018.11', 800, 1400, 1780, 280], ['1018.12', 1000, 1400, 1850, 290], ['1018.13', 1250, 1600, 1800, 330], ['1018.14', 1500, 1600, 1900, 365], ['1018.16', 2000, 1600, 2100, 480]]],
  ['1019', '„sanki” ze sztywnym wylotem', [['1019.8', 500, 1040, 1490, 218], ['1019.9', 600, 1040, 1520, 240], ['1019.10', 750, 1400, 1560, 320], ['1019.11', 800, 1400, 1590, 380], ['1019.12', 1000, 1400, 1710, 420], ['1019.13', 1250, 1600, 1730, 540], ['1019.14', 1500, 1600, 1840, 590], ['1019.16', 2000, 1600, 2150, 860]]],
];
const eichAll = () => EICH.flatMap(([ser, desc, rows]) => rows.map(([typ, l, D, H, kg]) => ({ ser, desc, typ, l, D, H, kg })));
const eichMass = m => 'z betonem ≈ ' + Math.round(m.l / 1000 * 2400 + m.kg).toLocaleString('pl-PL') + ' kg (beton ' + Math.round(m.l / 1000 * 2400).toLocaleString('pl-PL') + ' + kosz ' + m.kg + ')';
/** dopasuj model po średnicy i wysokości (cm) */
function eichMatch(Dcm, Hcm) { if (!(Dcm > 30 && Hcm > 30)) return []; return eichAll().map(m => ({ m, e: Math.abs(m.D / 10 - Dcm) / (m.D / 10) + Math.abs(m.H / 10 - Hcm) / (m.H / 10) })).filter(x => x.e < .16).sort((a, b) => a.e - b.e).slice(0, 3) }
function eichProfile(m) {
  let p = profiles.find(x => x.catalog?.typ === m.typ);
  if (!p) { p = { id: 'bucket-' + Date.now(), kind: 'kosz', name: 'Eichinger ' + m.typ + ' · ' + m.l + ' l', shape: 'plate', plate: m.l / 1000, capacity: m.l / 1000, catalog: { maker: 'Eichinger', ...m }, created: Date.now(), photos: [] }; profiles.push(p); saveProfiles() }
  return p;
}
/* 6 podstawowych do wyboru (reszta wariantów jest w systemie — pojemności w każdym) */
const EICH_BASIC = [
  ['Prosty wysyp', [['1011', 'Prosty stożkowy', 'zwęża się w dół, wylot na dole'], ['1012', 'Prosty walcowy', 'proste ścianki + lejek na dole']]],
  ['Kształt L (boczny wylot)', [['1021', 'L — boczny wysyp', 'pionowy, wylot z boku'], ['1019', 'L — sanki', 'leżący, sztywny wylot']]],
  ['Z rękawem', [['1023', 'Rękaw — boczny', 'pionowy, wylot z rękawem'], ['1018', 'Rękaw — sanki', 'leżący, z rękawem']]],
];
const eichIco = ser => {
  const lean = x => `<path d="M${x} 16L${x} 61h-3" stroke-width="2"/>`;
  const sleeve = (x, y) => `<path d="M${x - 4} ${y}h8l2 16q-6 3-12 0z" fill="color-mix(in srgb,#ff9a2e 55%,transparent)" stroke="#ff9a2e" stroke-width="1.5"/><path d="M${x - 4.5} ${y + 5}h9M${x - 5} ${y + 10}h10" stroke="#ff9a2e" stroke-width=".8" opacity=".8"/>`;
  const sankiBody = `<path d="M6 22h40l8 8v10H6z" fill="${KF}"/><path d="M5 22h42" stroke-width="3"/><path d="M14 22v18M26 22v18M38 22v18" stroke-width=".9" opacity=".6"/><path d="M4 46h46q6 0 7-5M4 46q-2 0-1-3" stroke-width="2.2"/><path d="M10 40v6M44 40v6" stroke-width="1.6"/><path d="M8 22L28 8M44 22L28 8" stroke-width="1.3"/><circle cx="28" cy="6.5" r="2.4" stroke-width="1.6"/>`;
  const upright = side => `${kBail(16, 46, 14)}<path d="M14 14h34v26L38 50H26V44L14 40z" fill="${KF}"/><path d="M12.5 14h37" stroke-width="3.2"/><path d="M15 19h32" stroke-width=".9" opacity=".6"/><path d="M15 36L10 61h-3M47 36L52 61h3" stroke-width="2"/>`;
  const art = {
    '1011': () => tplSvg('cone', { dTop: 110, dBottom: 55, h: 100 }).innerHTML,
    '1012': () => tplSvg('cylcone', { d: 110, hCyl: 55, hCone: 45, dOut: 30 }).innerHTML,
    '1021': () => upright() + `<path d="M38 44h12l2 6H38z" fill="${KD}"/>` + kLever(50, 46, 56, 30),
    '1023': () => upright() + `<path d="M38 44h8v4h-8z" fill="${KD}"/>` + sleeve(42, 48) + kLever(46, 45, 56, 30),
    '1019': () => sankiBody + `<path d="M54 30h7v7h-7z" fill="${KD}"/>` + kLever(52, 28, 58, 18),
    '1018': () => sankiBody + `<path d="M50 40h8v3h-8z" fill="${KD}"/>` + `<g transform="translate(0,-2)">${sleeve(54, 45)}</g>` + kLever(52, 28, 58, 18),
  };
  const svg = kSvg(''); const inner = (art[ser] || art['1011'])(); svg.innerHTML = inner.startsWith('<g') ? inner : `<g fill="none" stroke="${KS}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`; return svg };
async function eichPick() {
  let ser = '', chosen = null;
  const grid = el('div', { class: 'eich-basic' }), list = el('div', { class: 'eich-list' });
  const draw = () => {
    grid.replaceChildren(...EICH_BASIC.flatMap(([grp, items]) => [el('div', { class: 'eich-grp', text: grp }), ...items.map(([s2, name, sub]) => el('button', { type: 'button', class: 'tpl eich-type' + (s2 === ser ? ' on' : ''), onclick: () => { ser = s2; chosen = null; draw() } }, eichIco(s2), el('b', { text: name }), el('small', { text: sub + ' · ' + s2 })))]));
    if (!ser) { list.replaceChildren(el('p', { class: 'hint', text: 'Wybierz kształt kosza, potem pojemność.' })); return }
    const [, desc, rows] = EICH.find(x => x[0] === ser);
    list.replaceChildren(el('div', { class: 'eich-grp', text: 'Pojemność — Eichinger ' + ser + ' (' + desc + ')' }), ...rows.map(([typ, l, D, H, kg]) => { const m = { ser, desc, typ, l, D, H, kg }; return el('button', { type: 'button', class: 'eich-row' + (chosen?.typ === typ ? ' on' : ''), onclick: () => { chosen = m; draw() } }, el('b', { text: (l / 1000).toLocaleString('pl-PL') + ' m³' }), el('span', { text: typ }), el('small', { text: 'Ø ' + D / 10 + ' cm · wys. ' + H / 10 + ' cm · ' + eichMass(m) })) }));
  };
  draw();
  const body = el('div', {}, grid, list);
  if (!(await formModal('🏷 Kosz Eichinger', body, '✓ Wybierz'))) return null;
  if (!chosen) { announce('Wybierz kształt i pojemność'); return null }
  return eichProfile(chosen);
}
/* łyżki: [rodzaj, klasa, szerokość mm, litry SAE, producent+model] — 496 wariantów z katalogu PL/DE */
const LYZ_ROWS = [[0,0,200,16,"ZMG LK-ZMG1-200"],[0,0,220,23,"Lehnhoff MTL 1"],[0,0,220,25,"Lehnhoff MTL 1 S"],[0,0,250,12,"Sieruta GP-10"],[0,0,250,14,"Sieruta GPL-10"],[0,0,250,20,"Sieruta GPL-20"],[0,0,250,21,"Sieruta GP-20"],[0,0,250,26,"Lehnhoff MTL 1"],[0,0,250,29,"Lehnhoff MTL 1 S"],[0,0,250,30,"SolidHitch DB01-250"],[0,0,300,15,"Sieruta GP-10"],[0,0,300,18,"Sieruta GPL-10"],[0,0,300,25,"Sieruta GPL-20"],[0,0,300,27,"Sieruta GP-20"],[0,0,300,30,"Lehnhoff MTL 1"],[0,0,300,33,"Lehnhoff MTL 1 S"],[0,0,300,36,"Sieruta GP-30"],[0,0,300,40,"Lehnhoff MTL 2"],[0,0,300,44,"Lehnhoff MTL 2 S"],[0,0,350,32,"ZMG LK-ZMG1-350"],[0,0,400,22,"Sieruta GP-10"],[0,0,400,25,"Sieruta GPL-10"],[0,0,400,37,"Sieruta GPL-20"],[0,0,400,39,"Sieruta GP-20"],[0,0,400,40,"Lehnhoff MTL 1"],[0,0,400,42,"SolidHitch DB01-400"],[0,0,400,44,"Lehnhoff MTL 1 S"],[0,0,400,48,"Sieruta GPL-30"],[0,0,400,53,"Sieruta GP-30"],[0,0,400,57,"SolidHitch DB02-400"],[0,0,400,60,"Lehnhoff MTL 2"],[0,0,400,66,"Lehnhoff MTL 2 S"],[0,0,450,70,"ZD Solution DB02"],[0,0,500,28,"Sieruta GP-10"],[0,0,500,32,"Sieruta GPL-10"],[0,0,500,48,"Sieruta GPL-20"],[0,0,500,50,"Lehnhoff MTL 1"],[0,0,500,55,"Lehnhoff MTL 1 S"],[0,0,500,64,"Sieruta GPL-30"],[0,0,500,65,"SolidHitch DB02-500"],[0,0,500,71,"Sieruta GP-30"],[0,0,500,80,"Lehnhoff MTL 2"],[0,0,500,88,"Lehnhoff MTL 2 S"],[0,0,550,90,"ZD Solution DB02"],[0,0,600,59,"Sieruta GPL-20"],[0,0,600,60,"Lehnhoff MTL 1"],[0,0,600,61,"Sieruta GP-20"],[0,0,600,66,"Lehnhoff MTL 1 S"],[0,0,600,79,"Sieruta GPL-30"],[0,0,600,88,"Sieruta GP-30"],[0,0,600,90,"SolidHitch DB02-600"],[0,0,600,97,"Lehnhoff MTL 2"],[0,0,600,107,"Lehnhoff MTL 2 S"],[0,0,700,69,"ZMG LK-ZMG1-700"],[0,0,800,79,"ZMG LK-ZMG1-800"],[0,1,250,30,"ZMG LK-ZMG2-250"],[0,1,300,38,"ZMG LK-ZMG2-300"],[0,1,300,43,"Sieruta GPL-40"],[0,1,300,46,"Sieruta GP-40"],[0,1,300,50,"SolidHitch DB02-300"],[0,1,300,56,"Lehnhoff MTL 3"],[0,1,300,62,"Lehnhoff MTL 3 S"],[0,1,300,66,"Lehnhoff MTL 4"],[0,1,300,73,"Lehnhoff MTL 4 S"],[0,1,300,80,"SolidHitch DB03-300"],[0,1,350,46,"ZMG LK-ZMG2-350"],[0,1,400,53,"ZMG LK-ZMG2-400"],[0,1,400,60,"SolidHitch DB02-400"],[0,1,400,62,"Sieruta GPL-40"],[0,1,400,69,"Sieruta GP-40"],[0,1,400,75,"Lehnhoff MTL 3"],[0,1,400,83,"Lehnhoff MTL 3 S"],[0,1,400,96,"Lehnhoff MTL 4"],[0,1,400,100,"SolidHitch DB03-400"],[0,1,400,106,"Lehnhoff MTL 4 S"],[0,1,500,69,"ZMG LK-ZMG2-500"],[0,1,500,80,"SolidHitch DB02-500"],[0,1,500,82,"Sieruta GPL-40"],[0,1,500,91,"Sieruta GP-40"],[0,1,500,100,"Lehnhoff MTL 3"],[0,1,500,110,"Lehnhoff MTL 3 S"],[0,1,500,125,"SolidHitch DB04-500"],[0,1,500,130,"Lehnhoff MTL 4"],[0,1,500,143,"Lehnhoff MTL 4 S"],[0,1,550,120,"ZD Solution DB03"],[0,1,600,85,"ZMG LK-ZMG2-600"],[0,1,600,100,"SolidHitch DB02-600"],[0,1,600,103,"Sieruta GPL-40"],[0,1,600,114,"Sieruta GP-40"],[0,1,600,127,"Lehnhoff MTL 3"],[0,1,600,140,"Lehnhoff MTL 3 S"],[0,1,600,160,"SolidHitch DB04-600"],[0,1,600,162,"Lehnhoff MTL 4"],[0,1,600,178,"Lehnhoff MTL 4 S"],[0,1,700,100,"ZMG LK-ZMG2-700"],[0,1,700,125,"SolidHitch DB03-700"],[0,1,700,185,"SolidHitch DB04-700"],[0,1,800,116,"ZMG LK-ZMG2-800"],[0,1,800,145,"Sieruta GPL-40"],[0,1,800,159,"Sieruta GP-40"],[0,1,800,180,"Lehnhoff MTL 3"],[0,1,800,198,"Lehnhoff MTL 3 S"],[0,1,800,210,"SolidHitch DB04-800"],[0,1,800,230,"Lehnhoff MTL 4"],[0,1,800,253,"Lehnhoff MTL 4 S"],[0,2,300,60,"Sieruta GP-60"],[0,2,300,62,"Sieruta GPL-60"],[0,2,300,71,"Sieruta GPL-75"],[0,2,300,82,"Sieruta GPL-95"],[0,2,300,88,"Lehnhoff MTL 6 S"],[0,2,300,90,"Lehnhoff CTL 5"],[0,2,300,98,"Metal-Technik LA.KPS.NHB115-300"],[0,2,300,100,"Lehnhoff CTL 5 S"],[0,2,350,118,"Metal-Technik LA.KPS.NHB115-350"],[0,2,400,90,"Sieruta GPL-60"],[0,2,400,93,"Sieruta GP-60"],[0,2,400,104,"Sieruta GPL-75"],[0,2,400,119,"Sieruta GP-95"],[0,2,400,120,"Lehnhoff MTL 6"],[0,2,400,130,"Lehnhoff CTL 5"],[0,2,400,132,"Lehnhoff MTL 6 S"],[0,2,400,137,"Metal-Technik LA.KPS.NHB115-400"],[0,2,400,150,"SolidHitch DB06-400"],[0,2,450,156,"Metal-Technik LA.KPS.NHB115-450"],[0,2,500,119,"Sieruta GPL-60"],[0,2,500,126,"Sieruta GP-60"],[0,2,500,139,"Sieruta GPL-75"],[0,2,500,140,"Lehnhoff MTL 6"],[0,2,500,154,"Lehnhoff MTL 6 S"],[0,2,500,159,"Sieruta GPL-95"],[0,2,500,162,"Sieruta GP-95"],[0,2,500,170,"Lehnhoff CTL 5"],[0,2,500,175,"Metal-Technik LA.KPS.NHB115-500"],[0,2,500,185,"Lehnhoff CTL 5 S"],[0,2,500,190,"SolidHitch DB06-500"],[0,2,600,150,"Sieruta GPL-60"],[0,2,600,159,"Sieruta GP-60"],[0,2,600,160,"ZD Solution DB05"],[0,2,600,175,"Sieruta GPL-75"],[0,2,600,180,"Lehnhoff MTL 6"],[0,2,600,198,"Lehnhoff MTL 6 S"],[0,2,600,199,"Sieruta GPL-95"],[0,2,600,200,"SolidHitch DB04-600"],[0,2,600,205,"Sieruta GP-95"],[0,2,600,210,"Lehnhoff CTL 5"],[0,2,600,214,"Metal-Technik LA.KPS.NHB115-600"],[0,2,600,230,"Lehnhoff CTL 5 S"],[0,2,600,250,"SolidHitch DB06-600"],[0,2,700,240,"SolidHitch DB06-700"],[0,2,700,250,"ZD Solution DB07"],[0,2,700,280,"SolidHitch DB08-700"],[0,2,800,211,"Sieruta GPL-60"],[0,2,800,226,"Sieruta GP-60"],[0,2,800,248,"Sieruta GPL-75"],[0,2,800,250,"Lehnhoff MTL 6"],[0,2,800,275,"Lehnhoff MTL 6 S"],[0,2,800,280,"SolidHitch DB06-800"],[0,2,800,283,"Sieruta GPL-95"],[0,2,800,290,"Metal-Technik LA.KPS.NHB115-800"],[0,2,800,291,"Sieruta GP-95"],[0,2,800,300,"Lehnhoff CTL 5"],[0,2,800,310,"SolidHitch DB08-800"],[0,2,800,325,"Lehnhoff CTL 5 S"],[0,2,900,328,"Metal-Technik LA.KPS.NHB115-900"],[0,2,900,340,"Lehnhoff CTL 5"],[0,2,900,350,"SolidHitch DB08-900"],[0,2,900,370,"Lehnhoff CTL 5 S"],[0,2,1000,272,"Sieruta GPL-60"],[0,2,1000,292,"Sieruta GP-60"],[0,2,1000,320,"Lehnhoff MTL 6"],[0,2,1000,321,"Sieruta GPL-75"],[0,2,1000,352,"Lehnhoff MTL 6 S"],[0,2,1000,367,"Sieruta GPL-95"],[0,2,1000,377,"Sieruta GP-95"],[0,2,1000,380,"Lehnhoff CTL 5"],[0,2,1000,415,"Lehnhoff CTL 5 S"],[0,3,300,105,"Lehnhoff CTL 10"],[0,3,300,130,"Lehnhoff CTL 12"],[0,3,400,139,"Sieruta DB-120"],[0,3,400,143,"ZMG LK-ZMG5-400"],[0,3,400,155,"Lehnhoff CTL 10"],[0,3,400,170,"Lehnhoff CTL 12"],[0,3,400,175,"Lehnhoff CTL 10 S"],[0,3,400,190,"SolidHitch DB08-400"],[0,3,500,190,"Sieruta DB-120"],[0,3,500,200,"Lehnhoff CTL 10"],[0,3,500,220,"Lehnhoff CTL 10 S"],[0,3,500,225,"Lehnhoff CTL 12"],[0,3,500,250,"SolidHitch DB08-500"],[0,3,600,240,"ZMG LK-ZMG5-600"],[0,3,600,244,"Sieruta DB-120"],[0,3,600,255,"Lehnhoff CTL 10"],[0,3,600,280,"Lehnhoff CTL 12"],[0,3,600,292,"Sieruta DB-160"],[0,3,600,300,"SolidHitch DB08-600"],[0,3,700,292,"ZMG LK-ZMG5-700"],[0,3,700,350,"SolidHitch DB09-700"],[0,3,700,400,"ZD Solution DB11"],[0,3,800,344,"ZMG LK-ZMG5-800"],[0,3,800,356,"Sieruta DB-120"],[0,3,800,360,"Lehnhoff CTL 10"],[0,3,800,395,"Lehnhoff CTL 12"],[0,3,800,400,"Lehnhoff CTL 10 S"],[0,3,800,434,"Sieruta DB-160"],[0,3,800,500,"ZD Solution DB12"],[0,3,850,600,"ZD Solution DB13"],[0,3,900,397,"ZMG LK-ZMG5-900"],[0,3,900,410,"Lehnhoff CTL 10"],[0,3,900,450,"Lehnhoff CTL 12"],[0,3,900,650,"ZD Solution DB14"],[0,3,1000,450,"ZMG LK-ZMG5-1000"],[0,3,1000,460,"Lehnhoff CTL 10"],[0,3,1000,475,"Sieruta DB-120"],[0,3,1000,500,"SolidHitch DB12-1000"],[0,3,1000,510,"Lehnhoff CTL 12"],[0,3,1000,584,"Sieruta DB-160"],[0,3,1100,502,"ZMG LK-ZMG5-1100"],[0,3,1100,550,"SolidHitch DB12-1100"],[0,3,1100,570,"Lehnhoff CTL 12"],[0,3,1200,597,"Sieruta DB-120"],[0,3,1200,620,"Lehnhoff CTL 12"],[0,3,1200,740,"Sieruta DB-160"],[0,4,500,300,"SolidHitch DB13-500"],[0,4,600,374,"Sieruta DB-190"],[0,4,600,391,"Sieruta DB-230"],[0,4,600,400,"SolidHitch DB14-600"],[0,4,600,480,"SolidHitch DB18-600"],[0,4,700,500,"SolidHitch DB14-700"],[0,4,700,580,"SolidHitch DB18-700"],[0,4,800,557,"Sieruta DB-190"],[0,4,800,582,"Sieruta DB-230"],[0,4,800,600,"SolidHitch DB14-800"],[0,4,800,680,"SolidHitch DB18-800"],[0,4,900,700,"SolidHitch DB16-900"],[0,4,900,780,"SolidHitch DB18-900"],[0,4,1000,750,"ZD Solution DB16"],[0,4,1000,751,"Sieruta DB-190"],[0,4,1000,786,"Sieruta DB-230"],[0,4,1000,800,"SolidHitch DB18-1000"],[0,4,1000,880,"SolidHitch DB18-1000"],[0,4,1000,900,"ZD Solution DB18"],[0,4,1100,900,"SolidHitch DB18-1100"],[0,4,1100,1080,"SolidHitch DB20-1100"],[0,4,1100,1100,"ZD Solution DB21"],[0,4,1200,955,"Sieruta DB-190"],[0,4,1200,1000,"SolidHitch DB18-1200"],[0,4,1200,1001,"Sieruta DB-230"],[0,4,1200,1180,"SolidHitch DB22-1200"],[0,4,1300,1280,"SolidHitch DB22-1300"],[0,4,1400,1164,"Sieruta DB-190"],[0,4,1400,1222,"Sieruta DB-230"],[0,4,1500,1335,"Sieruta DB-230"],[0,5,800,628,"Sieruta DB-300"],[0,5,800,800,"SolidHitch DB22-800"],[0,5,900,900,"SolidHitch DB22-900"],[0,5,1000,848,"Sieruta DB-300"],[0,5,1000,1000,"SolidHitch DB22-1000"],[0,5,1000,1082,"Sieruta DB-400"],[0,5,1100,1100,"SolidHitch DB22-1100"],[0,5,1200,1079,"Sieruta DB-300"],[0,5,1200,1200,"SolidHitch DB23-1200"],[0,5,1200,1376,"Sieruta DB-400"],[0,5,1300,1300,"SolidHitch DB25-1300"],[0,5,1300,1400,"ZD Solution DB26"],[0,5,1400,1325,"Sieruta DB-300"],[0,5,1400,1450,"SolidHitch DB28-1400"],[0,5,1400,1682,"Sieruta DB-400"],[0,5,1400,1988,"Sieruta DB-500"],[0,5,1450,1600,"ZD Solution DB29"],[0,5,1500,1447,"Sieruta DB-300"],[0,5,1500,1839,"Sieruta DB-400"],[0,5,1500,2176,"Sieruta DB-500"],[0,5,1600,1569,"Sieruta DB-300"],[0,5,1600,1967,"Sieruta DB-400"],[0,5,1600,2367,"Sieruta DB-500"],[0,5,1700,1800,"ZD Solution DB32"],[0,5,1800,2288,"Sieruta DB-400"],[0,5,1800,2755,"Sieruta DB-500"],[0,6,300,65,"ZMG LK-ZMG3-300"],[0,6,350,80,"ZMG LK-ZMG3-350"],[0,6,350,100,"ZMG LK-ZMG4-350"],[0,6,400,94,"ZMG LK-ZMG3-400"],[0,6,400,118,"ZMG LK-ZMG4-400"],[0,6,450,94,"ZMG LK-ZMG3-450"],[0,6,500,125,"ZMG LK-ZMG3-500"],[0,6,500,155,"ZMG LK-ZMG4-500"],[0,6,600,157,"ZMG LK-ZMG3-600"],[0,6,600,193,"ZMG LK-ZMG4-600"],[0,6,700,189,"ZMG LK-ZMG3-700"],[0,6,700,231,"ZMG LK-ZMG4-700"],[0,6,800,221,"ZMG LK-ZMG3-800"],[0,6,800,269,"ZMG LK-ZMG4-800"],[0,6,900,307,"ZMG LK-ZMG4-900"],[0,6,1000,345,"ZMG LK-ZMG4-1000"],[0,6,1100,384,"ZMG LK-ZMG4-1100"],[1,0,250,30,"SolidHitch CB01-250"],[1,0,250,42,"SolidHitch CB02-250"],[1,0,300,36,"SolidHitch CB01-300"],[1,0,300,44,"SolidHitch CB02-300"],[1,1,300,55,"SolidHitch CB02-300"],[1,1,300,65,"SolidHitch CB02-300"],[1,1,300,70,"SolidHitch CB03-300"],[1,1,400,80,"SolidHitch CB03-400"],[1,2,300,90,"SolidHitch CB04-300"],[1,2,300,130,"SolidHitch CB06-300"],[1,2,400,130,"SolidHitch CB06-400"],[1,2,400,160,"SolidHitch CB08-400"],[1,3,400,190,"SolidHitch CB08-400"],[1,3,500,275,"SolidHitch CB12-500"],[1,4,400,300,"SolidHitch CB13-400"],[1,4,500,350,"SolidHitch CB15-500"],[1,4,600,400,"SolidHitch CB18-600"],[1,4,600,450,"SolidHitch CB20-500"],[1,4,700,550,"SolidHitch CB22-500"],[1,5,600,550,"SolidHitch CB22-600"],[1,5,700,650,"SolidHitch CB25-700"],[1,5,800,750,"SolidHitch CB28-800"],[2,0,800,40,"Lehnhoff MG 09"],[2,0,850,73,"Lehnhoff MG 1"],[2,0,850,77,"Lehnhoff MG 2"],[2,0,1000,86,"Lehnhoff MG 1"],[2,0,1000,92,"Lehnhoff MG 2"],[2,0,1200,106,"Lehnhoff MG 1"],[2,0,1200,117,"Lehnhoff MG 2"],[2,1,1000,136,"Lehnhoff MG 3"],[2,1,1000,185,"Lehnhoff MG 4"],[2,1,1200,165,"Lehnhoff MG 3"],[2,1,1200,230,"Lehnhoff MG 4"],[2,1,1400,270,"Lehnhoff MG 4"],[2,1,1500,290,"Lehnhoff MG 4"],[2,2,1200,255,"Lehnhoff MG 6"],[2,2,1200,267,"Lehnhoff CU 5 GH"],[2,2,1400,300,"Lehnhoff MG 6"],[2,2,1400,318,"Lehnhoff CU 5 GH"],[2,2,1500,280,"Lehnhoff CG 5 H"],[2,2,1600,345,"Lehnhoff MG 6"],[2,2,1800,340,"Lehnhoff CG 5 H"],[2,3,1200,350,"Lehnhoff CU 10 GM"],[2,3,1200,420,"Lehnhoff CU 10 GH"],[2,3,1400,400,"Lehnhoff CU 10 GM"],[2,3,1400,500,"Lehnhoff CU 10 GH"],[2,3,1500,350,"Lehnhoff CG 10 H"],[2,3,1600,744,"Sieruta PS-160"],[2,3,1800,420,"Lehnhoff CG 10 H"],[2,3,1800,872,"Sieruta PS-160"],[2,3,2000,1000,"Sieruta PS-160"],[2,3,2100,1064,"Sieruta PS-160"],[2,4,1800,937,"Sieruta PS-190"],[2,4,1800,1179,"Sieruta PS-230"],[2,4,2000,1083,"Sieruta PS-190"],[2,4,2000,1374,"Sieruta PS-230"],[2,4,2100,1155,"Sieruta PS-190"],[2,4,2100,1472,"Sieruta PS-230"],[2,4,2200,1228,"Sieruta PS-190"],[2,4,2200,1570,"Sieruta PS-230"],[2,5,1800,1389,"Sieruta PS-300"],[2,5,2000,1609,"Sieruta PS-300"],[2,5,2100,1720,"Sieruta PS-300"],[2,5,2200,1830,"Sieruta PS-300"],[3,0,800,39,"Sieruta GBH-10"],[3,0,800,57,"Sieruta GBH-20"],[3,0,800,60,"SolidHitch TCB01-800"],[3,0,900,70,"SolidHitch TCB02-900"],[3,0,1000,50,"Sieruta GBH-10"],[3,0,1000,72,"Sieruta GBH-20"],[3,0,1000,80,"SolidHitch TCB02-1000"],[3,0,1000,93,"Sieruta GBH-30"],[3,0,1100,90,"SolidHitch TCB02-1100"],[3,0,1200,85,"Sieruta GBH-20"],[3,0,1200,100,"SolidHitch TCB02-1200"],[3,0,1200,114,"Sieruta GBH-30"],[3,1,1000,115,"SolidHitch TCB03-1000"],[3,1,1000,124,"Sieruta GBH-40"],[3,1,1000,140,"SolidHitch TCB03-1000"],[3,1,1100,130,"SolidHitch TCB03-1100"],[3,1,1100,160,"SolidHitch TCB03-1100"],[3,1,1200,145,"SolidHitch TCB03-1200"],[3,1,1200,150,"Sieruta GBH-40"],[3,1,1200,180,"SolidHitch TCB03-1200"],[3,1,1400,160,"SolidHitch TCB03-1400"],[3,1,1400,176,"Sieruta GBH-40"],[3,1,1400,200,"SolidHitch TCB04-1400"],[3,1,1500,190,"Sieruta GBH-40"],[3,1,1500,220,"SolidHitch TCB04-1500"],[3,2,1200,187,"Sieruta GBH-60"],[3,2,1200,200,"SolidHitch TCB04-1200"],[3,2,1200,275,"SolidHitch TCB06-1200"],[3,2,1300,220,"SolidHitch TCB04-1300"],[3,2,1300,300,"SolidHitch TCB04-1300"],[3,2,1400,220,"Sieruta GBH-60"],[3,2,1400,240,"SolidHitch TCB04-1400"],[3,2,1400,325,"SolidHitch TCB06-1400"],[3,2,1500,236,"Sieruta GBH-60"],[3,2,1500,260,"SolidHitch TCB06-1500"],[3,2,1500,275,"Sieruta GBH-90"],[3,2,1500,350,"SolidHitch TCB08-1500"],[3,2,1600,253,"Sieruta GBH-60"],[3,2,1600,280,"SolidHitch TCB06-1600"],[3,2,1600,295,"Sieruta GBH-90"],[3,2,1600,375,"SolidHitch TCB08-1600"],[3,2,1800,334,"Sieruta GBH-90"],[3,2,1800,400,"SolidHitch TCB08-1800"],[3,3,1400,360,"SolidHitch TCB08-1400"],[3,3,1500,400,"SolidHitch TCB08-1500"],[3,3,1600,430,"SolidHitch TCB08-1600"],[3,3,1800,490,"SolidHitch TCB10-1800"],[3,3,2000,550,"SolidHitch TCB12-2000"],[3,4,1400,450,"SolidHitch TCB12-1400"],[3,4,1500,500,"SolidHitch TCB12-1500"],[3,4,1600,550,"SolidHitch TCB14-1600"],[3,4,1800,600,"SolidHitch TCB16-1800"],[3,4,1800,700,"SolidHitch TCB18-1800"],[3,4,2000,650,"SolidHitch TCB18-2000"],[3,4,2000,800,"SolidHitch TCB20-2000"],[3,4,2200,900,"SolidHitch TCB22-2200"],[3,5,1800,800,"SolidHitch TCB22-1800"],[3,5,2000,900,"SolidHitch TCB24-2000"],[3,5,2200,1000,"SolidHitch TCB26-2200"],[3,5,2200,1150,"SolidHitch TCB28-2200"],[4,0,600,40,"SolidHitch DCB01-600"],[4,0,700,50,"SolidHitch DCB01-700"],[4,0,800,60,"SolidHitch DCB01-800"],[4,0,900,70,"SolidHitch DCB02-900"],[4,0,1000,80,"SolidHitch DCB02-1000"],[4,0,1100,90,"SolidHitch DCB02-1100"],[4,0,1200,100,"SolidHitch DCB02-1200"],[4,1,1000,115,"SolidHitch DCB02-1000"],[4,1,1000,140,"SolidHitch DCB03-1000"],[4,1,1100,130,"SolidHitch DCB02-1100"],[4,1,1100,160,"SolidHitch DCB03-1100"],[4,1,1200,145,"SolidHitch DCB03-1200"],[4,1,1200,180,"SolidHitch DCB03-1200"],[4,1,1400,160,"SolidHitch DCB03-1400"],[4,1,1400,200,"SolidHitch DCB03-1400"],[4,1,1500,220,"SolidHitch DCB03-1500"],[4,2,1200,200,"SolidHitch DCB04-1200"],[4,2,1200,275,"SolidHitch DCB06-1200"],[4,2,1300,220,"SolidHitch DCB04-1300"],[4,2,1300,300,"SolidHitch DCB06-1300"],[4,2,1400,240,"SolidHitch DCB04-1400"],[4,2,1400,325,"SolidHitch DCB06-1400"],[4,2,1500,260,"SolidHitch DCB06-1500"],[4,2,1500,350,"SolidHitch DCB08-1500"],[4,2,1600,280,"SolidHitch DCB06-1600"],[4,2,1600,375,"SolidHitch DCB08-1600"],[4,2,1800,400,"SolidHitch DCB08-1800"],[4,3,1400,360,"SolidHitch DCB08-1400"],[4,3,1500,400,"SolidHitch DCB08-1500"],[4,3,1600,430,"SolidHitch DCB08-1600"],[4,3,1800,490,"SolidHitch DCB12-1800"],[4,3,2000,550,"SolidHitch DCB12-2000"],[4,4,1400,450,"SolidHitch DCB12-1400"],[4,4,1500,500,"SolidHitch DCB12-1500"],[4,4,1600,550,"SolidHitch DCB14-1600"],[4,4,1800,600,"SolidHitch DCB16-1800"],[4,4,1800,700,"SolidHitch DCB18-1800"],[4,4,2000,650,"SolidHitch DCB18-2000"],[4,4,2000,800,"SolidHitch DCB20-2000"],[4,4,2200,900,"SolidHitch DCB22-2200"],[4,5,1800,800,"SolidHitch DCB22-1800"],[4,5,2000,900,"SolidHitch DCB24-2000"],[4,5,2200,1000,"SolidHitch DCB26-2200"],[4,5,2200,1150,"SolidHitch DCB28-2200"],[5,0,800,75,"SolidHitch GB01-800"],[5,0,900,90,"SolidHitch GB02-900"],[5,0,1000,100,"SolidHitch GB02-1000"],[5,1,900,100,"SolidHitch GB03-900"],[5,1,1000,120,"SolidHitch GB03-1000"],[5,1,1000,150,"SolidHitch GB03-1000"],[5,1,1100,145,"SolidHitch GB03-1100"],[5,1,1100,180,"SolidHitch GB03-1100"],[5,1,1200,200,"SolidHitch GB04-1200"],[5,2,1200,200,"SolidHitch GB04-1200"],[5,2,1200,250,"SolidHitch GB03-1200"],[5,2,1200,300,"SolidHitch GB06-1200"],[5,2,1300,300,"SolidHitch GB04-1300"],[5,2,1300,350,"SolidHitch GB06-1300"],[5,2,1400,400,"SolidHitch GB08-1400"],[5,3,1400,400,"SolidHitch GB08-1400"],[5,3,1400,450,"SolidHitch GB09-1400"],[5,3,1500,450,"SolidHitch GB09-1500"],[5,3,1500,500,"SolidHitch GB11-1500 light"],[5,3,1500,550,"SolidHitch GB12-1500 light"],[5,4,1400,500,"SolidHitch GB12-1400"],[5,4,1500,550,"SolidHitch GB13-1500"],[5,4,1500,600,"SolidHitch GB14-1500"],[5,4,1500,650,"SolidHitch GB15-1500"],[5,4,1600,700,"SolidHitch GB15-1600"],[5,4,1600,750,"SolidHitch GB16-1600"],[5,4,1700,900,"SolidHitch GB18-1700"],[5,4,1800,900,"SolidHitch GB18-1800"],[5,4,1800,1000,"SolidHitch GB20-1800"],[5,4,1800,1100,"SolidHitch GB22-1800"],[5,5,1800,1200,"SolidHitch GB24-1800"],[5,5,1900,1300,"SolidHitch GB25-1900"],[5,5,2000,1400,"SolidHitch GB28-2000"]];
/* ───── katalogi: taczki i łyżki koparek (6 rodzajów → tabela pojemności) ───── */
/* taczki: [litry, modele, wymiary misy dł×szer×gł mm albo null] */
const TACZ = {
  bud: [[80, 'Altrad T-069, T-070/F, T-070/2K', null], [85, 'Olejnik budowlana, AWTools 85 L, Altrad T-070/B, CAPITO PRAKTICA 85, BauPROFI 85, Polskie Taczki IRON, Prolex', [800, 600, 300]], [85, 'mefro Standard 85 / Export 85', [860, 600, 325]], [90, 'mefro Bau 90', [860, 600, 355]], [95, 'CAPITO BauPROFI 95', null], [100, 'Altrad T-066/C, T-070/C, Haemmerlin AKTIV / CARGO, CAPITO EUROCAR', null]],
  duza: [[100, 'mefro Export 100', [1020, 740, 290]], [120, 'CAPITO PRAKTICA 120', null], [140, 'mefro Bully 140', [1020, 740, 360]], [150, 'Olejnik MAX, CAPITO PRAKTICA 150', null]],
  dwu: [[80, 'Altrad T-070/2K', null], [85, 'Olejnik budowlana 2K, CAPITO DUO 85', null], [100, 'Haemmerlin TWIN, AWTools 100 L (2 koła)', [820, 530, 290]], [120, 'CAPITO DUO 120', null], [150, 'Olejnik MAX 2K, CAPITO DUO 150', null], [200, 'CAPITO DUO 200', null]],
  pp: [[85, 'CAPITO GARTEN 85 PP', null], [90, 'mefro Kunststoff 90', [860, 600, 355]], [100, 'Altrad T-070/P, CAPITO GARTEN 100 PP', null], [140, 'mefro Kunststoff 140', [1020, 750, 360]], [200, 'mefro Kunststoff 200', [1120, 780, 520]]],
  ogr: [[65, 'AWTools ogrodowa 65 L', [815, 610, 215]], [80, 'mefro Garten 80, AWTools 80 L, Altrad T-067', [860, 600, 295]], [85, 'CAPITO GARTEN 85, Olejnik ogrodowa', null], [100, 'CAPITO GARTEN 100', null], [120, 'CAPITO GARTEN 120', null]],
  lg: [[55, 'Prosperplast Load&Go IWO55', null], [85, 'Prosperplast Load&Go II IWO85', null], [95, 'Prosperplast Load&Go III IWO95', null]],
};
const TACZ_BASIC = [
  ['Budowlane', [['bud', 'Budowlana', 'stal, 1 koło · 80–100 l'], ['duza', 'Duża / MAX', 'stal, 1 koło · 100–150 l']]],
  ['Dwa koła', [['dwu', 'Dwukołowa', 'stabilna · 80–200 l'], ['lg', 'Wózek ogrodowy', 'plastik, 2 koła · 55–95 l']]],
  ['Lżejsze', [['pp', 'Plastikowa misa', 'PP · 85–200 l'], ['ogr', 'Ogrodowa', 'płytsza, cienka blacha · 65–120 l']]],
];
const LYZ_TYPES = ['Kopiąca', 'Wąska / kablowa', 'Skarpowa', 'Skarpowa uchylna', 'Skarpowa zaokrąglona', 'Skarpowa profilująca'];
const LYZ_CLS = ['do 2,5 t', '2,5–5 t', '5–9 t', '9–15 t', '15–25 t', '25 t +', 'koparko-ładowarka'];
const LYZ_BASIC = [
  ['Do kopania', [['0', 'Kopiąca', 'zwykła łyżka z zębami'], ['1', 'Wąska / kablowa', 'wąska, głęboka — rowy']]],
  ['Skarpowe (szerokie)', [['2', 'Skarpowa', 'szeroka, płytka, bez zębów'], ['3', 'Skarpowa uchylna', 'z siłownikiem, przechyla się']]],
  ['Skarpowe — profil', [['4', 'Zaokrąglona', 'płytka, okrągłe dno'], ['5', 'Profilująca', 'trapez — do rowów i skarp']]],
];
/* rysunki */
const tIco = id => {
  const tub = { bud: 'M10 22h40l-6 16H18z', duza: 'M6 18h48l-7 21H15z', dwu: 'M10 22h40l-6 16H18z', pp: 'M10 22q20-4 40 0l-6 15q-14 4-28 0z', ogr: 'M10 26h40l-5 10H17z', lg: 'M16 16h30v22H16z' }[id];
  let g = `<path d="${tub}" fill="${KF}"/><path d="${tub.split('h')[0]}h${id === 'duza' ? 48 : id === 'lg' ? 30 : 40}" stroke-width="3"/>`;
  if (id === 'lg') g += `<path d="M46 20h6l4-6" stroke-width="2"/><circle cx="22" cy="46" r="7" fill="${KD}"/><circle cx="40" cy="46" r="7" fill="${KD}"/><circle cx="22" cy="46" r="2"/><circle cx="40" cy="46" r="2"/>`;
  else {
    g += `<path d="M44 36L60 30M44 32h18" stroke-width="2.2"/><path d="M40 38v14h-3M24 38l-3 14h-3" stroke-width="1.8"/>`;
    g += id === 'dwu' ? `<circle cx="10" cy="46" r="7" fill="${KD}"/><circle cx="17" cy="48" r="7" fill="${KD}"/><circle cx="17" cy="48" r="2"/>` : `<circle cx="12" cy="46" r="8" fill="${KD}"/><circle cx="12" cy="46" r="2.2"/><path d="M12 46L22 36" stroke-width="1.6"/>`;
  }
  return kSvg(g);
};
const lIco = id => {
  const ears = `<path d="M22 12l4-6h10l4 6" stroke-width="2"/><circle cx="28" cy="9" r="1.6" fill="${KS}"/><circle cx="36" cy="9" r="1.6" fill="${KS}"/>`;
  const teeth = x0 => [0, 1, 2].map(i => `<path d="M${x0 + i * 6} 50l3 6l3-6" fill="${KS}" stroke-width="1"/>`).join('');
  const P = {
    '0': ears + `<path d="M14 12h36q4 18-8 36H16q-6-14-2-36z" fill="${KF}"/><path d="M14 12h36" stroke-width="3"/>` + teeth(18),
    '1': ears + `<path d="M24 12h16q6 20-4 38H28q-8-16-4-38z" fill="${KF}"/><path d="M24 12h16" stroke-width="3"/>` + `<path d="M29 50l3 7l3-7" fill="${KS}" stroke-width="1"/>`,
    '2': ears + `<path d="M6 14h46q4 10-6 22H6z" fill="${KF}"/><path d="M6 14h46" stroke-width="3"/><path d="M4 36h44" stroke-width="3"/>`,
    '3': ears + `<path d="M6 16h46q4 10-6 22H6z" fill="${KF}"/><path d="M6 16h46" stroke-width="3"/><path d="M4 38h44" stroke-width="3"/><rect x="40" y="4" width="16" height="6" rx="2" fill="${KD}"/><path d="M56 7h4M38 7h-6" stroke-width="2"/>`,
    '4': ears + `<path d="M6 14h48q2 24-24 24Q6 38 6 14z" fill="${KF}"/><path d="M6 14h48" stroke-width="3"/>`,
    '5': ears + `<path d="M4 14h56L44 40H20z" fill="${KF}"/><path d="M4 14h56" stroke-width="3"/><path d="M20 40h24" stroke-width="3"/>`,
  };
  return kSvg(P[id] || P['0']);
};
/** wspólny wybór z katalogu: rodzaj (6) → (filtr) → tabela pojemności */
async function catPick({ title, basic, icon, filters, rows, hint }) {
  let typ = '', flt = null, chosen = null;
  const grid = el('div', { class: 'eich-basic' }), chips = el('div', { class: 'chips cat-flt' }), list = el('div', { class: 'eich-list' });
  const draw = () => {
    grid.replaceChildren(...basic.flatMap(([grp, items]) => [el('div', { class: 'eich-grp', text: grp }), ...items.map(([id, name, sub]) => el('button', { type: 'button', class: 'tpl eich-type' + (id === typ ? ' on' : ''), onclick: () => { typ = id; chosen = null; flt = null; draw() } }, icon(id), el('b', { text: name }), el('small', { text: sub })))]));
    if (!typ) { chips.replaceChildren(); list.replaceChildren(el('p', { class: 'hint', text: hint })); return }
    const fl = filters?.(typ) || [];
    if (fl.length && (flt === null || !fl.some(f => f[0] === flt))) flt = fl[0][0];
    chips.replaceChildren(...(fl.length ? [el('small', { text: 'Klasa koparki:' }), ...fl.map(([id, label, n]) => el('button', { type: 'button', class: 'pill' + (id === flt ? ' on' : ''), text: label + ' (' + n + ')', onclick: () => { flt = id; chosen = null; draw() } }))] : []));
    const rs = rows(typ, flt);
    list.replaceChildren(el('div', { class: 'eich-grp', text: 'Pojemność — wybierz swoją' }), ...rs.map(r => el('button', { type: 'button', class: 'eich-row' + (chosen === r ? ' on' : ''), onclick: () => { chosen = r; draw() } }, el('b', { text: r.big }), el('span', { text: r.mid }), el('small', { text: r.small }))));
  };
  draw();
  if (!(await formModal(title, el('div', {}, grid, chips, list), '✓ Wybierz'))) return null;
  if (!chosen) { announce('Wybierz rodzaj i pojemność'); return null }
  return chosen;
}
function catProfile(kind, name, liters, catalog) {
  let p = profiles.find(x => x.kind === kind && x.name === name);
  if (!p) { p = { id: 'bucket-' + Date.now(), kind, name, shape: 'plate', plate: liters / 1000, capacity: Math.round(liters) / 1000, catalog, created: Date.now(), photos: [] }; profiles.push(p); saveProfiles() }
  return p;
}
const lit = l => (l >= 1000 ? fmt(Math.round(l / 10) / 100) + ' m³' : fmt(l) + ' l');
async function taczPick() {
  const r = await catPick({
    title: '🛒 Taczka z katalogu', basic: TACZ_BASIC, icon: tIco, hint: 'Wybierz rodzaj taczki, potem pojemność misy.',
    rows: typ => TACZ[typ].map(([l, models, M]) => ({ big: l + ' l', mid: models.split(',')[0], small: models + (M ? ' · misa ' + M.map(x => x / 10).join(' × ') + ' cm' : ''), l, models, typ })),
  });
  if (!r) return null;
  const tn = TACZ_BASIC.flatMap(g => g[1]).find(x => x[0] === r.typ)[1];
  return catProfile('taczka', 'Taczka ' + tn.toLowerCase() + ' ' + r.l + ' l', r.l, { maker: r.models, typ: r.typ, l: r.l });
}
async function lyzPick() {
  const r = await catPick({
    title: '🚜 Łyżka z katalogu', basic: LYZ_BASIC, icon: lIco, hint: 'Wybierz rodzaj łyżki, klasę koparki, potem szerokość.',
    filters: typ => { const c = {}; LYZ_ROWS.forEach(x => { if (x[0] === +typ) c[x[1]] = (c[x[1]] || 0) + 1 }); return Object.keys(c).map(Number).sort((a, b) => a - b).map(k => [k, LYZ_CLS[k], c[k]]) },
    rows: (typ, cls) => LYZ_ROWS.filter(x => x[0] === +typ && x[1] === cls).map(([t, c, w, v, m]) => ({ big: lit(v), mid: 'szer. ' + w / 10 + ' cm', small: m + ' · ' + LYZ_CLS[c], t, c, w, v, m })),
  });
  if (!r) return null;
  return catProfile('lyzka', LYZ_TYPES[r.t] + ' ' + r.w / 10 + ' cm · ' + lit(r.v), r.v, { maker: r.m, typ: LYZ_TYPES[r.t], w: r.w, l: r.v, cls: LYZ_CLS[r.c] });
}
/* po pomiarze miarką — podpowiedź modeli z katalogu */
function catMatch(kind, W, L, H, est) {
  const box = $('lmMatch'); if (!box) return;
  let out = [];
  if (kind === 'taczka' && L > 30) {
    const c = []; Object.entries(TACZ).forEach(([typ, rs]) => rs.forEach(([l, models, M]) => { if (!M) return; const e = Math.abs(M[0] / 10 - L) / (M[0] / 10) + (W > 10 ? Math.abs(M[1] / 10 - W) / (M[1] / 10) : 0) + (H > 5 ? Math.abs(M[2] / 10 - H) / (M[2] / 10) : 0); c.push({ e, l, name: models.split(',')[0] }) }));
    out = c.filter(x => x.e < .25).sort((a, b) => a.e - b.e).slice(0, 3).map(x => [x.name + ' · ' + x.l + ' l', x.l, x.name]);
  } else if (kind === 'lyzka' && W > 10) {
    out = LYZ_ROWS.filter(x => Math.abs(x[2] / 10 - W) / W < .06).map(x => ({ x, e: Math.abs(x[3] - est * 1000) / (est * 1000) })).sort((a, b) => a.e - b.e).slice(0, 3).map(({ x }) => [x[4] + ' · ' + x[2] / 10 + ' cm · ' + lit(x[3]), x[3], x[4]]);
  }
  box.replaceChildren(...(out.length ? [el('small', { text: 'Podobne w katalogu (kliknij, żeby wziąć jego pojemność):' }), ...out.map(([t, l, name]) => el('button', { type: 'button', class: 'pill', text: t, onclick: () => { $('bReal').value = String(Math.round(l) / 1000).replace('.', ','); $('bName').value = $('bName').value || name; announce('Pojemność z katalogu: ' + lit(l)) } }))] : []));
}
/* szybki pomiar: rodzaj kosza + średnica + wysokość → pojemność (zwężenie wg typowego kształtu danego rodzaju) */
let qmType = 'lej';
function qmCalc() {
  const t = TEMPLATES.find(x => x[0] === qmType) || TEMPLATES[0], [, , , shape, base] = t, D = number($('qmD').value), H = number($('qmH').value), W = number($('qmW').value);
  $('qmWRow').classList.toggle('hide', shape !== 'rect'); $('qmDLabel').textContent = shape === 'rect' ? 'Długość górą (cm)' : 'Średnica górą (cm)';
  if (!(D > 20 && D < 400 && H > 20 && H < 400)) { $('qmOut').textContent = 'Wybierz rodzaj i wpisz wymiary — policzę pojemność.'; return 0 }
  const kd = D / (base.dTop || base.d || base.lTop), kh = H / (base.h || (base.hCyl + base.hCone)), kw = shape === 'rect' && W > 10 ? W / base.wTop : kd, dims = {};
  for (const [k, v] of Object.entries(base)) dims[k] = Math.round(v * (/^h/.test(k) ? kh : /^w/.test(k) ? kw : kd) * 10) / 10;
  const cap = Math.round(geoCapacity(shape, dims) * 1000) / 1000;
  $('qmOut').textContent = '≈ ' + fmt(Math.round(cap * 100) / 100) + ' m³ do krawędzi (' + t[1].toLowerCase() + ')';
  $('bReal').value = fmt(Math.round(cap * 100) / 100);
  const mt = eichMatch(D, H); $('qmMatch').replaceChildren(...(mt.length ? [el('small', { text: 'Pasuje do katalogu Eichinger:' }), ...mt.map(({ m }) => el('button', { type: 'button', class: 'pill', text: m.typ + ' · ' + (m.l / 1000).toLocaleString('pl-PL') + ' m³', onclick: () => { $('bName').value = $('bName').value || 'Eichinger ' + m.typ + ' · ' + m.l + ' l'; $('bPlate').value = fmt(m.l / 1000); $('bReal').value = ''; announce('Wybrano ' + m.typ + ' — ' + eichMass(m)) } }))] : []));
  return cap;
}
function qmRender() { $('qmTypes').replaceChildren(...TEMPLATES.map(t => el('button', { type: 'button', class: 'tpl' + (t[0] === qmType ? ' on' : ''), onclick: () => { qmType = t[0]; qmRender(); qmCalc(); qmTapeRender() } }, tplSvg(t[3], t[4]), el('b', { text: t[1] })))) }
['qmD', 'qmH', 'qmW'].forEach(id => $(id).addEventListener('input', qmCalc));

/* ── miarka na rysunku: pokazuje GDZIE mierzyć i wpisane wymiary ── */
const TAPE = '#ffcc00';
const tapeH = (x1, x2, y, label) => { const n = Math.max(4, Math.round((x2 - x1) / 8)); let t = `<rect x="${x1}" y="${y - 7}" width="${x2 - x1}" height="14" rx="2" fill="${TAPE}" stroke="#7a5d00" stroke-width="1"/>`;
  for (let i = 0; i <= n; i++) { const x = x1 + (x2 - x1) * i / n; t += `<path d="M${x.toFixed(1)} ${y - 7}v${i % 2 ? 4 : 7}" stroke="#111" stroke-width="1"/>` }
  return t + `<path d="M${x1} ${y - 14}v28M${x2} ${y - 14}v28" stroke="${TAPE}" stroke-width="2" stroke-dasharray="3 2"/>` + tapePill((x1 + x2) / 2, y - 22, label) };
const tapeV = (x, y1, y2, label, side = 1) => { const n = Math.max(4, Math.round((y2 - y1) / 8)); let t = `<rect x="${x - 7}" y="${y1}" width="14" height="${y2 - y1}" rx="2" fill="${TAPE}" stroke="#7a5d00" stroke-width="1"/>`;
  for (let i = 0; i <= n; i++) { const y = y1 + (y2 - y1) * i / n; t += `<path d="M${x - 7} ${y.toFixed(1)}h${i % 2 ? 4 : 7}" stroke="#111" stroke-width="1"/>` }
  return t + `<path d="M${x - 16} ${y1}h32M${x - 16} ${y2}h32" stroke="${TAPE}" stroke-width="2" stroke-dasharray="3 2"/>` + tapePill(x + side * 34, (y1 + y2) / 2, label) };
const tapeLine = (x1, y1, x2, y2, label, px, py) => { const len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, n = Math.max(4, Math.round(len / 8));
  let t = `<g transform="translate(${x1} ${y1}) rotate(${ang.toFixed(1)})"><rect x="0" y="-7" width="${len.toFixed(1)}" height="14" rx="2" fill="${TAPE}" stroke="#7a5d00" stroke-width="1"/>`;
  for (let i = 0; i <= n; i++) t += `<path d="M${(len * i / n).toFixed(1)} -7v${i % 2 ? 4 : 7}" stroke="#111" stroke-width="1"/>`;
  return t + '</g>' + tapePill(px, py, label) };
const tapePill = (x, y, label) => { const w = label.length * 7.2 + 14; return `<rect x="${(x - w / 2).toFixed(1)}" y="${y - 10}" width="${w.toFixed(1)}" height="20" rx="7" fill="#0b1426" stroke="${TAPE}" stroke-width="1.5"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${TAPE}">${label}</text>` };
const tapeWrap = inner => { const d = el('div', { class: 'tape-view' }); d.innerHTML = `<svg viewBox="0 0 260 210" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`; return d };
const v = (x, unit = 'cm') => (x > 0 ? fmt(x) + ' ' + unit : '?');
function qmTapeRender() {
  const box = $('qmTape'); if (!box || box.classList.contains('hide')) return;
  const t = TEMPLATES.find(x => x[0] === qmType) || TEMPLATES[0], d = t[4], D = number($('qmD').value), H = number($('qmH').value), rect = t[3] === 'rect';
  let pts; if (t[3] === 'cone') pts = [[0, d.dTop / 2], [d.h, d.dBottom / 2]]; else if (t[3] === 'cylcone') pts = [[0, d.d / 2], [d.hCyl, d.d / 2], [d.hCyl + d.hCone, d.dOut / 2]]; else if (t[3] === 'cylinder') pts = [[0, d.d / 2], [d.h, d.d / 2]]; else pts = [[0, d.lTop / 2], [d.h, d.lBottom / 2]];
  const Hh = pts.at(-1)[0], Wm = Math.max(...pts.map(p => p[1])), k = Math.min(110 / Hh, 62 / Wm), top = 62, ox = 104;
  const L = pts.map(([y, w]) => [ox - w * k, top + y * k]), R = pts.map(([y, w]) => [ox + w * k, top + y * k]), bot = L.at(-1)[1], wt = R[0][0] - ox, wb = R.at(-1)[0] - ox;
  const f = a => a.map(p => p.map(q => q.toFixed(1)).join(',')).join(' ');
  let g = `<polygon points="${f([...L, ...R.slice().reverse()])}" fill="color-mix(in srgb,var(--c1) 28%,transparent)" stroke="var(--c1)" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += `<rect x="${ox - Math.max(6, wb)}" y="${bot}" width="${2 * Math.max(6, wb)}" height="6" rx="2" fill="#555" stroke="var(--c1)"/>`; // zamknięcie
  g += `<path d="M${ox - wt * .6} ${top + (bot - top) * .6}L${ox - wt * .6 - 8} 204M${ox + wt * .6} ${top + (bot - top) * .6}L${ox + wt * .6 + 8} 204" stroke="#777" stroke-width="3" stroke-dasharray="5 4"/><text x="${ox}" y="203" text-anchor="middle" font-size="10" font-weight="800" fill="#ff6b6b">nogi / rama — nie mierz</text>`;
  g += tapeH(ox - wt, ox + wt, top - 12, (rect ? 'dł. ' : 'Ø ') + v(D)).replace('rx="7"', 'rx="7"');
  const tx = ox + wt + 20; g += tapeV(tx, top, bot, v(H), 1).replace(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="20" rx="7"([^>]*)><text x="([\d.]+)"/, (m, a, b, w, rest, x) => `<rect x="${tx + 12}" y="${b}" width="${w}" height="20" rx="7"${rest}><text x="${tx + 12 + Number(w) / 2}"`);
  g += `<text x="${tx}" y="${top - 6}" text-anchor="middle" font-size="11" font-weight="900" fill="${TAPE}">wys.</text><text x="130" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="var(--c1)">Ø górą, po wewn. krawędzi · wys. od wylotu</text>`;
  box.replaceChildren(tapeWrap(g));
}
function lmTapeRender() {
  const box = $('lmTape'); if (!box || box.classList.contains('hide')) return;
  const cm = x => { x = number(x); return x > 0 && x < 5 ? x * 100 : x };
  const L = cm($('lmL').value), W = cm($('lmW').value), H = cm($('lmH').value), tacz = $('bKind').value === 'taczka';
  // pudełko w rzucie 3D: przód 40..170 × 70..150, głębia +50,-30
  let g = `<path d="M40 70h130l50-30H90z" fill="color-mix(in srgb,var(--c1) 18%,transparent)" stroke="var(--c1)" stroke-width="2"/>`;
  g += tacz ? `<path d="M40 70h130l-18 70H58z" fill="color-mix(in srgb,var(--c1) 30%,transparent)" stroke="var(--c1)" stroke-width="2.5"/><path d="M170 70l50-30-16 68-52 32" fill="color-mix(in srgb,var(--c1) 22%,transparent)" stroke="var(--c1)" stroke-width="2"/><circle cx="40" cy="168" r="16" fill="#333" stroke="var(--c1)" stroke-width="2"/><path d="M152 140l60 44M58 140l-14 14" stroke="#888" stroke-width="3"/>`
    : `<path d="M40 70h130q8 50-24 80H66q-34-30-26-80z" fill="color-mix(in srgb,var(--c1) 30%,transparent)" stroke="var(--c1)" stroke-width="2.5"/><path d="M170 70l50-30q8 46-22 74l-52 36" fill="color-mix(in srgb,var(--c1) 22%,transparent)" stroke="var(--c1)" stroke-width="2"/>` + [0, 1, 2, 3].map(i => `<path d="M${74 + i * 22} 150l5 12l5-12" fill="var(--c1)"/>`).join('');
  g += tapeH(40, 170, 56, 'dł. ' + v(L));
  g += tapeLine(176, 78, 226, 48, 'szer. ' + v(W), 192, 100);
  g += tapeV(26, 70, tacz ? 140 : 150, '', -1).replace(/<rect x="[^"]*" y="[^"]*" width="[^"]*" height="20"[^>]*><text[^>]*><\/text>/, '') + tapePill(26, (tacz ? 140 : 150) + 20, 'wys. ' + v(H));
  g = `<g transform="translate(14 8)">${g}</g>`;
  g += `<text x="130" y="204" text-anchor="middle" font-size="11" font-weight="800" fill="var(--c1)">mierz w środku · wys. = od krawędzi do dna</text>`;
  box.replaceChildren(tapeWrap(g));
}
const tapeToggle = (btn, box, draw) => { $(btn).addEventListener('click', () => { const on = $(box).classList.toggle('hide') === false; $(btn).textContent = on ? '📏 Schowaj miarkę' : '📏 Pokaż miarkę — gdzie mierzyć'; $(btn).classList.toggle('on', on); draw() }) };
tapeToggle('qmTapeBtn', 'qmTape', qmTapeRender); tapeToggle('lmTapeBtn', 'lmTape', lmTapeRender);
['qmD', 'qmH', 'qmW'].forEach(id => $(id).addEventListener('input', qmTapeRender)); ['lmL', 'lmW', 'lmH'].forEach(id => $(id).addEventListener('input', lmTapeRender));
/** kosz = tylko nazwa i pojemność (bez kształtu, zdjęć do liczenia i wymiarów) */
/* łyżka koparki: szerokość × długość (otwarcie) × głębokość — wystarczą 2 z 3, trzeci szacuję z typowych proporcji */
const LM_K = { lyzka: .6, taczka: .5 }; // taczka: z katalogu (misa dł×szer×gł → litry) wychodzi ok. 50% // zaokrąglone dno / skośne ścianki — ok. 60% prostopadłościanu
const LM_TXT = {
  lyzka: { head: '📏 Pomiar łyżki miarką', hLabel: 'Wysokość', ph: ['np. 80', 'np. 90', 'np. 75'], hint: 'Szerokość: w środku, między bokami. Długość: od zębów do tylnej ścianki. Wysokość (= głębokość): od krawędzi do dna. Możesz wpisać w cm albo w metrach.', est: { H: l => l * .85, L: (w, h) => h ? h / .85 : w, W: l => l } },
  taczka: { head: '📏 Pomiar taczki miarką', hLabel: 'Wysokość', ph: ['np. 60', 'np. 90', 'np. 25'], hint: 'Długość i szerokość: górą, po wewnętrznej krawędzi wanny (± kilka cm nie szkodzi). Wysokość (= głębokość): od krawędzi do dna. Możesz wpisać w cm albo w metrach.', est: { H: l => l * .33, L: (w, h) => w ? w / .7 : h / .33, W: l => l * .7 } },
};
function lmCalc() {
  const cm = v => { v = number(v); return v > 0 && v < 5 ? v * 100 : v }; // wpisane w metrach (0,8) → cm
  const W = cm($('lmW').value), L = cm($('lmL').value), H = cm($('lmH').value), ok = v => v > 10 && v < 400, n = [W, L, H].filter(ok).length;
  if (n < 2) { $('lmMatch')?.replaceChildren(); $('lmOut').textContent = 'Wpisz co najmniej 2 wymiary (najlepiej szerokość i długość) — policzę pojemność.'; return 0 }
  const kind = $('bKind').value === 'taczka' ? 'taczka' : 'lyzka', E = LM_TXT[kind].est;
  const l = ok(L) ? L : E.L(ok(W) ? W : 0, ok(H) ? H : 0), w = ok(W) ? W : E.W(l), h = ok(H) ? H : E.H(l), est = n < 3;
  const cap = Math.round(w * l * h / 1e6 * LM_K[kind] * 1000) / 1000;
  catMatch(kind, ok(W) ? W : 0, ok(L) ? L : 0, ok(H) ? H : 0, cap);
  $('lmOut').textContent = '≈ ' + fmt(Math.round(cap * (kind === 'taczka' ? 1000 : 100)) / (kind === 'taczka' ? 1000 : 100)) + ' m³ betonu ' + (kind === 'taczka' ? 'w taczce (' + Math.round(cap * 1000) + ' l)' : 'w łyżce') + (est ? ' (szacunek — ' + (!ok(H) ? 'wysokość' : !ok(L) ? 'długość' : 'szerokość') + ' ≈ ' + Math.round(!ok(H) ? h : !ok(L) ? l : w) + ' cm; podaj, będzie dokładniej)' : '');
  $('bReal').value = String(Math.round(cap * (kind === 'taczka' ? 1000 : 100)) / (kind === 'taczka' ? 1000 : 100)).replace('.', ','); $('bPlate').value = ''; $('bReal').dispatchEvent(new Event('input', { bubbles: true })); if (!$('bShape').value || $('bShape').value === 'cone') $('bShape').value = 'plate';
  return cap;
}
['lmW', 'lmL', 'lmH'].forEach(id => ['input', 'change', 'keyup', 'blur'].forEach(ev => $(id).addEventListener(ev, lmCalc)));
function formSimple() {
  const kind = $('bKind').value, k = kind === 'kosz', lm = kind === 'lyzka' || kind === 'taczka', T = LM_TXT[kind] || LM_TXT.lyzka;
  $('lmBox').classList.toggle('hide', !lm); $('lmHead').textContent = T.head; $('lmHint').textContent = T.hint;
  $('lmW').placeholder = T.ph[0]; $('lmL').placeholder = T.ph[1]; $('lmH').placeholder = T.ph[2]; $('lmHLabel').textContent = T.hLabel;
  $('bucketForm').classList.add('simple'); $('bucketForm').classList.toggle('k-kosz', k); $('qmBox').classList.toggle('hide', !k);
  $('bName').placeholder = { kosz: 'np. Pomarańczowy Eichinger', taczka: 'np. Taczka 100 l', lyzka: 'np. Łyżka 80 cm' }[kind] || '';
  $('bShape').value = 'plate'; if (k) qmRender(); if (lm) lmCalc();
}
$('bKind').addEventListener('change', () => { formSimple(); dimFields($('bShape').value, {}) });
function closeBucketForm() { $('bucketForm').classList.add('hide'); $('newBucket').classList.remove('hide'); editingId = '' }
$('newBucket').addEventListener('click', () => openBucketForm()); $('bCancel').addEventListener('click', closeBucketForm);
$('bSave').addEventListener('click', () => {
  if (['lyzka', 'taczka'].includes($('bKind').value) && ($('lmW').value || $('lmL').value || $('lmH').value)) lmCalc();
  const shape = $('bShape').value, dims = shape === 'plate' ? null : formDims(), plate = number($('bPlate').value), real = number($('bReal').value), geo = dims ? geoCapacity(shape, dims) : null;
  if (shape !== 'plate' && !dims && !(real > 0 || plate > 0)) return $('bError').textContent = 'Uzupełnij wymiary albo policz ze zdjęć.';
  const capacity = real > 0 ? real : plate > 0 ? plate : geo;
  if (!(capacity > 0 && capacity <= 5)) return $('bError').textContent = 'Pojemność musi być od 0 do 5 m³.';
  const kind = $('bKind').value || 'kosz'; const p = { id: editingId || 'bucket-' + Date.now(), kind, name: $('bName').value.trim() || ({ taczka: 'Moja taczka', lyzka: 'Moja łyżka' }[kind] || 'Mój kosz'), shape: dims ? shape : 'plate', dims, estimated: formEstimated, plate: plate > 0 ? plate : null, real: real > 0 ? real : null, capacity: Math.round(capacity * 1000) / 1000, photos: formPhotos.map(data => ({ data })), createdAt: getProfile(editingId)?.createdAt || Date.now() };
  const i = profiles.findIndex(x => x.id === p.id); const backup = profiles.slice();
  if (i >= 0) profiles[i] = p; else profiles.push(p);
  if (!saveProfiles()) { profiles = backup; return }
  if (session?.bucketProfile?.id === p.id) { session.bucketProfile = snapshot(p); session.capacity = p.capacity; session.dose = Math.min(session.dose, p.capacity); remember() }
  closeBucketForm(); useSavedBucket(p);
});
/** Po zapisie: od razu do licznika (trwa betonowanie) albo wybrany w „Nowe betonowanie”. */
function useSavedBucket(p) {
  announce('Zapisano: ' + p.name + ' · ' + fmt(p.capacity) + ' m³');
  const want = KINDS[kindOf(p)][2];
  if (session && (session.method === want || (want === 'kibel' && session.method === 'inne'))) { changeCapacity(p.capacity, p); tab('work') }
  else { if (method !== want && !(want === 'kibel' && method === 'inne')) selectMethod(want); chooseProfile(p.id, false); rememberSiteBucket($('site').value, p.id); tab('setup'); announce((/^(kosz|taczka|łyżka)/i.test(p.name) ? p.name : 'Kosz ' + p.name) + ' wybrany — wpisz budowę i zacznij') }
}
function storeProfile(p) {
  const i = profiles.findIndex(x => x.id === p.id); const backup = profiles.slice();
  if (i >= 0) profiles[i] = p; else profiles.push(p);
  if (!saveProfiles()) { profiles = backup; return false }
  if (session?.bucketProfile?.id === p.id) { session.bucketProfile = snapshot(p); session.capacity = p.capacity; session.dose = Math.min(session.dose, p.capacity); remember() }
  return true;
}
let bucketQuery = '';
const bucketOpen = {};
function bucketListRender() {
  const box = $('bucketList'); box.replaceChildren();
  if (!profiles.length) { box.append(el('p', { class: 'hint', text: 'Nie masz jeszcze zapisanych koszy. Dodaj kosz: nazwa + tabliczka albo szybki pomiar miarką — resztę dopracuje gruszka.' })); return }
  if (profiles.length > 5) { const q = el('input', { type: 'search', class: 'bucket-search', placeholder: '🔍 Szukaj (nazwa albo m³)', value: bucketQuery }); q.addEventListener('input', () => { bucketQuery = q.value; const pos = q.selectionStart; bucketListRender(); const n = $('bucketList').querySelector('.bucket-search'); n.focus(); try { n.setSelectionRange(pos, pos) } catch (e) { } }); box.append(q) }
  const ql = bucketQuery.trim().toLowerCase(), match = p => !ql || (p.name || '').toLowerCase().includes(ql) || fmt(p.capacity).includes(ql.replace('.', ','));
  for (const [kind, [ico, label]] of Object.entries(KINDS)) {
    const list = byRecent(profiles.filter(p => kindOf(p) === kind && match(p))); if (!list.length) continue;
    const open = ql ? true : bucketOpen[kind] ?? (profiles.length <= 6);
    const det = el('details', { class: 'bucket-group' }); det.open = open; det.addEventListener('toggle', () => { bucketOpen[kind] = det.open });
    det.append(el('summary', {}, el('span', { text: ico + ' ' + ({ kosz: 'Kosze', taczka: 'Taczki', lyzka: 'Łyżki' }[kind] || label) }), el('b', { text: String(list.length) })));
    for (const p of list) {
      const img = p.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '', class: 'bucket-thumb', loading: 'lazy' }) : (() => { const d = el('div', { class: 'bucket-thumb ph' }); d.append(kindIcon(kindOf(p))); return d })();
      const info = el('div', { class: 'bucket-info' }, el('strong', { text: p.name }), el('small', { text: (kindOf(p) === 'taczka' ? Math.round(p.capacity * 1000) + ' l' : fmt(p.capacity) + ' m³') + (p.plate && Math.abs(p.plate - p.capacity) > .005 ? ' (tabliczka ' + fmt(p.plate) + ')' : '') + ' · ' + (SHAPES[p.shape]?.label || 'tabliczka') + (p.calib ? ' · ⚖️ skalibrowany' : p.template ? ' · gotowy model' : p.estimated ? ' · ze zdjęć' : p.dims ? ' · zmierzony' : '') }));
      const acts = el('div', { class: 'bucket-acts' });
      if (bucketReturn === 'setup') acts.append(el('button', { type: 'button', class: 'primary', text: 'Wybierz', onclick: () => { const w = KINDS[kindOf(p)][2]; if (method !== w && !(w === 'kibel' && method === 'inne')) selectMethod(w); chooseProfile(p.id); rememberSiteBucket($('site').value, p.id); tab('setup') } }));
      if (kind !== 'taczka') acts.append(el('button', { type: 'button', text: '⚖️', 'aria-label': 'Kalibruj z gruszki', title: 'Kalibruj z gruszki', onclick: () => calibrateProfile(p) }));
      acts.append(el('button', { type: 'button', text: '✏️', 'aria-label': 'Edytuj', onclick: () => openBucketForm(p) }));
      acts.append(el('button', { type: 'button', class: 'warn', text: '🗑', 'aria-label': 'Usuń', onclick: () => deleteProfile(p, bucketListRender) }));
      det.append(el('div', { class: 'bucket-row' }, img, info, acts));
    }
    box.append(det);
  }
  if (ql && !box.querySelector('.bucket-group')) box.append(el('p', { class: 'hint', text: 'Nic nie pasuje do „' + bucketQuery + '”.' }));
}

// ───────────────────────── kosz ze zdjęcia: profil + wybór wielkości → realna pojemność ─────────────────────────
let formEstimated = false;
const pc = { view: 'front', views: {}, useSide: false, useTop: false, photos: [], cur: 0, img: null, file: null, pts: [], ref: [], nominal: .75, other: false, fill: 0, fillTap: false, shape: 'round', k: 1, drag: -1, editId: '' };
const NOMINALS = [.5, .75, 1, 1.25, 1.5, 2]; // 0,7 → 0,75 (Domi)
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pcRefCm = () => { const v = Number($('pcRefType').value); return v === -1 ? number($('pcRefCustom').value) : v };
const PT_MAX = 14, PT_MIN_SIDE = 2;
/** swobodne punkty → lewa / prawa krawędź → poziomy (od dołu do góry) */
function sidesFor(pts) {
  if (pts.length < 2) return null;
  const xs = pts.map(p => p.x), cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const L = pts.filter(p => p.x < cx).sort((a, b) => a.y - b.y), R = pts.filter(p => p.x >= cx).sort((a, b) => a.y - b.y);
  return { L, R, cx };
}
const pcSides = () => sidesFor(pc.pts);
const edgeX = (E, y) => { if (y <= E[0].y) return E[0].x; if (y >= E.at(-1).y) return E.at(-1).x; for (let i = 1; i < E.length; i++) if (y <= E[i].y) { const t = (y - E[i - 1].y) / Math.max(1e-9, E[i].y - E[i - 1].y); return E[i - 1].x + (E[i].x - E[i - 1].x) * t } return E.at(-1).x };
const segX = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0 };
/** czy punkty w kolejności klikania tworzą zamknięty obrys bez skrzyżowań */
function isOutline(pts) {
  const n = pts.length; if (n < 4) return false;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if (j === i + 1 || (i === 0 && j === n - 1)) continue; if (segX(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return false }
  return true;
}
/** punkty ułożone w obrys bez skrzyżowań: kolejność klikania, jeśli jest dobra, inaczej dookoła środka */
function orderPts(pts) {
  if (pts.length < 3 || isOutline(pts)) return pts;
  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length, cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  return pts.slice().sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
}
function levelsOutline(pts) {
  const ysV = pts.map(p => p.y), yt = Math.min(...ysV), yb = Math.max(...ysV); if (!(yb - yt > 10)) return null;
  const at = y => { const xs = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a.y - y) * (b.y - y) <= 0 && a.y !== b.y) xs.push(a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y)) } return xs.length >= 2 ? { l: Math.min(...xs), r: Math.max(...xs) } : null };
  const e = (yb - yt) * .004, ys = new Set([yt + e, yb - e]); for (const y of ysV) if (y > yt + e && y < yb - e) ys.add(y);
  for (let i = 1; i < 16; i++) ys.add(yt + (yb - yt) * i / 16);
  const out = []; for (const y of [...ys].sort((a, b) => b - a)) { const h = at(y); if (h) out.push({ y, l: h.l, r: h.r, w: Math.max(1, h.r - h.l) }) }
  return out.length >= 2 ? out : null;
}
function levelsFor(pts) {
  if (pts.length >= 4) { const o = levelsOutline(orderPts(pts)); if (o) return o }
  const sd = sidesFor(pts); if (!sd || sd.L.length < PT_MIN_SIDE || sd.R.length < PT_MIN_SIDE) return null;
  const yt = (sd.L[0].y + sd.R[0].y) / 2, yb = (sd.L.at(-1).y + sd.R.at(-1).y) / 2; if (!(yb - yt > 10)) return null;
  const ys = new Set([yt, yb]); for (const p of [...sd.L, ...sd.R]) if (p.y > yt && p.y < yb) ys.add(p.y);
  for (let i = 1; i < 12; i++) ys.add(yt + (yb - yt) * i / 12);
  return [...ys].sort((a, b) => b - a).map(y => { const l = edgeX(sd.L, y), r = edgeX(sd.R, y); return { y, l, r, w: Math.max(1, r - l) } }); // od dołu do góry
}
const pcLevels = () => levelsFor(pc.pts);
const VIEW_KEYS = ['pts', 'ref', 'img', 'file', 'cur'];
const viewData = v => v === pc.view ? pc : (pc.views[v] || { pts: [], ref: [] });
/** szerokość [px] na wysokości y w poziomach (od dołu) */
const widthAtY = (lv, y) => { if (y >= lv[0].y) return lv[0].w; for (let i = 1; i < lv.length; i++) if (y >= lv[i].y) { const t = (y - lv[i - 1].y) / Math.min(-1e-9, lv[i].y - lv[i - 1].y); return lv[i - 1].w + (lv[i].w - lv[i - 1].w) * t } return lv.at(-1).w };
function pcSwitch(v) {
  if (pc.view === v) return;
  pc.views[pc.view] = Object.fromEntries(VIEW_KEYS.map(k => [k, pc[k]]));
  Object.assign(pc, { pts: [], ref: [], img: null, file: null, cur: -1 }, pc.views[v] || {}); pc.view = v;
  if (!pc.img) { const used = ['front', 'side', 'top'].filter(x => x !== v).map(x => pc.views[x]?.cur); const idx = pc.photos.findIndex((_, i) => !used.includes(i)); if (idx >= 0) { pc.cur = idx; pc.img = pc.photos[idx].img; pc.file = pc.photos[idx].file } }
  pcUI();
}
/** przypisz bieżące zdjęcie (z punktami) do widoku: przód / bok / góra */
function pcAssign(v) {
  if (pc.view === v || !pc.img) { if (v === 'side') pc.useSide = true; if (v === 'top') pc.useTop = true; return pcUI() }
  const mine = Object.fromEntries(VIEW_KEYS.map(k => [k, pc[k]]));
  pc.views[pc.view] = { pts: [], ref: [], img: null, file: null, cur: -1 };
  if (pc.view === 'side') pc.useSide = false; if (pc.view === 'top') pc.useTop = false;
  if (v === 'side') pc.useSide = true; if (v === 'top') pc.useTop = true;
  const prev = pc.views[v]; pc.view = v; Object.assign(pc, mine); delete pc.views[v];
  if (prev && prev.cur >= 0 && prev.cur !== mine.cur) announce('Poprzednie zdjęcie tego widoku odpięte');
  pcUI();
}
/** widok główny do liczenia: przód, a gdy go brak — bok (kosz z boku liczy się tak samo) */
function pcMainView() { if (levelsFor(viewData('front').pts || [])) return 'front'; if (pc.useSide && levelsFor(viewData('side').pts || [])) return 'side'; if (pc.useTop && levelsFor(viewData('top').pts || [])) return 'top'; return null }
function pcCompute() {
  const mv = pcMainView(); if (!mv) return null;
  const F = viewData(mv);
  let lv = mv === 'top' ? null : levelsFor(F.pts);
  if (mv === 'top') { // tylko zdjęcie z góry: typowy kształt kosza (dół ≈ 45% wlewu, wysokość ≈ 0,9 szerokości) — pojemność i tak z tabliczki
    const T = levelsFor(F.pts), W = Math.max(...T.map(l => l.w)), H = W * .9; lv = [];
    for (let i = 0; i <= 12; i++) { const f = i / 12, w = W * (.45 + .55 * f); lv.push({ y: H * (1 - f), l: (W - w) / 2, r: (W + w) / 2, w }) }
  }
  if (!lv) return null;
  const yb = lv[0].y, hPx = yb - lv[lv.length - 1].y; if (!(hPx > 10) || lv.some(l => !(l.w > 3))) return null;
  const S = viewData('side'), lvS = pc.useSide && mv === 'front' ? levelsFor(S.pts) : null, lvT = !lvS && pc.useTop ? levelsFor(viewData('top').pts) : null;
  if (mv === 'top' && pc.other === 'ref') return null; // wzorzec długości działa na zdjęciu z przodu/boku
  const topRatio = lvT ? (lvT[0].y - lvT.at(-1).y) / Math.max(1, ...lvT.map(l => l.w)) : 0;
  const rect = pc.shape === 'rect';
  const mk = (c, cw = c) => {
    const d = { h: hPx * c, hs: lv.map(l => (yb - l.y) * c), ds: lv.map(l => l.w * cw), ...(rect ? { rect: true } : {}) };
    if (lvS) { const ybS = lvS[0].y, hS = ybS - lvS.at(-1).y, cS = hPx * c / hS; d.dd = lv.map(l => widthAtY(lvS, ybS - (yb - l.y) / hPx * hS) * cS); d.lshape = true }
    else if (topRatio > .05) d.dd = lv.map(l => l.w * cw * topRatio);
    return d;
  };
  const useRef = pc.other === 'ref';
  let c, nominal = 0;
  let cW = 0;
  const tapeH = pc.other === 'tape' ? number($('pcTapeH').value) : 0, tapeW = pc.other === 'tape' ? number($('pcTapeW').value) : 0;
  if (pc.other === 'tape') { const wPx = Math.max(...lv.map(l => l.w)); if (tapeH > 10 && tapeH < 400) c = tapeH / hPx; else if (tapeW > 10 && tapeW < 400) c = tapeW / wPx; else return null; if (tapeH > 10 && tapeW > 10 && mv !== 'top') cW = tapeW / wPx }
  else if (useRef) { const R = F.ref || [], rp = R.length === 2 ? dist(R[0], R[1]) : 0, rc = pcRefCm(); if (!(rp > 3 && rc > 0)) return null; c = rc / rp }
  else { nominal = pc.other === true ? number($('pcOther').value) : pc.nominal; if (!(nominal > 0 && nominal <= 5)) return null; const c0 = 100 / hPx; c = c0 * Math.cbrt(nominal / geoCapacity('profile', mk(c0))) }
  const dims = cW ? mk(c, cW) : mk(c), rim = geoCapacity('profile', dims), fillCm = Math.min(pc.fill, dims.h * .9), real = volumeUpTo('profile', dims, dims.h - fillCm);
  return { dims, rim, real, nominal, fillCm, levels: lv.length, useRef, twoViews: !!(lvS || lvT), pair: mv === 'top' ? 'tylko góra — kształt przybliżony' : lvS ? 'przód + bok' : lvT ? (mv === 'side' ? 'bok + góra' : 'przód + góra') : mv === 'side' ? 'tylko bok' : 'tylko przód' };
}
function pcUI() {
  const has = !!pc.img, n = pc.pts.length, r = has ? pcCompute() : null;
  pc.moreAsked = pc.moreAsked || {};
  // pytanie „Dodać jeszcze zdjęcie?” pada dopiero po ✓ Gotowe w powiększonym zaznaczaniu
  pcStripRender();
  $('pcPick').classList.toggle('hide', has); $('pcWrap').classList.toggle('hide', !has); $('pcTools').classList.toggle('hide', !has);
  $('pcSettings').classList.toggle('hide', !pcMainView());
  const vt = $('pcViews'); vt.classList.toggle('hide', !has); vt.replaceChildren(
    el('button', { type: 'button', class: 'pill' + (pc.view === 'front' ? ' on' : ''), text: '⬜ Przód' + (levelsFor(viewData('front').pts) ? ' ✓' : ''), onclick: () => pcSwitch('front') }),
    el('button', { type: 'button', class: 'pill' + (pc.view === 'side' ? ' on' : ''), text: (pc.useSide ? '◧ Bok 90°' + (levelsFor(viewData('side').pts) ? ' ✓' : '') : '＋ Bok 90° (kosz L)'), onclick: () => { pc.useSide = true; pcSwitch('side') } }),
    ...(pc.useSide ? [el('button', { type: 'button', class: 'pill', text: '✕ bez boku', onclick: () => { pc.useSide = false; pcSwitch('front') } })] : []),
    el('button', { type: 'button', class: 'pill' + (pc.view === 'top' ? ' on' : ''), text: (pc.useTop ? '◯ Góra' + (levelsFor(viewData('top').pts) ? ' ✓' : '') : '＋ Z góry'), onclick: () => { pc.useTop = true; pcSwitch('top') } }),
    ...(pc.useTop ? [el('button', { type: 'button', class: 'pill', text: '✕ bez góry', onclick: () => { pc.useTop = false; pcSwitch('front') } })] : []));
  const as = $('pcAssign'); as.classList.toggle('hide', !has); as.replaceChildren(el('span', { text: 'To zdjęcie to:' }), ...[['front', '⬜ Przód'], ['side', '◧ Bok'], ['top', '◯ Góra']].map(([v, tx]) => el('button', { type: 'button', class: 'pill' + (pc.view === v ? ' on' : ''), text: tx, onclick: () => pcAssign(v) })));
  let t = ''; const sd = pcSides(), nl = sd ? sd.L.length : 0, nr = sd ? sd.R.length : 0;
  if (!has) t = 'Krok 1 · Zrób albo wybierz zdjęcia kosza (możesz kilka). Mierzymy na zdjęciu z boku.';
  else if (pc.fillTap) t = '👆 Stuknij na zdjęciu wysokość, do której dochodzi beton (możesz przeciągnąć palcem).';
  else if (pc.view === pcMainView() && pc.view !== 'top' && pc.other === 'ref' && pc.ref.length < 2 && pcLevels()) t = 'Dotknij ' + (pc.ref.length ? 'drugiego' : 'pierwszego') + ' końca przedmiotu obok kosza.';
  else if (pc.view === 'top' && !pcLevels()) t = 'Z GÓRY · zdjęcie kosza od góry (do środka wlewu), lewo-prawo tak jak na zdjęciu z przodu. Obrysuj krawędź wlewu dookoła.';
  else if (pc.view === 'top' && pcMainView() === 'top') t = 'Z góry gotowe ✓ — liczę z przybliżonego kształtu. Dodaj przód albo bok, żeby było dokładniej (nie trzeba).';
  else if (pc.view === 'top') t = !pcMainView() ? 'Z góry gotowe ✓ — teraz dodaj zdjęcie z PRZODU (cały kosz w kadrze), bez niego nie policzę wysokości.' : 'Z góry gotowe ✓ — liczę głębokość kosza z proporcji wlewu.' + (pc.useSide ? ' (Masz też bok — bok ma pierwszeństwo.)' : '');
  else if (pc.view === 'side' && !pcLevels()) t = 'BOK 90° · obrysuj kosz widziany z boku (przy koszu L — całe „L”), od krawędzi wlewu do dołu.';
  else if (!pcLevels()) t = 'Obrysuj kosz: stukaj punkty na krawędzi kosza (rogi, załamania, wylew) — w dowolnej kolejności, apka sama połączy je w obrys. Min. 4 punkty.';
  else t = 'Dokładaj punkty tam, gdzie kształt się zmienia (początek lejka, załamania). Punkty możesz przeciągać.';
  const cnt = $('pcCount');
  if (has) { cnt.classList.remove('hide'); cnt.replaceChildren(el('b', { text: pc.pts.length + ' / ' + PT_MAX }), el('span', { text: ' punktów · zostało ' + (PT_MAX - pc.pts.length) }), ...(pc.pts.length >= 4 ? [el('span', { class: 'pc-cnt-side ok', text: 'obrys ✓ (łączę sam)' })] : [el('span', { class: 'pc-cnt-side' + (nl >= PT_MIN_SIDE ? ' ok' : ''), text: 'lewa: ' + nl }), el('span', { class: 'pc-cnt-side' + (nr >= PT_MIN_SIDE ? ' ok' : ''), text: 'prawa: ' + nr })]), el('small', { text: pcLevels() ? '✓ można liczyć' : 'min. ' + PT_MIN_SIDE + ' na stronę' })) } else cnt.classList.add('hide');
  $('pcStep').textContent = t;
  const nb = $('pcNominal'); nb.replaceChildren(...NOMINALS.map(v => el('button', { type: 'button', class: 'pill' + (!pc.other && Math.abs(pc.nominal - v) < 1e-4 ? ' on' : ''), text: fmt(v) + (v === 1 ? ' (kubik)' : ''), onclick: () => { pc.other = false; pc.nominal = v; pcUI() } })),
    el('button', { type: 'button', class: 'pill' + (pc.other === true ? ' on' : ''), text: '✏️ Inny', onclick: () => { pc.other = true; pcUI(); $('pcOther').focus() } }),
    el('button', { type: 'button', class: 'pill tape-pill' + (pc.other === 'tape' ? ' on' : ''), text: '📏 Miarka (cm)', onclick: () => { pc.other = 'tape'; pcUI(); setTimeout(() => $('pcTapeH').focus(), 50) } }),
    el('button', { type: 'button', class: 'pill' + (pc.other === 'ref' ? ' on' : ''), text: '🧍 Wzorzec na zdjęciu', onclick: () => pcRefStart() }));
  $('pcOtherRow').classList.toggle('hide', pc.other !== true); $('pcTapeRow').classList.toggle('hide', pc.other !== 'tape'); $('pcRefBox').classList.toggle('hide', pc.other !== 'ref');
  $('pcRefCustom').classList.toggle('hide', Number($('pcRefType').value) !== -1);
  $('pcFillTxt').textContent = pc.fill ? pc.fill + ' cm pod krawędzią' : 'przy samej krawędzi';
  $('pcFillTap').classList.toggle('on', pc.fillTap); $('pcFillTap').textContent = pc.fillTap ? '👆 Stuknij na zdjęciu…' : '📍 Zaznacz na zdjęciu';
  document.querySelectorAll('[data-pcshape]').forEach(b => b.classList.toggle('on', b.dataset.pcshape === pc.shape));
  const box = $('pcResult'); box.replaceChildren();
  if (r) {
    const u = r.useRef ? .15 : (n >= 8 ? .04 : n >= 6 ? .05 : .08);
    box.append(el('div', { class: 'calc-main', text: 'Realnie wchodzi ≈ ' + fmt(r.real) + ' m³' }));
    box.append(el('div', { class: 'calc-range', text: 'od ' + fmt(r.real * (1 - u)) + ' do ' + fmt(r.real * (1 + u)) + ' m³' }));
    box.append(el('div', { class: 'muted', text: (r.nominal ? 'Kosz ' + fmt(r.nominal) + ' m³ do krawędzi' : 'Do krawędzi ≈ ' + fmt(r.rim) + ' m³') + (r.fillCm ? ' · beton ' + r.fillCm + ' cm niżej = ' + Math.round(r.real / r.rim * 100) + '%' : '') }));
    box.append(el('div', { class: 'muted', text: 'Wys. ' + Math.round(r.dims.h) + ' cm · góra ' + Math.round(r.dims.ds.at(-1)) + ' cm · wylew ' + Math.round(r.dims.ds[0]) + ' cm' + ' · ' + n + ' pkt obrysu' + ' · ' + r.pair }));
    const m = bucketModel({ shape: 'profile', dims: r.dims, capacity: r.real }, r.real);
    box.append(el('div', { class: 'marks' }, ...bucketMarks(r.real).map(v => el('div', { class: 'mark-row' }, el('b', { text: fmt(v) + ' m³' }), el('span', { text: Math.round(m.belowRimCm(v)) + ' cm pod krawędzią' })))));
  } else if (pcLevels()) box.append(el('div', { class: 'muted', text: pc.other === 'ref' ? 'Zaznacz przedmiot na zdjęciu.' : pc.other === 'tape' ? 'Wpisz wysokość kosza z miarki (cm).' : 'Wybierz, jaki to kosz.' }));
  $('pcSave').disabled = !r;
  if (pc.edit) { $('pcEditFill').classList.toggle('on', !!pc.fillTap); $('pcEditFill').classList.toggle('hide', !(pcCompute() && pcMainView() && pcMainView() !== 'top')) }
  if (pc.edit) $('pcEditHint').textContent = (pc.fillTap ? '👆 Stuknij albo przeciągnij, gdzie kończy się beton' : pc.other === 'ref' && pcLevels() && pc.ref.length < 2 ? '📏 Stuknij oba końce wzorca' : 'Punkty: ' + pc.pts.length + ' / ' + PT_MAX + ' · stuknij = punkt · przeciągnij punkt = popraw' + (pcFillLineY() != null ? ' · przeciągnij białą linię = beton' : '') + ' · przesuń palcem = przewiń');
  const miss = $('pcMissing'); const anyDone = ['front', 'side', 'top'].some(v => levelsFor(viewData(v).pts || []));
  miss.classList.toggle('hide', !!pcMainView() || !anyDone || !has);
  miss.replaceChildren(el('b', { text: '⚠ Brakuje zdjęcia z PRZODU albo z BOKU' }), el('span', { text: 'Z samej góry nie policzę wysokości kosza. Dodaj zdjęcie kosza od przodu (cały kosz w kadrze) i obrysuj go — wtedy „Zapisz” się odblokuje.' }),
    el('div', { class: 'row' }, el('button', { type: 'button', class: 'primary', text: '📷 Dodaj zdjęcie przodu', onclick: () => askChoice('Skąd wziąć zdjęcie przodu?', [['📸 Zrób zdjęcie aparatem', 'cam', 'primary'], ['🖼 Wybierz z galerii', 'gal', '']], v => { pc.wantView = 'front'; $(v === 'cam' ? 'pcAddCam' : 'pcAddGal').click() }) }),
      el('button', { type: 'button', text: '⬜ Przejdź do przodu', onclick: () => pcSwitch('front') })));
  pcDraw();
}
function pcLabel(g, k, x, y, txt, bg, fg, side = 'left') { const fs = 12 / k; g.font = `900 ${fs}px sans-serif`; const tw = g.measureText(txt).width + 12 / k, W = pc.img.width; if (side === 'left') x = x - tw - 8 / k; if (x < 2 / k) x = 2 / k; if (x + tw > W - 2 / k) x = W - tw - 2 / k; y = y + fs * 1.3; g.fillStyle = bg; g.fillRect(x, y - fs * 2.1, tw, fs * 1.6); g.fillStyle = fg; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, x + 6 / k, y - fs * 1.3) }
function pcDraw() {
  if (!pc.img) return;
  const cv = $('pcCanvas'), wrap = $('pcWrap'), dpr = Math.min(2, window.devicePixelRatio || 1), maxW = pc.edit ? window.innerWidth - 12 : (wrap.clientWidth || 340) - 8, maxH = pc.edit ? window.innerHeight - 150 : Math.max(240, window.innerHeight * .5);
  const k = Math.min(maxW / pc.img.width, maxH / pc.img.height) * (pc.edit ? (pc.zoom || 1) : 1); pc.k = k;
  const w = Math.round(pc.img.width * k), h = Math.round(pc.img.height * k);
  cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.width = w * dpr; cv.height = h * dpr;
  const g = cv.getContext('2d'); g.setTransform(dpr * k, 0, 0, dpr * k, 0, 0); g.drawImage(pc.img, 0, 0);
  const lw = 3 / k, rad = 12 / k;
  const lv = pcLevels(), sd = pcSides();
  if (lv && pc.pts.length >= 4) {
    g.lineWidth = lw; g.strokeStyle = '#2FD271'; g.fillStyle = 'rgba(47,210,113,.16)'; g.beginPath(); orderPts(pc.pts).forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fill(); g.stroke();
    if (pc.view === pcMainView() && pc.view !== 'top') { const r = pcCompute(); if (r) { const top = lv.at(-1), bot = lv[0], f = 1 - r.fillCm / r.dims.h, y = bot.y + (top.y - bot.y) * f, w = lv.reduce((m, l) => Math.abs(l.y - y) < Math.abs(m.y - y) ? l : m, lv[0]); g.setLineDash([10 / k, 6 / k]); g.strokeStyle = '#fff'; g.lineWidth = lw * 1.2; g.beginPath(); g.moveTo(w.l, y); g.lineTo(w.r, y); g.stroke(); g.setLineDash([]); pcLabel(g, k, w.l, y, 'BETON −' + Math.round(r.fillCm) + ' cm', '#ffffff', '#06121a') } }
  } else if (lv) {
    g.lineWidth = lw; g.strokeStyle = '#2FD271'; g.fillStyle = 'rgba(47,210,113,.16)'; g.beginPath();
    lv.forEach((l, i) => i ? g.lineTo(l.l, l.y) : g.moveTo(l.l, l.y)); lv.slice().reverse().forEach(l => g.lineTo(l.r, l.y)); g.closePath(); g.fill(); g.stroke();
    if (pc.view === pcMainView() && pc.view !== 'top') { const r = pcCompute(); if (r) { const top = lv.at(-1), bot = lv[0], f = 1 - r.fillCm / r.dims.h; const y = bot.y + (top.y - bot.y) * f; const L = edgeX(sd.L, y), R = edgeX(sd.R, y); g.setLineDash([10 / k, 6 / k]); g.strokeStyle = '#fff'; g.lineWidth = lw * 1.2; g.beginPath(); g.moveTo(L, y); g.lineTo(R, y); g.stroke(); g.setLineDash([]); pcLabel(g, k, L, y, 'BETON −' + Math.round(r.fillCm) + ' cm', '#ffffff', '#06121a') } }
  } else if (sd) {
    g.lineWidth = lw; g.strokeStyle = '#2FD271';
    for (const E of [sd.L, sd.R]) if (E.length > 1) { g.beginPath(); E.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke() }
  }
  if (lv) { const tY = lv.at(-1).y, bY = lv[0].y, cx = (lv.at(-1).l + lv.at(-1).r) / 2, cxb = (lv[0].l + lv[0].r) / 2, fs = 13 / k;
    const tag = (txt, x, y, col) => { g.font = `900 ${fs}px sans-serif`; const tw = g.measureText(txt).width + 12 / k; g.fillStyle = col; g.fillRect(x - tw / 2, y - fs, tw, fs * 1.5); g.fillStyle = '#06121a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y - fs * .25) };
    tag(pc.view === 'top' ? 'TYŁ' : '▲ GÓRA · WLEW', cx, tY - 10 / k, '#2FD271'); tag(pc.view === 'top' ? 'PRZÓD' : '▼ DÓŁ · WYLEW', cxb, bY + 22 / k, '#ffd17e') }
  pc.pts.forEach((p, i) => {
    const left = pc.pts.length >= 4 ? true : sd && p.x < sd.cx;
    g.beginPath(); g.arc(p.x, p.y, rad, 0, Math.PI * 2); g.fillStyle = left ? '#8BD1E0' : '#ffd17e'; g.fill(); g.lineWidth = 2 / k; g.strokeStyle = '#0b1118'; g.stroke();
    g.fillStyle = '#0b1118'; g.font = `900 ${12 / k}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), p.x, p.y);
  });
  if (pc.ref.length === 2) { const m = { x: (pc.ref[0].x + pc.ref[1].x) / 2, y: (pc.ref[0].y + pc.ref[1].y) / 2 }, cm = pcRefCm(), sel = $('pcRefType'), nm = sel?.selectedOptions?.[0]?.textContent?.split('(')[0].trim() || 'wzorzec';
    const txt = '📏 ' + nm + (cm > 0 ? ' = ' + fmt(cm) + ' cm' : ''); pcLabel(g, k, m.x + 12 / k, m.y, txt, '#ff3b4e', '#fff', m.x > pc.img.width * .6 ? 'left' : 'right') }
  else if (pc.ref.length === 1) { const fs = 12 / k; g.font = `900 ${fs}px sans-serif`; g.fillStyle = '#ff3b4e'; g.textAlign = 'center'; g.fillText('📏 dotknij drugiego końca', pc.ref[0].x, pc.ref[0].y - 16 / k) }
  if (pc.ref.length) { g.lineWidth = lw; g.strokeStyle = '#ff3b4e'; g.beginPath(); g.moveTo(pc.ref[0].x, pc.ref[0].y); if (pc.ref[1]) g.lineTo(pc.ref[1].x, pc.ref[1].y); g.stroke(); pc.ref.forEach(p => { g.beginPath(); g.arc(p.x, p.y, rad * .8, 0, Math.PI * 2); g.fillStyle = '#ff3b4e'; g.fill() }) }
}
(function pcInput() {
  const cv = $('pcCanvas'), wrap = $('pcWrap');
  const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / pc.k, y: (e.clientY - b.top) / pc.k } };
  let st = null; // { id, cx, cy, sl, stop, moved, p }
  cv.addEventListener('pointerdown', e => {
    if (st) return; // drugi palec ignorujemy
    st = { id: e.pointerId, cx: e.clientX, cy: e.clientY, sl: wrap.scrollLeft, stp: wrap.scrollTop, moved: false, p: pos(e) };
    if (!pc.edit) return; // podgląd: dotknięcie otwiera powiększone zdjęcie (na puszczeniu palca)
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    if (pc.fillTap) { pcFillFromY(st.p.y); pc.drag = ['f']; return }
    const all = [...pc.pts.map((q, i) => ['p', i, q]), ...pc.ref.map((q, i) => ['r', i, q])];
    let best = null, bd = 22 / pc.k; for (const it of all) { const d = dist(st.p, it[2]); if (d < bd) { bd = d; best = it } }
    const fy = pcFillLineY(); if (!best && fy != null && Math.abs(st.p.y - fy) < 26 / pc.k) { pc.drag = ['F']; return }
    pc.drag = best;
  });
  cv.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.cx, dy = e.clientY - st.cy; if (Math.hypot(dx, dy) > 8) st.moved = true;
    if (!pc.edit) return;
    if (pc.drag) { const p = pos(e); if (pc.drag[0] === 'f' || pc.drag[0] === 'F') { pcFillFromY(p.y); return } (pc.drag[0] === 'p' ? pc.pts : pc.ref)[pc.drag[1]] = p; pcDraw(); return }
    if (st.moved) { wrap.scrollLeft = st.sl - dx; wrap.scrollTop = st.stp - dy } // przesuwanie powiększonego zdjęcia
  });
  const up = e => {
    if (!st || (e && e.pointerId !== st.id)) return; const s0 = st; st = null;
    if (!pc.edit) { if (!s0.moved && pc.img) pcEditOpen(); return }
    if (pc.drag && pc.drag[0] === 'F') { pc.drag = null; pc.moreAsked[pc.view] = true; announce('Poziom betonu: ' + (pc.fill ? pc.fill + ' cm pod krawędzią' : 'przy krawędzi')); pcUI(); return }
    if (pc.drag && pc.drag[0] === 'f' && pc.fillStay) { pc.drag = null; pc.fillTap = false; pc.fillStay = false; pc.moreAsked[pc.view] = true; announce('Poziom betonu: ' + (pc.fill ? pc.fill + ' cm pod krawędzią' : 'przy krawędzi')); pcUI(); return }
    if (pc.drag) { if (pc.drag[0] === 'f') { pc.fillTap = false; pc.drag = null; announce('Poziom betonu: ' + (pc.fill ? pc.fill + ' cm pod krawędzią' : 'przy krawędzi')); pc.moreAsked[pc.view] = true; pcEditClose(true); return } pc.drag = null; pcUI(); return }
    if (s0.moved) return;
    const p = s0.p;
    if (pc.view === pcMainView() && pc.view !== 'top' && pcLevels() && pc.other === 'ref' && pc.ref.length < 2) { pc.ref.push(p); if (pc.ref.length === 2) { pcUI(); setTimeout(() => { if (pc.edit) pcEditClose(true); announce('Wzorzec zaznaczony ✓ — wybierz z listy, co to jest') ; $('pcRefBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 500); return } }
    else if (pc.pts.length < PT_MAX) pc.pts.push(p);
    else announce('Maksymalnie ' + PT_MAX + ' punktów — przeciągnij istniejące');
    pcUI();
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { st = null; pc.drag = null });
  window.addEventListener('resize', () => { if (!$('pc').classList.contains('hide')) pcDraw() });
})();
/* powiększone zdjęcie do zaznaczania: ✓ zachowaj · ✕ wyjdź bez zmian */
/* „Nie wiem — zmierz”: zaznacz na zdjęciu przedmiot o znanej długości (człowiek, paleta, drzwi) */
function pcRefStart() {
  const mv = pcMainView();
  if (!mv || mv === 'top') return askChoice(mv === 'top' ? 'Do „Nie wiem — zmierz” potrzebne jest zdjęcie kosza z PRZODU albo z BOKU, z czymś obok do porównania (człowiek, paleta, drzwi). Z góry nie da się zmierzyć wysokości.' : 'Najpierw obrysuj kosz na zdjęciu z przodu albo z boku (min. 4 punkty), potem zaznaczysz wzorzec.', [['📷 Dodaj zdjęcie z przodu / boku', 'add', 'primary'], ['Zamknij', 'no', '']], v => { if (v === 'add') $('pcAddBtn').click() });
  if (pc.view !== mv) pcSwitch(mv);
  pc.other = 'ref'; pc.ref = []; pc.moreAsked = pc.moreAsked || {}; pc.moreAsked[pc.view] = true; pcUI();
  askChoice('Co jest na zdjęciu obok kosza? (do porównania wielkości)', [...$('pcRefType').options].map(o => [o.textContent, o.value, o.value === $('pcRefType').value ? 'primary' : '']), v => { $('pcRefType').value = v; $('pcRefType').dispatchEvent(new Event('change')) })
    .then(v => { if (v == null) return; if (v === '-1') { $('pcRefCustom')?.focus(); announce('Wpisz długość w cm, potem stuknij oba końce na zdjęciu'); } pcEditOpen() });
}
function pcEditOpen() {
  pc.edit = true; pc.zoom = 1; pc.backup = { pts: pc.pts.map(p => ({ ...p })), ref: pc.ref.map(p => ({ ...p })), fill: pc.fill };
  $('pcWrap').classList.add('editing'); $('pcEditBar').classList.remove('hide'); pcUI(); $('pcWrap').scrollTo(0, 0);
}
function pcEditClose(keep) {
  if (!keep && pc.backup) { pc.pts = pc.backup.pts; pc.ref = pc.backup.ref; pc.fill = pc.backup.fill }
  pc.edit = false; pc.backup = null; pc.fillTap = false; pc.fillStay = false; $('pcWrap').classList.remove('editing'); $('pcEditBar').classList.add('hide'); pcUI();
  pc.moreAsked = pc.moreAsked || {};
  if (keep && !pc.moreAsked[pc.view] && levelsFor(pc.pts) && pc.pts.length >= 4 && pc.photos.length < 6) {
    const free = ['front', 'side', 'top'].filter(v => v !== pc.view && !levelsFor(viewData(v).pts || []));
    pc.moreAsked[pc.view] = true; if (free.length) setTimeout(() => { if (!$('pc').classList.contains('hide') && !pc.edit) pcAskMore() }, 1200);
  }
}
function pcZoom(d) { pc.zoom = Math.max(1, Math.min(4, Math.round(((pc.zoom || 1) + d) * 2) / 2)); pcDraw(); $('pcZoomVal').textContent = pc.zoom + '×' }
function pcOpen() {
  Object.assign(pc, { moreAsked: {}, view: 'front', views: {}, useSide: false, useTop: false, photos: [], cur: 0, img: null, file: null, pts: [], ref: [], nominal: number($('bPlate').value) || .75, other: false, fill: 0, shape: $('bShape').value === 'rect' ? 'rect' : 'round', drag: null });
  $('pcFill').value = '0'; $('pcName').value = $('bName').value || '';
  $('pc').classList.remove('hide'); document.body.style.overflow = 'hidden'; pcUI();
}
$('pcEditOk').addEventListener('click', () => pcEditClose(true)); $('pcEditFill').addEventListener('click', () => { if (pc.fillTap) { pc.fillTap = false; return pcUI() } if (!pcCompute()) return announce('Najpierw obrysuj kosz (min. 4 punkty) i wybierz jego wielkość'); const mv = pcMainView(); if (!mv || mv === 'top') return announce('Poziom betonu zaznaczysz na zdjęciu z przodu albo z boku'); if (pc.view !== mv) pcSwitch(mv); pc.fillTap = true; pc.fillStay = true; pcUI() }); $('pcEditX').addEventListener('click', () => pcEditClose(false));
$('pcZoomIn').addEventListener('click', () => pcZoom(.5)); $('pcZoomOut').addEventListener('click', () => pcZoom(-.5)); $('pcEditUndo').addEventListener('click', () => { if (pc.other === 'ref' && pc.ref.length) pc.ref.pop(); else pc.pts.pop(); pcUI() });
function pcClose() { if (pc.edit) pcEditClose(true); $('pc').classList.add('hide'); document.body.style.overflow = '' }
const pcCameraNow = () => { try { $('pcCamera').click() } catch (e) { } };
const loadImgRaw = f => new Promise((res, rej) => { const rd = new FileReader(); rd.onerror = rej; rd.onload = () => { const img = new Image(); img.onload = () => res({ img, url: rd.result }); img.onerror = rej; img.src = rd.result }; rd.readAsDataURL(f) });
/* duże zdjęcia z iPhone'a (12 Mpx) zmniejszamy do 1600 px — płynne zaznaczanie i mniej pamięci */
async function loadImg(f) {
  const r = await loadImgRaw(f), W = r.img.naturalWidth || r.img.width, H = r.img.naturalHeight || r.img.height, M = 1600;
  if (Math.max(W, H) <= M) return r;
  const k = M / Math.max(W, H), cv = document.createElement('canvas'); cv.width = Math.round(W * k); cv.height = Math.round(H * k); cv.getContext('2d').drawImage(r.img, 0, 0, cv.width, cv.height);
  const blob = await new Promise(ok => cv.toBlob(ok, 'image/jpeg', .88)); const small = await loadImgRaw(blob); small.blob = blob; return small;
}
async function pcAddFiles(files, measureFirstNew) {
  const start = pc.photos.length;
  for (const f of [...files].slice(0, 6 - pc.photos.length)) { try { const { img, url, blob } = await loadImg(f); pc.photos.push({ img, url, file: blob || f }) } catch (e) { announce('Nie mogę otworzyć zdjęcia') } }
  if ([...files].length > 6 - start) announce('Maksymalnie 6 zdjęć');
  let last = null;
  for (let i = start; i < pc.photos.length; i++) {
    const n = pc.photos.length - start > 1 ? ' (' + (i - start + 1) + ' z ' + (pc.photos.length - start) + ')' : '';
    const v = pc.wantView && i === start ? (() => { const w = pc.wantView; pc.wantView = null; return w })() : await askChoice('Co widać na tym zdjęciu?' + n, [['⬜ Przód', 'front', 'primary', 'kosz od przodu, cały w kadrze'], ['◧ Bok', 'side', '', 'z boku, 90° od przodu (kosz L)'], ['◯ Góra', 'top', '', 'od góry, widać wlew'], ['🖼 Coś innego', 'other', '', 'tylko zachowaj zdjęcie']]);
    if (v && v !== 'other') last = [i, v]; else if (!v && !last && !pc.img) last = [i, 'front'];
  }
  if (last) pcPutPhoto(last[0], last[1]); else if (!pc.img && pc.photos.length) pcPutPhoto(0, 'front'); else pcUI();
}
/** ustaw zdjęcie i jako widok v (przód / bok / góra) i przejdź do jego obrysu */
function pcPutPhoto(i, v) {
  const ph = pc.photos[i]; if (!ph) return;
  if (v === 'side') pc.useSide = true; if (v === 'top') pc.useTop = true;
  if (pc.view !== v) { pc.views[pc.view] = Object.fromEntries(VIEW_KEYS.map(k => [k, pc[k]])); pc.view = v; const old = pc.views[v]; delete pc.views[v]; Object.assign(pc, old && old.cur === i ? old : { pts: [], ref: [] }) }
  else if (pc.cur !== i) { pc.pts = []; pc.ref = [] }
  for (const [k, d] of Object.entries(pc.views)) if (d && d.cur === i && k !== v) pc.views[k] = { pts: [], ref: [], img: null, file: null, cur: -1 };
  pc.cur = i; pc.img = ph.img; pc.file = ph.file; pc.moreAsked = pc.moreAsked || {}; pcUI();
}
/* po obrysie: „Dodać jeszcze zdjęcie?” → Tak → aparat albo galeria */
async function pcAskMore() {
  const want = await askChoice('Obrys gotowy ✓ Dodać jeszcze zdjęcie (np. bok albo górę), żeby było dokładniej?', [['＋ Tak, dodaj zdjęcie', 'yes', 'primary'], ['Nie, wystarczy', 'no', '']]);
  if (want !== 'yes') return;
  await askChoice('Skąd wziąć zdjęcie?', [['📸 Zrób zdjęcie aparatem', 'cam', 'primary'], ['🖼 Wybierz z galerii', 'gal', '']], v => $(v === 'cam' ? 'pcAddCam' : 'pcAddGal').click());
}
async function pcSelect(i) {
  const ph = pc.photos[i]; if (!ph) return;
  if (pc.img && pc.img !== ph.img && pc.pts.length && !(await ask('Mierzyć na innym zdjęciu? Zaznaczone punkty znikną.', 'Tak'))) return;
  if (pc.img !== ph.img) { pc.pts = []; pc.ref = [] }
  pc.cur = i; pc.img = ph.img; pc.file = ph.file; pcUI();
}
function pcStripRender() {
  const st = $('pcStrip'); st.classList.toggle('hide', pc.photos.length < 2); st.replaceChildren();
  pc.photos.forEach((ph, i) => {
    const b = el('button', { type: 'button', class: 'pc-th' + (i === pc.cur ? ' on' : ''), 'aria-label': 'Zdjęcie ' + (i + 1), onclick: () => pcSelect(i) }, el('img', { src: ph.url, alt: '' }));
    if (i === pc.cur) b.append(el('span', { text: '📐' }));
    const vw = ['front', 'side', 'top'].find(v => (v === pc.view ? pc.cur : pc.views[v]?.cur) === i && (v === 'front' || (v === 'side' ? pc.useSide : pc.useTop)));
    if (vw) b.append(el('em', { class: 'pc-vbadge', text: { front: 'PRZÓD', side: 'BOK', top: 'GÓRA' }[vw] }));
    const x = el('button', { type: 'button', class: 'pc-th-x', 'aria-label': 'Usuń zdjęcie', text: '✕', onclick: e => { e.stopPropagation(); const was = i === pc.cur; pc.photos.splice(i, 1); if (was) { pc.img = null; pc.pts = []; pc.ref = []; if (pc.photos.length) pcSelect(0); else pcUI() } else { if (i < pc.cur) pc.cur--; pcUI() } } });
    st.append(el('div', { class: 'pc-th-wrap' }, b, x));
  });
}
function pcFilePicked(e) { const fs = [...(e.target.files || [])]; e.target.value = ''; if (fs.length) pcAddFiles(fs, false) }
$('pcFile').addEventListener('change', pcFilePicked); $('pcCamera').addEventListener('change', pcFilePicked);
$('pcAddBtn').addEventListener('click', () => askChoice('Skąd wziąć zdjęcie?', [['📸 Zrób zdjęcie aparatem', 'cam', 'primary'], ['🖼 Wybierz z galerii (możesz kilka)', 'gal', '']], v => $(v === 'cam' ? 'pcAddCam' : 'pcAddGal').click()));
$('pcAddGal').addEventListener('change', pcFilePicked); $('pcAddAny').addEventListener('change', pcFilePicked); $('pcAddCam').addEventListener('change', pcFilePicked);
$('pcUndoPt').addEventListener('click', () => { if (pc.other === 'ref' && pc.ref.length) pc.ref.pop(); else pc.pts.pop(); pcUI() });
$('pcClear').addEventListener('click', () => { pc.pts = []; pc.ref = []; pcUI() });
/* obrót zdjęcia o 90° — żeby góra kosza (wlew) była na górze zdjęcia; punkty obracają się razem ze zdjęciem */
$('pcRotate').addEventListener('click', async () => {
  const i = pc.cur, ph = pc.photos[i]; if (!ph) return; const W = ph.img.width, H = ph.img.height;
  const cv = document.createElement('canvas'); cv.width = H; cv.height = W; const g = cv.getContext('2d'); g.translate(H, 0); g.rotate(Math.PI / 2); g.drawImage(ph.img, 0, 0);
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', .9)); const { img, url } = await loadImg(blob);
  const rot = arr => (arr || []).map(p => ({ ...p, x: H - p.y, y: p.x }));
  for (const v of Object.values(pc.views)) if (v && v.cur === i) { v.pts = rot(v.pts); v.ref = rot(v.ref); v.img = img; v.file = blob }
  pc.pts = rot(pc.pts); pc.ref = rot(pc.ref); Object.assign(ph, { img, url, file: blob }); pc.img = img; pc.file = blob; pcUI();
});
$('pcFill').addEventListener('input', () => { pc.fill = Number($('pcFill').value); pcUI() });
function pcFillLineY() {
  if (pc.view !== pcMainView() || pc.view === 'top') return null; const lv = pcLevels(), r = pcCompute(); if (!lv || !r) return null;
  const top = lv.at(-1).y, bot = lv[0].y; return bot + (top - bot) * (1 - Math.min(pc.fill, r.dims.h * .9) / r.dims.h);
}
/** stuknięcie na zdjęciu → ile cm pod krawędzią (wg profilu) */
function pcFillFromY(y) {
  const lv = pcLevels(), r = pcCompute(); if (!lv || !r) return;
  const yt = lv.at(-1).y, yb = lv[0].y, f = Math.min(1, Math.max(.1, (yb - y) / (yb - yt)));
  pc.fill = Math.max(0, Math.round(r.dims.h * (1 - f))); $('pcFill').max = String(Math.round(r.dims.h * .9)); $('pcFill').value = String(pc.fill); pcUI();
}
$('pcFillTap').addEventListener('click', () => {
  if (!pcCompute()) return announce('Najpierw zaznacz kosz i wybierz wielkość');
  const mv = pcMainView(); if (mv === 'top') return announce('Na zdjęciu z góry nie widać wysokości — ustaw beton suwakiem');
  if (pc.view !== mv) pcSwitch(mv);
  pc.fillTap = true; pcEditOpen(); pc.fillTap = true; pcUI();
});
['pcOther', 'pcRefCustom', 'pcTapeH', 'pcTapeW'].forEach(id => $(id).addEventListener('input', () => pcUI())); $('pcRefType').addEventListener('change', () => pcUI());
document.querySelectorAll('[data-pcshape]').forEach(b => b.addEventListener('click', () => { pc.shape = b.dataset.pcshape; pcUI() }));
$('pcClose').addEventListener('click', pcClose); $('pcCancel').addEventListener('click', pcClose);
$('pcSave').addEventListener('click', async () => {
  const r = pcCompute(); if (!r) return;
  let photos = []; const fi = viewData('front').cur, si = pc.useSide ? viewData('side').cur : -1, ti = pc.useTop ? viewData('top').cur : -1; const order = [pc.photos[fi], pc.photos[si], pc.photos[ti], ...pc.photos.filter((_, i) => i !== fi && i !== si && i !== ti)].filter(Boolean);
  for (const ph of order) try { photos.push(await thumbFromFile(ph.file)) } catch (e) { }
  photos = photos.concat(formPhotos);
  const name = $('pcName').value.trim() || ('Kosz ' + fmt(r.nominal || r.real) + ' m³');
  const p = { id: editingId || 'bucket-' + Date.now(), kind: $('bKind')?.value || 'kosz', name, shape: 'profile', dims: r.dims, estimated: true, plate: r.nominal || null, real: Math.round(r.real * 1000) / 1000, capacity: Math.round(r.real * 1000) / 1000, fillCm: r.fillCm, photos: photos.slice(0, 6).map(data => ({ data })), createdAt: getProfile(editingId)?.createdAt || Date.now() };
  if (!storeProfile(p)) return;
  pcClose(); closeBucketForm(); useSavedBucket(p);
});
$('bPhotoCalc').addEventListener('click', () => { pcOpen() }); // bez automatycznego aparatu — wybierasz: Zrób zdjęcie albo Z galerii

// ───────────────────────── kolory aplikacji ─────────────────────────
let themeReturn = 'home';
function themeRender() {
  const g = $('themeGrid'); g.replaceChildren();
  for (const [id, name, a, b] of THEMES) {
    const sw = el('div', { class: 'theme-sw' }); sw.style.background = `linear-gradient(120deg,${a},${b})`;
    const ico = kibelIcon(); sw.append(ico);
    const tile = el('button', { type: 'button', class: 'theme-tile' + (settings.theme === id ? ' on' : ''), onclick: () => { settings.theme = id; applyTheme(); saveSettings(); themeRender() } }, sw, el('strong', { text: name }));
    tile.style.setProperty('--c1', a); tile.style.setProperty('--c2', b); g.append(tile);
  }
  const [c1, c2] = themeColors(); $('cc1').value = settings.c1 || c1; $('cc2').value = settings.c2 || c2;
  homeEditorRender();
  const ug = $('uiGrid'); ug.replaceChildren();
  for (const [id, name] of UI_STYLES) { const pv = el('div', { class: 'ui-prev ' + (id === '3d' ? 'd3' : id) }); pv.append(el('i'), el('i'), el('i')); ug.append(el('button', { type: 'button', class: 'lay-tile' + ((settings.ui || '3d') === id ? ' on' : ''), onclick: () => { settings.ui = id; applyTheme(); saveSettings(); themeRender() } }, pv, el('span', { text: name }))) }
  const lg = $('layGrid'); lg.replaceChildren();
  for (const [id, name, n] of LAYOUTS) { const pv = el('div', { class: 'lay-prev ' + id }); for (let i = 0; i < n; i++) pv.append(el('i', { class: i === 1 ? 'a' : '' })); lg.append(el('button', { type: 'button', class: 'lay-tile' + ((settings.layout || 'classic') === id ? ' on' : ''), onclick: () => { settings.layout = id; applyTheme(); saveSettings(); themeRender() } }, pv, el('span', { text: name }))) }
  $('tabsBottom').checked = !!settings.tabsBottom;
  const tg = $('txGrid'); tg.replaceChildren();
  for (const [id, name] of TEXTURES) tg.append(el('button', { type: 'button', class: 'tx-tile' + ((settings.texture || 'none') === id ? ' on' : ''), onclick: () => { settings.texture = id; applyTheme(); saveSettings(); themeRender() } }, el('div', { class: 'tx-sw tx-' + id }), el('span', { text: name })));
}
let ccT; const ccChange = () => { settings.theme = 'custom'; settings.c1 = $('cc1').value; settings.c2 = $('cc2').value; applyTheme(); clearTimeout(ccT); ccT = setTimeout(() => { saveSettings(); themeRender() }, 250) };
$('homeReset').addEventListener('click', () => { settings.home = null; saveSettings(); homeEditorRender(); homeRender() });
$('tabsBottom').addEventListener('change', () => { settings.tabsBottom = $('tabsBottom').checked; applyTheme(); saveSettings() });
$('cc1').addEventListener('input', ccChange); $('cc2').addEventListener('input', ccChange);
$('themeDone').addEventListener('click', () => { settings.themeChosen = true; saveSettings(); tab(themeReturn || 'home') });
$('openTheme').addEventListener('click', () => { themeReturn = 'settings'; tab('theme') });

// ───────────────────────── ustawienia ─────────────────────────
applyTheme();
$('notifyMode').value = settings.mode; $('ttsRate').value = String(settings.rate); $('alarmOn').checked = settings.alarm; $('musicOn').checked = !!settings.music; $('headsetBtn').checked = !!settings.headsetBtn; $('lockCard').checked = settings.lockCard !== false; $('offlineSpeech').checked = !!settings.offlineSpeech; $('ofeoOn').checked = settings.ofeo !== false; $('micAuto').checked = settings.micAuto !== false; $('confirmNums').checked = settings.confirmNums !== false; $('chatty').checked = settings.chatty !== false; $('crudeOn').checked = settings.crude !== false; $('holdAdd').checked = settings.holdAdd !== false; $('lockStatus').checked = settings.lockStatus !== false; $('keepAwake').checked = settings.keepAwake !== false; $('hapticsOn').checked = settings.haptics !== false; $('musicVol').value = String(settings.musicVol ?? .6); $('confirmOn').checked = settings.confirm;
$('notifyMode').addEventListener('change', () => { settings.mode = $('notifyMode').value; saveSettings() });
$('ttsVoice').addEventListener('change', () => { settings.voice = $('ttsVoice').value; saveSettings(); lektorRender() });
$('ttsRate').addEventListener('change', () => { settings.rate = Number($('ttsRate').value); saveSettings() });
$('tempo').value = String(settings.tempo ?? .85); const tempoLbl = () => { $('tempoVal').textContent = Math.round(tempoK() * 100) + '%' }; tempoLbl();
$('tempo').addEventListener('input', () => { settings.tempo = Number($('tempo').value); tempoLbl() });
$('tempo').addEventListener('change', () => { settings.tempo = Number($('tempo').value); saveSettings(); configureNative(); elUI?.(); ttsSpeak('', 'Tak będę mówić. Zostało jeszcze dwa i pół metra sześciennego.') });
$('ttsPitch').value = String(settings.pitch ?? 1);
$('ttsPitch').addEventListener('change', () => { settings.pitch = Number($('ttsPitch').value); saveSettings() });
function lektorRender() {
  const box = $('lektorList'); box.replaceChildren();
  for (const L of LEKTORS) {
    const [id, name, desc] = L, r = lektorVoice(L), on = settings.lektor === id && !settings.voice;
    if (voiceList.length && !r.exact && id !== 'zosia' && !on) continue; // nie pokazujemy „podróbek” (np. męskich na Zosi)
    const used = r.voice ? (r.exact ? '🔊 ' + r.voice.name : '⚠️ brak tego głosu — zastępczo ' + r.voice.name) : '';
    box.append(el('button', { type: 'button', class: 'lektor' + (on ? ' on' : ''), onclick: () => { settings.lektor = id; settings.voice = ''; settings.rate = L[5]; settings.pitch = L[6]; $('ttsRate').value = String(L[5]); $('ttsPitch').value = String(L[6]); $('ttsVoice').value = ''; saveSettings(); lektorRender(); speak('ask', TEXTS.ask || 'Czy kosz już wrócił?') } },
      el('strong', { text: (on ? '✓ ' : '') + name }), el('small', { text: desc }), el('em', { text: used })));
  }
}
function elUI() {
  $('elOn').checked = !!settings.el; $('elKey').value = settings.elKey || ''; $('elVoice').value = settings.elVoice || ''; $('elModel').value = settings.elModel || 'eleven_multilingual_v2';
  const all = elAllLines(), have = all.filter(t => elNames.has(elName(t))).length;
  $('elState').textContent = settings.elVoice ? 'Pobrane teksty: ' + have + ' z ' + all.length + (have < all.length ? ' — kliknij „Pobierz głos”, żeby działało bez internetu.' : ' ✓ gotowe, działa bez internetu.') : 'Wklej klucz API i ID głosu z ElevenLabs.';
}
const elAllLines = () => [...new Set(Object.keys(TEXTS).flatMap(k => String(textOf(k) || '').split('\n').map(x => femin(x.trim())).filter(x => x && !/\bX\b/.test(x))))];
const elSave = e => { const hadKey = !!settings.elKey; settings.el = $('elOn').checked; settings.elKey = $('elKey').value.trim(); if (e?.target?.id === 'elKey' && settings.elKey && !hadKey) { settings.el = true; $('elOn').checked = true } settings.elVoice = $('elVoice').value.trim(); settings.elModel = $('elModel').value; saveSettings(); configureNative(); elUI() };
for (const id of ['elOn', 'elKey', 'elVoice', 'elModel']) $(id).addEventListener('change', elSave);
$('elTest').addEventListener('click', async () => { elSave(); if (!elReady()) return announce('Włącz lektora i wpisz klucz oraz ID głosu'); $('elState').textContent = 'Sprawdzam…'; try { const t = 'Cześć Domi, tu ' + ((settings.elVoiceName || 'Dasia').split(/[\s\-–—]/)[0]) + '. Zaczynamy betonowanie!'; await elGet(t); speak('', t); elUI() } catch (e) { $('elState').textContent = '❌ ' + e.message + ' — sprawdź klucz API, ID głosu i internet.' } });
let elBusy = false;
{ const r = $('elSpd'), lbl = () => { $('elSpdVal').textContent = Math.round(elSpeed() * 100) + '%' + (elSpeed() < .95 ? ' · wolniej' : elSpeed() > 1.05 ? ' · szybciej' : ' · normalnie') };
  r.value = String(elSpeed()); lbl();
  r.addEventListener('input', () => { settings.elSpd = Number(r.value); lbl() });
  r.addEventListener('change', async () => { settings.elSpd = Number(r.value); saveSettings(); configureNative(); elUI?.();
    if (elReady()) { announce('🐢 Nowe tempo ' + Math.round(elSpeed() * 100) + '% — pobieram głos od nowa…'); $('elDownload').click() } }) }
$('elDownload').addEventListener('click', async () => {
  elSave(); if (!elReady() || elBusy) return elReady() || announce('Włącz lektora i wpisz klucz oraz ID głosu');
  elBusy = true; const all = elAllLines().filter(t => !elNames.has(elName(t))); let done = 0, err = '';
  for (const t of all) { $('elState').textContent = 'Pobieram ' + (++done) + ' z ' + all.length + '…'; try { await elFetchStore(t) } catch (e) { err = e?.message || String(e); break } }
  elBusy = false; elUI(); if (err) $('elState').textContent = '❌ ' + err + ' (pobrano ' + (done - 1) + '). Kliknij jeszcze raz, żeby dokończyć.'; else announce('Głos pobrany ✓');
});
$('elClear').addEventListener('click', async () => { if (!(await ask('Usunąć pobrany głos z telefonu?', 'Usuń', true))) return; if (nativeVoice) await NV.clearVoice(); else await idb('readwrite', st => st.clear()).catch(() => { }); elNames = new Set(); elUI() });
elLoadNames().then(elUI);
/* biblioteka głosów ElevenLabs — przeglądanie, odsłuch i wybór w apce */
async function elApi(path, method = 'GET', body) {
  const key = ($('elKey').value || settings.elKey || '').trim(); if (!key) throw new Error('Najpierw wklej klucz API ElevenLabs');
  let status, text;
  if (nativeVoice && NV.elApi) { const r = await NV.elApi({ key, path, method, body: body ? JSON.stringify(body) : undefined }); status = r?.status; text = r?.body || '' }
  else { const r = await fetch('https://api.elevenlabs.io' + path, { method, headers: { 'xi-api-key': key, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); status = r.status; text = await r.text() }
  let j = {}; try { j = JSON.parse(text || '{}') } catch (e) { }
  if (status < 200 || status >= 300) { const d = j.detail; throw new Error('ElevenLabs ' + status + (d ? ': ' + (typeof d === 'string' ? d : d.message || d.status || '') : '')) }
  return j;
}
const elLib = { page: 0, list: [], audio: null, playing: '' };
const PL = { female: 'damski', male: 'męski', neutral: 'neutralny', young: 'młody', middle_aged: 'w średnim wieku', old: 'starszy' };
function elLibStop() { try { elLib.audio?.pause() } catch (e) { } elLib.audio = null; elLib.playing = '' }
function elLibRender() {
  const box = $('elLibList'); box.replaceChildren();
  for (const v of elLib.list) {
    const id = v.voice_id, on = settings.elVoice === id || settings.elVoiceSrc === id, play = elLib.playing === id;
    const info = [PL[v.gender] || v.gender, PL[v.age] || v.age, v.descriptive, v.use_case].filter(Boolean).join(' · ');
    box.append(el('div', { class: 'el-v' + (on ? ' on' : '') },
      el('button', { type: 'button', class: 'el-play', text: play ? '⏹' : '▶', onclick: () => { if (play) { elLibStop(); return elLibRender() } elLibStop(); if (!v.preview_url) return announce('Brak próbki'); const a = new Audio(v.preview_url); elLib.audio = a; elLib.playing = id; a.onended = () => { elLib.playing = ''; elLibRender() }; a.play().catch(() => announce('Nie udało się odtworzyć próbki')); elLibRender() } }),
      el('div', {}, el('b', { text: v.name }), el('small', { text: info }), v.description ? el('small', { text: String(v.description).slice(0, 110) }) : ''),
      el('button', { type: 'button', class: on ? '' : 'primary', text: on ? '✓ Wybrany' : 'Wybierz', onclick: () => elLibPick(v) })));
  }
}
async function elLibLoad(reset) {
  if (reset) { elLib.page = 0; elLib.list = [] }
  const q = new URLSearchParams({ language: 'pl', page_size: '30', page: String(elLib.page) }); const g = $('elLibGender').value, s = $('elLibSearch').value.trim(); if (g) q.set('gender', g); if (s) q.set('search', s);
  $('elLibState').textContent = 'Szukam głosów…'; $('elLibMore').hidden = true;
  try { const j = await elApi('/v1/shared-voices?' + q); elLib.list.push(...(j.voices || [])); elLib.page++; $('elLibState').textContent = elLib.list.length ? 'Kliknij ▶, żeby posłuchać. „Wybierz” ustawia głos w apce.' : 'Nic nie znalazłem — zmień filtr.'; $('elLibMore').hidden = !j.has_more; elLibRender() }
  catch (e) { $('elLibState').textContent = '❌ ' + e.message }
}
async function elLibPick(v) {
  elLibStop(); $('elLibState').textContent = 'Dodaję „' + v.name + '” do Twoich głosów…';
  let id = v.voice_id;
  try { const j = await elApi('/v1/voices/add/' + encodeURIComponent(v.public_owner_id) + '/' + encodeURIComponent(v.voice_id), 'POST', { new_name: 'BK+ ' + v.name }); if (j.voice_id) id = j.voice_id }
  catch (e) { if (!/already|exist|409|400/i.test(e.message)) { $('elLibState').textContent = '❌ ' + e.message + (/limit|slot/i.test(e.message) ? ' — usuń jakiś głos na elevenlabs.io (My Voices) albo zmień plan.' : ''); return } }
  settings.elVoice = id; settings.elVoiceSrc = v.voice_id; settings.elVoiceName = v.name; settings.el = true; $('elVoice').value = id; $('elOn').checked = true; saveSettings(); configureNative(); elUI(); elLibRender();
  $('elLibState').textContent = '✓ Wybrany: ' + v.name + '. Teraz kliknij „⬇ Pobierz głos”, żeby działał bez internetu.';
  try { const t = 'Cześć Domi, tu ' + v.name.split(/[\s\-–—]/)[0] + '. Czy kosz już jest?'; await elGet(t); speak('', t) } catch (e) { }
}
$('elBrowse').addEventListener('click', () => { const b = $('elLibBox'); b.hidden = !b.hidden; if (!b.hidden && !elLib.list.length) elLibLoad(true); if (b.hidden) elLibStop() });
$('elLibGender').addEventListener('change', () => elLibLoad(true));
let elLibT = 0; $('elLibSearch').addEventListener('input', () => { clearTimeout(elLibT); elLibT = setTimeout(() => elLibLoad(true), 600) });
$('elLibMore').addEventListener('click', () => elLibLoad(false));
$('startForm').checked = settings.startForm !== false; $('startForm').addEventListener('change', () => { settings.startForm = $('startForm').checked; saveSettings() });
$('tapLevel').checked = !!settings.tapLevel;
for (const [id, k] of [['tapLevel', 'tapLevel'], ['holdAdd', 'holdAdd'], ['lockStatus', 'lockStatus'], ['headsetBtn', 'headsetBtn'], ['lockCard', 'lockCard'], ['offlineSpeech', 'offlineSpeech'], ['ofeoOn', 'ofeo'], ['micAuto', 'micAuto'], ['confirmNums', 'confirmNums'], ['chatty', 'chatty'], ['crudeOn', 'crude'], ['keepAwake', 'keepAwake'], ['hapticsOn', 'haptics']]) $(id).addEventListener('change', () => { settings[k] = $(id).checked; saveSettings(); configureNative(); if (session) render() });
const buzz = kind => { if (settings.haptics === false) return; if (nativeVoice) NV.haptic?.(kind).catch?.(() => { }); else try { navigator.vibrate?.(kind === 'warning' ? [60, 40, 60] : 40) } catch (e) { } };
{ const sel = $('introSong'), sh = $('songShift'), shv = $('songShiftV');
  sel.replaceChildren(el('option', { value: 'random', text: '🎲 Losowo (co start inna)' }), ...INTRO_SONGS.map(x => el('option', { value: x.id, text: '🎵 ' + x.name })));
  sel.value = settings.introSong || 'random';
  const cur = () => INTRO_SONGS.find(x => x.id === sel.value) || introSong;
  const shDraw = () => { const sg = cur(); sh.value = String(songDelay(sg)); shv.textContent = sg.name + ': ' + fmt(songDelay(sg)) + ' s' };
  sel.addEventListener('change', () => { settings.introSong = sel.value; saveSettings(); shDraw() });
  sh.addEventListener('input', () => { const sg = cur(); settings.songShift = { ...(settings.songShift || {}), [sg.id]: Number(sh.value) }; saveSettings(); shDraw() });
  $('introReplay').addEventListener('click', () => { if ($('intro') || !INTRO_TPL || session) return announce(session ? 'Najpierw zakończ betonowanie' : 'Intro już leci'); const b = INTRO_TPL.cloneNode(true); document.body.prepend(b); runIntro(b); setTimeout(shDraw, 100) });
  shDraw() }
{ const rs = $('remindMode'); rs.replaceChildren(...Object.entries(REMIND).map(([k, v]) => el('option', { value: k, text: v.label }))); rs.value = settings.remindMode || 'normal';
  rs.addEventListener('change', () => { settings.remindMode = rs.value; saveSettings(); configureNative(); if (session && (phase === 'away' || phase === 'late')) NATIVE.schedule?.(deadline, SHORT.ask); announce('🔔 Przypomnienia: ' + remindCfg().label) }) }
$('introEvery').checked = settings.introEvery !== false; $('introEvery').addEventListener('change', () => { settings.introEvery = $('introEvery').checked; saveSettings() });
{ const hs = $('helloShift'), hv = () => $('helloShiftV').textContent = (Number(settings.helloShift) > 0 ? '+' : '') + fmt(Number(settings.helloShift) || 0) + ' s'; hs.value = String(Number(settings.helloShift) || 0); hv(); hs.addEventListener('input', () => { settings.helloShift = Number(hs.value); saveSettings(); hv() }) }
$('musicOn').addEventListener('change', () => { settings.music = $('musicOn').checked; saveSettings(); bgmUpdate() });
/* ustawienia jak akordeon — otwarta jedna kategoria naraz */
document.querySelectorAll('details.set-cat').forEach(d => d.addEventListener('toggle', () => { if (d.open) document.querySelectorAll('details.set-cat').forEach(o => { if (o !== d) o.open = false }) }));
document.querySelectorAll('#setNav [data-go]').forEach(b => b.addEventListener('click', () => { const d = $(b.dataset.go); if (!d) return; d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }) }));
$('goData').addEventListener('click', () => { tab('history'); setTimeout(() => $('testMode')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100) });
$('introReplay').addEventListener('click', () => { try { sessionStorage.setItem('bkp_after_intro', currentTab) } catch (e) { } location.reload() });
$('musicTest').addEventListener('click', () => { if (!BGM_ENABLED) { playIntroVoice(); return } if (!settings.music) { settings.music = true; $('musicOn').checked = true; saveSettings() } if (settings.bgm === false) { settings.bgm = true; $('bgmOn').checked = true; saveSettings() } bgmUpdate(); });
$('musicVol').addEventListener('input', () => { settings.musicVol = Number($('musicVol').value); if (bgm && !bgm.paused) { clearInterval(bgmTimer); bgm.volume = bgmTarget() } });
$('micSens').value = settings.micSens || 'low'; $('micSens').addEventListener('change', () => { settings.micSens = $('micSens').value; saveSettings(); configureNative() });
{ const vv = $('voiceVol'), show = () => $('voiceVolV').textContent = Math.round(Number(settings.voiceVol ?? 1) * 100) + '%'; vv.value = String(settings.voiceVol ?? 1); show(); vv.addEventListener('input', () => { settings.voiceVol = Number(vv.value); show() }); vv.addEventListener('change', () => { saveSettings(); configureNative(); beep() }) }
$('boostVolume').checked = settings.boostVolume !== false; $('boostVolume').addEventListener('change', () => { settings.boostVolume = $('boostVolume').checked; saveSettings(); configureNative() });
$('loudVoice').checked = settings.loudVoice !== false; $('loudVoice').addEventListener('change', () => { settings.loudVoice = $('loudVoice').checked; saveSettings(); configureNative() });
$('askOnly').checked = settings.askOnly !== false; $('askOnly').addEventListener('change', () => { settings.askOnly = $('askOnly').checked; saveSettings(); configureNative() });
$('clicksOn').checked = settings.clicks !== false; $('clicksOn').addEventListener('change', () => { settings.clicks = $('clicksOn').checked; saveSettings() });
$('introVoiceOn').checked = settings.introVoice !== false; $('introVoiceOn').addEventListener('change', () => { settings.introVoice = $('introVoiceOn').checked; saveSettings(); if (settings.introVoice) playIntroVoice(); else if (voiceEl) { voiceEl.pause(); voiceEl = null; bgmUpdate() } });
$('bgmOn').checked = settings.bgm !== false; $('bgmOn').addEventListener('change', () => { settings.bgm = $('bgmOn').checked; saveSettings(); bgmUpdate() });
$('musicVol').addEventListener('change', () => { settings.musicVol = Number($('musicVol').value); saveSettings(); if (bgm && !bgm.paused) bgmFade(bgmTarget()); else playSong('start') });
$('alarmOn').addEventListener('change', () => { settings.alarm = $('alarmOn').checked; saveSettings() });
$('confirmOn').addEventListener('change', () => { settings.confirm = $('confirmOn').checked; saveSettings() });
$('ttsTest').addEventListener('click', () => speak('ask', TEXTS.ask || 'Sprawdzenie lektora'));
$('textsReset').addEventListener('click', async () => { if (!(await ask('Przywrócić domyślne teksty lektora?', 'Przywróć'))) return; TEXTS = { ...DEFAULT_TEXTS }; saveTexts(); settingsRender() });
async function loadVoices() {
  if (nativeVoice) { const r = await NV.voices().catch(() => ({ voices: [] })); voiceList = (r.voices || []).map(v => ({ id: v.id, name: v.name, quality: v.quality })) }
  else voiceList = polishVoices().map(v => ({ id: v.voiceURI, name: v.name, quality: /google|natural|online/i.test(v.name) ? 'enhanced' : 'default' }));
  const sel = $('ttsVoice'), keep = settings.voice; sel.replaceChildren(el('option', { value: '', text: 'Według lektora' }));
  for (const v of voiceList.slice().sort((a, b) => qScore(b) - qScore(a))) sel.append(el('option', { value: v.id, text: v.name + (v.quality === 'premium' ? ' ★★' : v.quality === 'enhanced' ? ' ★' : '') }));
  sel.value = voiceList.some(v => v.id === keep) ? keep : '';
  const hasMale = voiceList.some(v => M.some(r => r.test(v.name))), hasGood = voiceList.some(v => v.quality !== 'default');
  $('voiceHint').textContent = nativeVoice
    ? (!hasGood || !hasMale ? 'Więcej i ładniejszych głosów: Ustawienia iPhone’a → Dostępność → Treść mówiona → Głosy → Polski → pobierz „Zosia” i „Krzysztof” w wersji rozszerzonej / premium.' : '')
    : (!hasMale ? 'W tej przeglądarce nie ma polskiego głosu męskiego — męscy lektorzy użyją głosu zastępczego. W Edge są ładne głosy „Zofia” i „Marek (Natural)”.' : '');
  lektorRender(); configureNative();
}
async function settingsRender() {
  loadVoices();
  if (nativeVoice) clipKeys = new Set(await NV.listClips().catch(() => []));
  $('clipsHint').textContent = nativeVoice ? 'Każda linia = osobny wariant, bot losuje jeden. X = liczba. 🎙 nagrywa Twój głos — nagranie ma pierwszeństwo przed lektorem. Puste pole = cisza.' : 'Każda linia = osobny wariant, bot losuje jeden. X = liczba. Puste pole = cisza. (Nagrywanie działa w aplikacji na iPhonie.)';
  const box = $('botDictionary'); box.replaceChildren();
  for (const [group, items] of TEXT_GROUPS) {
    box.append(el('h3', { class: 'dict-group', text: group }));
    for (const [key, label] of items) {
      const isPrefix = key.startsWith('report');
      const ta = el('textarea', { rows: '4', 'aria-label': label }); ta.value = TEXTS[key] ?? '';
      let tmr; ta.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { TEXTS[key] = ta.value.trim(); saveTexts() }, 400) });
      const acts = el('div', { class: 'dict-acts' }, el('button', { type: 'button', text: '▶', 'aria-label': 'Odsłuchaj', onclick: () => speak(isPrefix ? '' : key, pickVariant(key, ta.value).replace(/X/g, '2,5')) }));
      if (nativeVoice && !isPrefix) {
        const rec = el('button', { type: 'button', class: 'rec' + (recordingKey === key ? ' live' : ''), text: recordingKey === key ? '⏹ Stop' : (clipKeys.has(key) ? '🎙 Nagraj ponownie' : '🎙 Nagraj') });
        rec.addEventListener('click', async () => {
          if (recordingKey === key) { const r = await NV.stopRecording().catch(() => ({})); recordingKey = ''; announce(r.saved ? 'Nagranie zapisane' : 'Za krótkie nagranie'); return settingsRender() }
          if (recordingKey) return announce('Najpierw zatrzymaj poprzednie nagranie');
          const p = await NV.askPermissions().catch(() => ({})); if (!p.mic) return announce('Brak zgody na mikrofon');
          try { await NV.startRecording(key); recordingKey = key; settingsRender() } catch (e) { announce('Nie mogę nagrywać') }
        });
        acts.append(rec);
        if (clipKeys.has(key)) acts.append(el('button', { type: 'button', class: 'warn', text: '🗑', 'aria-label': 'Usuń nagranie', onclick: async () => { await NV.deleteClip(key).catch(() => { }); settingsRender() } }));
      }
      box.append(el('div', { class: 'dict-row' + (clipKeys.has(key) ? ' has-clip' : '') }, el('b', { text: label + (clipKeys.has(key) ? ' · 🎙 Twoje nagranie' : '') }), ta, acts));
    }
  }
}

// ───────────────────────── historia + kopia ─────────────────────────
/* poprawka wpisu w historii: ile naprawdę wylano / ile było w gruszce */
async function historyEdit(s) {
  const tot = Number(s.total ?? 0), ld = Number(s.load) || tot;
  const mk = (id, v) => { const i = el('input', { inputmode: 'decimal', class: 'fin-rest', value: fmt(v) }); i.id = id; return i };
  const iL = mk('heLoad', ld), iP = mk('hePoured', tot);
  const row = (inp) => el('div', { class: 'fin-row' }, el('button', { type: 'button', class: 'fin-step', text: '−0,1', onclick: () => { inp.value = fmt(Math.max(0, (number(inp.value) || 0) - .1)) } }), inp, el('button', { type: 'button', class: 'fin-step', text: '+0,1', onclick: () => { inp.value = fmt((number(inp.value) || 0) + .1) } }));
  const body = el('div', { class: 'fin' }, el('p', { class: 'hint', text: (s.site || 'Budowa') + ' · ' + new Date(s.startedAt).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + (s.counted != null ? ' · licznik policzył ' + fmt(s.counted) + ' m³' : '') }),
    el('label', { class: 'label', text: '🚛 W gruszce było (m³)' }), row(iL), el('label', { class: 'label', text: '✅ Naprawdę wylano (m³)' }), row(iP),
    el('div', { class: 'chips fin-chips' }, el('button', { type: 'button', class: 'pill', text: '= cała gruszka', onclick: () => { iP.value = iL.value } })));
  if (!(await formModal('✏️ Popraw betonowanie', body, '✓ Zapisz'))) return;
  const L = number(iL.value), P = number(iP.value); if (!(P >= 0) || !(L >= 0)) return announce('Wpisz liczby');
  if (s.counted == null) s.counted = tot;
  s.load = Math.round(L * 100) / 100; s.total = s.poured = Math.round(P * 100) / 100; s.rest = Math.max(0, Math.round((L - P) * 100) / 100); s.edited = Date.now();
  storeHistory(); historyRender(); announce('Poprawione: ' + fmt(s.load) + ' / ' + fmt(s.total) + ' m³');
}
function historyRender() {
  const r = $('historyRows'); r.replaceChildren();
  if (!archive.length && !Object.keys(siteAssignments).length) { r.append(el('p', { class: 'help', text: 'Jeszcze nie masz zakończonych betonowań.' })); return }
  const groups = new Map(); archive.forEach((s, i) => { const k = (s.site || 'Budowa').trim(); if (!groups.has(k)) groups.set(k, []); groups.get(k).push([s, i]) });
  for (const k of Object.keys(siteAssignments)) { const name = [...groups.keys()].find(g => siteKey(g) === k); if (!name && !groups.has(k)) groups.set(k, []) }
  for (const [site, items] of groups) {
    const total = items.reduce((a, [s]) => a + Number(s.total ?? (s.entries || []).reduce((x, e) => x + Number(e.amount || 0), 0)), 0);
    const head = el('div', { class: 'site-head' }, el('div', {}, el('strong', { text: '🏗 ' + site }), el('small', { class: 'help', text: items.length + ' betonowań · razem ' + fmt(Math.round(total * 100) / 100) + ' m³' })),
      el('button', { type: 'button', class: 'warn', text: '🗑 Usuń budowę', onclick: async () => { if (!(await ask('Usunąć budowę „' + site + '” razem z ' + items.length + ' betonowaniami z historii?', 'Usuń', true))) return; archive = archive.filter(s => (s.site || 'Budowa').trim() !== site); delete siteAssignments[siteKey(site)]; storeSiteAssignments(); storeHistory(); refreshKnownSites(); historyRender(); announce('Budowa usunięta') } }));
    const rows = el('div', { class: 'site-rows' });
    for (const [s] of items) rows.append(el('div', { class: 'history-entry' },
      el('div', {}, el('span', { text: new Date(s.startedAt).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }), el('small', { class: 'help', text: ' · ' + (s.method || 'kibel') + ' · ' + dur(((s.endedAt || Date.now()) - s.startedAt) / 1000) })),
      el('div', { class: 'he-r' }, (() => { const tot = Number(s.total ?? (s.entries || []).reduce((a, e) => a + Number(e.amount || 0), 0)), ld = Number(s.load) || 0, cnt = Number(s.counted ?? tot);
          return el('button', { type: 'button', class: 'he-amt' + (ld && Math.abs(ld - tot) > .05 ? ' diff' : ''), 'aria-label': 'Popraw ile wylano', onclick: () => historyEdit(s) },
            el('span', { class: 'he-nums' }, el('b', { text: ld ? fmt(ld) : '—' }), el('i', { text: '/' }), el('b', { class: 'he-real', text: fmt(tot) })),
            el('small', { text: 'gruszka / wylane m³' + (Math.abs(cnt - tot) > .05 ? ' · licznik ' + fmt(cnt) : '') + ' ✏️' })) })(),
        el('button', { type: 'button', class: 'mini warn', text: '🗑', 'aria-label': 'Usuń wpis', onclick: async () => { if (!(await ask('Usunąć to betonowanie z historii?', 'Usuń', true))) return; archive = archive.filter(x => x !== s); storeHistory(); refreshKnownSites(); historyRender() } }))));
    r.append(el('div', { class: 'site-card' }, head, rows));
  }
}
function download(name, blob) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000) }
$('export').addEventListener('click', () => { const rows = ['Data;Budowa;Metoda;Załadowano_m3;Wylano_m3;Czas_s', ...archive.map(s => [new Date(s.startedAt).toLocaleString('pl-PL'), s.site, s.method, s.load, s.total, Math.round((s.endedAt - s.startedAt) / 1000)].map(v => '"' + String(v).replaceAll('"', '""') + '"').join(';'))]; download('BetonKibelPlus_historia.csv', new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })) });
const savedKeys = [KEY, HKEY, PROFILE_KEY, SITE_BUCKET_KEY, SETTINGS_KEY, TEXT_KEY];
$('appRestart').addEventListener('click', () => location.reload());
if (window.BKP_TEST) { $('testBar').classList.remove('hide'); document.body.classList.add('test-on'); $('testMode').textContent = '✖ Wyjdź z trybu testowego'; }
const toggleTest = async () => { try { if (window.BKP_TEST) localStorage.removeItem('bkp_testmode'); else { if (!(await ask('Włączyć tryb testowy? Aplikacja wystartuje czysta, a Twoje dane poczekają.', '🧪 Włącz'))) return; localStorage.setItem('bkp_testmode', '1') } } catch (e) { } NATIVE.cancel?.(); location.reload() };
$('testMode').addEventListener('click', toggleTest); $('testExit').addEventListener('click', toggleTest);
$('appWipe').addEventListener('click', async () => {
  if (!(await ask('Na pewno wyczyścić całą aplikację? Historia, kosze, teksty i ustawienia zostaną usunięte.', 'Dalej', true)) || !(await ask('Ostatnie pytanie: usunąć wszystko?', '🗑 Usuń wszystko', true))) return;
  const keep = { elKey: settings.elKey, elVoice: settings.elVoice, elModel: settings.elModel, el: settings.el };
  try { NATIVE.cancel?.(); for (const k of Object.keys(localStorage)) if (k.startsWith('beton') || savedKeys.includes(k)) localStorage.removeItem(k); localStorage.setItem(SETTINGS_KEY, JSON.stringify(keep)) } catch (e) { }
  location.reload();
});
/* ustawienia fabryczne — tylko ustawienia + teksty (historia i kosze zostają) albo wszystko */
function factoryReset(all) {
  const keep = { elKey: settings.elKey, elVoice: settings.elVoice, elVoiceName: settings.elVoiceName, elModel: settings.elModel, el: settings.el };
  try { NATIVE.cancel?.(); if (all) { for (const k of Object.keys(localStorage)) if (k.startsWith('beton') || savedKeys.includes(k)) localStorage.removeItem(k) } else { localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem(TEXT_KEY) } localStorage.setItem(SETTINGS_KEY, JSON.stringify(keep)); localStorage.setItem('bkp_factory_v358', '1') } catch (e) { }
  location.reload();
}
$('factorySettings').addEventListener('click', async () => { if (await ask('Przywrócić ustawienia fabryczne? Historia budów i kosze zostają.', '🏭 Przywróć', true)) factoryReset(false) });
$('factoryAll').addEventListener('click', async () => { if ((await ask('Wyczyścić całą aplikację? Historia, kosze, teksty i ustawienia zostaną usunięte.', 'Dalej', true)) && (await ask('Ostatnie pytanie: usunąć wszystko?', '🗑 Usuń wszystko', true))) factoryReset(true) });
$('backupExport').addEventListener('click', () => { const payload = { app: 'BetonKibelPlus', formatVersion: 1, exportedAt: new Date().toISOString(), values: {} }; for (const k of savedKeys) { let v = localStorage.getItem(k); if (v !== null && k === SETTINGS_KEY) { try { const o = JSON.parse(v); delete o.elKey; v = JSON.stringify(o) } catch (e) { } } if (v !== null) payload.values[k] = v } download('BetonKibelPlus_kopia_' + new Date().toISOString().slice(0, 10) + '.json', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })) });
$('backupImport').addEventListener('change', async () => {
  const f = $('backupImport').files?.[0]; if (!f) return;
  try {
    if (f.size > 12e6) throw Error('Plik za duży');
    const data = JSON.parse(await f.text());
    if (!['Beton Licznik', 'BetonKibelPlus'].includes(data.app) || data.formatVersion !== 1 || typeof data.values !== 'object') throw Error('To nie jest kopia BetonKibelPlus');
    const legacy = ['beton_tts_enabled', 'beton_tts_voice', 'beton_tts_profile'];
    const entries = Object.entries(data.values).filter(([k]) => !legacy.includes(k));
    if (entries.some(([k, v]) => !savedKeys.includes(k) || typeof v !== 'string')) throw Error('Kopia zawiera nieznane dane');
    if (!(await ask('Przywrócić kopię? Zastąpi historię, betonowanie i kosze.', 'Przywróć'))) return;
    const keepKey = settings.elKey; for (const k of savedKeys) localStorage.removeItem(k); for (const [k, v] of entries) localStorage.setItem(k, v); if (keepKey) { try { const o = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); o.elKey = keepKey; localStorage.setItem(SETTINGS_KEY, JSON.stringify(o)) } catch (e) { } } location.reload();
  } catch (e) { ask('Nie udało się przywrócić: ' + (e.message || e), 'OK', false, true) } finally { $('backupImport').value = '' }
});

// ───────────────────────── start aplikacji ─────────────────────────
try {
  const h = JSON.parse(localStorage.getItem(HKEY) || '[]'); if (Array.isArray(h)) archive = h;
  const old = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (old && old.startedAt && Array.isArray(old.entries)) {
    session = old; if (!session.capacity) session.capacity = session.dose || .5;
    if (session.bucketProfile && !session.bucketProfile.dims && session.bucketProfile.dimensions) session.bucketProfile = snapshot(migrateProfile(session.bucketProfile));
    phase = old.tripPhase || 'ready'; departed = Number(old.departed || 0); deadline = Number(old.deadline || 0); alarmVisible = !!old.alarmVisible; nextReminder = Number(old.nextReminder || 0);
  }
} catch (e) { console.warn('Nie udało się odtworzyć danych:', e) }
saveProfiles();
selectMethod('kibel'); configureNative(); syncNative();
if (nativeVoice) NV.listClips().then(k => clipKeys = new Set(k)).catch(() => { });
loadVoices();
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { if (currentTab === 'settings') loadVoices() };
tab(session && settings.startForm !== false ? 'work' : 'home'); setInterval(tick, 500);
drainNative();

/* ikony (emoji / symbole na początku przycisków) trochę większe — owijamy je w <span class="ico"> */
const ICO_RE = /^((?:\p{Extended_Pictographic}|[⌂▤▶↶⏹↩✕✓⏮⏯⏳⚖⚡➕＋])(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s*/u;
function icoWrap(b) { const f = b.firstChild; if (!f || f.nodeType !== 3) return; const m = f.nodeValue.match(ICO_RE); if (!m) return; const sp = document.createElement('span'); sp.className = 'ico'; sp.textContent = m[1]; f.nodeValue = ' ' + f.nodeValue.slice(m[0].length); b.insertBefore(sp, f) }
const icoScan = root => { if (root.matches?.('button, .pill, summary')) icoWrap(root); root.querySelectorAll?.('button, .pill, summary').forEach(icoWrap) };
icoScan(document.body);
new MutationObserver(ms => { for (const m of ms) { if (m.target.matches?.('button, .pill, summary')) icoWrap(m.target); for (const n of m.addedNodes) if (n.nodeType === 1) icoScan(n) } }).observe(document.body, { childList: true, subtree: true });
const INTRO_TPL = $('intro')?.cloneNode(true);
let hiddenAt = 0;
/* intro za każdym razem, gdy wracasz do apki (po min. 30 s), o ile nie trwa betonowanie */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return }
  if (hiddenAt && Date.now() - hiddenAt > 30000 && !session && !$('intro') && INTRO_TPL && settings.introEvery !== false) { const b = INTRO_TPL.cloneNode(true); document.body.prepend(b); runIntro(b) }
});
runIntro($('intro'));
/* najpłynniejsze przejście: logo BK+ leci w miejsce logo w nagłówku, tło gaśnie, a apka wjeżdża pod spodem */
function introMorph(box) {
  const logo = box.querySelector('.intro-logo'), hdr = document.querySelector('header.top'), vis = e => e && e.offsetParent !== null && e.getBoundingClientRect().width > 0;
  const target = [...document.querySelectorAll('header.top .hud-logo, header.top .brand img, header.top .brand svg')].find(vis) || (vis(hdr) ? document.querySelector('header.top .brand') : null);
  document.body.classList.remove('pre-intro'); document.body.classList.add('app-in'); setTimeout(() => document.body.classList.remove('app-in'), 1700);
  if (!logo || !target || matchMedia('(prefers-reduced-motion: reduce)').matches) { box.classList.add('out'); setTimeout(() => box.remove(), 1200); return }
  const bg = document.createElement('div'); bg.className = 'intro-bg'; bg.style.background = getComputedStyle(box).background; box.prepend(bg); box.style.background = 'transparent';
  const a = logo.getBoundingClientRect(), b = target.getBoundingClientRect(), sc = Math.max(.05, Math.min(b.width / a.width, b.height / a.height));
  const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
  logo.style.animation = 'none'; logo.style.transform = 'none'; void logo.offsetWidth;
  box.classList.add('morph'); document.body.classList.add('logo-landing');
  requestAnimationFrame(() => { logo.style.transform = `translate(${dx}px, ${dy}px) scale(${sc})` });
  setTimeout(() => { document.body.classList.remove('logo-landing'); target.classList.add('logo-land'); setTimeout(() => target.classList.remove('logo-land'), 500) }, 820);
  setTimeout(() => box.remove(), 1000);
}
function runIntro(box) {
  if (!box) return;
  document.body.classList.add('pre-intro');
  document.documentElement.style.setProperty('--hs', (Number(settings.helloShift) || 0) + 's');
  setTimeout(() => document.body.classList.remove('pre-intro'), 25000);
  pickIntroSong(); window.__introT0 = 0;
  let done = false; const close = () => { if (done) return; done = true; introPlaying = false; if (TAB_OF[currentTab] === 'work') stopIntroVoice(); bgmUpdate(); setTimeout(bgmUpdate, 600); introMorph(box) };
  box.addEventListener('click', () => { if (Date.now() - soundUnlockedAt < 700) return; stopIntroVoice(); close() });
  /* animacja startuje razem z muzyką, żeby zderzenie i „Witaj” wpadły w rytm */
  box.classList.add('wait'); let started = false;
  const start = () => { if (started || done) return; started = true; window.__introT0 = Date.now(); box.classList.remove('wait'); setTimeout(close, 17000); setTimeout(() => { if (!done) { playBoom(); buzz('warning'); setTimeout(() => buzz('warning'), 180); box.classList.add('boom-hit') } }, 2950) };
  window.__introStart = start; setTimeout(start, 2500 + songDelay(introSong) * 1000);
  introPlaying = true;
  const webIntro = () => { playIntroVoice(); if (voiceEl) voiceEl.addEventListener('ended', () => setTimeout(close, 300)) };
  if (settings.music && settings.introVoice !== false) {
    if (NATIVE.isNative && NV.playIntro) NV.playIntro({ file: introSong.file, volume: Math.min(1, .3 + Number(settings.musicVol ?? .7)) }).then(r => { if (r?.ok) { nativeIntro = true; setTimeout(start, songDelay(introSong) * 1000); setTimeout(close, (r.duration || 16) * 1000 + 300) } else webIntro() }).catch(webIntro); // iPhone: gra od razu z apki
    else webIntro();
  } else start();
  if (!settings.themeChosen) { settings.themeChosen = true; saveSettings() }
  /* mikrofon był włączony przy betonowaniu — po ponownym uruchomieniu apki włącz go sam */
  setTimeout(() => { if (nativeVoice && settings.micOn && session && !micWanted) { toggleMic.silent = true; toggleMic().finally(() => { toggleMic.silent = false }) } }, 2500);
  try { if (!window.BKP_TEST && !localStorage.getItem('bkp_factory_v358')) (function waitIntro() { if ($('intro')) return setTimeout(waitIntro, 500); if (document.querySelector('.ask-back')) return setTimeout(waitIntro, 1500); localStorage.setItem('bkp_factory_v358', '1'); askChoice('Nowa wersja. Przywrócić aplikację do ustawień fabrycznych?', [['🏭 Tylko ustawienia', 'set', 'primary', 'historia budów i kosze zostają'], ['🗑 Wszystko od zera', 'all', 'warn', 'apka jak świeżo zainstalowana'], ['Nie, zostaw jak jest', 'no', '']], v => { if (v === 'set') factoryReset(false); else if (v === 'all') factoryReset(true) }) })() } catch (e) { }
}

/* diagram: licznik piór (pióro z kalibracji, domyślnie 0,09 m³) */
(() => {
  const inp = $('pioroN'), out = $('pioroOut'); if (!inp) return;
  const word = n => { const k = Math.abs(n) % 100, j = k % 10; return n % 1 ? 'pióra' : n === 1 ? 'pióro' : (j >= 2 && j <= 4 && (k < 12 || k > 14)) ? 'pióra' : 'piór' };
  const calc = () => { const n = number(inp.value); if (!(n > 0)) { out.textContent = 'Wpisz liczbę piór — policzę m³.'; return }
    const PIORO = pioroM3(), m3 = Math.round(n * PIORO * 100) / 100; out.innerHTML = '';
    out.append(el('b', { text: fmt(n) + ' ' + word(n) + ' = ' + fmt(m3) + ' m³' }), el('small', { text: '≈ ' + Math.round(n * PIORO * 1000) + ' litrów betonu' })) };
  const step = d => { const n = Math.max(0, (number(inp.value) || 0) + d); inp.value = n ? fmt(n) : ''; calc() };
  inp.addEventListener('input', calc); $('pioroMinus').addEventListener('click', () => step(-1)); $('pioroPlus').addEventListener('click', () => step(1));
})();
