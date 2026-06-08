"use client";

import { ReactNode } from "react";
import { resolveErrorExplanation } from "@/lib/error-explanations";

// ─── Shared feedback card ────────────────────────────────────────────────────
//
// One feedback card for every subject. It renders the deep wrong-answer card —
// What you put / Why it happens / How to fix it / a layman example / worked steps —
// from normalized inputs, degrading gracefully when a part's data is absent.
// The why/how/example come from the authored error-code map (lib/error-explanations).
//
// Each subject supplies its own `footer` (the next/continue affordance) so per-
// subject navigation (swipe vs button) is preserved while the feedback CONTENT is
// shared. Improvements here land in every subject at once.

export interface FeedbackExplanationProps {
  isCorrect: boolean;
  /** The student's submitted answer (for the "What you put" line). */
  studentAnswer?: string;
  /** The correct answer, human-readable. */
  correctAnswer?: string;
  /** Question misconception codes — drive the why/how/example. */
  errorSignals?: string[];
  /** Numbered worked solution, if the subject authors one (shown as "How"). */
  workingSteps?: string[];
  /** Optional extra text from the server (e.g. partial-credit note). */
  serverFeedback?: string;
  /** Partial-credit summary for multi-part answers. */
  partialCredit?: { correct: number; total: number };
  /** Heading shown on a correct answer. */
  correctLabel?: string;
  /** Overrides the map's "how to fix it" text (e.g. ruby's LLM re-teaching). */
  howOverride?: string;
  /** Optional control rendered in the card header (e.g. a play-audio button). */
  headerAction?: ReactNode;
  /** The next/continue control, supplied by the subject. */
  footer?: ReactNode;
}

export default function FeedbackExplanation({
  isCorrect,
  studentAnswer,
  correctAnswer,
  errorSignals,
  workingSteps,
  serverFeedback,
  partialCredit,
  correctLabel = "Correct!",
  howOverride,
  headerAction,
  footer,
}: FeedbackExplanationProps) {
  // ── Correct ────────────────────────────────────────────────────────────────
  if (isCorrect) {
    return (
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-3 bg-green-100">
          <span className="text-2xl">✅</span>
          <p className="font-bold text-lg text-green-800">{correctLabel}</p>
        </div>
        {workingSteps && workingSteps.length > 0 && (
          <div className="px-6 py-5">
            <p className="text-sm font-medium text-gray-600 mb-1">How it's done</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {workingSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
        {footer && <div className="px-6 pb-6 pt-2">{footer}</div>}
      </div>
    );
  }

  // ── Wrong — five-part explanation ───────────────────────────────────────────
  const explanation = resolveErrorExplanation(errorSignals);
  const student = studentAnswer?.trim();
  const correct = correctAnswer?.trim();
  const showWhat = !!student && !!correct && student !== correct;
  const headerLabel = explanation?.label ?? "Not quite";
  const whyText = explanation?.why || serverFeedback;
  const hasWorking = !!workingSteps && workingSteps.length > 0;
  const howText = hasWorking ? undefined : howOverride || explanation?.how;
  const exampleText = explanation?.example;

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between gap-3 bg-orange-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤔</span>
          <div>
            <p className="font-bold text-lg text-orange-800">Not quite</p>
            <p className="text-sm text-orange-700">{headerLabel}</p>
          </div>
        </div>
        {headerAction}
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* WHAT */}
        {showWhat && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="text-gray-700">
              You answered <span className="font-semibold text-orange-700">{student}</span>
            </span>
            <span className="text-gray-700">
              The answer is <span className="font-semibold text-green-700">{correct}</span>
            </span>
          </div>
        )}

        {partialCredit && (
          <p className="text-sm text-gray-600">
            You got {partialCredit.correct} of {partialCredit.total} parts.
          </p>
        )}

        {/* WHY */}
        {whyText && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Why this happens</p>
            <p className="text-gray-800 leading-relaxed">{whyText}</p>
          </div>
        )}

        {/* HOW — worked steps if the subject authors them, else the map's fix */}
        {hasWorking && (
          <div className="bg-white border border-orange-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-600 mb-1">How to fix it</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {workingSteps!.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
        {howText && (
          <div className="bg-white border border-orange-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-600 mb-1">How to fix it</p>
            <p className="text-gray-800 text-sm leading-relaxed">{howText}</p>
          </div>
        )}

        {/* EXAMPLE */}
        {exampleText && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-700 mb-1">💡 Think of it like this</p>
            <p className="text-gray-800 text-sm leading-relaxed">{exampleText}</p>
          </div>
        )}
      </div>

      {footer && <div className="px-6 pb-6 pt-2">{footer}</div>}
    </div>
  );
}
