// ─── Afrikaans FAL grade → level map ──────────────────────────────────────────
// Foundation Phase only (Grades 1–3). Unlike English/Maths there is NO placement
// engine: the learners are 6–9 and their grade is known from onboarding, so we
// trust the self-reported grade and send them straight to that grade's tree.
// (Same decision as Life Skills — see lib/life-skills-grade-map.ts.)
//
// Levels mirror grades 1:1 — L1 = Grade 1, L2 = Grade 2, L3 = Grade 3.
// Grade R is treated as Grade 1 entry (FAL formally starts in Grade 1).
// Grades above 3 are beyond Foundation-Phase content; callers should surface a
// "more grades coming" state rather than placing the learner.

export const HIGHEST_AVAILABLE_LEVEL = 3;

export interface AfrikaansEntrySeed {
  /** Skill-tree level to start at (1–3). */
  level: number;
  /** First strand entry skill of that level if the learner just dives in. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (Gr 4+). */
  beyondContent: boolean;
}

// Grade → level. Foundation Phase is a clean 1:1 map.
const GRADE_TO_LEVEL: Record<number, number> = {
  0: 1, // Grade R → Grade 1 entry
  1: 1,
  2: 2,
  3: 3,
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
  const beyondContent = g > 3;
  const level = beyondContent ? HIGHEST_AVAILABLE_LEVEL : GRADE_TO_LEVEL[g] ?? 1;
  // Listening is the natural on-ramp for an additional language, so entry
  // starts at the first Luister skill of the level.
  return { level, entrySkillId: `AF.G${level}.LUI.01`, beyondContent };
}
