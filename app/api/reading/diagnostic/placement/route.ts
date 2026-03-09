import { NextRequest, NextResponse } from "next/server";
import { DiagnosticTaskResult, DiagnosticPlacementResult } from "@/types/reading";

// All skill IDs in order
const LEVEL1_SKILLS = [
  "R1.T1.A1", "R1.T1.A2", "R1.T1.A3",
  "R1.T2.A1", "R1.T2.A2",
  "R1.T3.A1", "R1.T3.A2", "R1.T3.A3",
];
const LEVEL2_T1_SKILLS = ["R2.T1.A1", "R2.T1.A2", "R2.T1.A3"];
const LEVEL2_T2_SKILLS = ["R2.T2.A1", "R2.T2.A2"];
const LEVEL2_T3_SKILLS = ["R2.T3.A1", "R2.T3.A2", "R2.T3.A3"];
const LEVEL2_SKILLS = [...LEVEL2_T1_SKILLS, ...LEVEL2_T2_SKILLS, ...LEVEL2_T3_SKILLS];
const LEVEL3_SKILLS = ["R3.T1.A1", "R3.T1.A2", "R3.T1.A3", "R3.T1.A4", "R3.T2.A1", "R3.T2.A2"];
const LEVEL4_T1_SKILLS = ["R4.T1.A1", "R4.T1.A2"];
const LEVEL4_T2_SKILLS = ["R4.T2.A1", "R4.T2.A2"];
const LEVEL4_T3_SKILLS = ["R4.T3.A1", "R4.T3.A2"];
const LEVEL4_SKILLS = [...LEVEL4_T1_SKILLS, ...LEVEL4_T2_SKILLS, ...LEVEL4_T3_SKILLS];
const LEVEL5_SKILLS = ["R5.T1.A1", "R5.T1.A2", "R5.T1.A3", "R5.T2.A1", "R5.T2.A2", "R5.T3.A1"];
const ALL_SKILLS = [...LEVEL1_SKILLS, ...LEVEL2_SKILLS, ...LEVEL3_SKILLS, ...LEVEL4_SKILLS, ...LEVEL5_SKILLS];

const FAIL_THRESHOLD = 0.6;
const PASS_THRESHOLD = 0.8;

function getScore(tasks: DiagnosticTaskResult[], taskId: string): number {
  return tasks.find((t) => t.taskId === taskId)?.score ?? 0;
}

function passed(tasks: DiagnosticTaskResult[], taskId: string): boolean {
  return getScore(tasks, taskId) >= PASS_THRESHOLD;
}

function failed(tasks: DiagnosticTaskResult[], taskId: string): boolean {
  return getScore(tasks, taskId) < FAIL_THRESHOLD;
}

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json() as { tasks: DiagnosticTaskResult[] };

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
    }

    const hardGatePassed = !failed(tasks, "D06");

    let entrySkillId = "R1.T2.A1";
    let autoCompletedSkillIds: string[] = [];

    // Determine entry point from lowest failing domain
    if (failed(tasks, "D01") || failed(tasks, "D02")) {
      // Phonological awareness failure — start at very beginning
      entrySkillId = "R1.T2.A1";
      autoCompletedSkillIds = [];
    } else if (failed(tasks, "D03") || failed(tasks, "D04")) {
      // Letter-sound failure — Level 1 auto-complete
      entrySkillId = "R2.T1.A1";
      autoCompletedSkillIds = [...LEVEL1_SKILLS];
    } else if (failed(tasks, "D07") || failed(tasks, "D08")) {
      // Digraph/blend failure — Level 1 + R2.T1 auto-complete
      entrySkillId = "R2.T2.A1";
      autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_T1_SKILLS];
    } else if (failed(tasks, "D09") || failed(tasks, "D10") || failed(tasks, "D11") || failed(tasks, "D12")) {
      // Vowel/sight-word failure — Level 1 + R2.T1 + R2.T2 auto-complete
      entrySkillId = "R2.T3.A1";
      autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_T1_SKILLS, ...LEVEL2_T2_SKILLS];
    } else if (failed(tasks, "D05")) {
      // CVC decoding failure
      if (!hardGatePassed) {
        // D06 also failed — must go through Hard Gate
        entrySkillId = "R3.T1.A1";
        autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_SKILLS];
      } else {
        entrySkillId = "R4.T1.A1";
        autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_SKILLS];
      }
    } else if (!hardGatePassed) {
      // D05 passed but D06 failed — encoding gate
      entrySkillId = "R3.T1.A1";
      autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_SKILLS];
    } else if (failed(tasks, "D13") || failed(tasks, "D14") || failed(tasks, "D15")) {
      // Advanced decoding failure — Levels 1-3 auto-complete
      entrySkillId = "R4.T1.A1";
      autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_SKILLS, ...LEVEL3_SKILLS];
    } else if (failed(tasks, "D16")) {
      // Fluency failure — Levels 1-3 + R4.T1 + R4.T2 auto-complete
      entrySkillId = "R4.T3.A1";
      autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_SKILLS, ...LEVEL3_SKILLS, ...LEVEL4_T1_SKILLS, ...LEVEL4_T2_SKILLS];
    } else if (failed(tasks, "D17") || failed(tasks, "D18")) {
      // Comprehension failure — Levels 1-4 auto-complete
      entrySkillId = "R5.T1.A1";
      autoCompletedSkillIds = [...LEVEL1_SKILLS, ...LEVEL2_SKILLS, ...LEVEL3_SKILLS, ...LEVEL4_SKILLS];
    } else {
      // All passed — enter near the end
      entrySkillId = "R5.T1.A3";
      // Auto-complete all except the last 4 skills
      autoCompletedSkillIds = ALL_SKILLS.filter((id) => id !== "R5.T1.A3" && id !== "R5.T2.A1" && id !== "R5.T2.A2" && id !== "R5.T3.A1");
    }

    // Ensure entrySkillId is not in autoCompleted
    autoCompletedSkillIds = autoCompletedSkillIds.filter((id) => id !== entrySkillId);

    const result: DiagnosticPlacementResult = {
      completedAt: Date.now(),
      tasks,
      entrySkillId,
      autoCompletedSkillIds,
      hardGatePassed,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Diagnostic placement error:", error);
    return NextResponse.json({ error: "Failed to calculate placement" }, { status: 500 });
  }
}
