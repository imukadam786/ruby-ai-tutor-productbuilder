"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/fetch";
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
  linkStudentProfileToAuth,
  hydrateStudentProfileFromSupabase,
} from "@/lib/student-model";
import MathsDiagnosticPlacement from "./MathsDiagnosticPlacement";
import { MathsPlacementResult } from "@/types/ruby";
import { updateSkillMastery, initSkillMastery, scanMasteryForReview, pickNeedsReviewSkill, stampMathsReviewedAt } from "@/lib/mastery-engine";
import { getDomainForSkill, getDomain, getUsedRefs, markQuestionUsed } from "@/lib/question-selector";
import { simplifyQuestion } from "@/lib/question-simplifier";
import { getReadingProfile } from "@/lib/reading-student-model";
import QuestionCard from "./QuestionCard";
import FeedbackCard from "./FeedbackCard";
import { selectMathsTemplate } from "@/lib/template-selector";
import { detectStuck } from "@/lib/stuck-detector";
import StuckScreen from "@/components/shared/StuckScreen";
import type { DiagnosticReportInput } from "@/lib/report-generator";
import { describeError } from "@/lib/report-generator";
import DiagnosticReportView from "@/components/DiagnosticReportView";
import { useT } from "@/lib/i18n";
import {
  identifyStudent,
  trackQuestionAnswered,
  trackSkillMastered,
  trackSkillAdvanced,
  trackReteach,
  trackSessionStarted,
  trackSessionEnded,
  trackPlacementCompleted,
} from "@/lib/analytics";

type SessionPhase = "loading_question" | "question" | "feedback" | "mastered" | "stuck" | "complete";

// ─── Report input builder ─────────────────────────────────────────────────────
// Constructs DiagnosticReportInput from the completed student profile.
// Called after placement completes; runs client-side since profile is in localStorage.

// Maps maths skill tree level (1–22) to the equivalent school grade band.
// Derived from GATE_PASSED_ENTRY in MathsDiagnosticPlacement:
//   Gate 0→L2 (Gr1), Gate 1→L4 (Gr2), Gate 2→L5 (Gr3), Gate 3→L8 (Gr4),
//   Gate 4→L11 (Gr5), Gate 5→L12 (Gr6), Gate 6→L13 (Gr7), Gate 7→L14 (Gr8),
//   Gate 8→L17 (Gr9), Gate 9→L19 (Gr10), Gate 10→L21 (Gr11), Gate 11→L22 (Gr12)
function skillLevelToGradeEquiv(level: number): number {
  if (level <= 3)  return 1;
  if (level <= 4)  return 2;
  if (level <= 7)  return 3;
  if (level <= 10) return 4;
  if (level <= 11) return 5;
  if (level <= 12) return 6;
  if (level <= 13) return 7;
  if (level <= 16) return 8;
  if (level <= 18) return 9;
  if (level <= 20) return 10;
  if (level <= 21) return 11;
  return 12;
}

function buildMathsReportInput(profile: StudentProfile): DiagnosticReportInput {
  const placement = profile.placement!;

  // Group tasks by domain — count score and collect error types
  const domainMap: Record<string, { scores: number[]; errors: string[] }> = {};
  for (const task of placement.tasks) {
    if (!domainMap[task.domain]) domainMap[task.domain] = { scores: [], errors: [] };
    domainMap[task.domain].scores.push(task.correct ? 1 : task.score ?? 0);
    if (task.error_type && task.error_type !== "correct") {
      domainMap[task.domain].errors.push(task.error_type);
    }
  }

  // Build per-domain score objects
  const domainScores = Object.entries(domainMap).map(([domainId, data]) => {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const score = Math.round(avg * 100);
    const label: "strong" | "building" | "practice" =
      avg >= 0.8 ? "strong" : avg >= 0.4 ? "building" : "practice";
    const primaryError = data.errors.length > 0 ? data.errors[0] : null;
    // Get human-readable domain title from question bank
    const domainTitle = getDomain(domainId)?.title ?? domainId;
    const errorNote = primaryError ? (describeError(primaryError, "maths") ?? null) : null;
    return { domain: domainTitle, score, label, errorNote };
  });

  // Derive dominant errors (top 3 by frequency across all tasks)
  const errorCounts: Record<string, number> = {};
  placement.tasks.forEach((t) => {
    if (t.error_type && t.error_type !== "correct") {
      errorCounts[t.error_type] = (errorCounts[t.error_type] ?? 0) + 1;
    }
  });
  const dominantErrors = Object.entries(errorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([code]) => code);

  // Entry skill plain name
  const entrySkill = getSkillById(placement.entrySkillId);
  const placementSkill = entrySkill?.title ?? placement.entrySkillId;

  const gradeEquiv = skillLevelToGradeEquiv(placement.entryLevel);

  return {
    subject: "maths",
    studentName: profile.name.split(" ")[0],
    studentGrade: profile.grade,
    workingLevel: `Grade ${gradeEquiv}`,
    gradeLevelGap: profile.grade - gradeEquiv,
    questionsAnalysed: placement.tasks.filter((t) => !t.is_probe).length,
    correctCount: placement.tasks.filter((t) => !t.is_probe && t.correct).length,
    domainScores,
    dominantErrors,
    placementSkill,
    skillsCompleted: placement.autoCompletedSkillIds.length,
  };
}

function readOnboarding(): { name: string; grade: number } {
  try {
    const raw = localStorage.getItem("onboardingData");
    if (!raw) return { name: "Student", grade: 7 };
    const data = JSON.parse(raw);
    const name = ((data.name as string) || "Student").split(" ")[0];
    const parsed = parseInt(data.grade as string, 10);
    const grade = !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed : 7;
    return { name, grade };
  } catch {
    return { name: "Student", grade: 7 };
  }
}

export default function DiagnosticSession() {
  const { language } = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("loading_question");
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null);
  const [skillAttemptCount, setSkillAttemptCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [reteachCount, setReteachCount] = useState(0);
  const [lastWasIncorrect, setLastWasIncorrect] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Report state — shown after placement before learning begins
  const [pendingPlacementResult, setPendingPlacementResult] = useState<MathsPlacementResult | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Needs-review: skill ID of a stale mastered skill to probe before main practice
  const [pendingReviewSkillId, setPendingReviewSkillId] = useState<string | null>(null);

  // Recent templates — used by selectMathsTemplate for anti-repetition; last 3 kept
  const recentTemplatesRef = useRef<QuestionTemplate[]>([]);

  // Stuck detection — tracks attempt_count when student last dismissed the stuck screen
  const stuckDismissedAtRef = useRef(0);
  const [stuckAttemptCount, setStuckAttemptCount] = useState(0);

  useEffect(() => {
    function initWithProfile(saved: import("@/types/ruby").StudentProfile) {
      identifyStudent({ id: saved.id, name: saved.name, grade: saved.grade });
      // Keep auth link fresh — fire-and-forget, non-blocking
      void linkStudentProfileToAuth(saved.id);
      if (saved.placementCompleted) {
        trackSessionStarted({
          subject: "maths",
          current_skill_id: saved.current_skill_id,
          current_level: saved.current_level,
        });
      }
      const scannedMastery = saved.placementCompleted ? scanMasteryForReview(saved.skill_mastery) : saved.skill_mastery;
      const scanned = scannedMastery !== saved.skill_mastery ? { ...saved, skill_mastery: scannedMastery } : saved;
      if (scanned !== saved) saveStudentProfile(scanned);
      setProfile(scanned);
      const restoredAttemptCount = scanned.skill_mastery[scanned.current_skill_id]?.attempt_count ?? 0;
      setSkillAttemptCount(restoredAttemptCount);
      const reviewSkill = saved.placementCompleted ? pickNeedsReviewSkill(scannedMastery) : null;
      if (reviewSkill) setPendingReviewSkillId(reviewSkill);
      setPhase("loading_question");
    }

    const saved = getStudentProfile();
    if (saved) {
      initWithProfile(saved);
    } else {
      // localStorage cleared — try to restore from Supabase before creating a new profile
      hydrateStudentProfileFromSupabase().then((restored) => {
        if (restored) {
          initWithProfile(restored);
        } else {
          const { name, grade } = readOnboarding();
          const newProfile = createStudentProfile(name, grade);
          identifyStudent({ id: newProfile.id, name: newProfile.name, grade: newProfile.grade });
          setProfile(newProfile);
          // phase stays at loading_question; placement gate will intercept
        }
      });
    }
  }, []);

  const loadQuestion = useCallback(
    async (skillId: string, _template: QuestionTemplate, attemptNum: number, currentProfile: StudentProfile, forceHint = false) => {
      setPhase("loading_question");
      setStatusMessage("Loading your question...");
      try {
        // Get used refs so server can exclude already-seen questions
        const domainId = getDomainForSkill(skillId);
        const usedRefs = domainId ? getUsedRefs(currentProfile, domainId) : [];
        const skillPLearned = currentProfile.skill_mastery[skillId]?.p_learned;

        const res = await apiFetch("/api/ruby/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_id: skillId,
            attempt_number: attemptNum,
            include_hint: forceHint || attemptNum > 1,
            used_refs: usedRefs,
            p_learned: skillPLearned,
          }),
        });
        if (!res.ok) throw new Error("Failed to load question");
        let q: GeneratedQuestion = await res.json();

        // Apply plain-English simplification if student's reading level is low
        const readingProfile = getReadingProfile();
        const readingLevel = readingProfile?.current_level ?? 5;
        q = simplifyQuestion(q, readingLevel);

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
    scrollRef.current?.scrollTo({ top: 0 });
  }, [phase, currentQuestion?.id]);

  useEffect(() => {
    if (phase === "loading_question" && profile) {
      const errorType = (currentResult && !currentResult.is_correct) ? (currentResult.error_type ?? null) : null;
      const template = selectMathsTemplate(lastWasIncorrect, errorType, recentTemplatesRef.current);
      recentTemplatesRef.current = [...recentTemplatesRef.current.slice(-3), template];
      const skillIdToLoad = pendingReviewSkillId ?? profile.current_skill_id;
      loadQuestion(skillIdToLoad, template, skillAttemptCount + 1, profile, lastWasIncorrect);
    }
  }, [phase, profile, skillAttemptCount, loadQuestion, lastWasIncorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitAnswer = async (answer: string, steps: string, usedHint: boolean, workingImage?: string) => {
    if (!currentQuestion || !profile) return;

    try {
      const res = await apiFetch("/api/ruby/submit-answer", {
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
          attempt_number: skillAttemptCount + 1,
          language,
          working_image: workingImage,
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

      const updatedMastery = updateSkillMastery(existingMastery, attempt, profile.grade, currentQuestion.difficulty);
      result.mastery_update = {
        skill_id: currentQuestion.skill_id,
        new_status: updatedMastery.status,
        correct_count: updatedMastery.correct_count,
        attempt_count: updatedMastery.attempt_count,
        formats_used: updatedMastery.formats_used,
      };

      // BKT drives everything — mastery status is the sole progression signal
      const newSessionAttempts = sessionAttempts + 1;
      const newSessionCorrect = sessionCorrect + (result.is_correct ? 1 : 0);
      result.next_action = updatedMastery.status === "mastered" ? "advance_skill" : "continue_skill";

      setSessionAttempts(newSessionAttempts);
      setSessionCorrect(newSessionCorrect);
      setSkillAttemptCount((n) => n + 1);

      trackQuestionAnswered({
        subject: "maths",
        skill_id: currentQuestion.skill_id,
        template: currentQuestion.template,
        is_correct: result.is_correct,
        used_hint: usedHint,
        attempt_number: skillAttemptCount + 1,
      });

      const isReviewQuestion = pendingReviewSkillId === currentQuestion.skill_id;
      const profileAfterAttempt = recordAttempt(profile, attempt, updatedMastery);
      const updatedProfile = isReviewQuestion
        ? stampMathsReviewedAt(profileAfterAttempt, currentQuestion.skill_id)
        : profileAfterAttempt;
      if (isReviewQuestion) setPendingReviewSkillId(null);
      setProfile(updatedProfile);

      if (updatedMastery.status === "mastered") {
        saveStudentProfile(updatedProfile);
        trackSkillMastered({
          subject: "maths",
          skill_id: currentQuestion.skill_id,
          level: profile.current_level,
          session_attempt_count: newSessionAttempts,
          session_correct: newSessionCorrect,
        });
        result.next_action = "advance_skill";
        setCurrentResult(result);
        document.dispatchEvent(new CustomEvent("ruby-skill-mastered", { detail: { type: "maths" } }));
        setPhase("mastered");
      } else {
        if (!result.is_correct) {
          setReteachCount((n) => n + 1);
          trackReteach({
            subject: "maths",
            skill_id: currentQuestion.skill_id,
            error_type: result.error_type ?? "unknown",
            reteach_count: reteachCount + 1,
          });
        } else {
          setReteachCount(0);
        }
        setCurrentResult(result);
        const stuckState = detectStuck(
          updatedMastery.attempt_count,
          updatedMastery.p_learned ?? 0,
          stuckDismissedAtRef.current,
        );
        if (stuckState.level === "stuck") {
          setStuckAttemptCount(stuckState.attemptCount);
          setPhase("stuck");
        } else {
          setPhase("feedback");
        }
      }
    } catch (e) {
      console.error(e);
      setStatusMessage("Something went wrong — please try submitting again.");
      setPhase("question");
    }
  };

  const handleNextAfterFeedback = () => {
    if (!profile || !currentResult) return;

    setLastWasIncorrect(currentResult.next_action === "review_prerequisite");
    setPhase("loading_question");
  };

  const handleMarkDone = () => {
    if (!profile || !currentQuestion) return;
    const skillId = currentQuestion.skill_id;
    const existingMastery = profile.skill_mastery[skillId] || initSkillMastery(skillId);
    const assumedMastery = { ...existingMastery, status: "assumed" as const };
    const profileWithAssumed = {
      ...profile,
      skill_mastery: { ...profile.skill_mastery, [skillId]: assumedMastery },
    };
    const nextSkillId = getNextSkillId(skillId);
    if (nextSkillId) {
      trackSkillAdvanced({ subject: "maths", from_skill_id: skillId, to_skill_id: nextSkillId });
      const advanced = advanceToSkill(profileWithAssumed, nextSkillId);
      saveStudentProfile(advanced);
      setProfile(advanced);
    } else {
      saveStudentProfile(profileWithAssumed);
      setProfile(profileWithAssumed);
    }
    stuckDismissedAtRef.current = 0;
    setSkillAttemptCount(0);
    recentTemplatesRef.current = [];
    setReteachCount(0);
    setLastWasIncorrect(false);
    setPhase(nextSkillId ? "loading_question" : "complete");
  };

  const handleKeepTrying = () => {
    if (!currentQuestion || !profile) return;
    const mastery = profile.skill_mastery[currentQuestion.skill_id];
    stuckDismissedAtRef.current = mastery?.attempt_count ?? skillAttemptCount;
    setPhase("feedback");
  };

  const handleNextAfterMastered = () => {
    if (!profile) return;
    const nextSkillId = getNextSkillId(profile.current_skill_id);
    if (nextSkillId) {
      trackSkillAdvanced({ subject: "maths", from_skill_id: profile.current_skill_id, to_skill_id: nextSkillId });
      const updated = advanceToSkill(profile, nextSkillId);
      setProfile(updated);
      setSkillAttemptCount(0);
      recentTemplatesRef.current = [];
      setReteachCount(0);
      setLastWasIncorrect(false);
      setPhase("loading_question");
    } else {
      setPhase("complete");
    }
  };

  const handleViewReport = useCallback(
    (result: MathsPlacementResult) => {
      setPendingPlacementResult(result);
      setShowReport(true);
    },
    []
  );

  const handlePlacementComplete = useCallback(
    (result: MathsPlacementResult) => {
      if (!profile) return;
      const updatedProfile = completeMathsPlacement(profile, result);
      setProfile(updatedProfile);
      setPhase("loading_question");

      // Track placement completion
      trackPlacementCompleted({
        subject: "maths",
        grade: profile.grade,
        entry_level: result.entryLevel,
        grade_gap: profile.grade - result.entryLevel,
        hard_gate_passed: result.hardGatePassed,
        questions_analysed: result.tasks.length,
        skills_auto_completed: result.autoCompletedSkillIds.length,
        placement_block: result.placementBlock ?? null,
        early_exit_reason: result.earlyExitReason ?? null,
      });
      trackSessionStarted({
        subject: "maths",
        current_skill_id: updatedProfile.current_skill_id,
        current_level: updatedProfile.current_level,
      });

      // Fire-and-forget report generation — failure must never block the student
      try {
        const input = buildMathsReportInput(updatedProfile);
        apiFetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, studentId: updatedProfile.id }),
        }).catch((err) =>
          console.error("[DiagnosticComplete] Report generation failed silently:", err)
        );
      } catch (err) {
        console.error("[DiagnosticComplete] Report input build failed:", err);
      }
    },
    [profile]
  );

  // Full reset — wipes everything, reruns placement with shuffled questions
  const resetToPlacement = () => {
    localStorage.removeItem("ruby_student_profile");
    const { name, grade } = readOnboarding();
    const freshProfile = createStudentProfile(name, grade);
    setProfile(freshProfile);
    setPhase("loading_question");
    setSkillAttemptCount(0);
    recentTemplatesRef.current = [];
    setSessionCorrect(0);
    setSessionAttempts(0);
    setReteachCount(0);
  };

  // Skill-tree-only reset — keeps placement result, returns to entry point with fresh questions
  const resetSkillTree = () => {
    const p = profile;
    if (!p?.placement) return;
    const pl = p.placement;
    // Rebuild mastery: only the auto-completed skills awarded by placement
    const restoredMastery: StudentProfile["skill_mastery"] = {};
    for (const skillId of pl.autoCompletedSkillIds) {
      const skill = getSkillById(skillId);
      restoredMastery[skillId] = {
        skill_id: skillId,
        status: "mastered",
        correct_count: skill?.mastery_criteria.correct_required ?? 3,
        attempt_count: skill?.mastery_criteria.correct_required ?? 3,
        formats_used: ["symbolic"],
        scaffolded_attempts: 0,
        last_attempted: new Date().toISOString(),
        mastered_at: new Date().toISOString(),
        attempts: [],
      };
    }
    const parts = pl.entrySkillId.split(".");
    const updated: StudentProfile = {
      ...p,
      skill_mastery: restoredMastery,
      current_skill_id: pl.entrySkillId,
      current_tier_id: `${parts[0]}.${parts[1]}`,
      current_level: parseInt(parts[0].replace("L", "")),
      used_questions: {}, // Clear so AI generates fresh questions
    };
    saveStudentProfile(updated);
    setProfile(updated);
    setPhase("loading_question");
    setSkillAttemptCount(0);
    recentTemplatesRef.current = [];
    setSessionCorrect(0);
    setSessionAttempts(0);
    setReteachCount(0);
  };

  // Refs always point to latest profile + functions — fixes stale closure in event handler
  const profileRef = useRef<StudentProfile | null>(null);
  profileRef.current = profile;
  const actionsRef = useRef({ resetToPlacement, resetSkillTree });
  actionsRef.current = { resetToPlacement, resetSkillTree };

  // Reset template history when the student moves to a new skill
  const prevSkillRef = useRef<string | null>(null);
  if (profile && profile.current_skill_id !== prevSkillRef.current) {
    prevSkillRef.current = profile.current_skill_id;
    recentTemplatesRef.current = [];
  }

  // Refs for session totals — accessible in unmount cleanup without stale closure
  const sessionAttemptsRef = useRef(0);
  const sessionCorrectRef = useRef(0);
  sessionAttemptsRef.current = sessionAttempts;
  sessionCorrectRef.current = sessionCorrect;

  // On unmount — emit session_ended analytics
  useEffect(() => {
    return () => {
      const p = profileRef.current;
      const attempts = sessionAttemptsRef.current;
      const correct = sessionCorrectRef.current;

      if (p?.placementCompleted && attempts > 0) {
        trackSessionEnded({
          subject: "maths",
          questions_answered: attempts,
          correct,
          accuracy: Math.round((correct / attempts) * 100),
        });
      }
    };
  }, []);

  // Mobile pencil icon → dispatches this event
  useEffect(() => {
    const handler = () => {
      const p = profileRef.current;
      if (!p) return;
      if (!p.placementCompleted) {
        if (window.confirm("Restart the discovery activity? You'll get a fresh set of questions in a different order.")) {
          actionsRef.current.resetToPlacement();
        }
      } else {
        if (window.confirm("Restart maths questions? Your placement result stays — you'll return to your starting level with fresh questions.")) {
          actionsRef.current.resetSkillTree();
        }
      }
    };
    document.addEventListener("ruby-action", handler);
    return () => document.removeEventListener("ruby-action", handler);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Placement gate — show discovery activity before regular learning begins
  if (profile && !profile.placementCompleted) {
    // Report view — shown after placement, before learning begins
    if (showReport && pendingPlacementResult) {
      const reportInput = buildMathsReportInput({
        ...profile,
        placement: { ...pendingPlacementResult, completedAt: Date.now(), placementCompletedAt: Date.now() },
        placementCompleted: true,
      });
      return (
        <DiagnosticReportView
          input={reportInput}
          onStartLearning={() => {
            setShowReport(false);
            handlePlacementComplete(pendingPlacementResult);
          }}
        />
      );
    }

    return (
      <MathsDiagnosticPlacement
        studentName={profile.name}
        grade={profile.grade}
        onComplete={handlePlacementComplete}
        onViewReport={handleViewReport}
      />
    );
  }

  if (phase === "loading_question") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
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
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {lastWasIncorrect && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm text-orange-800">
                {reteachCount >= 2
                  ? "One more go — slightly different approach."
                  : "Let's try this a different way."}
              </div>
            )}
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
              forceHint={lastWasIncorrect}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "feedback" && currentResult) {
    const nextLabels: Record<string, string> = {
      continue_skill: "Try another question",
      practice: "Next question",
      reteach: "Try a different approach",
      review_prerequisite: "Review prerequisite skill",
      advance_skill: "Next skill",
      advance_tier: "Next topic",
      advance_level: "Next level",
    };
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6">
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
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
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

  if (phase === "stuck" && currentQuestion) {
    const skill = getSkillById(currentQuestion.skill_id);
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <StuckScreen
          skillTitle={skill?.title ?? "this skill"}
          subject="maths"
          attemptCount={stuckAttemptCount}
          onMarkDone={handleMarkDone}
          onKeepTrying={handleKeepTrying}
        />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full text-center space-y-4">
            <div className="text-5xl mb-2">🎓</div>
            <h3 className="text-2xl font-bold text-gray-900">Incredible!</h3>
            <p className="text-gray-600">
              You&apos;ve completed the entire Ruby Math Skill Tree. That&apos;s a remarkable achievement!
            </p>
            <button
              onClick={resetToPlacement}
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
    <div className="hidden md:flex bg-white border-b border-gray-200 px-4 py-2 sm:px-6 sm:py-3 items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-gray-900 font-semibold text-sm sm:text-base truncate">
          Ruby Maths
          {profile && (
            <span className="text-gray-400 font-normal"> · {profile.name}</span>
          )}
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
            if (window.confirm("Restart maths questions? Your placement result stays — you'll return to your starting level with fresh questions.")) {
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
