// ─── Life Skills grade → entry-level map ──────────────────────────────────────
// Onboarding captures a grade (R, 1–12). Life Skills as a subject only ships
// CAPS Foundation Phase content (Grades 1–3) at launch. Grade 4 is Intermediate
// Phase and is blocked on the separate CAPS Intermediate Phase doc — placeholder
// only in the tree.
//
// Unlike Maths, Life Skills does NOT run a placement test. Foundation Phase
// learners (6–9 years) self-report grade in onboarding and land directly on
// that grade's tree; all 12 topics for that grade are unlocked from day one
// (CAPS sequences them termly but they do not prerequisite each other).
//
// The full Life Skills subject is gated behind the Scholar plan — onboarding
// flow handles entitlement check before routing here.

export const HIGHEST_AVAILABLE_LEVEL = 3; // L4 not yet authored
export const LOWEST_AVAILABLE_LEVEL = 1;

export interface LifeSkillsEntrySeed {
  /** Skill-tree level (1–3 launched; 4 placeholder). */
  level: number;
  /** Entry skill — first topic of that grade. UI may ignore this and surface
   *  the full topic grid since topics are independent. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (Gr 4+).
   *  UI: show a "more grades coming" state and offer the closest available
   *  level (L3). */
  beyondContent: boolean;
  /** True when the learner's grade is below the content we have (Gr R).
   *  UI: surface "starts at Grade 1" and offer L1 as the floor. */
  belowContent: boolean;
}

// Grade → level. Foundation Phase only at launch.
//   Grade R → not yet covered (closest: L1)
//   Grade 1 → L1
//   Grade 2 → L2
//   Grade 3 → L3
//   Grade 4+ → blocked (closest: L3)
const GRADE_TO_LEVEL: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
};

/** Normalise the onboarding grade (string "1".."12" or "R") to a number.
 *  "R" maps to 0 so the below-content branch fires. */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 1;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 1;
}

export function seedForGrade(grade: string | number | null | undefined): LifeSkillsEntrySeed {
  const g = normaliseGrade(grade);
  const belowContent = g < LOWEST_AVAILABLE_LEVEL;
  const beyondContent = g > HIGHEST_AVAILABLE_LEVEL;
  const level = belowContent
    ? LOWEST_AVAILABLE_LEVEL
    : beyondContent
    ? HIGHEST_AVAILABLE_LEVEL
    : GRADE_TO_LEVEL[g] ?? LOWEST_AVAILABLE_LEVEL;
  return {
    level,
    entrySkillId: `LS.L${level}.BKH.T01`,
    beyondContent,
    belowContent,
  };
}

/** Topic IDs in CAPS termly order for a given grade. UI may use this for a
 *  default sort even though all topics are unlocked simultaneously. */
export function topicsForLevel(level: number): string[] {
  if (level < LOWEST_AVAILABLE_LEVEL || level > HIGHEST_AVAILABLE_LEVEL) return [];
  return Array.from({ length: 12 }, (_, i) => `LS.L${level}.BKH.T${String(i + 1).padStart(2, "0")}`);
}
