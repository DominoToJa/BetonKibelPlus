# BetonKibelPlus — projekt natywny iOS / DOMINO

## Co jest gotowe
- źródła aplikacji z aktualnego licznika i profilem koszy
- STACHU usunięty; DOMINO to **nazwa konfiguracji lektora**, na razie czyta go polski syntezator urządzenia (nie prawdziwy klon głosu)
- systemowe lokalne powiadomienie o powrocie kosza, z akcjami „Kosz jest” / „Jeszcze nie”
- zachowana korekta ostatniej porcji, diagram i historia

## Jak zbudować (Mac + Xcode)
1. Zainstaluj Node.js (LTS), Xcode i CocoaPods / wymagane zależności Capacitor.
2. W folderze projektu uruchom `npm install`.
3. `npm run build`
4. `npm run ios:init` (tylko pierwszy raz), potem `npm run ios:sync`.
5. `npm run ios:open`; w Xcode wybierz swoje Team/Signing, iPhone i Run.
6. W Xcode skonfiguruj App Icon, opisy uprawnień oraz ustawienia powiadomień, zanim opublikujesz aplikację.

## Ograniczenia ważne do testów
- **To nie jest .ipa ani plik gotowy do instalacji** — projekt do kompilacji.
- Powiadomienie systemowe działa bez otwartej aplikacji, gdy iOS udzielił uprawnień; odsłuch mowy DOMINO w tle nie jest gwarantowany.
- Akcje „Kosz jest” i „Jeszcze nie” trzeba sprawdzić na fizycznym iPhonie (także przy zamkniętej aplikacji). Ich trwałość zależy od cyklu życia procesu; wersja produkcyjna wymaga natywnego handlera akcji i zapisu stanu sesji.
- Ciągły mikrofon na zablokowanym ekranie nadal nie jest zapewniony; przeglądarkowy SpeechRecognition może nie działać w WKWebView. To osobny etap migracji na natywny Speech framework.
- Zdjęcia nadal nie dają automatycznej analizy AI pojemności; pojemność ustalana jest z tabliczki/wymiarów.
- Nie usuwaj starej aplikacji PWA przed eksportem kopii historii. WKWebView może mieć osobny magazyn danych i nie przenosi automatycznie historii z Safari.

## DOMINO — docelowy głos
Gdy będzie dostępna próbka głosu DOMINO lub przygotowane nagrania, dodaj je jako zasoby i podłącz do mapy komunikatów. Obecnie wybór DOMINO tylko steruje głosem systemowym. Pliki poprzedniego lektora nie są dołączone.

## Do sprawdzenia przed publikacją w App Store
Identyfikator pakietu, ikony, polityka prywatności, zgody na mikrofon/rozpoznawanie mowy i ewentualny tryb „neutralne komunikaty”.
