"use client";

// ─── Shared feedback footer ──────────────────────────────────────────────────
//
// The navigation row shown under every answer card, in every subject. A correct
// answer advances full-width; a wrong answer offers a Retry of the SAME question
// alongside the advance button. Centralising it here keeps the retry experience
// identical across all subjects — change it once, it lands everywhere.

import Button from "@/components/ui/Button";

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
    <Button variant="primary" size="lg" fullWidth onClick={onNext}>
      {nextLabel}
    </Button>
  );

  // Correct (or no retry handler) → a single full-width advance button.
  if (isCorrect || !onRetry) {
    return next;
  }

  // Wrong → Retry the same question (outlined) beside the advance button.
  // Stack on narrow screens so neither button is squeezed thin enough to wrap.
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button variant="outline" size="lg" fullWidth onClick={onRetry}>
        ↻ Retry
      </Button>
      {next}
    </div>
  );
}
