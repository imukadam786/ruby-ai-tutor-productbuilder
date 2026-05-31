// ─── Natural Sciences & Technology student model ────────────────────────────
//
// Persistence mirrors Life Skills (lib/life-skills-student-model.ts): a single
// serialized profile is the unit of progress. localStorage stays the working
// store; every save also upserts the profile to Supabase `student_profiles`
// (subject "natural-sciences-tech") so a learner's progress restores across
// devices or after cleared storage.
//
// NST topics are independent (no prerequisite chains) and mastery is judged
// per topic by session accuracy ≥ pass_threshold, so the stored model is
// deliberately lightweight: a status map + the used-question pool + running
// totals.

import { supabase } from "@/lib/supabase";
import { retrySupabase } from "@/lib/supabase-retry";

const STORAGE_KEY = "nst-profile-v1";
const SUBJECT = "natural-sciences-tech";

export type NstTopicStatus = "available" | "in_progress" | "mastered";

export interface NstProfile {
  id: string;
  name: string;
  grade: number;
  /** topic_id → status. Absent ⇒ "available". */
  mastery: Record<string, NstTopicStatus>;
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
    : `nst_${Date.now()}`;
}

// ─── Load / Save (localStorage + Supabase) ────────────────────────────────────

export function loadNstProfile(): NstProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NstProfile;
  } catch {
    /* fall through to null */
  }
  return null;
}

export function saveNstProfile(profile: NstProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota or disabled — ignore */
  }
  // Mirror to Supabase (fire-and-forget). Matches lib/life-skills-student-model.ts.
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

export function createNstProfile(name: string, grade: number): NstProfile {
  const now = new Date().toISOString();
  const profile: NstProfile = {
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
  saveNstProfile(profile);
  return profile;
}

/**
 * Loads the stored profile or creates a fresh one, then refreshes name/grade
 * from onboarding and persists. Single entry point the session uses on mount.
 */
export function getOrCreateNstProfile(grade: number, name = "Learner"): NstProfile {
  const existing = loadNstProfile();
  if (!existing) return createNstProfile(name, grade);
  const refreshed: NstProfile = {
    ...existing,
    name: name || existing.name,
    grade: grade || existing.grade,
    last_active: new Date().toISOString(),
  };
  saveNstProfile(refreshed);
  return refreshed;
}

/**
 * Links this profile to the authenticated Supabase user so
 * hydrateNstProfileFromSupabase() can restore it later. No-op when not
 * authenticated.
 */
export async function linkNstProfileToAuth(profileId: string): Promise<void> {
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
 * When localStorage is empty, queries Supabase for the most recent NST
 * profile linked to the authenticated user. Returns null if not authenticated
 * or none found. Caller writes it back to localStorage.
 */
export async function hydrateNstProfileFromSupabase(): Promise<NstProfile | null> {
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
    return data.profile_data as unknown as NstProfile;
  } catch {
    return null;
  }
}

// ─── Progress helpers (used by the session + ProgressTracker) ─────────────────

/** topic_id → status map for the tree UI / progress dashboard. */
export function getNstMasteryMap(): Record<string, NstTopicStatus> {
  return loadNstProfile()?.mastery ?? {};
}

/** Refs already served for a topic this learner. */
export function getNstUsedRefs(skillId: string): string[] {
  return loadNstProfile()?.used_questions?.[skillId] ?? [];
}

/**
 * Records a single answer: marks the question used (so it is not repeated) and
 * rolls up running totals. Persists to localStorage + Supabase.
 */
export function recordNstAnswer(skillId: string, questionRef: string, isCorrect: boolean): void {
  const profile = loadNstProfile();
  if (!profile) return;
  const existingRefs = profile.used_questions[skillId] ?? [];
  const updated: NstProfile = {
    ...profile,
    used_questions: {
      ...profile.used_questions,
      [skillId]: [...existingRefs, questionRef],
    },
    total_attempts: profile.total_attempts + 1,
    total_correct: profile.total_correct + (isCorrect ? 1 : 0),
    last_active: new Date().toISOString(),
  };
  saveNstProfile(updated);
}

/** Sets a topic's mastery status. Persists to localStorage + Supabase. */
export function setNstMastery(skillId: string, status: NstTopicStatus): void {
  const profile = loadNstProfile();
  if (!profile) return;
  if (profile.mastery[skillId] === status) return;
  const updated: NstProfile = {
    ...profile,
    mastery: { ...profile.mastery, [skillId]: status },
    last_active: new Date().toISOString(),
  };
  saveNstProfile(updated);
}
