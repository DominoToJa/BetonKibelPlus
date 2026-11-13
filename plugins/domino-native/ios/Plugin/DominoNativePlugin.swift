import Foundation
import UIKit
import AVFoundation
import Speech
import MediaPlayer
import UserNotifications
import AudioToolbox
import Capacitor
import CallKit

/// BetonKibelPlus DOMINO — moduł natywny:
/// - ciągłe rozpoznawanie mowy (działa też na zablokowanym ekranie dzięki trybowi audio w tle),
/// - lektor (AVSpeechSynthesizer, najlepszy polski głos) i własne nagrania komunikatów,
/// - gdy aplikacja jest w tle: sam pyta o kosz, obsługuje odpowiedzi i zapisuje zdarzenia
///   do kolejki, którą JS odbiera po powrocie (drainEvents).
@objc(DominoNativePlugin)
public class DominoNativePlugin: CAPPlugin, CAPBridgedPlugin, AVSpeechSynthesizerDelegate, AVAudioPlayerDelegate, CXCallObserverDelegate {
    public let identifier = "DominoNativePlugin"
    public let jsName = "DominoNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "askPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "speak", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopSpeaking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getVoices", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "drainEvents", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startRecording", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopRecording", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "playClip", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listClips", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteClip", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveVoice", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listVoice", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearVoice", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "haptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "elFetch", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "elApi", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "playIntro", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopIntro", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getLog", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setNight", returnType: CAPPluginReturnPromise)
    ]

    // MARK: - Audio / mowa
    private let synth = AVSpeechSynthesizer()
    private let engine = AVAudioEngine()
    private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var generation = 0
    private var listening = false
    private var tapInstalled = false
    private var lastPartial = ""
    private var silenceTimer: Timer?
    private var restartTimer: Timer?
    private var language = "pl-PL"

    private var isSpeaking = false
    private var speakingUntil = Date.distantPast
    private var sayQueue: [(key: String?, text: String)] = []
    private var player: AVAudioPlayer?
    private var introPlayer: AVAudioPlayer?
    private var recorder: AVAudioRecorder?
    private var recordingKey: String?
    private var resumeListeningAfterRecording = false

    // MARK: - Ustawienia z JS
    private var texts: [String: String] = [:]
    private var voiceId = ""
    private var rate: Float = 0.5
    private var pitch: Float = 1.0
    private var useClips = true
    private var elOn = false
    private var headsetButtons = false
    private var lockCard = true          // karta z koszem na ekranie blokady (działa też bez przycisków słuchawki)
    private var nowPlayingOn: Bool { headsetButtons || lockCard }
    private var askOnly = true
    private var offlineSpeech = false
    private var micGateDb: Float = -30
    private var lastConf = -1.0, lastHeardDb = -120.0, lastHeardGate = -35.0, lastHeardBT = false      // próg głośności: ciche dźwięki z otoczenia są pomijane
    private var utterPeakDb: Float = -120
    private var voiceProcOn = false
    private var loudVoice = true          // głośny lektor: bez tłumienia echa iOS (ono mocno przycisza dźwięk)
    private var speakStartedAt = Date.distantPast
    private var sessionReady = false
    private var taskStartedAt = Date.distantPast
    private var lastAdd: Double = 0
    private var loadM3First: Double = 7.5
    /// ułamek kursu z mowy: ćwierć / pół / trzy czwarte / pełny / przelany
    private func kursFrac(_ t: String) -> String? {
        if has(t, ["trzy czwarte", "trzy czwarta"]) { return "0.75" }
        if has(t, ["cwierc", "jedna czwarta", "cwiartka"]) { return "0.25" }
        if has(t, ["przelany", "przelalem", "przelane", "z czubem", "z gorka"]) { return "over" }
        if has(t, ["pol kosza", "pol kibla", "polowa kosza", "do polowy", "polowe kosza", "polowa", "pol"]) { return "0.5" }
        if has(t, ["pelny kosz", "pelny kibel", "caly kosz", "do pelna", "pelen kosz", "pelny"]) { return "1" }
        return nil
    }
    private var quickFails = 0
    private var boostVolume = true
    private var targetVolume: Float = 1.0
    private lazy var volumeView: MPVolumeView = {
        let v = MPVolumeView(frame: CGRect(x: -2000, y: -2000, width: 1, height: 1)); v.alpha = 0.01; v.isUserInteractionEnabled = false; return v
    }()
    private var sayingNow = ""
    private var watchdog: Timer?
    private var keepAwake = true
    private var lockStatus = true
    private var site = ""
    private var remoteReady = false
    private var elTag = ""
    private var voiceOn = true

    // MARK: - Stan betonowania (kopia z JS)
    private var active = false
    private var method = "kibel"
    private var phase = "ready"
    private var deadline: Double = 0      // ms od 1970
    private var departed: Double = 0
    private var meanTripSec: Double = 120
    private var dose: Double = 0.5
    private var capacity: Double = 0.5
    private var elKey = "", elVoice = "", elModel = "eleven_multilingual_v2"
    private var elSpeed = 0.95, elStab = 0.5, elSim = 0.75
    private var leftM3: Double = 0
    private var poured: Double = 0
    private var loadM3: Double = 0
    private var fired: Set<String> = []
    private var askTimer: Timer?
    private var reminders = 0, remindSec = 45.0, remindMax = 5
    private var kursy = 0
    // MARK: - Dziennik w tle: co apka robiła, gdy ekran był zgaszony (do szukania „czemu nie zapytała”)
    private var bgLog: [[String: Any]] = []
    private func logBg(_ what: String) {
        let st = UIApplication.shared.applicationState == .active ? "ekran" : "tło"
        bgLog.append(["at": nowMs(), "what": what, "st": st])
        if bgLog.count > 80 { bgLog.removeFirst(bgLog.count - 80) }
    }
    @objc func getLog(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(["log": self.bgLog]) }
    }
    // MARK: - Ekran nocny: ciemno, ale apka nie zasypia (iOS nie przycina jej jak przy blokadzie)
    private var savedBrightness: CGFloat = -1
    @objc func setNight(_ call: CAPPluginCall) {
        let on = call.getBool("on") ?? false
        let level = CGFloat(max(0.0, min(1.0, call.getDouble("level") ?? 0.03)))
        DispatchQueue.main.async {
            if on {
                if self.savedBrightness < 0 { self.savedBrightness = UIScreen.main.brightness }
                UIScreen.main.brightness = level
                UIApplication.shared.isIdleTimerDisabled = true
                self.logBg("ekran nocny włączony")
            } else {
                if self.savedBrightness >= 0 { UIScreen.main.brightness = self.savedBrightness; self.savedBrightness = -1 }
                UIApplication.shared.isIdleTimerDisabled = self.keepAwake && self.active
                self.logBg("ekran nocny wyłączony")
            }
            call.resolve()
        }
    }
    private var pending: [[String: Any]] = []
    private let callObserver = CXCallObserver()
    private var inCall = false

    override public func load() {
        synth.delegate = self
        // muzyka i dźwięki aplikacji grają też przy wyciszniku (dopóki mikrofon nie przełączy sesji na nagrywanie)
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true, options: [])
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(onInterruption(_:)), name: AVAudioSession.interruptionNotification, object: nil)
        nc.addObserver(self, selector: #selector(onMediaReset(_:)), name: AVAudioSession.mediaServicesWereResetNotification, object: nil)
        nc.addObserver(self, selector: #selector(onEngineConfig(_:)), name: .AVAudioEngineConfigurationChange, object: engine)
        nc.addObserver(self, selector: #selector(onRouteChange(_:)), name: AVAudioSession.routeChangeNotification, object: nil)
        nc.addObserver(self, selector: #selector(onBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
        nc.addObserver(self, selector: #selector(onForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
        callObserver.setDelegate(self, queue: DispatchQueue.main)
        // strażnik: jeśli mowa albo mikrofon się zawiesi, sam to naprawia
        watchdog = Timer.scheduledTimer(withTimeInterval: 4, repeats: true) { [weak self] _ in self?.watch() }
        inCall = callObserver.calls.contains { !$0.hasEnded }
    }

    // MARK: - Rozmowa telefoniczna / WhatsApp / Messenger: lektor i mikrofon czekają, potem same wracają
    public func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
        let busy = callObserver.calls.contains { !$0.hasEnded }
        if busy && !inCall {
            inCall = true
            pauseForCall()
            notifyListeners("status", data: ["text": "📞 Rozmowa — lektor i komendy wstrzymane"])
        } else if !busy && inCall {
            inCall = false
            notifyListeners("status", data: ["text": "📞 Koniec rozmowy — wracam do słuchania"])
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
                guard let self = self, !self.inCall else { return }
                self.resumeAfterBreak()
                if self.active { self.scheduleAsk() }
            }
        }
    }
    /// na budowie: przed komunikatem podkręć głośność telefonu do ustawionego poziomu (iOS nie pozwala grać głośniej niż system)
    private func volumeUp() {
        guard boostVolume else { return }
        let cur = AVAudioSession.sharedInstance().outputVolume
        guard cur < targetVolume - 0.02 else { return }
        if volumeView.superview == nil, let host = bridge?.viewController?.view { host.addSubview(volumeView) }
        let target = targetVolume
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
            guard let slider = self?.volumeView.subviews.compactMap({ $0 as? UISlider }).first else { return }
            slider.setValue(target, animated: false)
            slider.sendActions(for: .valueChanged)
        }
    }

    private func watch() {
        if isSpeaking && Date().timeIntervalSince(speakStartedAt) > 15 {   // mowa wisi
            if synth.isSpeaking { synth.stopSpeaking(at: .immediate) }
            player?.stop(); player = nil
            nextSay()
        }
        if listening && !inCall && !isSpeaking && !engine.isRunning { resumeAfterBreak() }   // mikrofon padł
        if !active { stopKeepAlive(); lockTimer?.invalidate(); lockTimer = nil }
        else if UIApplication.shared.applicationState != .active && !inCall && (!engine.isRunning || nowPlayingOn) { startKeepAlive() }
    }
    private func pauseForCall() {
        sayQueue.removeAll(); isSpeaking = false
        if synth.isSpeaking { synth.stopSpeaking(at: .immediate) }
        player?.stop(); player = nil
        generation += 1
        silenceTimer?.invalidate(); silenceTimer = nil
        restartTimer?.invalidate(); restartTimer = nil
        request?.endAudio(); task?.cancel(); task = nil; request = nil
        if engine.isRunning { engine.stop() }
        if tapInstalled { engine.inputNode.removeTap(onBus: 0); tapInstalled = false }
    }

    // MARK: - Uprawnienia
    @objc func askPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { status in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                call.resolve(["speech": status == .authorized, "mic": granted])
            }
        }
    }

    private func configureSession() throws {
        let s = AVAudioSession.sharedInstance()
        var opts: AVAudioSession.CategoryOptions = [.defaultToSpeaker, .allowBluetooth, .allowBluetoothA2DP]
        if !nowPlayingOn { opts.insert(.mixWithOthers) }   // karta na ekranie blokady i przyciski słuchawki działają tylko bez miksowania
        // nie przestawiaj sesji, jeśli już jest dobra — każde przestawienie potrafi zatrzymać mikrofon
        if s.category == .playAndRecord && s.mode == .default && s.categoryOptions == opts && sessionReady { return }
        try s.setCategory(.playAndRecord, mode: .default, options: opts)
        try s.setActive(true, options: [])
        sessionReady = true
        // mikrofon w słuchawce BT, jeśli jest podłączona
        if let bt = s.availableInputs?.first(where: { $0.portType == .bluetoothHFP }) { try? s.setPreferredInput(bt) }
    }

    // MARK: - Słuchanie
    @objc func startListening(_ call: CAPPluginCall) {
        let lang = call.getString("lang") ?? "pl-PL"
        DispatchQueue.main.async {
            self.language = lang
            guard SFSpeechRecognizer.authorizationStatus() == .authorized else {
                call.reject("Brak zgody na rozpoznawanie mowy"); return
            }
            guard let rec = SFSpeechRecognizer(locale: Locale(identifier: lang)), rec.isAvailable else {
                call.reject("Rozpoznawanie mowy jest teraz niedostępne"); return
            }
            self.recognizer = rec
            if self.inCall { self.listening = true; call.resolve(["onDevice": rec.supportsOnDeviceRecognition, "paused": true]); return } // ruszy po rozmowie
            do {
                try self.configureSession()
                self.listening = true
                try self.startEngine()
                self.startTask()
                call.resolve(["onDevice": rec.supportsOnDeviceRecognition])
            } catch {
                self.listening = false
                call.reject("Nie mogę uruchomić mikrofonu: \(error.localizedDescription)")
            }
        }
    }

    @objc func stopListening(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.stopAll()
            call.resolve()
        }
    }

    private func stopAll() {
        listening = false
        generation += 1
        silenceTimer?.invalidate(); silenceTimer = nil
        restartTimer?.invalidate(); restartTimer = nil
        request?.endAudio(); task?.cancel(); task = nil; request = nil
        if engine.isRunning { engine.stop() }
        if tapInstalled { engine.inputNode.removeTap(onBus: 0); tapInstalled = false }
    }

    private func startEngine() throws {
        if engine.isRunning { engine.stop() }
        let input = engine.inputNode
        if tapInstalled { input.removeTap(onBus: 0); tapInstalled = false }
        // tłumienie szumu i echa (wbudowane w iOS): mniej łapie otoczenie i nie słyszy własnego lektora
        if loudVoice {
            if voiceProcOn { try? input.setVoiceProcessingEnabled(false); voiceProcOn = false }
        } else if !voiceProcOn {
            try? input.setVoiceProcessingEnabled(true); voiceProcOn = true
            // nie przyciszaj lektora/dźwięków, gdy mikrofon słucha
            if #available(iOS 17.0, *) { input.voiceProcessingOtherAudioDuckingConfiguration = AVAudioVoiceProcessingOtherAudioDuckingConfiguration(enableAdvancedDucking: false, duckingLevel: .min) }
        }
        let format = input.outputFormat(forBus: 0)
        guard format.sampleRate > 0 && format.channelCount > 0 else {
            throw NSError(domain: "DominoNative", code: 1, userInfo: [NSLocalizedDescriptionKey: "Brak wejścia mikrofonu"])
        }
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            guard let self = self else { return }
            self.request?.append(buffer)
            if let ch = buffer.floatChannelData?[0], buffer.frameLength > 0 {
                var sum: Float = 0; let n = Int(buffer.frameLength)
                for i in 0..<n { sum += ch[i] * ch[i] }
                let db = 20 * log10(max(1e-7, sqrt(sum / Float(n))))
                if db > self.utterPeakDb { self.utterPeakDb = db }
            }
        }
        tapInstalled = true
        engine.prepare()
        try engine.start()
    }

    private func startTask() {
        guard listening, let rec = recognizer else { return }
        generation += 1
        let gen = generation
        task?.cancel(); task = nil
        let req = SFSpeechAudioBufferRecognitionRequest()
        req.shouldReportPartialResults = true
        // dokładniej po polsku przez serwer Apple; w telefonie (offline) tylko gdy tak ustawiono albo brak sieci
        if rec.supportsOnDeviceRecognition && offlineSpeech { req.requiresOnDeviceRecognition = true }
        if #available(iOS 16.0, *) { req.addsPunctuation = false }
        req.contextualStrings = ["dodaj kosz", "dodaj", "dodaj kibel", "kosz zalany", "zalany", "kolejny", "jeszcze jeden", "wlano", "tak jest", "kosz jest", "jest kosz", "mamy", "nie ma", "jeszcze nie", "cofnij", "pomyłka",
                                 "kosz wyjechał", "jazda", "pojechał", "ile zostało", "ile wylano", "ile koszy", "pełny kosz", "pół kosza", "trzy czwarte", "ćwierć", "przelany", "gruszka pusta", "nowa gruszka",
                                 "dodaj taczkę", "dodaj łyżkę", "taczka", "łyżka", "kibel", "kosz", "słyszysz mnie", "czy mnie słyszysz"]
        request = req
        lastPartial = ""
        utterPeakDb = -120; lastConf = -1
        taskStartedAt = Date()
        task = rec.recognitionTask(with: req) { [weak self] result, error in
            DispatchQueue.main.async {
                guard let self = self, gen == self.generation else { return }
                if let r = result {
                    let t = r.bestTranscription.formattedString
                    let cs = r.bestTranscription.segments.map { Double($0.confidence) }.filter { $0 > 0 }
                    if !cs.isEmpty { self.lastConf = cs.reduce(0, +) / Double(cs.count) }
                    if t != self.lastPartial { self.lastPartial = t; self.armSilence(gen, after: self.quickDelay(t)) }
                    if r.isFinal { self.finish(gen); return }
                }
                if error != nil { self.finish(gen) }
            }
        }
        restartTimer?.invalidate()
        restartTimer = Timer.scheduledTimer(withTimeInterval: 50, repeats: false) { [weak self] _ in
            self?.finish(gen)
        }
    }

    /// szybka reakcja: krótkie, pewne komendy kończymy od razu, „dodaj…” czeka chwilę na ewentualną liczbę
    private func quickDelay(_ text: String) -> TimeInterval {
        let q = text.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "pl_PL"))
            .lowercased().replacingOccurrences(of: "ł", with: "l").trimmingCharacters(in: .whitespacesAndNewlines)
        let instant: Set<String> = ["tak", "jest", "tak jest", "kosz jest", "kibel jest", "jest kosz", "jest kibel", "juz jest", "no jest", "mamy", "mam", "jeszcze nie", "nie ma", "jeszcze go nie ma", "jeszcze jedzie",
                                    "cofnij", "cofnij ostatni", "pomylka", "wyjechal", "kosz wyjechal", "kibel wyjechal", "pojechal", "kosz pojechal", "jazda", "ile zostalo", "ile koszy", "ile wylano",
                                    "dodaj kosz", "dodaj kibel", "dodaj taczke", "dodaj lyzke", "kosz zalany", "kibel zalany", "zalany", "zalane", "kolejny", "jeszcze jeden", "plus jeden", "pelny", "pelny kosz", "pol kosza",
                                    "trzy czwarte", "cwierc", "przelany", "gruszka pusta", "nowa gruszka", "slyszysz mnie", "slyszysz", "czy mnie slyszysz", "jestes tam", "test mikrofonu"]
        if instant.contains(q) { return 0.12 }
        if q.rangeOfCharacter(from: .decimalDigits) != nil { return 0.6 }
        let last = q.split(separator: " ").last.map(String.init) ?? ""
        if ["dodaj", "kosz", "kibel", "zalany", "zalane", "taczka", "taczke", "lyzka", "lyzke", "kosza", "kibla", "wlano", "dolej"].contains(last) { return 0.4 }
        return 0.6
    }

    private func armSilence(_ gen: Int, after: TimeInterval = 0.8) {
        silenceTimer?.invalidate()
        silenceTimer = Timer.scheduledTimer(withTimeInterval: after, repeats: false) { [weak self] _ in
            self?.finish(gen)
        }
    }

    /// Koniec wypowiedzi: oddaj tekst i od razu słuchaj dalej.
    private func finish(_ gen: Int) {
        guard gen == generation else { return }
        silenceTimer?.invalidate(); silenceTimer = nil
        restartTimer?.invalidate(); restartTimer = nil
        let text = lastPartial.trimmingCharacters(in: .whitespacesAndNewlines)
        generation += 1
        request?.endAudio(); task?.cancel(); task = nil; request = nil
        lastPartial = ""
        // słuchawka BT ma cichszy mikrofon — próg o 12 dB niżej
        let btIn = AVAudioSession.sharedInstance().currentRoute.inputs.contains { $0.portType == .bluetoothHFP }
        let loudEnough = utterPeakDb >= micGateDb - (btIn ? 12 : 0)
        let peak = utterPeakDb
        utterPeakDb = -120
        let busy = isSpeaking || Date() <= speakingUntil
        if text.count >= 2 && loudEnough && (!busy || bargeIn(text)) {
            lastHeardDb = Double(peak); lastHeardGate = Double(micGateDb - (btIn ? 12 : 0)); lastHeardBT = btIn
            heard(text)
        } else if text.count >= 2 && !loudEnough && UIApplication.shared.applicationState == .active {
            notifyListeners("status", data: ["text": "🔇 Za cicho (\(Int(peak)) dB): „\(text)” — ustaw wyższą czułość mikrofonu"])
        }
        if listening {
            // zadanie padło od razu bez słów (błąd rozpoznawania) — nie młóć w kółko, odczekaj chwilę
            let quick = text.isEmpty && Date().timeIntervalSince(taskStartedAt) < 1.0
            quickFails = quick ? quickFails + 1 : 0
            let wait = quickFails >= 3 ? min(3.0, 0.5 * Double(quickFails)) : 0.05
            if quickFails >= 6 { quickFails = 0; DispatchQueue.main.asyncAfter(deadline: .now() + wait) { [weak self] in self?.resumeAfterBreak() }; return }
            DispatchQueue.main.asyncAfter(deadline: .now() + wait) { [weak self] in self?.startTask() }
        }
    }

    /// komenda wypowiedziana w trakcie mowy lektora — przyjmij, jeśli to nie echo jego własnych słów
    private func bargeIn(_ text: String) -> Bool {
        let t = norm(text)
        let keys = ["dodaj", "cofnij", "pomylka", "wyjechal", "pojechal", "jazda", "zalany", "zalane", "kolejny", "jeszcze jeden", "plus jeden", "jeszcze nie", "nie ma", "kosz jest", "jest kosz", "kibel jest", "mamy", "tak jest", "ile zostalo", "ile koszy", "ile wylano", "pelny", "pol kosza", "trzy czwarte", "cwierc", "przelany", "gruszka pusta", "wlano", "slyszysz"]
        guard let k = keys.first(where: { t.contains($0) }) else { return false }
        return !sayingNow.contains(k)
    }

    private func heard(_ text: String) {
        if UIApplication.shared.applicationState == .active {
            notifyListeners("heard", data: ["text": text, "db": lastHeardDb, "gate": lastHeardGate, "conf": lastConf, "bt": lastHeardBT])
        } else {
            handleInBackground(text)
        }
    }

    // MARK: - Przerwania (telefon, Siri, słuchawki)
    @objc private func onInterruption(_ n: Notification) {
        sessionReady = false
        guard let raw = n.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
        DispatchQueue.main.async {
            if type == .began { self.pauseForCall(); self.logBg("przerwa dźwięku (telefon / Siri / inna apka)") }
            else if type == .ended { self.logBg("koniec przerwy — wracam"); DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { self.resumeAfterBreak(); if self.active { self.startKeepAlive(); self.scheduleAsk() } } }
        }
    }
    @objc private func onMediaReset(_ n: Notification) {
        sessionReady = false
        DispatchQueue.main.async { self.resumeAfterBreak() }
    }
    /// Podłączenie / odłączenie słuchawki BT → przestaw mikrofon i wznów słuchanie
    @objc private func onRouteChange(_ n: Notification) {
        guard let raw = n.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: raw),
              reason == .newDeviceAvailable || reason == .oldDeviceUnavailable else { return }
        sessionReady = false
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { self.resumeAfterBreak() }
    }
    // MARK: - Przyciski słuchawki (play/pauza = dodaj kibel, następny = dodaj, poprzedni = cofnij)
    private func setupRemote() {
        let rc = MPRemoteCommandCenter.shared()
        let cmds: [MPRemoteCommand] = [rc.togglePlayPauseCommand, rc.playCommand, rc.pauseCommand, rc.nextTrackCommand, rc.previousTrackCommand, rc.changePlaybackPositionCommand]
        if !remoteReady && nowPlayingOn {
            // przyciski: dodaj / cofnij tylko gdy włączone „przyciski słuchawki” — sama karta nic nie dolicza przypadkiem
            for c in [rc.togglePlayPauseCommand, rc.playCommand, rc.pauseCommand, rc.nextTrackCommand] {
                c.addTarget { [weak self] _ in if self?.headsetButtons == true { self?.heard("dodaj kibel") }; return .success }
            }
            rc.previousTrackCommand.addTarget { [weak self] _ in if self?.headsetButtons == true { self?.heard("cofnij") }; return .success }
            // pasek przewijania na ekranie blokady = poziom betonu w koszu
            rc.changePlaybackPositionCommand.addTarget { [weak self] e in
                guard let self = self, let ev = e as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
                let v = max(0.01, min(self.capacity, ev.positionTime.rounded() / 100))
                self.dose = v
                self.pending.append(["type": "dose", "at": self.nowMs(), "amount": v])
                self.updateNowPlaying()
                return .success
            }
            remoteReady = true
        }
        for c in cmds { c.isEnabled = nowPlayingOn }
        if !nowPlayingOn { cmds.forEach { $0.removeTarget(nil) }; remoteReady = false; MPNowPlayingInfoCenter.default().nowPlayingInfo = nil }
        updateNowPlaying()
    }
    private func updateNowPlaying() {
        guard nowPlayingOn else { return }
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: active ? "Zostało \(fmt(leftM3)) m³ · w koszu \(fmt(dose))" : "BetonKibelPlus",
            MPMediaItemPropertyArtist: active ? (tripLine() + (headsetButtons ? " · ▶ dodaj · ⏮ cofnij" : "")) : "BetonKibelPlus",
            MPMediaItemPropertyPlaybackDuration: max(1.0, capacity * 100),
            MPNowPlayingInfoPropertyElapsedPlaybackTime: max(0, min(capacity, dose)) * 100,
            MPNowPlayingInfoPropertyPlaybackRate: 0.0
        ]
        if active { info[MPMediaItemPropertyArtwork] = lockArtwork() }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }
    /// obrazek kosza z poziomem betonu na ekran blokady
    private func lockArtwork() -> MPMediaItemArtwork {
        let size = CGSize(width: 600, height: 600)
        let left = leftM3, d = dose, cap = capacity
        let img = UIGraphicsImageRenderer(size: size).image { ctx in
            let g = ctx.cgContext
            UIColor(red: 0.03, green: 0.08, blue: 0.12, alpha: 1).setFill(); g.fill(CGRect(origin: .zero, size: size))
            let cyan = UIColor(red: 0.13, green: 0.83, blue: 0.93, alpha: 1)
            let top: CGFloat = 170, bot: CGFloat = 540
            let path = UIBezierPath()
            path.move(to: CGPoint(x: 90, y: top)); path.addLine(to: CGPoint(x: 510, y: top))
            path.addLine(to: CGPoint(x: 390, y: bot)); path.addLine(to: CGPoint(x: 210, y: bot)); path.close()
            UIColor(white: 0.18, alpha: 1).setFill(); path.fill()
            let f = CGFloat(cap > 0 ? max(0, min(1, d / cap)) : 0)
            let fy = bot - (bot - top) * f
            g.saveGState(); path.addClip()
            cyan.withAlphaComponent(0.85).setFill(); g.fill(CGRect(x: 0, y: fy, width: size.width, height: bot - fy))
            g.restoreGState()
            cyan.setStroke(); path.lineWidth = 10; path.stroke()
            let para = NSMutableParagraphStyle(); para.alignment = .center
            let a1: [NSAttributedString.Key: Any] = [.font: UIFont.systemFont(ofSize: 66, weight: .black), .foregroundColor: UIColor.white, .paragraphStyle: para]
            let a2: [NSAttributedString.Key: Any] = [.font: UIFont.systemFont(ofSize: 96, weight: .black), .foregroundColor: UIColor.white, .paragraphStyle: para]
            ("Zostało \(self.fmt(left)) m³" as NSString).draw(in: CGRect(x: 0, y: 40, width: size.width, height: 90), withAttributes: a1)
            (self.fmt(d) as NSString).draw(in: CGRect(x: 0, y: 290, width: size.width, height: 120), withAttributes: a2)
        }
        return MPMediaItemArtwork(boundsSize: size) { _ in img }
    }
    // MARK: - Licznik na ekranie blokady (cicha, podmieniana notyfikacja)
    @objc private func onBackground() { DispatchQueue.main.async { self.logBg("ekran zgaszony / apka w tle"); self.postStatus(); self.startKeepAlive(); self.lockRefresh(); self.scheduleAsk() } }
    @objc private func onForeground() { DispatchQueue.main.async { self.logBg("apka na ekranie"); self.clearStatus(); if !self.nowPlayingOn { self.stopKeepAlive() }; self.updateNowPlaying() } }

    // MARK: - Praca w tle bez mikrofonu: cichy dźwięk trzyma apkę przy życiu, żeby pytała o kosz i liczyła czas
    private var keepPlayer: AVAudioPlayer?
    private func silentWav() -> Data {
        let rate: UInt32 = 8000, samples = rate  // 1 s ciszy
        var d = Data()
        func u32(_ v: UInt32) { var x = v.littleEndian; d.append(Data(bytes: &x, count: 4)) }
        func u16(_ v: UInt16) { var x = v.littleEndian; d.append(Data(bytes: &x, count: 2)) }
        d.append("RIFF".data(using: .ascii)!); u32(36 + samples * 2); d.append("WAVE".data(using: .ascii)!)
        d.append("fmt ".data(using: .ascii)!); u32(16); u16(1); u16(1); u32(rate); u32(rate * 2); u16(2); u16(16)
        d.append("data".data(using: .ascii)!); u32(samples * 2); d.append(Data(count: Int(samples * 2)))
        return d
    }
    private func startKeepAlive() {
        guard active, !inCall, keepPlayer?.isPlaying != true else { return }
        // mikrofon trzyma apkę w tle, ale ekran blokady (karta „teraz odtwarzane”) pokazuje się tylko,
        // gdy apka coś GRA — więc przy pilocie cichy dźwięk leci zawsze
        if engine.isRunning && !nowPlayingOn { return }
        do {
            try configureSession()
            let p = try AVAudioPlayer(data: silentWav())
            p.numberOfLoops = -1; p.volume = nowPlayingOn ? 0.01 : 0   // dane to cisza — nic nie słychać
            p.prepareToPlay(); p.play()
            keepPlayer = p
        } catch { }
        lockRefresh()
    }
    /// karta na ekranie blokady potrafi zniknąć (inna apka, zmiana sesji) — odświeżamy ją co 15 s w tle
    private var lockTimer: Timer?
    private func lockRefresh() {
        guard nowPlayingOn, active else { lockTimer?.invalidate(); lockTimer = nil; return }
        UIApplication.shared.beginReceivingRemoteControlEvents()
        setupRemote()
        if lockTimer == nil {
            lockTimer = Timer.scheduledTimer(withTimeInterval: 15, repeats: true) { [weak self] _ in
                guard let self = self else { return }
                if !self.active || !self.nowPlayingOn { self.lockTimer?.invalidate(); self.lockTimer = nil; return }
                if UIApplication.shared.applicationState != .active && self.keepPlayer?.isPlaying != true && !self.inCall { self.startKeepAlive() }
                self.updateNowPlaying()
            }
        }
    }
    private func stopKeepAlive() { keepPlayer?.stop(); keepPlayer = nil }
    /// krótko dla karty na ekranie blokady: kurs i kiedy pytanie (godzina — nie trzeba odświeżać co sekundę)
    private func tripLine() -> String {
        var t = "Kurs \(kursy)"
        if method != "taczka" {
            if phase == "away" && deadline > nowMs() {
                let f = DateFormatter(); f.dateFormat = "HH:mm"
                t += " · pytam ok. \(f.string(from: Date(timeIntervalSince1970: deadline / 1000)))"
            } else if phase == "late" { t += " · czekam na kosz" }
            else { t += " · kosz na miejscu" }
        }
        return t
    }
    private func statusLine() -> String {
        var trip = ""
        if method != "taczka" {
            if phase == "away" { let s = max(0, Int((deadline - nowMs()) / 1000)); trip = s > 0 ? " · kosz w drodze (\(s / 60):\(String(format: "%02d", s % 60)))" : " · kosz powinien już być" }
            else if phase == "late" { trip = " · czekam na kosz" }
            else { trip = " · kosz na miejscu" }
        }
        return "Wylano \(fmt(poured)) z \(fmt(loadM3)) m³" + trip
    }
    private func postStatus() {
        guard lockStatus, active else { clearStatus(); return }
        let c = UNMutableNotificationContent()
        c.title = "🏗 Zostało \(fmt(leftM3)) m³" + (site.isEmpty ? "" : " · \(site)")
        c.body = statusLine()
        c.sound = nil
        c.threadIdentifier = "bkp-status"
        if #available(iOS 15.0, *) { c.interruptionLevel = .passive; c.relevanceScore = 1 }
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: "bkp-status", content: c, trigger: nil))
    }
    /// seria przypomnień „Czy kosz już jest?” (powiadomienia 2101…2112) — kasujemy, gdy kosz zaznaczony w tle
    /// mocna wibracja 3× (działa też przy zablokowanym ekranie, gdy apka słucha w tle)
    private func vibrateBurst() {
        for i in 0..<3 {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.7) { AudioServicesPlaySystemSound(kSystemSoundID_Vibrate) }
        }
    }
    private func cancelAskChain() {
        let ids = (0..<36).map { String(2101 + $0) }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ids)
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: ids)
    }
    /// mikrofon / lektorka nie wróciły same — powiadomienie, żeby jednym dotknięciem wrócić do apki
    private var brokeAt: Date = .distantPast
    private func brokeNotice() {
        guard Date().timeIntervalSince(brokeAt) > 120 else { return }
        brokeAt = Date()
        let c = UNMutableNotificationContent()
        c.title = "🎤 Mikrofon stanął"
        c.body = "Dotknij, żeby wrócić — wtedy znowu słucham i pytam o kosz."
        c.sound = .default
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: "bkp-broke", content: c, trigger: nil))
    }
    private func clearStatus() {
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: ["bkp-status"])
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["bkp-status"])
    }

    /// muzyka intro z paczki aplikacji — gra od razu przy starcie, bez czekania na dotknięcie ekranu
    @objc func playIntro(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let vol = Float(max(0, min(1, call.getDouble("volume") ?? 0.9)))
            var name = (call.getString("file") ?? "intro_voice").replacingOccurrences(of: "/", with: "")
            if name.isEmpty { name = "intro_voice" }
            func find(_ n: String) -> URL? {
                if let u = Bundle.main.url(forResource: n, withExtension: "mp3", subdirectory: "public/sounds")
                    ?? Bundle.main.url(forResource: n, withExtension: "mp3", subdirectory: "public")
                    ?? Bundle.main.url(forResource: n, withExtension: "mp3") { return u }
                if let root = Bundle.main.resourcePath {
                    for rel in ["public/sounds/\(n).mp3", "sounds/\(n).mp3", "www/sounds/\(n).mp3"] {
                        let path = (root as NSString).appendingPathComponent(rel)
                        if FileManager.default.fileExists(atPath: path) { return URL(fileURLWithPath: path) }
                    }
                }
                return nil
            }
            let url = find(name) ?? find("intro_voice")
            guard let u = url else { call.resolve(["ok": false]); return }
            do {
                let ses = AVAudioSession.sharedInstance()
                if !self.listening { try? ses.setCategory(.playback, mode: .default, options: [.mixWithOthers]) }
                try? ses.setActive(true, options: [])
                let p = try AVAudioPlayer(contentsOf: u)
                p.volume = vol; p.prepareToPlay()
                guard p.play() else { call.resolve(["ok": false]); return }
                self.introPlayer = p
                call.resolve(["ok": true, "duration": p.duration])
            } catch {
                call.resolve(["ok": false])
            }
        }
    }
    @objc func stopIntro(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let p = self.introPlayer {
                p.setVolume(0, fadeDuration: 0.4)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) { p.stop(); if self.introPlayer === p { self.introPlayer = nil } }
            }
            call.resolve()
        }
    }

    @objc func haptic(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let kind = call.getString("kind") ?? "success"
            if kind == "light" { UIImpactFeedbackGenerator(style: .medium).impactOccurred() }
            else { UINotificationFeedbackGenerator().notificationOccurred(kind == "warning" ? .warning : .success) }
            call.resolve()
        }
    }

    @objc private func onEngineConfig(_ n: Notification) {
        DispatchQueue.main.async { self.resumeAfterBreak() }
    }
    private func resumeAfterBreak() {
        guard listening, !inCall else { return }
        do {
            try configureSession()
            try startEngine()
            startTask()
        } catch {
            notifyListeners("status", data: ["text": "Mikrofon przerwany: \(error.localizedDescription)"])
            logBg("mikrofon nie wstał: \(error.localizedDescription)")
            if UIApplication.shared.applicationState != .active && active { brokeNotice() }
        }
    }

    // MARK: - Lektor
    @objc func configure(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let t = call.getObject("texts") {
                var out: [String: String] = [:]
                for (k, v) in t { if let s = v as? String { out[k] = s } }
                self.texts = out
            }
            if let v = call.getString("voiceId") { self.voiceId = v }
            if let r = call.getDouble("rate") { self.rate = Float(max(0.3, min(0.65, r))) }
            if let p = call.getDouble("pitch") { self.pitch = Float(max(0.5, min(2.0, p))) }
            if let u = call.getBool("useClips") { self.useClips = u }
            if let e = call.getBool("elOn") { self.elOn = e }
            if let g = call.getString("elTag") { self.elTag = g }
            if let v = call.getDouble("remindSec") { self.remindSec = max(10, v) }
            if let v = call.getInt("remindMax") { self.remindMax = max(0, v) }
            if let v = call.getDouble("elSpeed") { self.elSpeed = max(0.7, min(1.2, v)) }
            if let v = call.getDouble("elStab") { self.elStab = v }
            if let v = call.getDouble("elSim") { self.elSim = v }
            if let k = call.getString("elKey") { self.elKey = k }
            if let v = call.getString("elVoice") { self.elVoice = v }
            if let m = call.getString("elModel"), !m.isEmpty { self.elModel = m }
            if let ao = call.getBool("askOnly") { self.askOnly = ao }
            if let lv = call.getBool("loudVoice") { self.loudVoice = lv }
            if let bv = call.getBool("boostVolume") { self.boostVolume = bv }
            if let tv = call.getDouble("targetVolume") { self.targetVolume = Float(max(0.3, min(1.0, tv))) }
            if let g = call.getDouble("micGate") { self.micGateDb = Float(g) }
            if let o = call.getBool("offlineSpeech") { self.offlineSpeech = o }
            if let ls = call.getBool("lockStatus") { self.lockStatus = ls; if !ls { self.clearStatus() } }
            if let k = call.getBool("keepAwake") { self.keepAwake = k; UIApplication.shared.isIdleTimerDisabled = k && self.active }
            if let lc = call.getBool("lockCard"), lc != self.lockCard { self.lockCard = lc; let rc = MPRemoteCommandCenter.shared(); [rc.togglePlayPauseCommand, rc.playCommand, rc.pauseCommand, rc.nextTrackCommand, rc.previousTrackCommand, rc.changePlaybackPositionCommand].forEach { $0.removeTarget(nil) }; self.remoteReady = false; self.setupRemote(); if self.listening { try? self.configureSession() } }
            if let hb = call.getBool("headsetButtons"), hb != self.headsetButtons { self.headsetButtons = hb; self.setupRemote(); if self.listening { try? self.configureSession() } }
            if let v = call.getBool("voiceOn") { self.voiceOn = v }
            call.resolve()
        }
    }

    @objc func speak(_ call: CAPPluginCall) {
        let text = call.getString("text") ?? ""
        let key = call.getString("key")
        let interrupt = call.getBool("interrupt") ?? true
        DispatchQueue.main.async {
            if interrupt { self.stopSpeech() }
            self.say(key: key, text: text, force: true)
            call.resolve()
        }
    }

    @objc func stopSpeaking(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.stopSpeech(); call.resolve() }
    }

    private func stopSpeech() {
        sayQueue.removeAll()
        if synth.isSpeaking { synth.stopSpeaking(at: .immediate) }
        player?.stop(); player = nil
        isSpeaking = false
    }

    @objc func getVoices(_ call: CAPPluginCall) {
        let list = AVSpeechSynthesisVoice.speechVoices()
            .filter { $0.language.lowercased().hasPrefix("pl") }
            .map { v -> [String: Any] in
                return ["id": v.identifier, "name": v.name, "lang": v.language, "quality": self.qualityName(v)]
            }
        call.resolve(["voices": list, "best": bestPolishVoice()?.identifier ?? ""])
    }

    private func qualityName(_ v: AVSpeechSynthesisVoice) -> String {
        if #available(iOS 16.0, *) { if v.quality == .premium { return "premium" } }
        return v.quality == .enhanced ? "enhanced" : "default"
    }

    private func bestPolishVoice() -> AVSpeechSynthesisVoice? {
        let pl = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.lowercased().hasPrefix("pl") }
        func score(_ v: AVSpeechSynthesisVoice) -> Int {
            switch qualityName(v) { case "premium": return 3; case "enhanced": return 2; default: return 1 }
        }
        return pl.max(by: { score($0) < score($1) }) ?? AVSpeechSynthesisVoice(language: "pl-PL")
    }

    /// Kolejka: najpierw własne nagranie (jeśli jest), inaczej głos iPhone'a.
    private func say(key: String?, text: String?, force: Bool = false) {
        if inCall { if key == "ask" || key == "remind" { logBg("lektorka milczy — trwa rozmowa") }; return } // podczas rozmowy lektor milczy
        if !voiceOn && !force { if key == "ask" || key == "remind" { logBg("lektorka wyciszona — pytanie tylko na ekranie") }; return }
        var key = key
        if askOnly && !force, let k = key, !(k == "ask" || k == "remind" || k == "heardOk" || k.hasPrefix("added") || k.hasPrefix("report")) {
            // tylko pytanie o kosz + odpowiedzi; reakcja na komendę = krótkie potwierdzenie „Przyjęłam”
            if ["late", "arrived", "undo", "depart", "fullBucket", "halfBucket"].contains(k) && text == nil { key = "heardOk" } else { return }
        }
        let t = (text?.isEmpty == false ? text! : pick(key))
        let clip = key.map { hasClip($0) } ?? false
        if t.isEmpty && !clip { return }
        sayQueue.append((key, t))
        if !isSpeaking { nextSay() }
    }

    private var lastPick: [String: Int] = [:]
    /// Każda linia tekstu = osobny wariant; losuje bez powtórzenia poprzedniego.
    private func pick(_ key: String?) -> String {
        guard let base = key else { return "" }
        let sfx = method == "taczka" ? "_taczka" : (method == "inne" ? "_koparka" : "")
        let k = (!sfx.isEmpty && !(texts[base + sfx] ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) ? base + sfx : base
        guard let raw = texts[k] else { return "" }
        let lines = raw.split(separator: "\n").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        if lines.isEmpty { return "" }
        var i = Int.random(in: 0..<lines.count)
        if lines.count > 1 && i == lastPick[k] { i = (i + 1) % lines.count }
        lastPick[k] = i
        return lines[i]
    }
    private func report(_ key: String, _ value: String, _ fallback: String) {
        let base = pick(key)
        say(key: key + "_n", text: (base.isEmpty ? fallback : base).replacingOccurrences(of: "X", with: value))
    }

    private func nextSay() {
        guard !sayQueue.isEmpty else {
            isSpeaking = false
            speakingUntil = Date().addingTimeInterval(0.5)
            notifyListeners("spoken", data: [:])
            return
        }
        let item = sayQueue.removeFirst()
        isSpeaking = true
        speakStartedAt = Date()
        sayingNow = norm(item.text)
        volumeUp()
        if useClips, let k = item.key, hasClip(k) {
            do {
                try configureSession()
                let p = try AVAudioPlayer(contentsOf: clipURL(k))
                p.delegate = self
                player = p
                if p.play() { return }
            } catch { }
        }
        if item.text.isEmpty { nextSay(); return }
        if elOn, !elTag.isEmpty {
            let f = voiceURL(item.text)
            if FileManager.default.fileExists(atPath: f.path), playFile(f) { return }
            // brak gotowego nagrania (np. odpowiedź z liczbą) — pobierz głos ElevenLabs na bieżąco, max 4 s
            if !elKey.isEmpty, !elVoice.isEmpty {
                elLive(item.text, to: f) { [weak self] ok in
                    guard let self = self, self.isSpeaking, !self.inCall else { return }
                    if ok, self.playFile(f) { return }
                    self.speakSystem(item.text)
                }
                return
            }
        }
        speakSystem(item.text)
    }

    private func playFile(_ f: URL) -> Bool {
        do {
            try configureSession()
            let p = try AVAudioPlayer(contentsOf: f)
            p.delegate = self
            player = p
            return p.play()
        } catch { return false }
    }

    private func elLive(_ text: String, to file: URL, done: @escaping (Bool) -> Void) {
        let v = elVoice.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? elVoice
        guard let url = URL(string: "https://api.elevenlabs.io/v1/text-to-speech/\(v)?output_format=mp3_44100_128") else { done(false); return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.timeoutInterval = 4
        req.setValue(elKey, forHTTPHeaderField: "xi-api-key")
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("audio/mpeg", forHTTPHeaderField: "Accept")
        var body: [String: Any] = ["text": text, "model_id": elModel, "voice_settings": ["stability": elStab, "similarity_boost": elSim, "speed": elSpeed]]
        if elModel.contains("turbo_v2_5") || elModel.contains("flash_v2_5") { body["language_code"] = "pl" }
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req) { data, resp, _ in
            let ok = (resp as? HTTPURLResponse)?.statusCode == 200 && (data?.count ?? 0) > 300
            if ok, let d = data { try? d.write(to: file) }
            DispatchQueue.main.async { done(ok) }
        }.resume()
    }

    private func speakSystem(_ text: String) {
        try? configureSession()
        let u = AVSpeechUtterance(string: text)
        u.voice = (voiceId.isEmpty ? nil : AVSpeechSynthesisVoice(identifier: voiceId)) ?? bestPolishVoice()
        u.rate = min(0.6, max(0.44, rate))
        u.pitchMultiplier = min(1.06, max(0.94, pitch))
        u.volume = 1.0
        u.preUtteranceDelay = 0.05
        u.postUtteranceDelay = 0.12
        synth.speak(u)
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { self.nextSay() }
    }
    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { if self.isSpeaking { self.nextSay() } }
    }
    public func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        DispatchQueue.main.async { self.player = nil; self.nextSay() }
    }

    // MARK: - Nagrania własne
    private func clipsDir() -> URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("clips", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }
    private func safeKey(_ key: String) -> String {
        let allowed = key.unicodeScalars.filter { CharacterSet.alphanumerics.contains($0) || $0 == "_" || $0 == "-" }
        return String(String.UnicodeScalarView(allowed))
    }
    private func clipURL(_ key: String) -> URL {
        return clipsDir().appendingPathComponent(safeKey(key) + ".m4a")
    }
    private func hasClip(_ key: String) -> Bool {
        return FileManager.default.fileExists(atPath: clipURL(key).path)
    }

    @objc func startRecording(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), !safeKey(key).isEmpty else { call.reject("Brak nazwy komunikatu"); return }
        DispatchQueue.main.async {
            self.stopSpeech()
            self.resumeListeningAfterRecording = self.listening
            if self.listening { self.stopAll() }
            do {
                try self.configureSession()
                let settings: [String: Any] = [
                    AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                    AVSampleRateKey: 44100,
                    AVNumberOfChannelsKey: 1,
                    AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
                ]
                let tmp = self.clipsDir().appendingPathComponent("_nagrywanie.m4a")
                try? FileManager.default.removeItem(at: tmp)
                let r = try AVAudioRecorder(url: tmp, settings: settings)
                self.recorder = r
                self.recordingKey = key
                if !r.record() { throw NSError(domain: "DominoNative", code: 2, userInfo: [NSLocalizedDescriptionKey: "Nagrywanie nie wystartowało"]) }
                call.resolve()
            } catch {
                self.recorder = nil; self.recordingKey = nil
                call.reject("Nie mogę nagrywać: \(error.localizedDescription)")
            }
        }
    }

    @objc func stopRecording(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let r = self.recorder, let key = self.recordingKey else { call.reject("Nic nie jest nagrywane"); return }
            let duration = r.currentTime
            r.stop()
            self.recorder = nil; self.recordingKey = nil
            let tmp = self.clipsDir().appendingPathComponent("_nagrywanie.m4a")
            let dest = self.clipURL(key)
            var saved = false
            if duration >= 0.3 {
                try? FileManager.default.removeItem(at: dest)
                saved = (try? FileManager.default.moveItem(at: tmp, to: dest)) != nil
            } else {
                try? FileManager.default.removeItem(at: tmp)
            }
            if self.resumeListeningAfterRecording, self.recognizer != nil {
                self.listening = true
                try? self.configureSession()
                try? self.startEngine()
                self.startTask()
            }
            call.resolve(["saved": saved, "duration": duration])
        }
    }

    @objc func playClip(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Brak nazwy"); return }
        DispatchQueue.main.async {
            guard self.hasClip(key) else { call.resolve(["played": false]); return }
            self.stopSpeech()
            let keep = self.useClips
            self.useClips = true
            self.say(key: key, text: "", force: true)
            self.useClips = keep
            call.resolve(["played": true])
        }
    }

    // MARK: - Lektor ElevenLabs (pobrane nagrania tekstów)
    private func voiceDir() -> URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("elvoice", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }
    /// FNV-1a 32 bit z „tag|tekst” — ta sama nazwa liczona w JS
    private func voiceName(_ text: String) -> String {
        var h: UInt32 = 0x811c9dc5
        for b in (elTag + "|" + text.trimmingCharacters(in: .whitespacesAndNewlines)).utf8 { h ^= UInt32(b); h = h &* 0x01000193 }
        return String(format: "%08x", h)
    }
    private func voiceURL(_ text: String) -> URL { return voiceDir().appendingPathComponent(voiceName(text) + ".mp3") }
    @objc func saveVoice(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), let b64 = call.getString("data"), let data = Data(base64Encoded: b64) else { call.reject("Brak danych"); return }
        let safe = safeKey(name)
        do { try data.write(to: voiceDir().appendingPathComponent(safe + ".mp3")); call.resolve() } catch { call.reject("Nie zapisano") }
    }
    /// Pobranie tekstu głosem ElevenLabs bezpośrednio z iPhone'a (bez ograniczeń przeglądarki/CORS) i zapis do pliku
    @objc func elFetch(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), !key.isEmpty, let voice = call.getString("voice"), !voice.isEmpty,
              let text = call.getString("text"), let name = call.getString("name") else { call.reject("Brak klucza, ID głosu albo tekstu"); return }
        let model = call.getString("model") ?? "eleven_multilingual_v2"
        let v = voice.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? voice
        guard let url = URL(string: "https://api.elevenlabs.io/v1/text-to-speech/\(v)?output_format=mp3_44100_128") else { call.reject("Złe ID głosu"); return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.timeoutInterval = 40
        req.setValue(key, forHTTPHeaderField: "xi-api-key")
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("audio/mpeg", forHTTPHeaderField: "Accept")
        var body: [String: Any] = ["text": text, "model_id": model,
                                   "voice_settings": ["stability": call.getDouble("stab") ?? 0.5, "similarity_boost": call.getDouble("sim") ?? 0.75, "speed": call.getDouble("speed") ?? 1.0]]
        if model.contains("turbo_v2_5") || model.contains("flash_v2_5") { body["language_code"] = "pl" }
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req) { data, resp, err in
            if let err = err { call.reject("Brak połączenia z ElevenLabs: \(err.localizedDescription)"); return }
            let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
            guard code == 200, let d = data, d.count > 300 else {
                var msg = "ElevenLabs błąd \(code)"
                if let d = data, let j = try? JSONSerialization.jsonObject(with: d) as? [String: Any] {
                    if let det = j["detail"] as? [String: Any] { msg += ": " + ((det["message"] as? String) ?? (det["status"] as? String) ?? "") }
                    else if let det = j["detail"] as? String { msg += ": " + det }
                }
                call.reject(msg); return
            }
            do { try d.write(to: self.voiceDir().appendingPathComponent(self.safeKey(name) + ".mp3")); call.resolve(["ok": true, "bytes": d.count]) }
            catch { call.reject("Nie udało się zapisać pliku głosu") }
        }.resume()
    }
    /// Ogólne zapytanie do API ElevenLabs (biblioteka głosów, dodawanie głosu) — bez CORS.
    @objc func elApi(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), !key.isEmpty, let path = call.getString("path"), path.hasPrefix("/v1/"),
              let url = URL(string: "https://api.elevenlabs.io" + path) else { call.reject("Brak klucza albo złe zapytanie"); return }
        var req = URLRequest(url: url)
        req.httpMethod = call.getString("method") ?? "GET"; req.timeoutInterval = 30
        req.setValue(key, forHTTPHeaderField: "xi-api-key")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if let body = call.getString("body") { req.setValue("application/json", forHTTPHeaderField: "Content-Type"); req.httpBody = body.data(using: .utf8) }
        URLSession.shared.dataTask(with: req) { data, resp, err in
            if let err = err { call.reject("Brak połączenia z ElevenLabs: \(err.localizedDescription)"); return }
            let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
            call.resolve(["status": code, "body": data.flatMap { String(data: $0, encoding: .utf8) } ?? ""])
        }.resume()
    }
    @objc func listVoice(_ call: CAPPluginCall) {
        let files = (try? FileManager.default.contentsOfDirectory(atPath: voiceDir().path)) ?? []
        call.resolve(["names": files.filter { $0.hasSuffix(".mp3") }.map { String($0.dropLast(4)) }])
    }
    @objc func clearVoice(_ call: CAPPluginCall) {
        try? FileManager.default.removeItem(at: voiceDir())
        call.resolve()
    }

    @objc func listClips(_ call: CAPPluginCall) {
        let files = (try? FileManager.default.contentsOfDirectory(atPath: clipsDir().path)) ?? []
        let keys = files.filter { $0.hasSuffix(".m4a") && !$0.hasPrefix("_") }.map { String($0.dropLast(4)) }
        call.resolve(["keys": keys])
    }

    @objc func deleteClip(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("Brak nazwy"); return }
        try? FileManager.default.removeItem(at: clipURL(key))
        call.resolve()
    }

    // MARK: - Stan i obsługa w tle
    @objc func setState(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.active = call.getBool("active") ?? false
            self.site = call.getString("site") ?? ""
            UIApplication.shared.isIdleTimerDisabled = (self.keepAwake && self.active) || self.savedBrightness >= 0
            self.method = call.getString("method") ?? "kibel"
            self.phase = call.getString("phase") ?? "ready"
            self.deadline = call.getDouble("deadline") ?? 0
            self.departed = call.getDouble("departed") ?? 0
            self.meanTripSec = max(10, call.getDouble("meanTripSec") ?? 120)
            self.dose = call.getDouble("dose") ?? 0.5
            self.capacity = max(0.05, call.getDouble("capacity") ?? self.dose)
            self.leftM3 = call.getDouble("left") ?? 0
            self.poured = call.getDouble("poured") ?? 0
            self.loadM3 = call.getDouble("load") ?? 0
            if let lt = call.getDouble("lastTruck"), lt > 0 { self.loadM3First = lt }
            if let la = call.getDouble("lastAmount") { self.lastAdd = la }
            if let k = call.getInt("kursy") { self.kursy = k }
            if let f = call.getArray("fired", String.self) { self.fired = Set(f) }
            self.scheduleAsk()
            self.updateNowPlaying()
            if !self.active { self.clearStatus() } else if UIApplication.shared.applicationState != .active { self.postStatus() }
            call.resolve()
        }
    }

    @objc func drainEvents(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let out = self.pending
            self.pending.removeAll()
            call.resolve(["events": out])
        }
    }

    private func nowMs() -> Double { return Date().timeIntervalSince1970 * 1000 }

    private func scheduleAsk() {
        askTimer?.invalidate(); askTimer = nil
        guard active, method != "taczka", (phase == "away" || phase == "late"), deadline > 0 else { return }
        let delay = max(0.5, (deadline - nowMs()) / 1000)
        askTimer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in self?.askFired() }
    }

    /// Termin powrotu kosza minął. Na pierwszym planie zajmuje się tym JS; w tle — moduł natywny.
    private func askFired() {
        guard active, phase == "away" || phase == "late" else { return }
        if UIApplication.shared.applicationState == .active {
            // na pierwszym planie pyta JS; ale jak telefon zaraz zgaśnie, pytanie nie może przepaść — sprawdzam ponownie za 5 s
            askTimer?.invalidate()
            askTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: false) { [weak self] _ in self?.askFired() }
            return
        }
        if inCall { logBg("pytanie o kosz pominięte — rozmowa telefoniczna"); deadline = nowMs() + 20000; scheduleAsk(); return }
        let first = phase == "away"
        phase = "late"
        reminders += 1
        if !first && reminders > remindMax + 1 { deadline = 0; logBg("limit przypomnień — dalej cisza (ustaw „Często”, żeby pytała do skutku)"); return }
        logBg(first ? "pytam: czy kosz wrócił?" : "przypominam o koszu (\(reminders - 1))")   // limit przypomnień — dalej cisza, pytanie czeka na ekranie
        deadline = nowMs() + remindSec * 1000
        pending.append(["type": "alarm", "at": nowMs()])
        say(key: first ? "ask" : "remind", text: nil)
        vibrateBurst()
        if reminders <= remindMax { scheduleAsk() }
    }

    private func norm(_ s: String) -> String {
        let x = s.lowercased().replacingOccurrences(of: "ł", with: "l")
        let folded = x.folding(options: .diacriticInsensitive, locale: Locale(identifier: "pl_PL"))
        let cleaned = folded.unicodeScalars.map { CharacterSet.letters.contains($0) || CharacterSet.decimalDigits.contains($0) ? Character($0) : " " }
        return " " + String(cleaned).split(separator: " ").joined(separator: " ") + " "
    }
    private func has(_ t: String, _ phrases: [String]) -> Bool {
        return phrases.contains { t.contains(" " + $0 + " ") }
    }
    private func fmt(_ v: Double) -> String {
        let f = NumberFormatter()
        f.locale = Locale(identifier: "pl_PL")
        f.maximumFractionDigits = 2
        f.minimumFractionDigits = 0
        return f.string(from: NSNumber(value: (v * 100).rounded() / 100)) ?? String(v)
    }

    /// „wlano 0,7”, „0/3”, „0 3”, „zero trzy”, „zero przecinek siedem” → liczba
    private func spokenAmount(_ raw: String) -> Double? {
        let low = raw.lowercased()
        if let r = low.range(of: "\\d+\\s*[,./\\\\ ]\\s*\\d{1,2}", options: .regularExpression) {
            let digits = low[r].components(separatedBy: CharacterSet.decimalDigits.inverted).filter { !$0.isEmpty }
            if digits.count == 2, let v = Double(digits[0] + "." + digits[1]) { return v }
        }
        if let r = low.range(of: "\\d+", options: .regularExpression), let v = Double(low[r]), v > 0, v <= 5 { return v }
        let t = norm(raw)
        if t.contains(" pol ") || t.contains(" pol metra ") { return 0.5 }
        let dict = ["zero": "0", "jeden": "1", "dwa": "2", "trzy": "3", "cztery": "4", "piec": "5", "szesc": "6", "siedem": "7", "osiem": "8", "dziewiec": "9"]
        let words = t.split(separator: " ").map(String.init).filter { dict[$0] != nil || $0 == "przecinek" }
        if words.first == "zero", words.count >= 2 {
            let tail = words.dropFirst().filter { $0 != "przecinek" }.compactMap { dict[$0] }.joined()
            if !tail.isEmpty { return Double("0." + tail) }
        }
        return nil
    }

    private func handleInBackground(_ raw: String) {
        let t = norm(raw)
        let now = nowMs()
        guard active else { return }
        let w = t.split(separator: " ")
        if w.count > 7 { return handleInBackground(w.suffix(6).joined(separator: " ")) }  // długa wypowiedź — komenda zwykle na końcu
        let waiting = phase == "away" || phase == "late"
        // „zapytaj za 2 minuty” przy zablokowanym ekranie
        if waiting && method != "taczka" && has(t, ["zapytaj za", "spytaj za", "przypomnij za", "odezwij sie za", "za minute", "za dwie minuty", "za trzy minuty", "za piec minut", "za pol minuty"]) {
            var sec = 120.0
            if t.contains("pol minuty") { sec = 30 } else if t.contains("minute") && !t.contains("minuty") && !t.contains("minut ") { sec = 60 }
            let words: [String: Double] = ["jedna": 1, "dwie": 2, "dwa": 2, "trzy": 3, "cztery": 4, "piec": 5, "szesc": 6, "siedem": 7, "osiem": 8, "dziesiec": 10]
            if let m = t.range(of: "\\d+", options: .regularExpression), let v = Double(t[m]) { sec = t.contains("sekund") ? v : v * 60 }
            else { for (w, v) in words where t.contains(" " + w + " ") || t.hasSuffix(" " + w) || t.contains("za " + w) { sec = t.contains("sekund") ? v : v * 60; break } }
            sec = min(900, max(15, sec))
            phase = "late"; deadline = now + sec * 1000; reminders = 0
            pending.append(["type": "snooze", "at": now, "sec": sec]); postStatus()
            say(key: "late", text: "Okej, zapytam za \(Int(sec) >= 60 ? "\(Int(sec / 60)) min" : "\(Int(sec)) sekund").")
            scheduleAsk()
            return
        }
        if waiting && !t.contains(" ile ") && has(t, ["nie", "nie ma", "jeszcze nie", "nie wrocil", "nie przyjechal", "nie dojechal", "nie jest", "jeszcze go nie ma", "jeszcze jedzie", "jedzie", "w drodze", "czekaj", "zaraz", "moment", "chwila", "nie widac"]) {
            guard method != "taczka" else { return }
            phase = "late"; deadline = now + 30000
            pending.append(["type": "delay", "at": now]); postStatus()
            say(key: "late", text: nil)
            scheduleAsk()
        } else if has(t, ["cofnij", "anuluj", "usun ostatni", "usun", "cofnij ostatni", "wycofaj", "odejmij", "minus jeden", "pomylka", "blad", "skasuj", "skasuj ostatni"]) {
            pending.append(["type": "undo", "at": now])
            say(key: "undo", text: nil)
        } else if has(t, ["ile zostalo", "ile betonu zostalo", "stan betonu", "ile jeszcze", "ile do konca", "ile brakuje", "ile pozostalo", "ile mamy jeszcze", "ile kubikow zostalo", "ile metrow zostalo", "jaki stan", "ile w gruszce"]) {
            report("reportLeft", fmt(leftM3), "Zostało X metra sześciennego.")
        } else if has(t, ["ile wylano", "ile juz wylano", "ile nalano", "ile poszlo", "ile wylalismy", "ile zalalismy", "ile zalane", "ile kubikow poszlo", "ile metrow wylano", "ile mamy wylane", "ile zrobione", "licznik"]) {
            report("reportPoured", fmt(poured), "Wylano X metra sześciennego.")
        } else if has(t, ["ile koszy", "ile kursow", "ile jeszcze koszy", "ile koszy zostalo", "ile kibli", "ile taczek", "ile lyzek", "ile razy jeszcze"]) {
            let d = max(0.01, dose), full = Int((leftM3 / d + 1e-6).rounded(.down)), last = ((leftM3 - Double(full) * d) * 100).rounded() / 100
            let w: (String, String, String) = method == "taczka" ? ("taczka", "taczki", "taczek") : method == "inne" ? ("łyżka", "łyżki", "łyżek") : ("kosz", "kosze", "koszy")
            let pl: (Int) -> String = { n in n == 1 ? w.0 : ((2...4).contains(n % 10) && !(12...14).contains(n % 100)) ? w.1 : w.2 }
            let txt = leftM3 <= 0.0001 ? "nic — koniec betonu" : last >= 0.01 ? (full > 0 ? "\(full) \(pl(full)) i ostatni \(fmt(last)) metra" : "ostatni \(fmt(last)) metra") : "\(full) \(pl(full)) po \(fmt(d)) metra"
            report("reportBuckets", txt, "Zostało jeszcze X.")
        } else if method == "kibel" && has(t, ["gruszka pusta", "pusta gruszka", "koniec gruszki", "gruszka skonczona", "gruszka sie skonczyla", "wylane wszystko", "wszystko wylane"]) {
            pending.append(["type": "truckEmpty", "at": now])
            say(key: nil, text: "Gruszka pusta, przeliczę po odblokowaniu.")
        } else if method == "kibel" && has(t, ["nowa gruszka", "kolejna gruszka", "nastepna gruszka", "druga gruszka", "trzecia gruszka", "przyjechala gruszka", "nowy samochod"]) {
            let m = spokenAmount(raw) ?? 0
            let v = m > 0 && m <= 15 ? m : loadM3First
            pending.append(["type": "newTruck", "at": now, "m3": v])
            leftM3 += v; loadM3 += v
            say(key: nil, text: "Nowa gruszka, \(fmt(v)) metra.")
        } else if method == "kibel" && !has(t, ["dodaj", "plus", "zalany"]), let f = kursFrac(t) {
            pending.append(["type": "lastFrac", "at": now, "frac": f])
            let fv = f == "over" ? 1.1 : (Double(f) ?? 1)
            let amt = (capacity * fv * 1000).rounded() / 1000
            poured += amt - lastAdd; leftM3 = max(0, leftM3 - (amt - lastAdd)); lastAdd = amt
            updateNowPlaying(); postStatus()
            say(key: nil, text: "\(["0.25": "Ćwierć kosza", "0.5": "Pół kosza", "0.75": "Trzy czwarte kosza", "1": "Pełny kosz", "over": "Przelany kosz"][f] ?? "Poprawione"), \(fmt(amt)) metra.")
        } else if has(t, ["pelny kosz", "pelny kibel", "do pelna", "caly kosz", "caly kibel", "pelen kosz", "na full", "pelny"]) {
            dose = capacity; pending.append(["type": "dose", "at": now, "amount": dose]); updateNowPlaying()
            say(key: "fullBucket", text: nil)
        } else if has(t, ["pol kosza", "pol kibla", "polowa kosza", "do polowy", "polowe kosza", "pol taczki", "pol lyzki"]) {
            dose = (capacity / 2 * 100).rounded() / 100; pending.append(["type": "dose", "at": now, "amount": dose]); updateNowPlaying()
            say(key: "halfBucket", text: nil)
        } else if has(t, ["koparka wyjechala", "koparka pojechala", "lyzka pojechala", "kosz wyjechal", "wyjechal", "ruszyl", "kosz ruszyl", "pojechal", "kosz pojechal", "odjechal", "kibel pojechal", "kibel wyjechal"]) {
            guard method != "taczka" else { return }
            departed = now; phase = "away"; deadline = now + meanTripSec * 1000; reminders = 0
            cancelAskChain(); pending.append(["type": "depart", "at": now]); postStatus()
            say(key: "depart", text: nil)
            scheduleAsk()
        } else if has(t, ["dodac", "dodam", "dodaje", "dodajcie", "do daj", "dodaj kosza", "dodaj kibla", "dodaj taczke", "dodaj lyzke", "taczka wylana", "lyzka wylana", "kolejna taczka", "kolejna lyzka", "taczka", "wlano", "wlalem", "wlalismy", "nalalem", "nalalismy", "wlali", "dodaj kibel", "dodaj kosz", "dodaj", "nalicz", "dolej", "zalicz", "zalany", "zalane", "kosz zalany", "kibel zalany", "wlane", "poszlo", "plus jeden", "kolejny"]) {
            guard leftM3 > 0.0001 || method == "kibel" else { return }
            let before = leftM3
            var spoken = spokenAmount(raw)
            if method == "kibel", let f = kursFrac(t) { spoken = capacity * (f == "over" ? 1.1 : (Double(f) ?? 1)) }   // „dodaj pół” = pół kosza
            let want = (spoken ?? 0) > 0 && (spoken ?? 0) <= 5 ? spoken! : dose
            let amount = method == "kibel" ? want : min(want, leftM3)
            lastAdd = amount
            leftM3 = max(0, ((leftM3 - amount) * 100).rounded() / 100)
            poured += amount
            cancelAskChain(); pending.append(["type": "add", "at": now, "amount": amount])
            updateNowPlaying(); postStatus()
            say(key: "added", text: nil)
            var note: String? = nil
            for (thr, key) in [(loadM3 * 0.75, "left75"), (loadM3 * 0.5, "left50"), (3.0, "left3"), (1.5, "left15"), (0.5, "left05")].sorted(by: { $0.0 > $1.0 }) {
                if before > thr + 0.00001 && leftM3 > 0 && leftM3 <= thr + 0.00001 && !fired.contains(key) {
                    fired.insert(key); note = key
                }
            }
            if let n = note { say(key: n, text: nil) }
            if leftM3 <= 0.0001 {
                phase = "ready"; askTimer?.invalidate()
            } else if method != "taczka" {
                departed = now; phase = "away"; deadline = now + meanTripSec * 1000; reminders = 0
                scheduleAsk()
            }
        } else if waiting && has(t, ["koparka jest", "koparka wrocila", "lyzka jest", "lyzka wrocila", "tak", "jest", "juz jest", "kosz jest", "kibel jest", "wrocil", "juz wrocil", "przyjechal", "przybyl", "dojechal", "no jest", "gotowe"]) {
            guard method != "taczka" else { return }
            phase = "returned"; deadline = 0; departed = 0; reminders = 0
            askTimer?.invalidate()
            cancelAskChain(); pending.append(["type": "returned", "at": now]); postStatus()
            say(key: "arrived", text: nil)
        }  // nierozpoznane: cisza (szum z budowy nie ma wywoływać „nie zrozumiałem”)
    }
}
