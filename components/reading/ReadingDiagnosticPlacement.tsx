"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/fetch";
import { DiagnosticPlacementResult, DiagnosticTaskResult } from "@/types/reading";
import { speakViaAPI, prefetchTTS } from "@/lib/tts";
import DiagnosticReportView from "@/components/DiagnosticReportView";
import { describeError } from "@/lib/report-generator";
import type { DiagnosticReportInput } from "@/lib/report-generator";
import { DIAGNOSTIC_TASKS } from "@/lib/reading-diagnostic-tasks";

// ── Task definitions (hardcoded — no API calls for generation) ────────────────

type AnswerMode = "choice" | "voice" | "flash_choice" | "audio-tap";

interface Choice { label: string; value: string; correct: boolean; speech?: string }

interface Task {
  id: string;
  domain: string;
  gate?: string;              // "A" | "C" | "D" — undefined means ungated (Q15–Q25)
  displayWord?: string;       // Large display in card centre
  flashWord?: string;         // D11 flash-then-hide word
  flashMs?: number;
  question: string;
  subText?: string;
  answerMode: AnswerMode;
  choices?: Choice[];
  expectedAnswer?: string;    // For voice evaluation
  voiceHint?: string;         // e.g. "Read the word out loud"
  passage?: string;           // D16 full passage
}

// ── Grade-task ceiling ────────────────────────────────────────────────────────
// Reading always starts at D01 (phonological awareness) regardless of grade.
// The ceiling controls how far up the pipeline each grade is tested.
// All counts are fixed and predictable — 3-task increments:
//   Grade 1:  9 tasks — D01–D07  (phonological awareness + basic CVC decoding)
//   Grade 2: 12 tasks — D01–D10  (+ vowel patterns: silent E, vowel teams)
//   Grade 3: 15 tasks — D01–D12  (+ sight words, phoneme blending, r-controlled)
//   Grade 4+: 17 tasks — D01–D13B (+ two-syllable decoding, consonant blend encoding)
// D13C (Unfamiliar Word Encoding) excluded: it uses intentional pseudo-words that STT
// cannot reliably recognise — redesign as keyboard-tap spelling is a future iteration.
// Grade 4+ is capped at 17 — students beyond this advance through the skill tree.
const GRADE_TASK_IDS: Record<number, string[]> = {
  1: ["D01","D01B","D02","D02B","D03","D04","D05","D05B","D06","D07"],
  2: ["D01","D01B","D02","D02B","D03","D04","D05","D05B","D06","D07","D08","D09","D10"],
  3: ["D01","D01B","D02","D02B","D03","D04","D05","D05B","D06","D07","D08","D09","D10","D10B","D11","D12"],
  4: ["D01","D01B","D02","D02B","D03","D04","D05","D05B","D06","D07","D08","D09","D10","D10B","D11","D12","D13","D13B"],
};

// ── Dynamic task loader ───────────────────────────────────────────────────────
async function loadRandomQuestionPaper(grade: number): Promise<Task[]> {
  const randomNumber = Math.floor(Math.random() * 50) + 1; // 1–50
  const paper = await import(`@/data/question-banks/${randomNumber}.json`);
  const all = paper.default as Task[];
  const withGate = all.filter((t) => !!t.gate);
  const allowed = GRADE_TASK_IDS[Math.min(grade, 4)];
  if (!allowed) return withGate; // Grade 5+ gets all tasks
  return withGate.filter((t) => allowed.includes(t.id));
}


//const TASKS: Task[] = [
//  {
//    id: "D01", domain: "Phonological Awareness",
//    question: "Do these two words rhyme?",
//    subText: "Rhyming words sound the same at the end.",
//    displayWord: "cat   •   hat",
//    answerMode: "choice",
//    choices: [
//      { label: "Yes — they rhyme! 🎵", value: "yes", correct: true },
//      { label: "No — they don't rhyme", value: "no", correct: false },
//    ],
//  },
//  {
//    id: "D02", domain: "Phoneme Isolation",
//    question: "What is the very FIRST sound you hear in the word…",
//    displayWord: "sun",
//    answerMode: "choice",
//    choices: [
//      { label: "/s/  as in sock", value: "/s/", correct: true },
//      { label: "/u/  as in up", value: "/u/", correct: false },
//      { label: "/n/  as in net", value: "/n/", correct: false },
//      { label: "/m/  as in mat", value: "/m/", correct: false },
//    ],
//  },
//  {
//    id: "D03", domain: "Letter Sound — Consonant",
//    question: "What sound does this letter make?",
//    subText: "Say the sound, not the name.",
//    displayWord: "M",
//    answerMode: "choice",
//    choices: [
//      { label: "/m/  mmmm", value: "/m/", correct: true },
//      { label: "/n/  nnnn", value: "/n/", correct: false },
//      { label: "/b/  bbbb", value: "/b/", correct: false },
//      { label: "/p/  pppp", value: "/p/", correct: false },
//    ],
//  },
//  {
//    id: "D04", domain: "Letter Sound — Vowel",
//    question: "What SHORT sound does this letter make?",
//    subText: "Think of the sound in a short word.",
//    displayWord: "A",
//    answerMode: "choice",
//    choices: [
//      { label: "/a/  like apple 🍎", value: "/a/", correct: true },
//      { label: "/ay/ like cake 🎂", value: "/ay/", correct: false },
//      { label: "/e/  like bed 🛏️", value: "/e/", correct: false },
//      { label: "/o/  like hot 🔥", value: "/o/", correct: false },
//    ],
//  },
//  {
//    id: "D05", domain: "CVC Decoding",
//    question: "Read this word out loud for me.",
//    displayWord: "nop",
//    answerMode: "voice",
//    expectedAnswer: "nop",
//    voiceHint: "Tap the mic and say the word you see",
//  },
//  {
//    id: "D06", domain: "CVC Encoding",
//    question: "How many sounds are in this word?",
//    subText: "Say the sounds quietly to yourself first.",
//    displayWord: "bim",
//    answerMode: "choice",
//    choices: [
//      { label: "2 sounds", value: "2", correct: false },
//      { label: "3 sounds — b · i · m", value: "3", correct: true },
//      { label: "4 sounds", value: "4", correct: false },
//      { label: "5 sounds", value: "5", correct: false },
//    ],
//  },
//  {
//    id: "D07", domain: "Digraph Recognition",
//    question: "What ONE sound do these two letters make together?",
//    displayWord: "sh",
//    answerMode: "choice",
//    choices: [
//      { label: "/sh/  like ship 🚢", value: "/sh/", correct: true },
//      { label: "/s/ + /h/ — two separate sounds", value: "s+h", correct: false },
//      { label: "/ch/  like chin", value: "/ch/", correct: false },
//      { label: "/th/  like this", value: "/th/", correct: false },
//    ],
//  },
//  {
//    id: "D08", domain: "Consonant Blend Decoding",
//    question: "Read this word out loud for me.",
//    displayWord: "trup",
//    answerMode: "voice",
//    expectedAnswer: "trup",
//    voiceHint: "Tap the mic and say the word you see",
//  },
//  {
//    id: "D09", domain: "Long Vowel / Silent E",
//    question: "Read this word out loud for me.",
//    displayWord: "bake",
//    answerMode: "voice",
//    expectedAnswer: "bake",
//    voiceHint: "Tap the mic and say the word you see",
//  },
//  {
//    id: "D10", domain: "Vowel Teams",
//    question: "Read this word out loud for me.",
//    displayWord: "rain",
//    answerMode: "voice",
//    expectedAnswer: "rain",
//    voiceHint: "Tap the mic and say the word you see",
//  },
//  {
//    id: "D11", domain: "Sight Words",
//    question: "A word will flash on screen — remember it!",
//    subText: "Then choose the word you saw.",
//    flashWord: "where",
//    flashMs: 1500,
//    answerMode: "flash_choice",
//    choices: [
//      { label: "where", value: "where", correct: true },
//      { label: "were", value: "were", correct: false },
//      { label: "here", value: "here", correct: false },
//      { label: "there", value: "there", correct: false },
//    ],
//  },
//  {
//    id: "D12", domain: "R-Controlled Vowels",
//    question: "Read this word out loud for me.",
//    displayWord: "fern",
//    answerMode: "voice",
//    expectedAnswer: "fern",
//    voiceHint: "Tap the mic and say the word you see",
//  },
//  {
//    id: "D13", domain: "Two-Syllable Decoding",
//    question: "Read this word out loud for me.",
//    displayWord: "napkin",
//    answerMode: "voice",
//    expectedAnswer: "napkin",
//    voiceHint: "Tap the mic and say the word you see",
//  },
//  {
//    id: "D14", domain: "Multisyllabic Decoding",
//    question: "Read this word out loud for me.",
//    displayWord: "fantastic",
//    answerMode: "voice",
//    expectedAnswer: "fantastic",
//    voiceHint: "Tap the mic and say the word you see",
//  },
//  {
//    id: "D15", domain: "Prefix / Suffix Recognition",
//    question: "Which part at the beginning changes the meaning of this word?",
//    displayWord: "unkind",
//    answerMode: "choice",
//    choices: [
//      { label: "un —", value: "un", correct: true },
//      { label: "kind", value: "kind", correct: false },
//      { label: "unk —", value: "unk", correct: false },
//      { label: "— ind", value: "ind", correct: false },
//    ],
//  },
//  {
//    id: "D16", domain: "Fluency Passage",
//    question: "Read this passage out loud, as smoothly as you can.",
//    passage: FLUENCY_PASSAGE,
//    answerMode: "voice",
//    expectedAnswer: FLUENCY_PASSAGE,
//    voiceHint: "Tap the mic and read the whole passage",
//  },
//  {
//    id: "D17", domain: "Literal Comprehension",
//    question: "From the story you just read — where did Sam go?",
//    subText: "Use what the story told you.",
//    answerMode: "voice",
//    expectedAnswer: "barn",
//    voiceHint: "Tap the mic and answer out loud",
//  },
//  {
//    id: "D18", domain: "Inferential Comprehension",
//    question: "The story didn't tell us — why do you think Max licked Sam's hand?",
//    subText: "Think about what you know about dogs.",
//    answerMode: "voice",
//    voiceHint: "Tap the mic and share your thinking",
//  },
//];

// ── Default error type per task (used when a task is failed or skipped) ──────
const TASK_ERROR_MAP: Record<string, string> = {
  D01:  "ERR_PHONEME_CONF",    // Rhyme detection — phonological awareness
  D01B: "ERR_SYLLABLE_BREAK",  // Syllable segmentation & blending
  D02:  "ERR_PHONEME_CONF",    // Phoneme isolation — onset/coda matching
  D02B: "ERR_PHONEME_CONF",    // Full phoneme segmentation / counting
  D03:  "ERR_SOUND_RECALL",    // Consonant sound discrimination
  D04:  "ERR_VOWEL_CONF",      // Short vowel identification (specifically vowel, not consonant)
  D05:  "ERR_SOUND_RECALL",    // Digraph recognition — two-letter sound
  D06:  "ERR_BLEND_FAIL",      // Consonant blend decoding (CCVC/CVCC — blends are the gap)
  D07:  "ERR_SOUND_OMIT",      // CVC word reading — basic decoding failure (not a blend issue)
  D08:  "ERR_SOUND_RECALL",    // Digraph word decoding — sh/ch recognition
  D09:  "ERR_VOWEL_CONF",      // Long vowel / silent E — vowel pattern confusion
  D10:  "ERR_VOWEL_CONF",      // Vowel teams — ai/ea/oa/oo confusion
  D10B: "ERR_BLEND_FAIL",      // Phoneme sequence blending — multi-phoneme clusters
  D11:  "ERR_SIGHT_MISS",      // Sight word automaticity — high-frequency words
  D12:  "ERR_VOWEL_CONF",      // R-controlled vowels — ar/er/or confusion
  D13:  "ERR_MULTI_BREAK",     // Two-syllable decoding — syllable boundary errors
  D13B: "ERR_ENCODE_BLEND",    // Consonant blend encoding — phoneme-to-grapheme mapping
  D13C: "ERR_ENCODE_BLEND",    // Unfamiliar word encoding — phonological analysis
  D14:  "ERR_MULTI_BREAK",     // Multisyllabic decoding — 3-syllable words
  D15:  "ERR_SOUND_RECALL",    // Prefix/suffix recognition — morpheme identification
  D15B: "ERR_MEANING_BLIND",   // Self-monitoring — does not notice nonsensical reading
  D16:  "ERR_FLUENCY_HES",     // Oral reading fluency — speed/prosody
  D17:  "ERR_MEANING_BLIND",   // Literal comprehension — explicit retrieval
  D18:  "ERR_MEANING_BLIND",   // Inferential comprehension — implied meaning
};

// ── Skill name map ─────────────────────────────────────────────────────────────

const SKILL_NAME_MAP: Record<string, string> = {
  // R1 — Listening & Phonological Awareness
  "R1.T1.A1": "Following Instructions",
  "R1.T1.A2": "Story Retell",
  "R1.T1.A3": "Speaking in Sentences",
  "R1.T2.A1": "Rhyme Awareness",
  "R1.T2.A2": "Syllable Segmentation",
  "R1.T3.A1": "Phoneme Isolation",
  "R1.T3.A2": "Phoneme Blending",
  "R1.T3.A3": "Phoneme Manipulation",
  // R2 — Letter Sounds & Decoding
  "R2.T1.A1": "Letter Sounds",
  "R2.T1.A2": "Letter-Sound Mapping",
  "R2.T1.A3": "Letter Discrimination",
  "R2.T2.A1": "Digraph Sounds",
  "R2.T2.A2": "Consonant Blends",
  "R2.T2.A3": "CVC Word Decoding",
  "R2.T2.A4": "Digraph Word Decoding",
  "R2.T3.A1": "Vowel Patterns",
  "R2.T3.A2": "Phonogram Retrieval",
  "R2.T3.A3": "Sound Blending",
  // R3 — Spelling & Encoding
  "R3.T1.A1": "Spelling Foundations",
  "R3.T1.A2": "Blend Spelling",
  "R3.T1.A3": "Word Encoding",
  "R3.T1.A4": "Nonsense Word Spelling",
  "R3.T2.A1": "Complete Spelling",
  "R3.T2.A2": "Spelling Self-Correction",
  // R4 — Fluency & Word Recognition
  "R4.T1.A1": "Word Decoding",
  "R4.T2.A1": "Text Tracking",
  "R4.T2.A2": "Word Recognition",
  "R4.T3.A1": "Fluent Reading",
  "R4.T3.A2": "Reading for Meaning",
  // R5 — Comprehension
  "R5.T1.A1": "Comprehension",
  "R5.T1.A2": "Inferential Comprehension",
  "R5.T1.A3": "Inferential Thinking",
  "R5.T2.A1": "Reading Reasoning",
  "R5.T2.A2": "Vocabulary Use",
  "R5.T3.A1": "Written Response",
};

// ── TTS helper ────────────────────────────────────────────────────────────────

function speakText(text: string, onEnd?: () => void): () => void {
  return speakViaAPI(text, () => {}, onEnd ?? (() => {}));
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

function normalize(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]/g, ""); }

/** Edit distance — avoids "coal" ≈ "call" false positives from character overlap */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const prev = Array.from({ length: n + 1 }, (_, i) => i);
  const curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev.splice(0, n + 1, ...curr);
  }
  return prev[n];
}

/** Soundex encoding — catches STT homophones like "gaze"→"gays", "peat"→"Pete" */
function soundex(s: string): string {
  const upper = s.toUpperCase().replace(/[^A-Z]/g, "");
  if (!upper) return "";
  const map: Record<string, string> = {
    B: "1", F: "1", P: "1", V: "1",
    C: "2", G: "2", J: "2", K: "2", Q: "2", S: "2", X: "2", Z: "2",
    D: "3", T: "3",
    L: "4",
    M: "5", N: "5",
    R: "6",
  };
  let code = upper[0];
  let prev = map[upper[0]] ?? "0";
  for (let i = 1; i < upper.length && code.length < 4; i++) {
    const c = map[upper[i]] ?? "0";
    if (c !== "0" && c !== prev) code += c;
    prev = c;
  }
  return code.padEnd(4, "0");
}

function scoreVoiceResponse(transcript: string, expected: string): { correct: boolean; score: number } {
  const t = normalize(transcript);
  const e = normalize(expected);
  if (!t) return { correct: false, score: 0 };
  // No expected answer (e.g. passage tasks) — caller must handle separately
  if (!e) return { correct: false, score: 0 };
  // Word-level matching: split transcript into words so "there" does not falsely match "the".
  // For single-word targets, find the best-matching word in the transcript.
  const words = transcript.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  // Exact word match
  if (words.some((w) => normalize(w) === e)) return { correct: true, score: 1 };
  // Phonetic match — catches STT homophones (e.g. "gaze"→"gays", "peat"→"Pete")
  const ePhonetic = soundex(e);
  if (ePhonetic && words.some((w) => soundex(normalize(w)) === ePhonetic)) {
    return { correct: true, score: 0.9 };
  }
  // Best Levenshtein similarity across all transcript words
  let bestSim = 0;
  for (const word of words) {
    const nw = normalize(word);
    const dist = levenshtein(nw, e);
    const maxLen = Math.max(nw.length, e.length);
    const sim = maxLen > 0 ? 1 - dist / maxLen : 1;
    if (sim > bestSim) bestSim = sim;
  }
  // ≥ 0.8 required to avoid "coal"→"call" false positives on short words
  return { correct: bestSim >= 0.8, score: bestSim };
}

/** Score D16-style fluency passages by word-coverage accuracy. */
function scorePassageReading(transcript: string, passage: string): { correct: boolean; score: number } {
  const passageWords = passage.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  const spokenn = new Set(transcript.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean));
  const matched = passageWords.filter((w) => spokenn.has(w)).length;
  const accuracy = passageWords.length > 0 ? matched / passageWords.length : 0;
  // Pass if student read ≥ 85% of the passage words (proxy for ≥ 40 WPM in a 60-second window)
  return { correct: accuracy >= 0.85, score: accuracy };
}

// ── Reading level label map ───────────────────────────────────────────────────
const ENTRY_LEVEL_LABELS: Record<number, string> = {
  1: "Foundation Reading",
  2: "Reading Level 1–2",
  3: "Reading Level 2–3",
  4: "Reading Level 3–4",
  5: "Reading Level 4+",
};

// ── Build DiagnosticReportInput from placement result ────────────────────────
function buildReadingReportInput(
  studentName: string,
  studentGrade: number,
  placement: DiagnosticPlacementResult,
  completedTasks: DiagnosticTaskResult[]
): DiagnosticReportInput {
  const domainScores = DIAGNOSTIC_TASKS
    .filter((t) => completedTasks.some((r) => r.taskId === t.id))
    .map((task) => {
      const result = completedTasks.find((r) => r.taskId === task.id)!;
      const passed = result.score >= task.passThreshold;
      const score = Math.round(result.score * 100);
      const label: "strong" | "practice" | "building" =
        score >= 80 ? "strong" : score >= 50 ? "building" : "practice";
      const errorNote =
        !passed && result.errorType && result.errorType !== "correct"
          ? (describeError(result.errorType, "reading") ?? null)
          : null;
      return { domain: task.domain, score, label, errorNote };
    });

  const level = parseInt(placement.entrySkillId.charAt(1)) || 1;
  const workingLevel = ENTRY_LEVEL_LABELS[level] ?? "Foundation Reading";
  const gradeLevelGap = studentGrade - level;

  return {
    subject: "reading",
    studentName,
    studentGrade,
    workingLevel,
    gradeLevelGap,
    questionsAnalysed: completedTasks.length,
    correctCount: completedTasks.filter((t) => t.correct).length,
    domainScores,
    dominantErrors: placement.dominantErrors ?? [],
    placementSkill: SKILL_NAME_MAP[placement.entrySkillId] ?? placement.entrySkillId,
    skillsCompleted: placement.autoCompletedSkillIds.length,
    hardGateBlocked: !placement.hardGatePassed,
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "welcome" | "task" | "flash_showing" | "flash_hidden" | "calculating" | "result" | "report";

// ── Main component ────────────────────────────────────────────────────────────

export default function ReadingDiagnosticPlacement({
  studentName,
  studentGrade = 1,
  onComplete,
  onViewReport,
}: {
  studentName: string;
  studentGrade?: number;
  onComplete: (result: DiagnosticPlacementResult) => void;
  onViewReport?: (result: DiagnosticPlacementResult) => void;
}) {
  const [TASKS, setTASKS] = useState<Task[]>([]);
  // Ref always holds the latest TASKS — avoids stale closures in callbacks
  const TASKSRef = useRef<Task[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [taskIndex, setTaskIndex] = useState(0);
  const taskIndexRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [flashVisible, setFlashVisible] = useState(false);
  const [flashDone, setFlashDone] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<DiagnosticTaskResult[]>([]);
  const completedTasksRef = useRef<DiagnosticTaskResult[]>([]);
  const [placementResult, setPlacementResult] = useState<DiagnosticPlacementResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [reportInput, setReportInput] = useState<DiagnosticReportInput | null>(null);
  // Mic gating: only allow mic after TTS has finished + 500 ms buffer
  const [micEnabled, setMicEnabled] = useState(false);
  // Prevents tap-through from audio-tap choice button to "That's my answer"
  const [submitReady, setSubmitReady] = useState(false);
  // STT unavailable (non-Chrome) — show inline notice and auto-advance
  const [sttUnavailable, setSttUnavailable] = useState(false);
  const [sttHavingTrouble, setSttHavingTrouble] = useState(false);
  // Refs for stable access inside STT callbacks
  const transcriptRef = useRef("");
  const listeningRef = useRef(false);
  const micTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref keeps latest task id accessible inside the [] useCallback for startVoice
  const currentTaskIdRef = useRef<string>("");
  // STT restart attempt counter — resets when listening stops or transcript captured
  const restartCountRef = useRef(0);
  const MAX_STT_RESTARTS = 5;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [taskIndex, phase]);

  useEffect(() => {
    let cancelled = false;
    const fetchTasks = async () => {
      let tasks: Task[] = [];
      while (!cancelled && tasks.length === 0) {
        tasks = await loadRandomQuestionPaper(studentGrade);
      }
      if (!cancelled) {
        TASKSRef.current = tasks;
        setTASKS(tasks);
      }
    };
    fetchTasks();
    return () => { cancelled = true; };
  }, []);

  const cancelSpeech = useRef<(() => void) | null>(null);
  const [playingChoiceValue, setPlayingChoiceValue] = useState<string | null>(null);
  const cancelChoiceAudio = useRef<(() => void) | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const srRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const task = TASKS[taskIndex] ?? null;
  const progress = TASKS.length > 0 ? (taskIndex / TASKS.length) * 100 : 0;

  // Speak the question when a new task loads
  useEffect(() => {
    if (!task) return;
    if (phase !== "task" && phase !== "flash_showing" && phase !== "flash_hidden") return;
    setTranscript("");
    setSelectedChoice(null);
    setFlashDone(false);
    setFlashVisible(false);
    setShowEncouragement(false);
    cancelChoiceAudio.current?.();
    cancelChoiceAudio.current = null;
    setPlayingChoiceValue(null);
    // Reset mic gating for each new task
    setMicEnabled(false);
    setSubmitReady(false);
    transcriptRef.current = "";
    if (micTimerRef.current) { clearTimeout(micTimerRef.current); micTimerRef.current = null; }

    // Prefetch TTS immediately so audio is ready when user taps play — no auto-play
    prefetchTTS(task.question);
    if (task.choices) task.choices.forEach((c) => { if (c.speech) prefetchTTS(c.speech); });

    // Enable mic after a short delay — user does not need to hear the question first
    micTimerRef.current = setTimeout(() => setMicEnabled(true), 800);
    return () => {
      if (micTimerRef.current) { clearTimeout(micTimerRef.current); micTimerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIndex, phase, task]);

  // Flash mechanic for D11
  useEffect(() => {
    if (!task || task.answerMode !== "flash_choice" || phase !== "task") return;
    // Show flash word after a 1.5s delay
    const t1 = setTimeout(() => {
      setFlashVisible(true);
      const t2 = setTimeout(() => {
        setFlashVisible(false);
        setFlashDone(true);
      }, task.flashMs ?? 1500);
      timerRef.current = t2;
    }, 1200);
    timerRef.current = t1;
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIndex, phase, task]);

  // Disable mic while question audio plays; re-enable 500 ms after it stops
  useEffect(() => {
    if (speaking) { setMicEnabled(false); return; }
    if (micTimerRef.current) clearTimeout(micTimerRef.current);
    micTimerRef.current = setTimeout(() => setMicEnabled(true), 500);
    return () => { if (micTimerRef.current) clearTimeout(micTimerRef.current); };
  }, [speaking]);

  // Prevent tap-through: "That's my answer" becomes active 350 ms after selection
  useEffect(() => {
    if (!selectedChoice) { setSubmitReady(false); return; }
    const t = setTimeout(() => setSubmitReady(true), 350);
    return () => clearTimeout(t);
  }, [selectedChoice]);

  // STT — continuous:false with auto-restart until user stops or transcript captured
  const startVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSttUnavailable(true); return; }

    restartCountRef.current = 0;
    setSttHavingTrouble(false);

    const lang = (navigator.language || "").startsWith("en") ? navigator.language : "en-GB";

    const launchRec = () => {
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang;
      rec.onstart = () => setListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (e: any) => {
        const t = Array.from(e.results as ArrayLike<SpeechRecognitionResult>)
          .map((r) => r[0].transcript).join("");
        transcriptRef.current = t;
        setTranscript(t);
      };
      rec.onend = () => {
        if (listeningRef.current && !transcriptRef.current.trim() && srRef.current === rec) {
          restartCountRef.current += 1;
          if (restartCountRef.current >= MAX_STT_RESTARTS) {
            setSttHavingTrouble(true);
            listeningRef.current = false;
            setListening(false);
            return;
          }
          // 400 ms gap — Chrome needs time to fully release the audio context
          setTimeout(() => { if (listeningRef.current) launchRec(); }, 400);
          return;
        }
        listeningRef.current = false;
        setListening(false);
      };
      rec.onerror = () => {
        if (listeningRef.current && !transcriptRef.current.trim() && srRef.current === rec) {
          restartCountRef.current += 1;
          if (restartCountRef.current >= MAX_STT_RESTARTS) {
            setSttHavingTrouble(true);
            listeningRef.current = false;
            setListening(false);
            return;
          }
          setTimeout(() => { if (listeningRef.current) launchRec(); }, 400);
          return;
        }
        listeningRef.current = false;
        setListening(false);
      };
      srRef.current = rec;
      try { rec.start(); } catch { listeningRef.current = false; setListening(false); }
    };

    listeningRef.current = true;
    launchRec();
  }, []);

  const stopVoice = useCallback(() => {
    listeningRef.current = false;
    srRef.current?.stop();
    setListening(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // Keep refs in sync so advanceTask always reads current values
  taskIndexRef.current = taskIndex;
  completedTasksRef.current = completedTasks;
  // Keep current task id accessible inside the [] startVoice callback
  const currentTask = TASKSRef.current[taskIndex];
  currentTaskIdRef.current = currentTask?.id ?? "";

  // Reset STT flags whenever the task changes
  useEffect(() => { setSttUnavailable(false); setSttHavingTrouble(false); restartCountRef.current = 0; }, [taskIndex]);

  // When STT is unavailable on a voice task, auto-advance after 2 s scored as sttSkipped
  // (sttSkipped tasks are excluded from placement scoring — treated as unadministered)
  useEffect(() => {
    if (!sttUnavailable) return;
    const taskId = currentTaskIdRef.current;
    if (!taskId) return;
    const timer = setTimeout(() => {
      advanceTask({ taskId, correct: false, score: 0, response: "(stt-unavailable)", sttSkipped: true });
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sttUnavailable]);

  // Advance to next task — uses refs to avoid stale closure issues
  const advanceTask = useCallback(async (result: DiagnosticTaskResult) => {
    setSubmitting(true);
    const currentIndex = taskIndexRef.current;
    const currentCompleted = completedTasksRef.current;
    const totalTasks = TASKSRef.current.length;

    const newCompleted = [...currentCompleted, result];
    setCompletedTasks(newCompleted);
    completedTasksRef.current = newCompleted;

    if (result.response !== "(skipped)" && result.response !== "(no response)" && !result.sttSkipped) setShowEncouragement(true);
    await new Promise(r => setTimeout(r, 800));

    if (currentIndex + 1 >= totalTasks) {
      setPhase("calculating");
      try {
        const res = await apiFetch("/api/reading/diagnostic/placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: newCompleted, grade: studentGrade }),
        });
        const placement: DiagnosticPlacementResult = res.ok ? await res.json() : {
          completedAt: Date.now(), tasks: newCompleted,
          entrySkillId: "R1.T2.A1", autoCompletedSkillIds: [], hardGatePassed: false, dominantErrors: [],
        };
        setPlacementResult(placement);
        setPhase("result");
      } catch {
        setPlacementResult({ completedAt: Date.now(), tasks: newCompleted, entrySkillId: "R1.T2.A1", autoCompletedSkillIds: [], hardGatePassed: false, dominantErrors: [] });
        setPhase("result");
      }
    } else {
      const next = currentIndex + 1;
      taskIndexRef.current = next;
      setTaskIndex(next);
    }
    setSubmitting(false);
  }, []);

  // Handle choice selection
  const handleChoice = useCallback((choice: Choice) => {
    if (submitting || !task) return;
    setSelectedChoice(choice.value);
    setTimeout(() => {
      advanceTask({ taskId: task.id, correct: choice.correct, score: choice.correct ? 1 : 0, response: choice.value, errorType: choice.correct ? "correct" : TASK_ERROR_MAP[task.id] });
    }, 400);
  }, [submitting, task, advanceTask]);

  // Handle voice submit
  const handleVoiceSubmit = useCallback(() => {
    if (submitting || !task) return;
    stopVoice();
    const t = transcript.trim();
    // No speech captured — skip rather than score as wrong
    if (!t) {
      advanceTask({ taskId: task.id, correct: false, score: 0, response: "(no response)", errorType: TASK_ERROR_MAP[task.id] });
      return;
    }
    // Passage tasks: score by word-coverage accuracy (proxy for fluency rate)
    if (task.passage) {
      const { correct, score } = scorePassageReading(t, task.passage);
      advanceTask({ taskId: task.id, correct, score, response: t, errorType: correct ? "correct" : TASK_ERROR_MAP[task.id] });
      return;
    }
    const { correct, score } = scoreVoiceResponse(t, task.expectedAnswer ?? "");
    advanceTask({ taskId: task.id, correct, score, response: t, errorType: correct ? "correct" : TASK_ERROR_MAP[task.id] });
  }, [submitting, transcript, task, stopVoice, advanceTask]);

  // Skip task
  const handleSkip = useCallback(() => {
    if (submitting || !task) return;
    stopVoice();
    cancelChoiceAudio.current?.();
    advanceTask({ taskId: task.id, correct: false, score: 0, response: "(skipped)", errorType: TASK_ERROR_MAP[task.id] });
  }, [submitting, task, stopVoice, advanceTask]);

  // Audio-tap: tap a choice button → play its speech + mark as selected
  const handleAudioTapPlay = useCallback((choice: Choice) => {
    if (submitting) return;
    cancelSpeech.current?.();   // Stop question TTS so choice audio isn't blocked
    cancelChoiceAudio.current?.();
    const key = choice.value ?? choice.label;
    setPlayingChoiceValue(key);
    setSelectedChoice(key);
    cancelChoiceAudio.current = speakText(
      choice.speech ?? choice.label,
      () => setPlayingChoiceValue(null)
    );
  }, [submitting]);

  // Audio-tap: submit the selected choice
  const handleAudioTapSubmit = useCallback(() => {
    if (!task || !selectedChoice || submitting) return;
    const chosen = task.choices?.find((c) => (c.value ?? c.label) === selectedChoice);
    if (!chosen) return;
    cancelChoiceAudio.current?.();
    setPlayingChoiceValue(null);
    advanceTask({ taskId: task.id, correct: chosen.correct, score: chosen.correct ? 1 : 0, response: selectedChoice, errorType: chosen.correct ? "correct" : TASK_ERROR_MAP[task.id] });
  }, [task, selectedChoice, submitting, advanceTask]);

  // ── Loading (tasks not yet fetched) ──────────────────────────────────────────
  if (TASKS.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-purple-100 items-center justify-center">
        <div className="text-5xl animate-bounce mb-4">📚</div>
        <p className="text-gray-600 text-base font-medium">Loading your activities…</p>
      </div>
    );
  }

  // ── Welcome ──────────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-purple-100 items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto">🌟</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hi {studentName}!</h2>
            <p className="text-gray-600 mt-3 leading-relaxed text-base">
              Before we start, let&apos;s do a short discovery activity so I can find your perfect starting point!
            </p>
            <p className="text-purple-600 font-medium mt-2 text-base">No pressure, just do your best 😊</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
            {[{ icon: "🎯", text: `${TASKS.length} activities` }, { icon: "⏱️", text: "10–15 min" }, { icon: "🏆", text: "Find your level" }].map(({ icon, text }) => (
              <div key={text} className="bg-purple-50 rounded-xl p-2">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase("task")}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Let&apos;s go! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Calculating ───────────────────────────────────────────────────────────────
  if (phase === "calculating") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-purple-100 items-center justify-center p-6">
        <div className="text-center space-y-5">
          <div className="text-7xl animate-bounce">🌍</div>
          <h3 className="text-2xl font-bold text-gray-800">Working out your perfect learning path…</h3>
          <p className="text-gray-500 text-base">Just a moment!</p>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────────
  if (phase === "result" && placementResult) {
    const autoCount = placementResult.autoCompletedSkillIds.length;
    const entryName = SKILL_NAME_MAP[placementResult.entrySkillId] ?? placementResult.entrySkillId;
    const ALL_IDS = [
      "R1.T1.A1","R1.T1.A2","R1.T1.A3","R1.T2.A1","R1.T2.A2","R1.T3.A1","R1.T3.A2","R1.T3.A3",
      "R2.T1.A1","R2.T1.A2","R2.T1.A3","R2.T2.A1","R2.T2.A2","R2.T2.A3","R2.T2.A4","R2.T3.A1","R2.T3.A2","R2.T3.A3",
      "R3.T1.A1","R3.T1.A2","R3.T1.A3","R3.T1.A4","R3.T2.A1","R3.T2.A2",
      "R4.T1.A1","R4.T2.A1","R4.T2.A2","R4.T3.A1","R4.T3.A2",
      "R5.T1.A1","R5.T1.A2","R5.T1.A3","R5.T2.A1","R5.T2.A2","R5.T3.A1",
    ];
    const levelGroups = [
      { label: "Foundation", ids: ALL_IDS.slice(0, 8) },
      { label: "Alphabetic", ids: ALL_IDS.slice(8, 16) },
      { label: "Encoding", ids: ALL_IDS.slice(16, 22) },
      { label: "Decoding", ids: ALL_IDS.slice(22, 28) },
      { label: "Comprehension", ids: ALL_IDS.slice(28) },
    ];
    const getState = (id: string) => id === placementResult.entrySkillId ? "active" : placementResult.autoCompletedSkillIds.includes(id) ? "mastered" : "locked";

    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-purple-100 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full p-4 sm:p-6 space-y-4">
          <div className="bg-white rounded-3xl shadow-md p-6 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900">Great work, {studentName}!</h2>
            <p className="text-gray-500 text-base">I&apos;ve found your perfect starting point.</p>
            {autoCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <p className="text-green-700 font-bold text-lg">You already know {autoCount} skill{autoCount !== 1 ? "s" : ""}! ✅</p>
              </div>
            )}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3">
              <p className="text-purple-400 text-sm font-semibold uppercase tracking-wide mb-1">You&apos;re starting at</p>
              <p className="text-purple-800 font-bold text-xl">{entryName}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-5">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Your Skill Map</h3>
            <div className="space-y-3">
              {levelGroups.map((g) => {
                const mc = g.ids.filter(id => getState(id) === "mastered").length;
                return (
                  <div key={g.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500 font-medium">{g.label}</span>
                      {mc > 0 && <span className="text-sm text-green-600 font-semibold">{mc}/{g.ids.length}</span>}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {g.ids.map(id => {
                        const s = getState(id);
                        return (
                          <div key={id} className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                            s === "mastered" ? "bg-green-400 text-white" : s === "active" ? "bg-purple-500 text-white ring-2 ring-purple-300 ring-offset-1 scale-110" : "bg-gray-200 text-gray-400"
                          }`}>
                            {s === "mastered" ? "✓" : s === "active" ? "★" : "·"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded inline-block" />Mastered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded inline-block" />Start here</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded inline-block" />Locked</span>
            </div>
          </div>

          <button
            onClick={() => {
              const input = buildReadingReportInput(studentName, studentGrade, placementResult, completedTasks);
              if (onViewReport) {
                onViewReport(placementResult);
              } else {
                setReportInput(input);
                setPhase("report");
              }
            }}
            className="w-full bg-[#B7182E] text-white py-5 rounded-3xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            View Report 📋
          </button>
        </div>
      </div>
    );
  }

  // ── Report ────────────────────────────────────────────────────────────────────
  if (phase === "report" && reportInput && placementResult) {
    return (
      <DiagnosticReportView
        input={reportInput}
        onStartLearning={() => onComplete(placementResult)}
      />
    );
  }

  // ── Task screen ───────────────────────────────────────────────────────────────
  const isFlashTask = task.answerMode === "flash_choice";
  const canSubmitVoice = task.answerMode === "voice" && !submitting;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 text-sm text-gray-400">
          <span className="font-medium">Discovery Activity</span>
          <span>{taskIndex + 1} of {TASKS.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="max-w-md mx-auto space-y-4">

          {/* Domain badge */}
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">{task.domain}</span>
            {speaking && <span className="text-sm text-purple-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />Reading aloud…</span>}
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
            {/* Question text */}
            <p className="text-gray-800 text-lg font-semibold leading-snug">{task.question}</p>
            {task.subText && <p className="text-gray-400 text-base">{task.subText}</p>}

            {/* Re-read button */}
            <button
              onClick={() => {
                cancelChoiceAudio.current?.();
                cancelChoiceAudio.current = null;
                setPlayingChoiceValue(null);
                cancelSpeech.current?.();
                cancelSpeech.current = speakText(task.question, () => setSpeaking(false));
                setSpeaking(true);
              }}
              className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Hear the question
            </button>

            {/* ── Large word display ── */}
            {task.displayWord && !isFlashTask && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-50 rounded-2xl p-6 text-center">
                <p className="text-5xl sm:text-6xl font-bold text-purple-700 tracking-wider">
                  {task.displayWord}
                </p>
              </div>
            )}

            {/* ── Passage display (D16) ── */}
            {task.passage && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-gray-800 text-base leading-loose font-medium">{task.passage}</p>
              </div>
            )}

            {/* ── Flash mechanic (D11) ── */}
            {isFlashTask && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-50 rounded-2xl p-8 text-center min-h-[100px] flex items-center justify-center">
                {flashVisible ? (
                  <p className="text-5xl font-bold text-purple-700 animate-pulse">{task.flashWord}</p>
                ) : flashDone ? (
                  <p className="text-gray-400 text-base">The word has disappeared, now choose below!</p>
                ) : (
                  <p className="text-gray-400 text-base">Get ready… the word is about to appear!</p>
                )}
              </div>
            )}
          </div>

          {/* ── Answer area ── */}
          <div className="bg-white rounded-3xl shadow-md p-5 space-y-4">

            {/* CHOICE or FLASH_CHOICE */}
            {(task.answerMode === "choice" || (isFlashTask && flashDone)) && task.choices && (
              <div className={`grid gap-3 ${task.choices.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                {task.choices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleChoice(c)}
                    disabled={submitting || !!selectedChoice}
                    className={`px-4 py-4 rounded-2xl border-2 text-base font-semibold text-left transition-all select-none ${
                      selectedChoice === c.value
                        ? "bg-purple-500 border-purple-500 text-white shadow-lg scale-105"
                        : selectedChoice
                        ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                        : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 active:scale-95"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* Waiting for flash */}
            {isFlashTask && !flashDone && (
              <div className="flex items-center justify-center py-4">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {/* VOICE */}
            {task.answerMode === "voice" && (
              <div className="space-y-4">
                {task.voiceHint && <p className="text-sm text-gray-400 text-center">{task.voiceHint}</p>}

                {/* STT unavailable — inline notice, auto-advances in 2 s */}
                {sttUnavailable && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-center space-y-1">
                    <p className="text-amber-700 font-semibold text-sm">Voice input isn&apos;t available in this browser</p>
                    <p className="text-amber-600 text-xs">This question will be skipped automatically…</p>
                  </div>
                )}

                {/* Mic, transcript and submit — hidden while sttUnavailable */}
                {!sttUnavailable && (
                  <>
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => { setSttHavingTrouble(false); restartCountRef.current = 0; listening ? stopVoice() : startVoice(); }}
                        disabled={submitting || speaking || !micEnabled}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                          listening
                            ? "bg-red-500 text-white animate-pulse shadow-red-200 shadow-xl"
                            : (speaking || !micEnabled)
                            ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                            : sttHavingTrouble
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-purple-500 text-white hover:bg-purple-600"
                        }`}
                      >
                        {listening ? (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" />
                          </svg>
                        )}
                      </button>
                      <p className="text-sm font-medium text-center max-w-[200px]">
                        {speaking ? <span className="text-gray-400">⏳ Listen to the question first…</span>
                          : listening ? <span className="text-gray-400">🔴 Listening… tap to stop</span>
                          : !micEnabled ? <span className="text-gray-400">⏳ Getting ready…</span>
                          : sttHavingTrouble ? <span className="text-orange-500">Having trouble hearing you, tap to try again</span>
                          : <span className="text-gray-400">Tap the mic to speak</span>}
                      </p>
                    </div>

                    {/* Live transcript */}
                    {transcript && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-center">
                        <p className="text-sm text-green-500 font-medium mb-1">I heard:</p>
                        <p className="text-green-800 font-semibold">"{transcript}"</p>
                      </div>
                    )}

                    {/* Submit voice */}
                    {canSubmitVoice && (
                      <button
                        onClick={handleVoiceSubmit}
                        disabled={(!transcript && !listening) || submitting}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                        ) : listening ? "Stop & Submit →" : "Submit →"}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* AUDIO-TAP */}
            {task.answerMode === "audio-tap" && task.choices && (
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-400 font-medium">
                  Tap each button to hear the sound, then choose the right one
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {task.choices.map((c) => {
                    const choiceKey = c.value ?? c.label;
                    return (
                    <button
                      key={choiceKey}
                      onClick={() => handleAudioTapPlay(c)}
                      disabled={submitting}
                      className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 font-bold transition-all active:scale-95 ${
                        selectedChoice === choiceKey
                          ? "bg-purple-500 border-purple-500 text-white shadow-lg scale-105"
                          : playingChoiceValue === choiceKey
                          ? "bg-purple-50 border-purple-400 text-purple-700"
                          : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      {playingChoiceValue === choiceKey ? (
                        <svg className="w-7 h-7 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                        </svg>
                      ) : (
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                  );})}
                </div>
                {selectedChoice && (
                  <button
                    onClick={handleAudioTapSubmit}
                    disabled={submitting || !submitReady}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    ) : "That's my answer →"}
                  </button>
                )}
              </div>
            )}

            {/* Encouragement flash */}
            {showEncouragement && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
                <p className="text-green-700 font-semibold text-base">
                  {["Keep going! 💪", "Brilliant! ⭐", "You've got this! 🎯", "Fantastic! 🌟", "Amazing! 🏆"][taskIndex % 5]}
                </p>
              </div>
            )}

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Skip this activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
