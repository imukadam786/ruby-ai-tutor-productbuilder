import {
  SkillMastery,
  MasteryStatus,
  SkillAttempt,
  QuestionTemplate,
} from "@/types/ruby";
import {
  initBKT,
  updateBKT,
  isMastered as bktIsMastered,
  DEFAULT_BKT_PARAMS,
  paramsForDifficulty,
} from "@/lib/bkt";

// ─── Mastery Determination ────────────────────────────────────────────────────
// BKT is the sole mastery mechanism. No legacy accuracy threshold.
// Minimum 5 attempts required before mastery can be declared regardless of p_learned.

export const MASTERY_MIN_ATTEMPTS = 5;

// ─── Grade-adjusted BKT mastery threshold ─────────────────────────────────────
// Grade 1 students need a lower bar to avoid frustration:
//   Grade 1: 0.80 (base 0.95 − 0.15)
//   Grade 2: 0.90 (base 0.95 − 0.05)
//   Grade 3+: 0.95 (no adjustment)
// Floor at 0.50 so mastery is never trivial.
function gradeAdjustedIsMastered(p_learned: number, grade: number): boolean {
  const base = 0.95;
  const adjustment = grade <= 1 ? -0.15 : grade === 2 ? -0.05 : 0;
  const threshold = Math.max(0.50, base + adjustment);
  return p_learned >= threshold;
}

export function evaluateMastery(
  attempts: SkillAttempt[],
  p_learned: number,
  grade?: number
): MasteryStatus {
  if (attempts.length === 0) return "locked";
  if (attempts.length < MASTERY_MIN_ATTEMPTS) return "in_progress";
  const mastered = grade !== undefined
    ? gradeAdjustedIsMastered(p_learned, grade)
    : bktIsMastered(p_learned);
  return mastered ? "mastered" : "in_progress";
}

export function initSkillMastery(skillId: string): SkillMastery {
  return {
    skill_id: skillId,
    status: "locked",
    correct_count: 0,
    attempt_count: 0,
    formats_used: [],
    scaffolded_attempts: 0,
    last_attempted: new Date().toISOString(),
    session_history: [],
    attempts: [],
    p_learned: initBKT(DEFAULT_BKT_PARAMS),
  };
}

export function updateSkillMastery(
  existing: SkillMastery,
  attempt: SkillAttempt,
  grade?: number,
  difficulty?: number
): SkillMastery {
  const updatedAttempts = [...existing.attempts, attempt];

  // ── BKT update ────────────────────────────────────────────────────────────
  // Use difficulty-calibrated params when available: harder questions have lower
  // guess rates so a correct answer carries more evidential weight.
  const bktParams = difficulty !== undefined
    ? paramsForDifficulty(difficulty)
    : DEFAULT_BKT_PARAMS;
  const currentP = existing.p_learned ?? initBKT(DEFAULT_BKT_PARAMS);
  const updatedP = updateBKT(currentP, attempt.is_correct, bktParams);

  const newStatus = evaluateMastery(updatedAttempts, updatedP, grade);

  const formatsUsed = Array.from(
    new Set([...existing.formats_used, attempt.template])
  ) as QuestionTemplate[];

  const updated: SkillMastery = {
    ...existing,
    attempts: updatedAttempts,
    attempt_count: existing.attempt_count + 1,
    correct_count: attempt.is_correct
      ? existing.correct_count + 1
      : existing.correct_count,
    scaffolded_attempts: attempt.scaffolded
      ? existing.scaffolded_attempts + 1
      : existing.scaffolded_attempts,
    formats_used: formatsUsed,
    last_attempted: attempt.timestamp,
    status: newStatus,
    p_learned: updatedP,
    mastered_at:
      newStatus === "mastered" && existing.status !== "mastered"
        ? new Date().toISOString()
        : existing.mastered_at,
  };

  return updated;
}

// ─── Needs Review Scan ────────────────────────────────────────────────────────

export const NEEDS_REVIEW_DAYS = 7;

import type { StudentProfile } from "@/types/ruby";

/**
 * Scans all mastered skills and marks stale ones as "needs_review".
 * Returns the mastery map unchanged if nothing qualifies.
 */
export function scanMasteryForReview(
  masteryMap: Record<string, SkillMastery>
): Record<string, SkillMastery> {
  const cutoff = Date.now() - NEEDS_REVIEW_DAYS * 24 * 60 * 60 * 1000;
  let changed = false;
  const updated = { ...masteryMap };

  for (const [skillId, mastery] of Object.entries(updated)) {
    if (mastery.status !== "mastered") continue;
    const timestamps = [
      mastery.last_attempted,
      mastery.mastered_at,
      mastery.last_reviewed_at,
    ].filter(Boolean).map((t) => new Date(t!).getTime());
    const mostRecent = Math.max(...timestamps);
    if (mostRecent < cutoff) {
      updated[skillId] = { ...mastery, status: "needs_review" };
      changed = true;
    }
  }

  return changed ? updated : masteryMap;
}

/**
 * Returns up to one "needs_review" skill ID, oldest activity first.
 * Returns null if none pending.
 */
export function pickNeedsReviewSkill(
  masteryMap: Record<string, SkillMastery>
): string | null {
  const candidates = Object.values(masteryMap).filter(
    (m) => m.status === "needs_review"
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const tA = new Date(a.last_reviewed_at ?? a.last_attempted).getTime();
    const tB = new Date(b.last_reviewed_at ?? b.last_attempted).getTime();
    return tA - tB;
  });
  return candidates[0].skill_id;
}

/**
 * Stamps last_reviewed_at on a skill after a review question is answered.
 */
export function stampMathsReviewedAt(
  profile: StudentProfile,
  skillId: string
): StudentProfile {
  const mastery = profile.skill_mastery[skillId];
  if (!mastery) return profile;
  return {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: { ...mastery, last_reviewed_at: new Date().toISOString() },
    },
  };
}

// ─── Progress Percentage ──────────────────────────────────────────────────────

export function getLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, SkillMastery>
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed"
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}
