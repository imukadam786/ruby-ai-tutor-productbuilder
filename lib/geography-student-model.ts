// ─── Geography student model ──────────────────────────────────────────────────
//
// FET content subject (Grades 10–12). Direct mirror of
// lib/history-student-model.ts.
//
// FET rule: no timer, pass mark 0.6 per skill, 20-item target pool. Mastery is
// decided by the caller from accuracy ≥ pass_threshold over a full session.
// Every pool ships ungated (gate "NONE", prerequisites []), so every skill is
// "available" from day one.

import geographySkillTreeData from "@/data/geography-skill-tree.json";
import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { seedForGrade } from "@/lib/geography-grade-map";
import type {
  GeographyAtomicSkill,
  GeographySkillMastery,
  GeographySkillTree,
  GeographyStudentProfile,
} from "@/types/geography";

const STORAGE_KEY = "geography-profile-v1";
const SUBJECT = "geography";

const tree = geographySkillTreeData as unknown as GeographySkillTree;

// ─── Load / Save (localStorage + Supabase mirror) ─────────────────────────────

export function loadGeographyProfile(): GeographyStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GeographyStudentProfile;
  } catch {
    return null;
  }
}

export function saveGeographyProfile(profile: GeographyStudentProfile): void {
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

export async function linkGeographyProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateGeographyProfileFromSupabase(): Promise<GeographyStudentProfile | null> {
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
    return data.profile_data as unknown as GeographyStudentProfile;
  } catch {
    return null;
  }
}

export function createGeographyProfile(name: string, grade: number): GeographyStudentProfile {
  const seed = seedForGrade(grade);
  const profile: GeographyStudentProfile = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `geo_${Date.now()}`,
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
  saveGeographyProfile(profile);
  return profile;
}

export function getOrCreateGeographyProfile(grade: number, name = "Learner"): GeographyStudentProfile {
  return loadGeographyProfile() ?? createGeographyProfile(name, grade);
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

export function getGeographySkillById(skillId: string): GeographyAtomicSkill | null {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const skill = tier.atomic_skills.find((s) => s.id === skillId);
      if (skill) return skill;
    }
  }
  return null;
}

export function getGeographyLevelById(levelId: number) {
  return tree.levels.find((l) => l.id === levelId) || null;
}

export function getGeographyTierById(tierId: string) {
  for (const level of tree.levels) {
    const tier = level.tiers.find((t) => t.id === tierId);
    if (tier) return tier;
  }
  return null;
}

export function friendlyGeographySkillName(skillId: string | null | undefined): string {
  if (!skillId) return "your starting topic";
  return getGeographySkillById(skillId)?.title ?? "your starting topic";
}

// ─── Mastery / status ─────────────────────────────────────────────────────────

export function initGeographySkillMastery(skillId: string): GeographySkillMastery {
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
 * mastered (or assumed). Geography ships every skill with no prerequisites, so
 * everything is open from day one — the locked branch only ever fires if a
 * future grade introduces chains.
 */
export function getGeographySkillStatus(
  skillId: string,
  profile: GeographyStudentProfile | null,
): "locked" | "available" | "in_progress" | "mastered" {
  const mastery = profile?.skill_mastery[skillId];
  if (mastery?.status === "mastered" || mastery?.status === "assumed") return "mastered";
  if (mastery?.status === "in_progress") return "in_progress";

  const skill = getGeographySkillById(skillId);
  if (!skill) return "locked";
  if (skill.prerequisites.length === 0) return "available";

  const allMet = skill.prerequisites.every((p) => {
    const s = profile?.skill_mastery[p]?.status;
    return s === "mastered" || s === "assumed";
  });
  return allMet ? "available" : "locked";
}

export function markGeographySkillInProgress(
  profile: GeographyStudentProfile,
  skillId: string,
): GeographyStudentProfile {
  const existing = profile.skill_mastery[skillId];
  if (existing?.status === "mastered" || existing?.status === "in_progress") return profile;
  const updated: GeographyStudentProfile = {
    ...profile,
    skill_mastery: {
      ...profile.skill_mastery,
      [skillId]: {
        ...(existing ?? initGeographySkillMastery(skillId)),
        status: "in_progress",
        last_attempted: new Date().toISOString(),
      },
    },
    last_active: new Date().toISOString(),
  };
  saveGeographyProfile(updated);
  return updated;
}

/**
 * Records end-of-session result. Caller decides `mastered` from
 * accuracy ≥ pass_threshold (0.6 for FET).
 */
export function recordGeographySkillResult(
  profile: GeographyStudentProfile,
  skillId: string,
  result: { correct: number; attempts: number; mastered: boolean },
): GeographyStudentProfile {
  const existing = profile.skill_mastery[skillId] ?? initGeographySkillMastery(skillId);
  const status = result.mastered ? "mastered" : "in_progress";
  const updated: GeographyStudentProfile = {
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
  saveGeographyProfile(updated);
  return updated;
}

export function getGeographyLevelProgress(
  skillIds: string[],
  masteryMap: Record<string, GeographySkillMastery>,
): number {
  if (skillIds.length === 0) return 0;
  const mastered = skillIds.filter(
    (id) => masteryMap[id]?.status === "mastered" || masteryMap[id]?.status === "assumed",
  ).length;
  return Math.round((mastered / skillIds.length) * 100);
}

// ─── Used-question tracking ───────────────────────────────────────────────────

export function getGeographyUsedRefs(
  profile: GeographyStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] ?? [];
}

export function markGeographyQuestionUsed(
  profile: GeographyStudentProfile,
  skillId: string,
  ref: string,
): GeographyStudentProfile {
  const existing = profile.used_questions?.[skillId] ?? [];
  const updated: GeographyStudentProfile = {
    ...profile,
    used_questions: {
      ...(profile.used_questions ?? {}),
      [skillId]: [...existing, ref],
    },
  };
  saveGeographyProfile(updated);
  return updated;
}
