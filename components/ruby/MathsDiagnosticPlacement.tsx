"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MathsPlacementResult, MathsPlacementTaskResult, DiagnosticBlock } from "@/types/ruby";
import { getSkillIdsForLevels, getLevelById } from "@/lib/student-model";
import { evaluateEarlyExit } from "@/lib/diagnostic-engine";
import { simplifyText } from "@/lib/question-simplifier";
import { getReadingProfile } from "@/lib/reading-student-model";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Choice { label: string; value: string; correct: boolean }

type AnswerMode = "numeric" | "text" | "fraction" | "multiField" | "choice";

interface TaskField {
  label: string;
  expectedAnswer?: number | string;
  hint?: string;
  exampleAnswer?: string;
}

interface Task {
  id: string;
  domain: string;
  domainTitle: string;
  gate: "A" | "B" | "C" | "D";
  block: DiagnosticBlock;
  question: string;
  stimulus?: string;
  answerMode: AnswerMode;
  expectedAnswer?: number | string;
  fields?: TaskField[];
  choices?: Choice[];       // probe tasks only
  errorSignals?: string[];
  isProbe?: boolean;
  probeFor?: string;
}

// ── Raw JSON bank task shape ───────────────────────────────────────────────────

interface RawBankTask {
  id: string;
  domain: string;
  domainTitle: string;
  gate: "A" | "B" | "C" | "D";
  question: string;
  stimulus?: string;
  answerMode: AnswerMode;
  expectedAnswer?: number | string;
  fields?: TaskField[];
  errorSignals?: string[];
}

function adaptBankTask(raw: RawBankTask, index: number): Task {
  // Assign block based on position: 0-5 → 1, 6-11 → 2, 12-17 → 3
  const block: DiagnosticBlock = index < 6 ? 1 : index < 12 ? 2 : 3;
  return { ...raw, block };
}

// ── Probe tasks (choice-based, do not count toward 18-task cap) ───────────────

const MATHS_PROBE_TASKS: Record<string, Task> = {
  place_value_probe_1: {
    id: "PROBE_PV1", domain: "M003", domainTitle: "Place Value — Probe",
    gate: "A", block: 1, answerMode: "choice",
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
    id: "PROBE_CS1", domain: "M002", domainTitle: "Counting Sequence — Probe",
    gate: "A", block: 1, answerMode: "choice",
    question: "Count on from 13. What is the next number?",
    stimulus: "13, __, __",
    isProbe: true, probeFor: "ERR_COUNT_SKIP",
    choices: [
      { label: "14", value: "14", correct: true },
      { label: "15", value: "15", correct: false },
      { label: "12", value: "12", correct: false },
      { label: "16", value: "16", correct: false },
    ],
  },
  fraction_form_probe_1: {
    id: "PROBE_FF1", domain: "M008", domainTitle: "Fraction Form — Probe",
    gate: "B", block: 2, answerMode: "choice",
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

function getFollowUpProbe(errorType: string, block: DiagnosticBlock): Task | null {
  if (errorType === "ERR_DIGIT_SWAP" && block === 1) return MATHS_PROBE_TASKS.place_value_probe_1;
  if (errorType === "ERR_COUNT_SKIP" && block === 1) return MATHS_PROBE_TASKS.count_sequence_probe_1;
  if ((errorType === "ERR_INVERT" || errorType === "ERR_PART_WHOLE") && block <= 2) return MATHS_PROBE_TASKS.fraction_form_probe_1;
  return null;
}

// ── Answer evaluation ─────────────────────────────────────────────────────────

function normaliseAnswer(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ").replace(/[,]/g, "");
}

function evaluateTaskAnswer(task: Task, answers: string[]): { correct: boolean; errorType?: string } {
  const a0 = answers[0]?.trim() ?? "";
  const errorType = task.errorSignals?.[0] ?? "conceptual_gap";

  if (task.answerMode === "numeric") {
    const correct = a0 !== "" && Number(a0) === Number(task.expectedAnswer);
    return { correct, errorType: correct ? undefined : errorType };
  }

  if (task.answerMode === "text" || task.answerMode === "fraction") {
    const correct = normaliseAnswer(a0) === normaliseAnswer(String(task.expectedAnswer ?? ""));
    return { correct, errorType: correct ? undefined : errorType };
  }

  if (task.answerMode === "multiField" && task.fields) {
    const gradedFields = task.fields.filter((f) => f.expectedAnswer !== undefined);
    if (gradedFields.length === 0) {
      // Open-ended validation — pass if all fields are non-empty
      const correct = task.fields.every((_, i) => (answers[i] ?? "").trim().length > 0);
      return { correct, errorType: correct ? undefined : errorType };
    }
    const correctCount = gradedFields.filter((f, i) => {
      const ua = normaliseAnswer(answers[i] ?? "");
      const ea = normaliseAnswer(String(f.expectedAnswer));
      return ua === ea || (typeof f.expectedAnswer === "number" && Number(answers[i]) === f.expectedAnswer);
    }).length;
    const correct = correctCount >= Math.ceil(gradedFields.length * 0.6);
    return { correct, errorType: correct ? undefined : errorType };
  }

  return { correct: false, errorType };
}

// ── Placement computation ─────────────────────────────────────────────────────

const GATE_GRADE_THRESHOLD: Record<"A" | "B" | "C" | "D", number> = {
  A: 4,   // Basic counting/ops — expected by Grade 4
  B: 7,   // Decomposition/Fractions/Ratio — Grade 7
  C: 10,  // Algebra/Equations — Grade 10
  D: 12,  // Advanced (logs, trig, calc) — Grade 12
};

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

function computePlacement(
  results: MathsPlacementTaskResult[],
  grade: number,
  earlyExitReason?: string | null,
  probesRun?: number
): {
  entryLevel: number; entrySkillId: string; hardGatePassed: boolean;
  autoCompletedSkillIds: string[]; earlyExitReason: string | null;
  probesRun: number; placementBlock: DiagnosticBlock;
} {
  const scoreMap: Record<string, boolean> = {};
  for (const r of results) {
    scoreMap[r.domain] = r.score === 1;
  }

  const passed = (domain: string, gate: "A" | "B" | "C" | "D") =>
    domain in scoreMap ? scoreMap[domain] : grade >= GATE_GRADE_THRESHOLD[gate];

  const hardGatePassed = passed("M006", "A");
  const gateA = passed("M001", "A") && passed("M004", "A");
  const gateB = passed("M005", "A") && hardGatePassed;
  const gateC = passed("M007", "B") && passed("M008", "B");
  const gateD = passed("M009", "B") && passed("M010", "B");
  const gateE = passed("M011", "C") && passed("M012", "C");
  const gateF = passed("M013", "C") && passed("M014", "C");

  let computedLevel = 1;
  if (gateF) computedLevel = 16;
  else if (gateE) computedLevel = 14;
  else if (gateD) computedLevel = 10;
  else if (gateC) computedLevel = 8;
  else if (gateB) computedLevel = 5;
  else if (gateA) computedLevel = 3;

  const entryLevel = Math.max(computedLevel, getGradeFloor(grade));

  const level = getLevelById(entryLevel);
  let entrySkillId = `L${entryLevel}.T1.A1`;
  if (level && level.tiers.length > 0 && level.tiers[0].atomic_skills.length > 0) {
    entrySkillId = level.tiers[0].atomic_skills[0].id;
  }

  const autoCompletedSkillIds = entryLevel > 1 ? getSkillIdsForLevels(entryLevel) : [];
  const placementBlock: DiagnosticBlock = gateF || gateE ? 3 : gateD || gateC ? 2 : 1;

  return {
    entryLevel, entrySkillId, hardGatePassed, autoCompletedSkillIds,
    earlyExitReason: earlyExitReason ?? null,
    probesRun: probesRun ?? 0,
    placementBlock,
  };
}

// ── Level labels ──────────────────────────────────────────────────────────────

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

type Phase = "welcome" | "loading" | "task" | "result";

// ── Stimulus renderer ─────────────────────────────────────────────────────────

function parseDotArray(stimulus: string): number | null {
  const m = stimulus.match(/^Dot array:\s*(\d+)\s*dots/i);
  return m ? parseInt(m[1], 10) : null;
}

function DotArray({ count }: { count: number }) {
  // Stable pseudo-random positions seeded by count
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 flex flex-wrap gap-3 justify-center items-center min-h-[100px]">
      {dots.map((i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full bg-teal-600 shadow-sm flex-shrink-0"
        />
      ))}
    </div>
  );
}

function StimulusDisplay({ stimulus }: { stimulus: string }) {
  const dotCount = parseDotArray(stimulus);
  if (dotCount !== null) {
    return <DotArray count={dotCount} />;
  }
  // Default: render as text
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 text-center">
      <p className="text-3xl sm:text-4xl font-bold text-teal-700 tracking-wide whitespace-pre-line">
        {stimulus}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MathsDiagnosticPlacement({
  studentName,
  grade,
  onComplete,
  onViewReport,
}: {
  studentName: string;
  grade: number;
  onComplete: (result: MathsPlacementResult) => void;
  onViewReport?: (result: MathsPlacementResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [primaryTasks, setPrimaryTasks] = useState<Task[]>([]);
  const [domainTitleMap, setDomainTitleMap] = useState<Record<string, string>>({});

  const [primaryTaskIndex, setPrimaryTaskIndex] = useState(0);
  const [probeQueue, setProbeQueue] = useState<Task[]>([]);
  const [probesFiredThisBlock, setProbesFiredThisBlock] = useState(0);

  // Open-ended answer state
  const [answers, setAnswers] = useState<string[]>([]);
  // Choice-based answer state (probes)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const [completedTasks, setCompletedTasks] = useState<MathsPlacementTaskResult[]>([]);
  const [errorHistory, setErrorHistory] = useState<{ taskId: string; errorType: string }[]>([]);
  const [earlyExitReason, setEarlyExitReason] = useState<string | null>(null);
  const [probesRun, setProbesRun] = useState(0);
  const [placementResult, setPlacementResult] = useState<MathsPlacementResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Load random bank when user starts
  const bankLoadedRef = useRef(false);

  const loadBank = useCallback(() => {
    if (bankLoadedRef.current) return;
    bankLoadedRef.current = true;
    setPhase("loading");
    const n = Math.floor(Math.random() * 50) + 1;
    import(`@/data/maths-question-banks/${n}.json`)
      .then((mod) => {
        const raw = (mod.default ?? mod) as RawBankTask[];
        const readingLevel = getReadingProfile()?.current_level ?? 5;
        const tasks = raw.map((t, i) => {
          const task = adaptBankTask(t, i);
          return { ...task, question: simplifyText(task.question, readingLevel) };
        });
        const titleMap: Record<string, string> = {};
        tasks.forEach((t) => { titleMap[t.domain] = t.domainTitle; });
        setPrimaryTasks(tasks);
        setDomainTitleMap(titleMap);
        setPhase("task");
      })
      .catch(() => {
        // Shouldn't happen — fall back to empty and let result screen handle it
        setPhase("task");
      });
  }, []);

  // Current task: drain probe queue before advancing primary tasks
  const task: Task | undefined = probeQueue.length > 0 ? probeQueue[0] : primaryTasks[primaryTaskIndex];
  const primaryTasksCompleted = completedTasks.filter((t) => !t.is_probe).length;
  const progress = primaryTasks.length > 0 ? (primaryTasksCompleted / primaryTasks.length) * 100 : 0;

  // Reset answer state whenever the task changes
  useEffect(() => {
    if (task) {
      setAnswers(task.fields ? task.fields.map(() => "") : [""]);
      setSelectedChoice(null);
    }
  }, [task?.id]);

  const finishDiagnostic = useCallback(
    (completed: MathsPlacementTaskResult[], exitReason: string | null, probeCount: number) => {
      const result = computePlacement(completed, grade, exitReason, probeCount);
      const placement: MathsPlacementResult = {
        completedAt: Date.now(),
        placementCompletedAt: Date.now(),
        tasks: completed,
        entrySkillId: result.entrySkillId,
        entryLevel: result.entryLevel,
        autoCompletedSkillIds: result.autoCompletedSkillIds,
        hardGatePassed: result.hardGatePassed,
        placementBlock: result.placementBlock,
        earlyExitReason: result.earlyExitReason,
        probesRun: result.probesRun,
      };
      setPlacementResult(placement);
      setPhase("result");
    },
    [grade]
  );

  const advanceTask = useCallback(
    async (result: MathsPlacementTaskResult) => {
      setSubmitting(true);
      const newCompleted = [...completedTasks, result];
      setCompletedTasks(newCompleted);

      const newErrorHistory = [...errorHistory];
      if (!result.correct && !result.is_probe && result.error_type) {
        newErrorHistory.push({ taskId: result.domain, errorType: result.error_type });
        setErrorHistory(newErrorHistory);
      }

      setShowEncouragement(true);
      await new Promise((r) => setTimeout(r, 600));

      // ── Probe path ───────────────────────────────────────────────────────────
      if (result.is_probe) {
        setProbesRun((n) => n + 1);
        setProbeQueue((q) => q.slice(1));
        setShowEncouragement(false);
        setSubmitting(false);
        return;
      }

      // ── Primary task path ────────────────────────────────────────────────────
      const currentTask = primaryTasks[primaryTaskIndex];
      const nextPrimaryIndex = primaryTaskIndex + 1;

      if (!result.correct && result.error_type && probesFiredThisBlock < 2) {
        const probe = getFollowUpProbe(result.error_type, currentTask.block);
        if (probe) {
          setProbeQueue((q) => [...q, probe]);
          setProbesFiredThisBlock((n) => n + 1);
        }
      }

      const blockSize = 6;
      const tasksInCurrentBlock = newCompleted.filter(
        (t) => !t.is_probe && t.block === currentTask.block
      ).length;

      if (tasksInCurrentBlock >= blockSize) {
        const exitResult = evaluateEarlyExit(newCompleted, currentTask.block, newErrorHistory);
        if ("exit" in exitResult && exitResult.exit) {
          setEarlyExitReason(exitResult.reason);
          setShowEncouragement(false);
          finishDiagnostic(
            newCompleted,
            exitResult.reason,
            probesRun + (probeQueue.length > 0 ? 1 : 0)
          );
          setSubmitting(false);
          return;
        }
        if (!exitResult.exit && exitResult.skipToBlock3 && currentTask.block === 2) {
          const block3Start = primaryTasks.findIndex((t) => t.block === 3);
          if (block3Start >= 0) {
            setPrimaryTaskIndex(block3Start);
            setProbesFiredThisBlock(0);
            setShowEncouragement(false);
            setSubmitting(false);
            return;
          }
        }
        setProbesFiredThisBlock(0);
      }

      if (nextPrimaryIndex >= primaryTasks.length) {
        setShowEncouragement(false);
        finishDiagnostic(newCompleted, null, probesRun);
      } else {
        setShowEncouragement(false);
        setPrimaryTaskIndex(nextPrimaryIndex);
      }
      setSubmitting(false);
    },
    [
      completedTasks, errorHistory, primaryTaskIndex, primaryTasks,
      probesFiredThisBlock, probeQueue, probesRun, finishDiagnostic,
    ]
  );

  // ── Choice handler (probe tasks) ───────────────────────────────────────────
  const handleChoice = useCallback(
    (choice: Choice) => {
      if (submitting || selectedChoice || !task) return;
      setSelectedChoice(choice.value);
      const errorType = choice.correct ? undefined : "conceptual_gap";
      setTimeout(() => {
        advanceTask({
          domain: task.domain,
          score: choice.correct ? 1 : 0,
          response: choice.value,
          block: task.block,
          correct: choice.correct,
          error_type: errorType,
          is_probe: true,
        });
      }, 450);
    },
    [submitting, selectedChoice, task, advanceTask]
  );

  // ── Open-ended submit handler ──────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (submitting || !task) return;
    const { correct, errorType } = evaluateTaskAnswer(task, answers);
    advanceTask({
      domain: task.domain,
      score: correct ? 1 : 0,
      response: answers.join(" | "),
      block: task.block,
      correct,
      error_type: errorType,
      is_probe: !!task.isProbe,
    });
  }, [submitting, task, answers, advanceTask]);

  const handleSkip = useCallback(() => {
    if (submitting || !task) return;
    advanceTask({
      domain: task.domain, score: 0, response: "(skipped)",
      block: task.block, correct: false, is_probe: !!task.isProbe,
    });
  }, [submitting, task, advanceTask]);

  // ── Welcome ────────────────────────────────────────────────────────────────
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
              { icon: "🎯", text: "18 questions" },
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
            onClick={loadBank}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Let&apos;s go! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 items-center justify-center">
        <div className="text-4xl animate-spin">⚙️</div>
        <p className="mt-4 text-teal-700 font-medium">Preparing your questions…</p>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === "result" && placementResult) {
    const autoCount = placementResult.autoCompletedSkillIds.length;
    const entryLabel = LEVEL_LABEL[placementResult.entryLevel] ?? `Level ${placementResult.entryLevel}`;
    const correctCount = placementResult.tasks.filter((t) => t.score === 1 && !t.is_probe).length;
    const totalCount = placementResult.tasks.filter((t) => !t.is_probe).length;

    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4">
          <div className="bg-white rounded-3xl shadow-md p-6 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900">Great work, {studentName}!</h2>
            <p className="text-gray-500 text-base">
              You answered {correctCount} of {totalCount} questions correctly.
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
              {placementResult.tasks.filter((t) => !t.is_probe).map((t) => (
                <div key={t.domain} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    t.score === 1 ? "bg-green-400 text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {t.score === 1 ? "✓" : "·"}
                  </div>
                  <span className="text-base text-gray-600">
                    {domainTitleMap[t.domain] ?? t.domain}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onViewReport ? onViewReport(placementResult) : onComplete(placementResult)}
            className="w-full bg-[#B7182E] text-white py-5 rounded-3xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            View Report 📋
          </button>
        </div>
      </div>
    );
  }

  // ── Task screen ────────────────────────────────────────────────────────────
  if (!task) return null;

  const isChoiceTask = task.answerMode === "choice";
  const hasAnswers = isChoiceTask
    ? !!selectedChoice
    : answers.every((a) => a.trim().length > 0);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Progress bar */}
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
          {/* Domain badge */}
          <div className="flex items-center gap-2">
            <span className="bg-teal-100 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">
              {task.domainTitle}
            </span>
            <span className="bg-gray-100 text-gray-500 text-sm px-2 py-1 rounded-full">
              Gate {task.gate}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
            <p className="text-gray-800 text-lg font-semibold leading-snug">{task.question}</p>
            {task.stimulus && <StimulusDisplay stimulus={task.stimulus} />}
          </div>

          {/* Answer card */}
          <div className="bg-white rounded-3xl shadow-md p-5 space-y-4">

            {/* ── Choice UI (probe tasks) ── */}
            {isChoiceTask && task.choices && (
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
            )}

            {/* ── Numeric / text / fraction UI ── */}
            {(task.answerMode === "numeric" || task.answerMode === "text" || task.answerMode === "fraction") && (
              <div className="space-y-3">
                <input
                  type={task.answerMode === "numeric" ? "number" : "text"}
                  value={answers[0] ?? ""}
                  onChange={(e) => setAnswers([e.target.value])}
                  onKeyDown={(e) => { if (e.key === "Enter" && hasAnswers && !submitting) handleSubmit(); }}
                  disabled={submitting}
                  placeholder={task.answerMode === "numeric" ? "Type your answer…" : "Write your answer…"}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-xl text-gray-800 font-semibold focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-300 text-center"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasAnswers}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all hover:shadow-md active:scale-98"
                >
                  Submit ✓
                </button>
              </div>
            )}

            {/* ── Multi-field UI ── */}
            {task.answerMode === "multiField" && task.fields && (
              <div className="space-y-3">
                {task.fields.map((field, i) => (
                  <div key={i}>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">{field.label}</label>
                    <input
                      type="text"
                      value={answers[i] ?? ""}
                      onChange={(e) => {
                        const next = [...answers];
                        next[i] = e.target.value;
                        setAnswers(next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && i === (task.fields!.length - 1) && hasAnswers && !submitting) {
                          handleSubmit();
                        }
                      }}
                      disabled={submitting}
                      placeholder={field.hint ?? field.exampleAnswer ?? "Your answer…"}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base text-gray-800 font-medium focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-300"
                      autoFocus={i === 0}
                    />
                  </div>
                ))}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !hasAnswers}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-40 transition-all hover:shadow-md active:scale-98"
                >
                  Submit ✓
                </button>
              </div>
            )}

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
