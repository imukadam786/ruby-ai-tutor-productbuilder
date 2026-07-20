"use client";

import { ReactNode } from "react";
import { resolveErrorExplanation } from "@/lib/error-explanations";
import Gem from "@/components/ui/Gem";
import { RUBY } from "@/lib/design/gemColors";
import { CONCEPT_C } from "@/lib/flags";

// A free, deterministic read on a numeric wrong answer: how far off, and which
// way. Turns the bare "you answered 8 / the answer is 7" into a closer "8 —
// that's 1 too high". Returns null when either side isn't a plain number, so
// word answers, expressions and multi-part answers fall back to the two facts.
function numericRelation(student: string, correct: string): string | null {
  const s = Number(student.replace(/[\s,]/g, ""));
  const c = Number(correct.replace(/[\s,]/g, ""));
  if (!Number.isFinite(s) || !Number.isFinite(c) || s === c) return null;
  const gap = Math.round(Math.abs(s - c) * 1000) / 1000;
  return s > c ? `that's ${gap} too high` : `that's ${gap} too low`;
}

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
  /**
   * A personalised per-answer diagnosis ("I can see you added 5 and 2…").
   * Shown as a warm intro above the structured why/how/example. Only pass this
   * when it is genuinely tailored to the student's answer — never a canned
   * placeholder — otherwise the intro adds noise.
   */
  diagnosis?: string;
  /** Partial-credit summary for multi-part answers. */
  partialCredit?: { correct: number; total: number };
  /** Heading shown on a correct answer. */
  correctLabel?: string;
  /** Explanation paragraph shown on a correct answer (e.g. why the answer is right). */
  note?: string;
  /**
   * A subject-authored "why this happens" (e.g. Maths Literacy's per-code
   * vocabulary). When set, it is authoritative: the generic error-code map's
   * label and example are skipped, since they may not fit this subject.
   */
  whyOverride?: string;
  /** Optional misconception label under the heading (paired with whyOverride). */
  labelOverride?: string;
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
  diagnosis,
  partialCredit,
  correctLabel = "Correct!",
  note,
  whyOverride,
  labelOverride,
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
          {CONCEPT_C && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-green-700 shadow-lip-sm whitespace-nowrap">
              <Gem color={RUBY} state="polished" className="w-4 h-5" /> gem cut!
            </span>
          )}
        </div>
        {(note || (workingSteps && workingSteps.length > 0)) && (
          <div className="px-6 py-5 space-y-2">
            {note && <p className="text-sm text-gray-700 leading-relaxed">{note}</p>}
            {workingSteps && workingSteps.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">How it's done</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  {workingSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
        {footer && <div className="px-6 pb-6 pt-2">{footer}</div>}
      </div>
    );
  }

  // ── Wrong — five-part explanation ───────────────────────────────────────────
  // A subject-supplied whyOverride is authoritative — skip the generic map's
  // label/example so we never show, say, a multiplication example on a VAT error.
  const explanation = whyOverride ? null : resolveErrorExplanation(errorSignals);
  const student = studentAnswer?.trim();
  const correct = correctAnswer?.trim();
  const showWhat = !!student && !!correct && student !== correct;
  const relation = showWhat ? numericRelation(student!, correct!) : null;
  const diagnosisText = diagnosis?.trim();
  const headerLabel = labelOverride ?? explanation?.label;
  // A personalised diagnosis already speaks to this answer, so don't also fall
  // back to serverFeedback for the generic "why" — it would just repeat it.
  const whyText = whyOverride || explanation?.why || (diagnosisText ? undefined : serverFeedback);
  const hasWorking = !!workingSteps && workingSteps.length > 0;
  const howText = hasWorking ? undefined : howOverride || explanation?.how;
  const exampleText = explanation?.example;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${CONCEPT_C ? "border-rose-200 bg-rose-50" : "border-orange-200 bg-orange-50"}`}>
      <div className={`px-6 py-4 flex items-center justify-between gap-3 ${CONCEPT_C ? "bg-rose-100" : "bg-orange-100"}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤔</span>
          <div>
            <p className={`font-bold text-lg ${CONCEPT_C ? "text-rose-900" : "text-orange-800"}`}>Not quite</p>
            {headerLabel && <p className={`text-sm ${CONCEPT_C ? "text-rose-700" : "text-orange-700"}`}>{headerLabel}</p>}
          </div>
        </div>
        {headerAction}
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* DIAGNOSIS — a warm, tailored read of what happened (when personalised) */}
        {diagnosisText && (
          <p className="text-gray-800 leading-relaxed">{diagnosisText}</p>
        )}

        {/* WHAT — the two facts, sharpened with how far off when both are numbers */}
        {showWhat && (
          <p className="text-sm text-gray-700">
            You answered <span className={`font-semibold ${CONCEPT_C ? "text-rose-700" : "text-orange-700"}`}>{student}</span>
            {relation && <> — {relation}</>}. The answer is{" "}
            <span className="font-semibold text-green-700">{correct}</span>.
          </p>
        )}

        {partialCredit && (
          <p className="text-sm text-gray-600">
            You got {partialCredit.correct} of {partialCredit.total} parts.
          </p>
        )}

        {/* WHY — violet block in Concept C */}
        {whyText && (
          CONCEPT_C ? (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-violet-700 mb-1">🧠 Why this happens</p>
              <p className="text-gray-800 leading-relaxed">{whyText}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Why this happens</p>
              <p className="text-gray-800 leading-relaxed">{whyText}</p>
            </div>
          )
        )}

        {/* HOW — worked steps if the subject authors them, else the map's fix (sky block in Concept C) */}
        {hasWorking && (
          <div className={`rounded-xl p-4 ${CONCEPT_C ? "bg-sky-50 border border-sky-200" : "bg-white border border-orange-200"}`}>
            <p className={`text-sm mb-1 ${CONCEPT_C ? "font-semibold text-sky-700" : "font-medium text-gray-600"}`}>{CONCEPT_C ? "🔧 How to fix it" : "How to fix it"}</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {workingSteps!.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
        {howText && (
          <div className={`rounded-xl p-4 ${CONCEPT_C ? "bg-sky-50 border border-sky-200" : "bg-white border border-orange-200"}`}>
            <p className={`text-sm mb-1 ${CONCEPT_C ? "font-semibold text-sky-700" : "font-medium text-gray-600"}`}>{CONCEPT_C ? "🔧 How to fix it" : "How to fix it"}</p>
            <p className="text-gray-800 text-sm leading-relaxed">{howText}</p>
          </div>
        )}

        {/* EXAMPLE — amber in both looks */}
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
