"use client";

// HighlightSourceQuestion — learner taps phrases in a source extract that
// match the task (bias, fact-vs-opinion, supports a claim, etc.).
//
// Tokenisation: the source_text is split into a flat sequence of spans.
//   • Each target phrase appears as ONE tappable span (multi-word target →
//     single span, not split by spaces). Detected by literal substring match.
//   • All other intervening text is split into per-word spans (red-herring
//     taps that count against the pass rule's max_wrong cap).
//   • Punctuation hangs off the previous word.
//
// Output payload (student_answer): JSON array of the selected span texts.
// Scoring in lib/tourism-scoring.ts matches these strings against
// targets[].phrase (normalised) and counts wrong taps.

import { useMemo, useState } from "react";
import type { TourismHighlightTarget } from "@/types/tourism";

interface Props {
  sourceText: string;
  task: string;
  targets: TourismHighlightTarget[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

interface Token {
  id: string;        // unique within this question (text + index)
  text: string;      // raw text to display and to send back
  isTarget: boolean;
}

function tokenise(source: string, targets: TourismHighlightTarget[]): Token[] {
  // Sort target phrases longest-first so longer phrases win when they
  // overlap with shorter substrings of themselves.
  const phrases = [...targets]
    .map((t) => t.phrase)
    .filter((p) => p && p.length > 0)
    .sort((a, b) => b.length - a.length);

  const tokens: Token[] = [];
  let i = 0;
  let idx = 0;
  while (i < source.length) {
    // Try to match any target phrase starting at i (case-insensitive but
    // we keep the original source casing in the displayed text).
    const slice = source.slice(i);
    const match = phrases.find((p) =>
      slice.toLowerCase().startsWith(p.toLowerCase()),
    );
    if (match) {
      const text = source.slice(i, i + match.length);
      tokens.push({ id: `tgt_${idx++}`, text, isTarget: true });
      i += match.length;
      continue;
    }
    // Otherwise consume a single word (run of non-whitespace), preserving
    // a trailing single whitespace token for spacing in the layout.
    if (/\s/.test(source[i])) {
      // Whitespace — emit as a non-tappable spacer (zero-width id).
      let j = i;
      while (j < source.length && /\s/.test(source[j])) j++;
      tokens.push({ id: `ws_${idx++}`, text: source.slice(i, j), isTarget: false });
      i = j;
      continue;
    }
    let j = i;
    while (j < source.length && !/\s/.test(source[j])) {
      // Stop early if a target phrase starts mid-word, so the next loop
      // iteration can pick it up.
      const sub = source.slice(j);
      if (j > i && phrases.some((p) => sub.toLowerCase().startsWith(p.toLowerCase()))) break;
      j++;
    }
    tokens.push({ id: `w_${idx++}`, text: source.slice(i, j), isTarget: false });
    i = j;
  }
  return tokens;
}

export default function HighlightSourceQuestion({
  sourceText,
  task,
  targets,
  submitting,
  onSubmit,
}: Props) {
  const tokens = useMemo(() => tokenise(sourceText, targets), [sourceText, targets]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    const payload = tokens
      .filter((t) => selected.has(t.id))
      .map((t) => t.text);
    onSubmit(JSON.stringify(payload));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm font-semibold text-amber-900">
        {task}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 max-h-72 overflow-y-auto leading-loose text-[#1a2744] text-base">
        {tokens.map((t) => {
          const tappable = t.id.startsWith("w_") || t.id.startsWith("tgt_");
          if (!tappable) {
            return <span key={t.id}>{t.text}</span>;
          }
          const on = selected.has(t.id);
          return (
            <button
              key={t.id}
              disabled={submitting}
              onClick={() => toggle(t.id)}
              className={`mx-px px-1 py-0.5 rounded-md transition-colors min-h-[36px] align-baseline ${
                on
                  ? "bg-amber-300 text-amber-950 font-semibold"
                  : "hover:bg-amber-100"
              }`}
            >
              {t.text}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setSelected(new Set())}
          disabled={submitting || selected.size === 0}
          className="text-sm text-gray-500 hover:text-[#BE1832] disabled:text-gray-300 underline underline-offset-4"
        >
          Clear
        </button>
        <button
          onClick={submit}
          disabled={submitting || selected.size === 0}
          className="flex-1 py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-base"
        >
          Check answer
        </button>
      </div>
    </div>
  );
}
