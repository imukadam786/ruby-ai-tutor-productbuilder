"use client";

import { useState, useCallback, useMemo } from "react";
import { MathsPlacementResult, MathsPlacementTaskResult, DiagnosticBlock } from "@/types/ruby";
import { getSkillIdsForLevels, getLevelById } from "@/lib/student-model";
import { evaluateEarlyExit } from "@/lib/diagnostic-engine";

// ── Task definitions ──────────────────────────────────────────────────────────

interface Choice { label: string; value: string; correct: boolean }

interface Task {
  id: string;
  domain: string;
  gate: "A" | "B" | "C" | "D" | "E" | "F";
  block: DiagnosticBlock;
  question: string;
  subText?: string;
  displayExpr?: string;
  choices: Choice[];
  isHardGate?: boolean;
  isProbe?: boolean;
  probeFor?: string; // error type this probe targets
}

const ALL_TASKS: Task[] = [
  // ── Block 1 — Gates A + B (entry levels 1–5) ──────────────────────────────
  {
    id: "M001", domain: "Counting & Number Sense", gate: "A", block: 1,
    question: "Count the dots carefully. How many are there?",
    displayExpr: "●  ●  ●  ●  ●  ●  ●",
    choices: [
      { label: "6", value: "6", correct: false },
      { label: "7", value: "7", correct: true },
      { label: "8", value: "8", correct: false },
      { label: "5", value: "5", correct: false },
    ],
  },
  {
    id: "M002", domain: "Number Patterns", gate: "A", block: 1,
    question: "What comes next in the pattern?",
    displayExpr: "5,  10,  15,  20,  ?",
    choices: [
      { label: "22", value: "22", correct: false },
      { label: "24", value: "24", correct: false },
      { label: "25", value: "25", correct: true },
      { label: "30", value: "30", correct: false },
    ],
  },
  {
    id: "M003", domain: "Place Value", gate: "A", block: 1,
    question: "What is the value of the digit 4 in the number 342?",
    choices: [
      { label: "4", value: "4", correct: false },
      { label: "40", value: "40", correct: true },
      { label: "400", value: "400", correct: false },
      { label: "14", value: "14", correct: false },
    ],
  },
  {
    id: "M004", domain: "Addition — Mental Strategy", gate: "A", block: 1,
    question: "Work this out in your head.",
    displayExpr: "47 + 38 = ?",
    choices: [
      { label: "75", value: "75", correct: false },
      { label: "85", value: "85", correct: true },
      { label: "80", value: "80", correct: false },
      { label: "95", value: "95", correct: false },
    ],
  },
  {
    id: "M005", domain: "Subtraction — Mental Strategy", gate: "B", block: 1,
    question: "Work this out in your head.",
    displayExpr: "63 − 27 = ?",
    choices: [
      { label: "36", value: "36", correct: true },
      { label: "46", value: "46", correct: false },
      { label: "34", value: "34", correct: false },
      { label: "44", value: "44", correct: false },
    ],
  },
  {
    id: "M006", domain: "Multiplication — Equal Groups", gate: "B", block: 1,
    question: "There are 6 bags with 8 apples in each bag. How many apples altogether?",
    subText: "This is an important question — take your time!",
    isHardGate: true,
    choices: [
      { label: "42", value: "42", correct: false },
      { label: "48", value: "48", correct: true },
      { label: "54", value: "54", correct: false },
      { label: "40", value: "40", correct: false },
    ],
  },
  // ── Block 2 — Gates C + D (entry levels 8–10) ─────────────────────────────
  {
    id: "M007", domain: "Flexible Decomposition", gate: "C", block: 2,
    question: "Which shows 253 broken into parts correctly?",
    choices: [
      { label: "200 + 50 + 3", value: "200+50+3", correct: true },
      { label: "200 + 5 + 3", value: "200+5+3", correct: false },
      { label: "20 + 50 + 3", value: "20+50+3", correct: false },
      { label: "250 + 30", value: "250+30", correct: false },
    ],
  },
  {
    id: "M008", domain: "Fractions — Unit Interpretation", gate: "C", block: 2,
    question: "A pizza is cut into 4 equal slices. Ruby eats 3 slices. What fraction did she eat?",
    choices: [
      { label: "3/4", value: "3/4", correct: true },
      { label: "1/4", value: "1/4", correct: false },
      { label: "4/3", value: "4/3", correct: false },
      { label: "3/3", value: "3/3", correct: false },
    ],
  },
  {
    id: "M015", domain: "Division — Equal Sharing", gate: "C", block: 2,
    question: "56 chocolates are shared equally among 8 friends. How many does each friend get?",
    choices: [
      { label: "6", value: "6", correct: false },
      { label: "7", value: "7", correct: true },
      { label: "8", value: "8", correct: false },
      { label: "9", value: "9", correct: false },
    ],
  },
  {
    id: "M009", domain: "Ratio & Proportion", gate: "D", block: 2,
    question: "A recipe uses 2 cups of flour for every 3 cups of milk. For 6 cups of milk, how many cups of flour are needed?",
    choices: [
      { label: "4 cups", value: "4", correct: true },
      { label: "3 cups", value: "3", correct: false },
      { label: "6 cups", value: "6", correct: false },
      { label: "2 cups", value: "2", correct: false },
    ],
  },
  {
    id: "M010", domain: "Integer Operations & BODMAS", gate: "D", block: 2,
    question: "Calculate (remember the order of operations):",
    displayExpr: "3 + 4 × 2 = ?",
    choices: [
      { label: "11", value: "11", correct: true },
      { label: "14", value: "14", correct: false },
      { label: "24", value: "24", correct: false },
      { label: "10", value: "10", correct: false },
    ],
  },
  {
    id: "M016", domain: "Percentages", gate: "D", block: 2,
    question: "What is 20% of 150?",
    choices: [
      { label: "20", value: "20", correct: false },
      { label: "25", value: "25", correct: false },
      { label: "30", value: "30", correct: true },
      { label: "15", value: "15", correct: false },
    ],
  },
  // ── Block 3 — Gates E + F (entry levels 14–16) ────────────────────────────
  {
    id: "M011", domain: "Algebraic Expressions", gate: "E", block: 3,
    question: "Simplify by collecting like terms:",
    displayExpr: "3x + 5 + 2x − 3",
    choices: [
      { label: "5x + 2", value: "5x+2", correct: true },
      { label: "5x + 8", value: "5x+8", correct: false },
      { label: "10x + 2", value: "10x+2", correct: false },
      { label: "5x − 2", value: "5x-2", correct: false },
    ],
  },
  {
    id: "M012", domain: "Linear Equations", gate: "E", block: 3,
    question: "Solve for x:",
    displayExpr: "2x + 3 = 11",
    choices: [
      { label: "x = 4", value: "4", correct: true },
      { label: "x = 7", value: "7", correct: false },
      { label: "x = 3", value: "3", correct: false },
      { label: "x = 5", value: "5", correct: false },
    ],
  },
  {
    id: "M017", domain: "Simultaneous Equations", gate: "E", block: 3,
    question: "If x + y = 10 and x − y = 4, what is the value of x?",
    choices: [
      { label: "x = 3", value: "3", correct: false },
      { label: "x = 6", value: "6", correct: false },
      { label: "x = 7", value: "7", correct: true },
      { label: "x = 5", value: "5", correct: false },
    ],
  },
  {
    id: "M013", domain: "Quadratic Factorisation", gate: "F", block: 3,
    question: "Factorise:",
    displayExpr: "x² + 7x + 12",
    choices: [
      { label: "(x + 3)(x + 4)", value: "(x+3)(x+4)", correct: true },
      { label: "(x + 2)(x + 6)", value: "(x+2)(x+6)", correct: false },
      { label: "(x + 1)(x + 12)", value: "(x+1)(x+12)", correct: false },
      { label: "(x + 6)(x + 7)", value: "(x+6)(x+7)", correct: false },
    ],
  },
  {
    id: "M014", domain: "Functions — Key Features", gate: "F", block: 3,
    question: "For the function y = 3x − 5, what is the y-intercept?",
    choices: [
      { label: "−5", value: "-5", correct: true },
      { label: "3", value: "3", correct: false },
      { label: "5", value: "5", correct: false },
      { label: "−3", value: "-3", correct: false },
    ],
  },
  {
    id: "M018", domain: "Multi-Step Problems", gate: "F", block: 3,
    question: "A store sells pens for R12 each and rulers for R8 each. Sam buys 3 pens and 2 rulers. How much does he spend in total?",
    choices: [
      { label: "R50", value: "50", correct: false },
      { label: "R52", value: "52", correct: true },
      { label: "R56", value: "56", correct: false },
      { label: "R48", value: "48", correct: false },
    ],
  },
];

// ── Probe tasks (do not count toward 18-task cap) ─────────────────────────────

const MATHS_PROBE_TASKS: Record<string, Task> = {
  place_value_probe_1: {
    id: "PROBE_PV1", domain: "Place Value — Probe", gate: "C", block: 2,
    question: "What is the tens digit in the number 473?",
    isProbe: true, probeFor: "ERR_PLACE_VALUE",
    choices: [
      { label: "4", value: "4", correct: false },
      { label: "7", value: "7", correct: true },
      { label: "3", value: "3", correct: false },
      { label: "40", value: "40", correct: false },
    ],
  },
  count_sequence_probe_1: {
    id: "PROBE_CS1", domain: "Counting Sequence — Probe", gate: "A", block: 1,
    question: "Count on from 13. What is the next number?",
    displayExpr: "13, __, __",
    isProbe: true, probeFor: "ERR_COUNT_SKIP",
    choices: [
      { label: "14", value: "14", correct: true },
      { label: "15", value: "15", correct: false },
      { label: "12", value: "12", correct: false },
      { label: "16", value: "16", correct: false },
    ],
  },
  fraction_form_probe_1: {
    id: "PROBE_FF1", domain: "Fraction Form — Probe", gate: "C", block: 3,
    question: "Which of these shows one half?",
    isProbe: true, probeFor: "ERR_FRACTION_FORM",
    choices: [
      { label: "2/1", value: "2/1", correct: false },
      { label: "1/2", value: "1/2", correct: true },
      { label: "2/2", value: "2/2", correct: false },
      { label: "1/4", value: "1/4", correct: false },
    ],
  },
};

// ── Probe trigger logic ────────────────────────────────────────────────────────

function getFollowUpProbe(errorType: string, block: DiagnosticBlock, _domain: string): Task | null {
  if (errorType === "ERR_PLACE_VALUE" && block === 2) return MATHS_PROBE_TASKS.place_value_probe_1;
  if (errorType === "ERR_COUNT_SKIP" && block === 1) return MATHS_PROBE_TASKS.count_sequence_probe_1;
  if (errorType === "ERR_FRACTION_FORM" && block === 3) return MATHS_PROBE_TASKS.fraction_form_probe_1;
  return null;
}

// ── Grade → task selection ────────────────────────────────────────────────────
// Each gate has a grade threshold at which that domain is grade-appropriate.
// Students only see tasks that match their grade range, but placement logic
// treats untested lower gates as passed (grade-appropriate assumption).

const GATE_GRADE_THRESHOLD: Record<Task["gate"], number> = {
  A: 3,  // Counting/Addition — Grades 3–4
  B: 5,  // Subtraction/Multiplication — Grades 5–6
  C: 6,  // Decomposition/Fractions — Grades 6–7
  D: 8,  // Ratio/BODMAS — Grades 8–9
  E: 10, // Algebra — Grades 10–11
  F: 11, // Quadratics/Functions — Grades 11–12
};

function getGradeStartDifficulty(grade: number): number {
  if (grade <= 2) return 1;
  if (grade === 3) return 3;
  return 5; // grade 4+
}

function buildMathsDiagnosticTasks(grade: number): Task[] {
  const startIndex = getGradeStartDifficulty(grade) - 1; // convert 1-based to 0-based
  return ALL_TASKS.slice(startIndex, startIndex + 18);
}

// Preserved for any existing callers outside this component
function getTasksForGrade(grade: number): Task[] {
  return buildMathsDiagnosticTasks(grade);
}

// Minimum entry level enforced by grade (even if all tasks failed)
function getGradeFloor(grade: number): number {
  if (grade <= 4) return 1;
  if (grade <= 5) return 3;
  if (grade <= 6) return 4;
  if (grade <= 7) return 5;
  if (grade <= 8) return 7;
  if (grade <= 9) return 8;
  if (grade <= 10) return 9;
  if (grade <= 11) return 12;
  return 14;
}

// ── Gate → entry level mapping ─────────────────────────────────────────────────

function computePlacement(results: MathsPlacementTaskResult[], grade: number, earlyExitReason?: string | null, probesRun?: number): {
  entryLevel: number;
  entrySkillId: string;
  hardGatePassed: boolean;
  autoCompletedSkillIds: string[];
  earlyExitReason: string | null;
  probesRun: number;
  placementBlock: DiagnosticBlock;
} {
  const scoreMap: Record<string, boolean> = {};
  for (const r of results) {
    scoreMap[r.domain] = r.score === 1;
  }

  // For untested domains: treat as passed if grade >= the domain's expected grade
  const passed = (domain: string, gate: Task["gate"]) =>
    domain in scoreMap ? scoreMap[domain] : grade >= GATE_GRADE_THRESHOLD[gate];

  const hardGatePassed = passed("M006", "B");
  const gateA = passed("M001", "A") && passed("M004", "A");
  const gateB = passed("M005", "B") && hardGatePassed;
  const gateC = passed("M007", "C") && passed("M008", "C");
  const gateD = passed("M009", "D") && passed("M010", "D");
  const gateE = passed("M011", "E") && passed("M012", "E");
  const gateF = passed("M013", "F") && passed("M014", "F");

  let computedLevel = 1;
  if (gateF) computedLevel = 16;
  else if (gateE) computedLevel = 14;
  else if (gateD) computedLevel = 10;
  else if (gateC) computedLevel = 8;
  else if (gateB) computedLevel = 5;
  else if (gateA) computedLevel = 3;

  // Apply grade floor — never place a student below their grade-appropriate minimum
  const entryLevel = Math.max(computedLevel, getGradeFloor(grade));

  const level = getLevelById(entryLevel);
  let entrySkillId = `L${entryLevel}.T1.A1`;
  if (level && level.tiers.length > 0 && level.tiers[0].atomic_skills.length > 0) {
    entrySkillId = level.tiers[0].atomic_skills[0].id;
  }

  const autoCompletedSkillIds = entryLevel > 1 ? getSkillIdsForLevels(entryLevel) : [];

  // Determine which block determined placement
  const placementBlock: DiagnosticBlock = gateF || gateE ? 3 : gateD || gateC ? 2 : 1;

  return {
    entryLevel, entrySkillId, hardGatePassed, autoCompletedSkillIds,
    earlyExitReason: earlyExitReason ?? null,
    probesRun: probesRun ?? 0,
    placementBlock,
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "welcome" | "task" | "result";

const LEVEL_LABEL: Record<number, string> = {
  1: "Counting & Number Sense",
  2: "Addition Strategies",
  3: "Subtraction Strategies",
  4: "Multiplication",
  5: "Flexible Decomposition",
  6: "Multiplicative Reasoning",
  7: "Fractions",
  8: "Ratio & Proportion",
  9: "Integer Operations",
  10: "Algebraic Thinking",
  11: "Extended Ratio",
  12: "Extended Integers",
  13: "Advanced Algebra",
  14: "Linear Equations",
  15: "Quadratics",
  16: "Functions",
  17: "Multi-Step Problems",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function MathsDiagnosticPlacement({
  studentName,
  grade,
  onComplete,
}: {
  studentName: string;
  grade: number;
  onComplete: (result: MathsPlacementResult) => void;
}) {
  // 18 primary tasks derived from grade — no shuffle (order matters for blocks)
  const primaryTasks = useMemo(() => buildMathsDiagnosticTasks(grade), [grade]);

  const [phase, setPhase] = useState<Phase>("welcome");
  const [primaryTaskIndex, setPrimaryTaskIndex] = useState(0);
  const [probeQueue, setProbeQueue] = useState<Task[]>([]);
  const [probesFiredThisBlock, setProbesFiredThisBlock] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<MathsPlacementTaskResult[]>([]);
  const [errorHistory, setErrorHistory] = useState<{ taskId: string; errorType: string }[]>([]);
  const [earlyExitReason, setEarlyExitReason] = useState<string | null>(null);
  const [probesRun, setProbesRun] = useState(0);
  const [placementResult, setPlacementResult] = useState<MathsPlacementResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Current task: drain probe queue before advancing primary tasks
  const task: Task | undefined = probeQueue.length > 0 ? probeQueue[0] : primaryTasks[primaryTaskIndex];
  // Progress shows primary task count only (probes are invisible to student)
  const primaryTasksCompleted = completedTasks.filter((t) => !t.is_probe).length;
  const progress = (primaryTasksCompleted / primaryTasks.length) * 100;

  const finishDiagnostic = useCallback((completed: MathsPlacementTaskResult[], exitReason: string | null, probeCount: number) => {
    const { entryLevel, entrySkillId, hardGatePassed, autoCompletedSkillIds, placementBlock, earlyExitReason: er, probesRun: pr } =
      computePlacement(completed, grade, exitReason, probeCount);
    const placement: MathsPlacementResult = {
      completedAt: Date.now(),
      placementCompletedAt: Date.now(),
      tasks: completed,
      entrySkillId,
      entryLevel,
      autoCompletedSkillIds,
      hardGatePassed,
      placementBlock,
      earlyExitReason: er,
      probesRun: pr,
    };
    setPlacementResult(placement);
    setPhase("result");
  }, [grade]);

  const advanceTask = useCallback(async (result: MathsPlacementTaskResult) => {
    setSubmitting(true);
    const newCompleted = [...completedTasks, result];
    setCompletedTasks(newCompleted);

    // Update error history for incorrect primary tasks
    const newErrorHistory = [...errorHistory];
    if (!result.correct && !result.is_probe && result.error_type) {
      newErrorHistory.push({ taskId: result.domain, errorType: result.error_type });
      setErrorHistory(newErrorHistory);
    }

    setShowEncouragement(true);
    await new Promise((r) => setTimeout(r, 600));

    // ── Probe path ──────────────────────────────────────────────────────────
    if (result.is_probe) {
      setProbesRun((n) => n + 1);
      setProbeQueue((q) => q.slice(1)); // drain probe
      setSelectedChoice(null);
      setShowEncouragement(false);
      setSubmitting(false);
      return;
    }

    // ── Primary task path ───────────────────────────────────────────────────
    const currentTask = primaryTasks[primaryTaskIndex];
    const nextPrimaryIndex = primaryTaskIndex + 1;

    // Check for probe trigger (max 2 per block)
    if (!result.correct && result.error_type && probesFiredThisBlock < 2) {
      const probe = getFollowUpProbe(result.error_type, currentTask.block, currentTask.domain);
      if (probe) {
        setProbeQueue((q) => [...q, probe]);
        setProbesFiredThisBlock((n) => n + 1);
      }
    }

    // Check for block boundary early exit
    const blockSize = 6;
    const tasksInCurrentBlock = newCompleted.filter((t) => !t.is_probe && t.block === currentTask.block).length;
    if (tasksInCurrentBlock >= blockSize) {
      const exitResult = evaluateEarlyExit(newCompleted, currentTask.block, newErrorHistory);
      if ("exit" in exitResult && exitResult.exit) {
        setEarlyExitReason(exitResult.reason);
        setShowEncouragement(false);
        finishDiagnostic(newCompleted, exitResult.reason, probesRun + (probeQueue.length > 0 ? 1 : 0));
        setSubmitting(false);
        return;
      }
      // Skip Block 2 if all Block 1+2 correct
      if (!exitResult.exit && exitResult.skipToBlock3 && currentTask.block === 2) {
        const block3Start = primaryTasks.findIndex((t) => t.block === 3);
        if (block3Start >= 0) {
          setPrimaryTaskIndex(block3Start);
          setProbesFiredThisBlock(0);
          setSelectedChoice(null);
          setShowEncouragement(false);
          setSubmitting(false);
          return;
        }
      }
      // Reset probe counter at block boundary
      setProbesFiredThisBlock(0);
    }

    if (nextPrimaryIndex >= primaryTasks.length) {
      setShowEncouragement(false);
      finishDiagnostic(newCompleted, null, probesRun);
    } else {
      setSelectedChoice(null);
      setShowEncouragement(false);
      setPrimaryTaskIndex(nextPrimaryIndex);
    }
    setSubmitting(false);
  }, [completedTasks, errorHistory, primaryTaskIndex, primaryTasks, probesFiredThisBlock, probeQueue, probesRun, finishDiagnostic]);

  const handleChoice = useCallback((choice: Choice) => {
    if (submitting || selectedChoice || !task) return;
    setSelectedChoice(choice.value);
    const isProbe = !!task.isProbe;
    // Simple error type heuristic for diagnostic: wrong = conceptual_gap unless it's a probe
    const errorType = choice.correct ? undefined : (task.isProbe ? undefined : "conceptual_gap");
    setTimeout(() => {
      advanceTask({
        domain: task.id,
        score: choice.correct ? 1 : 0,
        response: choice.value,
        block: task.block,
        correct: choice.correct,
        error_type: errorType,
        is_probe: isProbe,
      });
    }, 450);
  }, [submitting, selectedChoice, task, advanceTask]);

  const handleSkip = useCallback(() => {
    if (submitting || !task) return;
    advanceTask({
      domain: task.id, score: 0, response: "(skipped)",
      block: task.block, correct: false, is_probe: !!task.isProbe,
    });
  }, [submitting, task, advanceTask]);

  // ── Welcome ───────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto">
            🔢
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hi {studentName}!</h2>
            <p className="text-gray-600 mt-3 leading-relaxed text-base">
              Before we start, let&apos;s do a short discovery activity so I can find your perfect starting point!
            </p>
            <p className="text-emerald-600 font-medium mt-2 text-base">No pressure — just do your best 😊</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
            {[
              { icon: "🎯", text: `${primaryTasks.length} questions` },
              { icon: "⏱️", text: "5–8 min" },
              { icon: "🏆", text: "Find your level" },
            ].map(({ icon, text }) => (
              <div key={text} className="bg-emerald-50 rounded-xl p-2">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase("task")}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Let&apos;s go! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (phase === "result" && placementResult) {
    const autoCount = placementResult.autoCompletedSkillIds.length;
    const entryLabel = LEVEL_LABEL[placementResult.entryLevel] ?? `Level ${placementResult.entryLevel}`;
    const correctCount = placementResult.tasks.filter((t) => t.score === 1).length;

    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4">
          <div className="bg-white rounded-3xl shadow-md p-6 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900">Great work, {studentName}!</h2>
            <p className="text-gray-500 text-base">
              You answered {correctCount} of {primaryTasks.length} questions correctly.
              I&apos;ve found your perfect starting point!
            </p>
            {autoCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <p className="text-green-700 font-bold text-lg">
                  You already know {autoCount} skill{autoCount !== 1 ? "s" : ""}! ✅
                </p>
              </div>
            )}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wide mb-1">
                You&apos;re starting at
              </p>
              <p className="text-emerald-800 font-bold text-xl">{entryLabel}</p>
            </div>
            {!placementResult.hardGatePassed && grade >= 5 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left">
                <p className="text-amber-700 text-base">
                  🔑 We&apos;ll build your multiplication foundations first — it&apos;s the key to all advanced maths!
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-md p-5">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Your Results</h3>
            <div className="space-y-2">
              {placementResult.tasks.map((t) => {
                const taskDef = ALL_TASKS.find((td) => td.id === t.domain);
                return (
                  <div key={t.domain} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      t.score === 1 ? "bg-green-400 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {t.score === 1 ? "✓" : "·"}
                    </div>
                    <span className="text-base text-gray-600">{taskDef?.domain ?? t.domain}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onComplete(placementResult)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-3xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Start Learning! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Task screen ───────────────────────────────────────────────────────────
  if (!task) return null;
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 text-sm text-gray-400">
          <span className="font-medium">Discovery Activity</span>
          <span>{Math.min(primaryTasksCompleted + 1, primaryTasks.length)} of {primaryTasks.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-teal-100 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">
              {task.domain}
            </span>
            <span className="bg-gray-100 text-gray-500 text-sm px-2 py-1 rounded-full">
              Gate {task.gate}
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
            <p className="text-gray-800 text-lg font-semibold leading-snug">{task.question}</p>
            {task.subText && <p className="text-gray-400 text-base">{task.subText}</p>}
            {task.displayExpr && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 text-center">
                <p className="text-3xl sm:text-4xl font-bold text-teal-700 tracking-wide">
                  {task.displayExpr}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-md p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {task.choices.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleChoice(c)}
                  disabled={submitting || !!selectedChoice}
                  className={`px-4 py-5 rounded-2xl border-2 text-base font-bold text-center transition-all active:scale-95 ${
                    selectedChoice === c.value
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg scale-105"
                      : selectedChoice
                      ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {showEncouragement && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                <p className="text-emerald-700 font-semibold text-base">
                  {["Keep going! 💪", "Brilliant! ⭐", "You've got this! 🎯", "Fantastic! 🌟", "Amazing! 🏆"][primaryTaskIndex % 5]}
                </p>
              </div>
            )}

            <button
              onClick={handleSkip}
              disabled={submitting}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Skip this question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
