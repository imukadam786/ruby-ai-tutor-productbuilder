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
  if (idx <= 0) return [];
  return SKILL_SEQUENCE.slice(0, idx);
}

// ─── Diagnostic task scan order ───────────────────────────────────────────────
const TASK_SCAN_ORDER = [
  "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08",
  "D09", "D10", "D11", "D12",
  "D13", "D14", "D15", "D16", "D17", "D18",
];

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
  // Index results by taskId for O(1) lookup
  const resultMap: Record<string, DiagnosticTaskResult> = {};
  for (const r of taskResults) {
    resultMap[r.taskId] = r;
  }

  /** Returns true if the task was administered and met its grade-adjusted passThreshold. */
  const taskPassed = (taskId: string): boolean => {
    const task = DIAGNOSTIC_TASKS.find((t) => t.id === taskId);
    const result = resultMap[taskId];
    if (!task || !result) return false;
    return result.score >= gradeAdjustedThreshold(task.passThreshold, grade);
  };

  const dominantErrors = collectDominantErrors(taskResults);

  // ── RULE 1: Foundation failure ───────────────────────────────────────────
  if (!taskPassed("D01") || !taskPassed("D02")) {
    return {
      completedAt: Date.now(),
      tasks: taskResults,
      entrySkillId: "R1.T1.A1",
      autoCompletedSkillIds: [],
      hardGatePassed: true,
      dominantErrors,
    };
  }

  // ── RULE 2: First-failure scan ───────────────────────────────────────────
  let firstFailTaskId: string | null = null;
  for (const tid of TASK_SCAN_ORDER) {
    if (!taskPassed(tid)) {
      firstFailTaskId = tid;
      break;
    }
  }

  // Fallback: all tasks passed — advanced reader.
  if (!firstFailTaskId) {
    return {
      completedAt: Date.now(),
      tasks: taskResults,
      entrySkillId: "R5.T1.A1",
      autoCompletedSkillIds: skillsBefore("R5.T1.A1"),
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
    hardGatePassed: true,
    dominantErrors,
  };
}
