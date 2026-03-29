/**
 * Stuck Detector — domain-agnostic intervention trigger.
 *
 * Works identically for maths and reading because both use BKT
 * with the same p_learned scale and attempt_count tracking.
 *
 * Thresholds:
 *   warn  — 3+ attempts, p_learned < 0.50  →  informational only
 *   stuck — 5+ attempts, p_learned < 0.60  →  full intervention screen
 *
 * The warn level is informational only (callers may change tone/message).
 * The stuck level should surface the StuckScreen UI.
 */

export type StuckLevel = "ok" | "warn" | "stuck";

export interface StuckState {
  level: StuckLevel;
  attemptCount: number;
  pLearned: number;
}

export const STUCK_WARN_ATTEMPTS  = 3;
export const STUCK_HARD_ATTEMPTS  = 5;
export const STUCK_WARN_THRESHOLD = 0.50;  // p_learned below this at warn boundary
export const STUCK_HARD_THRESHOLD = 0.60;  // p_learned below this at hard boundary

/**
 * Evaluate whether a student appears stuck on a skill.
 *
 * @param attemptCount  total lifetime attempts on this skill (from SkillMastery.attempt_count)
 * @param pLearned      current BKT probability (from SkillMastery.p_learned)
 * @param dismissedAt   attempt_count when the student last dismissed the stuck screen.
 *                      Pass 0 or omit if never dismissed. The stuck check is suppressed
 *                      for STUCK_HARD_ATTEMPTS questions after a dismissal, giving the
 *                      student a full second cycle before showing the screen again.
 */
export function detectStuck(
  attemptCount: number,
  pLearned: number,
  dismissedAt = 0,
): StuckState {
  // Suppress re-triggering for one full cycle after the student dismissed
  const suppressUntil = dismissedAt + STUCK_HARD_ATTEMPTS;
  const suppressed = dismissedAt > 0 && attemptCount < suppressUntil;

  if (!suppressed && attemptCount >= STUCK_HARD_ATTEMPTS && pLearned < STUCK_HARD_THRESHOLD) {
    return { level: "stuck", attemptCount, pLearned };
  }

  if (attemptCount >= STUCK_WARN_ATTEMPTS && pLearned < STUCK_WARN_THRESHOLD) {
    return { level: "warn", attemptCount, pLearned };
  }

  return { level: "ok", attemptCount, pLearned };
}
