"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DiagnosticPlacementResult, DiagnosticTaskResult } from "@/types/reading";

// ── Passage used for D16, D17, D18 ───────────────────────────────────────────
const FLUENCY_PASSAGE =
  "Sam ran to the old red barn at the end of the lane. His dog Max ran with him. " +
  "They liked to play in the soft hay. The sun was hot, but the barn was cool and shady. " +
  "Sam sat down to rest. Max lay next to him and gave his hand a big lick.";

// ── Task definitions (hardcoded — no API calls for generation) ────────────────

type AnswerMode = "choice" | "voice" | "flash_choice";

interface Choice { label: string; value: string; correct: boolean }

interface Task {
  id: string;
  domain: string;
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

// ── Dynamic task loader ───────────────────────────────────────────────────────
async function loadRandomQuestionPaper(): Promise<Task[]> {
    const randomNumber = Math.floor(Math.random() * 50) + 1; // 1–50
    const paper = await import(
        `@/components/data/question-banks/${randomNumber}.json`
    );
    return paper.default as Task[];
}

// ── State to hold loaded tasks ───────────────────────────────────────────────
const [TASKS, setTASKS] = useState<Task[]>([]);

useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
        let tasks: Task[] = [];
        while (!cancelled && tasks.length === 0) {
            tasks = await loadRandomQuestionPaper();
        }
        if (!cancelled) setTASKS(tasks);
    };

    fetchTasks();

    return () => { cancelled = true; };
}, []);

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

// ── Skill name map ─────────────────────────────────────────────────────────────

const SKILL_NAME_MAP: Record<string, string> = {
  "R1.T1.A1": "Following Instructions",
  "R1.T2.A1": "Rhyme Awareness",
  "R1.T3.A1": "Phoneme Isolation",
  "R2.T1.A1": "Letter Sounds",
  "R2.T2.A1": "Digraphs & Blends",
  "R2.T3.A1": "Vowel Patterns",
  "R3.T1.A1": "Spelling Foundations",
  "R4.T1.A1": "Word Decoding",
  "R4.T3.A1": "Fluent Reading",
  "R5.T1.A1": "Comprehension",
  "R5.T1.A3": "Inferential Thinking",
};

// ── TTS helper ────────────────────────────────────────────────────────────────

function speakText(text: string, onEnd?: () => void): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) { onEnd?.(); return () => {}; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.88; utt.pitch = 1.05; utt.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) =>
    ["Samantha", "Karen", "Google UK English Female", "Microsoft Zira"].some((n) => v.name.includes(n))
  ) ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  if (preferred) utt.voice = preferred;
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  const speak = () => window.speechSynthesis.speak(utt);
  if (voices.length === 0) window.speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
  else speak();
  return () => window.speechSynthesis.cancel();
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

function normalize(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]/g, ""); }

function scoreVoiceResponse(transcript: string, expected: string, taskId: string): { correct: boolean; score: number } {
  const t = normalize(transcript);
  const e = normalize(expected);
  if (!t) return { correct: false, score: 0 };
  // Exact or contains match
  if (t === e || t.includes(e) || e.includes(t)) return { correct: true, score: 1 };
  // Simple character overlap for short words
  const overlap = [...e].filter(c => t.includes(c)).length / e.length;
  // For comprehension tasks, any non-empty response passes (evaluated by AI later)
  if (taskId === "D17" || taskId === "D18") return { correct: overlap > 0.1, score: overlap };
  return { correct: overlap >= 0.75, score: overlap };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "welcome" | "task" | "flash_showing" | "flash_hidden" | "calculating" | "result";

// ── Main component ────────────────────────────────────────────────────────────

export default function ReadingDiagnosticPlacement({
  studentName,
  onComplete,
}: {
  studentName: string;
  onComplete: (result: DiagnosticPlacementResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [taskIndex, setTaskIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [flashVisible, setFlashVisible] = useState(false);
  const [flashDone, setFlashDone] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<DiagnosticTaskResult[]>([]);
  const [placementResult, setPlacementResult] = useState<DiagnosticPlacementResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const cancelSpeech = useRef<(() => void) | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const srRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const task = TASKS[taskIndex];
  const progress = ((taskIndex) / TASKS.length) * 100;

  // Speak the question when a new task loads
  useEffect(() => {
    if (phase !== "task" && phase !== "flash_showing" && phase !== "flash_hidden") return;
    setTranscript("");
    setSelectedChoice(null);
    setFlashDone(false);
    setFlashVisible(false);
    setShowEncouragement(false);

    // Small delay then speak
    const t = setTimeout(() => {
      cancelSpeech.current = speakText(task.question, () => setSpeaking(false));
      setSpeaking(true);
    }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIndex, phase]);

  // Flash mechanic for D11
  useEffect(() => {
    if (task.answerMode !== "flash_choice" || phase !== "task") return;
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
  }, [taskIndex, phase]);

  // STT
  const startVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser. Please use Chrome."); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t = Array.from(e.results as ArrayLike<SpeechRecognitionResult>)
        .map((r) => r[0].transcript).join("");
      setTranscript(t);
    };
    srRef.current = rec;
    rec.start();
    // Auto-stop after 10s
    timerRef.current = setTimeout(() => rec.stop(), 10000);
  }, []);

  const stopVoice = useCallback(() => {
    srRef.current?.stop();
    setListening(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // Advance to next task
  const advanceTask = useCallback(async (result: DiagnosticTaskResult) => {
    setSubmitting(true);
    const newCompleted = [...completedTasks, result];
    setCompletedTasks(newCompleted);

    setShowEncouragement(true);
    await new Promise(r => setTimeout(r, 800));

    if (taskIndex + 1 >= TASKS.length) {
      setPhase("calculating");
      try {
        const res = await fetch("/api/reading/diagnostic/placement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: newCompleted }),
        });
        const placement: DiagnosticPlacementResult = res.ok ? await res.json() : {
          completedAt: Date.now(), tasks: newCompleted,
          entrySkillId: "R1.T2.A1", autoCompletedSkillIds: [], hardGatePassed: false,
        };
        setPlacementResult(placement);
        setPhase("result");
      } catch {
        setPlacementResult({ completedAt: Date.now(), tasks: newCompleted, entrySkillId: "R1.T2.A1", autoCompletedSkillIds: [], hardGatePassed: false });
        setPhase("result");
      }
    } else {
      setTaskIndex(i => i + 1);
    }
    setSubmitting(false);
  }, [completedTasks, taskIndex]);

  // Handle choice selection
  const handleChoice = useCallback((choice: Choice) => {
    if (submitting) return;
    setSelectedChoice(choice.value);
    setTimeout(() => {
      advanceTask({ taskId: task.id, correct: choice.correct, score: choice.correct ? 1 : 0, response: choice.value });
    }, 400);
  }, [submitting, task.id, advanceTask]);

  // Handle voice submit
  const handleVoiceSubmit = useCallback(() => {
    if (submitting) return;
    stopVoice();
    const { correct, score } = scoreVoiceResponse(transcript, task.expectedAnswer ?? "", task.id);
    advanceTask({ taskId: task.id, correct, score, response: transcript || "(no response)" });
  }, [submitting, transcript, task, stopVoice, advanceTask]);

  // Skip task
  const handleSkip = useCallback(() => {
    if (submitting) return;
    stopVoice();
    advanceTask({ taskId: task.id, correct: false, score: 0, response: "(skipped)" });
  }, [submitting, task, stopVoice, advanceTask]);

  // ── Welcome ──────────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto">🌟</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Hi {studentName}!</h2>
            <p className="text-gray-600 mt-3 leading-relaxed text-base">
              Before we start, let&apos;s do a short discovery activity so I can find your perfect starting point!
            </p>
            <p className="text-blue-600 font-medium mt-2 text-base">No pressure — just do your best 😊</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
            {[{ icon: "🎯", text: "18 activities" }, { icon: "⏱️", text: "10–15 min" }, { icon: "🏆", text: "Find your level" }].map(({ icon, text }) => (
              <div key={text} className="bg-blue-50 rounded-xl p-2">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase("task")}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
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
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center p-6">
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
      "R2.T1.A1","R2.T1.A2","R2.T1.A3","R2.T2.A1","R2.T2.A2","R2.T3.A1","R2.T3.A2","R2.T3.A3",
      "R3.T1.A1","R3.T1.A2","R3.T1.A3","R3.T1.A4","R3.T2.A1","R3.T2.A2",
      "R4.T1.A1","R4.T1.A2","R4.T2.A1","R4.T2.A2","R4.T3.A1","R4.T3.A2",
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
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
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
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wide mb-1">You&apos;re starting at</p>
              <p className="text-blue-800 font-bold text-xl">{entryName}</p>
            </div>
            {!placementResult.hardGatePassed && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left">
                <p className="text-amber-700 text-base">🔑 We&apos;ll build your spelling foundations first — it&apos;s the key to great reading!</p>
              </div>
            )}
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
                            s === "mastered" ? "bg-green-400 text-white" : s === "active" ? "bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-1 scale-110" : "bg-gray-200 text-gray-400"
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
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded inline-block" />Start here</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded inline-block" />Locked</span>
            </div>
          </div>

          <button
            onClick={() => onComplete(placementResult)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-5 rounded-3xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          >
            Start Learning! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── Task screen ───────────────────────────────────────────────────────────────
  const isFlashTask = task.answerMode === "flash_choice";
  const canSubmitVoice = task.answerMode === "voice" && !submitting;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5 text-sm text-gray-400">
          <span className="font-medium">Discovery Activity</span>
          <span>{taskIndex + 1} of {TASKS.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="max-w-md mx-auto space-y-4">

          {/* Domain badge */}
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">{task.domain}</span>
            {speaking && <span className="text-sm text-blue-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />Reading aloud…</span>}
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
            {/* Question text */}
            <p className="text-gray-800 text-lg font-semibold leading-snug">{task.question}</p>
            {task.subText && <p className="text-gray-400 text-base">{task.subText}</p>}

            {/* Re-read button */}
            <button
              onClick={() => {
                cancelSpeech.current?.();
                cancelSpeech.current = speakText(task.question, () => setSpeaking(false));
                setSpeaking(true);
              }}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Hear the question again
            </button>

            {/* ── Large word display ── */}
            {task.displayWord && !isFlashTask && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
                <p className="text-5xl sm:text-6xl font-bold text-blue-700 tracking-wider">
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center min-h-[100px] flex items-center justify-center">
                {flashVisible ? (
                  <p className="text-5xl font-bold text-blue-700 animate-pulse">{task.flashWord}</p>
                ) : flashDone ? (
                  <p className="text-gray-400 text-base">The word has disappeared — now choose below!</p>
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
                    className={`px-4 py-4 rounded-2xl border-2 text-base font-semibold text-left transition-all active:scale-95 ${
                      selectedChoice === c.value
                        ? "bg-blue-500 border-blue-500 text-white shadow-lg scale-105"
                        : selectedChoice
                        ? "opacity-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
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
                    <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {/* VOICE */}
            {task.answerMode === "voice" && (
              <div className="space-y-4">
                {task.voiceHint && <p className="text-sm text-gray-400 text-center">{task.voiceHint}</p>}

                {/* Big mic button */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={listening ? stopVoice : startVoice}
                    disabled={submitting}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                      listening
                        ? "bg-red-500 text-white animate-pulse shadow-red-200 shadow-xl"
                        : "bg-blue-500 text-white hover:bg-blue-600"
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
                  <p className="text-sm text-gray-400 font-medium">
                    {listening ? "🔴 Listening… tap to stop" : "Tap the mic to speak"}
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
                    disabled={!transcript || submitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    ) : "Continue →"}
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
