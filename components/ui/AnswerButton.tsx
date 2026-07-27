"use client";

// ─── AnswerButton (Concept C) ────────────────────────────────────────────────
// A chunky, pressable answer option in one of four fixed colours (A=coral,
// B=amber, C=teal, D=sky) with the hard offset "lip" shadow. Colour never
// implies correctness: pass `result` only AFTER submit to reveal a ✓/✗. Every
// option also carries its letter + text, so colour is never the only signal.
//
// Ready for the tap-choice renderers to adopt (wired in per renderer in Phase 4).

import type { ReactNode } from "react";
import { ANSWER_COLORS } from "@/lib/design/gemColors";

interface AnswerButtonProps {
  /** 0-based position → picks the colour (A / B / C / D, cycles). */
  index: number;
  onClick?: () => void;
  disabled?: boolean;
  /** Post-submit reveal. Leave null while the learner is still choosing. */
  result?: "correct" | "wrong" | null;
  /** The learner picked this one (before the result is known) — renders pressed-in. */
  selected?: boolean;
  /** A different option was picked — fade this one back. */
  dimmed?: boolean;
  /** Denser sizing for dense/multi-question contexts (e.g. matric past papers)
   *  where the full onboarding-scale lip/padding crowds out the question. Every
   *  other caller omits this and keeps today's chunky look. */
  compact?: boolean;
  children: ReactNode;
}

export default function AnswerButton({
  index,
  onClick,
  disabled,
  result = null,
  selected = false,
  dimmed = false,
  compact = false,
  children,
}: AnswerButtonProps) {
  const c = ANSWER_COLORS[index % ANSWER_COLORS.length];
  // Pressed-in (down, no lip) is the "I picked this" signal; the others fade back.
  const opacity = dimmed ? 0.4 : result === "wrong" ? 0.5 : 1;
  const lip = compact ? 3 : 5;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 w-full text-white text-left transition-transform active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed ${
        compact ? "rounded-xl px-3 py-2.5 font-bold text-sm" : "rounded-2xl px-4 py-3.5 font-extrabold"
      }`}
      style={{
        background: c.bg,
        boxShadow: selected ? "none" : `0 ${lip}px 0 0 ${c.lip}`,
        transform: selected ? `translateY(${lip}px)` : undefined,
        opacity,
      }}
    >
      <span className={`rounded-lg bg-white/25 flex items-center justify-center flex-shrink-0 ${compact ? "w-5 h-5 text-xs" : "w-6 h-6 text-sm"}`}>{c.key}</span>
      <span className="flex-1">{children}</span>
      {result === "correct" && <span aria-hidden>✓</span>}
      {result === "wrong" && <span aria-hidden>✗</span>}
    </button>
  );
}
