"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/fetch";
import { useT } from "@/lib/i18n";

import { speakViaAPI, prefetchTTS } from "@/lib/tts";

// Alias so all call sites remain unchanged
const speakNaturally = speakViaAPI;
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
  getReadingTierById,
  getReadingLevelById,
  advanceToReadingSkill,
  recordReadingAttempt,
  updateSessionHistory,
  updateReadingSkillMastery,
  initReadingSkillMastery,
  completeDiagnosticPlacement,
  saveReadingProfile,
  scanAndMarkNeedsReview,
  pickNeedsReviewSkill,
  stampReviewedAt,
  linkReadingProfileToAuth,
  hydrateReadingProfileFromSupabase,
  getReadingUsedRefs,
  markReadingQuestionUsed,
} from "@/lib/reading-student-model";
import ReadingDiagnosticPlacement from "@/components/reading/ReadingDiagnosticPlacement";
import { selectReadingTemplate } from "@/lib/template-selector";
import { detectStuck } from "@/lib/stuck-detector";
import StuckScreen from "@/components/shared/StuckScreen";
import DiagnosticReportView from "@/components/DiagnosticReportView";
import type { DiagnosticReportInput } from "@/lib/report-generator";
import { buildDeterministicReportContent } from "@/lib/report-content-builder";
import {
  identifyStudent,
  trackQuestionAnswered,
  trackSkillMastered,
  trackSkillAdvanced,
  trackSessionStarted,
  trackSessionEnded,
  trackPlacementCompleted,
} from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";

type SessionPhase = "loading_question" | "question" | "feedback" | "mastered" | "tier_complete" | "level_up" | "stuck" | "complete";

function classifyTransition(fromId: string, toId: string): "same_tier" | "tier_complete" | "level_up" {
  const fromParts = fromId.split(".");
  const toParts = toId.split(".");
  if (fromParts[0] !== toParts[0]) return "level_up";
  if (fromParts[1] !== toParts[1]) return "tier_complete";
  return "same_tier";
}

// ─── Reading report input builder ─────────────────────────────────────────────

function buildReadingReportInput(
  profile: ReadingStudentProfile,
  result: import("@/types/reading").DiagnosticPlacementResult
): DiagnosticReportInput {
  // Map tasks to reading area groups
  const total = result.tasks.length;
  const correct = result.tasks.filter((t) => t.correct).length;
  const overallScore = total > 0 ? Math.round((correct / total) * 100) : 50;

  // Split tasks into approximate thirds for domain breakdown
  const third = Math.ceil(total / 3);
  const groups = [
    { name: "Phonological Awareness", tasks: result.tasks.slice(0, third) },
    { name: "Letter–Sound Knowledge", tasks: result.tasks.slice(third, third * 2) },
    { name: "Decoding & Fluency",     tasks: result.tasks.slice(third * 2) },
  ];

  const domainScores: DiagnosticReportInput["domainScores"] = groups
    .filter((g) => g.tasks.length > 0)
    .map((g) => {
      const groupCorrect = g.tasks.filter((t) => t.correct).length;
      const score = Math.round((groupCorrect / g.tasks.length) * 100);
      const label: "strong" | "building" | "practice" =
        score >= 75 ? "strong" : score >= 50 ? "building" : "practice";
      // DiagnosticTaskResult has no error_type field — errorNote unavailable at placement stage
      return { domain: g.name, score, label, errorNote: null };
    });

  // Derive dominant errors from profile.error_history (accumulated across all reading activity)
  // Falls back to score-based heuristic if no history exists yet
  const historyEntries = Object.entries(profile.error_history ?? {})
    .filter(([code, count]) => code !== "correct" && (count as number) > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([code]) => code);
  const dominantErrors = historyEntries.length > 0
    ? historyEntries
    : overallScore < 50 ? ["ERR_BLEND_FAIL"] : overallScore < 70 ? ["ERR_SOUND_RECALL"] : [];

  const entryLevel = result.autoCompletedSkillIds.length > 6 ? 3
    : result.autoCompletedSkillIds.length > 2 ? 2 : 1;

  return {
    subject: "reading",
    studentName: profile.name.split(" ")[0],
    studentGrade: profile.grade,
    workingLevel: `Reading Level ${entryLevel}`,
    gradeLevelGap: profile.grade - entryLevel,
    questionsAnalysed: total,
    correctCount: result.tasks.filter((t) => t.correct).length,
    domainScores,
    dominantErrors,
    placementSkill: result.entrySkillId,
    skillsCompleted: result.autoCompletedSkillIds.length,
  };
}

function parseGrade(raw: unknown, fallback: number): number {
  const parsed = parseInt(raw as string, 10);
  return !isNaN(parsed) && parsed >= 1 && parsed <= 12 ? parsed : fallback;
}

async function readOnboardingWithFallback(): Promise<{ name: string; grade: number }> {
  try {
    const auth = await fetchAuthorisedGrade();
    if (auth) return auth;
  } catch { /* fall through */ }
  return { name: "Student", grade: 3 };
}

export default function ReadingSession({ onSelectPlan }: { onSelectPlan?: () => void }) {
  const { language } = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<ReadingStudentProfile | null>(null);
  const [phase, setPhase] = useState<SessionPhase>("loading_question");
  const [currentQuestion, setCurrentQuestion] = useState<ReadingGeneratedQuestion | null>(null);
  const [currentResult, setCurrentResult] = useState<ReadingDiagnosticResult | null>(null);
  const [skillAttemptCount, setSkillAttemptCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadErrorCount, setLoadErrorCount] = useState(0);
  const retryFnRef = useRef<(() => void) | null>(null);

  // Report state — shown after placement, before learning begins
  const [pendingPlacementResult, setPendingPlacementResult] = useState<import("@/types/reading").DiagnosticPlacementResult | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Needs-review: skill ID of a stale mastered skill to probe before main practice
  const [pendingReviewSkillId, setPendingReviewSkillId] = useState<string | null>(null);

  // Celebration state — next skill to advance to after tier/level celebration is dismissed
  const [pendingNextSkillId, setPendingNextSkillId] = useState<string | null>(null);
  // Track whether the last feedback was a needs-review question answered correctly
  const [wasReviewCorrect, setWasReviewCorrect] = useState(false);

  // Recent templates — used by selectReadingTemplate for anti-repetition; last 3 kept
  const recentTemplatesRef = useRef<ReadingTemplate[]>([]);

  // Stuck detection — tracks attempt_count when student last dismissed the stuck screen
  const stuckDismissedAtRef = useRef(0);

  // Prefetch cache — holds the next question fetched during feedback phase
  const prefetchedQuestionRef = useRef<{ question: ReadingGeneratedQuestion; skillId: string } | null>(null);
  const [stuckAttemptCount, setStuckAttemptCount] = useState(0);

  // Prevents double-writing sessionHistory for the same skill session
  const hasRecordedSession = useRef(false);

  // Keep profileRef in sync so callbacks never close over a stale profile
  useEffect(() => { profileRef.current = profile; }, [profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [phase, currentQuestion?.id]);

  useEffect(() => {
    function initWithProfile(saved: import("@/types/reading").ReadingStudentProfile) {
      identifyStudent({ id: saved.id, name: saved.name, grade: saved.grade });
      // Keep auth link fresh — fire-and-forget, non-blocking
      void linkReadingProfileToAuth(saved.id);
      if (saved.placementCompleted) {
        trackSessionStarted({
          subject: "reading",
          current_skill_id: saved.current_skill_id,
          current_level: saved.current_level,
        });
      }
      const scanned = saved.placementCompleted ? scanAndMarkNeedsReview(saved) : saved;
      setProfile(scanned);
      const restoredAttemptCount = scanned.skill_mastery[scanned.current_skill_id]?.attempt_count ?? 0;
      setSkillAttemptCount(restoredAttemptCount);
      const reviewSkill = saved.placementCompleted ? pickNeedsReviewSkill(scanned) : null;
      if (reviewSkill) setPendingReviewSkillId(reviewSkill);
      setPhase("loading_question");
    }

    const saved = getReadingProfile();
    if (saved) {
      initWithProfile(saved);
    } else {
      // localStorage cleared — try to restore from Supabase before creating a new profile
      hydrateReadingProfileFromSupabase().then((restored) => {
        if (restored) {
          initWithProfile(restored);
        } else {
          readOnboardingWithFallback().then(({ name, grade }) => {
            const newProfile = createReadingProfile(name, grade);
            identifyStudent({ id: newProfile.id, name: newProfile.name, grade: newProfile.grade });
            setProfile(newProfile);
            // placement gate will intercept before loading_question fires
          });
        }
      });
    }
  }, []);

  const loadQuestion = useCallback(
    async (skillId: string, template: ReadingTemplate, attemptNum: number, is_correct = true, errorType: string | null = null) => {
      retryFnRef.current = () => loadQuestion(skillId, template, attemptNum, is_correct, errorType);

      // Use prefetched question if available — skips network call and spinner
      const prefetch = prefetchedQuestionRef.current;
      if (prefetch?.skillId === skillId) {
        prefetchedQuestionRef.current = null;
        const q = prefetch.question;
        if (q.used_ref && profileRef.current) {
          const updated = markReadingQuestionUsed(profileRef.current, skillId, q.used_ref);
          setProfile(updated);
        }
        setCurrentQuestion(q);
        setLoadErrorCount(0);
        setPhase("question");
        return;
      }

      setPhase("loading_question");
      setStatusMessage("Generating your question...");
      try {
        const used_refs = profileRef.current ? getReadingUsedRefs(profileRef.current, skillId) : [];
        const res = await apiFetch("/api/reading/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_id: skillId,
            template,
            attempt_number: attemptNum,
            include_hint: attemptNum > 1,
            is_correct,
            error_type: errorType,
            used_refs,
          }),
        });
        if (!res.ok) throw new Error("Failed to generate question");
        const q: ReadingGeneratedQuestion = await res.json();
        // Mark this pool ref as used so it isn't served again until the pool resets
        if (q.used_ref && profileRef.current) {
          const updated = markReadingQuestionUsed(profileRef.current, skillId, q.used_ref);
          setProfile(updated);
        }
        setCurrentQuestion(q);
        setLoadErrorCount(0);
        setPhase("question");
      } catch {
        setLoadErrorCount((c) => c + 1);
        setStatusMessage("Failed to load question.");
      }
    },
    []
  );

  useEffect(() => {
    if (phase === "loading_question" && profile) {
      const prevCorrect = currentResult?.is_correct ?? true;
      const errorType =
        currentResult && !currentResult.is_correct && currentResult.error_type !== "correct"
          ? currentResult.error_type
          : null;
      const template = selectReadingTemplate(prevCorrect, errorType, null, recentTemplatesRef.current);
      recentTemplatesRef.current = [...recentTemplatesRef.current.slice(-3), template];
      // If a stale mastered skill needs a retention probe, load that first
      const skillIdToLoad = pendingReviewSkillId ?? profile.current_skill_id;
      loadQuestion(skillIdToLoad, template, skillAttemptCount + 1, prevCorrect, errorType);
    }
  }, [phase, profile, skillAttemptCount, currentResult, loadQuestion]);

  const handleViewReport = useCallback(
    (result: DiagnosticPlacementResult) => {
      setPendingPlacementResult(result);
      setShowReport(true);
    },
    []
  );

  const handlePlacementComplete = useCallback(
    async (result: DiagnosticPlacementResult) => {
      if (!profile) return;
      const updated = completeDiagnosticPlacement(profile, result);
      setProfile(updated);
      setPhase("loading_question");

      trackPlacementCompleted({
        subject: "reading",
        grade: profile.grade,
        entry_level: updated.current_level,
        grade_gap: profile.grade - updated.current_level,
        hard_gate_passed: result.hardGatePassed,
        questions_analysed: result.tasks.length,
        skills_auto_completed: result.autoCompletedSkillIds.length,
        placement_block: null,
        early_exit_reason: null,
      });
      trackSessionStarted({
        subject: "reading",
        current_skill_id: updated.current_skill_id,
        current_level: updated.current_level,
      });

      // Build and persist report to Supabase for parent viewing
      try {
        const rInput = buildReadingReportInput(updated, result);
        const rContent = buildDeterministicReportContent(rInput);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          void supabase.from("student_reports").insert({
            user_id: user.id,
            subject: "reading",
            input_data: rInput as unknown as Record<string, unknown>,
            content_data: rContent as unknown as Record<string, unknown>,
            generated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("[ReadingPlacement] Report save failed:", err);
      }
    },
    [profile]
  );

  const handleSubmitAnswer = async (answer: string, steps: string, usedHint: boolean) => {
    if (!currentQuestion || !profile) return;


    try {
      const res = await apiFetch("/api/reading/submit-answer", {
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
        }),
      });

      const data = await res.json();
      const { result, attempt }: { result: ReadingDiagnosticResult; attempt: ReadingSkillAttempt } = data;

      const skill = getReadingSkillById(currentQuestion.skill_id);
      if (!skill) return;

      const existingMastery =
        profile.skill_mastery[currentQuestion.skill_id] ||
        initReadingSkillMastery(currentQuestion.skill_id);

      const updatedMastery = updateReadingSkillMastery(existingMastery, attempt, profile.grade);
      result.mastery_update = {
        skill_id: currentQuestion.skill_id,
        new_status: updatedMastery.status,
        correct_count: updatedMastery.correct_count,
        attempt_count: updatedMastery.attempt_count,
        formats_used: updatedMastery.formats_used,
      };

      result.next_action = updatedMastery.status === "mastered" ? "advance_skill" : "continue_skill";

      const isReviewQuestion = pendingReviewSkillId === currentQuestion.skill_id;
      const profileAfterAttempt = recordReadingAttempt(profile, attempt, updatedMastery);
      const profileAfterReview = isReviewQuestion
        ? stampReviewedAt(profileAfterAttempt, currentQuestion.skill_id)
        : profileAfterAttempt;
      setProfile(profileAfterReview);
      if (isReviewQuestion) setPendingReviewSkillId(null);
      setWasReviewCorrect(isReviewQuestion && result.is_correct);

      const newSessionAttempts = sessionAttempts + 1;
      const newSessionCorrect = sessionCorrect + (result.is_correct ? 1 : 0);
      setSessionAttempts((n) => n + 1);
      if (result.is_correct) setSessionCorrect((n) => n + 1);
      setSkillAttemptCount((n) => n + 1);

      // Track every answer
      trackQuestionAnswered({
        subject: "reading",
        skill_id: currentQuestion.skill_id,
        template: currentQuestion.template,
        is_correct: result.is_correct,
        used_hint: usedHint,
        attempt_number: skillAttemptCount + 1,
      });

      if (updatedMastery.status === "mastered") {
        trackSkillMastered({
          subject: "reading",
          skill_id: currentQuestion.skill_id,
          level: profile.current_level,
          session_attempt_count: newSessionAttempts,
          session_correct: newSessionCorrect,
        });
        result.next_action = "advance_skill";
        setCurrentResult(result);
        document.dispatchEvent(new CustomEvent("ruby-skill-mastered", { detail: { type: "reading" } }));
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
          // Prefetch next question while student reads feedback
          const nextSkillId = profileAfterReview.current_skill_id;
          const nextUsedRefs = getReadingUsedRefs(profileAfterReview, nextSkillId);
          const nextErrorType = !result.is_correct && result.error_type !== "correct" ? result.error_type : null;
          const nextTemplate = selectReadingTemplate(result.is_correct, nextErrorType, null, recentTemplatesRef.current);
          void apiFetch("/api/reading/generate-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              skill_id: nextSkillId,
              template: nextTemplate,
              attempt_number: skillAttemptCount + 2,
              include_hint: !result.is_correct,
              is_correct: result.is_correct,
              error_type: nextErrorType,
              used_refs: nextUsedRefs,
            }),
          }).then(async (res) => {
            if (res.ok) {
              const q: ReadingGeneratedQuestion = await res.json();
              prefetchedQuestionRef.current = { question: q, skillId: nextSkillId };
              // Prefetch TTS for the next question during feedback so audio is
              // ready the moment the question appears — not after it mounts
              if (q.question) prefetchTTS(q.question);
              q.audioChoices?.forEach((c) => { if (c.speech) prefetchTTS(c.speech); });
            }
          }).catch(() => { /* silent — loadQuestion will fetch normally as fallback */ });
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
      const existingMastery = profile.skill_mastery[skillId] || initReadingSkillMastery(skillId);
      const assumedMastery = { ...existingMastery, status: "assumed" as const };
      const profileWithAssumed = {
        ...profile,
        skill_mastery: { ...profile.skill_mastery, [skillId]: assumedMastery },
      };
      const nextSkillId = getNextReadingSkillId(skillId);
      if (nextSkillId) {
        trackSkillAdvanced({ subject: "reading", from_skill_id: skillId, to_skill_id: nextSkillId });
        const advanced = advanceToReadingSkill(profileWithAssumed, nextSkillId);
        saveReadingProfile(advanced);
        setProfile(advanced);
      } else {
        saveReadingProfile(profileWithAssumed);
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
    try {
      setLoadErrorCount(0);
      const skillId = currentQuestion?.skill_id ?? profile.current_skill_id;
      const existingMastery = profile.skill_mastery[skillId] || initReadingSkillMastery(skillId);
      const profileWithAssumed = {
        ...profile,
        skill_mastery: { ...profile.skill_mastery, [skillId]: { ...existingMastery, status: "assumed" as const } },
      };
      const nextSkillId = getNextReadingSkillId(skillId);
      if (nextSkillId) {
        const advanced = advanceToReadingSkill(profileWithAssumed, nextSkillId);
        saveReadingProfile(advanced);
        setProfile(advanced);
      } else {
        saveReadingProfile(profileWithAssumed);
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
      // Record session as passed — student mastered this skill
      if (!hasRecordedSession.current) {
        hasRecordedSession.current = true;
        updateSessionHistory(profile, profile.current_skill_id, true);
      }
      const nextSkillId = getNextReadingSkillId(profile.current_skill_id);
      if (nextSkillId) {
        trackSkillAdvanced({ subject: "reading", from_skill_id: profile.current_skill_id, to_skill_id: nextSkillId });
        const transition = classifyTransition(profile.current_skill_id, nextSkillId);
        if (transition === "level_up") {
          setPendingNextSkillId(nextSkillId);
          setPhase("level_up");
        } else if (transition === "tier_complete") {
          setPendingNextSkillId(nextSkillId);
          setPhase("tier_complete");
        } else {
          const updated = advanceToReadingSkill(profile, nextSkillId);
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
      const updated = advanceToReadingSkill(profile, pendingNextSkillId);
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

  // Full reset — wipes everything, reruns placement with fresh questions
  const resetToPlacement = () => {
    readOnboardingWithFallback().then(({ name, grade }) => {
      const freshProfile = createReadingProfile(name, grade);
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
    recentTemplatesRef.current = [];
    setSessionCorrect(0);
    setSessionAttempts(0);
  };

  // Refs always point to latest profile + functions — fixes stale closure in event handler
  const profileRef = useRef<ReadingStudentProfile | null>(null);
  profileRef.current = profile;
  const sessionAttemptsRef = useRef(0);
  const sessionCorrectRef = useRef(0);
  sessionAttemptsRef.current = sessionAttempts;
  sessionCorrectRef.current = sessionCorrect;

  // Reset session-record flag whenever the student moves to a new skill
  const prevSkillRef = useRef<string | null>(null);
  if (profile && profile.current_skill_id !== prevSkillRef.current) {
    prevSkillRef.current = profile.current_skill_id;
    hasRecordedSession.current = false;
    recentTemplatesRef.current = [];
  }

  // Write one session entry on unmount (student navigates away mid-skill)
  useEffect(() => {
    return () => {
      const p = profileRef.current;
      const attempts = sessionAttemptsRef.current;
      const correct = sessionCorrectRef.current;

      if (p?.placementCompleted && attempts > 0) {
        trackSessionEnded({
          subject: "reading",
          questions_answered: attempts,
          correct,
          accuracy: Math.round((correct / attempts) * 100),
        });
      }

      if (!p || hasRecordedSession.current) return;
      hasRecordedSession.current = true;
      const mastery = p.skill_mastery[p.current_skill_id];
      const passed = mastery?.status === "mastered";
      updateSessionHistory(p, p.current_skill_id, passed);
    };
  }, []);
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
    if (showReport && pendingPlacementResult) {
      const reportInput = buildReadingReportInput(profile, pendingPlacementResult);
      return (
        <DiagnosticReportView
          input={reportInput}
          ctaLabel="Continue Learning 🚀"
          onStartLearning={() => {
            if (onSelectPlan) {
              handlePlacementComplete(pendingPlacementResult);
              onSelectPlan();
              return;
            }
            setShowReport(false);
            handlePlacementComplete(pendingPlacementResult);
          }}
        />
      );
    }

    return (
      <ReadingDiagnosticPlacement
        studentName={profile.name}
        studentGrade={profile.grade}
        onComplete={handlePlacementComplete}
        onViewReport={handleViewReport}
      />
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (phase === "loading_question") {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          {loadErrorCount === 0 ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-base">{statusMessage || "Ruby is personalising your learning..."}</p>
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
                  className="w-full bg-purple-500 text-white py-3 rounded-2xl font-semibold hover:bg-purple-600 transition-colors"
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

  // ─── Question ─────────────────────────────────────────────────────────────────

  if (phase === "question" && currentQuestion) {
    const skill = getReadingSkillById(currentQuestion.skill_id);
    const mastery = profile?.skill_mastery[currentQuestion.skill_id];
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto space-y-4">
            {skill && (
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 uppercase tracking-wide">{profile ? `L${profile.current_level} - CURRENT SKILL` : "Current Skill"}</p>
                  <p className="text-gray-800 font-medium text-base">{skill.title}</p>
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
      advance_skill: "Next skill",
      advance_tier: "Next topic",
      advance_level: "Next level",
    };
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-xl mx-auto">
            <ReadingFeedbackCard
              result={currentResult}
              onNext={handleNextAfterFeedback}
              nextLabel={nextLabels[currentResult.next_action] || "Continue"}
              language={language}
              wasReviewCorrect={wasReviewCorrect}
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

  // ─── Tier complete ────────────────────────────────────────────────────────────

  if (phase === "tier_complete") {
    const currentTierId = profile ? `${profile.current_skill_id.split(".")[0]}.${profile.current_skill_id.split(".")[1]}` : null;
    const tier = currentTierId ? getReadingTierById(currentTierId) : null;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-purple-200 rounded-2xl p-8 shadow-lg max-w-md w-full text-center space-y-4">
            <div className="text-5xl">🎯</div>
            <h3 className="text-2xl font-bold text-purple-800">Topic Complete!</h3>
            <p className="text-purple-700 text-lg">
              You finished <strong>{tier?.title ?? "this topic"}</strong>!
            </p>
            <button
              onClick={handleAdvanceAfterCelebration}
              className="w-full bg-purple-500 hover:bg-purple-600 active:scale-95 text-white py-3 rounded-xl font-semibold text-lg transition-all shadow-md"
            >
              Next topic →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Level up ─────────────────────────────────────────────────────────────────

  if (phase === "level_up") {
    const nextLevelNum = pendingNextSkillId ? parseInt(pendingNextSkillId.split(".")[0].replace("R", "")) : null;
    const nextLevel = nextLevelNum ? getReadingLevelById(nextLevelNum) : null;
    const levelName = nextLevel?.title ?? `Reading Level ${nextLevelNum}`;
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-orange-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-8 shadow-xl max-w-md w-full text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <h3 className="text-3xl font-bold text-amber-800">Level Up!</h3>
            <p className="text-amber-700 text-xl">
              You unlocked <strong>{levelName}</strong>!
            </p>
            <button
              onClick={handleAdvanceAfterCelebration}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 active:scale-95 text-white py-4 rounded-xl font-bold text-xl transition-all shadow-lg"
            >
              Keep going! →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Stuck ────────────────────────────────────────────────────────────────────

  if (phase === "stuck" && currentQuestion) {
    const skill = getReadingSkillById(currentQuestion.skill_id);
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <ReadingSessionHeader profile={profile} onReset={resetSkillTree} sessionCorrect={sessionCorrect} sessionAttempts={sessionAttempts} />
        <StuckScreen
          skillTitle={skill?.title ?? "this skill"}
          subject="reading"
          attemptCount={stuckAttemptCount}
          onMarkDone={handleMarkDone}
          onKeepTrying={handleKeepTrying}
        />
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
        <h2 className="text-gray-900 font-semibold text-base sm:text-lg truncate">
          Ruby Reading
          {profile && <span className="text-gray-400 font-normal"> · {profile.name}</span>}
        </h2>
        {skill && (
          <p className="text-gray-500 text-sm truncate">
            Level {profile?.current_level} · {skill.title}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {sessionAttempts > 0 && (
          <div className="text-right">
            <p className={`text-base font-semibold ${accuracy >= 70 ? "text-green-600" : "text-orange-500"}`}>
              {accuracy}%
            </p>
            <p className="text-sm text-gray-400 leading-none">accuracy</p>
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
  const [selectedAudioChoice, setSelectedAudioChoice] = useState<string | null>(null);
  const [playingChoiceValue, setPlayingChoiceValue] = useState<string | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  const cancelChoiceAudioRef = useRef<(() => void) | null>(null);

  // Prefetch TTS as soon as the question mounts so audio is ready when user taps play
  useEffect(() => {
    if (question.question) prefetchTTS(question.question);
    // Prefetch displayWord in lowercase — matches what togglePlay sends to TTS
    if (question.displayWord) prefetchTTS(question.displayWord.toLowerCase());
    question.audioChoices?.forEach((c) => { if (c.speech) prefetchTTS(c.speech); });
  }, [question.id]);

  const isAudioTap = !!(question.audioChoices && question.audioChoices.length > 0);

  const config = templateConfig[question.template] || templateConfig.oral;

  // ── TTS: same speakNaturally engine as ChatInterface ─────────────────────────
  const togglePlay = (text: string) => {
    if (playing) {
      cancelSpeechRef.current?.();
      cancelSpeechRef.current = null;
      setPlaying(false);
      return;
    }
    // Stop any choice audio that may be playing before starting question playback
    cancelChoiceAudioRef.current?.();
    cancelChoiceAudioRef.current = null;
    setPlayingChoiceValue(null);
    cancelSpeechRef.current = speakNaturally(
      text,
      () => setPlaying(true),
      () => { setPlaying(false); cancelSpeechRef.current = null; }
    );
  };

  const handleSubmit = () => {
    if (!answer.trim() || submitting) return;
    cancelSpeechRef.current?.();
    setPlaying(false);
    setSubmitting(true);
    onSubmit(answer, "", usedHint);
    setSubmitting(false);
  };

  const handleSelfReport = (correct: boolean) => {
    if (submitting) return;
    cancelSpeechRef.current?.();
    setPlaying(false);
    setSubmitting(true);
    onSubmit(correct ? question.expected_answer : "", "", usedHint);
    setSubmitting(false);
  };

  const handleAudioChoiceTap = (choice: { label: string; speech: string; correct: boolean }) => {
    cancelSpeechRef.current?.();   // Stop question TTS before playing choice audio
    cancelSpeechRef.current = null;
    setPlaying(false);
    cancelChoiceAudioRef.current?.();
    setSelectedAudioChoice(choice.label);
    setPlayingChoiceValue(choice.label);
    cancelChoiceAudioRef.current = speakNaturally(
      choice.speech,
      () => {},
      () => setPlayingChoiceValue(null)
    );
  };

  const handleAudioChoiceSubmit = () => {
    if (!selectedAudioChoice || submitting) return;
    cancelChoiceAudioRef.current?.();
    setPlayingChoiceValue(null);
    setSubmitting(true);
    onSubmit(selectedAudioChoice, "", usedHint);
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Template badge */}
      <div className={`px-5 py-3 flex items-center gap-2 border-b border-gray-100 ${config.colorClass}`}>
        <span>{config.icon}</span>
        <span className="text-base font-medium">{config.label}</span>
      </div>

      {/* Question text */}
      <div className="px-6 py-6">
        <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap">
          {question.question}
        </p>
        {/* Play/Stop pill — hidden for audio-tap questions (question text contains
            phoneme labels like "SH" that TTS cannot pronounce correctly) */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => togglePlay(question.question)}
            hidden={isAudioTap}
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
              <p className="text-yellow-800 text-base">
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

      {/* Answer input */}
      <div className="px-6 pb-6 space-y-4">

        {/* ── WRITTEN mode (L3 encoding — student types spelling after hearing TTS) ── */}
        {question.template === "written" && question.displayWord ? (
          <>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 text-center">
              <p className="text-xs text-amber-500 font-semibold uppercase tracking-widest mb-2">Listen and type</p>
              <button
                onClick={() => togglePlay(question.displayWord!.toLowerCase())}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-base transition-all active:scale-95 ${
                  playing
                    ? "bg-orange-400 text-white shadow-lg"
                    : "bg-amber-400 hover:bg-amber-500 text-white shadow-md"
                }`}
              >
                {playing ? (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>Stop</>
                ) : (
                  <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Tap to hear the word</>
                )}
              </button>
            </div>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="Type the word here…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={submitting}
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-2xl px-5 py-4 text-xl font-mono text-center outline-none transition-colors disabled:opacity-40"
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Checking...</>
              ) : "Submit →"}
            </button>
          </>
        ) : isAudioTap ? (
          <>
            {/* Large display word (letter, digraph, blend) */}
            {question.displayWord && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 text-center">
                <p className="text-6xl font-bold text-purple-700 tracking-widest">
                  {question.displayWord}
                </p>
              </div>
            )}

            <p className="text-sm text-center text-gray-400 font-medium">
              Tap each word to hear it, then choose the one with the right sound
            </p>

            <div className="grid grid-cols-3 gap-3">
              {question.audioChoices!.map((c) => (
                <button
                  key={c.label}
                  onClick={() => handleAudioChoiceTap(c)}
                  disabled={submitting}
                  className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 font-bold transition-all active:scale-95 ${
                    selectedAudioChoice === c.label
                      ? "bg-purple-500 border-purple-500 text-white shadow-lg scale-105"
                      : playingChoiceValue === c.label
                      ? "bg-purple-50 border-purple-400 text-purple-700"
                      : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {playingChoiceValue === c.label ? (
                    <>
                      <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                      </svg>
                      <span className="font-semibold text-sm text-center leading-tight">{c.label}</span>
                    </>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {selectedAudioChoice && (
              <button
                onClick={handleAudioChoiceSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Checking...</>
                ) : "That's my answer →"}
              </button>
            )}
          </>
        ) : question.template === "reading" ? (
          <>
            {/* ── SELF-REPORT mode (reading template) ── */}
            {/* Word card shown for single-word decoding tasks */}
            {question.displayWord && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center">
                <p className="text-5xl font-bold text-blue-800 tracking-wide">{question.displayWord}</p>
              </div>
            )}

            {/* TTS verify button — lets student hear the word after attempting to read it */}
            {question.displayWord && (
              <button
                onClick={() => togglePlay(question.displayWord!.toLowerCase())}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-medium text-sm transition-all active:scale-95 ${
                  playing
                    ? "bg-orange-50 border-orange-300 text-orange-600"
                    : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {playing ? (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>Stop</>
                ) : (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Hear the word</>
                )}
              </button>
            )}

            <p className="text-center text-sm text-gray-400 font-medium">
              {question.displayWord ? "Read the word, then tap to check yourself" : "Read the passage above, then tell us how you went"}
            </p>

            {/* Self-report buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelfReport(true)}
                disabled={submitting}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-green-50 border-2 border-green-200 text-green-700 font-bold text-base hover:bg-green-100 hover:border-green-400 transition-all active:scale-95 disabled:opacity-40"
              >
                <span className="text-3xl">✓</span>
                <span>Got it!</span>
              </button>
              <button
                onClick={() => handleSelfReport(false)}
                disabled={submitting}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 font-bold text-base hover:bg-red-100 hover:border-red-400 transition-all active:scale-95 disabled:opacity-40"
              >
                <span className="text-3xl">✗</span>
                <span>Need help</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ── TYPED INPUT mode (oral/written without audioChoices) ── */}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Type your answer here…"
              rows={3}
              disabled={submitting}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-2xl px-5 py-4 text-base outline-none transition-colors disabled:opacity-40 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Checking...</>
              ) : "Submit →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const ERROR_LABELS: Record<string, string> = {
  ERR_PHONEME_CONF:  "Sound mix-up",
  ERR_SOUND_RECALL:  "Sound recall",
  ERR_BLEND_FAIL:    "Blending sounds",
  ERR_SOUND_OMIT:    "Missing a sound",
  ERR_SOUND_INSERT:  "Extra sound added",
  ERR_VOWEL_CONF:    "Vowel confusion",
  ERR_ORTHO_GUESS:   "Guessing the word",
  ERR_SIGHT_MISS:    "Sight word",
  ERR_MULTI_BREAK:   "Breaking up words",
  ERR_FLUENCY_HES:   "Reading fluency",
  ERR_MEANING_BLIND: "Reading for meaning",
  ERR_SELF_MON:      "Self-monitoring",
};

function ReadingFeedbackCard({
  result,
  onNext,
  wasReviewCorrect = false,
}: {
  result: ReadingDiagnosticResult;
  onNext: () => void;
  nextLabel?: string;
  language?: string;
  wasReviewCorrect?: boolean;
}) {
  const touchStartY = useRef(0);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const cancelTTSRef = useRef<(() => void) | null>(null);
  const feedbackText = [result.feedback, result.recovery_explanation].filter(Boolean).join(". ");
  const isFirstCorrect = result.is_correct && typeof window !== "undefined" && !sessionStorage.getItem("first_correct_shown");
  if (isFirstCorrect && typeof window !== "undefined") sessionStorage.setItem("first_correct_shown", "1");

  const handlePlay = () => {
    if (ttsPlaying) {
      cancelTTSRef.current?.();
      cancelTTSRef.current = null;
      setTtsPlaying(false);
      return;
    }
    cancelTTSRef.current = speakViaAPI(
      feedbackText,
      () => setTtsPlaying(true),
      () => { setTtsPlaying(false); cancelTTSRef.current = null; }
    );
  };

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
        </div>
      </div>

      {isFirstCorrect && (
        <p className="text-sm font-semibold text-green-700 animate-pulse">Great start! ⭐</p>
      )}
      {wasReviewCorrect && (
        <p className="text-sm font-semibold text-blue-700">You still remember this! 🧠</p>
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-gray-700 text-base leading-relaxed flex-1">{result.feedback}</p>
        {!result.is_correct && (
          <button
            onClick={handlePlay}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors mt-0.5"
            aria-label={ttsPlaying ? "Stop audio" : "Play explanation"}
          >
            {ttsPlaying ? (
              <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Stop</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Play</>
            )}
          </button>
        )}
      </div>

      {!result.is_correct && result.recovery_explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.347-.347a5 5 0 117.072 0z" />
          </svg>
          <p className="text-blue-800 text-base leading-relaxed">{result.recovery_explanation}</p>
        </div>
      )}

      {/* Click / swipe for next */}
      <div
        className="flex flex-col items-center gap-1 pt-2 cursor-pointer select-none"
        onClick={onNext}
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (touchStartY.current - e.changedTouches[0].clientY > 40) onNext();
        }}
      >
        <p className="text-sm text-gray-400 md:hidden">Swipe up for next question</p>
        <p className="text-sm text-gray-400 hidden md:block">Click for next question</p>
        <div className="animate-bounce text-purple-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
