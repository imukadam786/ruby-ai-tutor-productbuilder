"use client";

// BusinessStudiesSession — clone of LifeSciencesSession with a wider answer
// dispatcher. Key differences from LSC:
//   • No short-response / no free-text — every mechanic is tap/choice.
//   • The 5 new mechanics manage their own internal state and call onSubmit
//     with a JSON-stringified payload (parsed server-side by
//     lib/business-studies-scoring.ts).
//   • The reused mechanics (choice/true-false/cloze/sequence/diagram-label
//     /image-match) call onSubmit immediately on tap with the picked option.
//   • Optional `source` block (text/image/map/cartoon + provenance) renders
//     above the mechanic via components/business-studies/questions/SourceBlock.

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";
import historyTreeData from "@/data/business-studies-skill-tree.json";
import historyBankData from "@/data/business-studies-question-bank.json";
import EduBackground from "@/components/EduBackground";
import BusinessStudiesSkillTreeView from "./BusinessStudiesSkillTreeView";
import SourceBlock from "./questions/SourceBlock";
import SortBucketsQuestion from "./questions/SortBucketsQuestion";
import HighlightSourceQuestion from "./questions/HighlightSourceQuestion";
import ArgumentBuilderQuestion from "./questions/ArgumentBuilderQuestion";
import ParagraphTemplateQuestion from "./questions/ParagraphTemplateQuestion";
import SourceComparisonQuestion from "./questions/SourceComparisonQuestion";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import {
  getBusinessStudiesUsedRefs,
  getOrCreateBusinessStudiesProfile,
  hydrateBusinessStudiesProfileFromSupabase,
  linkBusinessStudiesProfileToAuth,
  loadBusinessStudiesProfile,
  markBusinessStudiesQuestionUsed,
  markBusinessStudiesSkillInProgress,
  recordBusinessStudiesSkillResult,
  saveBusinessStudiesProfile,
} from "@/lib/business-studies-student-model";
import {
  trackQuestionAnswered,
  trackSessionStarted,
  trackSessionEnded,
  trackSkillMastered,
} from "@/lib/analytics";
import type {
  BusinessStudiesBank,
  BusinessStudiesGeneratedQuestion,
  BusinessStudiesGenerateQuestionResponse,
  BusinessStudiesSkillTree,
  BusinessStudiesStudentProfile,
  BusinessStudiesSubmitAnswerRequest,
  BusinessStudiesSubmitAnswerResponse,
} from "@/types/business-studies";

const tree = historyTreeData as unknown as BusinessStudiesSkillTree;
const bank = historyBankData as unknown as BusinessStudiesBank;

function targetItemCount(skillId: string): number {
  const topic = bank.topics[skillId];
  if (topic) return topic.target_item_count ?? topic.questions.length;
  return 20;
}

function passThreshold(skillId: string): number {
  return bank.topics[skillId]?.pass_threshold ?? 0.6;
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

export default function BusinessStudiesSession({ onBack }: { onBack?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("tree");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<BusinessStudiesGeneratedQuestion | null>(null);
  const [result, setResult] = useState<BusinessStudiesSubmitAnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BusinessStudiesStudentProfile | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchAuthorisedGrade();
      const grade = data?.grade ?? 10;
      const name = data?.name ?? "Learner";
      if (!loadBusinessStudiesProfile()) {
        const restored = await hydrateBusinessStudiesProfileFromSupabase();
        if (restored) saveBusinessStudiesProfile(restored);
      }
      const p = getOrCreateBusinessStudiesProfile(grade, name);
      void linkBusinessStudiesProfileToAuth(p.id);
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
          subject: "business-studies",
          topic_id: topicId,
          topic_title: found?.skill.title ?? topicId,
          grade: found?.level.grade ?? null,
          correct_count: correct,
          attempt_count: attempts,
          accuracy,
          target_item_count: targetItemCount(topicId),
          pass_threshold: passThreshold(topicId),
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
          subject: "business-studies",
          input_data: inputData,
          content_data: contentData,
          generated_at: new Date().toISOString(),
        });
        if (reportError) console.error("[BusinessStudiesSession] student_reports insert failed:", reportError);
      } catch (err) {
        console.error("[BusinessStudiesSession] persistReport failed:", err);
      }
    },
    [],
  );

  const loadNextQuestion = useCallback(
    async (topicId: string, currentProfile: BusinessStudiesStudentProfile | null) => {
      setPhase("loading");
      setError(null);
      const used = currentProfile ? getBusinessStudiesUsedRefs(currentProfile, topicId) : [];
      try {
        const res = await apiFetch("/api/business-studies/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill_id: topicId, used_refs: used }),
        });
        if (!res.ok) {
          setError("Could not load a question. Please try again.");
          setPhase("feedback");
          return;
        }
        const data = (await res.json()) as BusinessStudiesGenerateQuestionResponse;
        if (!data.question) {
          setError("No more questions on this topic right now.");
          setPhase("feedback");
          return;
        }
        setQuestion(data.question);
        setResult(null);
        setPhase("question");
      } catch (err) {
        console.error("[BusinessStudiesSession] generate-question failed:", err);
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
      sessionStartRef.current = Date.now();
      if (profile) {
        const updated = markBusinessStudiesSkillInProgress(profile, topicId);
        setProfile(updated);
      }
      trackSessionStarted({
        subject: "business-studies",
        current_skill_id: topicId,
        current_level: found?.level.id ?? 10,
      });
      void loadNextQuestion(topicId, profile);
    },
    [loadNextQuestion, profile],
  );

  const handleSubmit = useCallback(
    async (rawAnswer: string) => {
      if (!question || !skillId || !rawAnswer.trim()) return;
      setSubmitting(true);
      try {
        const payload: BusinessStudiesSubmitAnswerRequest = {
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
        const res = await apiFetch("/api/business-studies/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setError("Could not check your answer. Please try again.");
          return;
        }
        const data = (await res.json()) as BusinessStudiesSubmitAnswerResponse;
        setResult(data);

        if (profile) {
          const updated = markBusinessStudiesQuestionUsed(profile, skillId, question.question_ref);
          setProfile(updated);
        }

        const nextCorrect = correctCount + (data.is_correct ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        const nextConsecutiveWrong = data.is_correct ? 0 : consecutiveWrong + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);
        setConsecutiveWrong(nextConsecutiveWrong);

        trackQuestionAnswered({
          subject: "business-studies",
          skill_id: skillId,
          template: question.input_type,
          is_correct: data.is_correct,
          used_hint: false,
          attempt_number: nextAttempts,
          decision: data.is_correct ? "practice" : "reteach",
        });

        const allAnswered = nextAttempts >= targetItemCount(skillId);
        if (allAnswered) {
          const accuracy = nextAttempts > 0 ? nextCorrect / nextAttempts : 0;
          const didMaster = accuracy >= passThreshold(skillId);
          if (profile) {
            const finalProfile = recordBusinessStudiesSkillResult(profile, skillId, {
              correct: nextCorrect,
              attempts: nextAttempts,
              mastered: didMaster,
            });
            setProfile(finalProfile);
          }
          if (didMaster) {
            trackSkillMastered({
              subject: "business-studies",
              skill_id: skillId,
              level: findSkill(skillId)?.level.id ?? 10,
              session_attempt_count: nextAttempts,
              session_correct: nextCorrect,
            });
          }
          trackSessionEnded({
            subject: "business-studies",
            questions_answered: nextAttempts,
            correct: nextCorrect,
            accuracy,
          });
          void persistReport(skillId, nextCorrect, nextAttempts, didMaster);
          setPhase("mastered");
        } else {
          setPhase("feedback");
        }
      } catch (err) {
        console.error("[BusinessStudiesSession] submit-answer failed:", err);
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
      <BusinessStudiesSkillTreeView
        onPickSkill={handlePickTopic}
        profile={profile}
        onBack={onBack}
      />
    );
  }

  // ─── Render: end-of-topic ─────────────────────────────────────────────────
  if (phase === "mastered" && skillId) {
    const skill = findSkill(skillId)?.skill;
    const accuracy = attemptCount > 0 ? correctCount / attemptCount : 0;
    const didMaster = accuracy >= passThreshold(skillId);
    return (
      <div className="relative flex items-center justify-center h-full bg-[#F4F4F5] p-6">
        <EduBackground />
        <div className="relative bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-6xl">{didMaster ? "🎉" : "💪"}</div>
          <h2 className="text-2xl font-bold text-[#1a2744]">
            {didMaster ? "Topic complete" : "Keep going"}
          </h2>
          <p className="text-gray-600 text-base">
            {didMaster ? (
              <>You passed <span className="font-semibold">{skill?.title ?? "this topic"}</span> at {Math.round(accuracy * 100)}%.</>
            ) : (
              <>You finished <span className="font-semibold">{skill?.title ?? "this topic"}</span>. Try it again to pass — you need 60%.</>
            )}
          </p>
          <p className="text-sm text-gray-500">{correctCount} of {attemptCount} correct.</p>
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
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Master this topic
                </span>
                <span className="text-sm font-semibold text-amber-700">
                  Q {Math.min(attemptCount + 1, targetItemCount(skillId))} of {targetItemCount(skillId)} · ⭐ {correctCount}
                </span>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{
                    width: `${Math.round(
                      (Math.min(attemptCount, targetItemCount(skillId)) /
                        targetItemCount(skillId)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-amber-700 mt-1.5">
                Pass mark: {Math.round(passThreshold(skillId) * 100)}% of {targetItemCount(skillId)}
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
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-900">
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
                    <p className="text-sm text-amber-700 mt-3 bg-amber-100 rounded-xl px-3 py-2">
                      💡 {recoveryHint}
                    </p>
                  )}
                </div>
              )}

              {phase === "feedback" && (
                <button
                  onClick={() => skillId && loadNextQuestion(skillId, profile)}
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
const HIS_IMAGE_EXTS = ["png", "svg", "jpg", "jpeg", "webp"];

function DiagramImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= HIS_IMAGE_EXTS.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center text-sm italic text-amber-700">
        Diagram described in the question above.
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/business-studies/${imageKey}.${HIS_IMAGE_EXTS[extIdx]}`}
        alt={alt}
        onError={() => setExtIdx((i) => i + 1)}
        className="max-h-80 rounded-2xl border border-amber-200 bg-white"
      />
    </div>
  );
}

// ─── Answer dispatcher — routes input_type to the right renderer ─────────────

interface AnswerDispatcherProps {
  question: BusinessStudiesGeneratedQuestion;
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
    const wide = options.some((o) => o.length > 40);
    const gridCols = wide ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
    return (
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((opt) => (
          <button
            key={opt}
            disabled={submitting}
            onClick={() => onSubmit(opt)}
            className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-300 rounded-2xl px-5 py-5 text-left text-base sm:text-lg font-semibold text-[#1a2744] active:scale-95 transition-all whitespace-pre-line"
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
