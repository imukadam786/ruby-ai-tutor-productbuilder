"use client";

// ─── Shared feedback footer ──────────────────────────────────────────────────
//
// The navigation row shown under every answer card, in every subject. A correct
// answer advances full-width; a wrong answer offers a Retry of the SAME question
// alongside the advance button. Centralising it here keeps the retry experience
// identical across all subjects — change it once, it lands everywhere.

interface FeedbackFooterProps {
  /** Whether the just-submitted answer was correct. */
  isCorrect: boolean;
  /** Advance to the next question (or skill). */
  onNext: () => void;
  /**
   * Re-attempt the same question. Only shown on a wrong answer; omit it (or
   * leave it undefined) to suppress the Retry button entirely.
   */
  onRetry?: () => void;
  /** Label for the advance button (e.g. "Next skill →"). */
  nextLabel?: string;
}

export default function FeedbackFooter({
  isCorrect,
  onNext,
  onRetry,
  nextLabel = "Next question →",
}: FeedbackFooterProps) {
  const next = (
    <button
      onClick={onNext}
      className="flex-1 py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-bold text-lg transition-colors"
    >
      {nextLabel}
    </button>
  );

  // Correct (or no retry handler) → a single full-width advance button.
  if (isCorrect || !onRetry) {
    return <div className="flex">{next}</div>;
  }

  // Wrong → Retry the same question (outlined) beside the advance button.
  return (
    <div className="flex gap-3">
      <button
        onClick={onRetry}
        className="flex-1 py-4 rounded-full border-2 border-[#BE1832] text-[#BE1832] hover:bg-[#BE1832]/5 font-bold text-lg transition-colors"
      >
        ↻ Retry
      </button>
      {next}
    </div>
  );
}
