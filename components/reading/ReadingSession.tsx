"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ReadingStudentProfile,
  ReadingGeneratedQuestion,
  ReadingDiagnosticResult,
  ReadingSkillAttempt,
  ReadingTemplate,
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
} from "@/lib/reading-student-model";

const TEMPLATES: ReadingTemplate[] = ["oral", "listening", "written", "reading"];

type SessionPhase = "setup" | "loading_question" | "question" | "feedback" | "mastered" | "complete";

export default function ReadingSession() {
  const [profile, setProfile] = useState<ReadingStudentProfile | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [setupName, setSetupName] = useState("");
  const [setupGrade, setSetupGrade] = useState(1);
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

  const handleSetup = () => {
    if (!setupName.trim()) return;
    const newProfile = createReadingProfile(setupName.trim(), setupGrade);
    setProfile(newProfile);
    setPhase("loading_question");
  };

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

  const resetProfile = () => {
    localStorage.removeItem("ruby_reading_profile");
    setProfile(null);
    setPhase("setup");
    setSkillAttemptCount(0);
    setTemplateIndex(0);
    setSessionCorrect(0);
    setSessionAttempts(0);
  };

  // ─── Setup ────────────────────────────────────────────────────────────────────

  if (phase === "setup") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-gray-900 font-semibold text-lg">Ruby Reading Tutor</h2>
          <p className="text-gray-500 text-sm">Adaptive literacy learning engine</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                📖
              </div>
              <h3 className="text-xl font-bold text-gray-900">Welcome to Reading</h3>
              <p className="text-gray-500 text-sm mt-1">
                Your personalised literacy diagnostic tutor
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onKeyDown={(e) => e.key === "Enter" && handleSetup()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Year / Grade</label>
                <select
                  value={setupGrade}
                  onChange={(e) => setSetupGrade(parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                    <option key={g} value={g}>Year {g} / Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={!setupName.trim()}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-md"
            >
              Start Reading
            </button>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: "🔤", label: "Phonics & sounds" },
                { icon: "📈", label: "Tracks mastery" },
                { icon: "🎯", label: "Adapts to you" },
              ].map(({ icon, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (phase === "loading_question") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
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
        <ReadingSessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {skill && (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Current Skill</p>
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
        <ReadingSessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
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
        <ReadingSessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
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
        <ReadingSessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full text-center space-y-4">
            <div className="text-5xl mb-2">🎓</div>
            <h3 className="text-2xl font-bold text-gray-900">Amazing!</h3>
            <p className="text-gray-600">
              You&apos;ve completed the entire Ruby Reading Skill Tree. What an incredible achievement!
            </p>
            <button
              onClick={resetProfile}
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
    <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-gray-900 font-semibold text-sm sm:text-lg truncate">
          Ruby Reading
          {profile && <span className="text-gray-400 font-normal"> — {profile.name}</span>}
        </h2>
        {skill && (
          <p className="text-gray-500 text-xs sm:text-sm truncate">
            L{profile?.current_level} · {skill.title}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {sessionAttempts > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400 hidden sm:block">Session accuracy</p>
            <p className={`text-sm font-semibold ${accuracy >= 70 ? "text-green-600" : "text-orange-600"}`}>
              {accuracy}%
            </p>
          </div>
        )}
        <button
          onClick={onReset}
          className="text-gray-400 hover:text-gray-600 text-xs sm:text-sm transition-colors whitespace-nowrap"
        >
          ✕ Reset
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
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useState<any>(null);

  const config = templateConfig[question.template] || templateConfig.oral;

  // ── TTS: play / stop question text ───────────────────────────────────────────
  const handlePlayText = (text: string) => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  // ── STT: microphone → answer box ─────────────────────────────────────────────
  const handleMic = () => {
    if (listening) {
      recognitionRef[0]?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      setAnswer(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef as any)[0] = rec;
    rec.start();
    setListening(true);
  };

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
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

      {/* Question + play button */}
      <div className="px-6 py-6">
        <div className="flex items-start gap-3">
          <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap flex-1">
            {question.question}
          </p>
          <button
            onClick={() => handlePlayText(question.question)}
            title={speaking ? "Stop" : "Play question aloud"}
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              speaking
                ? "bg-purple-600 text-white shadow-md"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
            }`}
          >
            {speaking ? (
              /* Stop icon */
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              /* Play icon */
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
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
              <div className="flex items-start gap-2">
                <p className="text-yellow-800 text-sm flex-1">
                  <span className="font-medium">Hint: </span>{question.hint}
                </p>
                <button
                  onClick={() => handlePlayText(question.hint!)}
                  title={speaking ? "Stop" : "Play hint aloud"}
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    speaking ? "bg-yellow-500 text-white" : "bg-yellow-200 text-yellow-700 hover:bg-yellow-300"
                  }`}
                >
                  {speaking ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mic answer input */}
      <div className="px-6 pb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Answer</label>
          <div className="relative">
            <div
              className={`w-full min-h-[72px] border rounded-xl px-4 py-3 text-sm leading-relaxed transition-all ${
                answer ? "text-gray-800" : "text-gray-400"
              } ${
                listening
                  ? "border-red-400 bg-red-50 ring-2 ring-red-300"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {answer || "Your answer will display here"}
            </div>
            {/* Mic button overlay */}
            <button
              onClick={handleMic}
              title={listening ? "Stop recording" : "Tap to speak your answer"}
              className={`absolute right-3 bottom-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
            >
              {listening ? (
                /* Recording — stop icon */
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                /* Mic icon */
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.95-.49-7-3.85-7-7.93H6c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.05 7.44-7 7.93V21h-2v-5.07z" />
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
  nextLabel,
}: {
  result: ReadingDiagnosticResult;
  onNext: () => void;
  nextLabel: string;
}) {
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

      <button
        onClick={onNext}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-medium transition-all mt-2"
      >
        {nextLabel} →
      </button>
    </div>
  );
}
