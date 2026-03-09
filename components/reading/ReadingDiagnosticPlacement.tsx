"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DiagnosticPlacementResult, DiagnosticTaskResult } from "@/types/reading";

const TASK_IDS = [
  "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09",
  "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18",
];

const SKILL_NAME_MAP: Record<string, string> = {
  "R1.T2.A1": "Rhyme Awareness",
  "R1.T3.A1": "Phoneme Isolation",
  "R2.T1.A1": "Letter Sounds (Consonants)",
  "R2.T2.A1": "Digraphs & Blends",
  "R2.T3.A1": "Vowel Patterns",
  "R3.T1.A1": "CVC Encoding",
  "R4.T1.A1": "Multi-Syllable Decoding",
  "R4.T3.A1": "Reading Fluency",
  "R5.T1.A1": "Literal Comprehension",
  "R5.T1.A3": "Inferential Comprehension",
};

const ENCOURAGEMENTS = [
  "You're doing great!",
  "Keep it up!",
  "Brilliant effort!",
  "Fantastic work!",
  "You're a star!",
  "Amazing job!",
  "Super effort!",
  "Well done!",
  "You've got this!",
  "Great try!",
];

type Phase = "welcome" | "task" | "calculating" | "result";

interface TaskQuestion {
  taskId: string;
  question: string;
  instructions: string;
  mode: "voice" | "text" | "tap";
  items: string[];
}

// ── Speech helpers ────────────────────────────────────────────────────────────

function speakText(text: string, onEnd?: () => void): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return () => {};
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9;
  utt.pitch = 1.1;
  utt.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) =>
    ["Samantha", "Karen", "Google UK English Female", "Microsoft Zira"].some((n) => v.name.includes(n))
  ) ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  if (preferred) utt.voice = preferred;
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  const speak = () => window.speechSynthesis.speak(utt);
  if (voices.length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
  } else {
    speak();
  }
  return () => window.speechSynthesis.cancel();
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReadingDiagnosticPlacement({
  studentName,
  onComplete,
}: {
  studentName: string;
  onComplete: (result: DiagnosticPlacementResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [taskIndex, setTaskIndex] = useState(0);
  const [taskQuestion, setTaskQuestion] = useState<TaskQuestion | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [response, setResponse] = useState("");
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [encouragement, setEncouragement] = useState("");
  const [completedTasks, setCompletedTasks] = useState<DiagnosticTaskResult[]>([]);
  const [placementResult, setPlacementResult] = useState<DiagnosticPlacementResult | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [tapSelections, setTapSelections] = useState<string[]>([]);

  const recognitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const srRef = useRef<any>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  const currentTaskId = TASK_IDS[taskIndex];
  const progress = (taskIndex / TASK_IDS.length) * 100;

  // Load question for current task
  const loadTask = useCallback(async (index: number) => {
    const taskId = TASK_IDS[index];
    setLoadingTask(true);
    setResponse("");
    setTapSelections([]);
    setEncouragement("");

    try {
      const res = await fetch("/api/reading/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, studentName }),
      });
      if (!res.ok) throw new Error("Failed");
      const data: TaskQuestion = await res.json();
      setTaskQuestion(data);

      // Auto-speak question after a short delay
      setTimeout(() => {
        cancelSpeechRef.current = speakText(data.question, () => setSpeaking(false));
        setSpeaking(true);
      }, 400);
    } catch {
      setTaskQuestion({
        taskId,
        question: `Let's try a quick activity! Do your best — there are no wrong answers.`,
        instructions: "Say or type your response below.",
        mode: "voice",
        items: [],
      });
    } finally {
      setLoadingTask(false);
    }
  }, [studentName]);

  useEffect(() => {
    if (phase === "task") {
      loadTask(taskIndex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, taskIndex]);

  // STT
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported. Try Chrome.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transcript = Array.from(event.results as any[]).map((r: any) => r[0].transcript).join("");
      setResponse(transcript);
    };
    srRef.current = rec;
    rec.start();
    // Auto-stop after 8s
    recognitionRef.current = setTimeout(() => rec.stop(), 8000);
  };

  const stopVoice = () => {
    srRef.current?.stop();
    setListening(false);
    if (recognitionRef.current) {
      clearTimeout(recognitionRef.current);
      recognitionRef.current = null;
    }
  };

  const handleContinue = async () => {
    if (submitting) return;
    if (!taskQuestion) return;

    const finalResponse = taskQuestion.mode === "tap"
      ? tapSelections.join(", ")
      : response;

    setSubmitting(true);
    stopVoice();
    cancelSpeechRef.current?.();

    try {
      // Evaluate response
      const evalRes = await fetch("/api/reading/diagnostic/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: currentTaskId,
          response: finalResponse || "(no response)",
          items: taskQuestion.items,
        }),
      });
      const evalData: { correct: boolean; score: number; errorType: string } = await res(evalRes);

      const taskResult: DiagnosticTaskResult = {
        taskId: currentTaskId,
        correct: evalData.correct,
        score: evalData.score,
        response: finalResponse || "(no response)",
      };

      const newCompleted = [...completedTasks, taskResult];
      setCompletedTasks(newCompleted);

      // Show encouragement briefly
      const enc = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      setEncouragement(enc);

      await new Promise((r) => setTimeout(r, 900));

      if (taskIndex + 1 >= TASK_IDS.length) {
        // All tasks done — calculate placement
        setPhase("calculating");
        await calculatePlacement(newCompleted);
      } else {
        setTaskIndex((i) => i + 1);
        setEncouragement("");
      }
    } catch (err) {
      console.error(err);
      // Skip to next task on error
      const taskResult: DiagnosticTaskResult = {
        taskId: currentTaskId,
        correct: false,
        score: 0,
        response: finalResponse || "(error)",
      };
      const newCompleted = [...completedTasks, taskResult];
      setCompletedTasks(newCompleted);
      if (taskIndex + 1 >= TASK_IDS.length) {
        setPhase("calculating");
        await calculatePlacement(newCompleted);
      } else {
        setTaskIndex((i) => i + 1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  async function res(r: Response) {
    if (!r.ok) throw new Error("API error");
    return r.json();
  }

  const calculatePlacement = async (tasks: DiagnosticTaskResult[]) => {
    try {
      const placementRes = await fetch("/api/reading/diagnostic/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      if (!placementRes.ok) throw new Error("Placement failed");
      const result: DiagnosticPlacementResult = await placementRes.json();
      setPlacementResult(result);
      setPhase("result");
    } catch {
      // Fallback placement
      setPlacementResult({
        completedAt: Date.now(),
        tasks,
        entrySkillId: "R1.T2.A1",
        autoCompletedSkillIds: [],
        hardGatePassed: false,
      });
      setPhase("result");
    }
  };

  const handleStart = () => setPhase("task");

  const handleStartLearning = () => {
    if (placementResult) onComplete(placementResult);
  };

  // ── Welcome ──────────────────────────────────────────────────────────────────

  if (phase === "welcome") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto">
              🌟
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Hi {studentName}!
              </h2>
              <p className="text-gray-600 mt-3 leading-relaxed">
                Before we start learning, let&apos;s play a short discovery activity
                (about 10–15 minutes) so I can see what you already know!
              </p>
              <p className="text-blue-600 font-medium mt-2 text-sm">
                No pressure — just do your best!
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
              {[
                { icon: "🎯", text: "18 activities" },
                { icon: "⏱️", text: "10-15 min" },
                { icon: "🏆", text: "Find your level" },
              ].map(({ icon, text }) => (
                <div key={text} className="bg-blue-50 rounded-xl p-3">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs font-medium">{text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
            >
              Let&apos;s Start!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Task ─────────────────────────────────────────────────────────────────────

  if (phase === "task") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Progress bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Discovery Activity</span>
            <span className="text-xs text-gray-400">{taskIndex + 1} of {TASK_IDS.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-lg mx-auto space-y-4">
            {loadingTask ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Getting your activity ready...</p>
                </div>
              </div>
            ) : taskQuestion ? (
              <>
                {/* Question card */}
                <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
                  {/* Mode badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      taskQuestion.mode === "voice"
                        ? "bg-blue-100 text-blue-700"
                        : taskQuestion.mode === "text"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {taskQuestion.mode === "voice" ? "🎤 Say it" : taskQuestion.mode === "text" ? "✏️ Type it" : "👆 Tap it"}
                    </span>
                    {speaking && (
                      <span className="text-xs text-blue-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
                        Reading to you...
                      </span>
                    )}
                  </div>

                  {/* Question text */}
                  <div>
                    <p className="text-gray-800 text-lg font-medium leading-relaxed">
                      {taskQuestion.question}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{taskQuestion.instructions}</p>
                  </div>

                  {/* Play button */}
                  <button
                    onClick={() => {
                      if (speaking) {
                        cancelSpeechRef.current?.();
                        setSpeaking(false);
                      } else {
                        cancelSpeechRef.current = speakText(taskQuestion.question, () => setSpeaking(false));
                        setSpeaking(true);
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    {speaking ? (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>Stop reading</>
                    ) : (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Read again</>
                    )}
                  </button>

                  {/* Items display */}
                  {taskQuestion.items.length > 0 && taskQuestion.mode !== "tap" && (
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-2">Activity items</p>
                      <div className="flex flex-wrap gap-2">
                        {taskQuestion.items.slice(0, 6).map((item, i) => (
                          <span key={i} className="bg-white text-blue-700 text-sm font-mono px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Response area */}
                <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
                  {taskQuestion.mode === "tap" ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Tap all that apply:</p>
                      <div className="flex flex-wrap gap-2">
                        {taskQuestion.items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setTapSelections((prev) =>
                                prev.includes(item)
                                  ? prev.filter((x) => x !== item)
                                  : [...prev, item]
                              );
                            }}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                              tapSelections.includes(item)
                                ? "bg-blue-500 border-blue-500 text-white shadow-md"
                                : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : taskQuestion.mode === "text" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type your answer:</label>
                      <input
                        type="text"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type here..."
                        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 text-lg"
                        onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your answer:</label>
                      <div className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3 transition-all ${
                        listening
                          ? "border-red-400 bg-red-50 ring-4 ring-red-50"
                          : response
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}>
                        <div className="flex-1 text-sm text-gray-700 min-h-[28px]">
                          {response || <span className="text-gray-400">Your answer will appear here...</span>}
                        </div>
                        <button
                          onClick={listening ? stopVoice : startVoice}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            listening
                              ? "bg-red-500 text-white shadow-md animate-pulse"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          {listening ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" /></svg>
                          )}
                        </button>
                      </div>
                      {listening && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
                          Listening... speak now
                        </p>
                      )}
                    </div>
                  )}

                  {/* Encouragement message */}
                  {encouragement && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-center">
                      <p className="text-green-700 font-medium">{encouragement}</p>
                    </div>
                  )}

                  {/* Continue button */}
                  <button
                    onClick={handleContinue}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <>Continue <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    You can skip any activity — just press Continue
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // ── Calculating ───────────────────────────────────────────────────────────────

  if (phase === "calculating") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                🌍
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Working out your perfect learning path...</h3>
              <p className="text-gray-500 text-sm mt-2">This will just take a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────────

  if (phase === "result" && placementResult) {
    const autoCount = placementResult.autoCompletedSkillIds.length;
    const entryName = SKILL_NAME_MAP[placementResult.entrySkillId] ?? placementResult.entrySkillId;

    // Build mini skill tree for visualization
    const allSkillIds = [
      "R1.T1.A1", "R1.T1.A2", "R1.T1.A3", "R1.T2.A1", "R1.T2.A2", "R1.T3.A1", "R1.T3.A2", "R1.T3.A3",
      "R2.T1.A1", "R2.T1.A2", "R2.T1.A3", "R2.T2.A1", "R2.T2.A2", "R2.T3.A1", "R2.T3.A2", "R2.T3.A3",
      "R3.T1.A1", "R3.T1.A2", "R3.T1.A3", "R3.T1.A4", "R3.T2.A1", "R3.T2.A2",
      "R4.T1.A1", "R4.T1.A2", "R4.T2.A1", "R4.T2.A2", "R4.T3.A1", "R4.T3.A2",
      "R5.T1.A1", "R5.T1.A2", "R5.T1.A3", "R5.T2.A1", "R5.T2.A2", "R5.T3.A1",
    ];

    const levelGroups = [
      { label: "Level 1 — Foundation", ids: allSkillIds.slice(0, 8) },
      { label: "Level 2 — Alphabetic", ids: allSkillIds.slice(8, 16) },
      { label: "Level 3 — Encoding", ids: allSkillIds.slice(16, 22) },
      { label: "Level 4 — Decoding & Fluency", ids: allSkillIds.slice(22, 28) },
      { label: "Level 5 — Comprehension", ids: allSkillIds.slice(28) },
    ];

    const getSkillState = (id: string): "mastered" | "active" | "locked" => {
      if (id === placementResult.entrySkillId) return "active";
      if (placementResult.autoCompletedSkillIds.includes(id)) return "mastered";
      return "locked";
    };

    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-lg mx-auto space-y-5">
            {/* Celebration header */}
            <div className="bg-white rounded-3xl shadow-md p-6 text-center space-y-3">
              <div className="text-5xl">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900">Great work, {studentName}!</h2>
              <p className="text-gray-600">
                I&apos;ve found your perfect starting point. You&apos;re doing amazing!
              </p>
              {autoCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <p className="text-green-700 font-semibold text-lg">
                    You already know {autoCount} skill{autoCount !== 1 ? "s" : ""}!
                  </p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
                <p className="text-blue-500 text-sm font-medium uppercase tracking-wide mb-1">You&apos;re starting at</p>
                <p className="text-blue-800 font-bold text-xl">{entryName}</p>
              </div>
              {!placementResult.hardGatePassed && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left">
                  <p className="text-amber-700 text-sm font-medium">
                    🔑 We&apos;ll work on spelling foundations before moving to advanced reading — this is the key to success!
                  </p>
                </div>
              )}
            </div>

            {/* Mini skill tree */}
            <div className="bg-white rounded-3xl shadow-md p-5 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Your Skill Map</h3>
              {levelGroups.map((group) => {
                const masteredCount = group.ids.filter((id) => getSkillState(id) === "mastered").length;
                const hasActive = group.ids.some((id) => getSkillState(id) === "active");
                return (
                  <div key={group.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-gray-500 font-medium">{group.label}</p>
                      {masteredCount > 0 && (
                        <span className="text-xs text-green-600 font-semibold">{masteredCount}/{group.ids.length}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.ids.map((id) => {
                        const state = getSkillState(id);
                        return (
                          <div
                            key={id}
                            title={id + (state === "active" ? " — Start here!" : state === "mastered" ? " — Mastered" : " — Locked")}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                              state === "mastered"
                                ? "bg-green-400 text-white shadow-sm"
                                : state === "active"
                                ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-300 ring-offset-1 scale-110"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {state === "mastered" ? "✓" : state === "active" ? "★" : "·"}
                          </div>
                        );
                      })}
                    </div>
                    {hasActive && (
                      <p className="text-xs text-blue-500 mt-1 font-medium">★ Start here!</p>
                    )}
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-400 rounded inline-block" /> Mastered</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-blue-500 rounded inline-block" /> Start here</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-200 rounded inline-block" /> Locked</span>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStartLearning}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-5 rounded-3xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
            >
              Start Learning! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
