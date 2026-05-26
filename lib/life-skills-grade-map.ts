// ─── Life Skills grade → entry-level map ──────────────────────────────────────
// Onboarding captures a grade (R, 1–12). Life Skills covers:
//   - Foundation Phase Grades 1–3 (BK&H strand)
//   - Intermediate Phase Grades 4–6 (PSW strand only — Creative Arts and PE
//     are activity-based and don't fit a question-bank tutor)
// Senior Phase (Gr 7+) is where the subject renames to Life Orientation —
// out of scope.
//
// Unlike Maths, Life Skills does NOT run a placement test. Learners self-report
// grade in onboarding and land directly on that grade's tree; all topics for
// that grade are unlocked from day one (CAPS sequences them termly but they do
// not prerequisite each other).
//
// Life Skills is open to all plans (including freebie) — no entitlement check.

export const HIGHEST_AVAILABLE_LEVEL = 6; // Gr 7+ is Life Orientation, not Life Skills
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

// Grade → level. Foundation Phase + Intermediate Phase.
//   Grade R → not yet covered (closest: L1)
//   Grades 1–6 → L1–L6
//   Grade 7+ → out of scope (Life Orientation territory; closest: L6)
const GRADE_TO_LEVEL: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
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

/** FP uses BKH (Beginning Knowledge & Health Education); IP uses PSW
 *  (Personal & Social Well-being). The strand prefix follows the level. */
function strandForLevel(level: number): "BKH" | "PSW" {
  return level <= 3 ? "BKH" : "PSW";
}

/** Topic counts per level. FP is 12/grade; IP varies by grade. */
const TOPIC_COUNTS: Record<number, number> = {
  1: 12, 2: 12, 3: 12,
  4: 15, 5: 15, 6: 16,
};

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
    entrySkillId: `LS.L${level}.${strandForLevel(level)}.T01`,
    beyondContent,
    belowContent,
  };
}

/** Topic IDs in CAPS termly order for a given grade. UI may use this for a
 *  default sort even though all topics are unlocked simultaneously. */
export function topicsForLevel(level: number): string[] {
  if (level < LOWEST_AVAILABLE_LEVEL || level > HIGHEST_AVAILABLE_LEVEL) return [];
  const count = TOPIC_COUNTS[level] ?? 12;
  const strand = strandForLevel(level);
  return Array.from({ length: count }, (_, i) => `LS.L${level}.${strand}.T${String(i + 1).padStart(2, "0")}`);
}
