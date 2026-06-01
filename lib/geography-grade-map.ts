// ─── Geography grade → entry-level map ────────────────────────────────────────
// Onboarding captures a grade (R, 1–12). Geography is a FET subject:
// Grades 10, 11 and 12 only. CAPS sequences topics by strand/term but they all
// unlock once the grade is selected (every pool is gate "NONE") — the UI just
// surfaces the "current" topic (next unfinished) and the following ones.
//
// FET rule: no timer, 60% pass mark per pool (same as History / Life Sciences).
//
// Geography is NOT placement-tested. The learner self-reports grade in
// onboarding.

export const HIGHEST_AVAILABLE_LEVEL = 12;
export const LOWEST_AVAILABLE_LEVEL = 10;

export interface GeographyEntrySeed {
  /** Skill-tree level (10–12). */
  level: number;
  /** First atomic skill of that grade in CAPS teaching order. Falls back to
   *  the first skill found in the tree when not hard-coded here. */
  entrySkillId: string;
  /** True when the learner's grade is above the content we have (>12). */
  beyondContent: boolean;
  /** True when the learner's grade is below the content we have (<10). */
  belowContent: boolean;
}

// Grade → tree level. FET Geography only.
const GRADE_TO_LEVEL: Record<number, number> = {
  10: 10,
  11: 11,
  12: 12,
};

// Each grade's CAPS-order entry skill (Mapwork strand opens each grade).
// Empty string = resolve at runtime by reading the first skill from the tree.
const ENTRY_SKILL: Record<number, string> = {
  10: "GEO.G10.MAP.A1",
  11: "GEO.G11.MAP.A1",
  12: "GEO.G12.MAP.A1",
};

/** Normalise the onboarding grade ("10".."12", possibly "Grade 11") to a
 *  number. Returns 0 for non-numeric (so below-content branch fires). */
export function normaliseGrade(grade: string | number | null | undefined): number {
  if (grade == null) return 0;
  if (typeof grade === "number") return grade;
  const g = String(grade).trim().toUpperCase();
  if (g === "R" || g === "RR" || g === "GRADE R") return 0;
  const n = parseInt(g.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function firstSkillIdForLevel(level: number): string {
  const tree = require("../data/geography-skill-tree.json");
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
    const tree = require("../data/geography-skill-tree.json");
    const lvl = tree.levels.find((l: { id: number }) => l.id === level);
    const exists = (lvl?.tiers ?? []).some((t: { atomic_skills?: Array<{ id: string }> }) =>
      (t.atomic_skills ?? []).some((s) => s.id === hard),
    );
    if (exists) return hard;
  }
  return firstSkillIdForLevel(level);
}

export function seedForGrade(grade: string | number | null | undefined): GeographyEntrySeed {
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
  const tree = require("../data/geography-skill-tree.json");
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
