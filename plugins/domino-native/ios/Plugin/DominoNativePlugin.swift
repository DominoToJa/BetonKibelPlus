import Foundation
import UIKit
import AVFoundation
import Speech
import MediaPlayer
import UserNotifications
import Capacitor

/// BetonKibelPlus DOMINO — moduł natywny:
/// - ciągłe rozpoznawanie mowy (działa też na zablokowanym ekranie dzięki trybowi audio w tle),
/// - lektor (AVSpeechSynthesizer, najlepszy polski głos) i własne nagrania komunikatów,
/// - gdy aplikacja jest w tle: sam pyta o kosz, obsługuje odpowiedzi i zapisuje zdarzenia
///   do kolejki, którą JS odbiera po powrocie (drainEvents).
@objc(DominoNativePlugin)
public class DominoNativePlugin: CAPPlugin, CAPBridgedPlugin, AVSpeechSynthesizerDelegate, AVAudioPlayerDelegate {
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
        CAPPluginMethod(name: "elFetch", returnType: CAPPluginReturnPromise)
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
    private var askOnly = true
    private var micGateDb: Float = -30      // próg głośności: ciche dźwięki z otoczenia są pomijane
    private var utterPeakDb: Float = -120
    private var voiceProcOn = false
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
    private var leftM3: Double = 0
    private var poured: Double = 0
    private var loadM3: Double = 0
    private var fired: Set<String> = []
    private var askTimer: Timer?
    private var reminders = 0
    private var pending: [[String: Any]] = []

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
        if !headsetButtons { opts.insert(.mixWithOthers) }   // przyciski słuchawki działają tylko bez miksowania
        try s.setCategory(.playAndRecord, mode: .default, options: opts)
        try s.setActive(true, options: [])
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
        if !voiceProcOn {
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
        if rec.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = true }
        if #available(iOS 16.0, *) { req.addsPunctuation = false }
        req.contextualStrings = ["dodaj kibel", "tak jest", "kosz jest", "nie ma", "jeszcze nie", "cofnij",
                                 "kosz wyjechał", "ile zostało", "ile wylano", "pełny kosz", "pół kosza"]
        request = req
        lastPartial = ""
        utterPeakDb = -120
        task = rec.recognitionTask(with: req) { [weak self] result, error in
            DispatchQueue.main.async {
                guard let self = self, gen == self.generation else { return }
                if let r = result {
                    let t = r.bestTranscription.formattedString
                    if t != self.lastPartial { self.lastPartial = t; self.armSilence(gen) }
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

    private func armSilence(_ gen: Int) {
        silenceTimer?.invalidate()
        silenceTimer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: false) { [weak self] _ in
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
        let loudEnough = utterPeakDb >= micGateDb
        utterPeakDb = -120
        if text.count >= 2 && loudEnough && !isSpeaking && Date() > speakingUntil {
            heard(text)
        }
        if listening {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in self?.startTask() }
        }
    }

    private func heard(_ text: String) {
        if UIApplication.shared.applicationState == .active {
            notifyListeners("heard", data: ["text": text])
        } else {
            handleInBackground(text)
        }
    }

    // MARK: - Przerwania (telefon, Siri, słuchawki)
    @objc private func onInterruption(_ n: Notification) {
        guard let raw = n.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
        DispatchQueue.main.async {
            if type == .ended { self.resumeAfterBreak() }
        }
    }
    @objc private func onMediaReset(_ n: Notification) {
        DispatchQueue.main.async { self.resumeAfterBreak() }
    }
    /// Podłączenie / odłączenie słuchawki BT → przestaw mikrofon i wznów słuchanie
    @objc private func onRouteChange(_ n: Notification) {
        guard let raw = n.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: raw),
              reason == .newDeviceAvailable || reason == .oldDeviceUnavailable else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { self.resumeAfterBreak() }
    }
    // MARK: - Przyciski słuchawki (play/pauza = dodaj kibel, następny = dodaj, poprzedni = cofnij)
    private func setupRemote() {
        let rc = MPRemoteCommandCenter.shared()
        let cmds = [rc.togglePlayPauseCommand, rc.playCommand, rc.pauseCommand, rc.nextTrackCommand, rc.previousTrackCommand]
        if !remoteReady && headsetButtons {
            for c in [rc.togglePlayPauseCommand, rc.playCommand, rc.pauseCommand, rc.nextTrackCommand] {
                c.addTarget { [weak self] _ in self?.heard("dodaj kibel"); return .success }
            }
            rc.previousTrackCommand.addTarget { [weak self] _ in self?.heard("cofnij"); return .success }
            remoteReady = true
        }
        for c in cmds { c.isEnabled = headsetButtons }
        if !headsetButtons { cmds.forEach { $0.removeTarget(nil) }; remoteReady = false; MPNowPlayingInfoCenter.default().nowPlayingInfo = nil }
        updateNowPlaying()
    }
    private func updateNowPlaying() {
        guard headsetButtons else { return }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = [
            MPMediaItemPropertyTitle: active ? "Zostało \(fmt(leftM3)) m³" : "BetonKibelPlus",
            MPMediaItemPropertyArtist: "BetonKibelPlus · przycisk = dodaj kibel",
            MPNowPlayingInfoPropertyPlaybackRate: 1.0
        ]
    }
    // MARK: - Licznik na ekranie blokady (cicha, podmieniana notyfikacja)
    @objc private func onBackground() { DispatchQueue.main.async { self.postStatus() } }
    @objc private func onForeground() { DispatchQueue.main.async { self.clearStatus() } }
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
    private func clearStatus() {
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: ["bkp-status"])
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["bkp-status"])
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
        guard listening else { return }
        do {
            try configureSession()
            try startEngine()
            startTask()
        } catch {
            notifyListeners("status", data: ["text": "Mikrofon przerwany: \(error.localizedDescription)"])
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
            if let ao = call.getBool("askOnly") { self.askOnly = ao }
            if let g = call.getDouble("micGate") { self.micGateDb = Float(g) }
            if let ls = call.getBool("lockStatus") { self.lockStatus = ls; if !ls { self.clearStatus() } }
            if let k = call.getBool("keepAwake") { self.keepAwake = k; UIApplication.shared.isIdleTimerDisabled = k && self.active }
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
        if !voiceOn && !force { return }
        var key = key
        if askOnly && !force, let k = key, !(k == "ask" || k == "remind" || k == "heardOk" || k.hasPrefix("added") || k.hasPrefix("report")) {
            // tylko pytanie o kosz + odpowiedzi; reakcja na komendę = krótkie potwierdzenie „Przyjęłam”
            if ["late", "arrived", "undo", "depart"].contains(k) && text == nil { key = "heardOk" } else { return }
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
            speakingUntil = Date().addingTimeInterval(1.3)
            notifyListeners("spoken", data: [:])
            return
        }
        let item = sayQueue.removeFirst()
        isSpeaking = true
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
            if FileManager.default.fileExists(atPath: f.path) {
                do {
                    try configureSession()
                    let p = try AVAudioPlayer(contentsOf: f)
                    p.delegate = self
                    player = p
                    if p.play() { return }
                } catch { }
            }
        }
        try? configureSession()
        let u = AVSpeechUtterance(string: item.text)
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
            UIApplication.shared.isIdleTimerDisabled = self.keepAwake && self.active
            self.method = call.getString("method") ?? "kibel"
            self.phase = call.getString("phase") ?? "ready"
            self.deadline = call.getDouble("deadline") ?? 0
            self.departed = call.getDouble("departed") ?? 0
            self.meanTripSec = max(10, call.getDouble("meanTripSec") ?? 120)
            self.dose = call.getDouble("dose") ?? 0.5
            self.leftM3 = call.getDouble("left") ?? 0
            self.poured = call.getDouble("poured") ?? 0
            self.loadM3 = call.getDouble("load") ?? 0
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
            return
        }
        let first = phase == "away"
        phase = "late"
        reminders += 1
        deadline = nowMs() + 30000
        pending.append(["type": "alarm", "at": nowMs()])
        say(key: first ? "ask" : "remind", text: nil)
        if reminders < 40 { scheduleAsk() }
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
        if t.split(separator: " ").count > 7 { return }  // rozmowa, nie komenda
        let waiting = phase == "away" || phase == "late"
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
        } else if has(t, ["koparka wyjechala", "koparka pojechala", "lyzka pojechala", "kosz wyjechal", "wyjechal", "ruszyl", "kosz ruszyl", "pojechal", "kosz pojechal", "odjechal", "kibel pojechal", "kibel wyjechal"]) {
            guard method != "taczka" else { return }
            departed = now; phase = "away"; deadline = now + meanTripSec * 1000; reminders = 0
            pending.append(["type": "depart", "at": now]); postStatus()
            say(key: "depart", text: nil)
            scheduleAsk()
        } else if has(t, ["dodaj taczke", "dodaj lyzke", "taczka wylana", "lyzka wylana", "kolejna taczka", "kolejna lyzka", "taczka", "wlano", "wlalem", "wlalismy", "nalalem", "nalalismy", "wlali", "dodaj kibel", "dodaj kosz", "dodaj", "nalicz", "dolej", "zalicz", "zalany", "zalane", "kosz zalany", "kibel zalany", "wlane", "poszlo", "plus jeden", "kolejny"]) {
            guard leftM3 > 0.0001 else { return }
            let before = leftM3
            let spoken = spokenAmount(raw)
            let amount = min((spoken ?? 0) > 0 && (spoken ?? 0) <= 5 ? spoken! : dose, leftM3)
            leftM3 = max(0, ((leftM3 - amount) * 100).rounded() / 100)
            poured += amount
            pending.append(["type": "add", "at": now, "amount": amount])
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
            pending.append(["type": "returned", "at": now]); postStatus()
            say(key: "arrived", text: nil)
        }  // nierozpoznane: cisza (szum z budowy nie ma wywoływać „nie zrozumiałem”)
    }
}
