import { StudentProfile, SkillMastery, SkillAttempt, ErrorType, AtomicSkill, MathsPlacementResult } from "@/types/ruby";
import skillTreeData from "@/data/skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";

const STUDENT_KEY = "ruby_student_profile";
const DEFAULT_STARTING_SKILL = "L1.T1.A1";
const DEFAULT_STARTING_LEVEL = 1;
const DEFAULT_STARTING_TIER = "L1.T1";

// ─── Load / Save ──────────────────────────────────────────────────────────────

export function getStudentProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDENT_KEY, JSON.stringify(profile));
  // Supabase sync with retry — localStorage is source of truth
  void retrySupabase(() => supabase.from("student_profiles").upsert({
    id: profile.id,
    subject: "maths",
    name: profile.name,
    grade: profile.grade,
    profile_data: profile as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" }));
}

export function createStudentProfile(name: string, grade: number): StudentProfile {
  const profile: StudentProfile = {
    id: `student_${Date.now()}`,
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
      correct: 0,
      conceptual_gap: 0,
      strategy_gap: 0,
      representation_confusion: 0,
      execution_slip: 0,
    },
    used_questions: {},
    placementCompleted: false,
  };
  saveStudentProfile(profile);
  return profile;
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export function recordAttempt(
  profile: StudentProfile,
  attempt: SkillAttempt,
  updatedMastery: SkillMastery
): StudentProfile {
  const errorHistoryKey = attempt.error_type as ErrorType;
  const updated: StudentProfile = {
    ...profile,
    total_attempts: profile.total_attempts + 1,
    total_correct: attempt.is_correct
      ? profile.total_correct + 1
      : profile.total_correct,
    last_active: new Date().toISOString(),
    skill_mastery: {
      ...profile.skill_mastery,
      [attempt.skill_id]: updatedMastery,
    },
    error_history: {
      ...profile.error_history,
      [errorHistoryKey]: (profile.error_history[errorHistoryKey] || 0) + 1,
    },
  };
  saveStudentProfile(updated);
  // Supabase sync with retry
  void retrySupabase(() => supabase.from("skill_attempts").insert({
    student_id: profile.id,
    subject: "maths",
    skill_id: attempt.skill_id,
    is_correct: attempt.is_correct,
    error_type: attempt.error_type ?? null,
    template: attempt.template ?? null,
    scaffolded: attempt.scaffolded ?? false,
    p_learned: updatedMastery.p_learned ?? null,
  }));
  return updated;
}

export function advanceToSkill(
  profile: StudentProfile,
  skillId: string
): StudentProfile {
  // Parse skillId to get level and tier
  const parts = skillId.split(".");
  const levelId = parseInt(parts[0].replace("L", ""));
  const tierId = `${parts[0]}.${parts[1]}`;

  const updated: StudentProfile = {
    ...profile,
    current_skill_id: skillId,
    current_tier_id: tierId,
    current_level: levelId,
    last_active: new Date().toISOString(),
  };
  saveStudentProfile(updated);
  return updated;
}

// ─── Skill Tree Helpers ───────────────────────────────────────────────────────

export function getSkillById(skillId: string): AtomicSkill | null {
  for (const level of skillTreeData.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill as unknown as AtomicSkill;
    }
  }
  return null;
}

export function getTierById(tierId: string) {
  for (const level of skillTreeData.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function getLevelById(levelId: number) {
  return skillTreeData.levels.find((l) => l.id === levelId) || null;
}

export function getNextSkillId(currentSkillId: string): string | null {
  const parts = currentSkillId.split(".");
  const levelId = parseInt(parts[0].replace("L", ""));
  const tierNum = parseInt(parts[1].replace("T", ""));
  const skillNum = parseInt(parts[2].replace("A", ""));

  const level = getLevelById(levelId);
  if (!level) return null;

  // Try next skill in same tier
  const currentTierId = `${parts[0]}.${parts[1]}`;
  const tier = level.tiers.find((t) => t.id === currentTierId);
  if (tier) {
    const nextSkill = tier.atomic_skills.find(
      (s) => parseInt(s.id.split(".")[2].replace("A", "")) === skillNum + 1
    );
    if (nextSkill) return nextSkill.id;
  }

  // Try next tier in same level
  const nextTier = level.tiers.find(
    (t) => parseInt(t.id.split(".")[1].replace("T", "")) === tierNum + 1
  );
  if (nextTier && nextTier.atomic_skills.length > 0) {
    return nextTier.atomic_skills[0].id;
  }

  // Try first skill of next level
  const nextLevel = getLevelById(levelId + 1);
  if (nextLevel && nextLevel.tiers.length > 0 && nextLevel.tiers[0].atomic_skills.length > 0) {
    return nextLevel.tiers[0].atomic_skills[0].id;
  }

  return null; // Top of the tree
}

export function arePrerequisitesMet(
  skillId: string,
  masteryMap: Record<string, SkillMastery>
): boolean {
  const skill = getSkillById(skillId);
  if (!skill) return false;
  if (skill.prerequisites.length === 0) return true;
  return skill.prerequisites.every(
    (prereqId) => masteryMap[prereqId]?.status === "mastered" || masteryMap[prereqId]?.status === "assumed"
  );
}

// ─── Skill Tree Navigation for UI ─────────────────────────────────────────────

export function getSkillStatus(
  skillId: string,
  profile: StudentProfile
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile.skill_mastery[skillId];
  if (mastery?.status === "mastered") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  // Check if available (prerequisites met)
  if (arePrerequisitesMet(skillId, profile.skill_mastery)) return "available";
  return "locked";
}

export function getAllSkillIds(): string[] {
  const ids: string[] = [];
  for (const level of skillTreeData.levels) {
    for (const tier of level.tiers) {
      for (const skill of tier.atomic_skills) {
        ids.push(skill.id);
      }
    }
  }
  return ids;
}

export function getSkillIdsForLevels(belowLevel: number): string[] {
  const ids: string[] = [];
  for (const level of skillTreeData.levels) {
    if (level.id >= belowLevel) break;
    for (const tier of level.tiers) {
      for (const skill of tier.atomic_skills) {
        ids.push(skill.id);
      }
    }
  }
  return ids;
}

// ─── Maths Placement ──────────────────────────────────────────────────────────

function deriveDominantErrors(tasks: MathsPlacementResult["tasks"]): string[] {
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    if (t.error_type && t.error_type !== "correct") {
      counts[t.error_type] = (counts[t.error_type] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([code]) => code);
}

export function completeMathsPlacement(
  profile: StudentProfile,
  result: MathsPlacementResult
): StudentProfile {
  const updatedMastery = { ...profile.skill_mastery };
  for (const skillId of result.autoCompletedSkillIds) {
    updatedMastery[skillId] = {
      skill_id: skillId,
      status: "assumed",
      correct_count: 0,
      attempt_count: 0,
      formats_used: [],
      scaffolded_attempts: 0,
      last_attempted: new Date().toISOString(),
      attempts: [],
      p_learned: 0.70,
    };
  }
  const parts = result.entrySkillId.split(".");
  const levelId = parseInt(parts[0].replace("L", ""));
  const tierId = `${parts[0]}.${parts[1]}`;
  const updated: StudentProfile = {
    ...profile,
    placementCompleted: true,
    placement: result,
    skill_mastery: updatedMastery,
    current_skill_id: result.entrySkillId,
    current_tier_id: tierId,
    current_level: levelId,
    last_active: new Date().toISOString(),
  };
  saveStudentProfile(updated);
  // Supabase: record diagnostic result for analytics (mirrors reading model)
  void retrySupabase(() => supabase.from("diagnostic_results").insert({
    student_id: profile.id,
    subject: "maths",
    entry_skill_id: result.entrySkillId,
    entry_level: levelId,
    auto_completed_skill_ids: result.autoCompletedSkillIds,
    dominant_errors: deriveDominantErrors(result.tasks),
    hard_gate_passed: result.hardGatePassed,
    completed_at: new Date(result.completedAt).toISOString(),
  }));
  return updated;
}
