// ─── Content-subject mastery rule ────────────────────────────────────────────
//
// Applies to the FET / IP *content* subjects — History, Geography, Tourism,
// Life Sciences, Afrikaans, Business Studies, NST, Social Sciences, Maths
// Literacy. It does NOT apply to maths or reading, which use BKT (lib/bkt.ts)
// because their skills build on one another.
//
// A topic is MASTERED when BOTH conditions hold:
//   • Coverage — the student has answered at least `requiredCoverageCount(pool)`
//     distinct questions from the topic's pool. That's 80% of the pool, capped
//     at 20 so large pools don't become a grind.
//   • Accuracy — at least 75% of all their answers in the topic were correct,
//     counted cumulatively across every sitting, not just one session.

export const COVERAGE_TARGET = 0.80;   // fraction of the pool to attempt
export const COVERAGE_CAP = 20;        // never require more than this many questions
export const ACCURACY_TARGET = 0.75;   // fraction of answers that must be correct

/**
 * How many distinct questions a student must answer to satisfy coverage for a
 * pool of the given size: 80% of the pool, but never more than COVERAGE_CAP.
 */
export function requiredCoverageCount(poolSize: number): number {
  if (poolSize <= 0) return 0;
  return Math.min(Math.ceil(COVERAGE_TARGET * poolSize), COVERAGE_CAP);
}

/**
 * True when a topic meets both the coverage and accuracy bars.
 *
 * @param distinctAnswered  distinct questions answered (cumulative, deduped)
 * @param poolSize          total questions available in the topic
 * @param correct           correct answers (cumulative across sessions)
 * @param attempts          total answers given (cumulative across sessions)
 */
export function isContentMastered(
  distinctAnswered: number,
  poolSize: number,
  correct: number,
  attempts: number,
): boolean {
  if (attempts <= 0 || poolSize <= 0) return false;
  const required = requiredCoverageCount(poolSize);
  const coverageMet = Math.min(distinctAnswered, poolSize) >= required;
  const accuracyMet = correct / attempts >= ACCURACY_TARGET;
  return coverageMet && accuracyMet;
}

// ─── Difficulty matching (Phase A) ────────────────────────────────────────────
//
// Content subjects have no BKT `p_learned`, so a student's ability is derived
// from their running accuracy on the topic. The 1–5 level is fed to each
// subject's selectQuestion(), which prefers questions tagged at that difficulty
// (and falls back to random when nothing matches). On a reteach the selector
// drops one level easier on its own — we only supply the base level here.

// Don't swing difficulty on the first answer or two — stay neutral until there
// is enough signal to trust.
export const ABILITY_WARMUP_ATTEMPTS = 3;

/**
 * Maps running accuracy to a difficulty level 1–5. Returns a neutral 3 until
 * the student has answered ABILITY_WARMUP_ATTEMPTS questions. Bands:
 *   <50% → 2,  50–70% → 3,  70–85% → 4,  ≥85% → 5.
 * (Level 1 is reached via the selector's reteach downshift, not here.)
 */
export function contentAbilityLevel(correct: number, attempts: number): number {
  if (attempts < ABILITY_WARMUP_ATTEMPTS) return 3;
  const accuracy = correct / attempts;
  if (accuracy < 0.50) return 2;
  if (accuracy < 0.70) return 3;
  if (accuracy < 0.85) return 4;
  return 5;
}
