"use client";

/**
 * StuckScreen — shared intervention UI for maths and reading sessions.
 *
 * Shown when detectStuck() returns level === "stuck" (15+ attempts, low p_learned).
 * Offers two paths:
 *   1. Mark as done — sets the skill to "assumed" and advances to the next skill.
 *   2. Keep trying — dismisses for another cycle (suppressed for ~15 more attempts).
 */

interface StuckScreenProps {
  skillTitle: string;
  subject: "maths" | "reading";
  attemptCount: number;
  onMarkDone: () => void;
  onKeepTrying: () => void;
}

export default function StuckScreen({
  skillTitle,
  subject,
  attemptCount,
  onMarkDone,
  onKeepTrying,
}: StuckScreenProps) {
  const colour = subject === "maths" ? "blue" : "emerald";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">

          {/* Icon + heading */}
          <div className="text-center space-y-3">
            <div className={`mx-auto w-16 h-16 rounded-full bg-${colour}-100 flex items-center justify-center`}>
              <svg className={`w-8 h-8 text-${colour}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              This one is taking a while
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              You&apos;ve worked hard on <span className="font-medium text-gray-700">{skillTitle}</span> ({attemptCount} attempts).
              Sometimes a skill needs more time to click — that&apos;s completely normal.
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={onMarkDone}
              className={`w-full rounded-2xl px-5 py-4 text-left bg-${colour}-600 hover:bg-${colour}-700 text-white transition-colors`}
            >
              <p className="font-semibold text-base">Move on for now</p>
              <p className="text-sm opacity-80 mt-0.5">
                Mark this skill as done and continue. You can come back to it later.
              </p>
            </button>

            <button
              onClick={onKeepTrying}
              className="w-full rounded-2xl px-5 py-4 text-left bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <p className="font-semibold text-base">Keep trying</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Stay on this skill — I&apos;ll keep showing different questions.
              </p>
            </button>
          </div>

          {/* Reassurance footer */}
          <p className="text-center text-xs text-gray-400">
            Moving on doesn&apos;t mean giving up — it means learning strategically.
          </p>

        </div>
      </div>
    </div>
  );
}
