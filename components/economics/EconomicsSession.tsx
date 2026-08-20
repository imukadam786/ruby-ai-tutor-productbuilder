"use client";
import RubyBalance from "@/components/RubyBalance";
import Button from "@/components/ui/Button";
import ChoiceGrid from "@/components/ui/ChoiceGrid";
import { CONCEPT_C } from "@/lib/flags";
import MasteryHeader from "@/components/shared/MasteryHeader";
import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
import RubyLoader from "@/components/RubyLoader";

// EconomicsSession — content-subject session (clone of AccountingSession with a
// narrower dispatcher: no equation-effect / double-entry). Every mechanic is
// tap/choice — no free-text.
//   • The structured mechanics manage their own internal state and call
//     onSubmit with a JSON-stringified payload (parsed server-side by
//     lib/economics-scoring.ts).
//   • The choice-family mechanics (choice/true-false/cloze/sequence/
//     diagram-label/image-match) call onSubmit immediately on tap.
//   • Optional `source` block (text/graph/image/cartoon) renders above the
//     mechanic via components/economics/questions/SourceBlock.

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import economicsTreeData from "@/data/economics-skill-tree.json";
import economicsBankData from "@/data/economics-question-bank.json";
import EduBackground from "@/components/EduBackground";
import FeedbackExplanation from "@/components/shared/FeedbackExplanation";
import FeedbackFooter from "@/components/shared/FeedbackFooter";
import { scoreEconomicsAnswer } from "@/lib/economics-scoring";
import EconomicsSkillTreeView from "./EconomicsSkillTreeView";
import SourceBlock from "./questions/SourceBlock";
import SortBucketsQuestion from "./questions/SortBucketsQuestion";
import HighlightSourceQuestion from "./questions/HighlightSourceQuestion";
import ArgumentBuilderQuestion from "./questions/ArgumentBuilderQuestion";
import ParagraphTemplateQuestion from "./questions/ParagraphTemplateQuestion";
import SourceComparisonQuestion from "./questions/SourceComparisonQuestion";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getDomainForSkill,
  selectQuestion,
  bankQuestionToGenerated,
} from "@/lib/economics-selector";
import { fetchQuestionOrLocal } from "@/lib/offline/fetchQuestionOrLocal";
import {
  getEconomicsUsedRefs,
  getOrCreateEconomicsProfile,
  hydrateEconomicsProfileFromSupabase,
  linkEconomicsProfileToAuth,
  loadEconomicsProfile,
  markEconomicsQuestionUsed,
  markEconomicsSkillInProgress,
  recordEconomicsSkillResult,
  saveEconomicsProfile,
} from "@/lib/economics-student-model";
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
  EconomicsBank,
  EconomicsBankQuestion,
  EconomicsGeneratedQuestion,
  EconomicsSkillTree,
  EconomicsStudentProfile,
  EconomicsSubmitAnswerRequest,
  EconomicsSubmitAnswerResponse,
} from "@/types/economics";

const tree = economicsTreeData as unknown as EconomicsSkillTree;
const bank = economicsBankData as unknown as EconomicsBank;

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

export default function EconomicsSession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<EconomicsGeneratedQuestion | null>(null);
  const [result, setResult] = useState<EconomicsSubmitAnswerResponse | null>(null);
  // Feedback is scored client-side and shown instantly — no "Checking…" wait.
  const [submitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<EconomicsStudentProfile | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [didMasterTopic, setDidMasterTopic] = useState(false);

  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? 10;
      const name = data?.name ?? "Learner";
      if (!loadEconomicsProfile()) {
        const restored = await hydrateEconomicsProfileFromSupabase();
        if (restored) saveEconomicsProfile(restored);
      }
      const p = getOrCreateEconomicsProfile(grade, name);
      void linkEconomicsProfileToAuth(p.id);
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
          subject: "economics",
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
          subject: "economics",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[EconomicsSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[EconomicsSession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(
    async (
      topicId: string,
      currentProfile: EconomicsStudentProfile | null,
      sessionCorrect = 0,
      sessionAttempts = 0,
    ) => {
      setPhase("loading");
      setError(null);
      const used = currentProfile ? getEconomicsUsedRefs(currentProfile, topicId) : [];
      const prior = currentProfile?.skill_mastery[topicId];
      const abilityLevel = contentAbilityLevel(
        (prior?.correct_count ?? 0) + sessionCorrect,
        (prior?.attempt_count ?? 0) + sessionAttempts,
      );
      try {
        const question = await fetchQuestionOrLocal<EconomicsGeneratedQuestion>({
          url: "/api/economics/generate-question",
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
        console.error("[EconomicsSession] generate-question failed:", err);
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
        const updated = markEconomicsSkillInProgress(profile, topicId);
        setProfile(updated);
      }
      trackSessionStarted({
        subject: "economics",
        current_skill_id: topicId,
        current_level: found?.level.id ?? 10,
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
    const target = sessionStorage.getItem("ruby_economics_target_skill");
    if (!target) return;
    deepLinkConsumed.current = true;
    sessionStorage.removeItem("ruby_economics_target_skill");
    if (findSkill(target)) handlePickTopic(target);
  }, [profile, phase, handlePickTopic]);

  // Apply a graded result: record the attempt, update mastery/coverage, and move
  // to feedback (or the mastered screen).
  const finalizeAttempt = useCallback(
    (data: EconomicsSubmitAnswerResponse, q: EconomicsGeneratedQuestion, sId: string) => {
      setResult(data);

      const workingProfile = profile
        ? markEconomicsQuestionUsed(profile, sId, q.question_ref)
        : null;
      if (workingProfile) setProfile(workingProfile);

      const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
      const nextAttempts = attemptCount + 1;
      const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
      setCorrectCount(nextCorrect);
      setAttemptCount(nextAttempts);
      setConsecutiveWrong(nextConsecutiveWrong);

      trackQuestionAnswered({
        subject: "economics",
        skill_id: sId,
        template: q.input_type,
        is_correct: data.is_correct,
        used_hint: false,
        attempt_number: nextAttempts,
        decision: data.is_correct ? "practice" : "reteach",
      });

      const prior = profile?.skill_mastery[sId];
      const cumulativeCorrect = (prior?.correct_count ?? 0) + nextCorrect;
      const cumulativeAttempts = (prior?.attempt_count ?? 0) + nextAttempts;
      const distinctAnswered = workingProfile
        ? new Set(getEconomicsUsedRefs(workingProfile, sId)).size
        : nextAttempts;
      const size = poolSize(sId);
      const required = requiredCount(sId);

      const didMaster = isContentMastered(distinctAnswered, size, cumulativeCorrect, cumulativeAttempts);
      const runOver = didMaster || nextAttempts >= required || distinctAnswered >= size;

      if (runOver) {
        if (profile) {
          const finalProfile = recordEconomicsSkillResult(profile, sId, {
            correct: nextCorrect,
            attempts: nextAttempts,
            mastered: didMaster,
          });
          setProfile(finalProfile);
        }
        setDidMasterTopic(didMaster);
        if (didMaster) {
          trackSkillMastered({
            subject: "economics",
            skill_id: sId,
            level: findSkill(sId)?.level.id ?? 10,
            session_attempt_count: nextAttempts,
            session_correct: nextCorrect,
          });
        }
        trackSessionEnded({
          subject: "economics",
          questions_answered: nextAttempts,
          correct: nextCorrect,
          accuracy: nextAttempts > 0 ? nextCorrect / nextAttempts : 0,
        });
        rewardEffortFloor("economics", sId);
        if (didMaster) rewardSkillMastered("economics", sId);
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
      const { correct, score } = scoreEconomicsAnswer(
        question.input_type,
        rawAnswer,
        { ...question, expected: question.expected_answer } as unknown as EconomicsBankQuestion,
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
      void apiFetch("/api/economics/submit-answer", {
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
        } as EconomicsSubmitAnswerRequest),
      }).catch(() => { /* non-blocking; feedback already shown */ });
    },
    [attemptCount, finalizeAttempt, profile, question, skillId],
  );

  // ─── Render: tree ──────────────────────────────────────────────────────────
  if (phase === "tree") {
    return (
      <EconomicsSkillTreeView
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
      ? Math.min(new Set(getEconomicsUsedRefs(profile, skillId)).size, size)
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
            variant="primary"
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
              distinctAnswered={profile ? new Set(getEconomicsUsedRefs(profile, skillId)).size : 0}
              requiredCount={requiredCount(skillId)}
              correctCount={correctCount}
              attemptCount={attemptCount}
              mastered={profile?.skill_mastery[skillId]?.status === "mastered"}
            />
          )}

          {question && (
            <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-5">
              {/* Optional source block — renders above the mechanic. */}
              {question.source && <SourceBlock source={question.source} />}

              <p className="text-lg sm:text-xl text-[#1a2744] font-medium leading-snug whitespace-pre-line">
                {question.question}
              </p>

              {/* Diagram image for diagram-label / image-match items. */}
              {(question.input_type === "diagram-label" || question.input_type === "image-match") &&
                question.image_refs?.[0] && (
                  <DiagramImage imageKey={question.image_refs[0]} alt={question.question} />
                )}

              {question.context && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 text-sm text-indigo-900">
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

// ─── Diagram image (with webp → png → svg → text fallback) ───────────────────
const ECON_IMAGE_EXTS = ["webp", "png", "svg", "jpg", "jpeg"];

function DiagramImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= ECON_IMAGE_EXTS.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-4 text-center text-sm italic text-indigo-700">
        Graph described in the question above.
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/economics/${imageKey}.${ECON_IMAGE_EXTS[extIdx]}`}
        alt={alt}
        onError={() => setExtIdx((i) => i + 1)}
        className="max-h-80 rounded-2xl border border-indigo-200 bg-white"
      />
    </div>
  );
}

// ─── Answer dispatcher — routes input_type to the right renderer ─────────────

interface AnswerDispatcherProps {
  question: EconomicsGeneratedQuestion;
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

  // ── Argument builder ────────────────────────────────────────────────────────
  if (input_type === "argument-builder" && question.thesis && question.pool && question.pick_n) {
    return (
      <ArgumentBuilderQuestion
        thesis={question.thesis}
        pool={question.pool}
        pickN={question.pick_n}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Paragraph template ──────────────────────────────────────────────────────
  if (input_type === "paragraph-template" && question.prompt && question.template) {
    return (
      <ParagraphTemplateQuestion
        prompt={question.prompt}
        template={question.template}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Source comparison ───────────────────────────────────────────────────────
  if (
    input_type === "source-comparison" &&
    question.source_a &&
    question.source_b &&
    question.statements
  ) {
    return (
      <SourceComparisonQuestion
        sourceA={question.source_a}
        sourceB={question.source_b}
        statements={question.statements}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Option grids (choice / cloze / sequence / diagram-label / image-match) ──
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
            className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-300 rounded-2xl px-5 py-5 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all whitespace-pre-line"
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
