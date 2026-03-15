import {
  SkillMastery,
  MathsSessionRecord,
  MasteryStatus,
  SkillAttempt,
  QuestionTemplate,
  AtomicSkill,
  StudentProfile,
} from "@/types/ruby";

// ─── Mastery Determination ────────────────────────────────────────────────────
// Mastery threshold: 80% accuracy over a minimum of 3 attempts.
// Format diversity is not required — single-format question banks can still
// produce mastery. Cross-session stability gate is removed for accessibility.

const MASTERY_MIN_ATTEMPTS = 3;
const MASTERY_ACCURACY_THRESHOLD = 0.8;

export function evaluateMastery(
  attempts: SkillAttempt[],
  skill: AtomicSkill
): MasteryStatus {
  const { allow_scaffolding } = skill.mastery_criteria;

  const validAttempts = allow_scaffolding
    ? attempts
    : attempts.filter((a) => !a.scaffolded);

  if (validAttempts.length === 0) return "locked";
  if (validAttempts.length < MASTERY_MIN_ATTEMPTS) return "in_progress";

  const correctCount = validAttempts.filter((a) => a.is_correct).length;
  const accuracy = correctCount / validAttempts.length;

  return accuracy >= MASTERY_ACCURACY_THRESHOLD ? "mastered" : "in_progress";
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
  };
}

export function updateSkillMastery(
  existing: SkillMastery,
  attempt: SkillAttempt,
  skill: AtomicSkill
): SkillMastery {
  const updatedAttempts = [...existing.attempts, attempt];

  const newStatus = evaluateMastery(updatedAttempts, skill);

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
    mastered_at:
      newStatus === "mastered" && existing.status !== "mastered"
        ? new Date().toISOString()
        : existing.mastered_at,
  };

  return updated;
}

// ─── Next Action Decision ─────────────────────────────────────────────────────

export type NextAction =
  | "continue_skill"       // legacy — keep practising this skill
  | "advance_skill"        // move to next skill in tier
  | "advance_tier"         // all skills in tier mastered
  | "advance_level"        // all tiers in level mastered
  | "review_prerequisite"  // too many errors — go back (BACKTRACK)
  | "practice"             // consolidation — same skill, new examples
  | "reteach"              // stuck — same skill, different strategy
  | "accelerate";          // fast-track — skip to next skill

export function determineNextAction(
  mastery: SkillMastery,
  recentAttempts: SkillAttempt[],
  totalSkillsInTier: number,
  masteredSkillsInTier: number,
  totalTiersInLevel: number,
  masteredTiersInLevel: number,
  sessionCorrect = 0,
  sessionAttempts = 0,
  reteachCount = 0
): NextAction {
  const sessionAccuracy = sessionAttempts > 0 ? sessionCorrect / sessionAttempts : 0;

  // 1. ACCELERATE — >90% accuracy, 2+ formats, zero errors this session, 3+ questions
  if (sessionAttempts >= 3 && sessionCorrect === sessionAttempts) {
    const sessionSlice = recentAttempts.slice(-sessionAttempts);
    const formatsUsed = new Set(sessionSlice.map((a) => a.template));
    if (sessionAccuracy > 0.9 && formatsUsed.size >= 2) {
      return "accelerate";
    }
  }

  // 2. ADVANCE — mastery threshold met (80% accuracy over 3+ attempts)
  if (mastery.status === "mastered") {
    if (masteredTiersInLevel >= totalTiersInLevel) return "advance_level";
    if (masteredSkillsInTier >= totalSkillsInTier) return "advance_tier";
    return "advance_skill";
  }

  // 3. BACKTRACK — 3 consecutive wrongs (unchanged), or reteach exhausted
  if (reteachCount >= 3) return "review_prerequisite";
  if (recentAttempts.length >= 3) {
    const lastThree = recentAttempts.slice(-3);
    if (lastThree.every((a) => !a.is_correct)) {
      return "review_prerequisite";
    }
  }

  // 4. RETEACH — same error in 2 of last 3 attempts + accuracy below 60%
  if (recentAttempts.length >= 2 && sessionAccuracy < 0.6) {
    const last3 = recentAttempts.slice(-3);
    const errorCounts: Record<string, number> = {};
    for (const a of last3) {
      if (!a.is_correct && a.error_type !== "correct") {
        errorCounts[a.error_type] = (errorCounts[a.error_type] || 0) + 1;
      }
    }
    if (Object.values(errorCounts).some((c) => c >= 2)) {
      return "reteach";
    }
  }

  // 5. PRACTICE — default consolidation path
  return "practice";
}

// ─── Cross-Session Mastery Stability ─────────────────────────────────────────
// ADVANCE requires passing on 2+ non-consecutive sessions with a 24h+ gap.
// recordMathsSession() writes one entry per session; returns updated mastery.
// isMathsSessionStable() checks the 2-session / 24h condition.

export function recordMathsSession(
  mastery: SkillMastery,
  sessionRecord: MathsSessionRecord
): SkillMastery {
  const history = mastery.session_history ?? [];
  // Prevent double-writing the same session
  if (history.some((s) => s.sessionId === sessionRecord.sessionId)) return mastery;
  return { ...mastery, session_history: [...history, sessionRecord] };
}

export function isMathsSessionStable(mastery: SkillMastery): boolean {
  const passed = (mastery.session_history ?? [])
    .filter((s) => s.passed)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (passed.length < 2) return false;

  const latest   = passed[passed.length - 1];
  const previous = passed[passed.length - 2];
  const hours24  = 24 * 60 * 60 * 1000;

  return (latest.timestamp - previous.timestamp) >= hours24;
}

// ─── Spaced Repetition Check ──────────────────────────────────────────────────
// Skills mastered more than 7 days ago should be reviewed

export function needsReview(mastery: SkillMastery): boolean {
  if (mastery.status !== "mastered") return false;
  if (!mastery.mastered_at) return false;

  const daysSinceMastery =
    (Date.now() - new Date(mastery.mastered_at).getTime()) /
    (1000 * 60 * 60 * 24);

  return daysSinceMastery > 7;
}

// ─── Spaced Repetition Queue ──────────────────────────────────────────────────
// Builds a list of mastered skills due for review, sorted most-overdue first.
// Uses last_reviewed_at if set, otherwise falls back to mastered_at.
// Capped at 3 per session so reviews never crowd out new skill work.

export function buildReviewQueue(profile: StudentProfile): string[] {
  const due = Object.entries(profile.skill_mastery)
    .filter(([, mastery]) => needsReview(mastery))
    .map(([skillId]) => skillId);

  due.sort((a, b) => {
    const ma = profile.skill_mastery[a];
    const mb = profile.skill_mastery[b];
    const tsA = new Date(ma.last_reviewed_at ?? ma.mastered_at ?? 0).getTime();
    const tsB = new Date(mb.last_reviewed_at ?? mb.mastered_at ?? 0).getTime();
    return tsA - tsB; // ascending — oldest first
  });

  return due.slice(0, 3);
}

// ─── Progress Percentage ──────────────────────────────────────────────────────

export function getLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, SkillMastery>
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered"
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}
