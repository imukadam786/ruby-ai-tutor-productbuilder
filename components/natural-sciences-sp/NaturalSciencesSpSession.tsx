"use client";
import RubyBalance from "@/components/RubyBalance";
import MasteryHeader from "@/components/shared/MasteryHeader";
import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
import RubyLoader from "@/components/RubyLoader";
import Button from "@/components/ui/Button";
import ChoiceGrid from "@/components/ui/ChoiceGrid";
import { CONCEPT_C } from "@/lib/flags";

// NaturalSciencesSpSession — clone of GeographySession for the Natural Sciences
// Senior-Phase bank. Key points:
//   • No free-text — every mechanic is tap/choice.
//   • Option-driven types (choice / true-false / cloze / scenario / match /
//     diagram-label / data-interpret) call onSubmit immediately on tap.
//   • Structured types manage their own state and call onSubmit with a
//     JSON-stringified payload (parsed server-side by
//     lib/natural-sciences-sp-scoring.ts):
//       - sort-buckets → { itemId: bucketId }
//       - sequence     → [orderedItemId, …]
//       - highlight-source → [selectedPhrase, …]
//   • data-interpret renders a `data.table` above the option grid.
//   • diagram-label renders an image (with a graceful placeholder when the
//     image for the image_ref does not exist yet).
//
// The generic mechanic components (DataInterpretBlock, SortBucketsQuestion,
// SequenceQuestion, HighlightSourceQuestion) are reused verbatim from the
// Geography / History subjects — props are structurally identical, so a copy
// would be dead code.

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import naturalSciencesSpTreeData from "@/data/natural-sciences-sp-skill-tree.json";
import naturalSciencesSpBankData from "@/data/natural-sciences-sp-question-bank.json";
import EduBackground from "@/components/EduBackground";
import FeedbackExplanation from "@/components/shared/FeedbackExplanation";
import FeedbackFooter from "@/components/shared/FeedbackFooter";
import { scoreNaturalSciencesSpAnswer } from "@/lib/natural-sciences-sp-scoring";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/natural-sciences-sp-selector";
import { fetchQuestionOrLocal } from "@/lib/offline/fetchQuestionOrLocal";
import NaturalSciencesSpSkillTreeView from "./NaturalSciencesSpSkillTreeView";
import { DataInterpretBlock } from "@/components/geography/DataInterpretBlock";
import SortBucketsQuestion from "@/components/geography/SortBucketsQuestion";
import SequenceQuestion from "@/components/geography/SequenceQuestion";
import HighlightSourceQuestion from "@/components/history/questions/HighlightSourceQuestion";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getNaturalSciencesSpUsedRefs,
  getOrCreateNaturalSciencesSpProfile,
  hydrateNaturalSciencesSpProfileFromSupabase,
  linkNaturalSciencesSpProfileToAuth,
  loadNaturalSciencesSpProfile,
  markNaturalSciencesSpQuestionUsed,
  markNaturalSciencesSpSkillInProgress,
  recordNaturalSciencesSpSkillResult,
  saveNaturalSciencesSpProfile,
} from "@/lib/natural-sciences-sp-student-model";
import {
  trackQuestionAnswered,
  trackSessionStarted,
  trackSessionEnded,
  trackSkillMastered,
} from "@/lib/analytics";
import {
  ACCURACY_TARGET,
  contentAbilityLevel,
  isContentMastered,
  requiredCoverageCount,
} from "@/lib/content-mastery";
import type {
  NaturalSciencesSpBank,
  NaturalSciencesSpBankQuestion,
  NaturalSciencesSpGeneratedQuestion,
  NaturalSciencesSpSkillTree,
  NaturalSciencesSpStudentProfile,
  NaturalSciencesSpSubmitAnswerRequest,
  NaturalSciencesSpSubmitAnswerResponse,
} from "@/types/natural-sciences-sp";

const tree = naturalSciencesSpTreeData as unknown as NaturalSciencesSpSkillTree;
const bank = naturalSciencesSpBankData as unknown as NaturalSciencesSpBank;

// Default grade when onboarding has not yet captured one — Senior Phase starts
// at Grade 7.
const DEFAULT_GRADE = 7;

// Total distinct questions authored for a topic — the coverage denominator.
function poolSize(skillId: string): number {
  return bank.topics[skillId]?.questions.length ?? 0;
}

// Distinct questions the student must answer to master this topic
// (80% of the pool, capped at 20 — see lib/content-mastery.ts).
function requiredCount(skillId: string): number {
  return requiredCoverageCount(poolSize(skillId));
}

function findSkill(skillId: string) {
  for (const level of tree.levels) {
    for (const tier of level.tiers) {
      const found = tier.atomic_skills.find((s) => s.id === skillId);
      if (found) return { skill: found, level, tier };
    }
  }
  return null;
}

type Phase = "tree" | "loading" | "question" | "feedback" | "mastered";

export default function NaturalSciencesSpSession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<NaturalSciencesSpGeneratedQuestion | null>(null);
  const [result, setResult] = useState<NaturalSciencesSpSubmitAnswerResponse | null>(null);
  // Feedback is scored client-side and shown instantly — no "Checking…" wait.
  const [submitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<NaturalSciencesSpStudentProfile | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [didMasterTopic, setDidMasterTopic] = useState(false);

  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? DEFAULT_GRADE;
      const name = data?.name ?? "Learner";
      if (!loadNaturalSciencesSpProfile()) {
        const restored = await hydrateNaturalSciencesSpProfileFromSupabase();
        if (restored) saveNaturalSciencesSpProfile(restored);
      }
      const p = getOrCreateNaturalSciencesSpProfile(grade, name);
      void linkNaturalSciencesSpProfileToAuth(p.id);
      if (!cancelled) setProfile(p);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistReport = useCallback(
    async (topicId: string, correct: number, attempts: number, didMaster: boolean) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        const found = findSkill(topicId);
        const accuracy = attempts > 0 ? correct / attempts : 0;
        const inputData = {
          subject: "natural-sciences-sp",
          topic_id: topicId,
          topic_title: found?.skill.title ?? topicId,
          grade: found?.level.grade ?? null,
          correct_count: correct,
          attempt_count: attempts,
          accuracy,
          target_item_count: requiredCount(topicId),
          pass_threshold: ACCURACY_TARGET,
          mastered: didMaster,
          duration_ms: Date.now() - sessionStartRef.current,
        };
        const contentData = {
          summary: didMaster
            ? `Mastered "${found?.skill.title ?? topicId}" with ${correct}/${attempts} correct.`
            : `Completed "${found?.skill.title ?? topicId}" with ${correct}/${attempts} correct.`,
          topic_id: topicId,
        };
        const { error: reportError } = await supabase.from("student_reports").insert({
          user_id: user.id,
          subject: "natural-sciences-sp",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[NaturalSciencesSpSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[NaturalSciencesSpSession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(
    async (
      topicId: string,
      currentProfile: NaturalSciencesSpStudentProfile | null,
      sessionCorrect = 0,
      sessionAttempts = 0,
    ) => {
      setPhase("loading");
      setError(null);
      const used = currentProfile ? getNaturalSciencesSpUsedRefs(currentProfile, topicId) : [];
      // Difficulty matching: derive ability from running accuracy (prior
      // recorded totals + this sitting's answers so far).
      const prior = currentProfile?.skill_mastery[topicId];
      const abilityLevel = contentAbilityLevel(
        (prior?.correct_count ?? 0) + sessionCorrect,
        (prior?.attempt_count ?? 0) + sessionAttempts,
      );
      try {
        const question = await fetchQuestionOrLocal<NaturalSciencesSpGeneratedQuestion>({
          url: "/api/natural-sciences-sp/generate-question",
          body: {
            skill_id: topicId,
            used_refs: used,
            ability_level: abilityLevel,
          },
          localSelect: () => {
            const domainId = getDomainForSkill(topicId);
            const bankQ = domainId
              ? selectQuestion(domainId, used, false, topicId, abilityLevel)
              : null;
            return bankQ ? bankQuestionToGenerated(bankQ, topicId) : null;
          },
        });
        if (!question) {
          setError("No more questions on this topic right now.");
          setPhase("feedback");
          return;
        }
        setQuestion(question);
        setResult(null);
        setPhase("question");
      } catch (err) {
        console.error("[NaturalSciencesSpSession] generate-question failed:", err);
        setError("Could not load a question. Please try again.");
        setPhase("feedback");
      }
    },
    [],
  );

  const handlePickTopic = useCallback(
    (topicId: string) => {
      const found = findSkill(topicId);
      setSkillId(topicId);
      setCorrectCount(0);
      setAttemptCount(0);
      setConsecutiveWrong(0);
      setDidMasterTopic(false);
      sessionStartRef.current = Date.now();
      if (profile) {
        const updated = markNaturalSciencesSpSkillInProgress(profile, topicId);
        setProfile(updated);
      }
      trackSessionStarted({
        subject: "natural-sciences-sp",
        current_skill_id: topicId,
        current_level: found?.level.id ?? DEFAULT_GRADE,
      });
      void loadNextQuestion(topicId, profile);
    },
    [loadNextQuestion, profile],
  );

  // Deep-link from the Subjects hub: a tapped topic is stashed in sessionStorage,
  // so open it directly once the profile is ready — skipping the topic picker.
  const deepLinkConsumed = useRef(false);
  useEffect(() => {
    if (deepLinkConsumed.current || !profile || phase !== "tree") return;
    if (typeof window === "undefined") return;
    const target = sessionStorage.getItem("ruby_natural_sciences_sp_target_skill");
    if (!target) return;
    deepLinkConsumed.current = true;
    sessionStorage.removeItem("ruby_natural_sciences_sp_target_skill");
    if (findSkill(target)) handlePickTopic(target);
  }, [profile, phase, handlePickTopic]);

  // Apply a graded result: record the attempt, update mastery/coverage, and move
  // to feedback (or the mastered screen).
  const finalizeAttempt = useCallback(
    (data: NaturalSciencesSpSubmitAnswerResponse, q: NaturalSciencesSpGeneratedQuestion, sId: string) => {
      setResult(data);

      // Mark this question used and work from the updated profile so the
      // coverage count includes the answer we just took.
      const workingProfile = profile
        ? markNaturalSciencesSpQuestionUsed(profile, sId, q.question_ref)
        : null;
      if (workingProfile) setProfile(workingProfile);

      const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
      const nextAttempts = attemptCount + 1;
      const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
      setCorrectCount(nextCorrect);
      setAttemptCount(nextAttempts);
      setConsecutiveWrong(nextConsecutiveWrong);

      trackQuestionAnswered({
        subject: "natural-sciences-sp",
        skill_id: sId,
        template: q.input_type,
        is_correct: data.is_correct,
        used_hint: false,
        attempt_number: nextAttempts,
        decision: data.is_correct ? "practice" : "reteach",
      });

      // ── Cumulative mastery check ────────────────────────────────────────
      // Coverage + accuracy are measured across all sittings, not just this
      // run. Prior totals live in skill_mastery; this run's deltas are the
      // session counters. Distinct coverage is deduped from used_questions.
      const prior = profile?.skill_mastery[sId];
      const cumulativeCorrect = (prior?.correct_count ?? 0) + nextCorrect;
      const cumulativeAttempts = (prior?.attempt_count ?? 0) + nextAttempts;
      const distinctAnswered = workingProfile
        ? new Set(getNaturalSciencesSpUsedRefs(workingProfile, sId)).size
        : nextAttempts;
      const size = poolSize(sId);
      const required = requiredCount(sId);

      const didMaster = isContentMastered(
        distinctAnswered,
        size,
        cumulativeCorrect,
        cumulativeAttempts,
      );

      // End the run when the topic is mastered, when this sitting has covered
      // a full batch, or when the pool is exhausted — otherwise keep going.
      const runOver =
        didMaster || nextAttempts >= required || distinctAnswered >= size;

      if (runOver) {
        if (profile) {
          const finalProfile = recordNaturalSciencesSpSkillResult(profile, sId, {
            correct: nextCorrect,
            attempts: nextAttempts,
            mastered: didMaster,
          });
          setProfile(finalProfile);
        }
        setDidMasterTopic(didMaster);
        if (didMaster) {
          trackSkillMastered({
            subject: "natural-sciences-sp",
            skill_id: sId,
            level: findSkill(sId)?.level.id ?? DEFAULT_GRADE,
            session_attempt_count: nextAttempts,
            session_correct: nextCorrect,
          });
        }
        trackSessionEnded({
          subject: "natural-sciences-sp",
          questions_answered: nextAttempts,
          correct: nextCorrect,
          accuracy: nextAttempts > 0 ? nextCorrect / nextAttempts : 0,
        });
        // Rubies: effort floor for finishing the topic run + first-time mastery bonus.
        rewardEffortFloor("natural-sciences-sp", sId);
        if (didMaster) rewardSkillMastered("natural-sciences-sp", sId);
        void persistReport(sId, nextCorrect, nextAttempts, didMaster);
        setPhase("mastered");
      } else {
        setPhase("feedback");
      }
    },
    [attemptCount, consecutiveWrong, correctCount, persistReport, profile],
  );

  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer.trim()) return;

      // Instant: score client-side (deterministic; the scorer's fields all ship
      // with the question). The server call runs in the background for usage
      // metering. The bank scorer reads `expected`, the client question carries
      // `expected_answer` — bridge that one field name.
      const { correct, score } = scoreNaturalSciencesSpAnswer(
        question.input_type,
        rawAnswer,
        { ...question, expected: question.expected_answer } as unknown as NaturalSciencesSpBankQuestion,
      );
      finalizeAttempt(
        {
          is_correct: correct,
          score,
          error_signals: [],
          feedback: correct ? "Correct." : "Not quite — let's look at this.",
          memo: question.memo ?? "",
          mastery_update: {
            skill_id: skillId,
            new_status: "in_progress",
            correct_count: correct ? 1 : 0,
            attempt_count: 1,
          },
          next_action: "continue_skill",
        },
        question,
        skillId,
      );
      // Background: record against the daily usage cap (may 429 → upgrade modal).
      void apiFetch("/api/natural-sciences-sp/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: profile?.id ?? "local",
          question_id: question.id,
          skill_id: skillId,
          question_ref: question.question_ref,
          input_type: question.input_type,
          question: question.question,
          student_answer: rawAnswer,
          expected_answer: question.expected_answer,
          attempt_number: attemptCount + 1,
          used_hint: false,
        } as NaturalSciencesSpSubmitAnswerRequest),
      }).catch(() => { /* non-blocking; feedback already shown */ });
    },
    [attemptCount, finalizeAttempt, profile, question, skillId],
  );

  // ─── Render: tree ──────────────────────────────────────────────────────────
  if (phase === "tree") {
    return (
      <NaturalSciencesSpSkillTreeView
        onPickSkill={handlePickTopic}
        profile={profile}
        onBack={onBack}
      />
    );
  }

  // ─── Render: end-of-topic ─────────────────────────────────────────────────
  if (phase === "mastered" && skillId) {
    const skill = findSkill(skillId)?.skill;
    const m = profile?.skill_mastery[skillId];
    const cumAccuracy = m && m.attempt_count > 0 ? m.correct_count / m.attempt_count : 0;
    const size = poolSize(skillId);
    const required = requiredCount(skillId);
    const distinct = profile
      ? Math.min(new Set(getNaturalSciencesSpUsedRefs(profile, skillId)).size, size)
      : 0;
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5] p-6">
        <EduBackground />
        <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-6xl">{didMasterTopic ? "🎉" : "💪"}</div>
          <h2 className="text-2xl font-bold text-[#1a2744]">
            {didMasterTopic ? "Topic mastered" : "Keep going"}
          </h2>
          <p className="text-gray-600 text-base">
            {didMasterTopic ? (
              <>You mastered <span className="font-semibold">{skill?.title ?? "this topic"}</span> — {Math.round(cumAccuracy * 100)}% correct overall.</>
            ) : (
              <>You&apos;ve answered <span className="font-semibold">{distinct} of {required}</span> questions on {skill?.title ?? "this topic"}. Master it by reaching {required} at {Math.round(ACCURACY_TARGET * 100)}% correct.</>
            )}
          </p>
          <p className="text-sm text-gray-500">{correctCount} of {attemptCount} correct this round.</p>
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={() => {
              setSkillId(null);
              setQuestion(null);
              setResult(null);
              setPhase("tree");
            }}
          >
            Pick another topic
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render: loading ───────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5]">
        <EduBackground />
        <RubyLoader className="relative" label="Loading…" />
      </div>
    );
  }

  // ─── Render: question / feedback ───────────────────────────────────────────

  return (
    <div className="relative flex flex-col h-full bg-[#F4F4F5]">
      <EduBackground />
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-4 pb-12 w-full space-y-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSkillId(null);
                setQuestion(null);
                setResult(null);
                setPhase("tree");
              }}
              className="text-sm text-[#1a2744] font-semibold underline decoration-2 underline-offset-4"
            >
              ← Topics
            </button>
            <span className="hidden md:inline-flex flex-shrink-0"><RubyBalance theme="light" size="lg" /></span>
          </div>

          {skillId && (
            <MasteryHeader
              title={findSkill(skillId)?.skill?.title ?? "Master this topic"}
              distinctAnswered={profile ? new Set(getNaturalSciencesSpUsedRefs(profile, skillId)).size : 0}
              requiredCount={requiredCount(skillId)}
              correctCount={correctCount}
              attemptCount={attemptCount}
              mastered={profile?.skill_mastery[skillId]?.status === "mastered"}
            />
          )}

          {question && (
            <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
              <p className="text-lg sm:text-xl text-[#1a2744] font-medium leading-snug whitespace-pre-line">
                {question.question}
              </p>

              {/* Diagram image for diagram-label items (graceful placeholder
                  when the image_ref does not exist yet). */}
              {question.input_type === "diagram-label" && question.image_refs?.[0] && (
                <DiagramImage imageKey={question.image_refs[0]} alt={question.question} />
              )}

              {/* Inline data table for data-interpret items. */}
              {question.input_type === "data-interpret" && question.data && (
                <DataInterpretBlock data={question.data} />
              )}

              {question.context && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-sm text-rose-900">
                  {question.context}
                </div>
              )}

              {phase === "question" && (
                <div className="relative">
                  <div
                    className={
                      submitting
                        ? "opacity-40 pointer-events-none transition-opacity"
                        : "transition-opacity"
                    }
                  >
                    <AnswerDispatcher
                      question={question}
                      submitting={submitting}
                      onSubmit={handleSubmit}
                    />
                  </div>
                  {submitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 shadow text-[#1a2744] font-semibold text-sm">
                        <span className="w-4 h-4 border-2 border-[#BE1832] border-t-transparent rounded-full animate-spin" />
                        Checking…
                      </span>
                    </div>
                  )}
                </div>
              )}

              {phase === "feedback" && result && (
                <FeedbackExplanation
                  isCorrect={result.is_correct}
                  note={result.is_correct ? result.memo : undefined}
                  whyOverride={result.is_correct ? undefined : result.memo}
                  footer={
                <FeedbackFooter
                  isCorrect={result.is_correct}
                  onNext={() => skillId && loadNextQuestion(skillId, profile, correctCount, attemptCount)}
                  onRetry={() => { setResult(null); setError(null); setPhase("question"); }}
                />
              }
                />
              )}

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Diagram image (with png → svg → jpg → webp → text fallback) ─────────────
const NSSP_IMAGE_EXTS = ["png", "svg", "jpg", "jpeg", "webp"];

function DiagramImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= NSSP_IMAGE_EXTS.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50 p-4 text-center text-sm italic text-rose-700">
        Diagram described in the question above.
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/natural-sciences-sp/${imageKey}.${NSSP_IMAGE_EXTS[extIdx]}`}
        alt={alt}
        onError={() => setExtIdx((i) => i + 1)}
        className="max-h-80 rounded-2xl border border-rose-200 bg-white"
      />
    </div>
  );
}

// ─── Answer dispatcher — routes input_type to the right renderer ─────────────

interface AnswerDispatcherProps {
  question: NaturalSciencesSpGeneratedQuestion;
  submitting: boolean;
  onSubmit: (rawAnswer: string) => void;
}

function AnswerDispatcher({ question, submitting, onSubmit }: AnswerDispatcherProps) {
  const { input_type, options } = question;

  // ── True / false ────────────────────────────────────────────────────────────
  if (input_type === "true-false" && options) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isTrue = opt.toLowerCase() === "true";
          return (
            <button
              key={opt}
              disabled={submitting}
              onClick={() => onSubmit(opt)}
              className={`rounded-2xl px-5 py-6 flex items-center justify-center gap-2 text-xl font-bold active:scale-95 transition-all border-2 ${
                isTrue
                  ? "bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
                  : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800"
              }`}
            >
              {isTrue ? "✓ " : "✗ "}{opt}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Sort buckets ────────────────────────────────────────────────────────────
  if (input_type === "sort-buckets" && question.buckets && question.items) {
    return (
      <SortBucketsQuestion
        buckets={question.buckets}
        items={question.items}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Sequence (order the steps) ──────────────────────────────────────────────
  if (input_type === "sequence" && question.items && question.items.length > 0) {
    return (
      <SequenceQuestion
        items={question.items}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Highlight source ────────────────────────────────────────────────────────
  if (input_type === "highlight-source" && question.source_text && question.targets) {
    return (
      <HighlightSourceQuestion
        sourceText={question.source_text}
        task={question.task ?? "Tap the phrases that match the task."}
        targets={question.targets}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Option grids (choice / cloze / scenario / match / diagram-label /
  //    data-interpret) ─────────────────────────────────────────────────────────
  if (options && options.length > 0) {
    if (CONCEPT_C) return <ChoiceGrid options={options} submitting={submitting} onSubmit={onSubmit} />;
    const wide = options.some((o) => o.length > 40);
    const gridCols = wide ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
    return (
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-300 rounded-2xl px-5 py-5 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all whitespace-pre-line"
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  // ── Last-resort fallback ────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
      This question is missing its options. Skip to the next one.
    </div>
  );
}
