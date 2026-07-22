"use client";

// ─── Shared mastery / progress header ────────────────────────────────────────
//
// The progress card shown at the top of every content-subject question screen
// (Maths Literacy, Accounting, History, Geography, … all of them). Before this,
// each subject hand-rolled its own coloured card, so they all looked different
// AND most of them showed a *question counter* ("Q 16 of 16") while the skill
// actually unlocks on DISTINCT-question coverage — so the counter could read
// "16 of 16" while the skill stayed locked, with nothing explaining why.
//
// This one card is identical everywhere and is honest about the real gate:
//   • Coverage — answer `required` DIFFERENT questions (the progress bar).
//   • Accuracy — keep at least 75% correct.
// The line under the bar always names whichever gate is still in the way, in
// plain language, so a stuck learner knows exactly what to do next.

import { ACCURACY_TARGET } from "@/lib/content-mastery";
import RubyIcon from "@/components/ui/RubyIcon";
import { CONCEPT_C } from "@/lib/flags";

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

const ACCURACY_PCT = Math.round(ACCURACY_TARGET * 100);

export default function MasteryHeader({
  title,
  distinctAnswered,
  requiredCount,
  correctCount,
  attemptCount,
  mastered,
}: MasteryHeaderProps) {
  const covered = Math.min(distinctAnswered, requiredCount);
  const coveragePct = requiredCount > 0 ? Math.round((covered / requiredCount) * 100) : 0;
  const accuracyPct = attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0;
  const remaining = Math.max(0, requiredCount - distinctAnswered);

  // Name whichever gate still blocks the unlock, in plain language.
  let hint: string;
  if (remaining > 0) {
    hint = `Answer ${remaining} more ${remaining === 1 ? "question" : "different questions"} to unlock the next skill — keep at least ${ACCURACY_PCT}% correct.`;
  } else if (accuracyPct < ACCURACY_PCT) {
    hint = `Almost there — lift your score to ${ACCURACY_PCT}% correct to unlock the next skill (you're at ${accuracyPct}%).`;
  } else {
    hint = `One more correct answer unlocks the next skill!`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-700 truncate">
          {title}
        </span>
        <span className={`text-sm font-semibold flex-shrink-0 inline-flex items-center gap-1 ${CONCEPT_C ? "text-ruby" : "text-brand"}`}>
          {mastered ? (
            <>
              <RubyIcon className="w-4 h-4" /> Mastered
            </>
          ) : (
            `${covered} of ${requiredCount}`
          )}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${CONCEPT_C ? "bg-ruby" : "bg-brand"}`}
          style={{ width: `${mastered ? 100 : coveragePct}%` }}
        />
      </div>
      {!mastered && requiredCount > 0 && (
        <p className="text-[11px] text-gray-600 mt-1.5 leading-snug">{hint}</p>
      )}
    </div>
  );
}
