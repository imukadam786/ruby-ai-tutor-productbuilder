import { rewardEffortFloor, rewardSkillMastered } from "@/lib/reward-client";
"use client";

// AccountingSession — clone of LifeSciencesSession with a wider answer
// dispatcher. Key differences from LSC:
//   • No short-response / no free-text — every mechanic is tap/choice.
//   • The 5 new mechanics manage their own internal state and call onSubmit
//     with a JSON-stringified payload (parsed server-side by
//     lib/accounting-scoring.ts).
//   • The reused mechanics (choice/true-false/cloze/sequence/diagram-label
//     /image-match) call onSubmit immediately on tap with the picked option.
//   • Optional `source` block (text/image/map/cartoon + provenance) renders
//     above the mechanic via components/accounting/questions/SourceBlock.

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import historyTreeData from "@/data/accounting-skill-tree.json";
import accountingBankData from "@/data/accounting-question-bank.json";
import EduBackground from "@/components/EduBackground";
import AccountingSkillTreeView from "./AccountingSkillTreeView";
import SourceBlock from "./questions/SourceBlock";
import SortBucketsQuestion from "./questions/SortBucketsQuestion";
import HighlightSourceQuestion from "./questions/HighlightSourceQuestion";
import ArgumentBuilderQuestion from "./questions/ArgumentBuilderQuestion";
import ParagraphTemplateQuestion from "./questions/ParagraphTemplateQuestion";
import SourceComparisonQuestion from "./questions/SourceComparisonQuestion";
import EquationEffectQuestion from "./questions/EquationEffectQuestion";
import DoubleEntryQuestion from "./questions/DoubleEntryQuestion";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getAccountingUsedRefs,
  getOrCreateAccountingProfile,
  hydrateAccountingProfileFromSupabase,
  linkAccountingProfileToAuth,
  loadAccountingProfile,
  markAccountingQuestionUsed,
  markAccountingSkillInProgress,
  recordAccountingSkillResult,
  saveAccountingProfile,
} from "@/lib/accounting-student-model";
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
  AccountingBank,
  AccountingGeneratedQuestion,
  AccountingGenerateQuestionResponse,
  AccountingSkillTree,
  AccountingStudentProfile,
  AccountingSubmitAnswerRequest,
  AccountingSubmitAnswerResponse,
} from "@/types/accounting";

const tree = historyTreeData as unknown as AccountingSkillTree;
const bank = accountingBankData as unknown as AccountingBank;

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

export default function AccountingSession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<AccountingGeneratedQuestion | null>(null);
  const [result, setResult] = useState<AccountingSubmitAnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<AccountingStudentProfile | null>(null);

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
      if (!loadAccountingProfile()) {
        const restored = await hydrateAccountingProfileFromSupabase();
        if (restored) saveAccountingProfile(restored);
      }
      const p = getOrCreateAccountingProfile(grade, name);
      void linkAccountingProfileToAuth(p.id);
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
          subject: "accounting",
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
          subject: "accounting",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[AccountingSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[AccountingSession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(
    async (
      topicId: string,
      currentProfile: AccountingStudentProfile | null,
      sessionCorrect = 0,
      sessionAttempts = 0,
    ) => {
      setPhase("loading");
      setError(null);
      const used = currentProfile ? getAccountingUsedRefs(currentProfile, topicId) : [];
      // Difficulty matching: derive ability from running accuracy (prior
      // recorded totals + this sitting's answers so far).
      const prior = currentProfile?.skill_mastery[topicId];
      const abilityLevel = contentAbilityLevel(
        (prior?.correct_count ?? 0) + sessionCorrect,
        (prior?.attempt_count ?? 0) + sessionAttempts,
      );
      try {
        const res = await apiFetch("/api/accounting/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill_id: topicId,
            used_refs: used,
            ability_level: abilityLevel,
          }),
        });
        if (!res.ok) {
          setError("Could not load a question. Please try again.");
          setPhase("feedback");
          return;
        }
        const data = (await res.json()) as AccountingGenerateQuestionResponse;
        if (!data.question) {
          setError("No more questions on this topic right now.");
          setPhase("feedback");
          return;
        }
        setQuestion(data.question);
        setResult(null);
        setPhase("question");
      } catch (err) {
        console.error("[AccountingSession] generate-question failed:", err);
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
        const updated = markAccountingSkillInProgress(profile, topicId);
        setProfile(updated);
      }
      trackSessionStarted({
        subject: "accounting",
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
    const target = sessionStorage.getItem("ruby_accounting_target_skill");
    if (!target) return;
    deepLinkConsumed.current = true;
    sessionStorage.removeItem("ruby_accounting_target_skill");
    if (findSkill(target)) handlePickTopic(target);
  }, [profile, phase, handlePickTopic]);

  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer.trim()) return;
      setSubmitting(true);
      try {
        const payload: AccountingSubmitAnswerRequest = {
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
        };
        const res = await apiFetch("/api/accounting/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // 429 = shared daily limit reached; apiFetch already surfaced the
          // upgrade modal, so don't also flash an inline error.
          if (res.status !== 429) setError("Could not check your answer. Please try again.");
          return;
        }
        const data = (await res.json()) as AccountingSubmitAnswerResponse;
        setResult(data);

        // Mark this question used and work from the updated profile so the
        // coverage count includes the answer we just took.
        const workingProfile = profile
          ? markAccountingQuestionUsed(profile, skillId, question.question_ref)
          : null;
        if (workingProfile) setProfile(workingProfile);

        const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);
        setConsecutiveWrong(nextConsecutiveWrong);

        trackQuestionAnswered({
          subject: "accounting",
          skill_id: skillId,
          template: question.input_type,
          is_correct: data.is_correct,
          used_hint: false,
          attempt_number: nextAttempts,
          decision: data.is_correct ? "practice" : "reteach",
        });

        // ── Cumulative mastery check ────────────────────────────────────────
        // Coverage + accuracy are measured across all sittings, not just this
        // run. Prior totals live in skill_mastery; this run's deltas are the
        // session counters. Distinct coverage is deduped from used_questions.
        const prior = profile?.skill_mastery[skillId];
        const cumulativeCorrect = (prior?.correct_count ?? 0) + nextCorrect;
        const cumulativeAttempts = (prior?.attempt_count ?? 0) + nextAttempts;
        const distinctAnswered = workingProfile
          ? new Set(getAccountingUsedRefs(workingProfile, skillId)).size
          : nextAttempts;
        const size = poolSize(skillId);
        const required = requiredCount(skillId);

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
            const finalProfile = recordAccountingSkillResult(profile, skillId, {
              correct: nextCorrect,
              attempts: nextAttempts,
              mastered: didMaster,
            });
            setProfile(finalProfile);
          }
          setDidMasterTopic(didMaster);
          if (didMaster) {
            trackSkillMastered({
              subject: "accounting",
              skill_id: skillId,
              level: findSkill(skillId)?.level.id ?? 10,
              session_attempt_count: nextAttempts,
              session_correct: nextCorrect,
            });
          }
          trackSessionEnded({
            subject: "accounting",
            questions_answered: nextAttempts,
            correct: nextCorrect,
            accuracy: nextAttempts > 0 ? nextCorrect / nextAttempts : 0,
          });
          // Rubies: effort floor for finishing the topic run + first-time mastery bonus.
          rewardEffortFloor("accounting", skillId);
          if (didMaster) rewardSkillMastered("accounting", skillId, profile?.id);
          void persistReport(skillId, nextCorrect, nextAttempts, didMaster);
          setPhase("mastered");
        } else {
          setPhase("feedback");
        }
      } catch (err) {
        console.error("[AccountingSession] submit-answer failed:", err);
        setError("Could not check your answer. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [attemptCount, consecutiveWrong, correctCount, persistReport, profile, question, skillId],
  );

  // ─── Render: tree ──────────────────────────────────────────────────────────
  if (phase === "tree") {
    return (
      <AccountingSkillTreeView
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
      ? Math.min(new Set(getAccountingUsedRefs(profile, skillId)).size, size)
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
          <button
            onClick={() => {
              setSkillId(null);
              setQuestion(null);
              setResult(null);
              setPhase("tree");
            }}
            className="w-full py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base"
          >
            Pick another topic
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: loading ───────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5]">
        <EduBackground />
        <p className="relative text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  // ─── Render: question / feedback ───────────────────────────────────────────
  const showRecoveryHint = consecutiveWrong >= 2 && skillId !== null;
  const recoveryHint = showRecoveryHint ? findSkill(skillId!)?.skill.recovery_strategy ?? null : null;

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
          </div>

          {skillId && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                  Master this topic
                </span>
                <span className="text-sm font-semibold text-emerald-700">
                  Q {Math.min(attemptCount + 1, requiredCount(skillId))} of {requiredCount(skillId)} · ⭐ {correctCount}
                </span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${Math.round(
                      (Math.min(attemptCount, requiredCount(skillId)) /
                        Math.max(requiredCount(skillId), 1)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-emerald-700 mt-1.5">
                Master: {requiredCount(skillId)} questions at {Math.round(ACCURACY_TARGET * 100)}%
              </p>
            </div>
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
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-sm text-emerald-900">
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
                <div
                  className={`rounded-2xl p-5 ${
                    result.is_correct
                      ? "bg-green-50 border border-green-200"
                      : "bg-rose-50 border border-rose-200"
                  }`}
                >
                  <p
                    className={`text-lg font-bold ${
                      result.is_correct ? "text-green-700" : "text-rose-700"
                    }`}
                  >
                    {result.is_correct ? "✓ " : "✗ "}
                    {result.feedback}
                  </p>
                  {!result.is_correct && result.score > 0 && (
                    <p className="text-xs text-rose-700 mt-1">
                      Partial credit: {Math.round(result.score * 100)}%
                    </p>
                  )}
                  {result.memo && (
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{result.memo}</p>
                  )}
                  {recoveryHint && !result.is_correct && (
                    <p className="text-sm text-emerald-700 mt-3 bg-emerald-100 rounded-xl px-3 py-2">
                      💡 {recoveryHint}
                    </p>
                  )}
                </div>
              )}

              {phase === "feedback" && (
                <button
                  onClick={() => skillId && loadNextQuestion(skillId, profile, correctCount, attemptCount)}
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-bold text-lg"
                >
                  Next question →
                </button>
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

// ─── Diagram image (with png → svg → text fallback) ─────────────────────────
const ACCT_IMAGE_EXTS = ["png", "svg", "jpg", "jpeg", "webp"];

function DiagramImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= ACCT_IMAGE_EXTS.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 text-center text-sm italic text-emerald-700">
        Diagram described in the question above.
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/accounting/${imageKey}.${ACCT_IMAGE_EXTS[extIdx]}`}
        alt={alt}
        onError={() => setExtIdx((i) => i + 1)}
        className="max-h-80 rounded-2xl border border-emerald-200 bg-white"
      />
    </div>
  );
}

// ─── Answer dispatcher — routes input_type to the right renderer ─────────────

interface AnswerDispatcherProps {
  question: AccountingGeneratedQuestion;
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

  // ── Equation effect (accounting equation) ──────────────────────────────────
  if (input_type === "equation-effect") {
    const columns =
      question.columns && question.columns.length > 0
        ? question.columns
        : [
            { id: "A", label: "Assets" },
            { id: "OE", label: "Owner's equity" },
            { id: "L", label: "Liabilities" },
          ];
    return (
      <EquationEffectQuestion columns={columns} submitting={submitting} onSubmit={onSubmit} />
    );
  }

  // ── Double entry (debit / credit) ───────────────────────────────────────────
  if (input_type === "double-entry" && question.accounts && question.accounts.length > 0) {
    return (
      <DoubleEntryQuestion
        accounts={question.accounts}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Option grids (choice / cloze / sequence / diagram-label / image-match) ──
  if (options && options.length > 0) {
    const wide = options.some((o) => o.length > 40);
    const gridCols = wide ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
    return (
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl px-5 py-5 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all whitespace-pre-line"
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
