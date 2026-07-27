"use client";

// ─── Shared mastery / progress header ────────────────────────────────────────
//
// This card used to sit at the top of every content-subject question screen
// (Maths Literacy, Accounting, History, Geography, … all of them), showing the
// skill title, a coverage progress bar and a "answer N more to unlock" line.
//
// It has been HIDDEN: on mobile it ate too much screen real-estate above every
// single question. The component and its props are intentionally kept so the
// ~18 subject sessions that render <MasteryHeader …/> need no change — it simply
// renders nothing. Progress still lives in the skill tree. To bring the card
// back everywhere at once, restore the markup below and return it.

interface MasteryHeaderProps {
  /** The skill / topic being practised. */
  title: string;
  /** Distinct questions answered so far (the real coverage count). */
  distinctAnswered: number;
  /** Distinct questions needed to satisfy coverage. */
  requiredCount: number;
  /** Cumulative correct answers on this skill. */
  correctCount: number;
  /** Cumulative attempts on this skill. */
  attemptCount: number;
  /** Whether the skill is already mastered. */
  mastered: boolean;
}

export default function MasteryHeader(_props: MasteryHeaderProps) {
  return null;
}
