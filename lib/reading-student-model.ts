import {
  ReadingStudentProfile,
  ReadingSkillMastery,
  ReadingSkillAttempt,
  ReadingErrorType,
  ReadingAtomicSkill,
  ReadingMasteryStatus,
  ReadingTemplate,
  ReadingDecision,
  DiagnosticPlacementResult,
} from "@/types/reading";
import readingSkillTreeData from "@/data/reading-skill-tree.json";

const READING_STUDENT_KEY = "ruby_reading_profile";
const DEFAULT_STARTING_SKILL = "R1.T1.A1";
const DEFAULT_STARTING_LEVEL = 1;
const DEFAULT_STARTING_TIER = "R1.T1";

// ─── Load / Save ──────────────────────────────────────────────────────────────

export function getReadingProfile(): ReadingStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(READING_STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveReadingProfile(profile: ReadingStudentProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(READING_STUDENT_KEY, JSON.stringify(profile));
}

export function createReadingProfile(name: string, grade: number): ReadingStudentProfile {
  const profile: ReadingStudentProfile = {
    id: `reading_${Date.now()}`,
    name,
    grade,
    current_level: DEFAULT_STARTING_LEVEL,
    current_tier_id: DEFAULT_STARTING_TIER,
    current_skill_id: DEFAULT_STARTING_SKILL,
    skill_mastery: {},
    session_count: 1,
    total_attempts: 0,
    total_correct: 0,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    error_history: {
      ERR_PHONEME_CONF: 0,
      ERR_SOUND_RECALL: 0,
      ERR_BLEND_FAIL: 0,
      ERR_SOUND_OMIT: 0,
      ERR_SOUND_INSERT: 0,
      ERR_VOWEL_CONF: 0,
      ERR_ORTHO_GUESS: 0,
      ERR_SIGHT_MISS: 0,
      ERR_MULTI_BREAK: 0,
      ERR_FLUENCY_HES: 0,
      ERR_MEANING_BLIND: 0,
      ERR_SELF_MON: 0,
      correct: 0,
    },
    placementCompleted: false,
    placement: null,
    errorPatterns: {},
    sessionHistory: {},
  };
  saveReadingProfile(profile);
  return profile;
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export function recordReadingAttempt(
  profile: ReadingStudentProfile,
  attempt: ReadingSkillAttempt,
  updatedMastery: ReadingSkillMastery
): ReadingStudentProfile {
  const errorKey = attempt.error_type as ReadingErrorType;
  const updated: ReadingStudentProfile = {
    ...profile,
    total_attempts: profile.total_attempts + 1,
    total_correct: attempt.is_correct ? profile.total_correct + 1 : profile.total_correct,
    last_active: new Date().toISOString(),
    skill_mastery: {
      ...profile.skill_mastery,
      [attempt.skill_id]: updatedMastery,
    },
    error_history: {
      ...profile.error_history,
      [errorKey]: (profile.error_history[errorKey] || 0) + 1,
    },
  };
  saveReadingProfile(updated);
  return updated;
}

export function advanceToReadingSkill(
  profile: ReadingStudentProfile,
  skillId: string
): ReadingStudentProfile {
  const parts = skillId.split(".");
  const levelId = parseInt(parts[0].replace("R", ""));
  const tierId = `${parts[0]}.${parts[1]}`;
  const updated: ReadingStudentProfile = {
    ...profile,
    current_skill_id: skillId,
    current_tier_id: tierId,
    current_level: levelId,
    last_active: new Date().toISOString(),
  };
  saveReadingProfile(updated);
  return updated;
}

// ─── Mastery ──────────────────────────────────────────────────────────────────

export function initReadingSkillMastery(skillId: string): ReadingSkillMastery {
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

export function evaluateReadingMastery(
  attempts: ReadingSkillAttempt[],
  skill: ReadingAtomicSkill
): ReadingMasteryStatus {
  const { correct_required, formats_required, allow_scaffolding } = skill.mastery_criteria;
  const valid = allow_scaffolding ? attempts : attempts.filter((a) => !a.scaffolded);
  const correct = valid.filter((a) => a.is_correct);
  const formats = new Set<ReadingTemplate>(correct.map((a) => a.template));
  if (correct.length >= correct_required && formats.size >= formats_required) return "mastered";
  if (attempts.length > 0) return "in_progress";
  return "locked";
}

export function updateReadingSkillMastery(
  existing: ReadingSkillMastery,
  attempt: ReadingSkillAttempt,
  skill: ReadingAtomicSkill
): ReadingSkillMastery {
  const updatedAttempts = [...existing.attempts, attempt];
  const newStatus = evaluateReadingMastery(updatedAttempts, skill);
  const formatsUsed = Array.from(
    new Set([...existing.formats_used, attempt.template])
  ) as ReadingTemplate[];

  return {
    ...existing,
    attempts: updatedAttempts,
    attempt_count: existing.attempt_count + 1,
    correct_count: attempt.is_correct ? existing.correct_count + 1 : existing.correct_count,
    scaffolded_attempts: attempt.scaffolded ? existing.scaffolded_attempts + 1 : existing.scaffolded_attempts,
    formats_used: formatsUsed,
    last_attempted: attempt.timestamp,
    status: newStatus,
    mastered_at:
      newStatus === "mastered" && existing.status !== "mastered"
        ? new Date().toISOString()
        : existing.mastered_at,
  };
}

export function updateSessionHistory(
  profile: ReadingStudentProfile,
  skillId: string,
  passed: boolean
): ReadingStudentProfile {
  const existing = profile.sessionHistory[skillId] || [];
  const updated: ReadingStudentProfile = {
    ...profile,
    sessionHistory: {
      ...profile.sessionHistory,
      [skillId]: [...existing, passed],
    },
  };
  saveReadingProfile(updated);
  return updated;
}

// ─── Skill Tree Helpers ───────────────────────────────────────────────────────

type SkillTreeData = {
  levels: Array<{
    id: number;
    title: string;
    description: string;
    tiers: Array<{
      id: string;
      title: string;
      atomic_skills: ReadingAtomicSkill[];
    }>;
  }>;
};

const treeData = readingSkillTreeData as unknown as SkillTreeData;

export function getReadingSkillById(skillId: string): ReadingAtomicSkill | null {
  for (const level of treeData.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getReadingLevelById(levelId: number) {
  return treeData.levels.find((l) => l.id === levelId) || null;
}

export function getReadingTierById(tierId: string) {
  for (const level of treeData.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function getNextReadingSkillId(currentSkillId: string): string | null {
  const parts = currentSkillId.split(".");
  const levelId = parseInt(parts[0].replace("R", ""));
  const tierNum = parseInt(parts[1].replace("T", ""));
  const skillNum = parseInt(parts[2].replace("A", ""));

  const level = getReadingLevelById(levelId);
  if (!level) return null;

  const currentTierId = `${parts[0]}.${parts[1]}`;
  const tier = level.tiers.find((t) => t.id === currentTierId);
  if (tier) {
    const nextSkill = tier.atomic_skills.find(
      (s) => parseInt(s.id.split(".")[2].replace("A", "")) === skillNum + 1
    );
    if (nextSkill) return nextSkill.id;
  }

  const nextTier = level.tiers.find(
    (t) => parseInt(t.id.split(".")[1].replace("T", "")) === tierNum + 1
  );
  if (nextTier && nextTier.atomic_skills.length > 0) {
    return nextTier.atomic_skills[0].id;
  }

  const nextLevel = getReadingLevelById(levelId + 1);
  if (nextLevel && nextLevel.tiers.length > 0 && nextLevel.tiers[0].atomic_skills.length > 0) {
    return nextLevel.tiers[0].atomic_skills[0].id;
  }

  return null;
}

export function getReadingSkillStatus(
  skillId: string,
  profile: ReadingStudentProfile
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile.skill_mastery[skillId];
  if (mastery?.status === "mastered") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";
  const skill = getReadingSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";
  const allMet = skill.prerequisites.every(
    (p) => profile.skill_mastery[p]?.status === "mastered"
  );
  return allMet ? "available" : "locked";
}

export function determineNextReadingAction(
  mastery: ReadingSkillMastery,
  recentAttempts: ReadingSkillAttempt[]
): "continue_skill" | "advance_skill" | "advance_tier" | "advance_level" | "review_prerequisite" {
  if (mastery.status === "mastered") return "advance_skill";
  if (recentAttempts.length >= 3) {
    const lastThree = recentAttempts.slice(-3);
    if (lastThree.every((a) => !a.is_correct)) return "review_prerequisite";
  }
  return "continue_skill";
}

// ─── Decision Engine (Section 10 + Section 11) ────────────────────────────────

export function determineReadingDecision(
  skillId: string,
  profile: ReadingStudentProfile,
  latestResult: { is_correct: boolean; error_type: ReadingErrorType }
): ReadingDecision {
  const mastery = profile.skill_mastery[skillId];
  const skill = getReadingSkillById(skillId);

  // Get recent attempts (last 5)
  const attempts = mastery?.attempts ?? [];
  const last5 = attempts.slice(-5);
  const recentAccuracy = last5.length > 0
    ? last5.filter((a) => a.is_correct).length / last5.length
    : 0;

  // Session history for stability check
  const sessions = profile.sessionHistory[skillId] ?? [];
  const passedSessions = sessions.reduce<number[]>((acc, passed, i) => {
    if (passed) acc.push(i);
    return acc;
  }, []);
  // Session stability: passed in 2+ non-consecutive sessions
  const isSessionStable = passedSessions.length >= 2 && (passedSessions[passedSessions.length - 1] - passedSessions[0]) >= 2;

  // Error pattern tracking
  const errorPattern = profile.errorPatterns[skillId];
  const errorType = latestResult.error_type;
  const retaughtCount = errorPattern?.retaughtCount ?? 0;
  const errorCount = errorPattern?.count ?? 0;

  // ACCELERATE: >90% accuracy in last 5 + 2+ formats + no errors
  if (last5.length >= 5 && recentAccuracy > 0.9 && latestResult.is_correct) {
    const formatsUsed = new Set(last5.map((a) => a.template));
    if (formatsUsed.size >= 2) {
      return "ACCELERATE";
    }
  }

  // ADVANCE: mastered + session stable
  const correctRequired = skill?.mastery_criteria.correct_required ?? 3;
  const isMastered = (mastery?.correct_count ?? 0) >= correctRequired;
  if (isMastered && isSessionStable && latestResult.is_correct) {
    return "ADVANCE";
  }

  // Apply Section 11 error routing table
  if (errorType !== "correct") {
    // BACKTRACK conditions per error type
    if (errorType === "ERR_PHONEME_CONF" && retaughtCount >= 3) return "BACKTRACK";
    if (errorType === "ERR_SOUND_RECALL" && errorCount >= 2) return "BACKTRACK";
    if (errorType === "ERR_BLEND_FAIL" && retaughtCount >= 1 && recentAccuracy < 0.5) return "BACKTRACK";
    if (errorType === "ERR_SOUND_OMIT" && errorCount >= 3) return "BACKTRACK";
    if (errorType === "ERR_SOUND_INSERT" && retaughtCount >= 2) return "BACKTRACK";
    if (errorType === "ERR_VOWEL_CONF" && errorCount >= 2) return "BACKTRACK";
    if (errorType === "ERR_ORTHO_GUESS" && retaughtCount >= 1 && recentAccuracy < 0.6) return "BACKTRACK";
    if (errorType === "ERR_MULTI_BREAK" && retaughtCount >= 1 && recentAccuracy < 0.5) return "BACKTRACK";
    if (errorType === "ERR_MEANING_BLIND" && errorCount >= 2) return "BACKTRACK";
    if (errorType === "ERR_SELF_MON" && recentAccuracy < 0.3 && errorCount >= 3) return "BACKTRACK";

    // BACKTRACK for accuracy < 60% despite reteach
    if (recentAccuracy < 0.6 && retaughtCount >= 2) return "BACKTRACK";

    // PRACTICE conditions (first occurrence for these types)
    if (errorType === "ERR_SIGHT_MISS" && errorCount <= 1) return "PRACTICE";
    if (errorType === "ERR_FLUENCY_HES" && errorCount <= 1) return "PRACTICE";

    // Sight word miss > 30% after 3 PRACTICE → RETEACH
    if (errorType === "ERR_SIGHT_MISS" && errorCount > 3 && recentAccuracy < 0.7) return "RETEACH";
    // Fluency: no improvement after 3 → RETEACH
    if (errorType === "ERR_FLUENCY_HES" && errorCount > 3) return "RETEACH";

    // Default: RETEACH for consistent errors
    if (errorCount >= 2) return "RETEACH";

    // First occurrence of most errors → RETEACH
    return "RETEACH";
  }

  // No errors — check accuracy thresholds
  if (recentAccuracy >= 0.75 && !isMastered) return "PRACTICE";
  if (recentAccuracy >= 0.75 && isMastered && !isSessionStable) return "PRACTICE";
  if (recentAccuracy < 0.75 && last5.length >= 2) return "RETEACH";

  return "PRACTICE";
}

// ─── Diagnostic Placement ─────────────────────────────────────────────────────

export function completeDiagnosticPlacement(
  profile: ReadingStudentProfile,
  result: DiagnosticPlacementResult
): ReadingStudentProfile {
  // Mark all auto-completed skills as mastered
  const updatedMastery = { ...profile.skill_mastery };
  for (const skillId of result.autoCompletedSkillIds) {
    const skill = getReadingSkillById(skillId);
    updatedMastery[skillId] = {
      skill_id: skillId,
      status: "mastered",
      correct_count: skill?.mastery_criteria.correct_required ?? 3,
      attempt_count: skill?.mastery_criteria.correct_required ?? 3,
      formats_used: ["oral"],
      scaffolded_attempts: 0,
      last_attempted: new Date().toISOString(),
      mastered_at: new Date().toISOString(),
      attempts: [],
    };
  }

  // Derive level/tier from entry skill id
  const parts = result.entrySkillId.split(".");
  const levelId = parseInt(parts[0].replace("R", ""));
  const tierId = `${parts[0]}.${parts[1]}`;

  const updated: ReadingStudentProfile = {
    ...profile,
    placementCompleted: true,
    placement: result,
    skill_mastery: updatedMastery,
    current_skill_id: result.entrySkillId,
    current_tier_id: tierId,
    current_level: levelId,
    last_active: new Date().toISOString(),
  };
  saveReadingProfile(updated);
  return updated;
}

export function getReadingLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, ReadingSkillMastery>
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter((id) => masteryMap[id]?.status === "mastered").length;
  return Math.round((mastered / skillIds.length) * 100);
}
