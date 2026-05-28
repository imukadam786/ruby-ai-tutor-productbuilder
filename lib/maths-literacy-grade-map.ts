// ─── Maths Literacy grade → entry-level map ──────────────────────────────────
// Maths Literacy is an FET-Phase subject for Grades 10–12 (CAPS). Onboarding
// captures a grade and we gate the subject to learners in that band. Below
// Gr 10 → belowContent (surface a "starts at Grade 10" state). Above Gr 12 →
// beyondContent (cap at L10 and offer the highest level).
//
// Unlike Maths and Reading, Maths Literacy does NOT run a placement test.
// Learners self-report grade in onboarding and land directly on the entry
// skill (L1.T1.A1 — number formats). Skill-tree prerequisites gate progress
// from there.

export const HIGHEST_AVAILABLE_LEVEL = 10;
export const LOWEST_AVAILABLE_LEVEL = 10; // grade floor for visibility in SubjectsHub

export const MIN_TREE_LEVEL = 1;
export const MAX_TREE_LEVEL = 10;

export interface MathsLiteracyEntrySeed {
  /** Skill-tree level to begin from (1–10). */
  level: number;
  /** First skill — entry point for a fresh learner. */
  entrySkillId: string;
  /** True when the learner's grade is below the content we have (Gr 1–9). */
  belowContent: boolean;
  /** True when the learner's grade is above content (Gr > 12). */
  beyondContent: boolean;
}

export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 10;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 10;
}

export function seedForGrade(grade: string | number | null | undefined): MathsLiteracyEntrySeed {
  const g = normaliseGrade(grade);
  const belowContent = g < LOWEST_AVAILABLE_LEVEL;
  const beyondContent = g > HIGHEST_AVAILABLE_LEVEL;
  return {
    level: MIN_TREE_LEVEL,
    entrySkillId: "L1.T1.A1",
    belowContent,
    beyondContent,
  };
}
