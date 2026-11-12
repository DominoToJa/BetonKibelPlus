import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const ID = 2101;
const isNative = Capacitor.isNativePlatform();
const Domino = registerPlugin('DominoNative');
let allowed = false;

async function permission() {
  if (!isNative) return false;
  try { const state = await LocalNotifications.requestPermissions(); allowed = state.display === 'granted'; return allowed }
  catch (e) { console.warn('Notifications permissions', e); return false }
}
/* przypomnienie „Czy kosz już jest?” — seria powiadomień co 20 s (z dźwiękiem i wibracją), aż zaznaczysz */
const BURST_GAP = 2500, CHAIN_MAX = 36; // id-ki do kasowania
const rcfg = () => { const r = window.__bkpRemind || { gap: 45000, cycles: 6, burst: 1 }; return { GAP: r.gap, BURST: r.burst, CHAIN: Math.min(CHAIN_MAX, r.cycles * r.burst) } };
async function schedule(at, body) {
  if (!isNative) return; if (!(await permission())) return;
  try {
    await LocalNotifications.cancel({ notifications: Array.from({ length: CHAIN_MAX }, (_, i) => ({ id: ID + i })) });
    const { GAP, BURST, CHAIN } = rcfg();
    const t0 = Math.max(Date.now() + 1000, at);
    await LocalNotifications.schedule({ notifications: Array.from({ length: CHAIN }, (_, k) => { const i = Math.floor(k / BURST), j = k % BURST; return { id: ID + k, title: (j === 0 ? '🔔' : j === 1 ? '🚨' : '⚠️') + (i ? ' KOSZ WRÓCIŁ? (' + (i + 1) + ')' : ' Czy kosz już jest?'), body: (i ? 'Nie zaznaczyłeś powrotu kosza. ' : '') + 'Przytrzymaj i wybierz: Kosz jest / Jeszcze nie', schedule: { at: new Date(t0 + i * GAP + j * BURST_GAP), allowWhileIdle: true }, sound: 'default', actionTypeId: 'KOSZ', threadIdentifier: 'kosz', extra: { kind: 'bucket' } } }) });
  } catch (e) { console.warn('Schedule notification', e) }
}
async function cancel() { if (!isNative) return; try { await LocalNotifications.cancel({ notifications: Array.from({ length: CHAIN_MAX }, (_, i) => ({ id: ID + i })) }) } catch (e) { console.warn('Cancel notification', e) } }

const safe = (fn, fallback) => async (...args) => { if (!isNative) return fallback; try { return await fn(...args) } catch (e) { console.warn('DOMINO native', e); throw e } };

const voice = {
  available: isNative,
  askPermissions: safe(() => Domino.askPermissions(), { speech: false, mic: false }),
  start: safe(() => Domino.startListening({ lang: 'pl-PL' }), null),
  stop: safe(() => Domino.stopListening(), null),
  speak: safe((key, text, interrupt = true) => Domino.speak({ key: key || undefined, text: text || '', interrupt }), null),
  stopSpeaking: safe(() => Domino.stopSpeaking(), null),
  voices: safe(() => Domino.getVoices(), { voices: [], best: '' }),
  configure: safe(cfg => Domino.configure(cfg), null),
  setState: safe(st => Domino.setState(st), null),
  drain: safe(async () => (await Domino.drainEvents()).events || [], []),
  startRecording: safe(key => Domino.startRecording({ key }), null),
  stopRecording: safe(() => Domino.stopRecording(), { saved: false }),
  playClip: safe(key => Domino.playClip({ key }), { played: false }),
  listClips: safe(async () => (await Domino.listClips()).keys || [], []),
  deleteClip: safe(key => Domino.deleteClip({ key }), null),
  saveVoice: safe((name, data) => Domino.saveVoice({ name, data }), null),
  listVoice: safe(async () => (await Domino.listVoice()).names || [], []),
  clearVoice: safe(() => Domino.clearVoice(), null),
  haptic: safe(kind => Domino.haptic({ kind: kind || 'success' }), null),
  elFetch: safe(o => Domino.elFetch(o), null),
  elApi: safe(o => Domino.elApi(o), null),
  playIntro: safe(o => Domino.playIntro(o), null),
  stopIntro: safe(() => Domino.stopIntro(), null),
  onHeard(cb) { if (isNative) Domino.addListener('heard', e => cb(e.text || '')) },
  onStatus(cb) { if (isNative) Domino.addListener('status', e => cb(e.text || '')) },
};

window.BKPnative = { schedule, cancel, isNative, voice };

if (isNative) {
  LocalNotifications.registerActionTypes({ types: [{ id: 'KOSZ', actions: [{ id: 'ARRIVED', title: 'Kosz jest' }, { id: 'LATER', title: 'Jeszcze nie' }] }] }).catch(e => console.warn('Actions', e));
  LocalNotifications.addListener('localNotificationActionPerformed', event => {
    if (event.notification?.id >= ID && event.notification?.id < ID + CHAIN_MAX) window.dispatchEvent(new CustomEvent('bkp:notification-action', { detail: { action: event.actionId } }))
  }).catch(e => console.warn('Notification listener', e));
}
