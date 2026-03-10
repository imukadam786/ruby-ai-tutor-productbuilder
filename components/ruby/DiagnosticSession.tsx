"use client";

import { useState, useEffect, useCallback } from "react";
import {
  StudentProfile,
  GeneratedQuestion,
  DiagnosticResult,
  SkillAttempt,
  QuestionTemplate,
} from "@/types/ruby";
import {
  getStudentProfile,
  createStudentProfile,
  saveStudentProfile,
  getSkillById,
  getNextSkillId,
  advanceToSkill,
  recordAttempt,
} from "@/lib/student-model";
import { updateSkillMastery, initSkillMastery, determineNextAction } from "@/lib/mastery-engine";
import QuestionCard from "./QuestionCard";
import FeedbackCard from "./FeedbackCard";

const TEMPLATES: QuestionTemplate[] = ["concrete", "story", "symbolic"];

type SessionPhase = "setup" | "loading_question" | "question" | "feedback" | "mastered" | "complete";

export default function DiagnosticSession() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [setupName, setSetupName] = useState("");
  const [setupGrade, setSetupGrade] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [skillAttemptCount, setSkillAttemptCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const saved = getStudentProfile();
    if (saved) {
      setProfile(saved);
      setPhase("loading_question");
    }
  }, []);

  const loadQuestion = useCallback(
    async (skillId: string, template: QuestionTemplate, attemptNum: number) => {
      setPhase("loading_question");
      setStatusMessage("Generating your question...");
      try {
        const res = await fetch("/api/ruby/generate-question", {
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
        const q: GeneratedQuestion = await res.json();
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
    const newProfile = createStudentProfile(setupName.trim(), setupGrade);
    setProfile(newProfile);
    setPhase("loading_question");
  };

  const handleSubmitAnswer = async (answer: string, steps: string, usedHint: boolean) => {
    if (!currentQuestion || !profile) return;

    try {
      const res = await fetch("/api/ruby/submit-answer", {
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
      const { result, attempt }: { result: DiagnosticResult; attempt: SkillAttempt } = data;

      // Update mastery in student model
      const skill = getSkillById(currentQuestion.skill_id);
      if (!skill) return;

      const existingMastery =
        profile.skill_mastery[currentQuestion.skill_id] ||
        initSkillMastery(currentQuestion.skill_id);

      const updatedMastery = updateSkillMastery(existingMastery, attempt, skill);
      result.mastery_update = {
        skill_id: currentQuestion.skill_id,
        new_status: updatedMastery.status,
        correct_count: updatedMastery.correct_count,
        attempt_count: updatedMastery.attempt_count,
        formats_used: updatedMastery.formats_used,
      };

      // Determine next action
      const tier = skill ? null : null;
      const nextAction = determineNextAction(
        updatedMastery,
        updatedMastery.attempts,
        3, // skills in tier (simplified)
        Object.values(profile.skill_mastery).filter(
          (m) => m.skill_id.startsWith(profile.current_tier_id) && m.status === "mastered"
        ).length,
        3,
        3
      );
      result.next_action = nextAction;

      // Record attempt in profile
      const updatedProfile = recordAttempt(profile, attempt, updatedMastery);
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
      const skill = getSkillById(profile.current_skill_id);
      if (skill && skill.prerequisites.length > 0) {
        const prereqId = skill.prerequisites[skill.prerequisites.length - 1];
        const updated = advanceToSkill(profile, prereqId);
        setProfile(updated);
        setSkillAttemptCount(0);
        setTemplateIndex(0);
        setPhase("loading_question");
        return;
      }
    }

    // Continue with next template for this skill
    setTemplateIndex((i) => i + 1);
    setPhase("loading_question");
  };

  const handleNextAfterMastered = () => {
    if (!profile) return;
    const nextSkillId = getNextSkillId(profile.current_skill_id);
    if (nextSkillId) {
      const updated = advanceToSkill(profile, nextSkillId);
      setProfile(updated);
      setSkillAttemptCount(0);
      setTemplateIndex(0);
      setPhase("loading_question");
    } else {
      setPhase("complete");
    }
  };

  const resetProfile = () => {
    localStorage.removeItem("ruby_student_profile");
    setProfile(null);
    setPhase("setup");
    setSkillAttemptCount(0);
    setTemplateIndex(0);
    setSessionCorrect(0);
    setSessionAttempts(0);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (phase === "setup") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-gray-900 font-semibold text-lg">Ruby Math Tutor</h2>
          <p className="text-gray-500 text-sm">Adaptive diagnostic learning engine</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                R
              </div>
              <h3 className="text-xl font-bold text-gray-900">Welcome to Ruby</h3>
              <p className="text-gray-500 text-sm mt-1">
                Your personalised math diagnostic tutor
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === "Enter" && handleSetup()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Year / Grade
                </label>
                <select
                  value={setupGrade}
                  onChange={(e) => setSetupGrade(parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      Year {g} / Grade {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={!setupName.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-md"
            >
              Start Learning
            </button>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: "🧠", label: "Diagnoses errors" },
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

  if (phase === "loading_question") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{statusMessage || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "question" && currentQuestion) {
    const skill = getSkillById(currentQuestion.skill_id);
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {skill && (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{profile ? `L${profile.current_level} - CURRENT SKILL` : "Current Skill"}</p>
                  <p className="text-gray-800 font-medium text-sm">{skill.title}</p>
                </div>
                <MasteryDots
                  correctCount={profile?.skill_mastery[currentQuestion.skill_id]?.correct_count || 0}
                  required={skill.mastery_criteria.correct_required}
                />
              </div>
            )}
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
              isSubmitting={false}
            />
          </div>
        </div>
      </div>
    );
  }

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
        <SessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto">
            <FeedbackCard
              result={currentResult}
              onNext={handleNextAfterFeedback}
              nextLabel={nextLabels[currentResult.next_action] || "Continue"}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "mastered") {
    const skill = profile ? getSkillById(profile.current_skill_id) : null;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
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

  if (phase === "complete") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetProfile} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full text-center space-y-4">
            <div className="text-5xl mb-2">🎓</div>
            <h3 className="text-2xl font-bold text-gray-900">Incredible!</h3>
            <p className="text-gray-600">
              You&apos;ve completed the entire Ruby Math Skill Tree. That&apos;s a remarkable achievement!
            </p>
            <button
              onClick={resetProfile}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium mt-2"
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

function SessionHeader({
  profile,
  onReset,
  sessionCorrect,
  sessionAttempts,
}: {
  profile: StudentProfile | null;
  onReset: () => void;
  sessionCorrect: number;
  sessionAttempts: number;
}) {
  const skill = profile ? getSkillById(profile.current_skill_id) : null;
  const accuracy = sessionAttempts > 0 ? Math.round((sessionCorrect / sessionAttempts) * 100) : 0;

  return (
    <div className="hidden md:flex bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-gray-900 font-semibold text-sm sm:text-lg truncate">
          Ruby
          {profile && (
            <span className="text-gray-400 font-normal"> — {profile.name}</span>
          )}
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
          title="Reset profile"
        >
          ✕ Reset
        </button>
      </div>
    </div>
  );
}

function MasteryDots({ correctCount, required }: { correctCount: number; required: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: required }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors ${
            i < correctCount ? "bg-green-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}
