// ─── Matric Physical Sciences student model ─────────────────────────────────
//
// Persistence mirrors lib/nst-student-model.ts: a single serialised profile is
// the unit of progress. localStorage stays the working store; every save also
// upserts the profile to Supabase `student_profiles` (subject
// "matric-physical-sciences") so progress restores across devices.
//
// Matric Phys-Sci atomic skills are independent (prerequisites encoded in the
// tree but not enforced at runtime). Mastery is judged per skill by running
// accuracy ≥ passThreshold once enough attempts have been recorded.

import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";
import { physSciConfig, type PhysSciGrade } from "@/lib/phys-sci-grade";

export type MatricPhysSciSkillStatus = "available" | "in_progress" | "mastered";

export interface MatricPhysSciProfile {
  id: string;
  name: string;
  grade: PhysSciGrade;
  /** skill_id → status. Absent ⇒ "available". */
  mastery: Record<string, MatricPhysSciSkillStatus>;
  /** skill_id → item ids already served. */
  used_questions: Record<string, string[]>;
  /** skill_id → running correct count. */
  correct_by_skill: Record<string, number>;
  /** skill_id → running attempt count. */
  attempts_by_skill: Record<string, number>;
  total_attempts: number;
  total_correct: number;
  session_count: number;
  created_at: string;
  last_active: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `matricps_${Date.now()}`;
}

// ─── Load / Save (localStorage + Supabase) ────────────────────────────────────

export function loadMatricPhysSciProfile(grade: PhysSciGrade = 12): MatricPhysSciProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(physSciConfig(grade).storageKey);
    if (raw) return JSON.parse(raw) as MatricPhysSciProfile;
  } catch {
    /* fall through to null */
  }
  return null;
}

export function saveMatricPhysSciProfile(profile: MatricPhysSciProfile): void {
  if (typeof window === "undefined") return;
  const config = physSciConfig(profile.grade);
  try {
    localStorage.setItem(config.storageKey, JSON.stringify(profile));
  } catch {
    /* quota or disabled — ignore */
  }
  void (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      void retrySupabase(() => supabase.from("student_profiles").upsert({
        id: profile.id,
        subject: config.subject,
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

export function createMatricPhysSciProfile(name: string, grade: PhysSciGrade = 12): MatricPhysSciProfile {
  const now = new Date().toISOString();
  const profile: MatricPhysSciProfile = {
    id: newId(),
    name,
    grade,
    mastery: {},
    used_questions: {},
    correct_by_skill: {},
    attempts_by_skill: {},
    total_attempts: 0,
    total_correct: 0,
    session_count: 1,
    created_at: now,
    last_active: now,
  };
  saveMatricPhysSciProfile(profile);
  return profile;
}

/**
 * Loads the stored profile or creates a fresh one, then refreshes the name and
 * persists.
 */
export function getOrCreateMatricPhysSciProfile(name = "Learner", grade: PhysSciGrade = 12): MatricPhysSciProfile {
  const existing = loadMatricPhysSciProfile(grade);
  if (!existing) return createMatricPhysSciProfile(name, grade);
  const refreshed: MatricPhysSciProfile = {
    ...existing,
    name: name || existing.name,
    last_active: new Date().toISOString(),
  };
  saveMatricPhysSciProfile(refreshed);
  return refreshed;
}

export async function linkMatricPhysSciProfileToAuth(profileId: string): Promise<void> {
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

export async function hydrateMatricPhysSciProfileFromSupabase(grade: PhysSciGrade = 12): Promise<MatricPhysSciProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    const { data } = await supabase
      .from("student_profiles")
      .select("profile_data")
      .eq("auth_user_id", user.id)
      .eq("subject", physSciConfig(grade).subject)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data?.profile_data) return null;
    return data.profile_data as unknown as MatricPhysSciProfile;
  } catch {
    return null;
  }
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

export function getMatricPhysSciMasteryMap(grade: PhysSciGrade = 12): Record<string, MatricPhysSciSkillStatus> {
  return loadMatricPhysSciProfile(grade)?.mastery ?? {};
}

export function getMatricPhysSciUsedRefs(skillId: string, grade: PhysSciGrade = 12): string[] {
  return loadMatricPhysSciProfile(grade)?.used_questions?.[skillId] ?? [];
}

/**
 * Records a single answer: marks the question used and rolls running totals.
 */
export function recordMatricPhysSciAnswer(
  skillId: string,
  itemId: string,
  isCorrect: boolean,
  grade: PhysSciGrade = 12,
): MatricPhysSciProfile | null {
  const profile = loadMatricPhysSciProfile(grade);
  if (!profile) return null;
  const existingRefs = profile.used_questions[skillId] ?? [];
  const updated: MatricPhysSciProfile = {
    ...profile,
    used_questions: {
      ...profile.used_questions,
      [skillId]: [...existingRefs, itemId],
    },
    correct_by_skill: {
      ...profile.correct_by_skill,
      [skillId]: (profile.correct_by_skill[skillId] ?? 0) + (isCorrect ? 1 : 0),
    },
    attempts_by_skill: {
      ...profile.attempts_by_skill,
      [skillId]: (profile.attempts_by_skill[skillId] ?? 0) + 1,
    },
    total_attempts: profile.total_attempts + 1,
    total_correct: profile.total_correct + (isCorrect ? 1 : 0),
    last_active: new Date().toISOString(),
  };
  saveMatricPhysSciProfile(updated);
  return updated;
}

export function setMatricPhysSciMastery(
  skillId: string,
  status: MatricPhysSciSkillStatus,
  grade: PhysSciGrade = 12,
): void {
  const profile = loadMatricPhysSciProfile(grade);
  if (!profile) return;
  if (profile.mastery[skillId] === status) return;
  const updated: MatricPhysSciProfile = {
    ...profile,
    mastery: { ...profile.mastery, [skillId]: status },
    last_active: new Date().toISOString(),
  };
  saveMatricPhysSciProfile(updated);
}
