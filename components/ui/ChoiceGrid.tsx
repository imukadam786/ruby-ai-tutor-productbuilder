"use client";

// ─── ChoiceGrid (Concept C) ──────────────────────────────────────────────────
// The four-colour multiple-choice grid. Each option takes one of the fixed
// answer colours (A=coral, B=amber, C=teal, D=sky) with the chunky pressable
// lip. Colour never implies the answer — right/wrong is only shown after submit.
//
// This is the Concept C option renderer. Each subject's AnswerDispatcher renders
// it *only when the flag is on* (`if (CONCEPT_C) return <ChoiceGrid .../>;`), so
// the current per-subject look is untouched when the flag is off.

import AnswerButton from "@/components/ui/AnswerButton";

interface ChoiceGridProps {
  options: string[];
  submitting: boolean;
  onSubmit: (opt: string) => void;
}

export default function ChoiceGrid({ options, submitting, onSubmit }: ChoiceGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((opt, i) => (
        <AnswerButton key={opt} index={i} disabled={submitting} onClick={() => onSubmit(opt)}>
          <span className="whitespace-pre-line">{opt}</span>
        </AnswerButton>
      ))}
    </div>
  );
}
