// ─── Natural Sciences SP student model ────────────────────────────────────────
//
// Senior-Phase content subject (Grades 7–9). Direct mirror of
// lib/geography-student-model.ts.
//
// Content-subject rule: no timer, pass mark 0.6 per skill, 20-item target pool.
// Mastery is decided by the caller from cumulative coverage + accuracy (see
// lib/content-mastery.ts). Every pool ships ungated (gate "NONE",
// prerequisites []), so every skill is "available" from day one.

import emsSpSkillTreeData from "@/data/ems-sp-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/ems-sp-grade-map";
import type {
  EmsSpAtomicSkill,
  EmsSpSkillMastery,
  EmsSpSkillTree,
  EmsSpStudentProfile,
} from "@/types/ems-sp";

const STORAGE_KEY = "ems-sp-profile-v1";
const SUBJECT = "ems-sp";

const tree = emsSpSkillTreeData as unknown as EmsSpSkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadEmsSpProfile(): EmsSpStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EmsSpStudentProfile;
  } catch {
    return null;
  }
}

export function saveEmsSpProfile(profile: EmsSpStudentProfile): void {
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

export async function linkEmsSpProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateEmsSpProfileFromSupabase(): Promise<EmsSpStudentProfile | null> {
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
    return data.profile_data as unknown as EmsSpStudentProfile;
  } catch {
    return null;
  }
}

export function createEmsSpProfile(name: string, grade: number): EmsSpStudentProfile {
  const seed = seedForGrade(grade);
  const profile: EmsSpStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ems_${Date.now()}`,
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
  saveEmsSpProfile(profile);
  return profile;
}

export function getOrCreateEmsSpProfile(grade: number, name = "Learner"): EmsSpStudentProfile {
  return loadEmsSpProfile() ?? createEmsSpProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getEmsSpSkillById(skillId: string): EmsSpAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getEmsSpLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getEmsSpTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyEmsSpSkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getEmsSpSkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initEmsSpSkillMastery(skillId: string): EmsSpSkillMastery {
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
 * Status for the tree UI. A skill is `available` once all its prerequisites are
 * mastered (or assumed). Natural Sciences SP ships every skill with no
 * prerequisites, so everything is open from day one — the locked branch only
 * ever fires if a future grade introduces chains.
 */
export function getEmsSpSkillStatus(
  skillId: string,
  profile: EmsSpStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getEmsSpSkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markEmsSpSkillInProgress(
  profile: EmsSpStudentProfile,
  skillId: string,
): EmsSpStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: EmsSpStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initEmsSpSkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveEmsSpProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from cumulative
 * coverage + accuracy (content-mastery engine).
 */
export function recordEmsSpSkillResult(
  profile: EmsSpStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): EmsSpStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initEmsSpSkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: EmsSpStudentProfile = {
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
  saveEmsSpProfile(updated);
  return updated;
}

export function getEmsSpLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, EmsSpSkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getEmsSpUsedRefs(
  profile: EmsSpStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markEmsSpQuestionUsed(
  profile: EmsSpStudentProfile,
  skillId: string,
  ref: string,
): EmsSpStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: EmsSpStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveEmsSpProfile(updated);
  return updated;
}
