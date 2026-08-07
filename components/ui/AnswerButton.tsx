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
  children: ReactNode;
}

export default function AnswerButton({
  index,
  onClick,
  disabled,
  result = null,
  children,
}: AnswerButtonProps) {
  const c = ANSWER_COLORS[index % ANSWER_COLORS.length];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 w-full rounded-2xl px-4 py-3.5 text-white font-extrabold text-left transition-transform active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed"
      style={{ background: c.bg, boxShadow: `0 5px 0 0 ${c.lip}`, opacity: result === "wrong" ? 0.5 : 1 }}
    >
      <span className="w-6 h-6 rounded-lg bg-white/25 flex items-center justify-center text-sm">{c.key}</span>
      <span className="flex-1">{children}</span>
      {result === "correct" && <span aria-hidden>✓</span>}
      {result === "wrong" && <span aria-hidden>✗</span>}
    </button>
  );
}
