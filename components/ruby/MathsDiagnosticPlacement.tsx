"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MathsPlacementResult, MathsPlacementTaskResult, DiagnosticBlock } from "@/types/ruby";
import { getSkillIdsForLevels, getLevelById } from "@/lib/student-model";
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
  choices?: Choice[];
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

function adaptBankTask(raw: RawBankTask, block: DiagnosticBlock): Task {
  return { ...raw, block };
}

// ── Binary-search gate definitions ────────────────────────────────────────────
// Gates A–F each map to two bank domains.
// Grade-banded anchor: 1–3→A(0), 4–6→B(1), 7–9→C(2), 10+→D(3)
// Search windows:      1–3→[A,B], 4–6→[A,C], 7–9→[B,D], 10+→[C,F]

const SEARCH_GATES: Array<{ name: string; domains: [string, string] }> = [
  { name: "A", domains: ["M001", "M004"] },
  { name: "B", domains: ["M005", "M006"] },
  { name: "C", domains: ["M007", "M008"] },
  { name: "D", domains: ["M009", "M010"] },
  { name: "E", domains: ["M011", "M012"] },
  { name: "F", domains: ["M013", "M014"] },
];

function getAnchorGateIndex(grade: number): number {
  if (grade <= 3) return 0;
  if (grade <= 6) return 1;
  if (grade <= 9) return 2;
  return 3;
}

function getSearchWindow(grade: number): [number, number] {
  if (grade <= 3) return [0, 1];
  if (grade <= 6) return [0, 2];
  if (grade <= 9) return [1, 3];
  return [2, 5];
}

// ── Probe tasks (choice-based, do not count toward 9-task cap) ────────────────

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
  D: 13,  // Advanced (logs, trig, calc, differentiation) — Grade 13+
};

function getGradeFloor(grade: number): number {
  if (grade <= 2) return 1;
  if (grade <= 3) return 2;
  if (grade <= 4) return 3;
  if (grade <= 5) return 4;
  if (grade <= 6) return 5;
  if (grade <= 7) return 6;
  if (grade <= 8) return 7;
  if (grade <= 9) return 9;
  if (grade <= 10) return 11;
  if (grade <= 11) return 13;
  if (grade <= 12) return 15;
  return 17;
}

function computePlacement(
  results: MathsPlacementTaskResult[],
  grade: number,
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

  const passM004 = passed("M004", "A");
  const passM006 = passed("M006", "A");
  const passM008 = passed("M008", "B");
  const passM009 = passed("M009", "B");
  const passM011 = passed("M011", "C");
  const passM013 = passed("M013", "C");
  const passM015 = passed("M015", "D") || passed("M016", "D") || passed("M017", "D");

  let computedLevel = 1;
  if (gateF && passM015)      computedLevel = 17;
  else if (gateF)             computedLevel = 16;
  else if (gateE && passM013) computedLevel = 15;
  else if (gateE)             computedLevel = 14;
  else if (gateD && passM011) computedLevel = 13;
  else if (gateD)             computedLevel = 12;
  else if (gateC && passM009) computedLevel = 11;
  else if (gateC)             computedLevel = 8;
  else if (passM008)          computedLevel = 10;
  else if (gateB && passM006) computedLevel = 6;
  else if (gateB)             computedLevel = 5;
  else if (gateA)             computedLevel = 3;
  else if (passM004)          computedLevel = 2;

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
    earlyExitReason: null,
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

// ── Binary search state (ref avoids stale-closure issues in advanceTask) ──────

interface BsState {
  diagPhase: "anchor" | "search1" | "search2" | "confirm";
  anchorGateIdx: number;
  searchLo: number;
  searchHi: number;
  search1GateIdx: number;
  search2GateIdx: number;
  lastPassedGateIdx: number;   // -1 = none passed yet
}

// ── Stimulus renderer ─────────────────────────────────────────────────────────

function parseDotArray(stimulus: string): number | null {
  const m = stimulus.match(/^Dot array:\s*(\d+)\s*dots/i);
  return m ? parseInt(m[1], 10) : null;
}

function DotArray({ count }: { count: number }) {
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 flex flex-wrap gap-3 justify-center items-center min-h-[100px]">
      {dots.map((i) => (
        <div key={i} className="w-8 h-8 rounded-full bg-teal-600 shadow-sm flex-shrink-0" />
      ))}
    </div>
  );
}

function StimulusDisplay({ stimulus }: { stimulus: string }) {
  const dotCount = parseDotArray(stimulus);
  if (dotCount !== null) return <DotArray count={dotCount} />;
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
  const [domainTitleMap, setDomainTitleMap] = useState<Record<string, string>>({});

  // Dynamic task queue — rebuilt phase by phase
  const [allBankTasks, setAllBankTasks] = useState<Task[]>([]);
  const [phaseQueue, setPhaseQueue] = useState<Task[]>([]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const bsRef = useRef<BsState>({
    diagPhase: "anchor",
    anchorGateIdx: 0,
    searchLo: 0,
    searchHi: 0,
    search1GateIdx: -1,
    search2GateIdx: -1,
    lastPassedGateIdx: -1,
  });

  const [probeQueue, setProbeQueue] = useState<Task[]>([]);
  const [probesFiredThisPhase, setProbesFiredThisPhase] = useState(0);

  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const [completedTasks, setCompletedTasks] = useState<MathsPlacementTaskResult[]>([]);
  const [errorHistory, setErrorHistory] = useState<{ taskId: string; errorType: string }[]>([]);
  const [probesRun, setProbesRun] = useState(0);
  const [placementResult, setPlacementResult] = useState<MathsPlacementResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const bankLoadedRef = useRef(false);

  // ── Load random bank and build anchor queue ────────────────────────────────

  const loadBank = useCallback(() => {
    if (bankLoadedRef.current) return;
    bankLoadedRef.current = true;
    setPhase("loading");
    const n = Math.floor(Math.random() * 50) + 1;
    import(`@/data/maths-question-banks/${n}.json`)
      .then((mod) => {
        const raw = (mod.default ?? mod) as RawBankTask[];
        const readingLevel = getReadingProfile()?.current_level ?? 5;
        const tasks: Task[] = raw.map((t) => {
          const task = adaptBankTask(t, 1);
          return { ...task, question: simplifyText(task.question, readingLevel) };
        });
        const titleMap: Record<string, string> = {};
        tasks.forEach((t) => { titleMap[t.domain] = t.domainTitle; });

        // Initialise binary search state
        const anchorGateIdx = getAnchorGateIndex(grade);
        const [winLo, winHi] = getSearchWindow(grade);
        bsRef.current = {
          diagPhase: "anchor",
          anchorGateIdx,
          searchLo: winLo,
          searchHi: winHi,
          search1GateIdx: -1,
          search2GateIdx: -1,
          lastPassedGateIdx: -1,
        };

        // Phase 1: anchor — 2 tasks from anchor gate
        const anchorGate = SEARCH_GATES[anchorGateIdx];
        const anchorQueue: Task[] = anchorGate.domains
          .map((d) => tasks.find((t) => t.domain === d))
          .filter(Boolean)
          .map((t) => ({ ...t!, block: 1 as DiagnosticBlock }));

        setAllBankTasks(tasks);
        setDomainTitleMap(titleMap);
        setPhaseQueue(anchorQueue);
        setPhaseIndex(0);
        setPhase("task");
      })
      .catch(() => setPhase("task"));
  }, [grade]);

  // ── Current task: drain probe queue before advancing phase queue ──────────

  const task: Task | undefined =
    probeQueue.length > 0 ? probeQueue[0] : phaseQueue[phaseIndex];

  // Progress: 9 primary questions total (2 anchor + 4 search + 3 confirm)
  const TOTAL_QUESTIONS = 9;
  const primaryCompleted = completedTasks.filter((t) => !t.is_probe).length;
  const progress = (primaryCompleted / TOTAL_QUESTIONS) * 100;
  const phaseLabel =
    primaryCompleted < 2
      ? "Getting started"
      : primaryCompleted < 6
      ? "Finding your level"
      : "Almost done";

  const answerInputRef = useRef<HTMLInputElement>(null);

  // Reset answer state and focus input (desktop only) whenever the task changes
  useEffect(() => {
    if (task) {
      setAnswers(task.fields ? task.fields.map(() => "") : [""]);
      setSelectedChoice(null);
      if (window.matchMedia("(pointer: fine)").matches) {
        // Defer one tick so the input is rendered before focusing
        setTimeout(() => answerInputRef.current?.focus(), 0);
      }
    }
  }, [task?.id]);

  const finishDiagnostic = useCallback(
    (completed: MathsPlacementTaskResult[], pCount: number) => {
      const result = computePlacement(completed, grade, pCount);
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

      // ── Probe path ─────────────────────────────────────────────────────────
      if (result.is_probe) {
        setProbesRun((n) => n + 1);
        setProbeQueue((q) => q.slice(1));
        setShowEncouragement(false);
        setSubmitting(false);
        return;
      }

      // ── Primary task: maybe trigger follow-up probe ────────────────────────
      const currentTask = phaseQueue[phaseIndex];
      if (!result.correct && result.error_type && probesFiredThisPhase < 2) {
        const probe = getFollowUpProbe(result.error_type, currentTask?.block ?? 1);
        if (probe) {
          setProbeQueue((q) => [...q, probe]);
          setProbesFiredThisPhase((n) => n + 1);
        }
      }

      // ── Phase advancement ──────────────────────────────────────────────────
      const nextPhaseIndex = phaseIndex + 1;

      if (nextPhaseIndex < phaseQueue.length) {
        // More tasks remain in current phase queue
        setPhaseIndex(nextPhaseIndex);
        setShowEncouragement(false);
        setSubmitting(false);
        return;
      }

      // Current phase exhausted — transition to next
      const bs = bsRef.current;
      const primary = newCompleted.filter((t) => !t.is_probe);
      // Passes for the tasks in the phase just completed (by domain)
      const phaseDomains = new Set(phaseQueue.map((t) => t.domain));
      const phaseResults = primary.filter((t) => phaseDomains.has(t.domain));
      const phasePasses = phaseResults.filter((t) => t.correct).length;

      setProbesFiredThisPhase(0);

      // ── anchor → search1 ──────────────────────────────────────────────────
      if (bs.diagPhase === "anchor") {
        if (phasePasses === 2) {
          bs.lastPassedGateIdx = bs.anchorGateIdx;
          bs.searchLo = Math.min(bs.anchorGateIdx + 1, bs.searchHi);
        } else {
          bs.searchHi = Math.max(bs.anchorGateIdx - 1, bs.searchLo);
        }

        bs.diagPhase = "search1";
        const mid1 = bs.searchLo <= bs.searchHi
          ? Math.floor((bs.searchLo + bs.searchHi) / 2)
          : bs.anchorGateIdx; // fallback: reuse anchor gate area
        const clamped1 = Math.max(0, Math.min(mid1, SEARCH_GATES.length - 1));
        bs.search1GateIdx = clamped1;

        const s1Gate = SEARCH_GATES[clamped1];
        const s1Queue: Task[] = s1Gate.domains
          .map((d) => allBankTasks.find((t) => t.domain === d))
          .filter(Boolean)
          .map((t) => ({ ...t!, block: 2 as DiagnosticBlock }));

        setPhaseQueue(s1Queue);
        setPhaseIndex(0);

      // ── search1 → search2 ─────────────────────────────────────────────────
      } else if (bs.diagPhase === "search1") {
        if (phasePasses === 2) {
          bs.lastPassedGateIdx = Math.max(bs.lastPassedGateIdx, bs.search1GateIdx);
          bs.searchLo = bs.search1GateIdx + 1;
        } else {
          bs.searchHi = bs.search1GateIdx - 1;
        }

        bs.diagPhase = "search2";
        let mid2: number;
        if (bs.searchLo <= bs.searchHi) {
          mid2 = Math.floor((bs.searchLo + bs.searchHi) / 2);
        } else {
          // Search converged — pick a gate adjacent to last passed (or anchor)
          const ref = bs.lastPassedGateIdx >= 0 ? bs.lastPassedGateIdx : bs.anchorGateIdx;
          mid2 = phasePasses === 2
            ? Math.min(ref + 1, SEARCH_GATES.length - 1)
            : Math.max(ref - 1, 0);
        }
        mid2 = Math.max(0, Math.min(mid2, SEARCH_GATES.length - 1));
        bs.search2GateIdx = mid2;

        const s2Gate = SEARCH_GATES[mid2];
        const s2Queue: Task[] = s2Gate.domains
          .map((d) => allBankTasks.find((t) => t.domain === d))
          .filter(Boolean)
          .map((t) => ({ ...t!, block: 2 as DiagnosticBlock }));

        setPhaseQueue(s2Queue);
        setPhaseIndex(0);

      // ── search2 → confirm ─────────────────────────────────────────────────
      } else if (bs.diagPhase === "search2") {
        if (phasePasses === 2) {
          bs.lastPassedGateIdx = Math.max(bs.lastPassedGateIdx, bs.search2GateIdx);
        }

        bs.diagPhase = "confirm";

        // 3 confirm questions: one from each of (confirmGate−1, confirmGate, confirmGate+1)
        // Clamp so all three indices are valid.
        const cg = Math.max(0, Math.min(
          bs.lastPassedGateIdx >= 0 ? bs.lastPassedGateIdx : 0,
          SEARCH_GATES.length - 3
        ));
        const confirmQueue: Task[] = [cg, cg + 1, cg + 2]
          .map((gi) => {
            const gate = SEARCH_GATES[gi];
            if (!gate) return null;
            const t = allBankTasks.find((t) => t.domain === gate.domains[0]);
            return t ? { ...t, block: 3 as DiagnosticBlock } : null;
          })
          .filter(Boolean) as Task[];

        setPhaseQueue(confirmQueue);
        setPhaseIndex(0);

      // ── confirm → done ────────────────────────────────────────────────────
      } else if (bs.diagPhase === "confirm") {
        setShowEncouragement(false);
        finishDiagnostic(newCompleted, probesRun);
        setSubmitting(false);
        return;
      }

      setShowEncouragement(false);
      setSubmitting(false);
    },
    [
      completedTasks, errorHistory, phaseIndex, phaseQueue, allBankTasks,
      probesFiredThisPhase, probeQueue, probesRun, finishDiagnostic,
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
              { icon: "🎯", text: "9 questions" },
              { icon: "⏱️", text: "~5 min" },
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

  const encouragements = ["Keep going! 💪", "Brilliant! ⭐", "You've got this! 🎯", "Fantastic! 🌟", "Amazing! 🏆"];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 text-sm text-gray-400">
          <span className="font-semibold text-teal-600">{phaseLabel}</span>
          <span>Q {Math.min(primaryCompleted + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}</span>
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
                  ref={answerInputRef}
                  disabled={submitting}
                  placeholder={task.answerMode === "numeric" ? "Type your answer…" : "Write your answer…"}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-xl text-gray-800 font-semibold focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-300 text-center"
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
                      ref={i === 0 ? answerInputRef : undefined}
                      disabled={submitting}
                      placeholder={field.hint ?? field.exampleAnswer ?? "Your answer…"}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base text-gray-800 font-medium focus:outline-none focus:border-teal-400 transition-colors placeholder:text-gray-300"
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
                  {encouragements[primaryCompleted % encouragements.length]}
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
