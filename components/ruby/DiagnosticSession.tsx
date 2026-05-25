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
  friendlyMathsSkillName,
  getNextSkillId,
  getTierById,
  getLevelById,
  advanceToSkill,
  recordAttempt,
  completeMathsPlacement,
  linkStudentProfileToAuth,
  hydrateStudentProfileFromSupabase,
} from "@/lib/student-model";
import MathsDiagnosticPlacement from "./MathsDiagnosticPlacement";
import { MathsPlacementResult } from "@/types/ruby";
import { updateSkillMastery, initSkillMastery, scanMasteryForReview, pickNeedsReviewSkill, stampMathsReviewedAt } from "@/lib/mastery-engine";
import { getDomainForSkill, friendlyMathsDomainName, getUsedRefs, markQuestionUsed, selectQuestion, bankQuestionToGenerated } from "@/lib/question-selector";
import { abilityLevel } from "@/lib/bkt";
import { simplifyQuestion } from "@/lib/question-simplifier";
import { getReadingProfile } from "@/lib/reading-student-model";
import { supabase } from "@/lib/supabase";
import QuestionCard from "./QuestionCard";
import FeedbackCard from "./FeedbackCard";
import EduBackground from "@/components/EduBackground";
import { selectMathsTemplate } from "@/lib/template-selector";
import { detectStuck } from "@/lib/stuck-detector";
import StuckScreen from "@/components/shared/StuckScreen";
import type { DiagnosticReportInput } from "@/lib/report-generator";
import { describeError } from "@/lib/report-generator";
import { buildDeterministicReportContent } from "@/lib/report-content-builder";
import DiagnosticReportView from "@/components/DiagnosticReportView";
import { useT } from "@/lib/i18n";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import { GATE_PASSED_ENTRY, LEVEL_LABEL } from "@/lib/maths-placement-engine";
import {
  identifyStudent,
  trackQuestionAnswered,
  trackSkillMastered,
  trackSkillAdvanced,
  trackSessionStarted,
  trackSessionEnded,
  trackPlacementCompleted,
} from "@/lib/analytics";

type SessionPhase = "loading_question" | "question" | "feedback" | "mastered" | "tier_complete" | "level_up" | "stuck" | "complete";

function classifyTransition(fromId: string, toId: string): "same_tier" | "tier_complete" | "level_up" {
  const fromParts = fromId.split(".");
  const toParts = toId.split(".");
  if (fromParts[0] !== toParts[0]) return "level_up";
  if (fromParts[1] !== toParts[1]) return "tier_complete";
  return "same_tier";
}

// ─── Report input builder ─────────────────────────────────────────────────────
// Constructs DiagnosticReportInput from the completed student profile.
// Called after placement completes; runs client-side since profile is in localStorage.

// Returns the expected skill tree entry level for a given school grade.
// Derived from GATE_PASSED_ENTRY: the level a student enters after passing
// the gate that corresponds to their grade.
function expectedEntryLevel(grade: number): number {
  const idx = Math.min(Math.max(grade - 1, 0), 11);
  return GATE_PASSED_ENTRY[idx] ?? 1;
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
    // Parent-facing domain name (plain language, not CAPS jargon) for the report.
    const domainTitle = friendlyMathsDomainName(domainId);
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

  // Entry skill plain name — never leak the raw L{L}.T{T}.A{A} code
  const placementSkill = friendlyMathsSkillName(placement.entrySkillId);

  const levelTitle  = LEVEL_LABEL[placement.entryLevel] ?? `Level ${placement.entryLevel}`;
  const expected    = expectedEntryLevel(profile.grade);
  const levelGap    = expected - placement.entryLevel; // positive = behind expected

  return {
    subject: "maths",
    studentName: profile.name.split(" ")[0],
    studentGrade: profile.grade,
    workingLevel: `Level ${placement.entryLevel} — ${levelTitle}`,
    gradeLevelGap: levelGap,
    questionsAnalysed: placement.tasks.length,
    correctCount: placement.tasks.filter((t) => t.correct).length,
    domainScores,
    dominantErrors,
    placementSkill,
    skillsCompleted: placement.autoCompletedSkillIds.length,
    hardGateBlocked: !placement.hardGatePassed,
  };
}


export default function DiagnosticSession({ onSelectPlan, onExitReplay }: { onSelectPlan?: () => void; onExitReplay?: () => void }) {
  const { language } = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("loading_question");
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null);
  const [skillAttemptCount, setSkillAttemptCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadErrorCount, setLoadErrorCount] = useState(0);
  const retryFnRef = useRef<(() => void) | null>(null);
  const lastStudentAnswerRef = useRef<string>("");

  // Report state — shown after placement before learning begins
  const [pendingPlacementResult, setPendingPlacementResult] = useState<MathsPlacementResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  // Holds the profile saved in handleViewReport so handlePlacementComplete can reuse it
  const savedPlacementRef = useRef<StudentProfile | null>(null);

  // Needs-review: skill ID of a stale mastered skill to probe before main practice
  const [pendingReviewSkillId, setPendingReviewSkillId] = useState<string | null>(null);

  // Celebration state — next skill to advance to after tier/level celebration is dismissed
  const [pendingNextSkillId, setPendingNextSkillId] = useState<string | null>(null);
  // Track whether the last feedback was a needs-review question answered correctly
  const [wasReviewCorrect, setWasReviewCorrect] = useState(false);

  // Recent templates — used by selectMathsTemplate for anti-repetition; last 3 kept
  const recentTemplatesRef = useRef<QuestionTemplate[]>([]);

  // Stuck detection — tracks attempt_count when student last dismissed the stuck screen
  const stuckDismissedAtRef = useRef(0);
  const [stuckAttemptCount, setStuckAttemptCount] = useState(0);

  // ── Replay mode ────────────────────────────────────────────────────────────
  // When the student taps an already-completed skill in the tree, that skill id
  // is stashed in sessionStorage. In replay mode the session loads ONLY that
  // skill's questions and writes NO progression state (no attempts, no mastery,
  // no advancement) — pure practice. `replayChecked` gates the loader until the
  // flag has been read so the first question targets the right skill.
  const [replaySkillId, setReplaySkillId] = useState<string | null>(null);
  const [replayChecked, setReplayChecked] = useState(false);
  const replayConsumedRef = useRef(false);
  const replaySkillIdRef = useRef<string | null>(null);
  replaySkillIdRef.current = replaySkillId;

  useEffect(() => {
    // Replay detection — read the tapped-skill flag synchronously BEFORE the
    // profile init below runs, so the mastery scan-and-save is skipped in replay
    // and the first question targets the replay skill. Guarded against React
    // StrictMode double-invoke so the single-use flag is consumed exactly once.
    if (!replayConsumedRef.current) {
      replayConsumedRef.current = true;
      if (typeof window !== "undefined") {
        const flag = sessionStorage.getItem("ruby_maths_replay_skill");
        if (flag) {
          sessionStorage.removeItem("ruby_maths_replay_skill");
          replaySkillIdRef.current = flag;
          setReplaySkillId(flag);
        }
      }
      setReplayChecked(true);
    }

    // Fetch authoritative grade from Supabase users table first.
    // This is the single source of truth — written at onboarding completion and
    // survives browser clears, device switches, and tester session resets.
    // Falls back to localStorage onboardingData, then a safe default.
    fetchAuthorisedGrade().then((authorised) => {
      const authName  = authorised?.name  ?? "Student";
      const authGrade = authorised?.grade ?? 7;

      // Retake: DiscoverHub set this flag when the learner chose "Retake". Start a
      // brand-new profile so the placement gate re-runs Discovery from scratch,
      // instead of resuming the saved (already-placed) profile (mirror Reading).
      // The old profile isn't overwritten until the new placement completes.
      if (typeof window !== "undefined" && sessionStorage.getItem("ruby_maths_retake") === "1") {
        sessionStorage.removeItem("ruby_maths_retake");
        const fresh = createStudentProfile(authName, authGrade);
        identifyStudent({ id: fresh.id, name: fresh.name, grade: fresh.grade });
        void linkStudentProfileToAuth(fresh.id);
        setProfile(fresh);
        return;
      }

      function initWithProfile(saved: import("@/types/ruby").StudentProfile) {
        // Always apply the authoritative grade — never trust the cached profile grade.
        const gradeChanged = saved.grade !== authGrade;
        const nameChanged  = authName !== "Student" && authName !== saved.name.split(" ")[0];
        const synced = (gradeChanged || nameChanged)
          ? { ...saved, grade: authGrade, name: nameChanged ? authName : saved.name }
          : saved;

        identifyStudent({ id: synced.id, name: synced.name, grade: synced.grade });
        void linkStudentProfileToAuth(synced.id);
        if (synced.placementCompleted) {
          trackSessionStarted({
            subject: "maths",
            current_skill_id: synced.current_skill_id,
            current_level: synced.current_level,
          });
        }
        const scannedMastery = synced.placementCompleted ? scanMasteryForReview(synced.skill_mastery) : synced.skill_mastery;
        const scanned = scannedMastery !== synced.skill_mastery ? { ...synced, skill_mastery: scannedMastery } : synced;
        // Skip the maintenance save during replay — pure practice writes nothing.
        if (scanned !== saved && !replaySkillIdRef.current) saveStudentProfile(scanned);
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
            const newProfile = createStudentProfile(authName, authGrade);
            identifyStudent({ id: newProfile.id, name: newProfile.name, grade: newProfile.grade });
            void linkStudentProfileToAuth(newProfile.id);
            setProfile(newProfile);
            // phase stays at loading_question; placement gate will intercept
          }
        });
      }
    });
  }, []);

  const loadQuestion = useCallback(
    (skillId: string, _template: QuestionTemplate, attemptNum: number, currentProfile: StudentProfile, forceHint = false) => {
      retryFnRef.current = () => loadQuestion(skillId, _template, attemptNum, currentProfile, forceHint);
      try {
        const domainId = getDomainForSkill(skillId);
        if (!domainId) {
          setLoadErrorCount((c) => c + 1);
          setStatusMessage("No questions available for this skill.");
          return;
        }

        const usedRefs = getUsedRefs(currentProfile, domainId);
        const skillPLearned = currentProfile.skill_mastery[skillId]?.p_learned;
        const ability = skillPLearned !== undefined ? abilityLevel(skillPLearned) : undefined;
        const bankQ = selectQuestion(domainId, usedRefs, forceHint, skillId, ability);

        if (!bankQ) {
          setLoadErrorCount((c) => c + 1);
          setStatusMessage("No questions available for this skill.");
          return;
        }

        const readingProfile = getReadingProfile();
        const readingLevel = readingProfile?.current_level ?? 5;
        let q = simplifyQuestion(
          bankQuestionToGenerated(bankQ, skillId, domainId, forceHint) as GeneratedQuestion,
          readingLevel
        );

        if (q.domain_id && q.question_ref) {
          try {
            const updatedProfile = markQuestionUsed(currentProfile, q.domain_id, q.question_ref);
            // Replay is pure practice — track used questions in-memory only (avoid
            // repeats this session) but never persist to storage.
            if (!replaySkillIdRef.current) saveStudentProfile(updatedProfile);
            setProfile(updatedProfile);
          } catch {
            // DB unavailable — continue without saving used ref
          }
        }

        setCurrentQuestion(q);
        setLoadErrorCount(0);
        setPhase("question");
      } catch (err) {
        console.error("[loadQuestion] unexpected error:", err);
        setLoadErrorCount((c) => c + 1);
        setStatusMessage("Something went wrong loading the next question. Please try again.");
      }
    },
    []
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [phase, currentQuestion?.id]);

  useEffect(() => {
    if (phase === "loading_question" && profile && replayChecked) {
      const errorType = (currentResult && !currentResult.is_correct) ? (currentResult.error_type ?? null) : null;
      const lastWasWrong = currentResult?.is_correct === false;
      const template = selectMathsTemplate(lastWasWrong ? "reteach" : "advance", errorType, recentTemplatesRef.current);
      recentTemplatesRef.current = [...recentTemplatesRef.current.slice(-3), template];
      // Replay targets the chosen skill; otherwise normal needs-review/current-skill flow.
      const skillIdToLoad = replaySkillId ?? pendingReviewSkillId ?? profile.current_skill_id;
      loadQuestion(skillIdToLoad, template, skillAttemptCount + 1, profile, lastWasWrong);
    }
  }, [phase, profile, skillAttemptCount, loadQuestion, currentResult, replayChecked, replaySkillId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitAnswer = async (answer: string, steps: string, usedHint: boolean, workingImage?: string) => {
    if (!currentQuestion || !profile) return;
    lastStudentAnswerRef.current = answer;

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
          grade: profile.grade,
          difficulty: currentQuestion.difficulty,
        }),
      });

      const data = await res.json();
      const { result, attempt }: { result: DiagnosticResult; attempt: SkillAttempt } = data;

      // Update mastery in student model
      const skill = getSkillById(currentQuestion.skill_id);
      if (!skill) return;

      // ── Replay mode: pure practice ──────────────────────────────────────────
      // Grade and show feedback only. Skip ALL progression writes — no mastery
      // update, no recordAttempt, no advance, no save. Replay can never change
      // a student's real progress.
      if (replaySkillId) {
        result.next_action = "continue_skill";
        setSessionAttempts((n) => n + 1);
        if (result.is_correct) setSessionCorrect((n) => n + 1);
        setSkillAttemptCount((n) => n + 1);
        setCurrentResult(result);
        setPhase("feedback");
        return;
      }

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
        decision: updatedMastery.status === "mastered" ? "advance" : result.is_correct ? "practice" : "reteach",
      });

      const isReviewQuestion = pendingReviewSkillId === currentQuestion.skill_id;
      const profileAfterAttempt = recordAttempt(profile, attempt, updatedMastery);
      const updatedProfile = isReviewQuestion
        ? stampMathsReviewedAt(profileAfterAttempt, currentQuestion.skill_id)
        : profileAfterAttempt;
      if (isReviewQuestion) setPendingReviewSkillId(null);
      setWasReviewCorrect(isReviewQuestion && result.is_correct);
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
      setStatusMessage("Something went wrong, please try submitting again.");
      setPhase("question");
    }
  };

  const handleNextAfterFeedback = () => {
    if (!profile || !currentResult) return;

    setPhase("loading_question");
  };

  const handleMarkDone = () => {
    if (!profile || !currentQuestion) return;
    try {
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
      setPhase(nextSkillId ? "loading_question" : "complete");
    } catch (err) {
      console.error("[handleMarkDone] unexpected error:", err);
      setStatusMessage("Something went wrong. Please try again.");
    }
  };

  const handleSkipOnLoadError = () => {
    if (!profile) return;
    // In replay, "skip" must not advance progression — just retry the same skill.
    if (replaySkillId) {
      setLoadErrorCount(0);
      setPhase("loading_question");
      return;
    }
    try {
      setLoadErrorCount(0);
      const skillId = currentQuestion?.skill_id ?? profile.current_skill_id;
      const existingMastery = profile.skill_mastery[skillId] || initSkillMastery(skillId);
      const profileWithAssumed = {
        ...profile,
        skill_mastery: { ...profile.skill_mastery, [skillId]: { ...existingMastery, status: "assumed" as const } },
      };
      const nextSkillId = getNextSkillId(skillId);
      if (nextSkillId) {
        const advanced = advanceToSkill(profileWithAssumed, nextSkillId);
        saveStudentProfile(advanced);
        setProfile(advanced);
      } else {
        saveStudentProfile(profileWithAssumed);
        setProfile(profileWithAssumed);
      }
      setSkillAttemptCount(0);
      recentTemplatesRef.current = [];
      setPhase(nextSkillId ? "loading_question" : "complete");
    } catch (err) {
      console.error("[handleSkipOnLoadError] unexpected error:", err);
      setStatusMessage("Something went wrong. Please try again.");
    }
  };

  const handleKeepTrying = () => {
    if (!currentQuestion || !profile) return;
    const mastery = profile.skill_mastery[currentQuestion.skill_id];
    stuckDismissedAtRef.current = mastery?.attempt_count ?? skillAttemptCount;
    setPhase("feedback");
  };

  const handleNextAfterMastered = () => {
    if (!profile) return;
    try {
      const nextSkillId = getNextSkillId(profile.current_skill_id);
      if (nextSkillId) {
        trackSkillAdvanced({ subject: "maths", from_skill_id: profile.current_skill_id, to_skill_id: nextSkillId });
        const transition = classifyTransition(profile.current_skill_id, nextSkillId);
        if (transition === "level_up") {
          setPendingNextSkillId(nextSkillId);
          setPhase("level_up");
        } else if (transition === "tier_complete") {
          setPendingNextSkillId(nextSkillId);
          setPhase("tier_complete");
        } else {
          const updated = advanceToSkill(profile, nextSkillId);
          setProfile(updated);
          setSkillAttemptCount(0);
          recentTemplatesRef.current = [];
          setPhase("loading_question");
        }
      } else {
        setPhase("complete");
      }
    } catch (err) {
      console.error("[handleNextAfterMastered] unexpected error:", err);
      setStatusMessage("Something went wrong. Please try again.");
    }
  };

  const handleAdvanceAfterCelebration = () => {
    if (!profile || !pendingNextSkillId) return;
    try {
      const updated = advanceToSkill(profile, pendingNextSkillId);
      setProfile(updated);
      setPendingNextSkillId(null);
      setSkillAttemptCount(0);
      recentTemplatesRef.current = [];
      setPhase("loading_question");
    } catch (err) {
      console.error("[handleAdvanceAfterCelebration] unexpected error:", err);
      setStatusMessage("Something went wrong. Please try again.");
    }
  };

  const handleViewReport = useCallback(
    async (result: MathsPlacementResult) => {
      if (!profile) return;
      setPendingPlacementResult(result);
      setShowReport(true);
      // Persist immediately so the report is viewable from home/settings
      // even if the user navigates away before clicking "Continue Learning"
      const updatedProfile = completeMathsPlacement(profile, result);
      savedPlacementRef.current = updatedProfile;
      try {
        const input = buildMathsReportInput(updatedProfile);
        const content = buildDeterministicReportContent(input);
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          const { error: reportError } = await supabase.from("student_reports").insert({
            user_id: user.id,
            subject: "maths",
            input_data: input as unknown as Record<string, unknown>,
            content_data: content as unknown as Record<string, unknown>,
            generated_at: new Date().toISOString(),
          });
          if (reportError) console.error("[DiagnosticViewReport] student_reports insert failed:", reportError);
          void fetch("/api/reports/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, subject: "maths", inputData: input, contentData: content }),
          });
        }
      } catch (err) {
        console.error("[DiagnosticViewReport] Report save failed:", err);
      }
    },
    [profile]
  );

  const handlePlacementComplete = useCallback(
    async (result: MathsPlacementResult) => {
      if (!profile) return;
      // Reuse the profile already saved in handleViewReport; fall back if called directly
      const updatedProfile = savedPlacementRef.current ?? completeMathsPlacement(profile, result);
      setProfile(updatedProfile);
      setPhase("loading_question");

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
    },
    [profile]
  );

  // Full reset — wipes everything, reruns placement with shuffled questions
  const resetToPlacement = () => {
    fetchAuthorisedGrade().then((authorised) => {
      const name  = authorised?.name  ?? "Student";
      const grade = authorised?.grade ?? 7;
      const freshProfile = createStudentProfile(name, grade);
      setProfile(freshProfile);
      setPhase("loading_question");
      setSkillAttemptCount(0);
      recentTemplatesRef.current = [];
      setSessionCorrect(0);
      setSessionAttempts(0);
    });
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
      if (replaySkillIdRef.current) return; // replay = practice; restart is disabled
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
          ctaLabel="Continue Learning 🚀"
          onStartLearning={async () => {
            if (onSelectPlan) {
              onSelectPlan();
              handlePlacementComplete(pendingPlacementResult);
              return;
            }
            setShowReport(false);
            await handlePlacementComplete(pendingPlacementResult);
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
      <div className="relative isolate flex flex-col h-full bg-gray-50">
        <div className="absolute inset-0 -z-10"><EduBackground /></div>
        {replaySkillId
          ? <ReplayBar skillId={replaySkillId} onExit={onExitReplay} />
          : <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />}
        <div className="flex-1 flex items-center justify-center p-6">
          {loadErrorCount === 0 ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">{statusMessage || "Ruby is personalising your learning..."}</p>
            </div>
          ) : (
            <div className="text-center max-w-sm w-full space-y-4">
              <div className="text-4xl">⚠️</div>
              <p className="text-gray-800 font-semibold">
                {loadErrorCount >= 3 ? "Still not loading" : "Couldn't load the question"}
              </p>
              <p className="text-gray-500 text-sm">Check your connection and try again.</p>
              {loadErrorCount < 3 ? (
                <button
                  onClick={() => retryFnRef.current?.()}
                  className="w-full bg-blue-500 text-white py-3 rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  Try again
                </button>
              ) : (
                <button
                  onClick={handleSkipOnLoadError}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Skip this question
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "question" && currentQuestion) {
    const skill = getSkillById(currentQuestion.skill_id);
    return (
      <div className="relative isolate flex flex-col h-full bg-gray-50">
        <div className="absolute inset-0 -z-10"><EduBackground /></div>
        {replaySkillId
          ? <ReplayBar skillId={replaySkillId} onExit={onExitReplay} />
          : <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto space-y-4">
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
              isSubmitting={false}
              forceHint={currentResult?.is_correct === false}
              topicLabel={skill?.title}
              badgeRight={skill ? (
                <MasteryDots
                  correctCount={profile?.skill_mastery[currentQuestion.skill_id]?.correct_count || 0}
                  required={skill.mastery_criteria.correct_required}
                />
              ) : undefined}
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
      advance_skill: "Next skill",
      advance_tier: "Next topic",
      advance_level: "Next level",
    };
    return (
      <div className="relative isolate flex flex-col h-full bg-gray-50">
        <div className="absolute inset-0 -z-10"><EduBackground /></div>
        {replaySkillId
          ? <ReplayBar skillId={replaySkillId} onExit={onExitReplay} />
          : <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto">
            <FeedbackCard
              result={currentResult}
              onNext={handleNextAfterFeedback}
              nextLabel={nextLabels[currentResult.next_action] || "Continue"}
              grade={profile?.grade}
              wasReviewCorrect={wasReviewCorrect}
              questionContext={currentQuestion ? {
                skill_id: currentQuestion.skill_id,
                question: currentQuestion.question,
                student_answer: lastStudentAnswerRef.current,
                expected_answer: currentQuestion.expected_answer,
              } : undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "mastered") {
    const skill = profile ? getSkillById(profile.current_skill_id) : null;
    return (
      <div className="relative isolate flex flex-col h-full bg-gray-50">
        <div className="absolute inset-0 -z-10"><EduBackground /></div>
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-green-200 rounded-2xl p-8 shadow-lg max-w-md w-full text-center space-y-4">
            <div className="text-6xl mb-1">🎉</div>
            <div className="flex justify-center gap-2 text-2xl">⭐⭐⭐</div>
            <h3 className="text-2xl font-bold text-green-800">Skill Complete!</h3>
            <p className="text-green-700 text-lg">
              You mastered <strong>{skill?.title || "this skill"}</strong>!
            </p>
            {currentResult && (
              <p className="text-gray-500 text-sm">{currentResult.feedback}</p>
            )}
            <button
              onClick={handleNextAfterMastered}
              className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white py-3 rounded-xl font-semibold text-lg transition-all shadow-md mt-2"
            >
              Keep going →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "tier_complete") {
    const currentTierId = profile ? `${profile.current_skill_id.split(".")[0]}.${profile.current_skill_id.split(".")[1]}` : null;
    const tier = currentTierId ? getTierById(currentTierId) : null;
    return (
      <div className="relative isolate flex flex-col h-full bg-gray-50">
        <div className="absolute inset-0 -z-10"><EduBackground /></div>
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-lg max-w-md w-full text-center space-y-4">
            <div className="text-5xl">🎯</div>
            <h3 className="text-2xl font-bold text-blue-800">Topic Complete!</h3>
            <p className="text-blue-700 text-lg">
              You finished <strong>{tier?.title ?? "this topic"}</strong>!
            </p>
            <button
              onClick={handleAdvanceAfterCelebration}
              className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white py-3 rounded-xl font-semibold text-lg transition-all shadow-md"
            >
              Next topic →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "level_up") {
    const nextLevelNum = pendingNextSkillId ? parseInt(pendingNextSkillId.split(".")[0].replace("L", "")) : null;
    const nextLevel = nextLevelNum ? getLevelById(nextLevelNum) : null;
    const levelName = nextLevel?.title ?? (nextLevelNum ? LEVEL_LABEL[nextLevelNum] : null) ?? "the next level";
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-yellow-50 to-orange-50">
        <SessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-yellow-300 rounded-2xl p-8 shadow-xl max-w-md w-full text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <h3 className="text-3xl font-bold text-yellow-800">Level Up!</h3>
            <p className="text-yellow-700 text-xl">
              You unlocked <strong>{levelName}</strong>!
            </p>
            <button
              onClick={handleAdvanceAfterCelebration}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 active:scale-95 text-white py-4 rounded-xl font-bold text-xl transition-all shadow-lg"
            >
              Keep going! →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "stuck" && currentQuestion) {
    const skill = getSkillById(currentQuestion.skill_id);
    return (
      <div className="relative isolate flex flex-col h-full bg-gray-50">
        <div className="absolute inset-0 -z-10"><EduBackground /></div>
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
      <div className="relative isolate flex flex-col h-full bg-gray-50">
        <div className="absolute inset-0 -z-10"><EduBackground /></div>
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

// Header shown during replay (pure-practice) mode: a clear way back to the tree
// plus the skill being practised. Replaces SessionHeader so the progression
// "restart" control isn't exposed while replaying.
function ReplayBar({ skillId, onExit }: { skillId: string | null; onExit?: () => void }) {
  const skill = skillId ? getSkillById(skillId) : null;
  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between gap-3">
      <button
        onClick={onExit}
        className="text-sm font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 flex-shrink-0"
      >
        ← Back to skill tree
      </button>
      <span className="text-xs sm:text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full font-medium truncate">
        🔁 Practising: {skill?.title ?? "this skill"}
      </span>
    </div>
  );
}

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
