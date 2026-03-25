"use client";

import { useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/fetch";

// ── TTS prefetch cache ─────────────────────────────────────────────────────────
// Keyed by cleaned text. Stores in-flight or resolved blob URL promises so that
// speakViaAPI can play instantly if the audio is already fetched.
const ttsCache = new Map<string, Promise<string>>();

function fetchTTSUrl(cleanedText: string): Promise<string> {
  if (ttsCache.has(cleanedText)) return ttsCache.get(cleanedText)!;
  const promise = apiFetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: cleanedText }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("TTS failed");
      return res.blob();
    })
    .then((blob) => URL.createObjectURL(blob))
    .catch((err) => {
      ttsCache.delete(cleanedText); // allow retry on failure
      throw err;
    });
  ttsCache.set(cleanedText, promise);
  return promise;
}

/**
 * Fire-and-forget: start fetching TTS audio for text before the user presses play.
 * Call when a question or passage loads. Safe to call multiple times — cached.
 */
export function prefetchTTS(text: string): void {
  const cleaned = prepareForSpeech(text);
  if (cleaned) fetchTTSUrl(cleaned).catch(() => {});
}

// Strip markdown and clean text before sending to TTS
export function prepareForSpeech(raw: string): string {
  return raw
    .replace(/\/[a-zA-Z]{1,4}\//g, "")  // Strip phoneme notation: /sh/, /th/, /b/, /æ/, etc.
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

  fetchTTSUrl(cleaned)
    .then((url) => {
      if (cancelled) return;
      audio = new Audio(url);
      audio.onended = () => onEnd();
      audio.onerror = () => onEnd();
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
