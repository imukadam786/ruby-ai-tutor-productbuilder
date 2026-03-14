import {
  SkillMastery,
  MasteryStatus,
  SkillAttempt,
  QuestionTemplate,
  AtomicSkill,
} from "@/types/ruby";

// ─── Mastery Determination ────────────────────────────────────────────────────
// Mastery requires:
//   - correct_required correct answers (default 3)
//   - formats_required different question templates used (default 2)
//   - allow_scaffolding: false means unaided answers only count

export function evaluateMastery(
  attempts: SkillAttempt[],
  skill: AtomicSkill
): MasteryStatus {
  const { correct_required, formats_required, allow_scaffolding } =
    skill.mastery_criteria;

  const validAttempts = allow_scaffolding
    ? attempts
    : attempts.filter((a) => !a.scaffolded);

  const correctAttempts = validAttempts.filter((a) => a.is_correct);
  const correctCount = correctAttempts.length;

  const formatsUsed = new Set<QuestionTemplate>(
    correctAttempts.map((a) => a.template)
  );
  const formatCount = formatsUsed.size;

  if (correctCount >= correct_required && formatCount >= formats_required) {
    return "mastered";
  }

  if (attempts.length > 0) {
    return "in_progress";
  }

  return "locked";
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

  // 2. ADVANCE — existing mastery threshold (unchanged)
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
