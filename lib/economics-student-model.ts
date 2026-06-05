// ─── Economics student model ─────────────────────────────────────────────────
//
// FET content subject (Grades 10–12). Direct mirror of
// lib/accounting-student-model.ts.
//
// FET rule: no timer, pass mark 0.6 per skill, 20-item target pool. Mastery
// is decided by the caller from accuracy ≥ pass_threshold over a full session.
// All-unlocked within a grade (empty prerequisite arrays).

import economicsSkillTreeData from "@/data/economics-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/economics-grade-map";
import type {
  EconomicsAtomicSkill,
  EconomicsSkillMastery,
  EconomicsSkillTree,
  EconomicsStudentProfile,
} from "@/types/economics";

const STORAGE_KEY = "economics-profile-v1";
const SUBJECT = "economics";

const tree = economicsSkillTreeData as unknown as EconomicsSkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadEconomicsProfile(): EconomicsStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EconomicsStudentProfile;
  } catch {
    return null;
  }
}

export function saveEconomicsProfile(profile: EconomicsStudentProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota or disabled — ignore */
  }
  void (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      void retrySupabase(() => supabase.from("student_profiles").upsert({
        id: profile.id,
        subject: SUBJECT,
        name: profile.name,
        grade: profile.grade,
        ...(user?.id ? { auth_user_id: user.id } : {}),
        profile_data: profile as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" }));
    } catch {
      /* non-critical */
    }
  })();
}

export async function linkEconomicsProfileToAuth(profileId: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    void retrySupabase(() =>
      supabase.from("student_profiles")
        .update({ auth_user_id: user.id })
        .eq("id", profileId),
    );
  } catch {
    /* non-critical */
  }
}

export async function hydrateEconomicsProfileFromSupabase(): Promise<EconomicsStudentProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    const { data } = await supabase
      .from("student_profiles")
      .select("profile_data")
      .eq("auth_user_id", user.id)
      .eq("subject", SUBJECT)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data?.profile_data) return null;
    return data.profile_data as unknown as EconomicsStudentProfile;
  } catch {
    return null;
  }
}

export function createEconomicsProfile(name: string, grade: number): EconomicsStudentProfile {
  const seed = seedForGrade(grade);
  const profile: EconomicsStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `econ_${Date.now()}`,
    name,
    grade,
    current_level: seed.level,
    current_skill_id: seed.entrySkillId,
    skill_mastery: {},
    session_count: 1,
    total_attempts: 0,
    total_correct: 0,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    used_questions: {},
  };
  saveEconomicsProfile(profile);
  return profile;
}

export function getOrCreateEconomicsProfile(grade: number, name = "Learner"): EconomicsStudentProfile {
  return loadEconomicsProfile() ?? createEconomicsProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getEconomicsSkillById(skillId: string): EconomicsAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getEconomicsLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getEconomicsTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyEconomicsSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getEconomicsSkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initEconomicsSkillMastery(skillId: string): EconomicsSkillMastery {
  return {
    skill_id: skillId,
    status: "available",
    correct_count: 0,
    attempt_count: 0,
    formats_used: [],
    last_attempted: new Date().toISOString(),
  };
}

/**
 * Status for the tree UI. Economics has no prerequisite chains, so every skill
 * in the learner's grade is `available` from day one (unless already started or
 * mastered). The prerequisite check is kept for parity with the other subjects.
 */
export function getEconomicsSkillStatus(
  skillId: string,
  profile: EconomicsStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getEconomicsSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markEconomicsSkillInProgress(
  profile: EconomicsStudentProfile,
  skillId: string,
): EconomicsStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: EconomicsStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initEconomicsSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveEconomicsProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from
 * accuracy ≥ pass_threshold (0.6 for FET).
 */
export function recordEconomicsSkillResult(
  profile: EconomicsStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): EconomicsStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initEconomicsSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: EconomicsStudentProfile = {
    ...profile,
    total_attempts: profile.total_attempts + result.attempts,
    total_correct: profile.total_correct + result.correct,
    last_active: new Date().toISOString(),
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...existing,
        status,
        correct_count: existing.correct_count + result.correct,
        attempt_count: existing.attempt_count + result.attempts,
        last_attempted: new Date().toISOString(),
        mastered_at:
          result.mastered && existing.status !== "mastered"
            ? new Date().toISOString()
            : existing.mastered_at,
      },
    },
  };
  saveEconomicsProfile(updated);
  return updated;
}

export function getEconomicsLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, EconomicsSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getEconomicsUsedRefs(
  profile: EconomicsStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markEconomicsQuestionUsed(
  profile: EconomicsStudentProfile,
  skillId: string,
  ref: string,
): EconomicsStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: EconomicsStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveEconomicsProfile(updated);
  return updated;
}
