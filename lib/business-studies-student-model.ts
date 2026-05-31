// ─── BusinessStudies student model ────────────────────────────────────────────────────
//
// FET content subject (Grades 10–12). Direct mirror of
// lib/life-sciences-student-model.ts.
//
// FET rule: no timer, pass mark 0.6 per skill, 20-item target pool. Mastery
// is decided by the caller from accuracy ≥ pass_threshold over a full session.

import historySkillTreeData from "@/data/business-studies-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/business-studies-grade-map";
import type {
  BusinessStudiesAtomicSkill,
  BusinessStudiesSkillMastery,
  BusinessStudiesSkillTree,
  BusinessStudiesStudentProfile,
} from "@/types/business-studies";

const STORAGE_KEY = "business-studies-profile-v1";
const SUBJECT = "business-studies";

const tree = historySkillTreeData as unknown as BusinessStudiesSkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadBusinessStudiesProfile(): BusinessStudiesStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BusinessStudiesStudentProfile;
  } catch {
    return null;
  }
}

export function saveBusinessStudiesProfile(profile: BusinessStudiesStudentProfile): void {
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

export async function linkBusinessStudiesProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateBusinessStudiesProfileFromSupabase(): Promise<BusinessStudiesStudentProfile | null> {
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
    return data.profile_data as unknown as BusinessStudiesStudentProfile;
  } catch {
    return null;
  }
}

export function createBusinessStudiesProfile(name: string, grade: number): BusinessStudiesStudentProfile {
  const seed = seedForGrade(grade);
  const profile: BusinessStudiesStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `his_${Date.now()}`,
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
  saveBusinessStudiesProfile(profile);
  return profile;
}

export function getOrCreateBusinessStudiesProfile(grade: number, name = "Learner"): BusinessStudiesStudentProfile {
  return loadBusinessStudiesProfile() ?? createBusinessStudiesProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getBusinessStudiesSkillById(skillId: string): BusinessStudiesAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getBusinessStudiesLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getBusinessStudiesTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyBusinessStudiesSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getBusinessStudiesSkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initBusinessStudiesSkillMastery(skillId: string): BusinessStudiesSkillMastery {
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
 * Status for the tree UI. A skill is `available` only when all its
 * prerequisites are mastered (or assumed). Prerequisite-less skills are always
 * available within their grade level. (Grade 10's tree has no prereqs, so
 * everything is open from day one — locked status will surface if/when
 * future grades introduce chains.)
 */
export function getBusinessStudiesSkillStatus(
  skillId: string,
  profile: BusinessStudiesStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getBusinessStudiesSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markBusinessStudiesSkillInProgress(
  profile: BusinessStudiesStudentProfile,
  skillId: string,
): BusinessStudiesStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: BusinessStudiesStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initBusinessStudiesSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveBusinessStudiesProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from
 * accuracy ≥ pass_threshold (0.6 for FET).
 */
export function recordBusinessStudiesSkillResult(
  profile: BusinessStudiesStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): BusinessStudiesStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initBusinessStudiesSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: BusinessStudiesStudentProfile = {
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
  saveBusinessStudiesProfile(updated);
  return updated;
}

export function getBusinessStudiesLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, BusinessStudiesSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getBusinessStudiesUsedRefs(
  profile: BusinessStudiesStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markBusinessStudiesQuestionUsed(
  profile: BusinessStudiesStudentProfile,
  skillId: string,
  ref: string,
): BusinessStudiesStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: BusinessStudiesStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveBusinessStudiesProfile(updated);
  return updated;
}
