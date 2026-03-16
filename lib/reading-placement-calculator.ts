// ─── Reading Placement Calculator ────────────────────────────────────────────
// Takes scored DiagnosticTaskResult[] (from ReadingDiagnosticSession)
// and returns a DiagnosticPlacementResult with entrySkillId + autoCompletedSkillIds.
//
// Rules (in evaluation order):
//   RULE 1 — Foundation:   D01 or D02 < 80% → entry at R1.T1.A1, no auto-completes
//   RULE 2 — First fail:   scan D01–D18 in order, first failure's mapsToSkill = entry
//   FALLBACK — All pass:   advanced reader, place at R5.T1.A1

import { DIAGNOSTIC_TASKS } from "./reading-diagnostic-tasks";
import { DiagnosticPlacementResult, DiagnosticTaskResult } from "@/types/reading";

// ─── Ordered skill sequence from reading-skill-tree.json ──────────────────────
// Used to compute auto-complete slice (everything before entrySkillId).
const SKILL_SEQUENCE: string[] = [
  "R1.T1.A1", "R1.T1.A2", "R1.T1.A3",
  "R1.T2.A1", "R1.T2.A2",
  "R1.T3.A1", "R1.T3.A2", "R1.T3.A3",
  "R2.T1.A1", "R2.T1.A2", "R2.T1.A3",
  "R2.T2.A1", "R2.T2.A2",
  "R2.T3.A1", "R2.T3.A2", "R2.T3.A3",
  "R3.T1.A1", "R3.T1.A2", "R3.T1.A3", "R3.T1.A4",
  "R3.T2.A1", "R3.T2.A2",
  "R4.T1.A1", "R4.T1.A2",
  "R4.T2.A1", "R4.T2.A2",
  "R4.T3.A1", "R4.T3.A2",
  "R5.T1.A1", "R5.T1.A2", "R5.T1.A3",
  "R5.T2.A1", "R5.T2.A2",
  "R5.T3.A1",
];

/** Returns all skills that come before entrySkillId in the tree. */
function skillsBefore(entrySkillId: string): string[] {
  const idx = SKILL_SEQUENCE.indexOf(entrySkillId);
  if (idx <= 0) return [];
  return SKILL_SEQUENCE.slice(0, idx);
}

// ─── Diagnostic task scan order ───────────────────────────────────────────────
const TASK_SCAN_ORDER = [
  "D01", "D02", "D03", "D04",
  "D09", "D10", "D11", "D12",
  "D13", "D14", "D15", "D16", "D17", "D18",
];

// ─── Main export ──────────────────────────────────────────────────────────────

export function calculateReadingPlacement(
  taskResults: DiagnosticTaskResult[]
): DiagnosticPlacementResult {
  // Index results by taskId for O(1) lookup
  const resultMap: Record<string, DiagnosticTaskResult> = {};
  for (const r of taskResults) {
    resultMap[r.taskId] = r;
  }

  /** Returns true if the task was administered and met its passThreshold. */
  const taskPassed = (taskId: string): boolean => {
    const task = DIAGNOSTIC_TASKS.find((t) => t.id === taskId);
    const result = resultMap[taskId];
    if (!task || !result) return false;
    return result.score >= task.passThreshold;
  };

  // ── RULE 1: Foundation failure ───────────────────────────────────────────
  // Phonological awareness (D01 rhyme/syllable, D02 phoneme isolation) underpins
  // all decoding. If either fails the student starts at the very first skill.
  if (!taskPassed("D01") || !taskPassed("D02")) {
    return {
      completedAt: Date.now(),
      tasks: taskResults,
      entrySkillId: "R1.T1.A1",
      autoCompletedSkillIds: [],
      hardGatePassed: true,
    };
  }

  // ── RULE 2: First-failure scan ───────────────────────────────────────────
  // Walk tasks in diagnostic order. The first failing task's mapsToSkill
  // becomes the entry point. Everything before it is auto-completed.
  let firstFailTaskId: string | null = null;
  for (const tid of TASK_SCAN_ORDER) {
    if (!taskPassed(tid)) {
      firstFailTaskId = tid;
      break;
    }
  }

  // Fallback: all 14 tasks passed — advanced reader, start at top-level comprehension.
  if (!firstFailTaskId) {
    return {
      completedAt: Date.now(),
      tasks: taskResults,
      entrySkillId: "R5.T1.A1",
      autoCompletedSkillIds: skillsBefore("R5.T1.A1"),
      hardGatePassed: true,
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
  };
}
