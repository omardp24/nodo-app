"use client";

import { useCallback, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | SpeechRecognitionConstructor
    | null;
}

export function useSpeechRecognition(onTranscript: (texto: string) => void) {
  const [soportado] = useState(() => getSpeechRecognitionCtor() !== null);
  const [escuchando, setEscuchando] = useState(false);
  const reconocedorRef = useRef<SpeechRecognitionLike | null>(null);

  const alternar = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    if (escuchando) {
      reconocedorRef.current?.stop();
      setEscuchando(false);
      return;
    }

    const reconocedor = new Ctor();
    reconocedor.lang = "es-ES";
    reconocedor.interimResults = false;
    reconocedor.continuous = false;
    reconocedor.onresult = (event) => {
      const texto = event.results[0]?.[0]?.transcript ?? "";
      if (texto) onTranscript(texto);
    };
    reconocedor.onerror = () => setEscuchando(false);
    reconocedor.onend = () => setEscuchando(false);
    reconocedorRef.current = reconocedor;
    reconocedor.start();
    setEscuchando(true);
  }, [escuchando, onTranscript]);

  return { soportado, escuchando, alternar };
}
