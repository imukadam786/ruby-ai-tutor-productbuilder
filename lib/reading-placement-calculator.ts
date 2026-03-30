// ─── Reading Placement Calculator ────────────────────────────────────────────
// Takes scored DiagnosticTaskResult[] (from ReadingDiagnosticSession) + student grade
// and returns a DiagnosticPlacementResult with entrySkillId + autoCompletedSkillIds.
//
// Rules (in evaluation order):
//   RULE 1 — Foundation:   D01 or D02 below grade-adjusted threshold → entry at R1.T1.A1
//   RULE 2 — First fail:   scan D01–D18 in order, first failure's mapsToSkill = entry
//   FALLBACK — All pass:   advanced reader, place at R5.T1.A1

import { DIAGNOSTIC_TASKS } from "./reading-diagnostic-tasks";
import { DiagnosticPlacementResult, DiagnosticTaskResult } from "@/types/reading";
import skillTreeData from "@/data/reading-skill-tree.json";

// ─── Ordered skill sequence derived from reading-skill-tree.json ───────────────
// Auto-stays in sync if skills are added, removed, or renamed in the tree.
const SKILL_SEQUENCE: string[] = (skillTreeData as { levels: { tiers: { atomic_skills: { id: string }[] }[] }[] }).levels.flatMap(
  (level) => level.tiers.flatMap(
    (tier) => tier.atomic_skills.map((skill) => skill.id)
  )
);

/** Returns all skills that come before entrySkillId in the tree. */
function skillsBefore(entrySkillId: string): string[] {
  const idx = SKILL_SEQUENCE.indexOf(entrySkillId);
  if (idx < 0) {
    console.warn(`[reading-placement] entrySkillId "${entrySkillId}" not found in SKILL_SEQUENCE — auto-complete will be empty. Check reading-skill-tree.json for a missing or renamed skill.`);
    return [];
  }
  if (idx === 0) return [];
  return SKILL_SEQUENCE.slice(0, idx);
}

// ─── Diagnostic task scan order ───────────────────────────────────────────────
const TASK_SCAN_ORDER = [
  "D01", "D01B", "D02", "D02B", "D03", "D04", "D05", "D05B", "D06", "D07", "D08",
  "D09", "D10", "D10B", "D11", "D12",
  "D13", "D13B", "D13C", "D14", "D15", "D15B", "D16", "D17", "D18",
];

// ─── Grade ceiling placement (when all administered tasks pass) ────────────────
// A student who passes everything in their grade window starts at the top of
// that window — not at R5 (advanced reader), which requires the full pipeline.
const GRADE_CEILING_SKILL: Record<number, string> = {
  1: "R2.T2.A3",  // D07 (CVC Word Reading) — Grade 1 ceiling (9 tasks)
  2: "R2.T3.A1",  // D10 (Vowel Teams) — Grade 2 ceiling (12 tasks)
  3: "R2.T3.A2",  // D12 (R-Controlled Vowels) — Grade 3 ceiling (15 tasks)
  4: "R3.T1.A2",  // D13B (Consonant Blend Encoding) — Grade 4+ ceiling (17 tasks)
};

// ─── Dominant error collector ─────────────────────────────────────────────────
/** Returns up to 3 most frequent error types from failed task results. */
function collectDominantErrors(taskResults: DiagnosticTaskResult[]): string[] {
  const counts: Record<string, number> = {};
  for (const r of taskResults) {
    if (r.errorType && r.errorType !== "correct") {
      counts[r.errorType] = (counts[r.errorType] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([code]) => code);
}

// ─── Main export ──────────────────────────────────────────────────────────────

// ─── Grade-adjusted pass threshold ───────────────────────────────────────────
// Grade 1 students naturally make more errors at every level.
// Reduce thresholds so younger students are not placed below their actual level.
//   Grade 1: −0.15  (e.g. 0.80 → 0.65)
//   Grade 2: −0.05  (e.g. 0.80 → 0.75)
//   Grade 3+: no change
// Floor at 0.50 so no task becomes trivially passable.
function gradeAdjustedThreshold(base: number, grade: number): number {
  const adjustment = grade <= 1 ? -0.15 : grade === 2 ? -0.05 : 0;
  return Math.max(0.50, base + adjustment);
}

export function calculateReadingPlacement(
  taskResults: DiagnosticTaskResult[],
  grade = 3
): DiagnosticPlacementResult {
  // Index results by taskId for O(1) lookup.
  // sttSkipped tasks are excluded — treated as unadministered so they don't
  // falsely count as failures for non-Chrome users.
  const resultMap: Record<string, DiagnosticTaskResult> = {};
  for (const r of taskResults) {
    if (!r.sttSkipped) resultMap[r.taskId] = r;
  }

  /** Returns true if the task was administered and met its grade-adjusted passThreshold. */
  const taskPassed = (taskId: string): boolean => {
    const task = DIAGNOSTIC_TASKS.find((t) => t.id === taskId);
    const result = resultMap[taskId];
    if (!task || !result) return false;
    return result.score >= gradeAdjustedThreshold(task.passThreshold, grade);
  };

  const dominantErrors = collectDominantErrors(taskResults);

  // ── Hard gate: basic phonics decoding ────────────────────────────────────
  // A student passes the phonics gate if they can decode basic CVC words (D07).
  // Gate-failed students are still placed correctly but flagged so the session
  // knows not to surface fluency/comprehension content before decoding is secure.
  const hardGatePassed = taskPassed("D07");

  // ── RULE 1: Foundation failure ───────────────────────────────────────────
  // Only applied for grades 1–3. For grade 4+ a D01/D02 stumble is likely
  // a slip or STT mis-read rather than a true phonological deficit — let
  // Rule 2 map to the actual first-failure skill instead of hard-placing
  // at R1.T1.A1 (the absolute foundation), which would be inappropriate
  // for an older student who scored well overall.
  if (grade <= 3 && (!taskPassed("D01") || !taskPassed("D02"))) {
    return {
      completedAt: Date.now(),
      tasks: taskResults,
      entrySkillId: "R1.T1.A1",
      autoCompletedSkillIds: [],
      hardGatePassed: false,
      dominantErrors,
    };
  }

  // ── RULE 2: First-failure scan ───────────────────────────────────────────
  // Only consider tasks that were actually administered (in resultMap).
  // Lower grades have a task ceiling and will not have D08+ in their results.
  let firstFailTaskId: string | null = null;
  for (const tid of TASK_SCAN_ORDER) {
    if (!resultMap[tid]) continue; // not administered this grade — skip
    if (!taskPassed(tid)) {
      firstFailTaskId = tid;
      break;
    }
  }

  // Fallback: all administered tasks passed.
  // A student who aced everything up to their grade ceiling has demonstrated
  // the ceiling skill — auto-complete it and start at the next skill in sequence.
  if (!firstFailTaskId) {
    const ceilingSkill = GRADE_CEILING_SKILL[Math.min(grade, 4)] ?? "R5.T1.A1";
    const ceilingIdx = SKILL_SEQUENCE.indexOf(ceilingSkill);
    const entrySkillId =
      ceilingIdx >= 0 && ceilingIdx + 1 < SKILL_SEQUENCE.length
        ? SKILL_SEQUENCE[ceilingIdx + 1]
        : ceilingSkill;
    return {
      completedAt: Date.now(),
      tasks: taskResults,
      entrySkillId,
      autoCompletedSkillIds: skillsBefore(entrySkillId),
      hardGatePassed: true,
      dominantErrors,
    };
  }

  const failTask = DIAGNOSTIC_TASKS.find((t) => t.id === firstFailTaskId)!;
  const entrySkillId = failTask.mapsToSkill;

  return {
    completedAt: Date.now(),
    tasks: taskResults,
    entrySkillId,
    autoCompletedSkillIds: skillsBefore(entrySkillId),
    hardGatePassed,
    dominantErrors,
  };
}
