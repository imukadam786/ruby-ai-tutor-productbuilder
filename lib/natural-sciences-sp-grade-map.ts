// ─── Natural Sciences SP grade → entry-level map ──────────────────────────────
// Onboarding captures a grade (R, 1–12). Natural Sciences SP is a Senior-Phase
// subject: Grades 7, 8 and 9 only. CAPS sequences topics by strand/term but they
// all unlock once the grade is selected (every pool is gate "NONE") — the UI
// just surfaces the "current" topic (next unfinished) and the following ones.
//
// Content-subject rule: no timer, 60% pass mark per pool (same as History /
// Geography / Life Sciences).
//
// Natural Sciences SP is NOT placement-tested. The learner self-reports grade in
// onboarding.

export const HIGHEST_AVAILABLE_LEVEL = 9;
export const LOWEST_AVAILABLE_LEVEL = 7;

export interface NaturalSciencesSpEntrySeed {
  /** Skill-tree level (7–9). */
  level: number;
  /** First atomic skill of that grade in CAPS teaching order. Falls back to
   *  the first skill found in the tree when not hard-coded here. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (>9). */
  beyondContent: boolean;
  /** True when the learner's grade is below the content we have (<7). */
  belowContent: boolean;
}

// Grade → tree level. Senior-Phase Natural Sciences only.
const GRADE_TO_LEVEL: Record<number, number> = {
  7: 7,
  8: 8,
  9: 9,
};

// Each grade's CAPS-order entry skill (Life & Living strand opens each grade in
// Term 1). Empty string = resolve at runtime by reading the first skill from the
// tree.
const ENTRY_SKILL: Record<number, string> = {
  7: "NSSP.G7.LL.A1",
  8: "NSSP.G8.LL.A1",
  9: "NSSP.G9.LL.A1",
};

/** Normalise the onboarding grade ("7".."9", possibly "Grade 8") to a number.
 *  Returns 0 for non-numeric (so below-content branch fires). */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 0;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function firstSkillIdForLevel(level: number): string {
  const tree = require("../data/natural-sciences-sp-skill-tree.json");
  const lvl = tree.levels.find((l: { id: number }) => l.id === level);
  if (!lvl) return "";
  for (const tier of lvl.tiers ?? []) {
    for (const skill of tier.atomic_skills ?? []) {
      if (skill?.id) return skill.id;
    }
  }
  return "";
}

/** Confirm a hard-coded entry skill actually exists in the tree; fall back to
 *  the first skill of the level otherwise (defensive against id drift). */
function resolveEntrySkill(level: number): string {
  const hard = ENTRY_SKILL[level];
  if (hard && hard.length > 0) {
    const tree = require("../data/natural-sciences-sp-skill-tree.json");
    const lvl = tree.levels.find((l: { id: number }) => l.id === level);
    const exists = (lvl?.tiers ?? []).some((t: { atomic_skills?: Array<{ id: string }> }) =>
      (t.atomic_skills ?? []).some((s) => s.id === hard),
    );
    if (exists) return hard;
  }
  return firstSkillIdForLevel(level);
}

export function seedForGrade(grade: string | number | null | undefined): NaturalSciencesSpEntrySeed {
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
    entrySkillId: resolveEntrySkill(level),
    beyondContent,
    belowContent,
  };
}

/** All atomic-skill IDs for a level, in CAPS order. */
export function skillsForLevel(level: number): string[] {
  const tree = require("../data/natural-sciences-sp-skill-tree.json");
  const lvl = tree.levels.find((l: { id: number }) => l.id === level);
  if (!lvl) return [];
  const ids: string[] = [];
  for (const tier of lvl.tiers ?? []) {
    for (const skill of tier.atomic_skills ?? []) {
      ids.push(skill.id);
    }
  }
  return ids;
}
