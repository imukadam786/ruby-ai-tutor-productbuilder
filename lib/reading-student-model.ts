import {
  ReadingStudentProfile,
  ReadingSkillMastery,
  ReadingSkillAttempt,
  ReadingErrorType,
  ReadingAtomicSkill,
  ReadingMasteryStatus,
  ReadingTemplate,
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
      omission: 0,
      sequence_error: 0,
      recall_error: 0,
      phoneme_error: 0,
      fluency_error: 0,
      comprehension_gap: 0,
      encoding_error: 0,
      correct: 0,
    },
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

export function getReadingLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, ReadingSkillMastery>
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter((id) => masteryMap[id]?.status === "mastered").length;
  return Math.round((mastered / skillIds.length) * 100);
}
