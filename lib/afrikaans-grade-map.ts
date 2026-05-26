// ─── Afrikaans FAL grade → level map ──────────────────────────────────────────
// Foundation + Intermediate Phase (Grades 1–6 by curriculum; built up to the
// HIGHEST_AVAILABLE_LEVEL below). Unlike English/Maths there is NO placement
// engine: learners are 6–12 and their grade is known from onboarding, so we
// trust the self-reported grade and send them straight to that grade's tree.
// (Same decision as Life Skills — see lib/life-skills-grade-map.ts.)
//
// Levels mirror grades 1:1 — L1 = Grade 1 … L6 = Grade 6.
// Grade R is treated as Grade 1 entry (FAL formally starts in Grade 1).
// Grades above HIGHEST_AVAILABLE_LEVEL are beyond authored content; callers
// surface a "more grades coming" state rather than placing the learner.

export const HIGHEST_AVAILABLE_LEVEL = 6; // Gr 1-6 all authored

export interface AfrikaansEntrySeed {
  /** Skill-tree level to start at (1–HIGHEST_AVAILABLE_LEVEL). */
  level: number;
  /** First strand entry skill of that level if the learner just dives in. */
  entrySkillId: string;
  /** True when the learner's grade is above the authored content. */
  beyondContent: boolean;
}

// Grade → level. Clean 1:1 map across Foundation + Intermediate Phase.
const GRADE_TO_LEVEL: Record<number, number> = {
  0: 1, // Grade R → Grade 1 entry
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
};

/** Normalise the onboarding grade (string "1".."12" or "R") to a number. */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 1;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 1;
}

export function seedForGrade(grade: string | number | null | undefined): AfrikaansEntrySeed {
  const g = normaliseGrade(grade);
  const beyondContent = g > HIGHEST_AVAILABLE_LEVEL;
  const level = beyondContent ? HIGHEST_AVAILABLE_LEVEL : GRADE_TO_LEVEL[g] ?? 1;
  // Listening is the natural on-ramp for an additional language, so entry
  // starts at the first Luister skill of the level.
  return { level, entrySkillId: `AF.G${level}.LUI.01`, beyondContent };
}
