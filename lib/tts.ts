"use client";

import { useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/fetch";

// Strip markdown and clean text before sending to TTS
export function prepareForSpeech(raw: string): string {
  return raw
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .replace(/\$\$([^$]+)\$\$/g, (_, eq) => `the equation: ${eq}`)
    .replace(/\$([^$]+)\$/g, (_, eq) => eq)
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Fetches audio from the /api/tts route and plays it.
 * Returns a cancel() function that stops playback immediately.
 */
export function speakViaAPI(
  text: string,
  onStart: () => void,
  onEnd: () => void
): () => void {
  let audio: HTMLAudioElement | null = null;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    if (audio) {
      audio.pause();
      audio.src = "";
      audio = null;
    }
    onEnd();
  };

  const cleaned = prepareForSpeech(text);
  if (!cleaned) { onEnd(); return cancel; }

  onStart();

  apiFetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: cleaned }),
  })
    .then((res) => {
      if (!res.ok || cancelled) throw new Error("cancelled or failed");
      return res.blob();
    })
    .then((blob) => {
      if (cancelled) return;
      const url = URL.createObjectURL(blob);
      audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        onEnd();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        onEnd();
      };
      audio.play().catch(() => onEnd());
    })
    .catch(() => {
      if (!cancelled) onEnd();
    });

  return cancel;
}

/**
 * React hook — gives components a simple { playing, speak, stop } interface.
 */
export function useTTS() {
  const [playing, setPlaying] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setPlaying(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      stop();
      cancelRef.current = speakViaAPI(
        text,
        () => setPlaying(true),
        () => setPlaying(false)
      );
    },
    [stop]
  );

  return { playing, speak, stop };
}
