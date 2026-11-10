'use strict';
import { SHAPES, cleanDims, geoCapacity, volumeUpTo, bucketModel, migrateProfile } from './geometry.js';

const $ = id => document.getElementById(id), KEY = 'beton09', HKEY = 'beton09history';
const NATIVE = window.BKPnative || {};
const NV = NATIVE.voice || { available: false };
const nativeVoice = !!(NATIVE.isNative && NV.available);

// ───────────────────────── teksty lektora ─────────────────────────
const DEFAULT_TEXTS = {
  start: 'Zaczynamy betonowanie. Powodzenia!\nRuszamy z betonowaniem.\nBetonowanie rozpoczęte. Do dzieła!\nNo to zaczynamy. Udanej roboty!',
  depart: 'Kosz w drodze.\nKosz pojechał.\nPrzyjąłem, kosz w trasie.\nDobra, kosz jedzie.',
  ask: 'Czy kosz już wrócił?\nKosz jest już na miejscu?\nPrzyjechał już kosz?\nJest kosz?',
  arrived: 'Dobrze, lejemy dalej.\nŚwietnie, można lać.\nSuper, zalewamy.\nPrzyjąłem, lejemy.',
  late: 'W porządku, zapytam za kilka chwil.\nDobrze, poczekam.\nJasne, odezwę się za moment.\nRozumiem, zapytam ponownie.',
  remind: 'Kosz już jest?\nHalo, czy kosz wrócił?\nDaj znać, czy kosz jest.\nCzekam na informację o koszu.',
  added: 'Kosz zalany.\nZalane, policzone.\nDodane.\nMamy kolejny kosz.',
  undo: 'Cofnięte.\nOstatni kosz usunięty.\nGotowe, cofnąłem.\nUsunięte z licznika.',
  reportLeft: 'Zostało jeszcze X metra sześciennego.\nDo końca X metra sześciennego.\nPozostało X metra sześciennego.\nJeszcze X metra sześciennego do wylania.',
  reportPoured: 'Wylano już X metra sześciennego.\nNa razie X metra sześciennego.\nMamy wylane X metra sześciennego.\nDo tej pory X metra sześciennego.',
  reportBuckets: 'Zostało jeszcze X.\nDo końca X.\nPrzed nami X.\nJeszcze X.',
  reportTime: 'Betonowanie trwa X minut.\nPracujemy już X minut.\nOd startu minęło X minut.\nBetonujemy od X minut.',
  capacityChanged: 'Pojemność kosza ustawiona.\nKosz zmieniony.\nUstawione, nowy kosz.\nZapisałem pojemność kosza.',
  doseSet: 'Ilość do kosza ustawiona.\nZapisane, tyle lejemy.\nIlość zmieniona.\nGotowe, ustawione.',
  fullBucket: 'Pełny kosz.\nLejemy do pełna.\nCały kosz.\nUstawione na pełny.',
  halfBucket: 'Pół kosza.\nLejemy połowę.\nPołowa kosza.\nUstawione na pół.',
  error: 'Nie zrozumiałem, powtórz proszę.\nMożesz powtórzyć?\nNie dosłyszałem.\nSłucham? Powtórz jeszcze raz.',
  left75: 'Zostały trzy czwarte betonu.\nĆwiartka za nami, jedziemy dalej.\nPierwsza ćwiartka wylana.\nZostało jeszcze trzy czwarte.',
  left50: 'Połowa betonu wylana.\nJesteśmy w połowie.\nPół za nami, pół przed nami.\nZostało jeszcze pół betonu.',
  left3: 'Zostały jeszcze trzy metry sześcienne.\nJeszcze trzy kubiki.\nDo końca trzy metry.\nTrzy metry sześcienne do końca.',
  left15: 'Zostało półtora metra sześciennego.\nJeszcze półtora kubika.\nPółtora metra do końca.\nZostało półtora, dajemy radę.',
  left05: 'Zostało pół metra. Ostatni kosz.\nJeszcze pół kubika.\nOstatnie pół metra.\nKońcówka, zostało pół metra.',
  low: 'Uwaga, beton się kończy.\nBetonu zostało niewiele.\nZbliżamy się do końca.\nUwaga, końcówka betonu.',
  finish: 'Koniec betonowania. Dobra robota!\nGotowe, beton wylany.\nSkończone. Dziękuję za pracę!\nTo już wszystko. Brawo!',
  micOn: 'Mikrofon włączony.\nSłucham.\nJestem gotowy.\nMikrofon działa, słucham.',
  start_taczka: 'Zaczynamy, taczki w ruch!\nLejemy taczkami. Powodzenia!\nBetonowanie taczką rozpoczęte.\nNo to wozimy. Do roboty!',
  added_taczka: 'Taczka wylana.\nKolejna taczka.\nTaczka policzona.\nJest taczka, jedziemy dalej.',
  capacityChanged_taczka: 'Pojemność taczki ustawiona.\nTaczka zmieniona.\nUstawione, nowa taczka.\nZapisałem pojemność taczki.',
  finish_taczka: 'Koniec wożenia. Dobra robota!\nOstatnia taczka, beton wylany.\nSkończone. Odstaw taczkę!\nTo już wszystko. Brawo!',
  start_koparka: 'Zaczynamy z koparką. Powodzenia!\nKoparka gotowa, lejemy.\nBetonowanie koparką rozpoczęte.\nŁyżka w ruch, zaczynamy!',
  depart_koparka: 'Łyżka w drodze.\nKoparka jedzie z betonem.\nPrzyjąłem, łyżka w trasie.\nDobra, koparka jedzie.',
  ask_koparka: 'Czy koparka już wróciła?\nŁyżka jest już na miejscu?\nWróciła koparka?\nJest łyżka?',
  remind_koparka: 'Koparka już jest?\nHalo, czy łyżka wróciła?\nDaj znać, czy koparka jest.\nCzekam na informację o koparce.',
  arrived_koparka: 'Dobrze, lejemy z łyżki.\nŚwietnie, łyżka na miejscu.\nSuper, wysypujemy.\nPrzyjąłem, lejemy.',
  late_koparka: 'W porządku, zapytam o koparkę za chwilę.\nDobrze, czekamy na łyżkę.\nJasne, odezwę się za moment.\nRozumiem, koparka jeszcze jedzie.',
  added_koparka: 'Łyżka wylana.\nKolejna łyżka.\nŁyżka policzona.\nMamy kolejną łyżkę.',
  capacityChanged_koparka: 'Pojemność łyżki ustawiona.\nŁyżka zmieniona.\nUstawione, nowa łyżka.\nZapisałem pojemność łyżki.',
  finish_koparka: 'Koniec betonowania koparką. Dobra robota!\nGotowe, łyżka odstawiona.\nSkończone. Dziękuję operatorowi!\nTo już wszystko. Brawo!',
  heardOk: 'Przyjęłam.\nOkej.\nJasne.\nZrobione.',
};
const TEXT_GROUPS = [
  ['Rozmowa o kosz', [['start', 'Start betonowania'], ['depart', 'Kosz wyjechał'], ['ask', 'Pytanie: czy kosz wrócił?'], ['remind', 'Ponowne pytanie (co 30 s)'], ['arrived', 'Odpowiedź „tak, jest”'], ['late', 'Odpowiedź „jeszcze nie”']]],
  ['Komendy', [['heardOk', 'Potwierdzenie, że usłyszał komendę'], ['added', 'Kosz naliczony'], ['undo', 'Cofnięcie'], ['capacityChanged', 'Zmiana kosza'], ['doseSet', 'Ilość do kosza ustawiona'], ['fullBucket', 'Pełny kosz'], ['halfBucket', 'Pół kosza'], ['error', 'Nie zrozumiał']]],
  ['Odpowiedzi z liczbą (X = liczba)', [['reportLeft', 'Ile zostało'], ['reportBuckets', 'Ile koszy zostało'], ['reportPoured', 'Ile wylano'], ['reportTime', 'Czas betonowania']]],
  ['🛒 Taczka (zamiast tekstów kosza)', [['start_taczka', 'Start'], ['added_taczka', 'Taczka naliczona'], ['capacityChanged_taczka', 'Zmiana taczki'], ['finish_taczka', 'Koniec']]],
  ['🚜 Koparka — rozładunek „Inne”', [['start_koparka', 'Start'], ['depart_koparka', 'Łyżka wyjechała'], ['ask_koparka', 'Pytanie: czy wróciła?'], ['remind_koparka', 'Ponowne pytanie'], ['arrived_koparka', 'Odpowiedź „tak”'], ['late_koparka', 'Odpowiedź „jeszcze nie”'], ['added_koparka', 'Łyżka naliczona'], ['capacityChanged_koparka', 'Zmiana łyżki'], ['finish_koparka', 'Koniec']]],
  ['Bot mówi sam', [['left75', 'Zostało 75% betonu'], ['left50', 'Zostało 50% betonu'], ['left3', 'Zostały 3 m³'], ['left15', 'Zostało 1,5 m³'], ['left05', 'Zostało 0,5 m³'], ['low', 'Mało betonu'], ['finish', 'Koniec betonowania'], ['micOn', 'Mikrofon włączony']]],
];
const SHORT = { start: 'Start betonowania', depart: 'Kosz wyjechał', ask: 'Czy kosz wrócił?', arrived: 'Kosz jest', late: 'Kosza jeszcze nie ma', remind: 'Sprawdź powrót kosza', added: 'Naliczono kosz', undo: 'Cofnięto', low: 'Kończy się beton', finish: 'Koniec betonowania', error: 'Nie rozpoznano komendy', left75: 'Zostało 75% betonu', left50: 'Zostało 50% betonu', left3: 'Zostały 3 m³', left15: 'Zostało 1,5 m³', left05: 'Zostało 0,5 m³', capacityChanged: 'Kosz zmieniony', doseSet: 'Ilość ustawiona', fullBucket: 'Pełny kosz', halfBucket: 'Pół kosza', micOn: 'Mikrofon włączony' };
const TEXT_KEY = 'beton_texts_v2', SETTINGS_KEY = 'beton_settings_v2';
/** losowy wariant (każda linia = wariant), bez powtórzenia poprzedniego */
const lastPick = {};
function pickVariant(key, txt) {
  const lines = String(txt ?? TEXTS[key] ?? '').split('\n').map(x => x.trim()).filter(Boolean); if (!lines.length) return '';
  let i = Math.floor(Math.random() * lines.length); if (lines.length > 1 && i === lastPick[key]) i = (i + 1) % lines.length; lastPick[key] = i; return lines[i];
}
let TEXTS = { ...DEFAULT_TEXTS };
try { Object.assign(TEXTS, JSON.parse(localStorage.getItem(TEXT_KEY) || '{}')) } catch (e) { }
let settings = { mode: 'full', voice: '', rate: 0.47, tempo: 0.95, pitch: 1.02, lektor: 'ewa', alarm: true, confirm: true, theme: 'hopper', themeChosen: false, texture: 'none', layout: 'classic', tabsBottom: false, ui: 'hud', music: true, musicVol: 0.6, askOnly: true, micSens: 'low', bgm: true, clicks: true, introVoice: true, startForm: true, holdAdd: true, oneHand: false, lockStatus: true, headsetBtn: false, keepAwake: true, haptics: true, el: false, elKey: '', elVoice: 'qVCMNCiCMS3amhcNBMwc', elModel: 'eleven_multilingual_v2', elStab: 0.5, elSim: 0.75 };
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
function recolorDiagram() {
  const img = document.querySelector('.drum-diagram-img'); if (!img) return;
  if (!img.dataset.orig) img.dataset.orig = img.getAttribute('src');
  if (settings.theme === 'violet') { img.src = img.dataset.orig; return }
  const [c1, c2] = themeColors(), key = c1 + c2; if (diagramCache[key]) { img.src = diagramCache[key]; return }
  const src = new Image();
  src.onload = () => {
    try {
      const cv = document.createElement('canvas'); cv.width = src.naturalWidth; cv.height = src.naturalHeight; const g = cv.getContext('2d'); g.drawImage(src, 0, 0);
      const im = g.getImageData(0, 0, cv.width, cv.height), d = im.data;
      const O1 = rgb2hsl(...hexRgb('#8BD1E0')), O2 = rgb2hsl(...hexRgb('#9B4CD3')), N1 = rgb2hsl(...hexRgb(c1)), N2 = rgb2hsl(...hexRgb(c2));
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        const [h, sa, l] = rgb2hsl(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255); if (sa < .04) continue;
        const t = Math.min(1, Math.max(0, (((h - O1[0] + 540) % 360) - 180) / (O2[0] - O1[0])));
        const so = O1[1] + (O2[1] - O1[1]) * t, sn = N1[1] + (N2[1] - N1[1]) * t, lo = O1[2] + (O2[2] - O1[2]) * t, ln = N1[2] + (N2[2] - N1[2]) * t;
        const [r, gg, b] = hsl2rgb(hueLerp(N1[0], N2[0], t), Math.min(1, sa * sn / Math.max(.05, so)), Math.min(1, Math.max(0, l + (ln - lo) * .5 * Math.min(1, sa * 2))));
        d[i] = r * 255; d[i + 1] = gg * 255; d[i + 2] = b * 255;
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
  if (!nativeVoice) return;
  NV.configure({ loudVoice: settings.loudVoice !== false, boostVolume: settings.boostVolume !== false, targetVolume: Number(settings.voiceVol ?? 1), texts: TEXTS, elKey: elReady() ? settings.elKey : '', elVoice: settings.elVoice || '', elModel: settings.elModel || '', voiceId: resolvedVoiceId(), rate: Math.min(.6, Math.max(.44, (Number(settings.rate) || 0.5) * tempoK())), pitch: Math.min(1.06, Math.max(.94, Number(settings.pitch) || 1)), useClips: true, voiceOn: settings.mode === 'full', elOn: elReady(), elTag: elTag(), askOnly: settings.askOnly !== false, micGate: { vlow: -21, low: -27, mid: -35, high: -48 }[settings.micSens || 'low'] ?? -27, headsetButtons: !!settings.headsetBtn, lockStatus: settings.lockStatus !== false, keepAwake: settings.keepAwake !== false }).catch(() => { });
}

// ───────────────────────── mowa ─────────────────────────
const polishVoices = () => 'speechSynthesis' in window ? speechSynthesis.getVoices().filter(v => /^pl(?:-|$)/i.test(v.lang)) : [];
// ── Lektor ElevenLabs: teksty pobrane raz z internetu, potem grane bez netu ──
const tempoK = () => Math.min(1.15, Math.max(.8, Number(settings.tempo) || .95));
const elSpeed = () => Math.min(1.15, Math.max(.8, Math.round(tempoK() * 100) / 100));
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
  if (nativeVoice) { NV.speak(key || '', text || '').catch(() => { }); return }
  if (!text || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'pl-PL'; u.rate = Math.min(1.2, Math.max(.88, (Number(settings.rate) || .5) * 2 * tempoK())); u.pitch = Math.min(1.06, Math.max(.94, Number(settings.pitch) || 1));
    const pv = polishVoices(); const id = resolvedVoiceId(); const v = pv.find(v => v.voiceURI === id) || pv.find(v => /google/i.test(v.name)) || pv[0]; if (v) u.voice = v; speechSynthesis.speak(u);
  } catch (e) { }
}
function speak(key, text) {
  if (!elReady() || !text || (key && clipKeys.has(key))) return ttsSpeak(key, text);
  elGet(text).then(res => {
    if (!res) return ttsSpeak(key, text);
    if (nativeVoice) return ttsSpeak(key, text); // iPhone sam zagra zapisany plik
    try { elAudio?.pause(); elAudio = new Audio(URL.createObjectURL(res)); elAudio.play().catch(() => ttsSpeak(key, text)) } catch (e) { ttsSpeak(key, text) }
  }).catch(() => ttsSpeak(key, text));
}
const methodKey = key => { const m = session?.method || method, sfx = m === 'taczka' ? '_taczka' : m === 'inne' ? '_koparka' : ''; return sfx && String(TEXTS[key + sfx] || '').trim() ? key + sfx : key };
const ASK_KEYS = new Set(['ask', 'remind', 'ask_koparka', 'remind_koparka', 'heardOk', 'added', 'added_taczka', 'added_koparka']);
let lastBotAt = 0;
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
function playIntroVoice() {
  try { voiceEl?.pause(); voiceEl = new Audio('sounds/intro_voice.mp3'); voiceEl.volume = 1;
    voiceEl.onplay = () => bgmUpdate(); voiceEl.addEventListener('playing', () => { const late = window.__introT0 && introPlaying ? (Date.now() - window.__introT0) / 1000 : 0; window.__introStart?.(); if (late > .3) try { voiceEl.currentTime = late } catch (e) { } }, { once: true }); voiceEl.onended = () => { voiceEl = null; bgmUpdate() };
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
const fmt = n => (Math.round(Number(n) * 100) / 100).toLocaleString('pl-PL', { maximumFractionDigits: 2 });
const number = x => Number(String(x ?? '').replace(',', '.').trim());
const dur = n => { n = Math.max(0, Math.floor(Number(n) || 0)); return String(Math.floor(n / 3600)).padStart(2, '0') + ':' + String(Math.floor(n % 3600 / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0') };
const shortDur = n => { n = Math.max(0, Math.floor(Number(n) || 0)); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0') };
const escapeHTML = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const el = (tag, props = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== null && v !== undefined) e.setAttribute(k, v) } e.append(...kids); return e };

// ───────────────────────── kosze ─────────────────────────
let kibelN = 0;
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
const profilesFor = m => profiles.filter(p => kindOf(p) === methodKind(m) || (m === 'inne' && kindOf(p) === 'kosz'));
const opts = { kibel: [0.5, 1, 1.5, 2, 2.5, 3], taczka: [0.05, 0.06, 0.08, 0.1], inne: [0.5, 1, 1.5, 2, 2.5, 3] };

// ───────────────────────── stan ─────────────────────────
let session = null, archive = [], method = 'kibel', chosenProfileId = '';
let phase = 'ready', departed = 0, deadline = 0, alarmVisible = false, nextReminder = 0;
const REMIND_MS = 20000; // co ile przypominać „Czy kosz już jest?”
let alarmSince = 0;
/** mocne przypomnienie: dźwięk + wibracja + głos */
function alarmKick(key) { alarmSince = alarmSince || Date.now(); if (key === 'ask') setTimeout(() => { if (alarmVisible) { beep(); sayBot('remind') } }, 6000); if (settings.alarm !== false) { beep(); setTimeout(beep, 350) } buzz('warning'); setTimeout(() => buzz('warning'), 300); setTimeout(() => buzz('warning'), 600); try { navigator.vibrate?.([400, 150, 400, 150, 400]) } catch (e) { } sayBot(key) }
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
  NV.setState({ active: !!s, site: s?.site || '', method: s?.method || 'kibel', phase, deadline, departed, meanTripSec: meanTrip(), dose: Number(s?.dose || 0), capacity: Number(s?.capacity || s?.dose || 0.5), left: left(), poured: entriesSum(), load: Number(s?.load || 0), fired: Object.keys(s?.milestonesFired || {}) }).catch(() => { });
}
const storeHistory = () => { try { localStorage.setItem(HKEY, JSON.stringify(archive)) } catch (err) { announce('Nie udało się zapisać historii') } };
let modelCache = { key: '', model: null }, customOpen = false;
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
function tplSvg(shape, d) {
  let pts; // [y, półszerokość] od góry
  if (shape === 'cone') pts = [[0, d.dTop / 2], [d.h, d.dBottom / 2]];
  else if (shape === 'cylcone') pts = [[0, d.d / 2], [d.hCyl, d.d / 2], [d.hCyl + d.hCone, d.dOut / 2]];
  else if (shape === 'cylinder') pts = [[0, d.d / 2], [d.h, d.d / 2]];
  else pts = [[0, d.lTop / 2], [d.h, d.lBottom / 2]];
  const H = pts.at(-1)[0], W = Math.max(...pts.map(p => p[1])) * 2, k = 52 / Math.max(H, W), ox = 32, oy = 6 + (52 - H * k) / 2;
  const P = [...pts.map(([y, w]) => [ox - w * k, oy + y * k]), ...pts.slice().reverse().map(([y, w]) => [ox + w * k, oy + y * k])].map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 64 64'); svg.setAttribute('class', 'tpl-ico');
  svg.innerHTML = `<polygon points="${P}" fill="color-mix(in srgb,var(--c1) 35%,transparent)" stroke="var(--c1)" stroke-width="2.5" stroke-linejoin="round"/>`; return svg;
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
function chooseProfile(id, applyLive = true) { const p = getProfile(id); chosenProfileId = p ? p.id : ''; if (p && applyLive !== 'silent') { p.usedAt = Date.now(); try { saveProfiles() } catch (e) { } } if (p) $('portion').value = fmt(p.capacity); renderPresets(); if (p && applyLive && session && session.method !== 'taczka' && session.bucketProfile?.id !== p.id) changeCapacity(p.capacity, p) }
function renderPresets() {
  const r = $('presets'); r.replaceChildren();
  const useTiles = method !== 'taczka';
  $('presetsLabel').textContent = method === 'taczka' ? 'Taczka' : (method === 'inne' ? 'Osprzęt' : 'Kosz');
  $('setupBucketsLink').classList.add('hide');
  $('bucketPick').classList.toggle('hide', !useTiles); r.classList.toggle('hide', useTiles);
  if (!useTiles) { r.className = 'chips'; for (const p of profilesFor('taczka')) r.append(el('button', { type: 'button', class: 'pill' + (p.id === chosenProfileId ? ' on' : ''), text: '🛒 ' + p.name + ' · ' + fmt(p.capacity), onclick: () => chooseProfile(p.id) })); for (const v of opts.taczka) r.append(el('button', { type: 'button', class: 'pill' + (Math.abs(number($('portion').value) - v) < .0001 ? ' on' : ''), text: fmt(v) + ' m³', onclick: () => { chosenProfileId = ''; $('portion').value = fmt(v); renderPresets() } })); r.append(el('button', { type: 'button', class: 'pill', text: '＋ Zapisz taczkę', onclick: () => { bucketReturn = 'setup'; tab('buckets'); openBucketForm(null, 'taczka') } })); return }
  const p = getProfile(chosenProfileId), cap = number($('portion').value);
  const pic = p?.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '' }) : kibelIcon();
  $('bucketPick').replaceChildren(el('div', { class: 'tile-pic' }, pic), el('div', { class: 'bp-txt' }, el('strong', { text: p ? p.name : ({ taczka: 'Taczka ', inne: 'Łyżka ' }[method] || 'Kosz ') + (cap > 0 ? fmt(cap) + ' m³' : '') }), el('small', { text: p ? fmt(p.capacity) + ' m³ · ' + (p.dims ? '📐 dokładna podziałka' : 'zapisany') : 'standardowy · dotknij, żeby wybrać zapisany' })), el('span', { class: 'bp-change', text: 'Zmień ›' }));
}
function sheetRender() {
  const r = $('pickTiles'); r.replaceChildren();
  $('pickTitle').textContent = { taczka: 'Wybierz taczkę', inne: 'Wybierz łyżkę / osprzęt' }[method] || 'Wybierz kosz';
  const sw = $('pickMethods'); sw.replaceChildren(...[['kibel', '🏗 Kosz'], ['taczka', '🛒 Taczka'], ['inne', '🚜 Koparka / inne']].map(([m, t]) => el('button', { type: 'button', class: method === m ? 'on' : '', text: t, onclick: () => { if (method !== m) selectMethod(m); sheetRender() } })));
  const pick = fn => () => { fn(); tab('setup') };
  const mine = byRecent(profilesFor(method)), SHOW = 3;
  const visible = pickAll ? mine : mine.filter((p, i) => i < SHOW || p.id === chosenProfileId);
  for (const p of visible) {
    const pic = p.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '', loading: 'lazy' }) : kibelIcon();
    const x = el('span', { class: 'tile-del', role: 'button', 'aria-label': 'Usuń ' + p.name, text: '✕', onclick: e => { e.stopPropagation(); deleteProfile(p, sheetRender) } });
    r.append(el('button', { type: 'button', class: 'tile saved' + (p.id === chosenProfileId ? ' on' : ''), onclick: pick(() => chooseProfile(p.id)) },
      x, el('div', { class: 'tile-pic' }, pic), el('strong', { text: p.name }), el('b', { text: fmt(p.capacity) + ' m³' }), el('small', { text: p.dims ? '📐 dokładna podziałka' : 'zapisany' })));
  }
  if (mine.length > visible.length || (pickAll && mine.length > SHOW)) r.append(el('button', { type: 'button', class: 'tile more-saved', onclick: () => { pickAll = !pickAll; sheetRender() } }, el('b', { text: pickAll ? '▴ Zwiń moje' : '▾ Pokaż wszystkie moje (' + mine.length + ')' }), el('small', { text: pickAll ? 'pokaż tylko ostatnio używane' : 'ukryte: ' + (mine.length - visible.length) })));
  if (method !== 'taczka') r.append(el('button', { type: 'button', class: 'tile tpl-add', onclick: async () => { const p = await templatePick(); if (p) { chooseProfile(p.id); tab('setup') } } }, el('b', { text: '⚡ Gotowy model kosza' }), el('small', { text: 'kształt + tabliczka, bez zdjęć' })));
  r.append(el('button', { type: 'button', class: 'tile add', onclick: () => { bucketReturn = 'setup'; tab('buckets'); openBucketForm(null, methodKind(method)) } }, el('b', { text: '📷 ＋ ' + ({ taczka: 'Dodaj taczkę', inne: 'Dodaj łyżkę / osprzęt' }[method] || 'Zmierz nowy kosz') }), el('small', { text: 'ze zdjęć albo wymiarów — dokładna podziałka' })));
  for (const v of opts[method] || []) r.append(el('button', { type: 'button', class: 'tile size' + (!chosenProfileId && Math.abs(number($('portion').value) - v) < .0001 ? ' on' : ''), onclick: pick(() => { chosenProfileId = ''; $('portion').value = fmt(v); renderPresets() }) }, el('b', { text: fmt(v) }), el('small', { text: 'm³ · standard' })));
  const cur = number($('portion').value), isStd = (opts[method] || []).some(v => Math.abs(v - cur) < 1e-4);
  const ci = el('input', { inputmode: 'decimal', placeholder: 'np. 0,8', 'aria-label': 'Niestandardowa pojemność' }); if (!chosenProfileId && !isStd && cur > 0) ci.value = fmt(cur);
  const ok = () => { const v = number(ci.value); if (!(v > 0 && v <= 5)) return announce('Wpisz od 0,01 do 5 m³'); chosenProfileId = ''; $('portion').value = fmt(v); renderPresets(); tab('setup') };
  ci.addEventListener('keydown', e => { if (e.key === 'Enter') ok() });
  r.append(el('div', { class: 'tile custom' + (!chosenProfileId && !isStd && cur > 0 ? ' on' : '') }, el('span', { text: '✏️ Niestandardowy' }), ci, el('button', { type: 'button', class: 'primary', text: 'OK', onclick: ok })));
}
$('bucketPick').addEventListener('click', () => tab('pickBucket')); $('pickBack').addEventListener('click', () => tab('setup'));
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
  if (method !== 'taczka') rememberSiteBucket(session.site, p ? p.id : 'manual');
  remember(); refreshKnownSites(); tab('work'); introJinglePending = false; if (voiceEl) { voiceEl.pause(); voiceEl = null } if (false) { playSong('start').then(ok => { const w = ok ? SONG_LEN.start : playJingle('start'); if (w) setTimeout(() => sayBot('start'), Math.max(0, w - 300)); else sayBot('start') }) } else sayBot('start');
}
$('start').addEventListener('click', start);
$('slBuckets').addEventListener('click', () => { bucketReturn = 'setup'; tab('buckets') }); $('slHistory').addEventListener('click', () => tab('history')); $('slSettings').addEventListener('click', () => $('openSettings').click());
function finishCurrent(showNotice = true) {
  if (!session) return;
  archive.unshift({ ...session, endedAt: Date.now(), total: Math.round(entriesSum() * 100) / 100 }); storeHistory();
  session = null; resetTrip(); try { localStorage.removeItem(KEY) } catch (err) { }
  NATIVE.cancel?.(); syncNative(); if (showNotice) { if (false) playSong('finish').then(ok => { const w = ok ? SONG_LEN.finish : playJingle('finish'); if (w) setTimeout(() => sayBot('finish'), ok ? w : 1500); else sayBot('finish') }); else sayBot('finish') }
}
$('finish').addEventListener('click', async () => { if (!session) return; if (!(await ask('Zakończyć betonowanie i zapisać w historii?', '✓ Zakończ'))) return;
  const bp = session.method !== 'taczka' && session.bucketProfile?.id ? getProfile(session.bucketProfile.id) : null, sum = entriesSum(), load = Number(session.load) || 0;
  if (bp && load > 0 && session.entries.length >= 2 && sum > 0) { const r = load / sum; if (Math.abs(r - 1) > .03 && Math.abs(r - 1) < .4) {
    const nc = bp.capacity * r, v = await askChoice('⚖️ Licznik policzył ' + fmt(Math.round(sum * 100) / 100) + ' m³, a gruszka miała ' + fmt(load) + ' m³. Jeśli wylałeś CAŁĄ gruszkę, poprawię kosz „' + bp.name + '”: ' + fmt(bp.capacity) + ' → ' + fmt(Math.round(nc * 1000) / 1000) + ' m³, żeby następnym razem się zgadzało.', [['⚖️ Tak, popraw kosz', 'yes', 'primary', 'wylałem całą gruszkę'], ['Nie — zostało albo zabrakło betonu', 'no', '']]);
    if (v === 'yes') applyCalib(bp, nc, { poured: load, counted: sum, auto: true }) } }
  finishCurrent(); tab('history') });
$('new').addEventListener('click', async () => { if (session && !(await ask('Zakończyć aktualne betonowanie i zacząć nowe?', 'Tak, nowe'))) return; finishCurrent(false); tab('setup') });

// ───────────────────────── kurs kosza ─────────────────────────
function depart({ at = Date.now(), silent = false } = {}) {
  if (!session || session.method === 'taczka') return;
  if ((phase === 'away' || phase === 'late') && !silent) return announce('Kosz już jest w drodze');
  departed = at; deadline = at + meanTrip() * 1000; phase = 'away'; alarmVisible = false; nextReminder = 0;
  remember(); render(); NATIVE.schedule?.(deadline, SHORT.ask); if (!silent) sayBot('depart');
}
function returned({ at = Date.now(), silent = false } = {}) {
  if (!session || session.method === 'taczka') return;
  if (departed && (phase === 'away' || phase === 'late')) session.trips.push({ seconds: Math.max(1, Math.round((at - departed) / 1000)), at });
  departed = 0; deadline = 0; phase = 'returned'; alarmVisible = false; nextReminder = 0;
  remember(); render(); tick(); NATIVE.cancel?.(); if (!silent) { if (settings.alarm) beep(); sayBot('arrived') }
}
function delay({ at = Date.now(), silent = false } = {}) {
  if (!session || session.method === 'taczka') return;
  phase = 'late'; alarmVisible = false; alarmSince = 0; nextReminder = at + REMIND_MS; deadline = nextReminder;
  remember(); render(); NATIVE.schedule?.(nextReminder, SHORT.remind); if (!silent) sayBot('late');
}
window.addEventListener('bkp:notification-action', e => { const a = e.detail?.action; if (a === 'ARRIVED') returned(); else if (a === 'LATER') delay() });
$('depart').addEventListener('click', () => depart()); $('returned').addEventListener('click', () => returned()); $('arrived').addEventListener('click', () => returned()); $('late').addEventListener('click', () => delay());

function add(value, { at = Date.now(), silent = false } = {}) {
  if (!session) return announce('Najpierw rozpocznij betonowanie');
  const requested = Math.round(Number(value) * 100) / 100;
  if (!(requested > 0)) return announce('Ustaw więcej niż 0 m³');
  const before = left(); if (before <= 0) return announce('Cały beton już naliczony');
  const amount = Math.min(requested, Math.round(before * 100) / 100);
  if (!silent && at - lastAddAt < 380) return; lastAddAt = at;
  const prevState = { tripPhase: phase, departed, deadline, alarmVisible, nextReminder }, prevMilestones = { ...(session.milestonesFired || {}) };
  if (session.method !== 'taczka') {
    if (departed && (phase === 'away' || phase === 'late')) session.trips.push({ seconds: Math.max(1, Math.round((at - departed) / 1000)), at });
    if (amount >= before - 0.00001) { resetTrip(); NATIVE.cancel?.() }
    else { departed = at; deadline = at + meanTrip() * 1000; phase = 'away'; alarmVisible = false; nextReminder = 0; NATIVE.schedule?.(deadline, SHORT.ask) }
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
  sayBot('added');
  if (requested > amount + 1e-5) announce('Ostatnia porcja: ' + fmt(amount) + ' m³');
  const note = reached.length ? reached[reached.length - 1].key : (lowNow ? 'low' : null), jobId = session.id;
  if (note) setTimeout(() => { if (session?.id === jobId) sayBot(note) }, nativeVoice ? 0 : 1900);
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
const setOneHand = on => { settings.oneHand = on; saveSettings(); document.body.classList.toggle('one-hand', on); $('oneHandBtn').textContent = on ? '↩ Pełny widok' : '🖐 Duży kosz'; if ($('ohSetting')) $('ohSetting').checked = on; svgKey = ''; window.scrollTo(0, 0); if (session) render(); window.scrollTo({ top: 0 }) };
$('oneHandBtn').addEventListener('click', () => setOneHand(!settings.oneHand)); $('ohExit').addEventListener('click', () => setOneHand(false));
document.body.classList.toggle('one-hand', !!settings.oneHand); $('oneHandBtn').textContent = settings.oneHand ? '↩ Pełny widok' : '🖐 Duży kosz'; $('ohSetting').checked = !!settings.oneHand; $('ohSetting').addEventListener('change', () => setOneHand($('ohSetting').checked));
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
  session.capacity = n; session.dose = n; session.bucketProfile = snapshot(profile);
  if (session.method !== 'taczka') rememberSiteBucket(session.site, profile ? profile.id : 'manual');
  remember(); render(); announce((profile ? profile.name + ' · ' : 'Kosz ') + fmt(n) + ' m³'); sayBot('capacityChanged');
}
$('less').addEventListener('click', () => { if (session) changeDose(Math.max(0, Number(session.dose || 0) - bucketStep(session.capacity)), true) });
$('more').addEventListener('click', () => { if (session) changeDose(Math.min(doseMax(session.capacity), Number(session.dose || 0) + bucketStep(session.capacity)), true) });

function triggerAlarm(force = false) {
  if (!session || session.method === 'taczka') return; if (alarmVisible && !force) return;
  phase = 'late'; alarmVisible = true; nextReminder = Date.now() + REMIND_MS; deadline = nextReminder;
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
  return `<svg viewBox="0 0 360 ${SVG_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="185" cy="300" rx="140" ry="9" fill="#0008"/>
  <path d="M292 100 L352 6" stroke="#ffb703" stroke-width="30" stroke-linecap="round"/><path d="M292 100 L352 6" stroke="#0004" stroke-width="30" stroke-dasharray="2 22"/>
  <path d="M250 98 L318 30" stroke="#5b6672" stroke-width="12" stroke-linecap="round"/><path d="M262 86 L300 48" stroke="#cfd8e0" stroke-width="5" stroke-linecap="round"/>
  <path d="${b}" fill="#0b1426" fill-opacity=".88"/>
  ${fillLayer('kq', b, 100, 256, cap, current, model)}
  <path d="${b}" fill="none" stroke="var(--c1)" stroke-width="5" stroke-linejoin="round"/>
  <path d="M66 100 H298" stroke="color-mix(in srgb, var(--c1) 60%, #fff)" stroke-width="9" stroke-linecap="round"/>
  <g fill="#cfd8e0" stroke="#5b6672" stroke-width="2" stroke-linejoin="round"><path d="M74 214 L44 226 L72 232 Z"/><path d="M76 234 L48 250 L80 252 Z"/><path d="M92 254 L70 270 L104 256 Z"/></g>
  <circle cx="292" cy="100" r="13" fill="#2b3340" stroke="#9aa6b2" stroke-width="4"/><circle cx="250" cy="100" r="10" fill="#2b3340" stroke="#9aa6b2" stroke-width="4"/>
  ${valPill(180, 185, current, cap)}
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
function renderSlider(model) {
  const s = session, cap = Number(s.capacity || .5), dose = Number(s.dose || 0);
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
  let rect = null; const fromY = y => { if (!session) return; const r = rect || vs.querySelector('.vs-track').getBoundingClientRect(); const f = (r.bottom - y) / r.height; const model = currentModel(); const v = Math.max(0, Math.round(slVal(model, f, Number(session.capacity)) * 100) / 100); if (v === session.dose) return; session.dose = v; renderLevelSoon(); dirty = true };
  vs.addEventListener('pointerdown', e => { rect = vs.querySelector('.vs-track').getBoundingClientRect(); dragging = true; vs.classList.add('drag'); vs.setPointerCapture(e.pointerId); fromY(e.clientY); e.preventDefault() });
  vs.addEventListener('pointermove', e => { if (dragging) fromY(e.clientY) });
  const end = () => { dragging = false; rect = null; vs.classList.remove('drag'); if (dirty && session) { dirty = false; changeDose(session.dose, true) } }; vs.addEventListener('pointerup', end); vs.addEventListener('pointercancel', end);
  vs.addEventListener('keydown', e => { if (!session) return; const st = bucketStep(session.capacity); if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { changeDose(Math.min(doseMax(session.capacity), session.dose + st), true); e.preventDefault() } if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { changeDose(Math.max(0, session.dose - st), true); e.preventDefault() } });
})();

let renderQ = 0, levelQ = 0, svgKey = '';
/* lekki render tylko poziomu (suwak, rysunek kosza) — przy przeciąganiu nie przebudowuje całego ekranu */
function renderLevel(model) {
  const s = session; if (!s) return; model = model || currentModel();
  const key = [s.method, settings.ui, s.capacity, s.dose, s.bucketProfile?.id || s.bucketProfile?.name || ''].join('|');
  if (key !== svgKey) { svgKey = key; requestAnimationFrame(ohCrop); $('bucketSvgWrap').innerHTML = s.method === 'taczka' ? makeTaczkaSvg(s.capacity, s.dose ?? 0, model) : s.method === 'inne' ? makeKoparkaSvg(s.capacity, s.dose ?? 0, model) : ['hud', 'glass', 'tactical', 'terminal'].includes(settings.ui) ? makeBucketSvgHud(s.capacity, s.dose ?? 0, model) : makeBucketSvg(s.capacity, s.dose ?? 0, model); }
  $('dose').textContent = fmt(s.dose || 0);
  $('ohDose').textContent = fmt(s.dose || 0);
  $('levelHint').textContent = model.measured && s.dose > 0 ? (Math.round(model.belowRimCm(s.dose)) < 2 ? '· do krawędzi' : '· ok. ' + Math.round(model.belowRimCm(s.dose)) + ' cm pod krawędzią') : '';
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
  const model = currentModel();
  $('siteName').textContent = s.site; $('modeLabel').textContent = { kibel: 'KOSZ', taczka: 'TACZKA', inne: 'INNE' }[s.method]; document.querySelectorAll('[data-wm]').forEach(b => b.classList.toggle('on', b.dataset.wm === s.method));
  $('loaded').textContent = fmt(s.load); $('poured').textContent = fmt(entriesSum()); $('left').textContent = fmt(left());
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
  $('touchText').textContent = (settings.holdAdd ? (settings.tapLevel ? 'DOTKNIJ = POZIOM BETONU · ' : 'POZIOM = SUWAK Z BOKU · ') + 'PRZYTRZYMAJ = DODAJ ' + ({ taczka: 'TACZKĘ', inne: 'ŁYŻKĘ' }[s.method] || 'KOSZ') : '') || (s.method === 'taczka' ? 'DOTKNIJ TACZKI, ŻEBY DODAĆ · SUWAK = ILE WLANO' : s.method === 'inne' ? 'DOTKNIJ ŁYŻKI, ŻEBY DODAĆ · SUWAK = ILE WLANO' : 'DOTKNIJ KOSZA, ŻEBY DODAĆ · SUWAK = ILE WLANO');
  $('ohLeft').textContent = fmt(left()); $('ohPoured').textContent = fmt(entriesSum()) + ' z ' + fmt(s.load) + ' m³';
  $('ohTrip').classList.toggle('hide', s.method === 'taczka'); $('ohTrip').textContent = phase === 'away' || phase === 'late' ? '✓ Kosz jest' : '▶ Wyjechał'; $('ohTrip').classList.toggle('good', phase === 'away' || phase === 'late');
  $('bucket').setAttribute('aria-label', 'Dodaj ' + fmt(s.dose) + ' m³');
  const ab = $('activeBucket'); ab.replaceChildren();
  const cur = s.bucketProfile; ab.classList.toggle('hide', !cur);
  if (cur) ab.append(el('div', { class: 'ab-info' }, el('strong', { text: '📐 ' + cur.name + ' · ' + fmt(s.capacity) + ' m³' }), el('small', { text: model.measured ? 'dokładna podziałka z pomiaru / zdjęć' : 'zapisany kosz' })));
  const q = $('quick'); q.replaceChildren(); q.classList.remove('hide');
  for (const v of opts[s.method] || []) q.append(el('button', { type: 'button', class: 'pill' + (!cur && Math.abs(v - s.capacity) < 1e-4 ? ' on' : ''), text: fmt(v) + ' m³', onclick: () => { customOpen = false; changeCapacity(v, null) } }));
  const isCustom = !cur && !(opts[s.method] || []).some(v => Math.abs(v - s.capacity) < 1e-4);
  q.append(el('button', { type: 'button', class: 'pill' + (isCustom || customOpen ? ' on' : ''), text: isCustom ? '✏️ ' + fmt(s.capacity) + ' m³' : '✏️ Inna', onclick: () => { customOpen = !customOpen; render(); if (customOpen) setTimeout(() => $('customCap')?.focus(), 30) } }));
  if (customOpen) {
    const inp = el('input', { id: 'customCap', inputmode: 'decimal', placeholder: 'np. 0,8', style: 'margin:0' });
    const ok = () => { const v = number(inp.value); if (!(v > 0 && v <= 5)) return announce('Wpisz od 0,01 do 5 m³'); customOpen = false; changeCapacity(v, null) };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok() });
    q.append(el('div', { class: 'row custom-row' }, inp, el('button', { type: 'button', class: 'primary', text: 'Ustaw', onclick: ok })));
  }
  $('status').textContent = s.method === 'taczka' ? 'Taczka' : phase === 'away' ? 'Kosz w drodze' : phase === 'late' ? 'Kosz się spóźnia' : phase === 'returned' ? 'Kosz wrócił — ustaw ile wlano i dotknij kosza' : 'Gotowy';
  $('entries').innerHTML = s.entries.length ? s.entries.slice().reverse().map(e => '<div class="history-entry"><span>' + new Date(e.at).toLocaleTimeString('pl-PL') + '</span><strong>+' + fmt(e.amount) + ' m³</strong></div>').join('') : '<div class="help">Brak dolewek</div>';
}
function tick() {
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
  if (document.hidden && nativeVoice) return; // w tle pytaniami zajmuje się moduł natywny
  if (s.method !== 'taczka' && phase === 'away' && deadline && now >= deadline) triggerAlarm();
  else if (s.method !== 'taczka' && phase === 'late' && now >= nextReminder) { alarmVisible = true; nextReminder = now + REMIND_MS; deadline = nextReminder; remember(); render(); alarmKick('remind') }
}

// ───────────────────────── komendy głosowe ─────────────────────────
const COMMANDS = [['„Dodaj kosz” · „Zalane” · „Kolejny”', 'nalicza kosz'], ['„Wlano 0,7” · „Dodaj 0,3”', 'nalicza podaną ilość'], ['„Cofnij” · „Pomyłka”', 'cofa ostatni'], ['„Kosz wyjechał” · „Jazda”', 'start kursu'], ['„Tak” · „Jest” · „Mamy”', 'kosz wrócił'], ['„Nie ma” · „Jeszcze jedzie”', 'pytanie za 30 s'], ['„Ile zostało?” · „Ile jeszcze?”', 'pozostałe m³'], ['„Ile wylano?” · „Licznik”', 'naliczone m³'], ['„Ile czasu?”', 'czas betonowania'], ['„Kosz 0,75”', 'zmienia pojemność'], ['„Lej 0,35”', 'ile wlać do kosza'], ['„Pełny kosz” / „Pół kosza”', 'szybka ilość']];
$('cmdList').append(...COMMANDS.flatMap(([a, b]) => [el('span', { text: a }), el('small', { text: b })]));
function normalise(t) { return t.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d)\s*[,./\\]\s*(\d)/g, '$1.$2').replace(/\b0 (\d{1,2})\b/g, '0.$1').replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim() }
function spokenNumber(t) {
  const m = t.match(/\b(\d+(?:\.\d{1,2})?)\b/); if (m) return Number(m[1]);
  if (/\b(jeden i pol|poltora)\b/.test(t)) return 1.5; if (/\b(trzy czwarte)\b/.test(t)) return .75; if (/\b(pol|polowa|poloweczka)\b/.test(t)) return .5; if (/\b(cwierc)\b/.test(t)) return .25;
  const dict = { zero: 0, jeden: 1, jedna: 1, jedno: 1, dwa: 2, dwie: 2, trzy: 3, cztery: 4, piec: 5, szesc: 6, siedem: 7, osiem: 8, dziewiec: 9 };
  const tokens = t.split(/\s+/).filter(x => Object.prototype.hasOwnProperty.call(dict, x) || x === 'przecinek'); const c = tokens.indexOf('przecinek');
  if (c >= 0) { const head = tokens.slice(0, c).map(x => dict[x]).join('') || '0', tail = tokens.slice(c + 1).map(x => dict[x]).join(''); if (tail) return Number(head + '.' + tail) }
  if (tokens.length >= 2 && tokens[0] === 'zero') return Number('0.' + tokens.slice(1).map(x => dict[x]).join(''));
  if (tokens.length === 1) return dict[tokens[0]]; return NaN;
}
let reportAt = 0;
function report(key, value) { reportAt = Date.now(); const text = (pickVariant(key) || 'X').replace(/X/g, String(value)); announce(text); $('botText').textContent = text; if (settings.mode === 'full') speak(key + '_n', text) }
/* rozpoznany tekst → komenda; szum i pojedyncze słowa ignorujemy po cichu, „nie zrozumiałem” najwyżej co 20 s */
let lastErrAt = 0;
function heardText(t) {
  const n = normalise(t); if (n.length < 2) return;
  if (n.split(' ').length > 7) { const tail = t.trim().split(/\s+/).slice(-6).join(' '); if (command(tail) !== true) { micDisplay('Pominięto rozmowę: „' + t + '”'); return } micDisplay('✓ „' + tail + '”'); buzz('success'); if (settings.askOnly !== false) sayBot('heardOk'); return } // długa wypowiedź: komenda zwykle na końcu
  const r = command(t);
  if (r === true) { micDisplay('✓ „' + t + '”'); buzz('success'); if (settings.askOnly !== false && Date.now() - reportAt > 300 && Date.now() - lastBotAt > 400) sayBot('heardOk'); return }
  micDisplay(r === 'ignore' ? 'Pominięto (nie ma pytania o kosz): „' + t + '”' : 'Nie rozpoznano: „' + t + '”');
}
function command(utterance) {
  const t = normalise(utterance); if (!t) return false;
  const has = list => new RegExp('\\b(' + list + ')\\b').test(t);
  const waiting = phase === 'away' || phase === 'late';
  if (has('nie ma|jeszcze nie|nie wrocil|nie przyjechal|nie dojechal|nie jest|jeszcze go nie ma|jeszcze jedzie|w drodze|nie widac|nie') && !/\bile\b/.test(t)) { if (waiting) { delay(); return true } return 'ignore' }
  if (has('ile zostalo|ile betonu zostalo|stan betonu|ile jeszcze|ile do konca|ile brakuje|ile pozostalo|ile mamy jeszcze|ile kubikow zostalo|ile metrow zostalo|jaki stan|ile w gruszce')) { report('reportLeft', fmt(left())); return true }
  if (has('ile koszy|ile kursow|ile jeszcze koszy|ile koszy zostalo|ile kibli|ile taczek|ile lyzek|ile razy jeszcze')) { report('reportBuckets', bucketPlanText(bucketPlan(), true)); return true }
  if (has('ile wylano|ile juz wylano|ile nalano|ile poszlo|ile wylalismy|ile zalalismy|ile zalane|ile kubikow poszlo|ile metrow wylano|ile mamy wylane|ile zrobione|licznik')) { report('reportPoured', fmt(entriesSum())); return true }
  if (has('ile czasu|czas betonowania|jak dlugo|ile trwa|ile minut|ile to juz trwa|od kiedy betonujemy|jak dlugo juz|ile pracujemy|ktora minuta')) { report('reportTime', Math.round((Date.now() - (session?.startedAt || Date.now())) / 60000)); return true }
  if (!has('dodaj|zalany|zalane') && has('ustaw kosz|zmien kosz|kosz|kibel|pojemnosc kosza|pojemnosc|kosz ma|nowy kosz|kosz na|ustaw kibel|zmien kibel')) { const n = spokenNumber(t); if (n > 0 && n <= 5) { changeCapacity(n, null); return true } }
  if (has('lej|leje|wlewam|wlej|zmien ilosc|ustaw ilosc|ilosc|lejemy|zalewam|do kosza|wlewamy|ustaw porcje|porcja')) { const n = spokenNumber(t); if (n >= 0 && n <= 5 && !isNaN(n)) { changeDose(n, true); sayBot('doseSet'); return true } }
  if (has('pelny kosz|pelny kibel|do pelna|caly kosz|caly kibel|pelen kosz|do pelnego|na full|full|calosc|pelny')) { if (session) { changeDose(session.capacity, true); sayBot('fullBucket') } return true }
  if (has('pol kosza|pol kibla|polowa kosza|pol taczki|pol kibelka|pol kubla|do polowy|polowe kosza|lej pol|pol lyzki')) { if (session) { changeDose(session.capacity / 2, true); sayBot('halfBucket') } return true }
  if (has('cofnij ostatni|skasuj ostatni|usun ostatni|cofnij|anuluj|usun|wycofaj|odejmij|minus jeden|pomylka|blad|skasuj')) { undo(); return true }
  if (has('koparka wyjechala|koparka pojechala|koparka jedzie z betonem|lyzka pojechala|lyzka jedzie|kosz wyjechal|kibel wyjechal|kosz ruszyl|kosz pojechal|kibel pojechal|wyjechal|ruszyl|pojechal|odjechal|jazda z koszem')) { depart(); return true }
  if (has('dodac|dodam|dodaje|dodajcie|do daj|dodaj kosza|dodaj kibla|dodaj taczke|dodaj lyzke|taczka wylana|lyzka wylana|kolejna taczka|kolejna lyzka|taczka|wlano|wlalem|wlalismy|nalalem|nalalismy|wlane|wlali|dodaj kibel|dodaj kosz|kosz zalany|kibel zalany|plus jeden|dodaj|nalicz|dolej|zalicz|zalany|zalane|poszlo|kolejny')) {
    const n = spokenNumber(t.replace(/\b(plus jeden|dodaj kibel|dodaj kosz|kosz zalany|kibel zalany)\b/g, ' ')); add(n > 0 && n <= 5 ? n : (session?.dose > 0 ? session.dose : session?.capacity)); return true }
  if (has('koparka jest|koparka wrocila|lyzka jest|lyzka wrocila|tak|juz jest|kosz jest|kibel jest|juz wrocil|wrocil|przyjechal|przybyl|dojechal|no jest|jest|gotowe')) { if (waiting) { returned(); return true } return 'ignore' }
  return false;
}
function micDisplay(t) { setTimeout(bgmUpdate, 0); $('micStatus').textContent = t; $('mic').textContent = micWanted ? '⏹ Wyłącz mikrofon' : '🎙️ Włącz mikrofon'; $('mic').classList.toggle('live', micWanted); const om = $('ohMic'); if (om) { om.textContent = micWanted ? '🟢 Słucham' : '🎙 Mikrofon'; om.classList.toggle('live', micWanted) } if ($('ohMicStatus')) $('ohMicStatus').textContent = t; if (settings.oneHand && /❌|Brak|Nie mogę/.test(t)) announce(t) }
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
async function stopMic() { micWanted = false; micLive = false; clearTimeout(voiceRetry); if (nativeVoice) await NV.stop().catch(() => { }); else try { recognition?.abort() } catch (e) { } micDisplay('Mikrofon wyłączony.') }
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
    try { const r = await NV.start(); micWanted = true; micLive = true; micDisplay('🟢 Słucham — także przy zablokowanym ekranie.' + (r && r.onDevice === false ? ' (rozpoznawanie przez internet)' : '')); sayBot('micOn') }
    catch (e) { micWanted = false; micDisplay('❌ ' + (e.message || e)) }
    return;
  }
  if (!SpeechRec) return micDisplay('❌ Ta przeglądarka nie rozpoznaje mowy. Użyj przycisków.');
  micWanted = true; micDisplay('Prośba o dostęp do mikrofonu…'); bootWebRecognition();
}
$('mic').addEventListener('click', toggleMic);
NV.onHeard?.(t => heardText(t));
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
      else if (e.type === 'depart') depart({ at: e.at, silent: true });
      else if (e.type === 'undo') undo({ silent: true });
      else if (e.type === 'dose') { session.dose = Math.min(doseMax(session.capacity), Number(e.amount) || session.dose) }
      else if (e.type === 'alarm') { phase = 'late'; alarmVisible = true; nextReminder = e.at + REMIND_MS; deadline = nextReminder }
    }
    remember(); render(); tick();
    announce('Z zablokowanego ekranu: ' + evs.length + ' zdarzeń');
  } else syncNative();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (micWanted && !nativeVoice) { stopMic(); micDisplay('Mikrofon zatrzymany — wróć do aplikacji i włącz ponownie.') } return }
  drainNative().then(() => { tick(); homeRender() });
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
  $('bReal').value = p?.real ? fmt(p.real) : '';
  $('bError').textContent = ''; dimFields($('bShape').value, p?.dims || {}); thumbsRender();
  $('bucketForm').classList.remove('hide'); $('newBucket').classList.add('hide'); $('bName').focus();
}
function closeBucketForm() { $('bucketForm').classList.add('hide'); $('newBucket').classList.remove('hide'); editingId = '' }
$('newBucket').addEventListener('click', () => openBucketForm()); $('bCancel').addEventListener('click', closeBucketForm);
$('bSave').addEventListener('click', () => {
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
  if (!profiles.length) { box.append(el('p', { class: 'hint', text: 'Nie masz jeszcze zapisanych koszy. Zmierz kosz — policzę dokładną pojemność i podziałkę.' })); return }
  if (profiles.length > 5) { const q = el('input', { type: 'search', class: 'bucket-search', placeholder: '🔍 Szukaj (nazwa albo m³)', value: bucketQuery }); q.addEventListener('input', () => { bucketQuery = q.value; const pos = q.selectionStart; bucketListRender(); const n = $('bucketList').querySelector('.bucket-search'); n.focus(); try { n.setSelectionRange(pos, pos) } catch (e) { } }); box.append(q) }
  const ql = bucketQuery.trim().toLowerCase(), match = p => !ql || (p.name || '').toLowerCase().includes(ql) || fmt(p.capacity).includes(ql.replace('.', ','));
  for (const [kind, [ico, label]] of Object.entries(KINDS)) {
    const list = byRecent(profiles.filter(p => kindOf(p) === kind && match(p))); if (!list.length) continue;
    const open = ql ? true : bucketOpen[kind] ?? (profiles.length <= 6);
    const det = el('details', { class: 'bucket-group' }); det.open = open; det.addEventListener('toggle', () => { bucketOpen[kind] = det.open });
    det.append(el('summary', {}, el('span', { text: ico + ' ' + ({ kosz: 'Kosze', taczka: 'Taczki', lyzka: 'Łyżki / osprzęt' }[kind] || label) }), el('b', { text: String(list.length) })));
    for (const p of list) {
      const img = p.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '', class: 'bucket-thumb', loading: 'lazy' }) : (() => { const d = el('div', { class: 'bucket-thumb ph' }); d.append(kibelIcon()); return d })();
      const info = el('div', { class: 'bucket-info' }, el('strong', { text: p.name }), el('small', { text: fmt(p.capacity) + ' m³' + (p.plate && Math.abs(p.plate - p.capacity) > .005 ? ' (tabliczka ' + fmt(p.plate) + ')' : '') + ' · ' + (SHAPES[p.shape]?.label || 'tabliczka') + (p.calib ? ' · ⚖️ skalibrowany' : p.template ? ' · gotowy model' : p.estimated ? ' · ze zdjęć' : p.dims ? ' · zmierzony' : '') }));
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
const NOMINALS = [.5, .7, .75, 1, 1.25, 1.5, 2];
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
$('notifyMode').value = settings.mode; $('ttsRate').value = String(settings.rate); $('alarmOn').checked = settings.alarm; $('musicOn').checked = !!settings.music; $('headsetBtn').checked = !!settings.headsetBtn; $('holdAdd').checked = settings.holdAdd !== false; $('lockStatus').checked = settings.lockStatus !== false; $('keepAwake').checked = settings.keepAwake !== false; $('hapticsOn').checked = settings.haptics !== false; $('musicVol').value = String(settings.musicVol ?? .6); $('confirmOn').checked = settings.confirm;
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
const elAllLines = () => [...new Set(Object.keys(TEXTS).flatMap(k => String(TEXTS[k] || '').split('\n').map(x => x.trim()).filter(x => x && !/\bX\b/.test(x))))];
const elSave = e => { const hadKey = !!settings.elKey; settings.el = $('elOn').checked; settings.elKey = $('elKey').value.trim(); if (e?.target?.id === 'elKey' && settings.elKey && !hadKey) { settings.el = true; $('elOn').checked = true } settings.elVoice = $('elVoice').value.trim(); settings.elModel = $('elModel').value; saveSettings(); configureNative(); elUI() };
for (const id of ['elOn', 'elKey', 'elVoice', 'elModel']) $(id).addEventListener('change', elSave);
$('elTest').addEventListener('click', async () => { elSave(); if (!elReady()) return announce('Włącz lektora i wpisz klucz oraz ID głosu'); $('elState').textContent = 'Sprawdzam…'; try { const t = 'Cześć Domi, tu ' + ((settings.elVoiceName || 'Dasia').split(/[\s\-–—]/)[0]) + '. Zaczynamy betonowanie!'; await elGet(t); speak('', t); elUI() } catch (e) { $('elState').textContent = '❌ ' + e.message + ' — sprawdź klucz API, ID głosu i internet.' } });
let elBusy = false;
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
for (const [id, k] of [['tapLevel', 'tapLevel'], ['holdAdd', 'holdAdd'], ['lockStatus', 'lockStatus'], ['headsetBtn', 'headsetBtn'], ['keepAwake', 'keepAwake'], ['hapticsOn', 'haptics']]) $(id).addEventListener('change', () => { settings[k] = $(id).checked; saveSettings(); configureNative(); if (session) render() });
const buzz = kind => { if (settings.haptics === false) return; if (nativeVoice) NV.haptic?.(kind).catch?.(() => { }); else try { navigator.vibrate?.(kind === 'warning' ? [60, 40, 60] : 40) } catch (e) { } };
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
      el('div', { class: 'he-r' }, el('b', { text: fmt(s.total ?? (s.entries || []).reduce((a, e) => a + Number(e.amount || 0), 0)) + ' m³' }),
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
  let done = false; const close = () => { if (done) return; done = true; introPlaying = false; if (TAB_OF[currentTab] === 'work') stopIntroVoice(); bgmUpdate(); setTimeout(bgmUpdate, 600); introMorph(box) };
  box.addEventListener('click', () => { if (Date.now() - soundUnlockedAt < 700) return; stopIntroVoice(); close() });
  /* animacja startuje razem z muzyką, żeby zderzenie i „Witaj” wpadły w rytm */
  box.classList.add('wait'); let started = false;
  const start = () => { if (started || done) return; started = true; window.__introT0 = Date.now(); box.classList.remove('wait'); setTimeout(close, 17000); setTimeout(() => { if (!done) { playBoom(); buzz('warning'); setTimeout(() => buzz('warning'), 180); box.classList.add('boom-hit') } }, 2950) };
  window.__introStart = start; setTimeout(start, 2500);
  introPlaying = true;
  const webIntro = () => { playIntroVoice(); if (voiceEl) voiceEl.addEventListener('ended', () => setTimeout(close, 300)) };
  if (settings.music && settings.introVoice !== false) {
    if (NATIVE.isNative && NV.playIntro) NV.playIntro({ volume: Math.min(1, .3 + Number(settings.musicVol ?? .7)) }).then(r => { if (r?.ok) { nativeIntro = true; start(); setTimeout(close, (r.duration || 16) * 1000 + 300) } else webIntro() }).catch(webIntro); // iPhone: gra od razu z apki
    else webIntro();
  } else start();
  if (!settings.themeChosen) { settings.themeChosen = true; saveSettings() }
  try { if (!window.BKP_TEST && !localStorage.getItem('bkp_factory_v358')) (function waitIntro() { if ($('intro')) return setTimeout(waitIntro, 500); if (document.querySelector('.ask-back')) return setTimeout(waitIntro, 1500); localStorage.setItem('bkp_factory_v358', '1'); askChoice('Nowa wersja. Przywrócić aplikację do ustawień fabrycznych?', [['🏭 Tylko ustawienia', 'set', 'primary', 'historia budów i kosze zostają'], ['🗑 Wszystko od zera', 'all', 'warn', 'apka jak świeżo zainstalowana'], ['Nie, zostaw jak jest', 'no', '']], v => { if (v === 'set') factoryReset(false); else if (v === 'all') factoryReset(true) }) })() } catch (e) { }
}
