# BetonKibelPlus DOMINO: backup rozmowy i aplikacji

Stan na 9 listopada 2026, wersja **3.5.8**.

## Gdzie co jest
- **Kod:** GitHub `DominoToJa/BetonKibelPlus`, gałąź `main`.
- **Kopia zapasowa kodu:** gałąź `backup-2026-11-09-v3.5.8`. Jest to zamrożony stan z tego dnia.
- **Paczka ZIP:** `BetonKibelPlus_v3.5.8_kod.zip` (cały projekt razem z dźwiękami i ikonami).
- **Wersja testowa w przeglądarce:** https://claude.ai/artifact/SHuv8xymDJ3eGv3Vh1xbv8. ElevenLabs w niej nie działa, bo przeglądarka blokuje połączenie. Działa tylko na iPhonie.
- **Technologia:** Capacitor 7 + Vite. Własny plugin iOS `plugins/domino-native` (Swift) obsługuje mowę, mikrofon, nagrania, ElevenLabs, wibracje i powiadomienia na ekranie blokady.

## Jak zbudować i wgrać na iPhone'a
1. W Codemagic uruchom workflow **ios-unsigned** na gałęzi `main`.
2. Pobierz plik `BetonKibelPlus_unsigned.ipa`.
3. Wgraj go przez **Sideloadly** z tym samym Apple ID co zawsze, **na starą apkę, bez usuwania**. Wtedy dane zostają.
4. Darmowe Apple ID wymaga ponownego wgrania co 7 dni.

## ElevenLabs (lektor)
- Klucz API tworzysz na elevenlabs.io w zakładce Developers → API Keys.
- Jeśli klucz ma ograniczenia, ustaw: **Text to Speech → Dostęp**, **Głosy → Zapis**. Reszta może zostać na „Brak dostępu”.
- Zostaw włączone „Automatyczne wyłączanie po wycieku”.
- **Klucz wklejasz tylko w apce:** Opcje → Lektor ElevenLabs. Nie ma go w kodzie, na GitHubie ani w kopii danych.
- W apce: „🎙️ Wybierz głos z biblioteki ElevenLabs” pokazuje polskie głosy. ▶ to odsłuch, „Wybierz” ustawia głos, a „⬇ Pobierz głos” zapisuje go do pracy bez internetu.
- Domyślny głos to Dasia, ID `qVCMNCiCMS3amhcNBMwc`. Model: Multilingual v2.

## Co ma aplikacja (najważniejsze)
**Licznik betonowania**
- Licznik z suwakiem z boku (płynne kroki co 0,01).
- Stuknięcie w kosz ustawia poziom betonu, a przytrzymanie dodaje kosz.
- Do wyboru: tryb jednej ręki, ekran zawsze włączony, wibracje, status na ekranie blokady i przyciski słuchawki BT.

**Rozładunek**
- Kosz, taczka albo koparka („Inne”). Każdy ma własne rysunki i teksty lektora.
- W „Moje kosze” są rodzaje koszy, a przy starcie są gotowe chipy z taczkami.

**Kalkulator zdjęciowy**
- Pyta, czy zdjęcie jest z przodu, z boku czy z góry. Do wyboru aparat albo galeria.
- Wystarczy jedno zdjęcie, ale przy trzech wynik jest dokładniejszy.
- Edytor z powiększeniem ma linię odniesienia i linię BETON oraz obracanie.
- Jest też opcja „Nie wiem — zmierz”.

**Głos**
- Lektor mówi tylko „Czy kosz już jest?”, odpowiedzi na pytania, potwierdzenie komendy („Przyjęłam/Okej/Jasne”) i **potwierdzenie dodania kosza**.
- Mikrofon ma regulowaną czułość (bardzo niska / niska / średnia / wysoka). Ignoruje wypowiedzi dłuższe niż 7 słów i hałas.
- Komendy: „wlano 0,7”, „0/3”, „zero trzy”, tak/nie przy pytaniu o kosz i inne.
- Głosy iPhone'a: domyślnie „Ewa — miękka” zamiast Zosi. Najlepiej brzmi głos Premium albo Ulepszony, pobrany w Ustawieniach iPhone'a → Dostępność → Treść mówiona → Głosy → Polski.

**Intro i dźwięk**
- Intro trwa 18 s z rockiem „beton_kibel_rock”. Gruszka, betonomieszarka z taśmą, pompa i gruszka BK+ zderzają się na środku w 8. sekundzie: wybuch, błysk, wstrząs i wibracja. Potem pojawia się logo „BK+ by DOMINO”.
- Muzyka gra tylko w intro. Przyciski robią kliknięcia.

**Dane**
- Historia budów z usuwaniem budów i wpisów.
- Eksport CSV, kopia danych do pliku (.json) i przywracanie z niego.
- Tryb testowy z czystą apką. Twoje dane czekają na powrót.

**Reset**
- Opcje → Dane, test i reset:
  - **🏭 Ustawienia fabryczne:** historia i kosze zostają.
  - **🗑 Wyczyść wszystko:** apka jak świeżo zainstalowana.
- W obu przypadkach zostaje klucz ElevenLabs.
- Po wgraniu wersji 3.5.8 apka **raz zapyta**, czy przywrócić ustawienia fabryczne.

**Wygląd**
- Styl HUD i kolory Hopper (cyjan), do tego 5 dodatkowych stylów.
- Ustawienia są podzielone na kategorie i na start wszystkie są zwinięte.

## Historia wersji (skrót)
- **3.2:** teksty bota w 4 wariantach, kamienie milowe 75% i 50%, więcej komend.
- **3.3–3.4:**
  - 5 stylów i kolory Hopper;
  - taczka i koparka;
  - kalkulator zdjęciowy;
  - Dasia (ElevenLabs);
  - tryb testowy;
  - ekran blokady;
  - słuchawka BT;
  - optymalizacja.
- **3.5.0–3.5.4:**
  - edytor zdjęć z zoomem;
  - jedno zdjęcie wystarczy;
  - spokojniejszy mikrofon;
  - naturalniejszy lektor;
  - muzyka tylko w intro.
- **3.5.5:** rock intro 18 s z mocnym bum, potwierdzanie dodania kosza, start na ekranie Start, Ewa zamiast Zosi.
- **3.5.6:** wybór głosu z biblioteki ElevenLabs w apce.
- **3.5.7:** ustawienia zwinięte na start i nazwa „Lektor ElevenLabs”.
- **3.5.8:** ustawienia fabryczne w Opcjach i jednorazowe pytanie o reset.

## Do sprawdzenia na telefonie
- Czy build Swift w Codemagic przechodzi bez błędów.
- Pobieranie głosu ElevenLabs i biblioteka głosów na iPhonie.
- Czułość mikrofonu w hałasie na budowie.
- Status na ekranie blokady i przyciski słuchawki BT.

## Zmiany 10.11.2026 (wersje 3.8.3 – 3.9.1)
- Komendy w tle: „ile koszy”, „pełny kosz”, „pół kosza”, „dodaj pół”.
- ElevenLabs także dla odpowiedzi z liczbami (pobierane na bieżąco).
- Kalkulator kosza: opcja 📏 Miarka (wysokość + opcjonalnie szerokość w cm).
- Poziom betonu tylko suwakiem; przytrzymanie 0,3 s; przelany kosz (np. 0,48 → do 0,5).
- Głośny lektor (bez tłumienia echa), wszystkie komunikaty mówione, suwak głośności, podkręcanie głośności telefonu.
- Alarm „Czy kosz już jest?”: „Jeszcze nie” działa, podwójne pytanie, 3 mignięcia z wibracją na blokadzie.
- Stabilność: strażnik mowy/mikrofonu, ponawianie startu mikrofonu, mikrofon wraca sam po restarcie apki, komendy w trakcie mowy lektora, praca w tle bez mikrofonu (cichy dźwięk trzymający apkę).
- Większe ikony.
- Do zrobienia: aktualizacje bez komputera (SideStore / aktualizacje w locie), gotowe modele koszy z kart producentów.

## 4.0.0 — nowe liczenie kosza (10.11 wieczór)
- Kosz = jedna liczba (tabliczka albo szybki pomiar: rodzaj + średnica + wysokość). Bez zdjęć i suwaka.
- Każdy kurs = pełny kosz (przytrzymaj / „dodaj” / słuchawka). Poprawka ostatniego kursu: ¼ ½ ¾ Pełny + Przelany (×1,1).
- Gruszki: „＋ Nowa gruszka” (m³), „✓ Gruszka pusta” → kursy wyrównane do m³ gruszki i apka uczy się realnej pojemności kosza (zapis w profilu).
- Głos: „pół”, „trzy czwarte”, „ćwierć”, „przelany”, „gruszka pusta”, „nowa gruszka 7,5”, „dodaj pół”.
- Taczka i koparka bez zmian.
