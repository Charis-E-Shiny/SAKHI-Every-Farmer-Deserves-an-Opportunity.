// Web Speech API wrapper for voice input (farmer listings, grocery lists,
// bulk demands, delivery OTP digits). Chrome/Edge/Android support it;
// elsewhere `supported` is false and callers show a typed fallback.
"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Minimal typings — the Web Speech API is not in TypeScript's DOM lib.
interface SpeechAlternative {
  transcript: string;
}
interface SpeechResult {
  isFinal: boolean;
  0: SpeechAlternative;
}
interface SpeechEvent {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechResult };
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noop = () => () => {};

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone permission was denied. Allow it in your browser settings, or type instead.",
  "service-not-allowed": "Voice input is blocked in this browser. You can type instead.",
  "no-speech": "We didn't hear anything — tap the mic and try again.",
  "audio-capture": "No microphone found.",
  network: "Voice recognition needs an internet connection.",
  "language-not-supported": "This language isn't supported by your browser's voice input — try English or type instead.",
};

/**
 * @param onFinal - called with the full transcript when the user stops speaking
 */
export function useSpeech(onFinal?: (transcript: string) => void) {
  const supported = useSyncExternalStore(noop, () => getCtor() !== null, () => false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const finalRef = useRef("");
  const onFinalRef = useRef(onFinal);
  useEffect(() => {
    onFinalRef.current = onFinal;
  });

  const stop = useCallback(() => recRef.current?.stop(), []);

  /**
   * Starts listening.
   * @param lang - BCP-47 code: hi-IN, kn-IN, ta-IN, te-IN, en-IN
   */
  const start = useCallback((lang: string) => {
    const Ctor = getCtor();
    if (!Ctor) return setError("Voice input isn't supported in this browser — type instead.");
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    finalRef.current = "";
    setInterim("");
    setError(null);
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += `${r[0].transcript} `;
        else text += r[0].transcript;
      }
      setInterim((finalRef.current + text).trim());
    };
    rec.onerror = (e) => {
      if (e.error !== "aborted") setError(ERRORS[e.error] ?? `Voice input error: ${e.error}`);
    };
    rec.onend = () => {
      setListening(false);
      const said = finalRef.current.trim();
      if (said) onFinalRef.current?.(said);
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, interim, error, start, stop, setError };
}

/** Speech languages offered across the app. */
export const SPEECH_LANGS = [
  { code: "hi-IN", label: "हिन्दी" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "en-IN", label: "English" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
] as const;
