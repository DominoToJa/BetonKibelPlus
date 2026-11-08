'use strict';
import { SHAPES, cleanDims, geoCapacity, volumeUpTo, bucketModel, migrateProfile } from './geometry.js';

const $ = id => document.getElementById(id), KEY = 'beton09', HKEY = 'beton09history';
const NATIVE = window.BKPnative || {};
const NV = NATIVE.voice || { available: false };
const nativeVoice = !!(NATIVE.isNative && NV.available);

// ───────────────────────── teksty lektora ─────────────────────────
const DEFAULT_TEXTS = {
  start: 'No i chuj zaś na tego pomarańczowego chuja',
  depart: 'Poszli w pizdu, waszmość!',
  ask: 'czy powrócił ten stożkowaty fiut?',
  arrived: 'I zaś trza lać kurwa mać',
  late: 'Pośpisz sie kurwysynie !',
  remind: 'Mości panie, czy nie przybywszy ta kurwa?',
  added: 'jee zaliczona szmata , waszmość!',
  undo: 'Cofnięto, jako waść rozkazał!',
  low: 'Hhaha Chuju już prawie koniec!',
  finish: 'Yupji auuuuuuuuuuuutomatycznie spierdalamy od tego chujostwa',
  error: 'Nie dosłyszałem, mości panie!',
  left3: 'Jeszcze 3 Kubiki tego gówna',
  left15: 'połóweczka połóweczk haha',
  left05: 'jeszcze bombka i wyjazd',
  capacityChanged: 'Kosz ustawiony, waszmość!',
  fullBucket: 'Pełen kibel, jazda, ogień!',
  halfBucket: 'Pół kibelka, panie!',
  micOn: 'Mikrofon włączony!',
  reportLeftPrefix: 'Zostało',
  reportPouredPrefix: 'Wylano',
  reportTimePrefix: 'Betonowanie trwa',
};
const TEXT_GROUPS = [
  ['Betonowanie', [['start', 'Start betonowania'], ['added', 'Naliczono porcję'], ['undo', 'Cofnięcie'], ['low', 'Mało betonu'], ['left3', 'Zostały 3 m³'], ['left15', 'Zostało 1,5 m³'], ['left05', 'Zostało 0,5 m³'], ['finish', 'Koniec betonowania']]],
  ['Kurs kosza', [['depart', 'Kosz wyjechał'], ['ask', 'Pytanie: czy kosz wrócił?'], ['remind', 'Ponowne pytanie (co 30 s)'], ['arrived', 'Odpowiedź „tak, jest”'], ['late', 'Odpowiedź „jeszcze nie”']]],
  ['Inne', [['capacityChanged', 'Zmiana kosza'], ['fullBucket', 'Pełny kosz'], ['halfBucket', 'Pół kosza'], ['micOn', 'Mikrofon włączony'], ['error', 'Nie zrozumiał komendy']]],
  ['Odpowiedzi z liczbami (początek zdania)', [['reportLeftPrefix', '„… X m³” — ile zostało'], ['reportPouredPrefix', '„… X m³” — ile wylano'], ['reportTimePrefix', '„… X minut” — czas']]],
];
const SHORT = { start: 'Start betonowania', depart: 'Kosz wyjechał', ask: 'Czy kosz wrócił?', arrived: 'Kosz jest', late: 'Kosza jeszcze nie ma', remind: 'Sprawdź powrót kosza', added: 'Naliczono porcję', undo: 'Cofnięto porcję', low: 'Kończy się beton', finish: 'Koniec betonowania', error: 'Nie rozpoznano komendy', left3: 'Zostały 3 m³', left15: 'Zostało 1,5 m³', left05: 'Zostało 0,5 m³', capacityChanged: 'Kosz zmieniony', fullBucket: 'Pełny kosz', halfBucket: 'Pół kosza', micOn: 'Mikrofon włączony' };
const TEXT_KEY = 'beton_texts_v1', SETTINGS_KEY = 'beton_settings_v2';
let TEXTS = { ...DEFAULT_TEXTS };
try { Object.assign(TEXTS, JSON.parse(localStorage.getItem(TEXT_KEY) || '{}')) } catch (e) { }
let settings = { mode: 'full', voice: '', rate: 0.47, pitch: 1.02, lektor: 'zosia', alarm: true, confirm: true };
const F = [/zosia/i, /zofia/i, /google/i, /paulina/i, /ewa/i, /agnieszka/i, /maja/i];
const M = [/krzysztof/i, /marek/i, /jacek/i, /adam/i, /jan/i];
// [id, nazwa, opis, płeć, preferowane głosy, tempo, wysokość]
const LEKTORS = [
  ['zosia', 'Zosia — spokojna', 'Ciepły, równy głos. Najprzyjemniejszy na co dzień.', 'f', [/zosia/i, /zofia/i, /google/i, ...F], .47, 1.02],
  ['zosia_pogodna', 'Zosia — pogodna', 'Trochę jaśniej i żywiej, nie męczy.', 'f', [/zosia/i, /zofia/i, /google/i, ...F], .52, 1.12],
  ['google', 'Google — naturalna', 'Głos Google polski w zwykłym tempie.', 'f', [/google/i, /zofia/i, /zosia/i, ...F], .5, 1],
  ['google_szybka', 'Google — szybka i konkretna', 'Krótko i na temat, gdy leje się szybko.', 'f', [/google/i, /zofia/i, /zosia/i, ...F], .58, 1.02],
  ['asystentka', 'Asystentka — miękka', 'Wolniej i łagodnie, dobra przy hałasie w tle.', 'f', [/zofia/i, /zosia/i, /paulina/i, /google/i, ...F], .44, 1.16],
  ['krzysztof', 'Krzysztof — spokojny', 'Męski, spokojny i wyraźny.', 'm', [/krzysztof/i, /marek/i, ...M], .47, .98],
  ['krzysztof_radio', 'Krzysztof — radiowy', 'Jak prezenter: płynnie i czytelnie.', 'm', [/krzysztof/i, /marek/i, ...M], .52, .92],
  ['majster', 'Majster — niski', 'Niższy męski głos, bez pośpiechu.', 'm', [/marek/i, /krzysztof/i, ...M], .45, .84],
  ['dyspozytor', 'Dyspozytor — wyraźny', 'Szybciej i dobitnie, dobry na komendy.', 'm', [/krzysztof/i, /marek/i, ...M], .55, 1],
  ['lektor', 'Lektor filmowy', 'Niski, wolny, z powagą.', 'm', [/marek/i, /krzysztof/i, ...M], .43, .78],
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
const saveSettings = () => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch (e) { } configureNative() };
const saveTexts = () => { try { localStorage.setItem(TEXT_KEY, JSON.stringify(TEXTS)) } catch (e) { } configureNative() };
let clipKeys = new Set(), recordingKey = '';

function configureNative() {
  if (!nativeVoice) return;
  NV.configure({ texts: TEXTS, voiceId: resolvedVoiceId(), rate: Number(settings.rate) || 0.5, pitch: Number(settings.pitch) || 1, useClips: true, voiceOn: settings.mode === 'full' }).catch(() => { });
}

// ───────────────────────── mowa ─────────────────────────
const polishVoices = () => 'speechSynthesis' in window ? speechSynthesis.getVoices().filter(v => /^pl(?:-|$)/i.test(v.lang)) : [];
function speak(key, text) {
  if (nativeVoice) { NV.speak(key || '', text || '').catch(() => { }); return }
  if (!text || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'pl-PL'; u.rate = (Number(settings.rate) || .5) * 2; u.pitch = Number(settings.pitch) || 1;
    const pv = polishVoices(); const id = resolvedVoiceId(); const v = pv.find(v => v.voiceURI === id) || pv.find(v => /google/i.test(v.name)) || pv[0]; if (v) u.voice = v; speechSynthesis.speak(u);
  } catch (e) { }
}
function sayBot(key, text) {
  const full = text ?? TEXTS[key] ?? '', short = SHORT[key] || full;
  const shown = settings.mode === 'full' ? (full || short) : short;
  if (shown) $('botText').textContent = shown;
  if (settings.mode === 'full') { if (full || clipKeys.has(key)) speak(key, full) }
  else beep();
}
function beep() { try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const ctx = new AC(); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = 700; g.gain.setValueAtTime(.06, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .22); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + .22); setTimeout(() => ctx.close(), 700) } catch (err) { } }
function announce(txt) { const t = $('toast'); t.textContent = txt; t.style.display = 'block'; clearTimeout(announce.timeout); announce.timeout = setTimeout(() => t.style.display = 'none', 2300) }

// ───────────────────────── pomocnicze ─────────────────────────
const fmt = n => (Math.round(Number(n) * 100) / 100).toLocaleString('pl-PL', { maximumFractionDigits: 2 });
const number = x => Number(String(x ?? '').replace(',', '.').trim());
const dur = n => { n = Math.max(0, Math.floor(Number(n) || 0)); return String(Math.floor(n / 3600)).padStart(2, '0') + ':' + String(Math.floor(n % 3600 / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0') };
const shortDur = n => { n = Math.max(0, Math.floor(Number(n) || 0)); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0') };
const escapeHTML = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const el = (tag, props = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v) } e.append(...kids); return e };

// ───────────────────────── kosze ─────────────────────────
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
const opts = { kibel: [0.5, 1, 1.5, 2, 2.5, 3], taczka: [0.05, 0.06, 0.08, 0.1], inne: [0.5, 1, 1.5, 2, 2.5, 3] };

// ───────────────────────── stan ─────────────────────────
let session = null, archive = [], method = 'kibel', chosenProfileId = '';
let phase = 'ready', departed = 0, deadline = 0, alarmVisible = false, nextReminder = 0;
let micWanted = false, micLive = false, recognition = null, voiceRetry = null, lastAddAt = 0;
const entriesSum = () => session ? session.entries.reduce((s, x) => s + Number(x.amount || 0), 0) : 0;
const left = () => session ? Math.max(0, Math.round((session.load - entriesSum()) * 100) / 100) : 0;
function meanTrip() { const arr = (session?.trips || []).filter(x => Number(x.seconds) > 0); if (!arr.length) return session?.cycle || 120; return arr.slice(-5).reduce((s, v) => s + Number(v.seconds), 0) / Math.min(arr.length, 5) }
function resetTrip() { phase = 'ready'; departed = 0; deadline = 0; alarmVisible = false; nextReminder = 0 }
function remember() {
  if (session) { Object.assign(session, { tripPhase: phase, departed, deadline, alarmVisible, nextReminder }); try { localStorage.setItem(KEY, JSON.stringify(session)) } catch (err) { announce('Nie udało się zapisać') } }
  syncNative();
}
function syncNative() {
  if (!nativeVoice) return;
  const s = session;
  NV.setState({ active: !!s, method: s?.method || 'kibel', phase, deadline, departed, meanTripSec: meanTrip(), dose: Number(s?.dose || 0), left: left(), poured: entriesSum(), load: Number(s?.load || 0), fired: Object.keys(s?.milestonesFired || {}) }).catch(() => { });
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
const TAB_OF = { home: 'home', setup: 'home', buckets: 'home', settings: '', work: 'work', history: 'history', drum: 'drum' };
let currentTab = 'home', bucketReturn = '';
function tab(name) {
  currentTab = name;
  document.querySelectorAll('main section').forEach(s => s.classList.toggle('hide', s.id !== name));
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === TAB_OF[name]));
  if (name === 'work') { if (!session) { tab('home'); announce('Najpierw rozpocznij betonowanie'); return } render(); tick() }
  if (name === 'history') historyRender();
  if (name === 'home') homeRender();
  if (name === 'buckets') bucketListRender();
  if (name === 'settings') settingsRender();
  if (name === 'setup') { renderPresets(); refreshKnownSites() }
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => tab(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { if (b.dataset.go === 'buckets') bucketReturn = currentTab; tab(b.dataset.go) }));
$('openSettings').addEventListener('click', () => tab('settings'));
$('homeNew').addEventListener('click', () => tab('setup'));
$('homeContinue').addEventListener('click', () => tab('work'));
function homeRender() {
  $('homeContinue').classList.toggle('hide', !session);
  if (session) $('homeContinueInfo').textContent = session.site + ' · zostało ' + fmt(left()) + ' m³';
  const h = new Date().getHours();
  $('homeHello').textContent = session ? 'Betonowanie w toku' : (h < 10 ? 'Dzień dobry, Domi' : h < 18 ? 'Gotowy do lania?' : 'Dobry wieczór, Domi');
}

// ───────────────────────── nowe betonowanie ─────────────────────────
function refreshKnownSites() { const list = $('knownSites'); list.replaceChildren(); const sites = new Set([...Object.keys(siteAssignments), ...archive.map(s => s.site || '').filter(Boolean)]); for (const s of sites) list.append(el('option', { value: s })) }
function chooseProfile(id, applyLive = true) { const p = getProfile(id); chosenProfileId = p ? p.id : ''; if (p) $('portion').value = fmt(p.capacity); renderPresets(); if (p && applyLive && session && session.method !== 'taczka' && session.bucketProfile?.id !== p.id) changeCapacity(p.capacity, p) }
function renderPresets() {
  const r = $('presets'); r.replaceChildren();
  const useProfiles = method !== 'taczka';
  $('presetsLabel').textContent = method === 'taczka' ? 'Taczka' : (method === 'inne' ? 'Osprzęt' : 'Wybierz kosz');
  $('setupBucketsLink').classList.add('hide');
  r.className = useProfiles ? 'tiles' : 'chips';
  if (!useProfiles) { for (const v of opts.taczka) r.append(el('button', { type: 'button', class: 'pill' + (Math.abs(number($('portion').value) - v) < .0001 ? ' on' : ''), text: fmt(v) + ' m³', onclick: () => { $('portion').value = fmt(v); renderPresets() } })); return }
  for (const p of profiles) {
    const pic = p.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '' }) : el('span', { class: 'tile-ico', text: '🪣' });
    r.append(el('button', { type: 'button', class: 'tile saved' + (p.id === chosenProfileId ? ' on' : ''), onclick: () => chooseProfile(p.id) },
      el('div', { class: 'tile-pic' }, pic), el('strong', { text: p.name }), el('b', { text: fmt(p.capacity) + ' m³' }), el('small', { text: p.dims ? '📐 dokładna podziałka' : 'zapisany' })));
  }
  r.append(el('button', { type: 'button', class: 'tile add', onclick: () => { bucketReturn = 'setup'; tab('buckets'); openBucketForm() } }, el('b', { text: '📷 ＋ Zmierz nowy kosz' }), el('small', { text: 'ze zdjęć albo wymiarów — dokładna podziałka' })));
  for (const v of opts[method] || []) r.append(el('button', { type: 'button', class: 'tile size' + (!chosenProfileId && Math.abs(number($('portion').value) - v) < .0001 ? ' on' : ''), onclick: () => { chosenProfileId = ''; $('portion').value = fmt(v); renderPresets() } }, el('b', { text: fmt(v) }), el('small', { text: 'm³ · standard' })));
}
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
$('portion').addEventListener('input', () => { const p = getProfile(chosenProfileId); if (p && Math.abs(number($('portion').value) - p.capacity) > .0001) chosenProfileId = ''; renderPresets() });
$('site').addEventListener('change', restoreSiteBucket); $('site').addEventListener('blur', restoreSiteBucket);

function start() {
  const p = method !== 'taczka' ? getProfile(chosenProfileId) : null;
  const load = number($('load').value), dose = p ? p.capacity : number($('portion').value), cycleMin = method === 'taczka' ? 2 : number($('cycleMin').value);
  $('error').textContent = '';
  if (!(load > 0 && load <= 30)) return $('error').textContent = 'Podaj ile załadowano, np. 7,5 m³.';
  if (!(dose > 0 && dose <= 5)) return $('error').textContent = 'Ustaw pojemność kosza.';
  if (!(cycleMin >= 0.05 && cycleMin <= 120)) return $('error').textContent = 'Ustaw czas kursu, np. 2,5 minuty.';
  if (session && !confirm('Zakończyć poprzednie betonowanie i zacząć nowe?')) return;
  if (session) finishCurrent(false);
  resetTrip(); lastAddAt = 0;
  session = { id: Date.now(), site: $('site').value.trim() || 'Budowa bez nazwy', load, method, dose, capacity: dose, bucketProfile: snapshot(p), cycle: Math.round(cycleMin * 60), startedAt: Date.now(), entries: [], trips: [], milestonesFired: {} };
  if (method !== 'taczka') rememberSiteBucket(session.site, p ? p.id : 'manual');
  remember(); refreshKnownSites(); tab('work'); sayBot('start');
}
$('start').addEventListener('click', start);
function finishCurrent(showNotice = true) {
  if (!session) return;
  archive.unshift({ ...session, endedAt: Date.now(), total: Math.round(entriesSum() * 100) / 100 }); storeHistory();
  session = null; resetTrip(); try { localStorage.removeItem(KEY) } catch (err) { }
  NATIVE.cancel?.(); syncNative(); if (showNotice) sayBot('finish');
}
$('finish').addEventListener('click', () => { if (!session) return; if (!confirm('Zakończyć betonowanie i zapisać w historii?')) return; finishCurrent(); tab('history') });
$('new').addEventListener('click', () => { if (session && !confirm('Zakończyć aktualne betonowanie i zacząć nowe?')) return; finishCurrent(false); tab('setup') });

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
  phase = 'late'; alarmVisible = true; nextReminder = at + 30000; deadline = nextReminder;
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
  const reached = [{ t: 3, key: 'left3' }, { t: 1.5, key: 'left15' }, { t: .5, key: 'left05' }].filter(m => before > m.t + 1e-5 && remaining > 0 && remaining <= m.t + 1e-5 && !session.milestonesFired[m.key]);
  for (const m of reached) session.milestonesFired[m.key] = true;
  let lowNow = false;
  if (!reached.length && remaining > 0 && remaining <= Math.max(.5, session.load * .15) && !session.milestonesFired.low) { session.milestonesFired.low = true; lowNow = true }
  remember(); render(); tick();
  if (silent) return;
  if (settings.confirm) beep();
  sayBot('added');
  if (requested > amount + 1e-5) announce('Ostatnia porcja: ' + fmt(amount) + ' m³');
  const note = reached.length ? reached[reached.length - 1].key : (lowNow ? 'low' : null), jobId = session.id;
  if (note) setTimeout(() => { if (session?.id === jobId) sayBot(note) }, nativeVoice ? 0 : 1900);
}
$('bucket').addEventListener('click', () => add(session?.dose));
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
  const step = cap <= .12 ? .02 : cap <= .3 ? .05 : cap <= .65 ? .1 : cap <= 1.3 ? .2 : cap <= 2.6 ? .5 : 1;
  const out = []; for (let v = step; v < cap - step * .6; v += step) out.push(Math.round(v * 100) / 100);
  out.push(Math.round(cap * 100) / 100); return out;
};
function changeDose(v, quiet = false) {
  if (!session) return; const n = Math.round(Number(v) * 100) / 100; const cap = Number(session.capacity || .5);
  if (!Number.isFinite(n) || n < 0 || n > 5) return announce('Podaj ilość od 0 do 5 m³');
  session.dose = Math.max(0, Math.min(n, cap)); remember(); render(); if (!quiet) announce('Ustawiono ' + fmt(session.dose) + ' m³');
}
function changeCapacity(v, profile = null) {
  if (!session) return; const n = Math.round(Number(v) * 100) / 100; if (!(n > 0 && n <= 5)) return;
  session.capacity = n; session.dose = n; session.bucketProfile = snapshot(profile);
  if (session.method !== 'taczka') rememberSiteBucket(session.site, profile ? profile.id : 'manual');
  remember(); render(); announce((profile ? profile.name + ' · ' : 'Kosz ') + fmt(n) + ' m³'); sayBot('capacityChanged');
}
$('less').addEventListener('click', () => { if (session) changeDose(Math.max(0, Number(session.dose || 0) - bucketStep(session.capacity)), true) });
$('more').addEventListener('click', () => { if (session) changeDose(Math.min(session.capacity, Number(session.dose || 0) + bucketStep(session.capacity)), true) });

function triggerAlarm(force = false) {
  if (!session || session.method === 'taczka') return; if (alarmVisible && !force) return;
  phase = 'late'; alarmVisible = true; nextReminder = Date.now() + 30000; deadline = nextReminder;
  remember(); render(); if (settings.alarm) beep(); sayBot('ask');
}
$('testAlarm').addEventListener('click', () => { if (!session) return announce('Najpierw rozpocznij betonowanie'); triggerAlarm(true) });

// ───────────────────────── rysunek kosza + suwak z boku ─────────────────────────
const SVG_TOP = 86, SVG_BOTTOM = 229, SVG_H = 300;
function makeBucketSvg(cap, current, model) {
  cap = Math.max(0.01, Number(cap) || .5); current = Math.min(cap, Math.max(0, Number(current) || 0));
  const lT = 92, lB = 126, rT = 238, rB = 204;
  const yAt = v => SVG_BOTTOM - (SVG_BOTTOM - SVG_TOP) * model.fraction(v);
  const xAt = (y, leftSide) => { const t = (y - SVG_TOP) / (SVG_BOTTOM - SVG_TOP); const a = leftSide ? lT : rT, b = leftSide ? lB : rB; return a + (b - a) * t };
  const fy = yAt(current), xL = xAt(fy, true), xR = xAt(fy, false);
  let ticks = '';
  const marks = bucketMarks(cap), ys = marks.map(yAt);
  marks.forEach((v, i) => {
    const tooClose = i < marks.length - 1 && Math.abs(ys[i] - ys[marks.length - 1]) < 27;
    const y = yAt(v), xl = xAt(y, true), xr = xAt(y, false), last = i === marks.length - 1;
    const label = last ? 'MAX ' + fmt(v) : fmt(v), w = label.length * 11 + 14;
    ticks += `<line x1="${(xl + 2).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(xr - 2).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#ff3b4e" stroke-width="2" stroke-dasharray="6 5" opacity=".75"/>`;
    ticks += `<line x1="${(xr - 22).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(xr + 6).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#ff3b4e" stroke-width="6" stroke-linecap="round"/>`;
    if (tooClose) return;
    ticks += `<g transform="translate(${(xr + 12).toFixed(1)} ${y.toFixed(1)})"><rect x="0" y="-13" width="${w}" height="26" rx="8" fill="#ff3b4e" stroke="#14112e" stroke-width="2"/><text x="${(w / 2).toFixed(1)}" y="6" text-anchor="middle" font-size="17" font-weight="950" fill="#ffffff">${label}</text></g>`;
  });
  return `<svg viewBox="0 0 360 ${SVG_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="bkSteel" x1="0" x2="1"><stop stop-color="#5b3a9e"/><stop offset=".28" stop-color="#9B4CD3"/><stop offset=".62" stop-color="#8BD1E0"/><stop offset="1" stop-color="#5b3a9e"/></linearGradient><linearGradient id="bkRim" x1="0" x2="1"><stop stop-color="#1c2128"/><stop offset=".48" stop-color="#6f7683"/><stop offset="1" stop-color="#1f252d"/></linearGradient><clipPath id="bkClip"><path d="M92 86L238 86L204 229L126 229Z"/></clipPath></defs><path d="M95 82L124 21M235 82L206 21" stroke="#5d6570" stroke-width="12" stroke-linecap="round"/><path d="M119 22Q165 -4 211 22" fill="none" stroke="#9098a3" stroke-width="12"/><path d="M47 79Q165 60 283 79L259 218Q255 236 227 244L196 274H134L103 244Q75 236 71 218Z" fill="url(#bkSteel)" stroke="#22262b" stroke-width="7"/><path d="M42 81Q165 55 288 81" stroke="url(#bkRim)" stroke-width="19" fill="none"/><path d="M121 242L134 275H196L209 242" fill="#5d6570" stroke="#282a31" stroke-width="5"/><path d="M92 86L238 86L204 229L126 229Z" fill="#0f0c26" opacity=".35"/><g clip-path="url(#bkClip)"><path d="M${xL.toFixed(1)} ${fy.toFixed(1)}L${xR.toFixed(1)} ${fy.toFixed(1)}L204 229L126 229Z" fill="#9aa3b3" opacity=".95"/><path d="M${xL.toFixed(1)} ${(fy - 1).toFixed(1)}L${xR.toFixed(1)} ${(fy - 1).toFixed(1)}" stroke="#ffffff" stroke-width="5"/></g>${ticks}<text x="165" y="172" text-anchor="middle" font-size="42" font-weight="950" fill="#14112e">${fmt(current)}</text><text x="165" y="199" text-anchor="middle" font-size="20" font-weight="900" fill="#14112e">z ${fmt(cap)} m³</text></svg>`;
}
function renderSlider(model) {
  const s = session, cap = Number(s.capacity || .5), dose = Number(s.dose || 0);
  const pct = v => (model.fraction(v) * 100).toFixed(2) + '%';
  $('vsFill').style.height = pct(dose);
  $('vsThumb').style.bottom = pct(dose);
  $('vsValue').textContent = fmt(dose);
  const ticks = $('vsTicks'); ticks.replaceChildren();
  for (const v of bucketMarks(cap)) { const t = el('span', { class: 'vs-tick' + (Math.abs(v - dose) < 1e-4 ? ' on' : ''), text: fmt(v) }); t.style.bottom = pct(v); ticks.append(t) }
  const vs = $('vslider'); vs.setAttribute('aria-valuemax', String(cap)); vs.setAttribute('aria-valuenow', String(dose)); vs.setAttribute('aria-valuetext', fmt(dose) + ' m³');
}
(function sliderInput() {
  const vs = $('vslider'); let dragging = false;
  const fromY = y => { if (!session) return; const r = vs.querySelector('.vs-track').getBoundingClientRect(); const f = (r.bottom - y) / r.height; const model = currentModel(); const step = bucketStep(session.capacity); const v = Math.round(model.volumeAtFraction(f) / step) * step; changeDose(Math.min(session.capacity, Math.max(0, v)), true) };
  vs.addEventListener('pointerdown', e => { dragging = true; vs.setPointerCapture(e.pointerId); fromY(e.clientY); e.preventDefault() });
  vs.addEventListener('pointermove', e => { if (dragging) fromY(e.clientY) });
  const end = () => { dragging = false }; vs.addEventListener('pointerup', end); vs.addEventListener('pointercancel', end);
  vs.addEventListener('keydown', e => { if (!session) return; const st = bucketStep(session.capacity); if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { changeDose(Math.min(session.capacity, session.dose + st), true); e.preventDefault() } if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { changeDose(Math.max(0, session.dose - st), true); e.preventDefault() } });
})();

function render() {
  if (!session) return; const s = session; if (!s.capacity) s.capacity = s.dose || .5;
  const model = currentModel();
  $('siteName').textContent = s.site; $('modeLabel').textContent = { kibel: 'KIBEL', taczka: 'TACZKA', inne: 'INNE' }[s.method];
  $('loaded').textContent = fmt(s.load); $('poured').textContent = fmt(entriesSum()); $('left').textContent = fmt(left());
  $('progress').style.width = Math.min(100, 100 * entriesSum() / s.load) + '%';
  $('dose').textContent = fmt(s.dose || 0); $('bucketCap').textContent = fmt(s.capacity);
  $('levelHint').textContent = model.measured && s.dose > 0 ? (Math.round(model.belowRimCm(s.dose)) < 2 ? '· do krawędzi' : '· ok. ' + Math.round(model.belowRimCm(s.dose)) + ' cm pod krawędzią') : '';
  $('less').textContent = '− ' + fmt(bucketStep(s.capacity)); $('more').textContent = '+ ' + fmt(bucketStep(s.capacity));
  $('bucketSvgWrap').innerHTML = makeBucketSvg(s.capacity, s.dose ?? 0, model); renderSlider(model);
  $('travelPanel').classList.toggle('hide', s.method === 'taczka'); $('alert').classList.toggle('hide', !alarmVisible);
  $('touchText').textContent = s.method === 'taczka' ? 'DOTKNIJ, ŻEBY DODAĆ TACZKĘ' : 'DOTKNIJ KIBLA, ŻEBY DODAĆ · SUWAK = ILE WLANO';
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
  $('status').textContent = s.method === 'taczka' ? 'Taczka' : phase === 'away' ? 'Kosz w drodze' : phase === 'late' ? 'Kosz się spóźnia' : phase === 'returned' ? 'Kosz wrócił — ustaw ile wlano i dotknij kibla' : 'Gotowy';
  $('entries').innerHTML = s.entries.length ? s.entries.slice().reverse().map(e => '<div class="history-entry"><span>' + new Date(e.at).toLocaleTimeString('pl-PL') + '</span><strong>+' + fmt(e.amount) + ' m³</strong></div>').join('') : '<div class="help">Brak dolewek</div>';
}
function tick() {
  if (!session) return; const s = session, now = Date.now(), avg = meanTrip();
  $('elapsed').textContent = dur((now - s.startedAt) / 1000);
  $('avg').textContent = s.method === 'taczka' ? '—' : s.trips?.length ? shortDur(avg) : '—';
  $('timer').textContent = s.method === 'taczka' ? '—' : (phase === 'away' || phase === 'late') ? shortDur((deadline - now) / 1000) : '—';
  const rem = left(), count = rem > 0 ? Math.ceil(rem / Math.max(.01, s.dose || s.capacity || .5)) : 0;
  const secs = count === 0 ? 0 : (phase === 'away' && deadline > now ? (deadline - now) / 1000 : avg) + (count - 1) * avg;
  $('eta').textContent = rem === 0 ? 'Zrobione' : new Date(now + secs * 1000).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  if (document.hidden && nativeVoice) return; // w tle pytaniami zajmuje się moduł natywny
  if (s.method !== 'taczka' && phase === 'away' && deadline && now >= deadline) triggerAlarm();
  else if (s.method !== 'taczka' && phase === 'late' && alarmVisible && now >= nextReminder) { nextReminder = now + 30000; deadline = nextReminder; remember(); if (settings.alarm) beep(); sayBot('remind') }
}

// ───────────────────────── komendy głosowe ─────────────────────────
const COMMANDS = [['„Dodaj kibel”', 'nalicza porcję'], ['„Cofnij”', 'cofa ostatnią'], ['„Kosz wyjechał”', 'start kursu'], ['„Tak, jest”', 'kosz wrócił'], ['„Jeszcze nie”', 'pytanie za 30 s'], ['„Ile zostało?”', 'pozostałe m³'], ['„Ile wylano?”', 'naliczone m³'], ['„Ile czasu?”', 'czas betonowania'], ['„Kosz 0,75”', 'zmienia pojemność'], ['„Ustaw porcję 0,35”', 'ile wlano'], ['„Pełny kosz” / „Pół kosza”', 'szybka porcja']];
$('cmdList').append(...COMMANDS.flatMap(([a, b]) => [el('span', { text: a }), el('small', { text: b })]));
function normalise(t) { return t.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d)[,.](\d)/g, '$1.$2').replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim() }
function spokenNumber(t) {
  const m = t.match(/\b(\d+(?:\.\d{1,2})?)\b/); if (m) return Number(m[1]);
  if (/\b(jeden i pol|poltora)\b/.test(t)) return 1.5; if (/\b(trzy czwarte)\b/.test(t)) return .75; if (/\b(pol|polowa|poloweczka)\b/.test(t)) return .5; if (/\b(cwierc)\b/.test(t)) return .25;
  const dict = { zero: 0, jeden: 1, jedna: 1, jedno: 1, dwa: 2, dwie: 2, trzy: 3, cztery: 4, piec: 5, szesc: 6, siedem: 7, osiem: 8, dziewiec: 9 };
  const tokens = t.split(/\s+/).filter(x => Object.prototype.hasOwnProperty.call(dict, x) || x === 'przecinek'); const c = tokens.indexOf('przecinek');
  if (c >= 0) { const head = tokens.slice(0, c).map(x => dict[x]).join('') || '0', tail = tokens.slice(c + 1).map(x => dict[x]).join(''); if (tail) return Number(head + '.' + tail) }
  if (tokens.length >= 2 && tokens[0] === 'zero') return Number('0.' + tokens.slice(1).map(x => dict[x]).join(''));
  if (tokens.length === 1) return dict[tokens[0]]; return NaN;
}
function report(prefixKey, value, unit) { const text = (TEXTS[prefixKey] || '') + ' ' + value + ' ' + unit; announce(text); $('botText').textContent = text; if (settings.mode === 'full') speak('', text) }
function command(utterance) {
  const t = normalise(utterance); if (!t) return false;
  if (/\b(nie ma|jeszcze nie|nie wrocil|nie przyjechal|nie jest)\b/.test(t)) { delay(); return true }
  if (/\b(ile zostalo|ile betonu zostalo|stan betonu)\b/.test(t)) { report('reportLeftPrefix', fmt(left()), 'metra sześciennego'); return true }
  if (/\b(ile wylano|ile juz wylano|ile nalano)\b/.test(t)) { report('reportPouredPrefix', fmt(entriesSum()), 'metra sześciennego'); return true }
  if (/\b(ile czasu|czas betonowania|jak dlugo)\b/.test(t)) { report('reportTimePrefix', Math.round((Date.now() - (session?.startedAt || Date.now())) / 60000), 'minut'); return true }
  if (/\b(pelny kosz|pelny kibel|do pelna)\b/.test(t)) { if (session) { changeDose(session.capacity, true); sayBot('fullBucket') } return true }
  if (/\b(pol kosza|pol kibla|polowa kosza|polowa kibla|pol taczki)\b/.test(t)) { if (session) { changeDose(session.capacity / 2, true); sayBot('halfBucket') } return true }
  if (/\b(ustaw kosz|zmien kosz|kosz [0-9]|kibel [0-9]|pojemnosc)\b/.test(t)) { const n = spokenNumber(t); if (n > 0 && n <= 5) { changeCapacity(n, null); return true } return false }
  if (/\b(ustaw porcje|zmien porcje|leje|wlewam|ustaw ile|porcja [0-9])\b/.test(t)) { const n = spokenNumber(t); if (n >= 0) { changeDose(n); return true } return false }
  if (/\b(tak|juz jest|kosz jest|kibel jest|wrocil|przyjechal)\b/.test(t)) { returned(); return true }
  if (/\b(cofnij|anuluj|usun ostatni)\b/.test(t)) { undo(); return true }
  if (/\b(wyjechal|ruszyl|pojechal)\b/.test(t)) { depart(); return true }
  if (/\b(dodaj|nalicz|dolej|zalicz)\b/.test(t)) { add(session?.dose); return true }
  return false;
}
function micDisplay(t) { $('micStatus').textContent = t; $('mic').textContent = micWanted ? '⏹ Wyłącz mikrofon' : '🎙️ Włącz mikrofon'; $('mic').classList.toggle('live', micWanted) }
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
async function stopMic() { micWanted = false; micLive = false; clearTimeout(voiceRetry); if (nativeVoice) await NV.stop().catch(() => { }); else try { recognition?.abort() } catch (e) { } micDisplay('Mikrofon wyłączony.') }
function bootWebRecognition() {
  if (!micWanted || document.hidden) return;
  try {
    recognition = new SpeechRec(); recognition.lang = 'pl-PL'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => { micLive = true; micDisplay('🟢 Słucham…') };
    recognition.onresult = e => { const t = e.results[e.resultIndex][0].transcript; micDisplay('Usłyszano: „' + t + '”'); if (!command(t)) sayBot('error') };
    recognition.onerror = e => { micLive = false; if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { stopMic(); micDisplay('❌ Brak zgody na mikrofon.') } };
    recognition.onend = () => { micLive = false; if (micWanted && !document.hidden) { clearTimeout(voiceRetry); voiceRetry = setTimeout(bootWebRecognition, 900) } };
    recognition.start();
  } catch (e) { micDisplay('Nie mogę uruchomić mikrofonu: ' + (e.message || e)); stopMic() }
}
$('mic').addEventListener('click', async () => {
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
});
NV.onHeard?.(t => { micDisplay('Usłyszano: „' + t + '”'); if (!command(t)) sayBot('error') });
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
      else if (e.type === 'alarm') { phase = 'late'; alarmVisible = true; nextReminder = e.at + 30000; deadline = nextReminder }
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
for (const [k, s] of Object.entries(SHAPES)) $('bShape').append(el('option', { value: k, text: s.label }));
function thumbFromFile(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onerror = () => rej(Error('zdjęcie')); r.onload = () => { const img = new Image(); img.onerror = () => rej(Error('zdjęcie')); img.onload = () => { const c = document.createElement('canvas'); const k = Math.min(1, 440 / Math.max(img.width, img.height)); c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .6)) }; img.src = r.result }; r.readAsDataURL(file) }) }
function dimFields(shape, values = {}) {
  const box = $('bDims'); box.replaceChildren();
  for (const [k, label, ph] of SHAPES[shape].fields) {
    const inp = el('input', { id: 'bd_' + k, inputmode: 'decimal', placeholder: 'np. ' + ph }); if (values[k] != null) inp.value = fmt(values[k]);
    inp.addEventListener('input', () => { formEstimated = false; $('bd_e')?.remove(); bucketPreview() });
    box.append(el('div', {}, el('label', { class: 'label', for: 'bd_' + k, text: label }), inp));
  }
  if (values.e) box.append(el('input', { type: 'hidden', id: 'bd_e', value: String(values.e) }));
  $('bShapeHint').textContent = SHAPES[shape].hint; bucketPreview();
}
function formDims() { const shape = $('bShape').value; const raw = { e: $('bd_e')?.value }; for (const [k] of SHAPES[shape].fields) raw[k] = $('bd_' + k)?.value; return cleanDims(shape, raw) }
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
function openBucketForm(p = null) {
  editingId = p?.id || ''; formEstimated = !!p?.estimated; formPhotos = (p?.photos || []).map(x => x.data || x).filter(Boolean);
  $('bucketFormTitle').textContent = p ? 'Edytuj kosz' : 'Nowy kosz';
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
  const p = { id: editingId || 'bucket-' + Date.now(), name: $('bName').value.trim() || 'Mój kosz', shape: dims ? shape : 'plate', dims, estimated: formEstimated, plate: plate > 0 ? plate : null, real: real > 0 ? real : null, capacity: Math.round(capacity * 1000) / 1000, photos: formPhotos.map(data => ({ data })), createdAt: getProfile(editingId)?.createdAt || Date.now() };
  const i = profiles.findIndex(x => x.id === p.id); const backup = profiles.slice();
  if (i >= 0) profiles[i] = p; else profiles.push(p);
  if (!saveProfiles()) { profiles = backup; return }
  if (session?.bucketProfile?.id === p.id) { session.bucketProfile = snapshot(p); session.capacity = p.capacity; session.dose = Math.min(session.dose, p.capacity); remember() }
  closeBucketForm(); announce('Zapisano: ' + p.name + ' · ' + fmt(p.capacity) + ' m³');
  // od razu do licznika z podziałką tego kosza
  if (session && session.method !== 'taczka') { changeCapacity(p.capacity, p); tab('work') }
  else { if (method === 'taczka') selectMethod('kibel'); chooseProfile(p.id); rememberSiteBucket($('site').value, p.id); tab('setup'); announce('Kosz ' + p.name + ' wybrany — wpisz budowę i zacznij') }
});
function bucketListRender() {
  const box = $('bucketList'); box.replaceChildren();
  if (!profiles.length) box.append(el('p', { class: 'hint', text: 'Nie masz jeszcze zapisanych koszy. Zmierz kosz — policzę dokładną pojemność i podziałkę.' }));
  for (const p of profiles) {
    const img = p.photos?.[0]?.data ? el('img', { src: p.photos[0].data, alt: '', class: 'bucket-thumb' }) : el('div', { class: 'bucket-thumb ph', text: '🪣' });
    const info = el('div', { class: 'bucket-info' }, el('strong', { text: p.name }), el('small', { text: fmt(p.capacity) + ' m³' + (p.plate && Math.abs(p.plate - p.capacity) > .005 ? ' (tabliczka ' + fmt(p.plate) + ')' : '') + ' · ' + (SHAPES[p.shape]?.label || 'tabliczka') + (p.estimated ? ' · ze zdjęć' : p.dims ? ' · zmierzony' : '') }));
    const acts = el('div', { class: 'bucket-acts' });
    if (bucketReturn === 'setup') acts.append(el('button', { type: 'button', class: 'primary', text: 'Wybierz', onclick: () => { chooseProfile(p.id); rememberSiteBucket($('site').value, p.id); tab('setup') } }));
    acts.append(el('button', { type: 'button', text: '✏️', 'aria-label': 'Edytuj', onclick: () => openBucketForm(p) }));
    acts.append(el('button', { type: 'button', class: 'warn', text: '🗑', 'aria-label': 'Usuń', onclick: () => { if (!confirm('Usunąć kosz „' + p.name + '”?')) return; profiles = profiles.filter(x => x.id !== p.id); for (const [k, v] of Object.entries(siteAssignments)) if (v === p.id) delete siteAssignments[k]; storeSiteAssignments(); saveProfiles(); if (chosenProfileId === p.id) chosenProfileId = ''; bucketListRender() } }));
    box.append(el('div', { class: 'bucket-row' }, img, info, acts));
  }
}

// ───────────────────────── kosz ze zdjęć: bok + góra → rzeczywista pojemność ─────────────────────────
let formEstimated = false;
const PC_STEPS = ['side-photo', 'side', 'fill', 'top-photo', 'top', 'scale', 'result'];
const PC_SIDE = ['lewy GÓRNY róg (krawędź wlewu)', 'prawy GÓRNY róg', 'prawy DOLNY róg (nad zasuwą)', 'lewy DOLNY róg'];
const PC_TOP = ['1 — LEWĄ krawędź otworu', '2 — PRAWĄ krawędź otworu', '3 — PRZEDNIĄ krawędź (bliżej Ciebie)', '4 — TYLNĄ krawędź (dalej)'];
const newPhoto = () => ({ img: null, file: null, pts: [] });
const pc = { step: 'side-photo', side: newPhoto(), top: newPhoto(), fill: null, shape: 'round', mode: 'ref', cap: .75, ref: [], k: 1, drag: -1 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const pcRefCm = () => { const v = Number($('pcRefType').value); return v === -1 ? number($('pcRefCustom').value) : v };
function pcOpen() {
  Object.assign(pc, { step: 'side-photo', side: newPhoto(), top: newPhoto(), fill: null, shape: $('bShape').value === 'rect' ? 'rect' : 'round', mode: 'ref', ref: [], drag: -1 });
  $('pcPlate').value = $('bPlate').value || '';
  $('pc').classList.remove('hide'); document.body.style.overflow = 'hidden'; pcUI();
}
function pcClose() { $('pc').classList.add('hide'); document.body.style.overflow = '' }
const pcPhoto = () => ['top-photo', 'top'].includes(pc.step) ? pc.top : pc.side;
const canvasStep = () => ['side', 'fill', 'top'].includes(pc.step) || (pc.step === 'scale' && pc.mode === 'ref');
function pcCompute() {
  const [TL, TR, BR, BL] = pc.side.pts; if (!BL) return null;
  const topW = dist(TL, TR), botW = dist(BL, BR), mT = mid(TL, TR), mB = mid(BL, BR), hPx = dist(mT, mB);
  if (!(topW > 5 && botW > 2 && hPx > 5)) return null;
  let fillFrac = 1;
  if (pc.fill) { const vx = mT.x - mB.x, vy = mT.y - mB.y; fillFrac = ((pc.fill.x - mB.x) * vx + (pc.fill.y - mB.y) * vy) / (vx * vx + vy * vy); fillFrac = Math.min(1, Math.max(.3, fillFrac)) }
  let e = 1; const T = pc.top.pts; if (T.length === 4) { const w = dist(T[0], T[1]), dpt = dist(T[2], T[3]); if (w > 5 && dpt > 3) e = Math.min(3, Math.max(.3, dpt / w)) }
  const rect = pc.shape === 'rect', shape = rect ? 'rect' : 'cone';
  const mk = c => { const d = rect ? { lTop: topW * c, wTop: topW * c * e, lBottom: botW * c, wBottom: botW * c * e, h: hPx * c } : { dTop: topW * c, dBottom: botW * c, h: hPx * c }; if (!rect && Math.abs(e - 1) > .01) d.e = e; return d };
  let c, nominal = 0, mode = pc.mode;
  if (mode === 'ref') { const rp = pc.ref.length === 2 ? dist(pc.ref[0], pc.ref[1]) : 0, rc = pcRefCm(); if (!(rp > 3 && rc > 0)) return null; c = rc / rp; const pl = number($('pcPlate').value); if (pl > 0) nominal = pl }
  else { nominal = mode === 'plate' ? number($('pcPlate').value) : pc.cap; if (!(nominal > 0 && nominal <= 5)) return null; const c0 = 100 / topW; c = c0 * Math.cbrt(nominal / geoCapacity(shape, mk(c0))) }
  const dims = mk(c), rim = geoCapacity(shape, dims), real = volumeUpTo(shape, dims, fillFrac * dims.h);
  const u = mode === 'ref' ? .15 : (pc.fill && T.length === 4 ? .06 : .09);
  const onlyPlate = mode !== 'ref' && !pc.fill;
  return { shape, dims, rim, real, lo: real * (1 - u), hi: real * (1 + u), nominal, mode, fillFrac, belowRim: dims.h * (1 - fillFrac), e, onlyPlate };
}
function pcUI() {
  const st = pc.step, i = PC_STEPS.indexOf(st), ph = pcPhoto();
  $('pcProgress').replaceChildren(...['Bok', 'Beton', 'Góra', 'Skala', 'Wynik'].map((t, j) => el('span', { class: [1, 2, 4, 5, 6][j] <= i ? 'on' : '', text: t })));
  const isPick = st === 'side-photo' || st === 'top-photo';
  $('pcPick').classList.toggle('hide', !isPick);
  $('pcPickText').textContent = '📸 Zrób zdjęcie';
  $('pcGalSub').textContent = st === 'side-photo' ? 'możesz zaznaczyć 2 naraz: bok + góra' : '';
  $('pcPickSub').textContent = st === 'top-photo' ? 'Stań nad koszem i sfotografuj otwór z góry. Można pominąć.' : 'Cały kosz w kadrze, aparat na wysokości połowy kosza.';
  $('pcShapeToggle').classList.toggle('hide', !['top-photo', 'top'].includes(st));
  $('pcTopHint').classList.toggle('hide', !['top-photo', 'top'].includes(st) || (st === 'top' && pc.top.pts.length > 0));
  document.querySelectorAll('[data-pcshape]').forEach(b => b.classList.toggle('on', b.dataset.pcshape === pc.shape));
  $('pcWrap').classList.toggle('hide', !canvasStep());
  $('pcScale').classList.toggle('hide', st !== 'scale');
  document.querySelectorAll('[data-pcmode]').forEach(b => b.classList.toggle('on', b.dataset.pcmode === pc.mode));
  $('pcModePlate').classList.toggle('hide', pc.mode === 'typ');
  $('pcPlateLabel').textContent = pc.mode === 'ref' ? 'Tabliczka (m³) — opcjonalnie, do porównania' : 'Co jest na tabliczce (m³)?';
  $('pcModeHint').textContent = pc.mode === 'ref' ? 'Najdokładniej: zaznacz na zdjęciu z boku przedmiot o znanym rozmiarze — policzę prawdziwą pojemność, niezależnie od tabliczki.' : pc.mode === 'plate' ? 'Zdjęcie da tylko kształt. Pojemność = tabliczka, chyba że zaznaczyłeś niżej linię betonu.' : 'Wielkość na oko — kształt i podziałka ze zdjęć.'; $('pcModeRef').classList.toggle('hide', pc.mode !== 'ref'); $('pcModeTyp').classList.toggle('hide', pc.mode !== 'typ');
  $('pcRefCustom').classList.toggle('hide', Number($('pcRefType').value) !== -1);
  $('pcCapPick').replaceChildren(...[.25, .5, .75, 1, 1.5, 2].map(v => el('button', { type: 'button', class: 'pill' + (Math.abs(pc.cap - v) < 1e-4 ? ' on' : ''), text: fmt(v) + ' m³', onclick: () => { pc.cap = v; pcUI() } })));
  $('pcResult').classList.toggle('hide', st !== 'result');
  $('pcBack').classList.toggle('hide', st === 'side-photo');
  $('pcSkip').classList.toggle('hide', !['fill', 'top-photo', 'top'].includes(st));
  $('pcSkip').textContent = st === 'fill' ? 'Beton do krawędzi' : 'Pomiń górę';
  $('pcNext').classList.toggle('hide', isPick);
  $('pcNext').textContent = st === 'result' ? '✓ Użyj w koszu' : 'Dalej ›';
  let txt = '', ok = true;
  if (st === 'side-photo') txt = 'Krok 1 · Zdjęcie kosza z boku.';
  else if (st === 'side') { ok = pc.side.pts.length === 4; txt = ok ? 'Przeciągnij punkty na krawędzie wnętrza, potem „Dalej”.' : 'Dotknij: ' + PC_SIDE[pc.side.pts.length] + '.' }
  else if (st === 'fill') { ok = !!pc.fill; txt = 'Dotknij wysokości, do której FAKTYCZNIE dochodzi beton (np. spaw, pasek, ślad betonu). Jeśli do samej krawędzi — „Beton do krawędzi”.' }
  else if (st === 'top-photo') txt = 'Krok 2 (można pominąć) · Zdjęcie otworu z góry — pokaże, czy kosz jest owalny albo kanciasty.';
  else if (st === 'top') { ok = pc.top.pts.length === 4; txt = ok ? 'Gotowe — „Dalej”. Możesz poprawić punkty.' : 'Dotknij: ' + PC_TOP[pc.top.pts.length] + '.' }
  else if (st === 'scale') {
    txt = 'Krok 3 · Skąd znamy wielkość kosza?';
    if (pc.mode === 'plate') ok = number($('pcPlate').value) > 0;
    if (pc.mode === 'ref') { ok = pc.ref.length === 2 && pcRefCm() > 0; txt = pc.ref.length < 2 ? 'Dotknij na zdjęciu ' + (pc.ref.length ? 'drugiego' : 'pierwszego') + ' końca przedmiotu.' : 'Przedmiot zaznaczony — „Dalej”.' }
  }
  else if (st === 'result') {
    txt = 'Wynik';
    const r = pcCompute(), box = $('pcResult'); box.replaceChildren();
    if (!r) { box.append(el('div', { class: 'error', text: 'Brakuje danych — cofnij i sprawdź punkty lub tabliczkę.' })); ok = false }
    else {
      const d = r.dims, dimTxt = r.shape === 'rect' ? 'góra ' + Math.round(d.lTop) + '×' + Math.round(d.wTop) + ' cm · dół ' + Math.round(d.lBottom) + '×' + Math.round(d.wBottom) + ' cm · wys. ' + Math.round(d.h) + ' cm' : 'Ø góra ' + Math.round(d.dTop) + ' cm · Ø dół ' + Math.round(d.dBottom) + ' cm · wys. ' + Math.round(d.h) + ' cm' + (d.e ? ' · owal ' + Math.round(d.e * 100) + '%' : '');
      box.append(el('div', { class: 'calc-main', text: (r.mode === 'ref' ? 'Zmierzone: wchodzi ≈ ' : 'Wchodzi ≈ ') + fmt(r.real) + ' m³' }));
      if (r.onlyPlate) box.append(el('div', { class: 'error', text: 'ℹ️ To jest wartość z tabliczki — zdjęcie bez przedmiotu odniesienia nie mierzy wielkości. Żeby zmierzyć naprawdę: cofnij i wybierz „Zmierz (przedmiot na zdjęciu)” albo zaznacz linię betonu.' }));
      else box.append(el('div', { class: 'calc-range', text: 'realnie od ' + fmt(r.lo) + ' do ' + fmt(r.hi) + ' m³' }));
      if (r.mode === 'ref' && r.nominal > 0) box.append(el('div', { class: 'muted', text: 'Tabliczka mówi ' + fmt(r.nominal) + ' m³ → realnie ' + Math.round(r.real / r.nominal * 100) + '% tego' }));
      box.append(el('div', { class: 'muted', text: 'Do samej krawędzi: ' + fmt(r.rim) + ' m³' + (r.fillFrac < 1 ? ' · beton ok. ' + Math.round(r.belowRim) + ' cm pod krawędzią' : '') }));
      box.append(el('div', { class: 'muted', text: 'Wymiary (szacunek): ' + dimTxt }));
      if (r.mode === 'typ') box.append(el('div', { class: 'muted', text: 'Wielkość wybrana „na oko” — kształt i podziałka są ze zdjęć.' }));
      if (r.real > 5 || r.real < .02) { box.append(el('div', { class: 'error', text: '⚠️ Wynik wygląda nierealnie — sprawdź punkty.' })); ok = false }
    }
  }
  $('pcStep').textContent = txt; $('pcNext').disabled = !ok;
  pcDraw();
}
function pcDraw() {
  if (!canvasStep()) return; const ph = pc.step === 'top' ? pc.top : pc.side; if (!ph.img) return;
  const cv = $('pcCanvas'), wrap = $('pcWrap'), dpr = window.devicePixelRatio || 1, maxW = (wrap.clientWidth || 340) - 8, maxH = Math.max(220, window.innerHeight * .5);
  const k = Math.min(maxW / ph.img.width, maxH / ph.img.height); pc.k = k;
  const w = Math.round(ph.img.width * k), h = Math.round(ph.img.height * k);
  cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.width = w * dpr; cv.height = h * dpr;
  const g = cv.getContext('2d'); g.setTransform(dpr * k, 0, 0, dpr * k, 0, 0); g.drawImage(ph.img, 0, 0);
  const lw = 3 / k, r = 11 / k;
  const dot = (p, label, color) => { g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fillStyle = color; g.fill(); g.lineWidth = 2 / k; g.strokeStyle = '#14112e'; g.stroke(); if (label) { g.fillStyle = '#14112e'; g.font = `900 ${13 / k}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, p.x, p.y) } };
  if (ph === pc.side) {
    const P = pc.side.pts;
    if (P.length) { g.lineWidth = lw; g.strokeStyle = '#8BD1E0'; g.fillStyle = 'rgba(139,209,224,.16)'; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); if (P.length === 4) { g.closePath(); g.fill() } g.stroke() }
    if (pc.fill && P.length === 4) {
      const [TL, TR, BR, BL] = P, mT = mid(TL, TR), mB = mid(BL, BR); const vx = mT.x - mB.x, vy = mT.y - mB.y; let f = ((pc.fill.x - mB.x) * vx + (pc.fill.y - mB.y) * vy) / (vx * vx + vy * vy); f = Math.min(1, Math.max(0, f));
      const L = { x: BL.x + (TL.x - BL.x) * f, y: BL.y + (TL.y - BL.y) * f }, R = { x: BR.x + (TR.x - BR.x) * f, y: BR.y + (TR.y - BR.y) * f };
      g.fillStyle = 'rgba(155,163,179,.55)'; g.beginPath(); g.moveTo(L.x, L.y); g.lineTo(R.x, R.y); g.lineTo(BR.x, BR.y); g.lineTo(BL.x, BL.y); g.closePath(); g.fill();
      g.lineWidth = lw * 1.3; g.strokeStyle = '#ffffff'; g.setLineDash([10 / k, 6 / k]); g.beginPath(); g.moveTo(L.x, L.y); g.lineTo(R.x, R.y); g.stroke(); g.setLineDash([]);
      dot(pc.fill, 'B', '#ffffff');
    }
    P.forEach((p, i) => dot(p, String(i + 1), '#8BD1E0'));
    if (pc.step === 'scale' && pc.ref.length) { g.lineWidth = lw; g.strokeStyle = '#ffd17e'; g.beginPath(); g.moveTo(pc.ref[0].x, pc.ref[0].y); if (pc.ref[1]) g.lineTo(pc.ref[1].x, pc.ref[1].y); g.stroke(); pc.ref.forEach(p => dot(p, '', '#ffd17e')) }
  } else {
    const T = pc.top.pts; g.lineWidth = lw;
    if (T.length >= 2) { g.strokeStyle = '#8BD1E0'; g.beginPath(); g.moveTo(T[0].x, T[0].y); g.lineTo(T[1].x, T[1].y); g.stroke() }
    if (T.length === 4) { g.strokeStyle = '#9B4CD3'; g.beginPath(); g.moveTo(T[2].x, T[2].y); g.lineTo(T[3].x, T[3].y); g.stroke() }
    T.forEach((p, i) => dot(p, String(i + 1), i < 2 ? '#8BD1E0' : '#c39bf0'));
  }
}
(function pcInput() {
  const cv = $('pcCanvas');
  const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) / pc.k, y: (e.clientY - b.top) / pc.k } };
  const target = () => pc.step === 'side' ? [pc.side.pts, 4] : pc.step === 'top' ? [pc.top.pts, 4] : pc.step === 'scale' ? [pc.ref, 2] : null;
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); cv.setPointerCapture(e.pointerId); const p = pos(e);
    if (pc.step === 'fill') { pc.fill = p; pc.drag = 99; pcUI(); return }
    const t = target(); if (!t) return; const [L, max] = t;
    let best = -1, bd = 30 / pc.k; L.forEach((q, i) => { const d = dist(p, q); if (d < bd) { bd = d; best = i } });
    if (best >= 0) pc.drag = best; else if (L.length < max) { L.push(p); pc.drag = L.length - 1 } else pc.drag = -1;
    pcUI();
  });
  cv.addEventListener('pointermove', e => { if (pc.drag < 0) return; const p = pos(e); if (pc.step === 'fill') pc.fill = p; else { const t = target(); if (t && t[0][pc.drag]) t[0][pc.drag] = p } pcDraw() });
  const up = () => { if (pc.drag >= 0) { pc.drag = -1; pcUI() } }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  window.addEventListener('resize', () => { if (!$('pc').classList.contains('hide')) pcDraw() });
})();
const loadImg = f => new Promise((res, rej) => { const rd = new FileReader(); rd.onerror = rej; rd.onload = () => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = rd.result }; rd.readAsDataURL(f) });
async function pcFilePicked(e) {
  const files = [...(e.target.files || [])].slice(0, 2); e.target.value = ''; if (!files.length) return;
  try {
    const ph = pcPhoto(), first = await loadImg(files[0]);
    Object.assign(ph, { img: first, file: files[0], pts: [] });
    if (ph === pc.side && files[1]) { Object.assign(pc.top, { img: await loadImg(files[1]), file: files[1], pts: [] }); announce('2 zdjęcia: pierwsze = bok, drugie = góra') }
    pc.step = ph === pc.top ? 'top' : 'side'; pcUI();
  } catch (err) { announce('Nie mogę otworzyć zdjęcia') }
}
$('pcFile').addEventListener('change', pcFilePicked); $('pcCamera').addEventListener('change', pcFilePicked);
const pcCameraNow = () => { try { $('pcCamera').click() } catch (e) { } };
document.querySelectorAll('[data-pcshape]').forEach(b => b.addEventListener('click', () => { pc.shape = b.dataset.pcshape; pcUI() }));
document.querySelectorAll('[data-pcmode]').forEach(b => b.addEventListener('click', () => { pc.mode = b.dataset.pcmode; pc.ref = []; pcUI() }));
['pcPlate', 'pcRefCustom'].forEach(id => $(id).addEventListener('input', () => pcUI()));
$('pcRefType').addEventListener('change', () => pcUI());
const go = st => { pc.step = st; pcUI() };
$('pcSkip').addEventListener('click', () => { if (pc.step === 'fill') { pc.fill = null; if (pc.top.img) return go('top'); go('top-photo'); pcCameraNow() } else { pc.top = newPhoto(); go('scale') } });
$('pcBack').addEventListener('click', () => {
  const st = pc.step;
  if (st === 'side') { if (pc.side.pts.length) pc.side.pts.pop(); else return go('side-photo') }
  else if (st === 'fill') { if (pc.fill) pc.fill = null; else return go('side') }
  else if (st === 'top-photo') return go('fill');
  else if (st === 'top') { if (pc.top.pts.length) pc.top.pts.pop(); else return go('top-photo') }
  else if (st === 'scale') { if (pc.mode === 'ref' && pc.ref.length) pc.ref.pop(); else return go(pc.top.img ? 'top' : 'top-photo') }
  else if (st === 'result') return go('scale');
  pcUI();
});
$('pcNext').addEventListener('click', async () => {
  const st = pc.step;
  if (st === 'side') return go('fill');
  if (st === 'fill') { if (pc.top.img) return go('top'); go('top-photo'); return pcCameraNow() }
  if (st === 'top') return go('scale');
  if (st === 'scale') return go('result');
  if (st !== 'result') return;
  const r = pcCompute(); if (!r) return;
  $('bShape').value = r.shape; dimFields(r.shape, r.dims);
  $('bPlate').value = r.nominal ? fmt(r.nominal) : '';
  $('bReal').value = fmt(r.real);
  formEstimated = true;
  for (const f of [pc.side.file, pc.top.file]) if (f) try { formPhotos.push(await thumbFromFile(f)) } catch (e) { }
  formPhotos = formPhotos.slice(-4); thumbsRender(); bucketPreview(); pcClose();
  $('bName').focus(); announce('Faktycznie ≈ ' + fmt(r.real) + ' m³ — nazwij kosz i zapisz');
});
$('pcClose').addEventListener('click', pcClose);
$('bPhotoCalc').addEventListener('click', () => { pcOpen(); pcCameraNow() });

// ───────────────────────── ustawienia ─────────────────────────
$('notifyMode').value = settings.mode; $('ttsRate').value = String(settings.rate); $('alarmOn').checked = settings.alarm; $('confirmOn').checked = settings.confirm;
$('notifyMode').addEventListener('change', () => { settings.mode = $('notifyMode').value; saveSettings() });
$('ttsVoice').addEventListener('change', () => { settings.voice = $('ttsVoice').value; saveSettings(); lektorRender() });
$('ttsRate').addEventListener('change', () => { settings.rate = Number($('ttsRate').value); saveSettings() });
$('ttsPitch').value = String(settings.pitch ?? 1);
$('ttsPitch').addEventListener('change', () => { settings.pitch = Number($('ttsPitch').value); saveSettings() });
function lektorRender() {
  const box = $('lektorList'); box.replaceChildren();
  for (const L of LEKTORS) {
    const [id, name, desc] = L, r = lektorVoice(L), on = settings.lektor === id && !settings.voice;
    const used = r.voice ? (r.exact ? '🔊 ' + r.voice.name : '⚠️ brak tego głosu — zastępczo ' + r.voice.name) : '';
    box.append(el('button', { type: 'button', class: 'lektor' + (on ? ' on' : ''), onclick: () => { settings.lektor = id; settings.voice = ''; settings.rate = L[5]; settings.pitch = L[6]; $('ttsRate').value = String(L[5]); $('ttsPitch').value = String(L[6]); $('ttsVoice').value = ''; saveSettings(); lektorRender(); speak('ask', TEXTS.ask || 'Czy kosz już wrócił?') } },
      el('strong', { text: (on ? '✓ ' : '') + name }), el('small', { text: desc }), el('em', { text: used })));
  }
}
$('alarmOn').addEventListener('change', () => { settings.alarm = $('alarmOn').checked; saveSettings() });
$('confirmOn').addEventListener('change', () => { settings.confirm = $('confirmOn').checked; saveSettings() });
$('ttsTest').addEventListener('click', () => speak('ask', TEXTS.ask || 'Sprawdzenie lektora'));
$('textsReset').addEventListener('click', () => { if (!confirm('Przywrócić domyślne teksty lektora?')) return; TEXTS = { ...DEFAULT_TEXTS }; saveTexts(); settingsRender() });
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
  $('clipsHint').textContent = nativeVoice ? 'Wpisz, co ma mówić lektor. 🎙 nagrywa Twój głos — nagranie ma pierwszeństwo przed lektorem. Puste pole = cisza.' : 'Wpisz, co ma mówić lektor. Puste pole = cisza. (Nagrywanie działa w aplikacji na iPhonie.)';
  const box = $('botDictionary'); box.replaceChildren();
  for (const [group, items] of TEXT_GROUPS) {
    box.append(el('h3', { class: 'dict-group', text: group }));
    for (const [key, label] of items) {
      const isPrefix = key.endsWith('Prefix');
      const ta = el('textarea', { rows: '2', 'aria-label': label }); ta.value = TEXTS[key] ?? '';
      let tmr; ta.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { TEXTS[key] = ta.value.trim(); saveTexts() }, 400) });
      const acts = el('div', { class: 'dict-acts' }, el('button', { type: 'button', text: '▶', 'aria-label': 'Odsłuchaj', onclick: () => speak(isPrefix ? '' : key, isPrefix ? ta.value + ' 2,5 metra sześciennego' : ta.value) }));
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
  const r = $('historyRows'); if (!archive.length) { r.innerHTML = '<p class="help">Jeszcze nie masz zakończonych betonowań.</p>'; return }
  r.innerHTML = '<table><thead><tr><th>Data i budowa</th><th>Wylano</th><th>Czas</th></tr></thead><tbody>' + archive.map(s => '<tr><td><strong>' + escapeHTML(s.site || 'Budowa') + '</strong><br><span class="help">' + new Date(s.startedAt).toLocaleDateString('pl-PL') + ' · ' + escapeHTML(s.method || 'kibel') + '</span></td><td>' + fmt(s.total ?? (s.entries || []).reduce((a, b) => a + Number(b.amount || 0), 0)) + ' m³</td><td>' + dur(((s.endedAt || Date.now()) - s.startedAt) / 1000) + '</td></tr>').join('') + '</tbody></table>';
}
function download(name, blob) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000) }
$('export').addEventListener('click', () => { const rows = ['Data;Budowa;Metoda;Załadowano_m3;Wylano_m3;Czas_s', ...archive.map(s => [new Date(s.startedAt).toLocaleString('pl-PL'), s.site, s.method, s.load, s.total, Math.round((s.endedAt - s.startedAt) / 1000)].map(v => '"' + String(v).replaceAll('"', '""') + '"').join(';'))]; download('BetonKibelPlus_historia.csv', new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })) });
const savedKeys = [KEY, HKEY, PROFILE_KEY, SITE_BUCKET_KEY, SETTINGS_KEY, TEXT_KEY];
$('backupExport').addEventListener('click', () => { const payload = { app: 'BetonKibelPlus', formatVersion: 1, exportedAt: new Date().toISOString(), values: {} }; for (const k of savedKeys) { const v = localStorage.getItem(k); if (v !== null) payload.values[k] = v } download('BetonKibelPlus_kopia_' + new Date().toISOString().slice(0, 10) + '.json', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })) });
$('backupImport').addEventListener('change', async () => {
  const f = $('backupImport').files?.[0]; if (!f) return;
  try {
    if (f.size > 12e6) throw Error('Plik za duży');
    const data = JSON.parse(await f.text());
    if (!['Beton Licznik', 'BetonKibelPlus'].includes(data.app) || data.formatVersion !== 1 || typeof data.values !== 'object') throw Error('To nie jest kopia BetonKibelPlus');
    const legacy = ['beton_tts_enabled', 'beton_tts_voice', 'beton_tts_profile'];
    const entries = Object.entries(data.values).filter(([k]) => !legacy.includes(k));
    if (entries.some(([k, v]) => !savedKeys.includes(k) || typeof v !== 'string')) throw Error('Kopia zawiera nieznane dane');
    if (!confirm('Przywrócić kopię? Zastąpi historię, betonowanie i kosze.')) return;
    for (const k of savedKeys) localStorage.removeItem(k); for (const [k, v] of entries) localStorage.setItem(k, v); location.reload();
  } catch (e) { alert('Nie udało się przywrócić: ' + (e.message || e)) } finally { $('backupImport').value = '' }
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
tab('home'); setInterval(tick, 500);
drainNative();

(function intro() {
  const box = $('intro'); if (!box) return;
  let done = false; const close = () => { if (done) return; done = true; box.classList.add('out'); setTimeout(() => box.remove(), 450) };
  box.addEventListener('click', close); setTimeout(close, 2100);
})();
