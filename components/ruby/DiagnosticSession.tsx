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
  completeMathsPlacement,
} from "@/lib/student-model";
import MathsDiagnosticPlacement from "./MathsDiagnosticPlacement";
import { MathsPlacementResult } from "@/types/ruby";
import { updateSkillMastery, initSkillMastery, determineNextAction } from "@/lib/mastery-engine";
import { getDomainForSkill, getUsedRefs, markQuestionUsed } from "@/lib/question-selector";
import QuestionCard from "./QuestionCard";
import FeedbackCard from "./FeedbackCard";

const TEMPLATES: QuestionTemplate[] = ["concrete", "story", "symbolic"];

type SessionPhase = "loading_question" | "question" | "feedback" | "mastered" | "complete";

function readOnboarding(): { name: string; grade: number } {
  try {
    const raw = localStorage.getItem("onboardingData");
    if (!raw) return { name: "Student", grade: 7 };
    const data = JSON.parse(raw);
    const name = ((data.name as string) || "Student").split(" ")[0];
    const grade = parseInt(data.grade as string) || 7;
    return { name, grade };
  } catch {
    return { name: "Student", grade: 7 };
  }
}

export default function DiagnosticSession() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("loading_question");
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
    } else {
      // Auto-create profile from onboarding data — no setup screen needed
      const { name, grade } = readOnboarding();
      const newProfile = createStudentProfile(name, grade);
      setProfile(newProfile);
      // phase stays at loading_question; placement gate will intercept
    }
  }, []);

  const loadQuestion = useCallback(
    async (skillId: string, _template: QuestionTemplate, attemptNum: number, currentProfile: StudentProfile) => {
      setPhase("loading_question");
      setStatusMessage("Loading your question...");
      try {
        // Get used refs so server can exclude already-seen questions
        const domainId = getDomainForSkill(skillId);
        const usedRefs = domainId ? getUsedRefs(currentProfile, domainId) : [];

        const res = await fetch("/api/ruby/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_id: skillId,
            attempt_number: attemptNum,
            include_hint: attemptNum > 1,
            used_refs: usedRefs,
          }),
        });
        if (!res.ok) throw new Error("Failed to load question");
        const q: GeneratedQuestion = await res.json();

        // Mark question as used in student profile immediately
        if (q.domain_id && q.question_ref) {
          const updatedProfile = markQuestionUsed(currentProfile, q.domain_id, q.question_ref);
          saveStudentProfile(updatedProfile);
          setProfile(updatedProfile);
        }

        setCurrentQuestion(q);
        setPhase("question");
      } catch {
        setStatusMessage("Failed to load question. Please refresh or check your connection.");
      }
    },
    []
  );

  useEffect(() => {
    if (phase === "loading_question" && profile) {
      const template = TEMPLATES[templateIndex % TEMPLATES.length];
      loadQuestion(profile.current_skill_id, template, skillAttemptCount + 1, profile);
    }
  }, [phase, profile, templateIndex, skillAttemptCount, loadQuestion]);

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

  const handlePlacementComplete = useCallback(
    (result: MathsPlacementResult) => {
      if (!profile) return;
      const updatedProfile = completeMathsPlacement(profile, result);
      setProfile(updatedProfile);
      setPhase("loading_question");
    },
    [profile]
  );

  const resetProfile = () => {
    localStorage.removeItem("ruby_student_profile");
    // Re-create profile from onboarding so placement runs again
    const { name, grade } = readOnboarding();
    const freshProfile = createStudentProfile(name, grade);
    setProfile(freshProfile);
    setPhase("loading_question");
    setSkillAttemptCount(0);
    setTemplateIndex(0);
    setSessionCorrect(0);
    setSessionAttempts(0);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Placement gate — show discovery activity before regular learning begins
  if (profile && !profile.placementCompleted) {
    return (
      <MathsDiagnosticPlacement
        studentName={profile.name}
        grade={profile.grade}
        onComplete={handlePlacementComplete}
      />
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
