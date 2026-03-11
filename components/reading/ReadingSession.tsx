"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── Natural voice engine (mirrors ChatInterface) ──────────────────────────────
function prepareForSpeech(raw: string): string {
  return raw
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    "Samantha", "Karen", "Moira",
    "Google UK English Female", "Microsoft Zira",
    "Microsoft Susan", "Google US English",
  ];
  for (const name of preferred) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? null;
}

function speakNaturally(
  text: string,
  onStart: () => void,
  onEnd: () => void
): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    cancelled = true;
    if (timer !== null) { clearTimeout(timer); timer = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    onEnd();
  };

  if (!("speechSynthesis" in window)) { onEnd(); return cancel; }
  window.speechSynthesis.cancel();

  const cleaned = prepareForSpeech(text);
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) { onEnd(); return cancel; }

  let idx = 0;
  onStart();

  const speakNext = () => {
    if (cancelled) return;
    if (idx >= sentences.length) { onEnd(); return; }
    const sentence = sentences[idx++];
    const utt = new SpeechSynthesisUtterance(sentence);
    utt.rate = 0.92;
    utt.pitch = 1.12;
    utt.volume = 1;
    const voice = pickVoice();
    if (voice) utt.voice = voice;
    const isQuestion = sentence.trim().endsWith("?");
    const hasNumber = /\d/.test(sentence);
    const pauseMs = isQuestion ? 650 : hasNumber ? 450 : 320;
    utt.onend = () => { if (cancelled) return; timer = setTimeout(speakNext, pauseMs); };
    utt.onerror = () => { if (cancelled) return; timer = setTimeout(speakNext, pauseMs); };
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", speakNext, { once: true });
  } else {
    speakNext();
  }

  return cancel;
}
// ─────────────────────────────────────────────────────────────────────────────

import {
  ReadingStudentProfile,
  ReadingGeneratedQuestion,
  ReadingDiagnosticResult,
  ReadingSkillAttempt,
  ReadingTemplate,
  DiagnosticPlacementResult,
} from "@/types/reading";
import {
  getReadingProfile,
  createReadingProfile,
  getReadingSkillById,
  getNextReadingSkillId,
  advanceToReadingSkill,
  recordReadingAttempt,
  updateReadingSkillMastery,
  initReadingSkillMastery,
  determineNextReadingAction,
  completeDiagnosticPlacement,
  determineReadingDecision,
  saveReadingProfile,
} from "@/lib/reading-student-model";
import ReadingDiagnosticPlacement from "@/components/reading/ReadingDiagnosticPlacement";

const TEMPLATES: ReadingTemplate[] = ["oral", "listening", "written", "reading"];

type SessionPhase = "loading_question" | "question" | "feedback" | "mastered" | "complete";

function readOnboarding(): { name: string; grade: number } {
  try {
    const raw = localStorage.getItem("onboardingData");
    if (!raw) return { name: "Student", grade: 3 };
    const data = JSON.parse(raw);
    const name = ((data.name as string) || "Student").split(" ")[0];
    const grade = parseInt(data.grade as string) || 3;
    return { name, grade };
  } catch {
    return { name: "Student", grade: 3 };
  }
}

export default function ReadingSession() {
  const [profile, setProfile] = useState<ReadingStudentProfile | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("loading_question");
  const [currentQuestion, setCurrentQuestion] = useState<ReadingGeneratedQuestion | null>(null);
  const [currentResult, setCurrentResult] = useState<ReadingDiagnosticResult | null>(null);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [skillAttemptCount, setSkillAttemptCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const saved = getReadingProfile();
    if (saved) {
      setProfile(saved);
      setPhase("loading_question");
    } else {
      // Auto-create from onboarding — no setup screen needed
      const { name, grade } = readOnboarding();
      const newProfile = createReadingProfile(name, grade);
      setProfile(newProfile);
      // placement gate will intercept before loading_question fires
    }
  }, []);

  const loadQuestion = useCallback(
    async (skillId: string, template: ReadingTemplate, attemptNum: number) => {
      setPhase("loading_question");
      setStatusMessage("Generating your question...");
      try {
        const res = await fetch("/api/reading/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_id: skillId,
            template,
            attempt_number: attemptNum,
            include_hint: attemptNum > 1,
          }),
        });
        if (!res.ok) throw new Error("Failed to generate question");
        const q: ReadingGeneratedQuestion = await res.json();
        setCurrentQuestion(q);
        setPhase("question");
      } catch {
        setStatusMessage("Failed to load question. Check your API key and refresh.");
      }
    },
    []
  );

  useEffect(() => {
    if (phase === "loading_question" && profile) {
      const template = TEMPLATES[templateIndex % TEMPLATES.length];
      loadQuestion(profile.current_skill_id, template, skillAttemptCount + 1);
    }
  }, [phase, profile, templateIndex, skillAttemptCount, loadQuestion]);

  const handlePlacementComplete = useCallback(
    (result: DiagnosticPlacementResult) => {
      if (!profile) return;
      const updated = completeDiagnosticPlacement(profile, result);
      setProfile(updated);
      setPhase("loading_question");
    },
    [profile]
  );

  const handleSubmitAnswer = async (answer: string, steps: string, usedHint: boolean) => {
    if (!currentQuestion || !profile) return;

    try {
      const res = await fetch("/api/reading/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: profile.id,
          question_id: currentQuestion.id,
          skill_id: currentQuestion.skill_id,
          template: currentQuestion.template,
          question: currentQuestion.question,
          student_answer: answer,
          student_steps: steps,
          expected_answer: currentQuestion.expected_answer,
          used_hint: usedHint,
        }),
      });

      const data = await res.json();
      const { result, attempt }: { result: ReadingDiagnosticResult; attempt: ReadingSkillAttempt } = data;

      const skill = getReadingSkillById(currentQuestion.skill_id);
      if (!skill) return;

      const existingMastery =
        profile.skill_mastery[currentQuestion.skill_id] ||
        initReadingSkillMastery(currentQuestion.skill_id);

      const updatedMastery = updateReadingSkillMastery(existingMastery, attempt, skill);
      result.mastery_update = {
        skill_id: currentQuestion.skill_id,
        new_status: updatedMastery.status,
        correct_count: updatedMastery.correct_count,
        attempt_count: updatedMastery.attempt_count,
        formats_used: updatedMastery.formats_used,
      };

      const nextAction = determineNextReadingAction(updatedMastery, updatedMastery.attempts);
      result.next_action = nextAction;

      // Section 10/11 decision engine
      const decision = determineReadingDecision(currentQuestion.skill_id, profile, {
        is_correct: result.is_correct,
        error_type: result.error_type,
      });
      result.decision = decision;

      // Map decision back to next_action when appropriate
      if (decision === "ADVANCE" || decision === "ACCELERATE") result.next_action = "advance_skill";
      if (decision === "BACKTRACK") result.next_action = "review_prerequisite";

      const updatedProfile = recordReadingAttempt(profile, attempt, updatedMastery);
      setProfile(updatedProfile);

      setSessionAttempts((n) => n + 1);
      if (result.is_correct) setSessionCorrect((n) => n + 1);
      setSkillAttemptCount((n) => n + 1);

      if (updatedMastery.status === "mastered") {
        result.next_action = "advance_skill";
        setCurrentResult(result);
        setPhase("mastered");
      } else {
        setCurrentResult(result);
        setPhase("feedback");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextAfterFeedback = () => {
    if (!profile || !currentResult) return;
    if (currentResult.next_action === "review_prerequisite") {
      const skill = getReadingSkillById(profile.current_skill_id);
      if (skill && skill.prerequisites.length > 0) {
        const prereqId = skill.prerequisites[skill.prerequisites.length - 1];
        const updated = advanceToReadingSkill(profile, prereqId);
        setProfile(updated);
        setSkillAttemptCount(0);
        setTemplateIndex(0);
        setPhase("loading_question");
        return;
      }
    }
    setTemplateIndex((i) => i + 1);
    setPhase("loading_question");
  };

  const handleNextAfterMastered = () => {
    if (!profile) return;
    const nextSkillId = getNextReadingSkillId(profile.current_skill_id);
    if (nextSkillId) {
      const updated = advanceToReadingSkill(profile, nextSkillId);
      setProfile(updated);
      setSkillAttemptCount(0);
      setTemplateIndex(0);
      setPhase("loading_question");
    } else {
      setPhase("complete");
    }
  };

  // Full reset — wipes everything, reruns placement with fresh questions
  const resetToPlacement = () => {
    localStorage.removeItem("ruby_reading_profile");
    const { name, grade } = readOnboarding();
    const freshProfile = createReadingProfile(name, grade);
    setProfile(freshProfile);
    setPhase("loading_question");
    setSkillAttemptCount(0);
    setTemplateIndex(0);
    setSessionCorrect(0);
    setSessionAttempts(0);
  };

  // Skill-tree-only reset — keeps placement result, returns to entry point with fresh questions
  const resetSkillTree = () => {
    const p = profile;
    if (!p?.placement) return;
    const pl = p.placement;
    // Rebuild mastery: only the auto-completed skills awarded by placement
    const restoredMastery: ReadingStudentProfile["skill_mastery"] = {};
    for (const skillId of pl.autoCompletedSkillIds) {
      const skill = getReadingSkillById(skillId);
      restoredMastery[skillId] = {
        skill_id: skillId,
        status: "mastered",
        correct_count: skill?.mastery_criteria.correct_required ?? 3,
        attempt_count: skill?.mastery_criteria.correct_required ?? 3,
        formats_used: ["oral"],
        scaffolded_attempts: 0,
        last_attempted: new Date().toISOString(),
        mastered_at: new Date().toISOString(),
        attempts: [],
      };
    }
    const parts = pl.entrySkillId.split(".");
    const updated: ReadingStudentProfile = {
      ...p,
      skill_mastery: restoredMastery,
      current_skill_id: pl.entrySkillId,
      current_tier_id: `${parts[0]}.${parts[1]}`,
      current_level: parseInt(parts[0].replace("R", "")),
      sessionHistory: {}, // Clear so fresh questions are generated
    };
    saveReadingProfile(updated);
    setProfile(updated);
    setPhase("loading_question");
    setSkillAttemptCount(0);
    setTemplateIndex(0);
    setSessionCorrect(0);
    setSessionAttempts(0);
  };

  // Refs always point to latest profile + functions — fixes stale closure in event handler
  const profileRef = useRef<ReadingStudentProfile | null>(null);
  profileRef.current = profile;
  const actionsRef = useRef({ resetToPlacement, resetSkillTree });
  actionsRef.current = { resetToPlacement, resetSkillTree };

  // Mobile pencil icon → dispatches this event
  useEffect(() => {
    const handler = () => {
      const p = profileRef.current;
      if (!p) return;
      if (!p.placementCompleted) {
        if (window.confirm("Restart the discovery activity? You'll get a fresh set of questions.")) {
          actionsRef.current.resetToPlacement();
        }
      } else {
        if (window.confirm("Restart reading questions? Your placement result stays — you'll return to your starting level with fresh questions.")) {
          actionsRef.current.resetSkillTree();
        }
      }
    };
    document.addEventListener("ruby-action", handler);
    return () => document.removeEventListener("ruby-action", handler);
  }, []);

  // ─── Placement Gate ───────────────────────────────────────────────────────────

  if (profile && !profile.placementCompleted) {
    return (
      <ReadingDiagnosticPlacement
        studentName={profile.name}
        onComplete={handlePlacementComplete}
      />
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (phase === "loading_question") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{statusMessage || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Question ─────────────────────────────────────────────────────────────────

  if (phase === "question" && currentQuestion) {
    const skill = getReadingSkillById(currentQuestion.skill_id);
    const mastery = profile?.skill_mastery[currentQuestion.skill_id];
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {skill && (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{profile ? `L${profile.current_level} - CURRENT SKILL` : "Current Skill"}</p>
                  <p className="text-gray-800 font-medium text-sm">{skill.title}</p>
                </div>
                <ReadingMasteryDots
                  correctCount={mastery?.correct_count || 0}
                  required={skill.mastery_criteria.correct_required}
                />
              </div>
            )}
            <ReadingQuestionCard
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Feedback ─────────────────────────────────────────────────────────────────

  if (phase === "feedback" && currentResult) {
    const nextLabels: Record<string, string> = {
      continue_skill: "Try another question",
      review_prerequisite: "Review prerequisite skill",
      advance_skill: "Next skill",
      advance_tier: "Next topic",
      advance_level: "Next level",
    };
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto">
            <ReadingFeedbackCard
              result={currentResult}
              onNext={handleNextAfterFeedback}
              nextLabel={nextLabels[currentResult.next_action] || "Continue"}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Mastered ─────────────────────────────────────────────────────────────────

  if (phase === "mastered") {
    const skill = profile ? getReadingSkillById(profile.current_skill_id) : null;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-green-200 rounded-2xl p-8 shadow-sm max-w-md w-full text-center space-y-4">
            <div className="text-5xl mb-2">🏆</div>
            <h3 className="text-2xl font-bold text-green-800">Skill Mastered!</h3>
            <p className="text-green-700">
              You&apos;ve mastered <strong>{skill?.title || "this skill"}</strong>!
            </p>
            {currentResult && (
              <p className="text-gray-600 text-sm">{currentResult.feedback}</p>
            )}
            <button
              onClick={handleNextAfterMastered}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-all shadow-md mt-2"
            >
              Continue to Next Skill →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Complete ─────────────────────────────────────────────────────────────────

  if (phase === "complete") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full text-center space-y-4">
            <div className="text-5xl mb-2">🎓</div>
            <h3 className="text-2xl font-bold text-gray-900">Amazing!</h3>
            <p className="text-gray-600">
              You&apos;ve completed the entire Ruby Reading Skill Tree. What an incredible achievement!
            </p>
            <button
              onClick={resetToPlacement}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-medium mt-2"
            >
              Start Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ReadingSessionHeader({
  profile,
  onReset,
  sessionCorrect,
  sessionAttempts,
}: {
  profile: ReadingStudentProfile | null;
  onReset: () => void;
  sessionCorrect: number;
  sessionAttempts: number;
}) {
  const skill = profile ? getReadingSkillById(profile.current_skill_id) : null;
  const accuracy = sessionAttempts > 0 ? Math.round((sessionCorrect / sessionAttempts) * 100) : 0;

  return (
    <div className="hidden md:flex bg-white border-b border-gray-200 px-4 py-2 sm:px-6 sm:py-3 items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-gray-900 font-semibold text-sm sm:text-base truncate">
          Ruby Reading
          {profile && <span className="text-gray-400 font-normal"> · {profile.name}</span>}
        </h2>
        {skill && (
          <p className="text-gray-500 text-xs truncate">
            Level {profile?.current_level} · {skill.title}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {sessionAttempts > 0 && (
          <div className="text-right">
            <p className={`text-sm font-semibold ${accuracy >= 70 ? "text-green-600" : "text-orange-500"}`}>
              {accuracy}%
            </p>
            <p className="text-xs text-gray-400 leading-none">accuracy</p>
          </div>
        )}
        <button
          onClick={() => {
            if (window.confirm("Restart reading questions? Your placement result stays — you'll return to your starting level with fresh questions.")) {
              onReset();
            }
          }}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all"
          title="Restart from scratch"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ReadingMasteryDots({ correctCount, required }: { correctCount: number; required: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: required }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors ${i < correctCount ? "bg-green-500" : "bg-gray-200"}`}
        />
      ))}
    </div>
  );
}

const templateConfig: Record<ReadingTemplate, { label: string; icon: string; colorClass: string }> = {
  oral: { label: "Oral", icon: "🗣️", colorClass: "bg-blue-50 text-blue-700 border-blue-100" },
  listening: { label: "Listening", icon: "👂", colorClass: "bg-purple-50 text-purple-700 border-purple-100" },
  written: { label: "Written", icon: "✏️", colorClass: "bg-amber-50 text-amber-700 border-amber-100" },
  reading: { label: "Reading", icon: "📖", colorClass: "bg-green-50 text-green-700 border-green-100" },
};

function ReadingQuestionCard({
  question,
  onSubmit,
}: {
  question: ReadingGeneratedQuestion;
  onSubmit: (answer: string, steps: string, usedHint: boolean) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const config = templateConfig[question.template] || templateConfig.oral;

  // ── TTS: same speakNaturally engine as ChatInterface ─────────────────────────
  const togglePlay = (text: string) => {
    if (playing) {
      cancelSpeechRef.current?.();
      cancelSpeechRef.current = null;
      setPlaying(false);
      return;
    }
    cancelSpeechRef.current = speakNaturally(
      text,
      () => setPlaying(true),
      () => { setPlaying(false); cancelSpeechRef.current = null; }
    );
  };

  // ── STT: same pattern as ChatInterface ───────────────────────────────────────
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Try Chrome.");
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
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      setAnswer(transcript);
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setListening(false); };

  const handleSubmit = () => {
    if (!answer.trim() || submitting) return;
    cancelSpeechRef.current?.();
    setPlaying(false);
    setSubmitting(true);
    onSubmit(answer, "", usedHint);
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Template badge */}
      <div className={`px-5 py-3 flex items-center gap-2 border-b border-gray-100 ${config.colorClass}`}>
        <span>{config.icon}</span>
        <span className="text-sm font-medium">{config.label}</span>
      </div>

      {/* Question text */}
      <div className="px-6 py-6">
        <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap">
          {question.question}
        </p>
        {/* Play/Stop pill — same style as ChatInterface message buttons */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => togglePlay(question.question)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all ${
              playing
                ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
            title={playing ? "Stop" : "Play"}
          >
            {playing ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hint */}
      {question.hint && (
        <div className="px-6 pb-4">
          {!hintVisible ? (
            <button
              onClick={() => { setHintVisible(true); setUsedHint(true); }}
              className="text-purple-500 hover:text-purple-700 text-sm flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303-5.304" />
              </svg>
              Show hint
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-yellow-800 text-sm">
                <span className="font-medium">Hint: </span>{question.hint}
              </p>
              <button
                onClick={() => togglePlay(question.hint!)}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full mt-2 transition-all ${
                  playing
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    : "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
                }`}
              >
                {playing ? (
                  <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>Stop</>
                ) : (
                  <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>Play hint</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Answer input — mic inside container, same as ChatInterface input bar */}
      <div className="px-6 pb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
          <div className={`relative flex items-end gap-2 border rounded-2xl px-3 py-2 transition-all ${
            listening
              ? "border-red-400 bg-red-50 ring-2 ring-red-100"
              : "bg-gray-50 border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100"
          }`}>
            {/* Answer display area */}
            <div className={`flex-1 py-1.5 text-sm leading-relaxed min-h-[28px] ${answer ? "text-gray-800" : "text-gray-400"}`}>
              {answer || "Your answer will display here"}
            </div>
            {/* Mic button — same style as ChatInterface */}
            <button
              onClick={listening ? stopVoice : startVoice}
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                listening ? "bg-red-100 text-red-500" : "text-gray-400 hover:text-gray-600 hover:bg-white"
              }`}
              title={listening ? "Stop listening" : "Voice input"}
            >
              {listening ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" />
                </svg>
              )}
            </button>
          </div>
          {listening && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse" />
              Listening... speak your answer
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Checking...
            </>
          ) : (
            "Submit Answer"
          )}
        </button>
      </div>
    </div>
  );
}

function ReadingFeedbackCard({
  result,
  onNext,
}: {
  result: ReadingDiagnosticResult;
  onNext: () => void;
  nextLabel?: string;
}) {
  const touchStartY = useRef(0);
  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm p-6 space-y-4 ${
      result.is_correct ? "border-green-200" : "border-red-200"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
          result.is_correct ? "bg-green-100" : "bg-red-100"
        }`}>
          {result.is_correct ? "✅" : "❌"}
        </div>
        <div>
          <p className={`font-semibold ${result.is_correct ? "text-green-800" : "text-red-800"}`}>
            {result.is_correct ? "Correct!" : "Not quite right"}
          </p>
          <p className={`text-sm ${result.is_correct ? "text-green-600" : "text-red-600"}`}>
            {result.error_type !== "correct" && result.error_type.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{result.feedback}</p>

      {!result.is_correct && result.recovery_explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-blue-800 text-sm leading-relaxed">
            <span className="font-medium">Tip: </span>{result.recovery_explanation}
          </p>
        </div>
      )}

      {/* Swipe up for next */}
      <div
        className="flex flex-col items-center gap-1 pt-2 cursor-pointer select-none"
        onClick={onNext}
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (touchStartY.current - e.changedTouches[0].clientY > 40) onNext();
        }}
      >
        <p className="text-xs text-gray-400">Swipe up for next question</p>
        <div className="animate-bounce text-purple-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
