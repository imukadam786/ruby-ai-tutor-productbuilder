// ─── Life Skills student model ────────────────────────────────────────────────
//
// Persistence mirrors Maths (lib/student-model.ts) and Afrikaans
// (lib/afrikaans-student-model.ts): a single serialized profile is the unit of
// progress. localStorage stays the working store; every save also upserts the
// profile to Supabase `student_profiles` (subject "life-skills") so a learner's
// progress restores across devices or after cleared storage.
//
// Life Skills topics are independent (no prerequisite chains) and mastery is
// judged per topic by session accuracy ≥ pass_threshold, so the stored model is
// deliberately lightweight: a status map + the used-question pool + running
// totals. It supersedes the two ad-hoc localStorage keys the session used before
// ("life-skills-mastery-v1" and "life_skills_used_refs_v1"), which are migrated
// in once and then ignored.

import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";

const STORAGE_KEY = "life-skills-profile-v1";
const SUBJECT = "life-skills";

// Legacy keys (pre-profile). Read once to migrate, never written again.
const LEGACY_MASTERY_KEY = "life-skills-mastery-v1";
const LEGACY_USED_KEY = "life_skills_used_refs_v1";

export type LifeSkillsTopicStatus = "available" | "in_progress" | "mastered";

export interface LifeSkillsProfile {
  id: string;
  name: string;
  grade: number;
  /** topic_id → status. Absent ⇒ "available". */
  mastery: Record<string, LifeSkillsTopicStatus>;
  /** topic_id → question refs already served (so the learner sees fresh items). */
  used_questions: Record<string, string[]>;
  total_attempts: number;
  total_correct: number;
  session_count: number;
  created_at: string;
  last_active: string;
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `ls_${Date.now()}`;
}

// ─── Load / Save (localStorage + Supabase) ────────────────────────────────────

/**
 * Reads the stored profile. When the new key is absent but legacy progress
 * exists, builds an equivalent profile from the old keys (read-only — it is
 * persisted on the next save, e.g. via getOrCreateLifeSkillsProfile). Returns
 * null when there is no progress at all.
 */
export function loadLifeSkillsProfile(): LifeSkillsProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LifeSkillsProfile;
  } catch {
    /* fall through to legacy / null */
  }
  return migrateFromLegacy();
}

function migrateFromLegacy(): LifeSkillsProfile | null {
  if (typeof window === "undefined") return null;
  let mastery: Record<string, LifeSkillsTopicStatus> = {};
  let used: Record<string, string[]> = {};
  try {
    mastery = JSON.parse(localStorage.getItem(LEGACY_MASTERY_KEY) ?? "{}");
  } catch {
    /* ignore */
  }
  try {
    used = JSON.parse(localStorage.getItem(LEGACY_USED_KEY) ?? "{}");
  } catch {
    /* ignore */
  }
  const hasProgress =
    Object.keys(mastery).length > 0 || Object.keys(used).length > 0;
  if (!hasProgress) return null;
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: "Learner",
    grade: 1, // corrected by getOrCreateLifeSkillsProfile from onboarding
    mastery,
    used_questions: used,
    total_attempts: 0,
    total_correct: 0,
    session_count: 1,
    created_at: now,
    last_active: now,
  };
}

export function saveLifeSkillsProfile(profile: LifeSkillsProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota or disabled — ignore */
  }
  // Mirror to Supabase (fire-and-forget). Matches lib/student-model.ts.
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

export function createLifeSkillsProfile(name: string, grade: number): LifeSkillsProfile {
  const now = new Date().toISOString();
  const profile: LifeSkillsProfile = {
    id: newId(),
    name,
    grade,
    mastery: {},
    used_questions: {},
    total_attempts: 0,
    total_correct: 0,
    session_count: 1,
    created_at: now,
    last_active: now,
  };
  saveLifeSkillsProfile(profile);
  return profile;
}

/**
 * Loads the stored profile (migrating legacy progress if needed) or creates a
 * fresh one, then refreshes name/grade from onboarding and persists. This is the
 * single entry point the session uses on mount.
 */
export function getOrCreateLifeSkillsProfile(grade: number, name = "Learner"): LifeSkillsProfile {
  const existing = loadLifeSkillsProfile();
  if (!existing) return createLifeSkillsProfile(name, grade);
  const refreshed: LifeSkillsProfile = {
    ...existing,
    name: name || existing.name,
    grade: grade || existing.grade,
    last_active: new Date().toISOString(),
  };
  saveLifeSkillsProfile(refreshed);
  return refreshed;
}

/**
 * Links this profile to the authenticated Supabase user so
 * hydrateLifeSkillsProfileFromSupabase() can restore it later. No-op when not
 * authenticated. Mirrors lib/student-model.ts.
 */
export async function linkLifeSkillsProfileToAuth(profileId: string): Promise<void> {
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

/**
 * When localStorage is empty, queries Supabase for the most recent Life Skills
 * profile linked to the authenticated user. Returns null if not authenticated
 * or none found. Caller writes it back to localStorage.
 */
export async function hydrateLifeSkillsProfileFromSupabase(): Promise<LifeSkillsProfile | null> {
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
    return data.profile_data as unknown as LifeSkillsProfile;
  } catch {
    return null;
  }
}

// ─── Progress helpers (used by the session + ProgressTracker) ─────────────────

/** topic_id → status map for the tree UI / progress dashboard. */
export function getLifeSkillsMasteryMap(): Record<string, LifeSkillsTopicStatus> {
  return loadLifeSkillsProfile()?.mastery ?? {};
}

/** Refs already served for a topic this learner. */
export function getLifeSkillsUsedRefs(skillId: string): string[] {
  return loadLifeSkillsProfile()?.used_questions?.[skillId] ?? [];
}

/**
 * Records a single answer: marks the question used (so it is not repeated) and
 * rolls up running totals. Persists to localStorage + Supabase.
 */
export function recordLifeSkillsAnswer(skillId: string, questionRef: string, isCorrect: boolean): void {
  const profile = loadLifeSkillsProfile();
  if (!profile) return;
  const existingRefs = profile.used_questions[skillId] ?? [];
  const updated: LifeSkillsProfile = {
    ...profile,
    used_questions: {
      ...profile.used_questions,
      [skillId]: [...existingRefs, questionRef],
    },
    total_attempts: profile.total_attempts + 1,
    total_correct: profile.total_correct + (isCorrect ? 1 : 0),
    last_active: new Date().toISOString(),
  };
  saveLifeSkillsProfile(updated);
}

/** Sets a topic's mastery status. Persists to localStorage + Supabase. */
export function setLifeSkillsMastery(skillId: string, status: LifeSkillsTopicStatus): void {
  const profile = loadLifeSkillsProfile();
  if (!profile) return;
  if (profile.mastery[skillId] === status) return;
  const updated: LifeSkillsProfile = {
    ...profile,
    mastery: { ...profile.mastery, [skillId]: status },
    last_active: new Date().toISOString(),
  };
  saveLifeSkillsProfile(updated);
}
