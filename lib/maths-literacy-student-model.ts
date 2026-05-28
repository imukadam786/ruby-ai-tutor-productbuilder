import mathsLiteracySkillTreeData from "@/data/maths-literacy-skill-tree.json";
import type {
  MathsLiteracyAtomicSkill,
  MathsLiteracyLevel,
  MathsLiteracySkillTree,
  MathsLiteracySkillMastery,
  MathsLiteracySkillAttempt,
  MathsLiteracyStudentProfile,
} from "@/types/maths-literacy";

const tree = mathsLiteracySkillTreeData as unknown as MathsLiteracySkillTree;

// ─── Storage (localStorage MVP) ─────────────────────────────────────────────
const STORAGE_KEY = "ruby_maths_literacy_profile";

function emptyProfile(): MathsLiteracyStudentProfile {
  const now = new Date().toISOString();
  return {
    id: `mlp_${Date.now()}`,
    name: "Learner",
    grade: 10,
    current_skill_id: "L1.T1.A1",
    skill_mastery: {},
    session_count: 0,
    total_attempts: 0,
    total_correct: 0,
    created_at: now,
    last_active: now,
  };
}

export function getMathsLiteracyProfile(): MathsLiteracyStudentProfile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    return JSON.parse(raw) as MathsLiteracyStudentProfile;
  } catch {
    return emptyProfile();
  }
}

export function saveMathsLiteracyProfile(profile: MathsLiteracyStudentProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

// ─── Tree helpers ────────────────────────────────────────────────────────────
export function getMathsLiteracySkillById(skillId: string): MathsLiteracyAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getMathsLiteracyLevels(): MathsLiteracyLevel[] {
  return tree.levels;
}

export function getMathsLiteracyTree(): MathsLiteracySkillTree {
  return tree;
}

export type MathsLiteracySkillStatus = "locked" | "available" | "in_progress" | "mastered";

export function getMathsLiteracySkillStatus(
  skillId: string,
  profile: MathsLiteracyStudentProfile | null
): MathsLiteracySkillStatus {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";
  const skill = getMathsLiteracySkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";
  const allMet = skill.prerequisites.every(
    (p) => profile?.skill_mastery[p]?.status === "mastered"
  );
  return allMet ? "available" : "locked";
}

export function getNextMathsLiteracySkillId(currentSkillId: string): string | null {
  // Skill IDs are L{level}.T{tier}.A{activity}
  const m = currentSkillId.match(/^L(\d+)\.T(\d+)\.A(\d+)$/);
  if (!m) return null;
  const [, levelStr, tierStr, actStr] = m;
  const levelNum = parseInt(levelStr, 10);
  const tierNum = parseInt(tierStr, 10);
  const actNum = parseInt(actStr, 10);

  const level = tree.levels.find((l) => l.id === levelNum);
  if (!level) return null;

  // Try next activity in current tier
  const currentTierId = `L${levelNum}.T${tierNum}`;
  const currentTier = level.tiers.find((t) => t.id === currentTierId);
  if (currentTier) {
    const next = currentTier.atomic_skills.find(
      (s) => {
        const mm = s.id.match(/\.A(\d+)$/);
        return mm && parseInt(mm[1], 10) === actNum + 1;
      }
    );
    if (next) return next.id;
  }

  // Try first activity in next tier
  const nextTier = level.tiers.find((t) => {
    const mm = t.id.match(/\.T(\d+)$/);
    return mm && parseInt(mm[1], 10) === tierNum + 1;
  });
  if (nextTier && nextTier.atomic_skills.length > 0) return nextTier.atomic_skills[0].id;

  // Try first skill of next level
  const nextLevel = tree.levels.find((l) => l.id === levelNum + 1);
  if (nextLevel && nextLevel.tiers[0]?.atomic_skills[0]) {
    return nextLevel.tiers[0].atomic_skills[0].id;
  }

  return null;
}

// ─── Mastery update ──────────────────────────────────────────────────────────
export function updateMathsLiteracySkillMastery(
  profile: MathsLiteracyStudentProfile,
  attempt: MathsLiteracySkillAttempt
): { profile: MathsLiteracyStudentProfile; mastered: boolean } {
  const skill = getMathsLiteracySkillById(attempt.skill_id);
  const required = skill?.mastery_criteria.correct_required ?? 3;

  const prev: MathsLiteracySkillMastery = profile.skill_mastery[attempt.skill_id] ?? {
    skill_id: attempt.skill_id,
    status: "in_progress",
    correct_count: 0,
    attempt_count: 0,
    last_attempted: attempt.timestamp,
    attempts: [],
  };

  const correct_count = prev.correct_count + (attempt.is_correct ? 1 : 0);
  const attempt_count = prev.attempt_count + 1;
  const wasMastered = prev.status === "mastered";
  const becomesMastered = !wasMastered && correct_count >= required;

  const next: MathsLiteracySkillMastery = {
    ...prev,
    correct_count,
    attempt_count,
    last_attempted: attempt.timestamp,
    status: becomesMastered || wasMastered ? "mastered" : "in_progress",
    mastered_at: becomesMastered ? attempt.timestamp : prev.mastered_at,
    attempts: [...prev.attempts.slice(-19), attempt], // keep last 20
  };

  const updated: MathsLiteracyStudentProfile = {
    ...profile,
    skill_mastery: { ...profile.skill_mastery, [attempt.skill_id]: next },
    total_attempts: profile.total_attempts + 1,
    total_correct: profile.total_correct + (attempt.is_correct ? 1 : 0),
    last_active: attempt.timestamp,
  };
  return { profile: updated, mastered: becomesMastered };
}
