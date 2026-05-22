"use client";

// ─── Afrikaans audio ──────────────────────────────────────────────────────────
//
// Klanke and Luister are audio-first: the bank's `audio` field holds the
// Afrikaans string the engine must speak aloud. Product decision (ticket
// "Audio decision"): ship with TTS now, behind this single helper, so it can be
// swapped for recorded, accent-accurate clips later WITHOUT touching the
// components.
//
// Today: `speakAfrikaans` routes through the shared OpenAI TTS pipeline
// (lib/tts.ts) — the same /api/tts route used for English voiceover. The current
// tutor voice reads the Afrikaans text; accent is acceptable-but-not-perfect for
// teaching, which is exactly why this is a swap point.
//
// Later: replace the body of `speakAfrikaansClip` / `prefetchAfrikaans` with a
// lookup of a recorded clip keyed by `ref` (and fall back to TTS when missing).

import { useCallback, useRef, useState } from "react";
import { prefetchTTS, speakViaAPI } from "@/lib/tts";

/** Fire-and-forget warm-up for an Afrikaans string (swap point for recorded clips). */
export function prefetchAfrikaans(text: string, _ref?: string): void {
  if (text) prefetchTTS(text);
}

/**
 * Speak an Afrikaans string aloud. Returns a cancel() function.
 * `ref` is accepted now (unused) so a recorded-clip backend can look the clip up
 * by item ref later without changing call sites.
 */
export function speakAfrikaansClip(
  text: string,
  onStart: () => void,
  onEnd: () => void,
  _ref?: string,
): () => void {
  return speakViaAPI(text, onStart, onEnd);
}

/**
 * Single audio channel for an Afrikaans session. `speak` voices the English
 * scaffolding (instruction / options); `speakAfrikaans` voices the target
 * Afrikaans content. They share one cancel ref so playback never overlaps.
 */
export function useAfrikaansTTS() {
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
      cancelRef.current = speakViaAPI(text, () => setPlaying(true), () => setPlaying(false));
    },
    [stop],
  );

  const speakAfrikaans = useCallback(
    (text: string, ref?: string) => {
      stop();
      cancelRef.current = speakAfrikaansClip(
        text,
        () => setPlaying(true),
        () => setPlaying(false),
        ref,
      );
    },
    [stop],
  );

  return { playing, speak, speakAfrikaans, stop };
}
